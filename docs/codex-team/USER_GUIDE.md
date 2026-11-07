# Hướng dẫn dùng bản phát triển

Bản đang thử: http://localhost:3001/hoc-lieu. Chủ đề Vật lí hạt nhân lớp 12 THPT B21–B25. Nhiệm vụ và sản phẩm cần đối chiếu mục tiêu trước khi chọn tài nguyên. Kho công khai dùng được khi chưa đăng nhập; bản ghi lưu trong trình duyệt khác với bài nộp qua lớp.

## Giáo viên

1. Từ kho mở “Cách tổ chức lớp học” để xem trách nhiệm của giáo viên/học sinh; mở “Soạn kế hoạch dạy học”, chọn mẫu B21–B25. Chỉnh mục tiêu, thời gian trong giờ, thiết bị, nhiệm vụ của hai vai, sản phẩm và tiêu chí cho trước/trong/sau giờ. Phân bố hoạt động theo điều kiện lớp.
2. Dùng tìm kiếm, bộ lọc bài và loại học liệu. Mở trước video, mô phỏng và nguồn ngoài trên thiết bị/mạng sẽ dạy. Nếu video chưa mở được, dùng infographic/kiến thức tương ứng và ghi rõ học liệu thay thế.
3. Ở B21 mục Đọc hình, chọn các mốc lịch sử 1896–1932, ghi hai cặp bằng chứng → kết luận và một dự đoán đã sửa. Trong B22, yêu cầu dự đoán bảo toàn A/Z rồi bắt đầu phân hạch, dừng, đổi góc, xem bước cuối và đối chiếu phương trình. Trong B23, tách cảnh 3D ngẫu nhiên khỏi bảng N(t) kì vọng; mỗi cảnh có điều khiển riêng.
4. Với bảng bán rã B23, tải CSV và cho học sinh nhập vào Excel/Sheets với dấu phẩy và số thập phân dấu chấm. Vẽ XY t_s–N_ky_vong, tính T từ hai điểm, so sánh khi đổi T/N₀. Yêu cầu nộp đồ thị, phép tính, giải thích và phần tự sửa. Dữ liệu CSV là mô hình, không ghi là phép đo thật.
5. B24 bản đồ tư duy: phân công thành viên phụ trách cơ chế, lợi ích, giới hạn và nguồn trên thiết bị chung. Đóng vai: tự đối chiếu bốn tiêu chí hiện trên web và trong TXT: lập luận đúng khoa học; bằng chứng truy nguyên; giới hạn; phản biện và tự điều chỉnh. Giáo viên ghi tiêu chí đã đạt và nội dung/cách sửa. B25 trò chơi: hai đội luân phiên trên một thiết bị, giải thích đáp án trước khi chốt. Không có phòng đồng biên tập/chơi đồng bộ qua mạng.
6. Từ menu mở không gian giáo viên để soạn phiếu/đề/chuẩn bị giờ học. Bản nháp trong phiên cần tải Word/JSON trước khi tải lại. Đề mẫu chỉ bao phủ chủ đề hạt nhân, không đại diện toàn học kỳ. Giáo viên duyệt đáp án, rubric và hình trước sử dụng.
7. AI: chọn nguồn và nhiệm vụ → tạo nháp → kiểm tra từng khái niệm/công thức/đơn vị/mã nguồn → sửa → duyệt → lưu phiên bản. Không dùng bản nháp AI làm điểm chính thức. Với lỗi, giữ câu hỏi/phản hồi, nguồn đối chiếu và cách sửa trong bản ghi; báo theo kênh nhà trường quy định.

Luồng lưu kế hoạch/giao bài/nhận bài qua tài khoản chưa được nghiệm thu ở môi trường hiện có. Chỉ dùng sau khi thiết lập tài khoản thử, xác minh database phát triển và hoàn tất kiểm tra phân quyền. Trong lúc này giáo viên tổ chức nhận sản phẩm qua kênh lớp đã quy định rõ, không nói rằng bản ghi trình duyệt đã tự nộp.

## Học sinh

Trước giờ: chọn bài, đọc mục tiêu, xem học liệu và ghi dự đoán/câu hỏi. Trong giờ: thao tác điều khiển từng mô phỏng, đọc nhãn/đơn vị, ghi quan sát rồi giải thích bằng nguồn và công thức; đối chiếu dự đoán. Sau giờ: chọn một nhận định rồi nhấn Kiểm tra nhận định, đọc phản hồi, ghi điều hiểu sai và hành động học tiếp. “Ghi & giải thích” lưu trên trình duyệt; tải bản ghi để giữ và nộp theo kênh giáo viên giao. Không nhập thông tin cá nhân nhạy cảm hoặc mật khẩu.

Khung AI hỗ trợ gợi ý/giải thích B21–B25. Câu trả lời có thể sai; đối chiếu nguồn và hỏi giáo viên khi chưa rõ. Trang bản ghi AI cho phép ghi câu hỏi/phản hồi, điều cần kiểm tra và phản tư; không tự gửi cho giáo viên. Làm bài kiểm tra theo yêu cầu giáo viên; tự luyện công khai không phải điểm lớp học.

Bàn phím: Tab chuyển điều khiển, Enter/Space kích hoạt nút, phím mũi tên đổi thanh trượt; Escape đóng menu/khung AI. Khi chọn 3D, dùng góc nhìn có tên trước khi xoay; đọc nội dung chữ và bảng nếu thiết bị không tải được cảnh. Ảnh/video có tỷ lệ và thời gian quy ước không đại diện quan sát nguồn phóng xạ thật.

## Vận hành và quy mô

Tại thư mục dự án dùng `npm run dev -- --port 3001`. AI cục bộ theo `docs/LOCAL_AI.md`; không công khai cổng Ollama 11434. Một tiến trình chỉ xử lí một yêu cầu AI và giới hạn 12 yêu cầu/phút; bố trí hỏi theo lượt trong bản thử. Chưa có kiểm thử tải cả lớp hoặc hệ thống nhiều máy chủ, nên chưa cam kết số người dùng đồng thời.

`.env.local` có Supabase từ xa, chưa xác nhận đây là database phát triển. Chưa tìm thấy seed/tài khoản thử; máy hiện không có Supabase CLI hoặc Docker trên PATH. Người vận hành phải xác định dự án thử riêng, chuẩn bị giáo viên + hai học sinh thuộc hai lớp, và tài khoản ngoài lớp. Không chạy migration hay dữ liệu thử trên kết nối chưa xác minh; không reset migration/database.

Trên môi trường thử đã xác minh: kiểm tra đăng nhập, sở hữu lớp/kế hoạch, giao–nộp–nhận xét, tải lại/đăng nhập lại, chống đọc lớp khác và đáp án chưa được mở; có lịch sao lưu/khôi phục, hạn lưu dữ liệu, mục đích/đồng thuận/quyền rút lui và người chịu trách nhiệm. Dùng mã giả cho người học trong bằng chứng. Chốt quy mô pilot với nhà trường trước kiểm thử tải; phương án mở rộng là bước triển khai riêng sau nghiệm thu.

Không kết luận hiệu quả học tập hoặc năng lực tự học tăng từ các test phần mềm/phản biện AI. Cần giáo viên/học sinh thật, thiết kế nghiên cứu được thống nhất, dữ liệu và kiểm định phù hợp. NCKH gốc đang có hai mô tả số lớp và mốc tiến độ mâu thuẫn; tác giả phải xác nhận trước thu thập.
