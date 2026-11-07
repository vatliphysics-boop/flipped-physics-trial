import { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, AlignmentType, Footer, PageNumber, PageBreak, HeadingLevel, BorderStyle } from "docx";
import type { BankQuestion, ExamVersion } from "./teacher-assessment";
import { examMatrix } from "./teacher-assessment";
import type { PlanActivity } from "./teaching-plan";
export type ExportImage = { data: Uint8Array; type: "png" | "jpg"; width: number; height: number; description: string };
const run = (text: string, bold = false) => new TextRun({ text, bold });
const p = (text: string, options: { bold?: boolean; keepNext?: boolean; center?: boolean; heading?: boolean } = {}) => new Paragraph({ children: [run(text, options.bold)], keepNext: options.keepNext, alignment: options.center ? AlignmentType.CENTER : AlignmentType.LEFT, heading: options.heading ? HeadingLevel.HEADING_1 : undefined, spacing: { after: 100, line: 276 } });
const title = (text: string) => new Paragraph({ style: "Title", alignment: AlignmentType.CENTER, children: [run(text, true)], spacing: { after: 160 }, keepNext: true });
function base(children: (Paragraph | Table)[]) {
  return new Document({ creator: "Kho học liệu Vật lí hạt nhân", styles: { default: { document: { run: { font: "Times New Roman", size: 24, color: "000000" }, paragraph: { spacing: { after: 100 } } } }, paragraphStyles: [{ id: "Title", name: "Title", basedOn: "Normal", run: { bold: true, size: 28, color: "000000" } }, { id: "Heading1", name: "heading 1", basedOn: "Normal", run: { bold: true, size: 25, color: "000000" } }] }, sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } }, footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [run("Trang "), new TextRun({ children: [PageNumber.CURRENT] })] })] }) }, children }] });
}
function imageParagraph(q: BankQuestion, images: Map<string, ExportImage>) {
  if (!q.imageId) return [];
  const img = images.get(q.imageId);
  if (!img) throw new Error(`Chưa có hình của câu ${q.id}; không xuất đề thiếu hình.`);
  const width = Math.min(455, img.width), height = Math.round(width * img.height / img.width);
  if (!Number.isFinite(height) || height > 420 || height < 20) throw new Error("Hình quá cao hoặc sai kích thước; chia hình trước khi xuất.");
  return [new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, children: [new ImageRun({ type: img.type, data: img.data, transformation: { width, height }, altText: { title: "Hình câu hỏi", description: img.description, name: q.imageId } })] })];
}
function question(q: BankQuestion, index: number, images: Map<string, ExportImage>, worksheet = false) {
  const parts: Paragraph[] = [p(`Câu ${index + 1}. ${worksheet ? "" : `(${q.points.toLocaleString("vi")} điểm) `}${q.prompt}`, { bold: true, keepNext: true }), ...imageParagraph(q, images)];
  if (q.kind === "choice") q.options!.forEach((o, i) => parts.push(p(`${"ABCD"[i]}. ${o}`, { keepNext: i < 3 })));
  if (q.kind === "true_false") q.statements!.forEach((s, i) => parts.push(p(`${"abcdef"[i]}) ${s.text}   □ Đúng   □ Sai`, { keepNext: i < q.statements!.length - 1 })));
  if (q.kind === "numeric") parts.push(p(`Đáp số (${q.unit ?? ""}): ...........................................................`));
  if (q.kind === "written" || worksheet) parts.push(p("........................................................................................................"), p("........................................................................................................"));
  return parts;
}
function matrix(questions: BankQuestion[]) {
  const cell = (s: string, header = false) => new TableCell({ children: [p(s, { bold: header })], shading: header ? { fill: "E8EFF5" } : undefined, margins: { top: 90, bottom: 90, left: 90, right: 90 } });
  const border = { style: BorderStyle.SINGLE, size: 4, color: "D9D9D9" };
  return new Table({ borders: { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border }, width: { size: 100, type: WidthType.PERCENTAGE }, rows: [new TableRow({ tableHeader: true, children: ["Bài", "Mức độ", "Số câu", "Điểm", "Câu có hình"].map(s => cell(s, true)) }), ...examMatrix(questions).map(r => new TableRow({ children: [r.topic, r.level, String(r.count), r.points.toLocaleString("vi"), String(r.images)].map(s => cell(s)) }))] });
}
export async function assessmentDocx(titleText: string, minutes: number, versions: ExamVersion[], images: Map<string, ExportImage>, answers = false) {
  const children: (Paragraph | Table)[] = [];
  versions.forEach((v, vi) => {
    if (vi) children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(title(`${answers ? "ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM" : titleText}`), p(`Vật lí 12 · Phạm vi ${[...new Set(v.questions.map(q => q.topic))].sort().join(", ")} · Mã đề ${v.code}`, { center: true }), p(`Thời gian ${minutes} phút · ${v.questions.length} câu · Tổng ${v.questions.reduce((n, q) => n + q.points, 0).toLocaleString("vi")} điểm`, { center: true }));
    if (answers) {
      children.push(p("Ma trận nội dung thực tế của mã đề", { heading: true }), matrix(v.questions));
      v.questions.forEach((q, i) => {
        const key = q.kind === "choice" ? "ABCD"[q.answer!] : q.kind === "numeric" ? `${q.answer} ${q.unit ?? ""}` : q.kind === "true_false" ? q.statements!.map((s, si) => `${"abcdef"[si]}: ${s.answer ? "Đúng" : "Sai"}`).join("; ") : "Chấm theo rubric";
        children.push(p(`Câu ${i + 1} · ${q.points.toLocaleString("vi")} điểm · ${q.id} · ${key}`, { bold: true, keepNext: true }));
        if (q.explanation) children.push(p(q.explanation));
        q.statements?.forEach((s, si) => children.push(p(`${"abcdef"[si]}) ${s.explanation}`)));
        q.rubric?.forEach(r => children.push(p(`${r.text} (${Number(r.points.toFixed(3)).toLocaleString("vi")} điểm)`)));
      });
      children.push(p("Giáo viên rà soát kiến thức, hình và điểm trước khi sử dụng. Ma trận mô tả tập câu đã chọn; chưa xác lập độ khó hoặc giá trị đo lường của đề."));
    } else {
      children.push(p("Họ và tên: ........................................................... Lớp: ................"), p("Dữ kiện và hình là mô hình phục vụ câu hỏi. Đề giữa kỳ/cuối kỳ chỉ bao phủ chủ đề hạt nhân đã chọn; giáo viên điều chỉnh theo kế hoạch của lớp."));
      v.questions.forEach((q, i) => children.push(...question(q, i, images)));
    }
  });
  return Packer.toBlob(base(children));
}
export async function worksheetDocx(lesson: string, activity: PlanActivity, questions: BankQuestion[], images: Map<string, ExportImage>, teacher = false) {
  const children: (Paragraph | Table)[] = [title(`${teacher ? "HƯỚNG DẪN GIÁO VIÊN" : "PHIẾU HỌC TẬP BA PHA"} ${lesson}`), p(activity.title, { center: true }), p(`Mục tiêu: ${activity.objective}`)];
  if (!teacher) children.push(p("Họ và tên: .................................... Lớp/nhóm: ........................"));
  const phases = [
    { name: "Trước giờ học", instruction: "Đọc học liệu được giao, ghi dự đoán và một câu hỏi chưa hiểu. Trả lời trước khi xem mô phỏng.", product: "Dự đoán ban đầu và câu hỏi mang đến lớp." },
    { name: "Trong giờ học", instruction: `${activity.instructions} ${activity.studentActions}`, product: activity.product },
    { name: "Sau giờ học", instruction: "Làm câu vận dụng, đối chiếu với dự đoán. Viết một điều đã sửa và việc sẽ làm tiếp để kiểm tra cách hiểu.", product: "Lời giải có giải thích, bản sửa lỗi và bước học tiếp." },
  ];
  phases.forEach((phase, pi) => {
    children.push(p(`${pi + 1}. ${phase.name}`, { heading: true, keepNext: true }), p(phase.instruction), p(`Sản phẩm: ${phase.product}`));
    questions.filter((_, i) => i % 3 === pi).forEach(q => children.push(...question(q, questions.indexOf(q), images, true)));
    if (!teacher) children.push(p("Ghi dự đoán / quan sát / điều cần sửa:"), p("........................................................................................................"), p("........................................................................................................"));
  });
  if (teacher) {
    children.push(p("Việc của giáo viên và lưu ý kiến thức", { heading: true }), p(activity.teacherActions ?? ""), p(activity.support), p(`Tiêu chí: ${activity.evaluation}`));
    questions.forEach((q, i) => children.push(p(`Câu ${i + 1}: ${q.kind === "choice" ? "ABCD"[q.answer!] : q.answer ?? "Theo rubric"}. ${q.explanation ?? ""}`)));
  } else children.push(p("Tự kiểm tra: □ Có dự đoán  □ Có bằng chứng  □ Đã giải thích  □ Ghi điều tự sửa"));
  return Packer.toBlob(base(children));
}
