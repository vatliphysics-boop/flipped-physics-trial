# Rà soát giao diện học sinh và xác thực

Baseline: production cục bộ cổng 3476, 2026-11-06. Chrome hệ thống; 1366 × 950 và 390 × 950. Tài khoản học sinh QA có sẵn; không tạo lớp, không nộp bài và không đổi tiến độ.

## Danh sách màn hình

| ID | Route | 1366 px | 390 px |
| --- | --- | --- | --- |
| student-overview | `/student` | HTTP 200 · không tràn ngang | HTTP 200 · không tràn ngang |
| student-classes | `/student/classes` | HTTP 200 · không tràn ngang | HTTP 200 · tràn ngang |
| student-curriculum | `/student/curriculum` | HTTP 200 · không tràn ngang | HTTP 200 · không tràn ngang |
| student-chapter | `/student/curriculum/IV` | HTTP 200 · không tràn ngang | HTTP 200 · không tràn ngang |
| student-before | `/student/lessons/2455fc0f-dfa2-4e56-9924-b887564a1a93/before-class` | HTTP 200 · không tràn ngang | HTTP 200 · không tràn ngang |
| student-during | `/student/lessons/2455fc0f-dfa2-4e56-9924-b887564a1a93/in-class` | HTTP 200 · không tràn ngang | HTTP 200 · không tràn ngang |
| student-after | `/student/lessons/2455fc0f-dfa2-4e56-9924-b887564a1a93/after-class` | HTTP 200 · không tràn ngang | HTTP 200 · không tràn ngang |
| student-assessment | `/student/assignments` | HTTP 200 · không tràn ngang | HTTP 200 · không tràn ngang |
| student-journal | `/student/journal` | HTTP 200 · không tràn ngang | HTTP 200 · không tràn ngang |
| student-ai | `/student/ai?bai=B23` | HTTP 200 · không tràn ngang | HTTP 200 · không tràn ngang |
| student-materials | `/student/materials` | HTTP 200 · không tràn ngang | HTTP 200 · không tràn ngang |
| auth-login | `/login` | HTTP 200 · không tràn ngang | HTTP 200 · không tràn ngang |
| auth-register | `/register` | HTTP 200 · không tràn ngang | HTTP 200 · không tràn ngang |
| auth-verified | `/auth/verified?status=success` | HTTP 200 · không tràn ngang | HTTP 200 · không tràn ngang |
| auth-expired | `/auth/verified?status=error&message=Li%C3%AAn%20k%E1%BA%BFt%20%C4%91%C3%A3%20h%E1%BA%BFt%20h%E1%BA%A1n.` | HTTP 200 · không tràn ngang | HTTP 200 · không tràn ngang |

Cả 30 ca mở được tiêu đề trang; không có lỗi JavaScript pageerror. Báo cáo chi tiết `inventory.json`; ảnh trước ở `docs/previews/ui-consistency/before/`.

## Lỗi và sửa tương ứng

- Trang lớp học tại 390 px: thẻ tham gia lớp giữ hàng ngang, input co còn khoảng 30 px, nút vượt mép. Đổi thẻ sang một cột ở màn hình hẹp; form có nhãn rõ và tự xếp dọc ở 320 px.
- Thẻ lớp hiển thị tiến độ 0% cố định và tên giáo viên trống. Thay bằng mã lớp và ngày tham gia lấy từ joined_at đang có; không suy ra tiến độ khi chưa có dữ liệu.
- Tiêu đề bài và ba tab dùng nhiều inline style, chữ hoa và khoảng cách cứng; trên điện thoại tên pha bị chia thành nhiều dòng. Chuyển sang ba thẻ trạng thái gọn, có aria-current và trạng thái khóa rõ.
- Đăng nhập, đăng ký và kết quả xác thực dùng bố cục/nhận diện khác nhau. Dùng chung AuthFrame và SiteBrand; bố cục, vùng nhập, viền và màu hành động theo hệ giao diện mới.
- Tổng quan luôn báo chưa có nhiệm vụ dù query đã lấy được bài công bố. Hiện danh sách tối đa ba bài đã giao từ chính kết quả query, giữ nguyên kiểm tra quyền và truy vấn hiện có.

## Trạng thái

Đã sửa mã và đạt ESLint phạm vi. Chưa xác minh giao diện mới trên production: đợi lượt build UI phối hợp với agent chính. Typecheck toàn workspace phát hiện next.config.ts:37 (string so với string[]), đã báo agent chính sở hữu tệp; không có lỗi ở phạm vi sửa học sinh/xác thực.

## Kiểm tra UI R2 · production cục bộ 3477

Build ID `ssNn6nqeiy1UBKL-Ml9VK`. Đã mở lại 15 màn hình ở 320, 390, 768 và 1366 px: 60/60 nhận HTTP 200, không tràn ngang, không có pageerror. Mỗi ca có ảnh trong `docs/previews/ui-consistency/after/`; báo cáo `after-inventory.json`.

Form tham gia lớp không còn co hẹp hoặc vượt mép. Thẻ ba pha có nhãn/trạng thái rõ; các trang xác thực dùng chung nhận diện. Lượt rà soát phát hiện nút AI dùng chung bị ngắt nhãn thành nhiều dòng trong khung 56 px; đã báo agent chính sở hữu thành phần để sửa R3. Không sửa mã sau khi build R2.

Kiểm tra DOM sau hydration cho trang xác thực xác nhận logo, tiêu đề và khối trạng thái trong vùng hiển thị; chờ font hoàn tất không ghi nhận consoleerror. Kiểm tra tương tác và hash tiến độ đang chờ R3 theo điều phối, chưa ghi nhận là đạt.

## Tương tác chỉ đọc R3

Build `_qCMTm54W73ozUdyJZK9u`, cổng 3477. Đã đăng nhập thực bằng tài khoản QA, theo tham số next vào trang lớp; bật/tắt mật khẩu; kiểm tra trường mã lớp và metadata thật; bấm liên kết ba pha rồi tải lại bằng chứng đã lưu; mở menu di động, thoát bằng Escape và xác nhận trả focus; điều hướng các khu vực học sinh; đổi vai trò đăng ký và kiểm tra trường bắt buộc mà không gửi đăng ký; mở trạng thái xác thực hết hạn và liên kết khôi phục.

Tất cả 11 mục kiểm tra đạt. Sau đăng nhập có 0 yêu cầu POST/PUT/PATCH/DELETE từ trang học sinh. Số lượng và SHA-256 giữ nguyên cho ba hàng student_phase_progress, ba hàng student_step_progress và một lesson_reflection của B23 QA. Chi tiết `interactions.json`, `interactions.log`, `progress-before.json`, `progress-after.json`.

Lượt tương tác phát hiện thêm trang chương có hai H1. Đã bỏ phần tiêu đề/breadcrumb thừa trong trang chương, đưa số bài vào mô tả của StudentShell và bỏ khoảng trống cứng; không đổi truy vấn hoặc quyền. ESLint đạt. Chờ build R4 để chụp lại 60 ảnh cuối và kiểm tra số H1 ở từng ca.

Chưa tạo tài khoản mới hoặc kiểm tra gửi/nhận email xác thực trong chặng giao diện. Trạng thái xác thực công khai được kiểm tra bằng tham số hiển thị; đăng nhập QA dùng tài khoản có sẵn. Chưa kiểm tra điện thoại vật lí.
