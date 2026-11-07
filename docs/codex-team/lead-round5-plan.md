# Phân việc vòng 5

Trưởng nhóm sửa `src/components/physics/B23Activities.tsx`, thêm `src/lib/decay-data.ts` và `tests/decay-data.test.ts`. Worker 3 không sửa ba file này. File chung/CSS do trưởng nhóm tích hợp theo báo cáo Worker 3. Worker 2 vẫn chỉ đọc đến job article riêng, là bên duy nhất được sửa bài báo DOCX.

LEAD-05-01 / P2: `/hoc-lieu?bai=B23&resource=system-sim-half-life` → mở mô phỏng bán rã. CUA đã xác nhận bảng t–N có số liệu nhưng không có xuất dữ liệu để làm việc trên bảng tính, nhiệm vụ mới dừng ở đổi thanh trượt và câu chọn. Căn cứ hd P19–20, NCKH P121–122 và P146. Ảnh/AX trước sửa trong lượt của trưởng nhóm; cần bổ sung bằng chứng Worker 2 độc lập.

Sửa: xuất CSV với thời gian giây, N kì vọng, tỉ lệ, T giây và N0; nhãn rõ dữ liệu mô hình, hướng dẫn đồ thị XY/ước lượng T bằng hai điểm, thông báo trạng thái tải và đặt lại tham số bảng. Không dùng số liệu mô hình làm số đếm thật, không gọi T thay đổi là điều khiển cùng đồng vị thật.

Tiêu chí đóng: tải được CSV, 61 dòng t=0..360s; N0=1000,T=30 cho N30=500,N60=250; T=60 cho N30≈707.106781; N0 gấp đôi nhân đôi N; dùng dữ liệu vẽ đồ thị và ước lượng đúng T; nút reset đưa bảng về1000/30; Worker 2 thử lại. Bản 3D và bảng định lượng có tham số riêng, tiếp tục nêu rõ trên giao diện.
