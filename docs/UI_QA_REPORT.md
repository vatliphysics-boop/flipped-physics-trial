# UI QA report

Ngày kiểm tra: 23/09/2026

## Kiểm tra tự động đã chạy

| Hạng mục | Lệnh | Kết quả |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | PASS |
| ESLint | `npm run lint` | PASS |
| Production build | `npm run build` | PASS; Next.js 16.3.5 liệt kê 31 route |
| Sai khoảng trắng diff | `git diff --check` | PASS |
| Route menu portal | kiểm tra file `src/app/**/page.tsx` | PASS cho toàn bộ 10 URL menu |
| Route pha chuẩn | kiểm tra file route | PASS cho teacher/student: before-class, simulation, assessment |
| CSS token | so khớp `var(--*)` và khai báo `--*:` | PASS sau khi bổ sung token nền tảng |

## Ma trận route đã kiểm tra từ source/build

| Vai trò | URL | Trạng thái |
|---|---|---|
| Teacher | `/teacher`, `/teacher/classes`, `/teacher/curriculum`, `/teacher/materials`, `/teacher/students` | Có trang đích |
| Student | `/student`, `/student/classes`, `/student/curriculum`, `/student/assignments`, `/student/journal` | Có trang đích |
| Teacher lesson | `/teacher/lessons/[lessonId]`, `/before-class`, `/simulation`, `/assessment` | Có route chuẩn |
| Student lesson | `/student/lessons/[lessonId]`, `/before-class`, `/simulation`, `/assessment` | Có route chuẩn |
| Tương thích teacher | `/in-class`, `/after-class` | Redirect lần lượt sang `/simulation`, `/assessment` |

## Giới hạn chưa kiểm chứng

- Không có browser automation/screenshot trong phiên nên chưa quan sát trực tiếp tại 360, 390, 768, 1024, 1440px hoặc zoom 200%.
- Không có tài khoản Supabase staging nên chưa thực hiện upload/publish video, tạo signed URL, RLS khác lớp, lưu tiến độ và nộp bài end-to-end.
- Pha 3 học sinh chỉ hiển thị đề đã xuất bản; không có nút nộp giả vì chưa xác minh luồng lưu bài nộp chuyên biệt trong dữ liệu hiện có.
- Bốn trang legacy còn import `AppSidebar`: student overview/curriculum/chapter curriculum và teacher class curriculum. Chúng chưa được xem là đã thống nhất PortalShell; cần xử lý trong lượt tiếp theo có browser QA.

## Không phát hiện qua static checks

- Không có URL pha legacy còn được link trực tiếp trong `src`.
- Không có menu portal trỏ tới route thiếu.
- Không dùng `!important`, `ts-ignore`, reset database hoặc thay đổi RLS trong lượt sửa này.
