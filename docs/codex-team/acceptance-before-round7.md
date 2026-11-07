# Bảng đối chiếu nghiệm thu

Cập nhật 05/10/2026. Phạm vi tài liệu: chủ đề Vật lí hạt nhân môn Vật lí lớp 12 THPT; đối tượng giáo viên Vật lí và học sinh lớp 12. Trạng thái tổng: **CHƯA ĐẠT**. Tệp trích xuất có số đoạn P để truy nguyên; hash trong source-manifest.json. Có chức năng hoặc test code đạt chưa đồng nghĩa toàn bộ yêu cầu đạt.

| ID / căn cứ | Yêu cầu | Chức năng hoặc học liệu | Tiêu chí kiểm tra | Bằng chứng hiện có / cần bổ sung | Trạng thái |
|---|---|---|---|---|---|
| HD01 hd P3–5 | Video hoạt hình ngắn có nội dung hạt nhân | LearningResourcePreview, video B21–B25 | Mở/phát, hướng dẫn tiếng Việt, nguồn, nhiệm vụ quan sát, phương án khi không nhúng | Bài báo P97–102 là lịch sử; cần Worker 2 thử hiện tại | CHƯA ĐẠT |
| HD02 hd P6–8 | Mô phỏng tương tác cấu tạo, bán rã, phân hạch | Simulation3D, B21/B22/B23, GuidedFissionLab | Tham số đổi đúng, nhãn/đơn vị, reset/pause/góc nhìn, hoạt động tạo sản phẩm | 7 test physics/fission nền đạt; thiếu hành vi/hình ảnh lượt mới | CHƯA ĐẠT |
| HD03 hd P9–11 | Infographic tương tác các tia và lịch sử | InteractiveInfographic, B21–B25 | Điểm chọn dùng bàn phím; alpha/beta/gamma đúng; có nguồn, câu hỏi và ảnh đọc được | 2 test youtube-learning nền đạt; cần thử B23 và sơ đồ lịch sử | CHƯA ĐẠT |
| HD04 hd P12–14 | Phiếu số và chẩn đoán có phản hồi ngay | Phiếu, ChoiceCheck, quiz học liệu | Câu đúng/sai/bỏ trống nhận phản hồi có giải thích; hướng dẫn và sản phẩm | 5 test guided-teacher-workflows nền đạt; cần thao tác | CHƯA ĐẠT |
| HD05 hd P15 | Video từng bài giảng | Kho video theo B21–B25 | Mỗi bài có video phù hợp và hiểu được; thử toàn bộ liên kết | Danh mục có video; chưa thử đủ năm video hiện tại | CHƯA ĐẠT |
| HD06 hd P19–20 | Dữ liệu và xử lí đồ thị hàm mũ/ước lượng T | HalfLifeDiscovery, B23/B25, notebook | Xuất bảng cho spreadsheet, phân biệt dữ liệu mô hình/SGK/đo; tính T và đơn vị đúng | Test bán rã đạt; cần dùng bảng để hoàn thành nhiệm vụ | CHƯA ĐẠT |
| HD07 hd P21–23 | Bản đồ tư duy cộng tác ứng dụng | Học liệu nhóm B24 | Hai thành viên đóng góp cùng sản phẩm, hướng dẫn nguồn và nhận xét | Chưa kiểm tra khả năng cộng tác thật; gợi ý công cụ là khuyến nghị | CHƯA ĐẠT |
| HD08 hd P24–25 | Đóng vai xây dựng nhà máy điện hạt nhân | Kế hoạch B24 và hoạt động roleplay | Có vai, lập luận dựa khoa học, phản biện và tiêu chí sản phẩm | Test phân vai kế hoạch đạt; cần dùng thử nhiệm vụ | CHƯA ĐẠT |
| HD09 hd P26–28 | Ôn tập cạnh tranh theo nhóm | game/quiz | Có luật/chấm/phản hồi và hoạt động đồng đội; không chỉ nhãn game | Chưa dùng thử nhóm | CHƯA ĐẠT |
| NC01 NCKH P135,P146,P239 | Ma trận mục tiêu–nội dung–hoạt động–đánh giá theo chương trình | nuclear-curriculum, teaching-plan | Bao phủ cấu tạo, năng lượng liên kết, phản ứng, phóng xạ, ứng dụng/an toàn; truy nguyên YCCĐ | Có mẫu; xác minh nguồn Bộ và từng hoạt động còn cần làm | CHƯA ĐẠT |
| NC02 P121–123,P135 | Chu trình tự học có kế hoạch, theo dõi, tự đánh giá, tự điều chỉnh | Notebook, phiếu, progression | Mỗi pha có nhiệm vụ/sản phẩm; giáo viên nhận được sản phẩm nếu giao qua lớp | Test local/pathway đạt; E2E tài khoản chưa có | CHƯA ĐẠT |
| NC03 P123,P150,P163 | AI gợi ý có kiểm duyệt, không quyết định điểm, bảo vệ dữ liệu | AI study/teacher, local-ai | Câu hỏi trong/ngoài phạm vi, sai khoa học, injection, nguồn, lỗi/tải; giáo viên rà trước dùng; cơ chế báo lỗi | 10 test local-ai nền đạt; cần hội thoại thực và quy trình báo lỗi | CHƯA ĐẠT |
| NC04 P125–126,P169 | Quy trình và hướng dẫn dùng AI tạo học liệu | Hướng dẫn GV, LOCAL_AI | Có chọn nguồn→tạo nháp→đối chiếu→sửa→duyệt→lưu phiên bản, vai chịu trách nhiệm | Tài liệu tồn tại; cần review đầy đủ và minh chứng dùng độc lập | CHƯA ĐẠT |
| NC05 P127 | Ít nhất 3 kế hoạch ba pha | Mẫu B21–B25 và xuất DOCX | 3 kế hoạch phù hợp bài, thời gian, thiết bị, vai và đánh giá; mở DOCX đúng | 5 mẫu có test; chưa đủ review độc lập hiện tại | CHƯA ĐẠT |
| NC06 P128,P135,P161 | Công cụ đánh giá năng lực tự học | Rubrics, nhật kí, bộ tiền/hậu kiểm nghiên cứu | Hành vi quan sát rõ; phân biệt khung thiết kế với thang đo đã kiểm định | Rubrics 4×4 hiện có; chưa kiểm định độ tin cậy/giá trị | CHƯA ĐẠT |
| NC07 P157–159,P168 | Khảo sát và bán thực nghiệm trường THPT | Đề cương nghiên cứu, chưa có dữ liệu | Có trường/lớp thật, đồng thuận, tiền/hậu kiểm/đối chứng, dữ liệu kiểm chứng | Chưa thực hiện; AI không thay cho người thật | CHƯA ĐẠT — nghiên cứu thực địa |
| NC08 P163 | Mã hóa dữ liệu, quyền rút lui, lưu trữ có thời hạn | Vận hành, tài khoản/RLS | Chính sách áp dụng tại trường và thử phân quyền, lưu/xóa theo quy trình | Thiếu tài khoản/dữ liệu thử và môi trường DB đã xác minh | CHƯA ĐẠT |
| NC09 P169,P235 | Bài báo đúng sản phẩm; chấp nhận/đăng theo trường | BAI_BAO_KHOA_HOC_CAP_NHAT_HOC_LIEU.docx | Worker 2 cập nhật thực tế, render đủ trang; không bịa thực nghiệm; việc gửi/được nhận có chứng từ riêng | Bài báo có sẵn, chưa cập nhật vòng mới; chưa có chấp nhận đăng | CHƯA ĐẠT |
| NC10 P243–245 | Hướng dẫn và chuyển giao | GV/HS/vận hành | Dùng được độc lập, cách học/giao-nộp/AI/offline rõ, quy mô có cơ sở | Cần bản hướng dẫn đồng bộ hiện tại và thử thực tế | CHƯA ĐẠT |
| US01 yêu cầu phiên này | Desktop/mobile/keyboard/a11y, trạng thái lỗi/trống | Toàn bộ UX công khai và riêng | 1280/390 px, không tràn/che; focus/label/điều hướng; lỗi hữu ích | Worker 2/3 vòng 0 không mở browser; đang khắc phục môi trường | CHƯA ĐẠT |
| US02 yêu cầu phiên này | Chức năng/phân quyền/lưu/hiệu năng | LMS, Supabase, AI | Hai vai thử, hai lớp, không đọc đáp án/lớp khác, dữ liệu tồn tại sau đăng nhập lại; tải theo quy mô xác định | 58/58 nền, tsc đạt, lint 0 lỗi/1 cảnh báo; E2E/tải còn thiếu | CHƯA ĐẠT |
| US03 yêu cầu phiên này | Hai lượt dùng thử liên tiếp bản cuối | Worker 2 | Cùng hash web; không phát hiện vấn đề mới ảnh hưởng nghiệm thu; có thao tác/ảnh | Chưa có lượt dùng thử đủ điều kiện | CHƯA ĐẠT |

Tên PhET, Canva, Genially, Forms, Padlet, Kahoot trong hd là công cụ gợi ý, không bắt buộc thay nền tảng hiện tại. Nhiệm vụ tương ứng vẫn phải đạt. Video/đồ thị không tự chứng minh năng lực tự học tăng.

Các nội dung nghiên cứu thực địa và chấp nhận đăng thuộc nghiệm thu đề tài khoa học; tách khỏi nghiệm thu phần mềm để không tự dựng dữ liệu hay chờ AI làm thay. Chưa có căn cứ hạ trạng thái các dòng này thành ĐẠT.

Điểm cần tác giả quyết định trong NCKH gốc: P137 nêu 01 trường/02 lớp, P159 nêu 02 lớp thực nghiệm + 02 đối chứng, P148 nêu một số trường. P199/P205 có mốc 12/2027 trước 01/2027. Không sửa tài liệu gốc; không tự lựa chọn quy mô hoặc tiến độ để công bố.
