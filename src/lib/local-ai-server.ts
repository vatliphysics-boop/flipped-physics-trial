import "server-only";

const model = process.env.LOCAL_AI_MODEL || "qwen3:4b-instruct-2507-q4_K_M";
function baseURL() {
  const url = new URL(process.env.LOCAL_AI_BASE_URL || "http://127.0.0.1:11434");
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("Cấu hình AI cục bộ không hợp lệ.");
  return url.origin;
}
export async function localAIStatus() {
  try {
    const response = await fetch(`${baseURL()}/api/tags`, { cache: "no-store", signal: AbortSignal.timeout(600) });
    if (!response.ok) return false;
    const data = await response.json();
    const expected = model.includes(":") ? model : `${model}:latest`;
    return Array.isArray(data.models) && data.models.some((item: { name?: string }) => item.name === expected);
  } catch { return false; }
}

const state = globalThis as typeof globalThis & { physicsAIRequests?: { active: number; window: number; count: number } };
export class AIUnavailable extends Error {}
export class AIBusy extends Error {}
export async function runLocalAI(messages: { role: string; content: string }[], signal: AbortSignal, format?: object, maxTokens = 420) {
  const usage = state.physicsAIRequests ??= { active: 0, window: Date.now(), count: 0 };
  if (Date.now() - usage.window > 60000) { usage.window = Date.now(); usage.count = 0; }
  // Small local computers process one request at a time; cap the whole instance.
  if (usage.active >= 1 || usage.count >= 12) throw new AIBusy("AI đang bận. Hãy thử lại sau ít phút.");
  usage.active++; usage.count++;
  try {
    const response = await fetch(`${baseURL()}/api/chat`, {
      method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
      signal: AbortSignal.any([signal, AbortSignal.timeout(120000)]),
      body: JSON.stringify({ model, messages, ...(format ? { format } : {}), stream: false, think: false, keep_alive: "5m", options: { temperature: 0.15, num_ctx: 4096, num_predict: format ? 160 : Math.min(1100, Math.max(160, maxTokens)) } }),
    });
    if (!response.ok) throw new AIUnavailable("Chưa kết nối được mô hình. Giáo viên cần kiểm tra dịch vụ AI cục bộ.");
    const data = await response.json();
    if (typeof data.message?.content !== "string") throw new AIUnavailable("Mô hình chưa tạo được câu trả lời. Hãy hỏi lại ngắn hơn.");
    // Only deliver the final reply; some older templates emit a reasoning marker in content.
    const content = data.message.content;
    const final = (content.includes("</think>") ? content.slice(content.lastIndexOf("</think>") + 8) : content).trim();
    if (!final || final.includes("<think>")) throw new AIUnavailable("Mô hình chưa tạo được câu trả lời hoàn chỉnh. Hãy hỏi lại ngắn hơn.");
    return { reply: final.slice(0, 5000), model, truncated: data.done_reason === "length" };
  } catch (error) {
    if (error instanceof AIUnavailable) throw error;
    throw new AIUnavailable("AI cục bộ chưa sẵn sàng hoặc trả lời quá lâu. Hãy thử lại hoặc hỏi giáo viên.");
  } finally { usage.active--; }
}

export function verifyAIRequest(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) throw new Error("Yêu cầu cần được gửi từ trang học tập.");
  if (Number(request.headers.get("content-length") || 0) > 250000) throw new Error("Nội dung gửi quá lớn.");
}
export async function readAIJSON(request: Request, maximumBytes: number) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Yêu cầu chưa có nội dung.");
  const chunks: Uint8Array[] = []; let length = 0;
  for (;;) {
    const { value, done } = await reader.read(); if (done) break;
    length += value.byteLength;
    if (length > maximumBytes) { await reader.cancel(); throw new Error("Nội dung gửi quá dài."); }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new Error("Nội dung gửi không hợp lệ."); }
}
export function aiErrorResponse(error: unknown) {
  const status = error instanceof AIBusy ? 429 : error instanceof AIUnavailable ? 503 : 400;
  return Response.json({ error: error instanceof Error ? error.message : "Chưa xử lí được yêu cầu." }, { status, headers: { "Cache-Control": "no-store", ...(status === 429 ? { "Retry-After": "60" } : {}) } });
}
