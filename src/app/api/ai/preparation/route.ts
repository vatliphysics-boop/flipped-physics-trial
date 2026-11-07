import { preparationOptions, resolvePreparationChoice, validatePreparationInput } from "@/lib/teacher-preparation";
import { aiErrorResponse, AIUnavailable, readAIJSON, runLocalAI, verifyAIRequest } from "@/lib/local-ai-server";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    verifyAIRequest(request);
    const input = validatePreparationInput(await readAIJSON(request, 2000)), options = preparationOptions(input);
    const format = { type: "object", properties: { questionIds: { type: "array", items: { type: "string", enum: options.questions.map(q => q.id) }, minItems: 2, maxItems: 2 }, supportId: { type: "string", enum: options.supports.map(s => s.id) } }, required: ["questionIds", "supportId"], additionalProperties: false };
    const answer = await runLocalAI([
      { role: "system", content: "Chọn đúng hai mã câu hỏi khác nhau và một mã hỗ trợ từ danh sách để giáo viên tham khảo. Chỉ xuất JSON. Không viết lại câu, dữ kiện hoặc kiến thức. S1 là khung cơ bản, S2 là trao đổi cặp có khung, S3 là mở rộng; chọn dựa vào điều kiện đã nhập, không suy năng lực cá nhân." },
      { role: "user", content: JSON.stringify({ input, options }) },
    ], request.signal, format);
    let reply: string;
    try { reply = resolvePreparationChoice(input, JSON.parse(answer.reply)); }
    catch { throw new AIUnavailable("AI chưa chọn được phương án hợp lệ; dùng nhiệm vụ có sẵn hoặc thử lại."); }
    return Response.json({ reply, model: answer.model, sources: options.questions.map(q => ({ id: q.id, text: q.text })), sourceWarning: false }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return aiErrorResponse(error); }
}
