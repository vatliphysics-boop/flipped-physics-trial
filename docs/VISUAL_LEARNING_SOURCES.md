# Nguồn và đối chiếu thiết kế học liệu trực quan

Ngày kiểm tra: 04/10/2026. Phạm vi: B21–B25 theo yêu cầu người dùng; ưu tiên phát triển và kiểm tra web trước khi chỉnh bài báo, chuẩn hóa APA và tạo thư viện nhập Mendeley.

## Căn cứ nhiệm vụ

| Căn cứ | Yêu cầu thiết kế | Vị trí thực thi |
|---|---|---|
| hd.docx · Trước giờ học | Video có nhiệm vụ, mô phỏng, infographic tương tác, câu hỏi chẩn đoán | Học liệu theo bài, infographic và trình phát có câu hỏi dẫn dắt |
| hd.docx · Trong giờ học | Quan sát/đối chiếu dữ liệu, thảo luận, ứng dụng, sản phẩm nhóm | Trình chiếu; mô phỏng; bản ghi quan sát; bản đồ tư duy/đóng vai/trò chơi sẵn có trong kho |
| NCKH đã sửa · Ba pha | Mục tiêu–nhiệm vụ–sản phẩm–đánh giá, nhật kí và phản hồi | Bàn soạn kế hoạch riêng, phiếu ba pha, bản ghi dự đoán/quan sát/giải thích/câu hỏi |
| NCKH đã sửa · Vai trò giáo viên | Giáo viên lựa chọn, chỉnh sửa, kiểm tra nội dung và minh chứng tự học | Tạo kế hoạch từ học liệu đang xem, sửa thời lượng/nhiệm vụ/tiêu chí; không tự suy ra điểm năng lực |
| SGK KNTT tr. 100–101, hình 22.6 | Ví dụ phân hạch Y-95, I-138, 3 neutron; hạt nhân trung gian U-236* | `fission-model.ts`, cảnh 3D, phương trình đồng bộ và infographic B22 |

hd.docx mô tả hai giai đoạn trước/trong giờ. Pha sau giờ và công cụ đánh giá tự học được lấy từ đề cương NCKH, không gán thêm cho hd.docx.

## Đối chiếu chương trình môn Vật lí

[Chương trình Vật lí 2018, bản PDF ban hành kèm TT32](https://admintruong.haiphong.shieldix.app/data/haiphong/thcsandong/2023_6/1/12-ctvat-li_16202320.pdf), trang in 27–28, lưu trên cổng thông tin trường THCS An Đồng, Hải Phòng.

- B21: lập luận từ tán xạ alpha, cấu tạo/kí hiệu hạt nhân.
- B22: phương trình hạt nhân, năng lượng liên kết riêng, mô tả phân hạch và tổng hợp hạt nhân.
- B23: phóng xạ ngẫu nhiên, alpha/beta/gamma, chu kì bán rã và an toàn bức xạ.
- B24: vai trò công nghiệp hạt nhân và ứng dụng.
- B25: dùng dữ liệu và đồ thị phóng xạ trong hoạt động thực hành, đối chiếu SGK.

Đây là đối chiếu thiết kế với chương trình và SGK. Không phải xác nhận của Bộ GDĐT, kiểm định độc lập, hay bằng chứng hiệu quả trên học sinh. Không đưa các dự kiến khảo sát/thực nghiệm trong NCKH thành số liệu đã thu thập.

## Video YouTube gắn nhiệm vụ học

Tên/kênh được xác nhận từ API YouTube oEmbed tại `https://www.youtube.com/oembed?url=...&format=json`; không suy đoán ID hoặc phụ đề tiếng Việt.

| Bài | Video | Kênh đã xác nhận | Đối chiếu khi xem |
|---|---|---|---|
| B21 | [Rutherford’s gold foil experiment](https://www.youtube.com/watch?v=bVlwH1kfDeg) | Khan Academy | Đường α và kết luận về cấu trúc nguyên tử |
| B22 | [What Is Nuclear Fission?](https://www.youtube.com/watch?v=D91T-B-PVE0) | FuseSchool – Global Education | Một kênh phân hạch khác không được coi là sai chỉ vì khác Y/I của ví dụ SGK |
| B23 | [Intro to radioactive decay](https://www.youtube.com/watch?v=P_SD5Rt6XMk) | Khan Academy | Bản chất bức xạ và thay đổi A/Z |
| B24 | [How do nuclear power plants work?](https://www.youtube.com/watch?v=R7WPEYGr1Vs) | TED-Ed | Chuỗi chuyển hóa; không dùng số liệu thị phần năm 2017 làm số liệu hiện tại |
| B25 | [Half-life](https://www.youtube.com/watch?v=gDpyBifg6-s) | Khan Academy | N(t), số chu kì, phân biệt N và H |

Trình phát nguồn `youtube-nocookie.com` được tạo sau thao tác mở; không tự phát. Có đường dẫn xem trên YouTube. Nhúng và khả năng phát còn phụ thuộc tác giả, mạng và thiết bị. Hướng dẫn tiếng Việt do web biên soạn; nguồn tiếng Anh. Không tải lại hoặc lưu video tác giả vào kho riêng.

## Đồ họa và mô hình

Đồ họa vector gốc được tạo từ `scripts/generate_visual_infographics.py`. PNG được raster hóa từ chính SVG, không phải ảnh AI hoặc ảnh chụp thí nghiệm. Mỗi hình có mô tả, bảng giải thích tương tác, điểm dễ nhầm và câu hỏi. Animation là chỉ dẫn đọc hình định tính, không phải phép đo thời gian thực.

Mô phỏng phân hạch sử dụng chung dữ liệu nucleon với kiểm thử bảo toàn. Mỗi nucleon là một mesh; trạng thái kích thích và tách mảnh không tạo thêm proton/neutron. Màu và phân bố vị trí quy ước; không mô tả cấu trúc lượng tử thực. Mô hình thế hệ k không đổi dùng để so sánh xu hướng, không dự báo lò phản ứng hoặc kết luận vụ nổ.

## Tính tiện dụng và giới hạn vận hành

Chọn bài trước loại tệp để giảm thời gian tìm; bốn bước học nhất quán giữa các bài; một khung nội dung hoạt động tại một thời điểm; WebGL và video chỉ tải khi cần; nút thao tác có nhãn, dùng được bằng bàn phím và trên màn hình hẹp. Có trình chiếu, bản in phiếu, tải PNG/SVG/TXT, lưu yêu thích và chuyển nguồn vào kế hoạch riêng.

Yêu thích và bản ghi quan sát lưu trên trình duyệt, chưa đồng bộ tài khoản hoặc gửi giáo viên. Các luồng giao/nộp và kế hoạch theo tài khoản vẫn cần migration 017–019 và kiểm thử trên môi trường có dữ liệu; đợt nâng cấp giao diện này không thay đổi trạng thái đó.

## Điều chỉnh theo phản hồi người dùng

Đã bỏ các nút “Đối chiếu SGK” trên infographic và mô phỏng, đổi nhãn giải thích và nhật kí sang cách viết thông thường. SGK dùng làm nguồn kiểm tra tính chính xác nội dung, không phải một mục hoạt động riêng do hd.docx hoặc NCKH đã sửa yêu cầu. Tiêu đề giao diện dùng tên nội dung trực tiếp, không dùng khẩu hiệu.
