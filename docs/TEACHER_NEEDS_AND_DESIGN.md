# Công việc giáo viên và chức năng đã thiết kế

Ngày rà soát: 05/10/2026. Phạm vi B21–B25. Đây là phân tích tài liệu và yêu cầu người dùng, chưa phải khảo sát nhu cầu trên mẫu giáo viên.

Nghiên cứu của Roy và cộng sự (2024) xem xét thời gian chuẩn bị bài và chất lượng tài liệu ở giáo viên khoa học Year 7–8 tại Anh. Báo cáo giúp xác định khâu chuẩn bị là một hướng nghiên cứu; không chứng minh web này tiết kiệm thời gian. [Báo cáo EEF](https://d2tic4wvo1iusb.cloudfront.net/production/documents/projects/chatgpt_in_lesson_planning_-_evaluation_report.pdf).

Khung năng lực AI của Miao và Cukurova (2024) đặt quyết định của giáo viên, mục tiêu sư phạm và việc kiểm tra công cụ trong thiết kế sử dụng AI. Vì vậy việc sửa, kiểm tra và chọn tài liệu phải nằm trong tay giáo viên. [UNESCO](https://www.unesco.org/en/articles/ai-competency-framework-teachers).

| Công việc cần giải quyết theo yêu cầu người dùng | Chức năng cụ thể | Kết quả giáo viên nhận được |
| --- | --- | --- |
| Ghép câu hỏi với hình đúng dữ kiện, tránh tìm và chèn thủ công từng ảnh | 33 câu gắn mã của 11 hình, lọc theo B21–B25 | Câu và hình giữ cùng nhau trong bản xem và Word |
| Biến nội dung thành đề sử dụng được, có khóa và điểm rõ ràng | Chọn bài, loại đề, số câu; sửa nội dung/điểm/khóa; bảng phân bố thực tế | DOCX đề học sinh, DOCX đáp án và ma trận riêng |
| Đảo nhiều mã mà không mất hình hoặc lệch đáp án | 1–8 mã cùng tập câu; ánh xạ đáp án sau đảo phương án | Các mã đề và hướng dẫn chấm tương ứng |
| Tái sử dụng đề đã có | Nhập TXT/DOCX trong trình duyệt, đọc bốn phương án, giữ điểm ghi đầu câu và một hình ở phần dẫn | Bản kiểm tra cấu trúc trước khi cho phép đảo |
| Chuẩn bị phiếu phù hợp ba pha | Chọn vấn đề hỗ trợ; lọc câu/hình cùng chủ đề; sản phẩm theo trước/trong/sau giờ | Phiếu học sinh có hình và hướng dẫn giáo viên riêng |
| Chọn hoạt động khi học sinh chưa hiểu một khái niệm | 10 tình huống biên soạn, điều kiện thiết bị/thời lượng; nguồn thật trong kho | Hoạt động có mục tiêu, nhiệm vụ hai vai, sản phẩm, tiêu chí và hỗ trợ |
| Kiểm tra kế hoạch trước khi dùng | Quy tắc phát hiện trường thiếu, thiếu pha, lệch thời lượng | Danh sách cần sửa với vị trí hoạt động trong bản soạn |

AI cục bộ chỉ chọn mã câu hỏi và mã hỗ trợ đã biên soạn trong phần chuẩn bị tình huống. Hệ thống dựng lại nguyên văn phương án đã chọn, không để mô hình viết lại dữ kiện. Ghép đề, hình, đáp án và xuất Word dùng quy tắc dữ liệu, không cần AI hoạt động.

## Những phần chưa xác nhận

- Chưa có khảo sát giáo viên hoặc đo thời gian trước/sau; chưa kết luận chức năng đáp ứng mọi giáo viên, độc nhất hoặc tạo hiệu quả sư phạm.
- Ma trận là phân bố của tập câu thực tế, chưa được thẩm định về mức độ nhận thức, độ khó hoặc giá trị đo lường.
- Nhập đề chưa hỗ trợ bảng, OMML, PDF quét, ảnh trong phương án hoặc nhiều ảnh mỗi câu; yêu cầu chuẩn hóa và kiểm tra khóa, không tự suy đoán phần thiếu.
- Bản nháp đề và phiếu giữ trong phiên trang; chưa có ngân hàng câu riêng đồng bộ theo tài khoản. Lưu/giao kế hoạch qua lớp cần migration và kiểm thử tài khoản thật.
- Đã dựng và render tệp DOCX từ bộ xuất dùng trong web; sự kiện tải Blob hoàn tất chưa được xác nhận trong trình duyệt kiểm tra.

Đánh giá tiếp theo cần quan sát giáo viên hoàn thành một đề có hình, một phiếu ba pha và một hoạt động hỗ trợ; ghi thời gian, số lỗi phải sửa và nhận xét về mức phù hợp. Chỉ báo cáo những dữ liệu đã thu được, không dùng số kiểm thử phần mềm thay cho dữ liệu giáo viên hoặc học sinh.
