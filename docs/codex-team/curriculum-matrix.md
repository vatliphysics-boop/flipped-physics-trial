# Đối chiếu chương trình Vật lí với học liệu

Nguồn trực tiếp: PDF Bộ do người dùng cung cấp `12_ctvat_li_26320197.pdf`, trang in 27–28. Root đã xem cả hai trang ảnh để kiểm tra bảng và công thức. Các mã dưới đây là mã nội bộ trong `src/lib/nuclear-curriculum.ts`, không phải số hiệu yêu cầu của Bộ. Tên bài B21–B25 lấy từ SGK KNTT trong tài liệu dự án; chương trình không bắt buộc số bài này.

| Mã / trang | Yêu cầu cần đạt được diễn đạt gọn | Chức năng / nhiệm vụ | Tiêu chí và bằng chứng | Trạng thái |
|---|---|---|---|---|
| structure-scattering / 27 | Suy ra hạt nhân và đánh giá kích thước từ tán xạ α | B21 Rutherford; phiếu dự đoán–quan sát–giải thích | Giải thích phần lớn đi thẳng/ít lệch mạnh, so kích thước; mapping khớp PDF, cần dùng thử nhiệm vụ này độc lập | ĐẠT đối chiếu; CHƯA ĐẠT kiểm chứng đủ |
| structure-symbol / 27 | Biểu diễn kí hiệu bằng số nucleon/proton | B21 cấu tạo, đồng vị; chẩn đoán | Z, N, A khớp tham số, A=Z+N; test physics đạt; cần ảnh thao tác B21 | ĐẠT đối chiếu; CHƯA ĐẠT kiểm chứng đủ |
| structure-model / 27 | Mô hình nguyên tử proton/neutron/electron | B21 infographic/kiến thức; mô phỏng hạt nhân | Phân biệt nguyên tử với hạt nhân và electron; không gọi cảnh nucleon là toàn bộ nguyên tử | ĐẠT đối chiếu; CHƯA ĐẠT dùng thử đầy đủ |
| reaction-equation / 27 | Viết phương trình phân rã đơn giản | B22 bảo toàn; B23 α/β/γ | Tổng A/Z trước–sau, β⁻ tăng Z, γ không đổi; test và bài tập nguồn | ĐẠT đối chiếu; CHƯA ĐẠT kiểm chứng đủ |
| binding-energy / 27 | Thảo luận E=mc² | B22 hụt khối, liên kết; B25 bài năng lượng | Quy ước khối lượng, đơn vị u/MeV, giải thích nguồn năng lượng; test mass-convention/physics đạt | ĐẠT đối chiếu; CHƯA ĐẠT thao tác đủ |
| binding-stability / 27 | E/A và độ bền vững | B22 đồ thị liên kết riêng | Không đồng nhất E toàn phần với E/A; ghi giới hạn diễn giải độ bền | ĐẠT đối chiếu; CHƯA ĐẠT dùng thử đủ |
| reaction-fission-fusion / 28 | Nêu phân hạch/tổng hợp | B22 phân hạch 3D, D–T | Phân hạch A=236/Z=92, điều kiện D–T, mô hình quy ước; W2/W3 vòng4 thật start/pause/timeline/reset phân hạch; tests đạt | ĐẠT ca phân hạch; CHƯA ĐẠT ca tổng hợp |
| industry-role / 28 | Thảo luận đánh giá công nghiệp hạt nhân | B24 bản đồ ứng dụng/đóng vai/nhà máy | Cơ chế–lợi ích–giới hạn–nguồn/phản biện; W2 vòng4 nhập/thử nhóm một thiết bị; chưa có người học thật | ĐẠT đối chiếu; CHƯA ĐẠT mọi ca |
| decay-random / 28 | Tự phát và ngẫu nhiên | B23 Geiger, cảnh 64 hạt | Phân biệt từng sự kiện với quy luật kỳ vọng; Poisson/decay tests đạt; cần thao tác lặp quan sát | ĐẠT đối chiếu; CHƯA ĐẠT dùng thử đủ |
| decay-activity / 28 | H, λ và H=λN | B23 kiến thức, bảng; B25 dữ liệu H | N là số hạt, H là s⁻¹/Bq; H đổi cùng N khi λ cố định; tests đạt | ĐẠT đối chiếu; CHƯA ĐẠT dùng thử đủ |
| decay-law / 28 | x=x₀exp(−λt) với N/H/tốc độ đếm | B23 CSV, notebook; B25 bảng SGK | N0/T đổi đúng, không gọi mô hình là đo; 61 điểm CSV; 2 test mới đạt, W2 vòng4 thay T/N0 và tải CSV | ĐẠT ca mô hình N; CHƯA ĐẠT đủ N/H/đếm |
| decay-half-life / 28 | Định nghĩa T | B23 đồ thị/CSV/phiếu | Sau T còn nửa, 2T còn một phần tư; T từ hai điểm đúng đơn vị; tests đạt, HTTP câu 2T có nguồn H6 | ĐẠT ca tính mô hình; CHƯA ĐẠT đầy đủ |
| radiation-types / 28 | Tính chất α/β/γ | B23 infographic/cảnh các tia | Điện tích/bản chất/biến đổi A/Z/đâm xuyên đúng, gamma suy giảm; W2 vòng5 đang thử bàn phím | ĐẠT đối chiếu; CHƯA ĐẠT đủ hành vi |
| radiation-signs / 28 | Nhận biết biển báo phóng xạ | B23 an toàn và hình kiến thức | Nhận dấu hiệu/cách ứng xử từ hình; cần ảnh và câu kiểm tra thực tế | ĐẠT đối chiếu; CHƯA ĐẠT dùng thử |
| radiation-safety / 28 | Nêu/tuân thủ an toàn | B23 thời gian–khoảng cách–che chắn, tình huống | Biện pháp phù hợp, không suy liều cá nhân từ mô phỏng; tuân thủ thật cần giáo viên quan sát | ĐẠT đối chiếu; CHƯA ĐẠT đủ kiểm chứng |

Trang 31–34 hướng đến tự học có hướng dẫn, tìm hiểu dựa bằng chứng, thực hành, hợp tác, tự đánh giá và đánh giá quá trình/sản phẩm. Web có dự đoán–quan sát–giải thích–tự sửa, phiếu ba pha và hoạt động nhóm; điểm tự luyện chưa xác nhận năng lực hoặc thay đánh giá của giáo viên. Học liệu số hỗ trợ các yêu cầu này; không tự chứng minh học sinh đã đạt chỉ vì phần mềm có nội dung tương ứng.
