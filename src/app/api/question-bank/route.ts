import { readFile } from "node:fs/promises";
import path from "node:path";
import authored from "@/data/unified-question-bank.json";
import { canReadBookBank, BOOK_BANK_ROOT } from "@/lib/book-bank-server";
export const runtime="nodejs";
export async function GET(request:Request) {
 if(!await canReadBookBank(request)) return Response.json({error:"Cần đăng nhập giáo viên để sử dụng ngân hàng đề."},{status:401});
 try {const questions=JSON.parse(await readFile(path.join(/* turbopackIgnore: true */ BOOK_BANK_ROOT,"unified.json"),"utf8"));return Response.json({questions},{headers:{"Cache-Control":"private, no-store"}});}
 catch {return Response.json({questions:authored,note:"Máy chủ chưa cài dữ liệu trích xuất từ ba sách."},{headers:{"Cache-Control":"private, no-store"}});}
}
