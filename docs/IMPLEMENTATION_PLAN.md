# Kế hoạch triển khai

## Chặng 1 — nền tảng nhất quán

1. Chuẩn hóa `before_class | in_class | after_class` và service tiến độ dùng chung.
2. Chấm checkpoint ở server/RLS; không đưa đáp án sang client và không tin `isComplete`.
3. Video bucket private qua signed URL có xác thực; player resume/sync có trạng thái lỗi.
4. Trang học render một material/assignment theo phase, có empty state trung thực; B01–B20 hiển thị “Chưa triển khai”.
5. Chuyển homework sang vùng pha 3, sửa contract reflection và test validation/progress.

## Chặng 2

Hoàn chỉnh B21 theo ma trận SGK đã đối chiếu, kết nối nhiệm vụ với evidence dự đoán–quan sát–kết luận và luồng giao/nộp/feedback.

## Chặng 3–4

Mở B22–B25 sau khi đối chiếu SGK; hoàn thiện dashboard giáo viên, CSV, accessibility, tài liệu bàn giao và kiểm thử integration/RLS khi có môi trường.
