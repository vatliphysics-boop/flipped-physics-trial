export type BookQuestionKind = "choice" | "true_false" | "numeric" | "written";
export const BOOK_KIND_LABELS: Record<BookQuestionKind, string> = { choice: "Trắc nghiệm", true_false: "Đúng sai", numeric: "Trả lời ngắn", written: "Tự luận" };
export type BookImage = { file: string; width: number; height: number; page: number; rect?: number[] };
export type BookQuestion = { id: string; book: string; label: string; topic: string; kind: BookQuestionKind; classificationReason: string; text: string; images: BookImage[]; pages: number[]; status: string; segmentationReason: string };
export type BookEquation = { id: string; book: string; page: number; ocr: string; image: BookImage; status: string; officeMath: string | null };
export type BookFigure = { id: string; book: string; page: number; label: string; image: BookImage; status: string; colorStatus: string; colorImage?: BookImage };
export type BookPage = { book: string; page: number; file: string; width: number; height: number; text: string; role: string };
export type BookBankIndex = { books: { id: string; title: string; pageCount: number; sha256: string }[]; questions: BookQuestion[]; equations: BookEquation[]; figures: BookFigure[]; pages: BookPage[]; coverage: { sourcePages: number; ocrPages: number; embeddedImages: number; questionsReviewed: number }; counts: Partial<Record<BookQuestionKind, number>> };
export type BookQuestionReview = { kind: BookQuestionKind; text: string; equations: string[]; reviewed: boolean };
export function bookAsset(file: string) { return `/api/book-bank/asset?file=${encodeURIComponent(file)}`; }

export const DEFAULT_BOOK_BANK_DIR = "data/book-bank";
export const TRACED_BOOK_BANK_DIR = `${DEFAULT_BOOK_BANK_DIR}/.next-runtime`;

export function indexedBookAssetFiles(index: BookBankIndex): Set<string> {
  return new Set([
    ...index.pages.map(page => page.file),
    ...index.questions.flatMap(question => question.images.map(image => image.file)),
    ...index.figures.flatMap(figure => [figure.image.file, ...(figure.colorImage ? [figure.colorImage.file] : [])]),
    ...index.equations.map(equation => equation.image.file),
  ].filter(file => !file.includes("..") && !file.startsWith("/") && !file.includes("\\")));
}
