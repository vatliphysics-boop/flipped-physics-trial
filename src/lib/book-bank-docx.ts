import { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType } from "docx";
import { officeEquation } from "./office-equation";
import { bookAsset, BOOK_KIND_LABELS, type BookQuestion, type BookQuestionReview, type BookEquation } from "./book-bank";
const p = (text: string, bold = false) => new Paragraph({ children: [new TextRun({ text, bold })], spacing: { after: 120 } });
function doc(children: Paragraph[]) { return new Document({ styles: { default: { document: { run: { font: "Times New Roman", size: 24, color: "000000" } } } }, sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } }, children }] }); }
async function imageParts(image: {file: string; width: number; height: number}) {
  const response = await fetch(bookAsset(image.file)); if (!response.ok) throw new Error("Không tải được ảnh đề; đã dừng để tránh xuất thiếu dữ kiện.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  // Split tall source crops into legible consecutive strips rather than shrinking all text to one tiny picture.
  const bitmap = await createImageBitmap(new Blob([bytes])); const parts: Paragraph[] = [];
  const displayWidth = 455, maxPixels = Math.floor(bitmap.width * 550 / displayWidth);
  for (let top = 0; top < bitmap.height; top += maxPixels) {
    const height = Math.min(maxPixels, bitmap.height - top), canvas = document.createElement("canvas");canvas.width = bitmap.width;canvas.height = height;
    const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Không xử lý được ảnh đề."); ctx.drawImage(bitmap, 0, top, bitmap.width, height, 0, 0, bitmap.width, height);
    const png = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("Không tạo được ảnh Word.")), "image/png"));
    parts.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: "png", data: new Uint8Array(await png.arrayBuffer()), transformation: { width: displayWidth, height: Math.round(height * displayWidth / bitmap.width) } })] }));
  }
  bitmap.close(); return parts;
}
export async function bookQuestionsDocx(questions: BookQuestion[], reviews: Record<string, BookQuestionReview>, titles: Record<string,string>) {
  if (!questions.length || questions.length > 50) throw new Error("Chọn từ 1 đến 50 câu mỗi lần xuất.");
  const children: Paragraph[] = [new Paragraph({ heading: "Title", children: [new TextRun({ text: "Bài tập Vật lí 12 từ sách", bold: true, color: "000000" })] }), p("Ảnh đề giữ dữ kiện nguồn. Công thức Equation và phân loại do giáo viên kiểm tra trước khi giao học sinh.")];
  for (const [n, q] of questions.entries()) {
    const review = reviews[q.id]; if (!review?.reviewed) throw new Error(`Cần kiểm tra câu ${q.label} trước khi xuất.`);
    children.push(p(`Câu ${n + 1}   ${BOOK_KIND_LABELS[review.kind]}   ${q.label}`, true), p(`${titles[q.book]}   Trang PDF ${q.pages.join(", ")}`));
    for (const im of q.images) children.push(...await imageParts(im));
    if (review.text.trim()) children.push(p("Bản chữ đã biên soạn", true), ...review.text.split("\n").map(line => p(line)));
    if (review.equations.length) children.push(p("Công thức có thể chỉnh sửa", true), ...review.equations.map(e => new Paragraph({ children: [officeEquation(e)], spacing: { after: 120 } })));
    children.push(p("............................................................................................."));
  }
  return Packer.toBlob(doc(children));
}
export async function equationsDocx(equations: { source: BookEquation; latex: string }[], titles: Record<string,string>) {
  const children: Paragraph[] = [new Paragraph({ heading: "Title", children: [new TextRun({ text: "Công thức Vật lí 12 có thể chỉnh sửa", bold: true, color: "000000" })] })];
  for (const e of equations) { children.push(p(`${titles[e.source.book]}   Trang PDF ${e.source.page}`, true), ...await imageParts(e.source.image), new Paragraph({ children: [officeEquation(e.latex)], spacing: { after: 180 } })); }
  return Packer.toBlob(doc(children));
}
