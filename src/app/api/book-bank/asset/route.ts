import { readFile } from "node:fs/promises";
import { canReadBookBank, readBookBank, bookAssetPath } from "@/lib/book-bank-server";
export const runtime = "nodejs";
export async function GET(request: Request) {
  if (!await canReadBookBank(request)) return new Response("Cần đăng nhập giáo viên.", { status: 401 });
  try {
    const index = await readBookBank(), file = new URL(request.url).searchParams.get("file") ?? "";
    const filename = bookAssetPath(file, index);
    if (!filename) return new Response("Không tìm thấy hình.", { status: 404 });
    return new Response(await readFile(/* turbopackIgnore: true */ filename), { headers: { "Content-Type": /\.png$/i.test(filename) ? "image/png" : "image/jpeg", "Cache-Control": "private, max-age=3600", "X-Content-Type-Options": "nosniff" } });
  } catch { return new Response("Chưa có dữ liệu hình.", { status: 503 }); }
}
