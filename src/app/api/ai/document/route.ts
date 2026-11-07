import mammoth from "mammoth";
import { createRequire } from "node:module";
import { aiErrorResponse } from "@/lib/local-ai-server";
import { isAITeacher } from "@/lib/ai-teacher-auth";
import { validateDocxArchive } from "@/lib/ai-document";
export const runtime = "nodejs";
const require = createRequire(import.meta.url);
const parsePDF = require("pdf-parse/lib/pdf-parse.js") as (buffer: Buffer, options: { max: number }) => Promise<{ text: string; numpages: number }>;
export async function POST(request: Request) {
  try {
    if (request.headers.get("origin") !== new URL(request.url).origin) throw new Error("Yêu cầu cần được gửi từ trang giáo viên.");
    if (!await isAITeacher()) return Response.json({ error: "Cần đăng nhập tài khoản giáo viên." }, { status: 401 });
    // Bound actual bytes, including multipart overhead, before parsing the upload.
    const reader = request.body?.getReader();
    if (!reader) throw new Error("Chưa chọn tài liệu.");
    const chunks: Uint8Array[] = []; let size = 0;
    for (;;) {
      const chunk = await reader.read(); if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 5300000) { await reader.cancel(); throw new Error("Tệp tối đa 5 MB."); }
      chunks.push(chunk.value);
    }
    const bytes = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
    const form = await new Response(bytes, { headers: { "Content-Type": request.headers.get("content-type") || "" } }).formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size > 5000000) throw new Error("Chọn tệp TXT, DOCX hoặc PDF tối đa 5 MB.");
    const buffer = Buffer.from(await file.arrayBuffer()); let text = "";
    if (/\.txt$/i.test(file.name)) text = buffer.toString("utf8");
    else if (/\.docx$/i.test(file.name)) { validateDocxArchive(buffer); text = (await mammoth.extractRawText({ buffer })).value; }
    else if (/\.pdf$/i.test(file.name)) {
      if (!buffer.subarray(0, 5).equals(Buffer.from("%PDF-"))) throw new Error("Tệp PDF không hợp lệ.");
      const parsed = await parsePDF(buffer, { max: 30 }); text = parsed.text;
      if (parsed.numpages > 30) throw new Error("PDF tối đa 30 trang; hãy chia học liệu thành phần ngắn.");
    } else throw new Error("Chỉ hỗ trợ TXT, DOCX và PDF có lớp văn bản.");
    text = text.replace(/\u0000/g, "").trim();
    if (text.length < 80) throw new Error("Chưa đọc được đủ văn bản. Với PDF quét ảnh, hãy dán nội dung đã nhận dạng chữ.");
    if (text.length > 60000) throw new Error("Tài liệu quá dài. Hãy chọn phần học liệu tối đa 60.000 kí tự.");
    return Response.json({ text }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return aiErrorResponse(error); }
}
