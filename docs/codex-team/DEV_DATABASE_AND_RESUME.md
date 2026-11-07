# Thiết lập môi trường thử và tiếp tục từ checkpoint

Trạng thái CHƯA ĐẠT. Người dùng đã xác nhận chưa rõ Supabase hiện tại là môi trường thử và chọn giữ checkpoint/hướng dẫn thiết lập. Không dùng kết nối `.env.local` để tạo tài khoản, ghi dữ liệu hoặc chạy migration trong phiên này. Chỉ thực hiện chẩn đoán đọc có `limit=0`; thất bại DNS `ENOTFOUND`, không xác nhận được schema hay RLS hiện hành. Đây không phải bằng chứng bảng bị thiếu hoặc dữ liệu mất.

Đối chiếu URL người dùng cung cấp ngày 05/10/2026 đã khớp .env.local. Project hiện dùng NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY và đã có publishable key; không cần đổi tên biến sang ANON_KEY hoặc gửi key trong chat. DNS vẫn ENOTFOUND. Chi tiết chỉ lưu metadata trong supabase-user-project-confirmation.json, không có giá trị credentials. Việc xác nhận URL chưa xác nhận đây là môi trường thử riêng.

## Người vận hành cần chuẩn bị

Tạo/xác định một dự án Supabase phát triển riêng với dữ liệu giả, không nối dữ liệu trường thật. Có thể dùng môi trường cục bộ khi máy có công cụ phù hợp; hiện Supabase CLI/Docker không có trên PATH. Nếu dùng dự án từ xa, cần người quản trị xác nhận rõ project thử và quyền truy cập. Không đưa khóa máy chủ vào biến NEXT_PUBLIC hoặc báo cáo/chat.

Sao lưu cấu hình hiện tại ở nơi riêng không thuộc Git, đổi cấu hình phát triển bằng thông tin của dự án thử; ghi booleans/nhãn môi trường vào báo cáo, không giá trị khóa. Đối chiếu và áp dụng các migration trong `supabase/migrations/` theo thứ tự trên dự án thử. Không reset database, không reset migration, không áp dụng lên dự án chưa xác minh. Migration 018 bổ sung kho/lộ trình; 019 bổ sung kế hoạch riêng/RPC nhập; cần kiểm tra các migration trước đã được áp dụng và các hàm/phân quyền liên quan còn đúng.

Chuẩn bị bằng công cụ quản trị được phép các danh tính giả: T-A, T-B là giáo viên; S-A, S-B là học sinh thuộc hai lớp khác nhau. Hai lớp L-A/L-B và một bài thử B23 ở mỗi lớp, tài nguyên/video/phiếu/câu hỏi chỉ chứa dữ liệu giả. Vai `profiles` phải do quản trị cấp, không để người học tự nâng vai. Giữ thông tin đăng nhập trong nơi an toàn; báo cáo chỉ dùng mã giả. Không dùng phiên đăng nhập thật của giáo viên/học sinh để kiểm thử.

## Bảng ca cần hoàn thành

| Ca | Thao tác | Kết quả cần có / bằng chứng |
|---|---|---|
| DB01 | T-A tạo/sửa kế hoạch B23, lưu, tải lại và đăng nhập lại | Nội dung đúng và giữ nguyên; ID giả, ảnh và kết quả query do tài khoản thử |
| DB02 | T-A nhập kế hoạch vào bài sở hữu, thử nhập lặp | Bước/pha/sản phẩm đúng; không nhân đôi ngoài chủ ý; giao dịch không để trạng thái nửa chừng |
| DB03 | T-B mở URL/ID kế hoạch và lớp của T-A | Bị từ chối ở máy chủ/RLS, không chỉ ẩn nút; không thấy dữ liệu riêng |
| DB04 | S-A mở bài được giao, thực hiện trước/trong/sau theo cấu hình | Thứ tự/mốc mở đúng; không tự vượt điều kiện; nhiệm vụ và trạng thái rõ |
| DB05 | S-A nộp sản phẩm/phản tư, T-A nhận và phản hồi | Dữ liệu khớp hai vai; giữ sau tải lại/đăng nhập lại; không coi localStorage là nộp |
| DB06 | S-B hoặc chưa đăng nhập thử đọc/sửa bài nộp của S-A | Máy chủ/RLS từ chối; không lộ điểm, hồ sơ hoặc sản phẩm |
| DB07 | S-A thử URL/API đáp án chưa được mở và quyền giáo viên | Từ chối quyền vượt vai; thời điểm công bố đáp án đúng cấu hình |
| DB08 | Mất kết nối hoặc yêu cầu lỗi khi lưu/nộp | Thông báo hữu ích, biết đã lưu/nộp hay cần thử lại; không báo thành công giả |
| DB09 | Sao lưu và khôi phục bản dữ liệu thử vào môi trường phục hồi riêng | Có nhật kí và kiểm tra dữ liệu/ownership; không tác động bản gốc |
| DB10 | Chốt số người dùng đồng thời rồi thử tải web/AI/lưu | Ghi phần cứng, kịch bản, độ trễ, tỷ lệ lỗi và giới hạn; không suy quy mô từ một lượt HTTP |

Ghi ngày, phiên bản, ca, tài khoản giả, bước, kết quả mong đợi/thực tế và đường dẫn ảnh/log. Không lưu mật khẩu, token, URL chứa khóa hoặc dữ liệu thật. Nhà trường xác nhận mục đích/đồng thuận, thời hạn lưu, quyền rút lui, người chịu trách nhiệm và quy trình xử lí dữ liệu trước thử với người thật.

## Tiếp tục phối hợp

1. Đọc checkpoint, acceptance, issues, USER_GUIDE, curriculum-matrix và report đầy đủ trong runs. Kiểm tra `git branch --show-current` và `git status --short` tại đúng thư mục Documents; giữ thay đổi hiện có. Kiểm tra hash hai DOCX gốc.
2. Chạy preflight hai tài khoản CLI; mọi account lỗi/hạn mức phải dừng đúng worker, không lấy tài khoản trưởng nhóm. Nếu bài báo đã đổi, cập nhật trích xuất và manifest trước job tiếp theo.
3. Giao Worker 2 lượt thử tài khoản trên môi trường đã xác minh; thông tin đăng nhập lấy ở nơi lưu an toàn, không chèn vào prompt/log. Chia vấn đề khoa học/nội dung cho root, UX/3D thao tác cho Worker 3 bằng file chính xác; file chung root tích hợp.
4. Sau sửa, chạy kiểm tra phù hợp rồi chốt hash web. Worker 2 thực hiện hai lượt dùng thử liên tiếp đầy đủ trên cùng hash, đóng từng lỗi chỉ khi có bằng chứng; không tính lượt timeout hay lượt chỉ kiểm tra một nhóm ca là đạt toàn bộ.
5. Worker 2 cập nhật bài báo sau các vòng đã kiểm chứng, sao lưu và render/xem đủ trang. Kiểm thử/phản biện AI ghi riêng với thử nghiệm giáo viên–học sinh thật.

Triển khai rộng vẫn cần thẩm định chuyên môn độc lập, thử dùng với giáo viên/học sinh, dữ liệu quy mô và phương án vận hành. Tác giả phải giải quyết mô tả 02 lớp so với 02 thực nghiệm + 02 đối chứng và lịch tiến độ trong NCKH gốc; không sửa hai tài liệu căn cứ trong lúc quyết định việc này.
