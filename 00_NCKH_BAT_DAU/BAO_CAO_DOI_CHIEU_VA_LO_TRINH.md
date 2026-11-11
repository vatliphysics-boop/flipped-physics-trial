# Đối chiếu đề tài và hướng phát triển

Ngày rà soát: 08/11/2026. Đề tài: học liệu số có hỗ trợ AI, lớp học đảo ngược và năng lực tự học trong chủ đề Vật lí hạt nhân lớp 12.

## 1. Căn cứ và giới hạn

- Thuyết minh: `ĐÃ SỬA - NCKH.docx`, bản đề ngày 04/09/2026, mục 9–14.
- Phiếu đánh giá đề tài ĐT_06 - NX, phản biện TS. Lê Minh Thành Châu, trang 2. Phiếu ghi kết quả đạt; hai yêu cầu chỉnh sửa được tóm tắt ở mục 2 bên dưới.
- Đề cương `DE_CUONG_NGHIEN_CUU_HOAN_CHINH.docx`; bản thảo bài báo `BAI_BAO_KHOA_HOC_CAP_NHAT_HOC_LIEU.docx`; mã nguồn và học liệu trong dự án; các báo cáo `docs/AI_PROJECT_HANDOFF.md`, `docs/NUCLEAR_SCIENCE_SOURCES.md`, `docs/PHYSICS_PROCESS_VERIFICATION.md` và `docs/NARRATED_VIDEO_VERIFICATION.md`.
- Đây là rà soát hồ sơ và mẫu mã nguồn, có tham khảo kết quả kiểm thử được ghi trước đó. Trong lần này chưa tổ chức dạy học, không chạy lại toàn bộ luồng ứng dụng và không xác minh thực địa; các việc chưa tìm thấy minh chứng được ghi là **chưa xác minh**, không khẳng định chắc chắn chưa xảy ra.

## 2. Ý kiến phản biện và cách đáp ứng

### 2.1. Bảo đảm việc tự học trước giờ học

Phản biện yêu cầu bổ sung biện pháp sư phạm để kiểm soát và bảo đảm học sinh thực sự tự học trước giờ học, tránh chỉ truy cập hình thức.

**Đã có nền tảng:** trang trước giờ học lấy các nhiệm vụ, video và câu hỏi; mã có kiểm tra hoàn thành bước bắt buộc và điều kiện mở câu hỏi cuối pha. Báo cáo bàn giao ghi đã thử dữ liệu QA cho B21–B25; giáo viên có nơi xem sản phẩm và nhật kí. Đó là minh chứng về cơ chế và phép thử đã báo cáo, chưa chứng minh học sinh thật tự học.

**Cần bổ sung:** một quy trình giao nhiệm vụ có sản phẩm cá nhân, phản hồi và đối chiếu ngẫu nhiên trên lớp; quy định cụ thể tiêu chí đánh giá chất lượng câu trả lời, cách xử lí học sinh chưa hoàn thành hoặc thiếu thiết bị và cách sử dụng AI. Không coi thời gian xem, lượt truy cập hay hoàn thành câu trắc nghiệm đơn lẻ là bằng chứng đủ.

**Đề xuất cho mỗi bài:**

1. Trước khi xem: học sinh ghi mục tiêu hoặc dự đoán ngắn; giáo viên giao nhiệm vụ và hạn nộp rõ ràng.
2. Trong khi học: xem/đọc một học liệu, trả lời 2–3 câu xen kẽ có giải thích ngắn; nếu cần thì cho thử lại và lưu lần trả lời.
3. Trước giờ lên lớp: nộp sản phẩm cá nhân gồm một câu giải thích bằng lời của mình, một bài áp dụng ngắn và một điều còn thắc mắc. Ghi phần AI đã hỗ trợ và điều đã kiểm chứng; có thể dùng phiếu giấy nếu thiếu mạng.
4. Giáo viên xem bảng tổng hợp và chọn một số bài có câu trả lời khác nhau; đầu giờ mời học sinh giải thích một ý hoặc làm một biến thể ngắn. Kết hợp hỗ trợ, không mặc định kết luận gian lận khi học sinh trả lời yếu.
5. Lưu bài nộp, phản hồi và lần sửa; đối chiếu bằng rubric thay vì chỉ dựa vào nhấp hoàn thành. Không thể chứng minh tuyệt đối ai làm hộ chỉ bằng hệ thống; kết hợp nhiều minh chứng.

**Ví dụ B23:** Dự đoán sau hai chu kì bán rã còn bao nhiêu hạt nhân mẹ; xem mô phỏng, giải thích vì sao giá trị một mẫu có thể khác giá trị kì vọng; nộp câu giải thích và một câu hỏi. Đầu giờ đổi giả thiết và yêu cầu giải thích lại. Với quần thể lớn, giá trị kì vọng còn 1/4 ban đầu; số thực tế có thể dao động.

**Rubric thử nghiệm trước giờ:** (1) xác định mục tiêu/dự đoán; (2) giải thích và vận dụng dựa trên học liệu; (3) tự nhận diện khó khăn và đề xuất điều chỉnh; (4) ghi và kiểm chứng hỗ trợ AI khi có sử dụng. Mỗi tiêu chí xây dựng 4 mức bằng hành vi quan sát được; mục 4 chỉ đánh giá khi bài yêu cầu dùng AI hoặc quy định tương ứng. Cho chuyên gia góp ý và thử chấm trước khi dùng chính thức. Không nhầm rubric chất lượng sản phẩm với bằng chứng nhân quả về năng lực tự học.

### 2.2. Kiểm định độ chính xác tri thức do AI tạo ra

Phản biện yêu cầu bổ sung tiêu chí kiểm định độ chính xác về tri thức Vật lí hạt nhân của nội dung do AI tạo ra.

**Đã có nền tảng:** tài liệu nguồn khoa học ghi các kiểm tra cụ thể cho B21–B25 và nguồn tham khảo; báo cáo mô phỏng ghi giả thiết, giới hạn và các trường hợp tính toán. Đây là kiểm tra nội bộ cho các nội dung được liệt kê, không chứng minh mọi đầu ra AI đã được kiểm định hoặc đã có thẩm định độc lập.

**Bộ tiêu chí đề xuất:**

| Tiêu chí | Câu hỏi khi duyệt | Minh chứng cần lưu |
|---|---|---|
| Khái niệm, thuật ngữ và kí hiệu | Mô tả có đúng bản chất, phân biệt hạt nhân/nguyên tử, số khối/khối lượng, chu kì bán rã? | Nguồn, đoạn được kiểm, nhận xét của người duyệt |
| Định luật và phương trình | Bảo toàn số khối, điện tích; công thức và điều kiện áp dụng đúng? | Phương trình hai vế, phép kiểm, ghi rõ quy ước |
| Đại lượng, số liệu, đơn vị | Hằng số, đơn vị, phép đổi, kết quả có thể tính lại từ nguồn và dữ kiện? | Phép tính độc lập, nguồn và phiên bản số liệu |
| Hình ảnh/mô phỏng | Chú thích, tỉ lệ, quá trình và mối liên hệ tham số–kết quả có đúng? Giới hạn mô hình đã nêu? | Ảnh, tham số và kịch bản kiểm tra |
| Nguồn và phạm vi lớp 12 | Có căn cứ phù hợp, trích dẫn truy được; ngôn ngữ vừa sức, không vượt quá giả thiết? | Tên nguồn, trang/đường dẫn, ngày kiểm và đoạn liên quan |
| Tính nhất quán và an toàn | Video, phiếu, đáp án, AI và mô phỏng có thống nhất; nội dung phóng xạ không gây hiểu sai về an toàn? | Danh sách khác biệt, sửa chữa và người duyệt |

**Quy trình duyệt:** đánh mã học liệu và phiên bản → ghi phần do AI tạo cùng công cụ, thời điểm, yêu cầu nếu còn → người biên soạn đối chiếu nguồn và tự tính → giáo viên/chuyên gia Vật lí độc lập nhận xét theo tiêu chí → sửa lỗi, kiểm tra lại và ghi quyết định duyệt → chỉ công bố bản đã duyệt. Mỗi mục ghi đạt/chưa đạt/chưa áp dụng kèm căn cứ; chưa đạt thì chưa phát hành. Thiết lập người báo lỗi, phiên bản thu hồi và quy trình sửa.

Phản hồi AI tạo trực tiếp theo từng lượt không thể mặc nhiên coi là đã duyệt trước. Cần nêu giới hạn trong giao diện, cung cấp nguồn đã duyệt khi khả thi, có nút báo lỗi và giáo viên kiểm tra; các câu trả lời quan trọng nên được đối chiếu lại. Chưa nên nói AI luôn chính xác.

## 3. Đối chiếu với thuyết minh

| Yêu cầu | Bằng chứng tìm thấy | Nhận định và việc cần hoàn thành |
|---|---|---|
| Cơ sở lí luận, tổng quan, thực tiễn | Đề cương đã có các mục về năng lực tự học, AI, học liệu, lớp học đảo ngược. | Có bản thảo; cần rà soát nguồn, lập luận, cập nhật khảo sát thực tế và xin góp ý chuyên môn. |
| Phân tích chương trình; ma trận mục tiêu–nội dung–hoạt động–đánh giá | `docs/SGK_RESEARCH_WEB_MATRIX.md`; đề cương và nội dung B21–B25. | Có nền tảng ma trận; rà từng mục tiêu với nhiệm vụ, minh chứng, công cụ và nguồn SGK; xác nhận phiên bản sách. |
| Quy trình tạo học liệu bằng AI và hướng dẫn dùng AI | Đề cương và tài liệu kiểm chứng mô tả một phần quy trình, nguồn và giới hạn. | Chuẩn hóa thành hướng dẫn có ví dụ, hồ sơ AI, các bước kiểm định theo ý kiến phản biện; bổ sung người duyệt độc lập. |
| Bộ học liệu số đúng chương trình | Có video B21–B25, phiếu, câu hỏi, mô phỏng và giao diện trong dự án. Nguồn vật lí có đối chiếu một số trường hợp. | Có sản phẩm phát triển; cần duyệt đầy đủ từng học liệu và chạy thử với người dùng thật. Chưa xem có file là nghiệm thu chất lượng. |
| Ba kế hoạch dạy học ba giai đoạn | Đề cương có các mục 2.4–2.6 về ba kế hoạch; website chia trước, trong và sau giờ. | Rà soát từng kế hoạch, thời lượng, nhiệm vụ cá nhân, kết nối minh chứng và rubric; xác nhận bản hoàn thiện được GV góp ý. Năm bài B21–B25 là tổ chức học liệu, không tự đồng nghĩa năm kế hoạch trong thuyết minh. |
| Công cụ đánh giá năng lực tự học | Có hướng dẫn rubric, minh chứng/nhật kí và bản thảo công cụ trong đề cương. | Chuẩn hóa chỉ báo, mô tả mức, phiếu chấm, kiểm tra trước–sau và cách dùng; lấy góp ý chuyên gia, thử công cụ và xem độ tin cậy phù hợp. |
| Khảo sát thực trạng | Mục 12.3 dự kiến 20–30 GV và 150–250 HS. | Chưa thấy dữ liệu khảo sát thật được xác nhận trong tài liệu đã xem. Cần kiểm tra nhóm đã thu chưa; nếu có, tổng hợp và lưu hồ sơ; nếu chưa, chuẩn bị mẫu, liên hệ và khảo sát. |
| Bán thực nghiệm và phân tích | Mục 12.4 nêu tiền–hậu kiểm và nhóm đối chứng. Báo cáo bài báo nêu còn cần dữ liệu học sinh và thẩm định độc lập. | Chưa thấy minh chứng hoàn thành nghiên cứu thực địa trong phạm vi rà soát. Cần thống nhất mẫu, tổ chức dạy, thu dữ liệu và phân tích; không dùng dữ liệu QA như dữ liệu HS. |
| Bài báo khoa học và báo cáo tổng kết | Có bản thảo bài báo; file `OK Đề tài...` là khung báo cáo, cần tiếp tục hoàn thiện. | Bản thảo chưa chứng minh đã được chấp nhận/đăng. Thuyết minh mục 14 yêu cầu 1 bài được chấp nhận đăng hoặc đã đăng đáp ứng điều kiện trường; cần kiểm tra minh chứng. Báo cáo tổng kết chỉ điền kết quả thật. |

## 4. Các điểm cần thống nhất với cô hướng dẫn

1. **Số lớp:** mục tiêu cụ thể nói 01 trường, 02 lớp; mục 12.4 lại ghi 02 lớp thực nghiệm và 02 lớp đối chứng, tức 04 lớp. Không tự chọn phương án thay hồ sơ đã duyệt. Đề nghị đối chiếu bản chính thức và thống nhất điều chỉnh nếu cần.
2. **Thời gian:** thời hạn đề tài ghi 10/2026–04/2027; bảng tiến độ ghi một số mốc `11/2026–12/2027` và `12/2027–01/2027`, không hợp thứ tự. Cần cô xác nhận và chỉnh theo thủ tục của trường nếu đó là bản chính thức.
3. **Phạm vi địa điểm:** mục tiêu nêu 01 trường; mục phạm vi nêu một số trường. Cần phân biệt trường khảo sát và trường thực nghiệm, ghi đúng thực tế.
4. **Phương pháp phân tích:** mục 12.5 còn ghi chung và dấu ba chấm. Cần quyết định biến đo, cách chấm, phân tích trước–sau và giữa nhóm, cách xử lí thiếu dữ liệu, theo mẫu và điều kiện thực tế; không hứa một phép kiểm khi chưa đủ điều kiện.
5. Cần xác định bản thuyết minh cuối cùng đã được duyệt và cách tiếp thu ý kiến phản biện trước khi thay đổi cam kết.

## 5. Lộ trình ưu tiên

1. **Chốt hồ sơ nghiên cứu:** xác nhận bản duyệt, số lớp, trường, thời lượng, kế hoạch bài báo; lập bảng tiếp thu từng ý phản biện kèm vị trí bổ sung.
2. **Chọn một bài làm mẫu, ưu tiên B23:** hoàn thiện nhiệm vụ trước giờ, sản phẩm cá nhân, cách GV phản hồi và kiểm tra đầu giờ; thiết kế hỗ trợ khi thiếu thiết bị; sau đó nhân rộng.
3. **Lập bộ kiểm định AI:** tạo phiếu theo sáu tiêu chí ở mục 2.2, kiểm tra thử một video, một câu hỏi và một mô phỏng; mời GV Vật lí kiểm tra độc lập; sửa rồi duyệt phiên bản.
4. **Hoàn thiện công cụ nghiên cứu:** ma trận mục tiêu–chỉ báo–nhiệm vụ–minh chứng; rubric, bảng hỏi, bài kiểm tra trước/sau, hướng dẫn chấm. Xin góp ý chuyên gia, thử nhỏ, ghi sửa đổi và kiểm tra độ tin cậy nếu dữ liệu cho phép.
5. **Chuẩn bị khảo sát và thực nghiệm:** thống nhất trường, lớp và giáo viên; chuẩn bị thông tin và sự đồng thuận theo quy định nhà trường; lập mã dữ liệu, kế hoạch bảo mật; chạy thử giao–nộp trên thiết bị thật và có phương án ngoại tuyến.
6. **Thu và phân tích dữ liệu thật:** lưu thời điểm, sản phẩm, phản hồi, rubric và bài kiểm tra; mô tả thiếu dữ liệu, khác biệt đầu vào và giới hạn thiết kế; không suy ra tác động của riêng AI nếu can thiệp đồng thời nhiều yếu tố.
7. **Hoàn thiện bài báo, tổng kết, nghiệm thu:** viết theo dữ liệu thực tế; tách kết quả kiểm thử kỹ thuật với hiệu quả sư phạm; kiểm tra minh chứng bài báo được chấp nhận/đăng theo điều kiện trường.

## 6. Việc chưa xác minh trong lần này

Chưa xác định bản thuyết minh được phê duyệt chính thức, hồ sơ khảo sát và thẩm định độc lập, tình trạng chấp nhận bài báo, chất lượng vận hành trên mạng thật và sự tiến bộ của học sinh. Các báo cáo kiểm thử cũ có phạm vi và thời điểm riêng; không tự coi chúng là kết quả kiểm thử mới.
