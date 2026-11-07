# Hệ thống giao diện học liệu Vật lí hạt nhân

Chặng thống nhất giao diện ngày 06/11/2026, tiếp nối mục 10 của bàn giao. Giữ nguồn khoa học, mô phỏng, hạt/đường đồ thị, dữ liệu học tập và bộ MP4/VTT đã có.

## Quy tắc dùng chung

- `src/app/design-tokens.css` là nguồn màu, khoảng cách, bo góc và độ rộng. Nền trang `#f3f7fa`, chữ xanh than `#173244`, thao tác chính xanh ngọc `#116b70`. Đỏ chỉ báo lỗi/thao tác nguy hiểm; xanh lá báo thành công; vàng cho cảnh báo. Các màu này không thay bảng màu khoa học trong mô hình.
- Be Vietnam Pro cho giao diện, JetBrains Mono cho mã. Tiêu đề trang làm việc 24–32 px, nội dung 14–16 px. Trang giới thiệu có thể dùng tiêu đề lớn hơn. Công thức giữ bộ chữ KaTeX.
- Nội dung rộng tối đa 1200 px; lề điện thoại 16 px; khoảng cách chủ đạo 8/12/16/24/32 px. Thẻ bo 12 px, nút bo 9 px, hộp thoại bo 16 px. Nút thường cao ít nhất 44 px, nút gọn 40 px.
- Trang khám phá giữ hero và canvas tối. Vùng giải thích, điều khiển, biểu mẫu và soạn bài dùng nền sáng. Không áp quy tắc màu toàn cục vào SVG/canvas, nội dung toán hoặc trình phát video.
- Nút có focus bàn phím rõ; màu chính/phụ/nguy hiểm nhất quán. Menu công khai đóng bằng Escape và trả focus. Menu không gian học tập có focus trap, Escape và trạng thái mục được chọn.

## Thành phần

- `SiteBrand`, `SiteHeader`, `SiteFooter`: cùng nhận diện, liên kết và kiểu tương tác. Footer đầy đủ ở trang công khai, footer gọn trong không gian làm việc; không tạo hai footer trên một trang.
- `PublicShell`: dùng cho mọi trang công khai. Các công cụ từng dùng menu học sinh đã chuyển về cùng shell, có breadcrumb công khai. Không đưa khách tới lớp/nhật kí riêng từ menu chung.
- `PortalShell`: giữ sidebar theo vai trò, thêm mục Bài học cho giáo viên và hiển thị mục hiện tại. `TeacherShell`/`StudentShell` vẫn giữ khác biệt nhiệm vụ.
- `AuthFrame`: thống nhất đăng nhập, đăng ký và trạng thái xác thực, giữ server actions/phân quyền.
- Các bảng lớp, kho học liệu và hàng biểu mẫu có CSS module riêng để xếp dọc khi khung hẹp. Không dùng overflow:hidden của cả trang để che lỗi.
- Trợ lí dùng màu chung, vùng nội dung cuối trang có khoảng trống. Dock ẩn khi có hộp thoại modal; Escape đóng trợ lí. Nhãn không tuyên bố dịch vụ luôn sẵn sàng khi chưa kiểm tra máy chủ AI.

## Build kiểm chứng

Dùng `UI_REVIEW_BUILD=1 npm run build` để xuất `.next-ui`, rồi `UI_REVIEW_BUILD=1 npm run start -- -H 127.0.0.1 -p 3477` nếu cổng trống. Cấu hình thông thường vẫn dùng `.next`. Điều này giữ bản đối chiếu cổng 3476 và server dev cổng 3000 độc lập. Mã build và kết quả từng lượt được ghi trong `tmp/ui-audit/`.

Danh mục và trạng thái kiểm tra các màn hình được cập nhật trong `UI_SCREEN_AUDIT.md` sau lượt chạy production của giao diện mới. Đây là kiểm chứng kỹ thuật cục bộ, không phải dữ liệu thực nghiệm sư phạm. Giọng đọc vẫn chưa được nghe trực tiếp bằng tai.
