import "server-only";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { isAITeacher } from "./ai-teacher-auth";
import { DEFAULT_BOOK_BANK_DIR, indexedBookAssetFiles, TRACED_BOOK_BANK_DIR, type BookBankIndex } from "./book-bank";
// The default dataset is traced per route in next.config.ts. A runtime override
// can point outside the project and is provisioned separately by the operator.
const defaultDirectory = process.env.NODE_ENV === "production"
  && existsSync(/* turbopackIgnore: true */ TRACED_BOOK_BANK_DIR)
  ? TRACED_BOOK_BANK_DIR
  : DEFAULT_BOOK_BANK_DIR;
export const BOOK_BANK_ROOT = path.resolve(/* turbopackIgnore: true */ process.env.BOOK_BANK_DIR || defaultDirectory);
export async function canReadBookBank(request: Request) {
  const host = new URL(request.url).hostname;
  if (process.env.NODE_ENV === "development" && ["localhost", "127.0.0.1", "[::1]"].includes(host)) return true;
  return isAITeacher();
}
export async function readBookBank(): Promise<BookBankIndex> {
  return JSON.parse(await readFile(path.join(/* turbopackIgnore: true */ BOOK_BANK_ROOT, "index.json"), "utf8"));
}
export function bookAssetPath(file: string, index: BookBankIndex) {
  // Only indexed image assets are readable. Never expose OCR files, PDF paths or arbitrary local files.
  if (path.isAbsolute(file) || !indexedBookAssetFiles(index).has(file)) return null;
  const resolved = path.resolve(/* turbopackIgnore: true */ BOOK_BANK_ROOT, file);
  return resolved.startsWith(BOOK_BANK_ROOT + path.sep) ? resolved : null;
}
