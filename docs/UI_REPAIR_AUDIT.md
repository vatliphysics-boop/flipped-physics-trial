# UI repair audit

Ngày khảo sát: 23/09/2026.

## Phạm vi và giới hạn

- Working tree đã có nhiều thay đổi chưa commit. Không reset, clean, checkout hoặc thay thế hàng loạt tệp của người dùng.
- Trang tham khảo `https://taphuan.csdl.edu.vn/user/login` chỉ trả HTML rỗng qua môi trường khảo sát hiện tại. Chưa xác nhận được giao diện đăng nhập hoặc các trang sau đăng nhập.
- Chưa có tài khoản thử/browser harness/Supabase staging nên các ca RLS, upload thật, signed URL và submit thật ghi là **Chưa kiểm chứng**.

## Lỗi đã xác minh

| Nhóm | Trang/component | Biểu hiện | Nguyên nhân xác minh | Phạm vi ảnh hưởng | Cách sửa | Kiểm tra |
|---|---|---|---|---|---|---|
| C | `LessonNavigation`, route lesson | Link `/simulation` và `/assessment` chưa có route | URL builder đổi segment nhưng route tree chỉ có `in-class`/`after-class` | Giáo viên và học sinh mở pha 2/3 bị 404 | Tạo route chuẩn, giữ phase DB | Scan route, build |
| C | `PortalShell` | Menu chứa URL chưa có route | Navigation khai báo trước route | Menu portal có thể dẫn 404 | Bổ sung trang thật hoặc đổi tới route thật | Ma trận URL, build |
| D | `AppSidebar` và `PortalShell` | Hai hệ layout cùng tồn tại | Curriculum legacy còn import `AppSidebar` | Header/sidebar/mobile không thống nhất | Chuyển dần sang `StudentShell`/`TeacherShell` | Search import |
| C | Student legacy pages | Menu còn dùng anchor | Navigation cũ chưa chuyển route | Back/forward/tải trực tiếp không có page riêng | Chuyển menu portal sang URL thật | Search anchor |
| A/B | `globals.css` | CSS nén, token/selector legacy và mới cùng file | Refactor chưa hoàn tất | Rủi ro ghi đè, tràn tại breakpoint | Khai báo token rõ, sửa layout tại nguồn | CSS audit, QA |
| A | `PortalShell` mobile | Desktop/mobile toggle dùng chung ref | Cùng `trigger` ref | Focus drawer có thể quay sai nút | Tách ref | QA keyboard |
| F/H | Video/assignment | Phụ thuộc Supabase thật | Không có staging credential | Không thể chứng minh upload/RLS end-to-end | Giữ RLS/action, chỉ sửa UI/route | Chưa kiểm chứng |

## Lỗi chưa đủ bằng chứng

- Chưa thể kết luận không còn chồng chữ ở mọi viewport vì không có browser automation/screenshot.
- Chưa thay schema/database; dữ liệu, quyền và storage được bảo toàn.

## Thứ tự sửa

1. Route chuẩn và redirect tương thích.
2. Chuyển các trang còn dùng `AppSidebar` sang shell chung.
3. Chuẩn hóa token/layout CSS.
4. Chạy TypeScript, ESLint, production build và lập báo cáo QA.
