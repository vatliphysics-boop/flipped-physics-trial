# Hướng dẫn chạy sau khi sửa

## 1. Mở dự án

Mở Terminal và đi tới thư mục dự án:

```bash
cd /Users/vodoandangkhoi/Documents/flipped-physics
```

## 2. Cài dependency

Dự án dùng npm lockfile. Cài đúng phiên bản đã khóa:

```bash
npm ci
```

Nếu đang phát triển và cần thêm package theo thay đổi đã được duyệt, dùng `npm install`; không xóa lockfile.

## 3. Cấu hình môi trường

Sao chép `.env.example` thành `.env.local` nếu chưa có. Điền các **tên biến** Supabase được dự án yêu cầu (URL Supabase và anonymous key công khai). Không đưa khóa thật, service-role key, cookie hoặc token vào Git, tài liệu hay ảnh chụp.

## 4. Chạy local

```bash
npm run dev
```

Mở địa chỉ do Next.js in trong Terminal (thường là `http://localhost:3000`).

Kiểm tra production trước khi bàn giao:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## 5. Điều hướng sau sửa

- Giáo viên: vào `/teacher`, chọn **Lớp học** hoặc **Chương trình Vật lí 12**; mở một bài để tới tổng quan và ba pha: **Chuẩn bị trước giờ học**, **Mô phỏng và khám phá**, **Bài tập cuối bài**.
- Học sinh: vào `/student`, chọn lớp/chương/bài; mỗi bài có URL riêng cho ba pha tương tự.
- URL teacher cũ `/in-class` và `/after-class` tự chuyển tới `/simulation` và `/assessment`.

## 6. Video và bài tập

- Giáo viên mở Pha 1 của bài, thêm video, lưu bản nháp rồi xuất bản bằng các thao tác có sẵn.
- Học sinh chỉ thấy video đã xuất bản và thuộc lớp của mình.
- Giáo viên soạn/xuất bản yêu cầu ở Pha 3. Pha 3 học sinh hiện hiển thị đề đã xuất bản; hãy kiểm thử luồng nộp bài bằng tài khoản staging trước khi hứa hẹn khả năng nộp.

## 7. Migration

Không tự chạy migration lên database đang dùng nếu chưa sao lưu. Các migration trong `supabase/migrations/` phải chạy theo thứ tự tên file, trên staging trước, bằng quy trình Supabase của dự án. Mục đích migration 20260921/20260923 là lưu evidence/progress video và tăng bảo vệ video private. Không reset database hoặc xóa bucket.

## 8. Lưu phiên bản và quay lại an toàn

Trước lần sửa tiếp theo:

```bash
git status
git add <cac-tep-da-kiem-tra>
git commit -m "repair: stabilize lesson routes and portal navigation"
```

Tạo nhánh mới trước thay đổi lớn. Để quay lại một commit đã biết tốt, dùng `git log --oneline` để chọn commit rồi tạo nhánh/checkout theo quy trình nhóm; không dùng `git reset --hard` khi working tree còn thay đổi chưa commit. Sao lưu database và Storage qua công cụ Supabase trước migration hoặc thay đổi quyền.
