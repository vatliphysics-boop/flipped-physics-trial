# B23 — Ma trận SGK → Website

Nguồn: SGK Vật lí 12 KNTT, Bài 23 Hiện tượng phóng xạ, tr. 104–113 (theo docs/SGK_RESEARCH_WEB_MATRIX.md và src/lib/catalog-b23.ts).

Trạng thái nguồn: SGK-chuong-IV.pdf là bản scan, chưa có lớp chữ. Tên đề mục cấp hai và cấp ba CHƯA được đối chiếu trực tiếp với trang sách; mục có dấu (?) cần người kiểm tra bản gốc trước khi công bố.

## Cấu trúc cấp một (bắt buộc, đúng thứ tự)

| Mục SGK | Trang (theo catalog) | Nội dung cần có | Hình thức trực quan | Câu hỏi/phản hồi | Pha lớp đảo ngược |
|---|---|---|---|---|---|
| Khởi động | 104 | Becquerel 1896, phim che sáng vẫn bị đen, dấu chữ thập, ảnh buồng sương (Hình 23.1) | Hoạt cảnh SVG 5 cảnh, ảnh tư liệu khi có giấy phép | Vì sao phim vẫn bị tác động khi không có ánh sáng? Dừng để dự đoán | Trước giờ |
| I. Hiện tượng phóng xạ | 104–106 | Tự phát, ngẫu nhiên (Bảng 23.1, Hình 23.2), tia alpha, beta trừ, beta cộng, gamma (Hình 23.3, 23.4) | Buồng sương định tính, hoạt cảnh từng loại tia, chế độ so sánh | Dự đoán hướng lệch, chọn tia | Trước và trong giờ |
| II. Định luật phóng xạ. Độ phóng xạ | 107–109 | N = N0.2^(-t/T) = N0.e^(-lambda t), lambda = ln2/T, H = lambda.N, Bq, Ci (Bảng 23.2, Hình 23.5) | Từ một hạt nhân đến mẫu lớn, mô phỏng seed, đồ thị trong tab Phân tích | Dự đoán sau hai chu kì; bài O-15 | Trong giờ |
| III. Ảnh hưởng của tia phóng xạ. Biển cảnh báo (?) | 110 | Ion hóa, tác động mô sống, biển cảnh báo | Sơ đồ động, hoạt động nhận biết biển | Chọn biển, chọn ứng xử | Trong và sau giờ |
| IV. Nguyên tắc an toàn phóng xạ (?) | 110–111 | Thời gian, khoảng cách, che chắn | Mô hình định tính, ghi rõ nguồn điểm khi dùng nghịch đảo bình phương | Điều chỉnh yếu tố và giải thích | Sau giờ |

Trang 111–113 (định tuổi C-14, ứng dụng đồng vị) thuộc phần củng cố/vận dụng sau bốn mục; vị trí chính xác cần đối chiếu (?).

## Quyết định thiết kế

- Bỏ khối Khảo sát quá trình ở đầu trang. Mô phỏng phân rã chuyển vào mục II.
- Mô hình U-238 hiện có không gán T = 20 s. Chế độ T tùy chỉnh phải ghi: Mẫu phóng xạ giả định. U-238: T xấp xỉ 4,468 x 10^9 năm, phân rã alpha thành Th-234.
- Đồ thị chỉ xuất hiện trong tab Phân tích của mục II, kèm trạng thái chưa có dữ liệu.
- Hệ ba pha lớp đảo ngược chỉ gắn nhiệm vụ vào từng mục, không thay thế mục SGK.

## Việc chưa làm

- Đối chiếu tên đề mục cấp hai/ba với bản gốc (OCR hoặc người đọc).
- Ảnh tư liệu lịch sử có giấy phép đã kiểm chứng.
- Toàn bộ triển khai giao diện.
