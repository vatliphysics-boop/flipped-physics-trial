import { canReadBookBank, readBookBank } from "@/lib/book-bank-server";
export const runtime = "nodejs";
export async function GET(request: Request) {
  if (!await canReadBookBank(request)) return Response.json({ error: "Cần đăng nhập giáo viên để đọc ngân hàng từ sách." }, { status: 401 });
  try {
    const index = await readBookBank();
    return Response.json({ ...index, books: index.books.map(({ id, title, pageCount, sha256 }) => ({ id, title, pageCount, sha256 })) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return Response.json({ error: "Chưa cài bộ dữ liệu sách trên máy chủ." }, { status: 503 }); }
}
