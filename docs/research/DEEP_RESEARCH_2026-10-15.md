# Đánh giá nghiên cứu học liệu Vật lí hạt nhân và kế hoạch phát triển

Ngày kiểm tra tài liệu, mã và nguồn tuyển sinh: **15/10/2026**. Báo cáo phục vụ quyết định nghiên cứu và xây dựng hồ sơ thạc sĩ tương lai; không phải quyết định nghiệm thu hay cam kết công bố.

**Năm câu trả lời trước khi đi vào chi tiết**

1. **Nghiên cứu hiện ở đâu?** Một bản mẫu có nhiều học liệu, được kiểm tra nội bộ, kèm bản thảo mô tả thiết kế trước sử dụng. Chưa có nghiên cứu người dùng hoặc bằng chứng tác động đến năng lực tự học.
2. **Điểm nghẽn lớn nhất?** Chưa biến mục tiêu giáo dục rộng thành một can thiệp nhỏ có đối chứng và công cụ đo phù hợp. Đăng nhập đang lỗi cũng ngăn kiểm chứng giao bài–nộp bài–giáo viên nhận bài.
3. **Giữ, sửa, dừng gì?** Giữ B23 làm trường hợp trọng tâm và giữ B21–B25 như tài sản đã phát triển. Sửa tài khoản, cách lưu bằng chứng, độ khớp bản thảo–mã và phạm vi tuyên bố. Tạm dừng thêm chatbot, 3D, trò chơi, câu hỏi và chương mới.
4. **Hướng đáng làm ngay?** Hướng A: hoàn thiện một gói B23 chạy được, truy nguyên được và kiểm chứng trước sử dụng. Hướng B có tiềm năng khoa học giáo dục cao hơn nhưng cần người học, người chấm và thủ tục; hiện chưa thể cam kết. A là bước chuẩn bị, chưa thay thế bằng chứng tác động của B.
5. **Bảy ngày tới cần bằng chứng gì?** Manifest phiên bản; biên bản tái hiện lỗi đăng nhập; ma trận yêu cầu–nhiệm vụ–sản phẩm B23; một lượt giao–nộp–nhận bằng dữ liệu giả nếu có môi trường thử; phép tính tham chiếu tái chạy được; bảng tuyên bố–bằng chứng của bài. Nếu tài khoản chưa kiểm tra được, ghi bị chặn và bàn giao demo công khai, không ghi đã đạt.

**1. Phạm vi đánh giá**

Đã đọc nội dung chính và 20 mục tham khảo của [bản thảo bài báo](/Users/vodoandangkhoi/Documents/WEB_WORKING_24-09/BAI_BAO_KHOA_HOC_CAP_NHAT_HOC_LIEU.docx), đối chiếu [thuyết minh đề tài](</Users/vodoandangkhoi/Documents/WEB_WORKING_24-09/ĐÃ SỬA - NCKH.docx>) và toàn bộ [hd.docx](/Users/vodoandangkhoi/Documents/WEB_WORKING_24-09/hd.docx). Bài báo được kết xuất lại thành 25 trang; số trang dưới đây theo lần kết xuất này. Đã xem trực quan các trang phương pháp, kiểm tra nội bộ và kết luận; chưa kiểm toán bố cục từng trang.

Đã đọc mã liên quan B23, bản ghi quan sát, ngân hàng đề, API ngân hàng, cấu hình phiên bản, xác thực và hồ sơ kiểm chứng trước. Đã chạy test hiện có, mở demo công khai và thay đổi một tham số B23. Chưa chạy lại production build, kiểm thử tài khoản, xác minh Supabase từ xa hoặc kiểm tra đầy đủ mọi hoạt động.

Người dùng xác nhận: chưa có dữ liệu thực tế; đăng nhập chưa sử dụng được; chưa có nơi tiếp cận giáo viên/học sinh; muốn làm nhanh để xây CV thạc sĩ; cộng sự theo thuyết minh; Antigravity dùng gói Pro. Khuyến nghị A dựa trên các điều kiện này.

Trong báo cáo: **quan sát** là điều đã đọc/chạy hoặc người dùng xác nhận; **phản biện** là diễn giải từ bằng chứng; **giả thuyết** là điều cần kiểm tra; **đề xuất** là công việc tương lai. Hồ sơ kiểm thử cũ được xem là tự báo cáo của lần trước, không phải ca đã chạy lại trong phiên này.

Không đọc được một nguồn không có nghĩa nguồn đó không tồn tại. Tìm kiếm dưới đây phục vụ quyết định, chưa phải systematic review có protocol và sàng lọc đầy đủ cơ sở dữ liệu.

**2. Chẩn đoán bản thảo và website**

**Bài toán thực sự.** Theo thuyết minh mục 10–12 và hd.docx, nhóm muốn tổ chức học Vật lí hạt nhân lớp 12 để học sinh chuẩn bị trước giờ, thảo luận/xử lí dữ liệu trên lớp và tự kiểm tra/điều chỉnh. Học liệu phải tạo ra sản phẩm thể hiện dự đoán, giải thích và sửa cách hiểu. Đây là bài toán thiết kế môi trường học và đánh giá quá trình học.

**Đối tượng và bối cảnh.** Giáo viên Vật lí và học sinh lớp 12, phạm vi B21–B25 của bộ Kết nối tri thức. Chưa xác nhận trường/lớp, thiết bị, lịch học hoặc người tham gia; chưa thể khái quát cho học sinh THPT nói chung.

**Câu hỏi và giả thuyết.** Bài báo mục 1, tr. 2, đặt hai câu hỏi mô tả: tổ chức học liệu/nhiệm vụ/sản phẩm ra sao và bản mẫu đã kiểm tra đến đâu. Thuyết minh mục 10 lại giả thuyết tác động: học liệu có AI kết hợp lớp đảo ngược có thể phát triển năng lực tự học. Bài báo có thể là báo cáo giai đoạn của đề tài rộng hơn, nhưng phải gọi đúng giai đoạn.

**Vai trò website.** Hiện là sản phẩm thiết kế, phương tiện triển khai học liệu và công cụ kiểm tra mô hình vật lí. Chưa xác nhận là nền tảng thu thập dữ liệu nghiên cứu qua tài khoản. Ở hướng B, nó sẽ là nền tảng thực nghiệm có điều kiện can thiệp và bộ ghi bằng chứng.

**Vai trò hd.docx.** Đây là brief sư phạm, chưa là protocol thực nghiệm. Tệp mô tả hai pha trước/trong giờ; pha sau giờ đến từ thuyết minh và bài báo. “Xử lí số liệu thực tế” cần sửa cách diễn giải khi bảng do mô hình sinh. Bản đồ tư duy nhóm/đóng vai/trò chơi trên một thiết bị không tự chứng minh đã có cộng tác nhiều người. Google Jamboard trong danh sách gợi ý đã kết thúc ngày 31/12/2024, cần cập nhật. [Thông báo Google](https://support.google.com/jamboard/answer/14084927?hl=en-GB).

| Hạng mục | Bằng chứng trong tài liệu/mã | Điểm mạnh | Thiếu sót | Mức ảnh hưởng | Cách sửa | Ưu tiên |
|---|---|---|---|---|---|---|
| Ý nghĩa vấn đề | Bài §1, tr. 1–2; hd pha 1–2 | Kiến thức khó quan sát, có nhiệm vụ định lượng | Chưa có phân tích nhu cầu/bài làm của nhóm đích | Cao | Chọn một khó khăn B23, xác nhận bằng nguồn và chuyên môn | P0 |
| RQ và mục tiêu | Bài §1, tr. 2; thuyết minh §10 | Bài nói rõ chỉ kiểm tra trước sử dụng | Mục tiêu phát triển năng lực rộng hơn câu hỏi đang trả lời | Rất cao | Tách bài thiết kế khỏi bài tác động; không trộn kết luận | P0 |
| Tính mới | Bài §4, tr. 23: thao tác–nhiệm vụ–bằng chứng | Có ý tưởng thiết kế có thể cụ thể hóa | Chưa xác lập cơ chế khác biệt; “chủ đề mới + AI” chưa đủ | Rất cao | Đối chiếu PET DLM, SRL prompts, dashboard/reflection | P0 |
| Related work | §1 và 20 tài liệu tham khảo | Có nền tảng SRL/lớp đảo ngược | Nhiều nguồn là SGK/video/hướng dẫn; thiếu can thiệp gần cơ chế | Cao | Thêm nguồn bảng tổng quan; tách kiến thức vật lí và bằng chứng hiệu quả | P1 |
| Phương pháp | §2.1–2.2, tr. 2–3 | Có ma trận nội dung–thao tác–sản phẩm | Chưa có vòng thiết kế dựa trên đánh giá độc lập | Cao | Ghi quyết định, căn cứ, lỗi, sửa đổi; chỉ gọi pha đã làm | P0 |
| Dữ liệu | §2.3, §3.3; người dùng xác nhận chưa có | Không báo số học sinh/kết quả giả | Chưa kiểm tra được giả thuyết giáo dục | Rất cao | Chỉ dùng dữ liệu giả cho QA; chuẩn bị protocol riêng | P0 |
| Tài khoản | Bảng 2, tr. 22–23; người dùng báo lỗi login | Có mã Auth/RPC và ca thử dự kiến | Chưa chứng minh giao–nộp–nhận | Rất cao khi dùng lớp | Tái hiện, kiểm tra DNS/config/Auth/session/vai/RLS trên dev | P0 |
| Bằng chứng tự học | §3.2.7, tr. 11; ObservationNotebook.tsx | Có dự đoán, quan sát, giải thích | localStorage ghi đè; ở đây chưa có chuỗi sửa đổi nghiên cứu | Cao | Giữ phiên bản trả lời, tham số, thời gian và trạng thái nộp | P0 |
| Dữ liệu bán rã | §3.2.4, tr. 8–9; decay-data.ts | Có nhãn giá trị kì vọng, CSV tham số | Tính ngược T từ công thức tự sinh chỉ là kiểm tra nhất quán; 3D/bảng có tham số riêng | Cao | Làm rõ nguồn/đơn vị; không gọi là xác nhận bằng số đo độc lập | P0 |
| Ngân hàng đề | §3.2.10, tr. 14–15: 213 câu | Có nguồn và loại câu chưa rõ | Hai tệp hiện có 212: 72 MCQ, 12 đúng–sai, 19 ngắn, 109 tự luận | Vừa về khoa học, cao về nhất quán | Chốt phiên bản và sinh thống kê tự động | P0 |
| Baseline | Thuyết minh §12.4 | Có ý định pre/post và đối chứng | Thay đồng thời AI/web/học liệu/lớp đảo ngược, khó quy nguyên nhân | Rất cao | Giữ cùng nội dung, mô phỏng, thời lượng; thay một cơ chế hướng dẫn | P0 trước thu dữ liệu |
| Mẫu/đơn vị | §10: 2 lớp; §12.4: 2+2 lớp | Có bối cảnh triển khai dự kiến | Mâu thuẫn số lớp, chưa tính mẫu/cụm | Rất cao | Chốt thiết kế trước; một lớp mỗi nhánh không tách lớp và can thiệp | P0 |
| Công cụ đo | §3.2.8, §3.2.11; §12.5 thuyết minh | Có rubric, ma trận, câu hỏi | Chưa thẩm định/độ đồng thuận; bài luyện công khai không là test kín | Rất cao | Tách luyện/đo, chấm mù, thẩm định rubric | P0 |
| Phân tích kết quả | §3.3, §4 | Thừa nhận giới hạn, có lịch sửa lỗi | Test kỹ thuật không đo giá trị sư phạm; chưa phân tích cơ chế | Cao | Báo đúng loại bằng chứng; phân tích tác động sau nghiên cứu tương ứng | P1 |
| Tái lập | Mã/test/log; working tree nhiều thay đổi | Bộ test có thể chạy | Chưa chốt mã+nội dung+dữ liệu+cấu hình đồng bộ | Cao | Manifest hash, lockfile, lệnh, kết quả thô và script tổng hợp | P0 |
| Giới hạn | §4, tr. 23–24 | Ghi thiếu người dùng, thẩm định, tải lớp | Chưa biến thành cổng quyết định | Vừa | Dùng G0–G5 ở cuối báo cáo | P1 |
| Trình bày | 25 trang, 24 hình, §3.2 có 13 tiểu mục | Hình minh họa cụ thể | Thiên về tour tính năng và lịch sửa lỗi | Cao khi gửi bài | Giữ 3–5 hình giải thích cơ chế; chuyển log sang phụ lục | P1 |
| Tiến độ/nguồn lực | 10/2026–4/2027; bảng có 12/2027→01/2027 | Có ba thành viên/phân công | Mốc trái thứ tự; 12 triệu là dự toán, chưa xác nhận được cấp | Cao | Chủ nhiệm/hướng dẫn xác nhận lịch, vai và ngân sách | P0 |

P0: xử lí trước bước phụ thuộc. P1: tăng giá trị khoa học/độ rõ. Không cộng thành điểm tổng hợp chất lượng.

**Kiểm tra trực tiếp trong phiên này**

- Phiên bản cài: Next.js 16.3.5, React 19.2.0, TypeScript 5.9.3. Đã đọc hướng dẫn authentication đi kèm Next.js.
- Lệnh node --import ./scripts/test-resolver.mjs --experimental-strip-types --test tests/*.test.ts: **62/62 đạt**, không bỏ qua ca. [Log mới](/Users/vodoandangkhoi/Documents/WEB_WORKING_24-09/tmp/deep-research-20261015/tests-20261015.log). Con số 61 trong bài thuộc lần chốt trước; cập nhật phải kèm ngày/phiên bản.
- Mở được /demo-lesson; đổi T từ 30 thành 60 s với N₀=1.000, giao diện hiện N(30 s)≈707,1. Chỉ xác nhận trường hợp này và trang công khai; chưa xác nhận mọi 3D, tải CSV hay tài khoản.
- src/data/unified-question-bank.json và data/book-bank/unified.json đều có 212 câu. Test hiện chủ động loại một câu có phương án trùng. API có thể đọc BOOK_BANK_DIR khác; chưa xác minh deployment từ xa.
- ObservationNotebook.tsx dòng 10–17 lưu localStorage và bản xuất ghi rõ chưa nộp lớp. Biểu mẫu điền được không phải hệ thu dữ liệu nghiên cứu đã kiểm chứng.

![Demo B23 đã mở và thay T thành 60 giây](/Users/vodoandangkhoi/Documents/WEB_WORKING_24-09/tmp/deep-research-20261015/b23-demo-verified.png)

**Mức sẵn sàng:** bản mẫu có kiểm tra nội bộ, kèm bản thảo thiết kế giai đoạn đầu. Có tài sản để viết lại báo cáo thiết kế/kiểm chứng trước sử dụng. Chưa đủ cơ sở cho bài khẳng định phát triển năng lực tự học. Khả năng gửi bài thiết kế cũng phụ thuộc đóng góp và đánh giá phù hợp, không suy ra từ số tính năng.

**3. Đối chiếu nghiên cứu quốc tế**

Tìm ngày 15/10/2026 theo ba trục: flipped classroom + SRL + prompts/reflection/dashboard; simulation/digital learning module + nuclear physics/decay/PET + secondary/high school; teacher preparation + feedback/GenAI + evaluation. Tìm thêm tên/DOI trong bản thảo và lần theo nguồn gần nhất. Ưu tiên 2024–2026, giữ nghiên cứu nền tảng cần thiết.

Chuỗi tái dùng: ("flipped classroom" OR "flipped learning") AND ("self-regulated learning" OR reflection) AND (prompt* OR scaffold* OR dashboard); ("radioactive decay" OR "nuclear physics" OR "positron emission tomography") AND (simulation OR "digital learning module") AND (learning OR education); (teacher AND "lesson preparation") AND (evaluation OR trial).

Chưa truy vấn đầy đủ Scopus/Web of Science; không báo số lượng sàng lọc giả. **TV**: đọc được toàn văn/phần phương pháp–kết quả gốc cần dùng. **TT**: abstract, xem trước hoặc metadata; không suy đoán chi tiết còn thiếu. Bài journal/proceedings là bản công bố; không đếm preprint của cùng bài thành nghiên cứu khác. Roy là báo cáo đánh giá gốc, không gọi là journal đã bình duyệt. Các tổng quan và nghiên cứu thành phần có thể trùng bằng chứng, không cộng mẫu.

| Công trình/năm | Bài toán | Phương pháp | Dữ liệu | Baseline và chỉ số | Kết quả liên quan | Hạn chế/phạm vi đọc | Quan hệ với đề tài | Nguồn |
|---|---|---|---|---|---|---|---|---|
| Chatzidaki et al., 2025, PET DLM | Nguyên tắc thiết kế học liệu vật lí | Phân tích thiết kế và phỏng vấn khi học | 9 HS Hy Lạp/Áo | Không đối chứng tác động; phân tích nội dung định tính | Rút nguyên tắc từ cách dùng mô-đun video/tương tác/mô phỏng | Định tính nhỏ; TT | Đối chiếu rất gần; A cần nguyên tắc và đánh giá, không chỉ tổ hợp phương tiện | [APS](https://journals.aps.org/prper/abstract/10.1103/PhysRevPhysEducRes.21.010143) |
| Liu, Hew & Du, 2024 | Hỗ trợ SRL trong lớp đảo ngược | Tổng quan theo Activity Theory | 22 nghiên cứu thực nghiệm | Các hỗ trợ; kết quả học và SRL | Kết quả hỗn hợp; cần hướng dẫn lẫn thực hành | Chỉ 2 nghiên cứu bậc trung học; tìm ban đầu năm 2021; TT | Cơ sở cơ chế, không chứng minh web này hiệu quả | [Elsevier](https://www.sciencedirect.com/science/article/pii/S0883035524000065) |
| Xia et al., 2026 | Thiết kế SRL dùng GenAI | Tổng quan | 73 bài | Phân loại khả năng/hoạt động, không baseline chung | Tìm thông tin, giải quyết vấn đề, phản hồi đã phổ biến | TT; chưa kiểm toán từng bài | Bỏ lập luận thêm GenAI tự thân là mới | [Elsevier](https://www.sciencedirect.com/science/article/abs/pii/S0360131525002337) |
| Geng & Su, 2025 | Quá trình SRL theo siêu nhận thức | Phân cụm và Epistemic Network Analysis | 44 SV, 18 tuần, 3 nhiệm vụ, nhật kí | So nhóm siêu nhận thức; mạng hành vi | Khác biệt cấu trúc/diễn tiến hành vi | Quan sát, không nhân quả; TT | Log phải gắn mã hóa/sản phẩm; sát learning analytics ở CCU | [Elsevier](https://www.sciencedirect.com/science/article/abs/pii/S0360131524002252) |
| Lee, Hwang & Chen, 2025 | Chatbot phản hồi hỗ trợ phản tư | Bán thực nghiệm, thiết kế web 8 tuần | Hai lớp: 23 và 24 SV | SRL thông thường; sản phẩm, bảng hỏi, phản tư | Nhóm hỗ trợ tốt hơn ở nhiều kết quả; sản phẩm đầu chưa khác, sản phẩm sau khác | Một lớp mỗi nhánh, mẫu nhỏ; TV | Chatbot+SRL đã có; không sao chép suy luận nhân quả mạnh từ 2 lớp | [Springer](https://link.springer.com/article/10.1007/s11423-025-10478-x) |
| Kestin et al., 2025 | AI tutor so active learning Vật lí | RCT đổi điều kiện qua 2 bài | 194 SV; N từng phép đo khác do thiếu dữ liệu | Active learning; pre/post, thời gian, cảm nhận | Tutor thiết kế sư phạm cho kết quả tốt hơn trong thử nghiệm | Ngắn hạn, đại học, khác Qwen cục bộ; TV | Mẫu đo học công bằng, không lý do tự động thêm AI | [Scientific Reports](https://www.nature.com/articles/s41598-025-97652-6) |
| Liao et al., 2025, DeepThinkingMap | Gợi phản tư khi xem video | Hai nghiên cứu lab | N=44 và N=52 | Có/không bình luận; concept map/Google Docs ở nghiên cứu 2; chỉ báo tư duy | Bình luận/cách tổ chức thông tin có thể thúc đẩy phản tư | Không lớp Vật lí 12; TV phần cần dùng | Cơ chế giao diện có thể là đối tượng nghiên cứu; liên hệ Cherng | [Bản công bố trên trang tác giả](https://jxliao6.github.io/files/publications/ThinkingNudge_CHI25.pdf) |
| Roy et al., 2024 | Công sức chuẩn bị bài GV | RCT theo trường, 10 tuần | 259 GV, 68 trường Anh | Không GenAI; thời gian, chất lượng tài nguyên | Tuần 6–10, thời gian nhóm ChatGPT bằng 69% đối chứng | Báo cáo, không journal; không thấy khác biệt chất lượng ≠ tương đương; TT | Muốn nói tiết kiệm công sức phải có GV và phép đo | [NFER](https://www.nfer.ac.uk/publications/chatgpt-in-lesson-preparation-a-teacher-choices-trial/) |
| Mai et al., 2024 | Học liệu Động lượng Vật lí 10, lớp đảo ngược | Xây dựng và sử dụng học liệu | Bối cảnh Việt Nam | Chưa trích đủ baseline/chỉ số từ toàn văn | Đã có hướng triển khai rất gần về môn/mô hình | Mới đối chiếu metadata/phạm vi; không chép N từ đề cương | Đổi lớp/chương/thêm AI chưa đủ khác biệt | [Tạp chí gốc](https://jst.tnu.edu.vn/jst/article/view/9209) |
| van Alten et al., 2020 | Hỗ trợ SRL trong video | Nghiên cứu lớp đảo ngược | 115 HS trung học, 8 tuần | Các điều kiện hỗ trợ; học, SRL tự báo cáo, hoạt động online, hài lòng | Học tăng nhưng không thấy hiệu ứng trên các chỉ số SRL/hài lòng báo cáo | Khác nội dung; TT | Tăng điểm không đồng nghĩa tăng năng lực tự học | [DOI](https://doi.org/10.1016/j.compedu.2020.104000) |
| Yoon, Hill & Kim, 2021 | Dashboard kết hợp phản tư | Xây nguyên tắc và nhóm so sánh | Lớp đảo ngược; N chưa xác minh toàn văn | Có/không hỗ trợ; SRL, engagement, learning performance | Abstract báo nhóm hỗ trợ cao hơn | TT, chưa đánh giá đầy đủ effect size | Phản tư+trace/dashboard là tiền lệ trực tiếp | [Springer](https://link.springer.com/article/10.1007/s12528-021-09269-z) |
| Lai & Hwang, 2016 | Lập kế hoạch học ngoài lớp | Bán thực nghiệm Toán tiểu học | HS tiểu học; N chưa trích toàn văn | Flipped thông thường; achievement, self-efficacy, SRL, log | Có cải thiện được báo cáo | Khác tuổi/môn; TT | B cần cùng flipped/mô phỏng, thay hỗ trợ | [Elsevier](https://www.sciencedirect.com/science/article/abs/pii/S0360131516301166) |
| van Alten et al., 2019 | Hiệu quả lớp đảo ngược | Meta-analysis | 114 nghiên cứu; 22 ở phân tích hài lòng | Flipped/non-flipped; học và hài lòng | Học có hiệu ứng nhỏ, dị biệt lớn; không hiệu ứng hài lòng chung | Không tách web cụ thể; TT | Không lấy hiệu ứng tổng hợp làm hiệu quả mặc định của web | [Elsevier](https://www.sciencedirect.com/science/article/pii/S1747938X18305694) |
| Lazonder & Harmsen, 2016 | Hướng dẫn khi học khám phá | Meta-analysis | 72 nghiên cứu | Mức hỗ trợ; hoạt động, thực hiện, kết quả học | Hiệu ứng học d=0,50; CI 95% [0,37;0,62] | Không dùng làm dự báo chắc chắn cho B23; TT | So loại/chất lượng hướng dẫn có cơ sở hơn chạy đua đồ họa | [AERA/SAGE](https://doi.org/10.3102/0034654315627366) |
| Rutten et al., 2012 | Mô phỏng trong giáo dục khoa học | Tổng quan thực/bán thực nghiệm | Nghiên cứu 2001–2010 | Nhiều đối chứng; quá trình/kết quả học | Trực quan tốt hơn không tất yếu học tốt hơn; bối cảnh/hướng dẫn quan trọng | Cũ; TT | Cơ sở dừng thêm 3D trước khi đo nhiệm vụ | [Elsevier](https://www.sciencedirect.com/science/article/pii/S0360131511001758) |

**Đã phổ biến:** đa phương tiện, mô phỏng có hướng dẫn, học trước–thảo luận trên lớp, mục tiêu/phản tư/dashboard, chatbot phản hồi. PET DLM cho thấy tổ hợp video–tương tác–mô phỏng ở nội dung liên quan hạt nhân cũng đã được đánh giá.

**Khác biệt quan sát được:** nhiệm vụ tiếng Việt B21–B25, bản ghi dự đoán–giải thích, công cụ phiếu/kế hoạch/xuất Word có nguồn. Đó là khác biệt triển khai theo bối cảnh; chưa có bằng chứng về cơ chế mới hoặc ưu thế so với workflow tương đương.

**Khoảng trống đáng kiểm tra, chưa xác lập:** tác dụng của quy trình B23 ghi dự đoán và sửa giải thích so với cùng mô phỏng/hướng dẫn thông thường, trên nhiệm vụ chuyển giao và bằng chứng quá trình của HS lớp 12 Việt Nam. [Liu et al.](https://www.sciencedirect.com/science/article/pii/S0883035524000065) chỉ ra kết quả SRL hỗn hợp; [van Alten et al., 2020](https://doi.org/10.1016/j.compedu.2020.104000) tách học và SRL; [PET DLM](https://journals.aps.org/prper/abstract/10.1103/PhysRevPhysEducRes.21.010143) cung cấp tiền lệ đánh giá thiết kế. Chúng hỗ trợ lý do kiểm tra cơ chế/phép đo trong bối cảnh cụ thể, không chứng minh “chưa ai làm”.

Trước tuyên bố mới cuối cùng: đọc toàn văn các bài gần nhất, mở rộng POE/half-life/nuclear education, xem bài trích dẫn PET DLM/Liu; tái tạo baseline cùng nội dung/thời lượng. Không cần tái hiện cả meta-analysis.

**Bỏ/hạ mức:** “đầu tiên”; “cá nhân hóa” khi chưa có mô hình người học; “đã phát triển năng lực”; “AI chính xác” từ vài lượt thử; “đề tương đương” vì đảo câu; “dữ liệu thực nghiệm” cho CSV công thức. Bản thảo hiện đã thận trọng ở kết luận; cần giữ điều đó khi viết lại tiêu đề/abstract.

**4. Ba hướng và lựa chọn**

**A. Gói B23 được kiểm chứng trước sử dụng — khuyến nghị hiện tại**

- Vấn đề/RQ: biến hd.docx thành chuỗi dự đoán–thao tác–giải thích–điều chỉnh có sản phẩm truy nguyên thế nào; đáp ứng tiêu chí nội dung/vận hành nào trước sử dụng?
- Mệnh đề kiểm tra: gói tối thiểu giữ nhất quán nhiệm vụ, tham số, sản phẩm và phản hồi qua một workflow. Đây là mệnh đề thiết kế/vận hành; chưa đặt giả thuyết tác động HS.
- Đóng góp dự kiến: đặc tả có căn cứ, trường hợp hiện thực hóa, hồ sơ lỗi/cải tiến, artifact tái lập. Công bố còn cần đánh giá độc lập và insight thiết kế; website chạy đúng tự thân chưa đủ khoa học.
- Website: sản phẩm nghiên cứu thiết kế và công cụ chuẩn bị thẩm định.
- Giữ/sửa/thêm/dừng: giữ B23 và nguồn; sửa lưu sản phẩm/tài khoản; thêm manifest/ma trận bằng chứng; dừng mở rộng tính năng. Giữ B21–B25 trong repo, không xóa công sức.
- Dữ liệu: fixture giả, tham số mô hình, nhận xét chuyên môn nếu có đồng thuận. Có bản SGK không mặc nhiên có quyền phát hành lại; kiểm tra quyền và tách tài nguyên hạn chế khỏi repo công khai.
- Đối chiếu: yêu cầu hd/chương trình, oracle tính toán độc lập, kiểm tra workflow và rubric nội dung. Không áp p-value/baseline tác động vào câu hỏi mô tả thiết kế.
- Nguồn lực: 7 ngày giảm bất định; khoảng 2–4 tuần nếu có 30–50 giờ công phát triển/biên tập và thời gian phản biện. Đây là ước lượng có điều kiện; chờ backend/chuyên gia có thể kéo dài.
- Phụ thuộc/rủi ro: môi trường Supabase, Auth, người kiểm tra chuyên môn và nguy cơ chỉ còn mô tả tính năng.
- Mức tối thiểu: workflow tái chạy, không còn lỗi kiến thức nghiêm trọng được phát hiện trong B23 đã xét, dữ liệu giữ nguồn/tham số/phiên bản. Nếu chưa có thẩm định thật, giữ nhãn nội bộ.
- Nếu không đạt: báo loại lỗi/điều kiện thất bại, sửa hoặc thu hẹp; chưa đưa vào lớp, không gọi có hiệu quả giáo dục.

**B. Kiểm chứng một cơ chế hướng dẫn B23 có đối chứng — bước khoa học tiếp theo**

- RQ: cùng mô phỏng/nội dung, ghi dự đoán trước thao tác và đối chiếu/sửa giải thích có cải thiện giải thích/chuyển giao hơn hướng dẫn thông thường?
- H1: điểm chuyển giao không dùng hỗ trợ cao hơn sau xét kiến thức đầu. H2 phụ: nhiều sửa đổi có căn cứ hơn; điền nhiều trường không tự là tự điều chỉnh tốt hơn.
- Đóng góp: đánh giá cơ chế giao diện–nhiệm vụ theo bối cảnh, sản phẩm mã hóa và artifact. Căn cứ từ Liu/van Alten/PET DLM; chưa chốt tính khác biệt bằng tìm kiếm hiện tại.
- Website: nền tảng giữ giống nội dung/đồ thị và thay hướng dẫn. Không cần chatbot.
- Giữ gói A; thêm hai cấu hình, test đo riêng, phiên bản trả lời/log. Không thêm can thiệp khác cùng lúc.
- Dữ liệu: pre/post/transfer, sản phẩm, đo trễ nếu phù hợp, log tối thiểu và phỏng vấn giải thích. Cần trường/lớp, đồng thuận và đơn vị phụ trách; hiện chưa có.
- Baseline: cùng mô phỏng với hướng dẫn thông thường, cùng thời lượng/nhiệm vụ nộp. Outcome chính: chuyển giao mới chấm mù. Click/thời gian là quá trình.
- Nguồn lực/thời gian: chỉ lập lịch 8–12 tuần sau khi có đường tiếp cận, thủ tục, lịch học, người chấm/công cụ. Không hứa xong từ hôm nay.
- Rủi ro: ít cụm, lan truyền giữa nhóm, khác GV, đề giống phiếu, hiệu ứng mới lạ, trần điểm và mất theo dõi.
- Mức tối thiểu: pilot cho thấy hiểu nhiệm vụ, dữ liệu đúng, rubric chấm được; mẫu có cơ sở và điều kiện triển khai đạt. Pilot nhỏ chưa chứng minh tác động.
- Nếu không hơn baseline: báo chênh lệch/CI; có thể cơ chế không hữu ích hoặc bất định lớn. Không đổi outcome chính sau kết quả; CI rộng là chưa xác định.

**C. Nếu không tiếp cận người học, đánh giá độ tin cậy gợi ý từ nguồn đã biên soạn**

- RQ: selector theo mã/dựng nguyên văn đang có đánh đổi độ đúng, phù hợp, bao phủ thế nào so với sinh tự do và quy tắc không AI?
- H1: dựng từ nguồn giảm thay đổi dữ kiện/kí hiệu so với sinh tự do. H2: có thể giảm bao phủ hoặc chọn hỗ trợ sai. Không mặc định LLM cần thiết.
- Đóng góp: bộ trường hợp có nguồn, phân loại lỗi và đánh giá đánh đổi trên máy nhỏ. Chưa xác lập thuật toán mới; ít câu minh họa sẽ chưa đủ cơ sở công bố.
- Website: demo; pipeline đánh giá độc lập để tách lỗi UI khỏi lỗi chọn.
- Giữ selector/nguồn; thêm tập giữ kín, log và baseline quy tắc; dừng mở rộng chatbot chung/tuyên bố tác động học.
- Dữ liệu: câu hỏi nhóm biên soạn, trường hợp biên/ngoài phạm vi và lỗi đã ghi; nguồn có quyền; nhãn phù hợp cần chuyên môn. Không dùng dữ liệu riêng của HS.
- Baseline B0 quy tắc không AI; B1 Qwen sinh tự do cùng ngữ cảnh; B2 selector hiện tại. Giữ model/nguồn/tài nguyên tương đương. Đo riêng lỗi dữ kiện, phù hợp, bao phủ/từ chối, latency/bộ nhớ.
- Nguồn lực: 4–8 tuần tùy tập chuẩn/thẩm định; ghim cấu hình máy, đo pilot trước đặt số lượt. Không cần huấn luyện model lớn.
- Rủi ro: nhãn do người thiết kế tạo, câu gần trùng giữa dev/test, “văn bản đúng nhưng chọn sai”, tập dễ thiên vị selector.
- Mức tối thiểu: gold set độc lập/giữ kín đủ phát hiện đánh đổi; chưa có chuyên môn thì chỉ báo bất biến kỹ thuật.
- Nếu B2 không hơn B0: ưu tiên quy tắc và bỏ phụ thuộc runtime AI khỏi luồng chính. Thắng B1 nhưng thua B0 không là lý do quảng bá AI.

| Tiêu chí | A | B | C |
|---|---|---|---|
| Giá trị khoa học | Hạn chế nếu chỉ QA; tăng khi có nguyên tắc/đánh giá độc lập | Cao hơn về câu hỏi giáo dục nếu đo/đối chứng đúng | Có thể rõ về reliability; tính mới phương pháp chưa chốt |
| Khả thi hiện tại | Cao nhất để bắt đầu | Thấp trước khi có nơi nghiên cứu | Không cần HS, vẫn cần chuẩn nội dung |
| Tái lập | Thuận lợi với fixture/nguồn rõ | Cần protocol/rubric/dữ liệu người tham gia | Thuận lợi nếu ghim model/dữ liệu/nguồn |
| Liên hệ CSIE/HCI | Artifact+lập luận thiết kế, cần chứng minh hiểu kỹ thuật | HCI/learning analytics nếu phân tích cơ chế | AI/software reliability, cần B0 mạnh |
| Quyết định | Làm trước | Chuẩn bị, chưa thu mẫu | Đường rẽ, không khởi động đồng thời |

Không chấm điểm khi chưa có giờ/đường tiếp cận mẫu. Ưu tiên điều kiện triển khai, sau đó chất lượng câu hỏi/bằng chứng, rồi liên hệ CV. **Cam kết A ngắn hạn; xem xét B ở tuần 3–4.** Nếu mục tiêu cuối là bài tác động quốc tế, A chưa thay thế B.

Tên bài có thể đổi thành “Thiết kế và kiểm chứng trước sử dụng một môi trường học liệu số cho chủ đề Vật lí hạt nhân lớp 12”, phân tích sâu B23; nếu chỉ báo B23 thì đổi phạm vi tên theo đó. Điều chỉnh tên/mục tiêu đề tài cấp trường cần thống nhất với hướng dẫn; bài báo giai đoạn không tự sửa đề tài gốc.

**5. Thiết kế bằng chứng**

**5.1. Hướng A**

Đơn vị phân tích là nhiệm vụ, sản phẩm dự kiến, trường hợp tham số và lượt workflow; không phải số nút/ảnh/dòng mã. Biến kiểm tra kỹ thuật gồm thiết bị/trình duyệt, tham số T/N₀, cấu hình bài, mạng, vai tài khoản và phiên bản dữ liệu. Kết quả là đúng nội dung/phép tính, lưu đúng, truy nguyên đúng, phân quyền và lỗi. Nhận xét chuyên môn là lớp bằng chứng riêng.

Đối chiếu B23 với phép tính tham chiếu được triển khai độc lập, kiểm tra N(0)=N₀, N(T)=N₀/2, t tăng thì N không tăng, cùng t/T thì N/N₀ giống nhau. Đây là kiểm chứng hiện thực hóa mô hình, không kiểm tra định luật tự nhiên bằng thực nghiệm và không đo hiệu quả học.

Không cần thêm mô phỏng ngẫu nhiên chỉ để có dữ liệu “giống thật”. Chỉ bổ sung khi câu hỏi học đòi phân biệt số đếm ngẫu nhiên và kì vọng; phải kiểm chứng mô hình/seed/đơn vị/cách diễn giải. Không gắn nhiễu tùy ý rồi gọi số đo.

Tiêu chí kỹ thuật đặt trước: không còn lỗi kiến thức nghiêm trọng được phát hiện trong phạm vi B23 đã rà; mọi ca trọng yếu về tham số, xuất/lưu, phân quyền phải đạt; ca chưa chạy ghi chưa kiểm chứng. Tỉ lệ đạt test không là độ chính xác sư phạm trên toàn tình huống.

Nếu có thẩm định, chọn người có chuyên môn Vật lí/dạy học/phương pháp phù hợp, mô tả quan hệ với nhóm và lấy nhận xét độc lập trước thống nhất. Ghi lỗi và quyết định sửa. Chưa có cơ sở đặt một số chuyên gia rồi coi đại diện quần thể. Thẩm định nội dung không thay dữ liệu HS về học tập.

**5.2. Protocol B để chuẩn bị, chưa thực hiện**

- **Đơn vị:** người học đối với bài chuyển giao; lớp/GV là cụm nếu phân nhóm theo lớp; sản phẩm là phép đo lặp trong HS. Một trăm event của một HS không phải một trăm HS.
- **Can thiệp:** ghi dự đoán trước thao tác, đối chiếu dữ kiện và sửa giải thích; đối chứng dùng hướng dẫn thông thường trên cùng mô phỏng. Nếu thay nhiều yếu tố, kết luận cho cả gói, không tách tác động riêng từng nút.
- **Gây nhiễu:** kiến thức trước, đọc đồ thị, kỹ năng số, GV, thời lượng, thiết bị/mạng, động lực, hỗ trợ ngoài, trao đổi chéo và bài tập khác giữa các mốc đo.
- **Baseline công bằng:** cùng kiến thức/mô phỏng/thời lượng/GV/số nhiệm vụ/yêu cầu nộp. Đối chứng vẫn đủ hướng dẫn thao tác. Giới hạn AI ở cả hai nhánh nếu AI không là biến nghiên cứu.
- **Phân nhóm:** có thể ngẫu nhiên trong lớp ở phiên cá nhân có giám sát/giảm trao đổi; ghi phân tầng kiến thức đầu nếu dùng. Phân theo lớp phải tính cụm. Một lớp mỗi nhánh làm hiệu ứng lớp trùng điều kiện; bốn lớp vẫn rất ít cho suy luận cụm. Có thể phải gọi pilot.
- **Ngăn rò rỉ:** tách luyện công khai và test đo; đổi dữ kiện/bài chuyển giao, giữ test kín; người chấm không thấy nhánh; không dùng tập pilot chỉnh rubric làm tập đánh giá chính. Nếu huấn luyện mô hình, tách theo HS/lớp trước điều chỉnh, không chia event ngẫu nhiên.
- **Outcome chính:** điểm giải thích/chuyển giao bài mới, chấm mù theo rubric và làm không dùng hỗ trợ. **Phụ:** kiến thức, sửa lập luận có căn cứ, calibration tự tin–đúng/sai, hoàn thành, thời gian. Một buổi B23 chưa xác lập năng lực tự học bền vững.
- **Rubric:** tách đúng khái niệm, dùng dữ kiện, lập luận và nhận ra/sửa sai. Thử chấm độc lập, báo weighted kappa cho mức thứ bậc hoặc ICC phù hợp cho điểm liên tục, kèm CI và xử lí bất đồng. Alpha cao của bảng hỏi không tự xác nhận giá trị cấu trúc.
- **Cỡ mẫu:** xác định chênh lệch nhỏ nhất đáng quan tâm với hướng dẫn; lấy SD, tương quan pre/post, mất theo dõi, số cụm và ICC từ pilot/nguồn gần. Tính power hoặc độ chính xác CI theo thiết kế thật. Nếu mẫu cố định, báo sensitivity/minimum detectable effect, không bịa N=30/60/100 là đủ. [Lakens, 2022](https://online.ucpress.edu/collabra/article/8/1/33267/120491/Sample-Size-Justification).
- **Số lần/ngẫu nhiên:** nghiên cứu người học không “chạy 5 seed rồi lấy trung bình”. Lưu seed phân nhóm nếu dùng và danh sách phân bổ riêng; mỗi người theo protocol. Với pipeline stochastic/LLM của C, số lần dựa trên biến thiên pilot và mục tiêu CI/chi phí; dùng cùng tập trường hợp/config tương đương giữa baseline.
- **Phân tích:** báo phân bố, thiếu dữ liệu, chênh lệch điều chỉnh kiến thức đầu, CI 95% và effect size phù hợp. Điều chỉnh lớp/HS theo thiết kế; cluster-robust SE không chữa được việc chỉ có vài lớp. Chốt phân tích chính trước; ghi phụ/thăm dò và xử lí nhiều so sánh nếu suy luận.
- **Thời gian:** thiết kế thời lượng tương đương từ đầu. Nếu can thiệp làm HS dành thêm thời gian, không tự điều chỉnh hết biến sau can thiệp rồi gọi đó là tổng tác động; phân tích cơ chế cần giả định riêng.
- **Ablation:** nghiên cứu đầu chưa cần nhiều nhánh. Khi đủ mẫu mới tách ghi dự đoán và gợi đối chiếu. Phân tích lỗi/sản phẩm lúc đầu giúp hình thành giả thuyết, chưa chứng minh trung gian nhân quả.
- **Độ bền:** xem lỗi theo nhiệm vụ, kiến thức đầu, thiết bị/mất mạng nếu đủ dữ liệu; phân nhóm nhỏ ghi thăm dò. Một bài/một trường/thời gian ngắn giới hạn khái quát.
- **Kết quả âm:** CI rộng là chưa rõ, không là tương đương. Muốn tương đương/không kém cần biên đặt trước và thiết kế riêng. Không bỏ ca bất lợi hoặc đổi outcome chính.

**Người tham gia và dữ liệu.** Trước tuyển mẫu, hướng dẫn và đơn vị có thẩm quyền phải kiểm tra yêu cầu xét duyệt đạo đức, cho phép của trường/lớp, đồng thuận người giám hộ và sự đồng ý của HS chưa thành niên. Đây là danh mục cần xác minh, không phải khẳng định một quy trình cụ thể đã được miễn/chấp thuận. Tách tham gia khỏi điểm học, có quyền từ chối/rút lui không bất lợi. Nêu quyền truy cập, thời hạn lưu, thời điểm còn có thể rút dữ liệu, xử lí sự cố và dịch vụ ngoài. Không dùng AI đóng vai HS/GV làm mẫu nghiên cứu.

Log tối thiểu đề xuất: participant_code ngẫu nhiên, session_id, task_id, condition, content/app_version, event_name/sequence, thời điểm client/server, T/N₀, observation snapshot, response_version. Bài viết tự do lưu riêng có kiểm soát vì có thể chứa thông tin riêng. Không ghi từng phím, mật khẩu, cookie, email/IP vào bộ dữ liệu nghiên cứu. Khóa danh tính để riêng; trước công bố phải kiểm tra nhận diện lại, không chỉ xóa tên.

| Tuyên bố trong bài/dự kiến | Bằng chứng cần có | Thí nghiệm/kiểm tra | Dữ liệu | Tiêu chí đánh giá |
|---|---|---|---|---|
| Hiện thực hóa tiến trình B23 | Mapping và workflow hoàn chỉnh | A: đi qua nhiệm vụ/sản phẩm/phản hồi | Cấu hình, ảnh/log, bài giả | Không đứt bước trọng yếu; chưa chạy ghi rõ |
| Phép tính đúng trong phạm vi xét | Oracle độc lập và trường hợp biên | A: so số/đơn vị/bất biến | Tham số, output thô, sai số | Dung sai đặt trước theo công thức/định dạng |
| Nộp bài và GV nhận được | Lưu hai vai, giữ sau tải lại | A: tài khoản giả, từ chối truy cập chéo | ID giả/trạng thái/query đúng quyền | Có lưu thật; sai vai/lớp bị từ chối |
| Nội dung phù hợp mục tiêu | Thẩm định có quy trình | A: rà nhiệm vụ/rubric/nguồn | Phiếu nhận xét, lịch sửa | Không còn lỗi nghiêm trọng nhận diện; báo bất đồng |
| Hướng dẫn tăng chuyển giao | Đối chứng/test độc lập | B: phân bổ trước, pre/post/transfer | Bài chấm mù/kiến thức đầu | Outcome/chênh lệch có ý nghĩa giáo dục đặt trước; CI |
| Phát triển năng lực tự học | Phép đo hợp lệ qua thời gian/tình huống | B mở rộng, không suy từ 1 buổi | Sản phẩm + thang đo phù hợp + phỏng vấn | Hội tụ bằng chứng, độ tin cậy/giá trị, giới hạn |
| AI giữ dữ kiện hơn sinh tự do | Cùng gold set/nguồn và B0 không AI | C: B0/B1/B2, tập kín | Input/config/output/nhãn | Báo riêng dữ kiện và chất lượng chọn; CI phù hợp |
| Ngân hàng có 213 câu | Đếm dữ liệu cùng phiên bản | A: runtime/fallback | Hiện cả hai là 212 | Sửa văn bản theo manifest, không sửa dữ liệu cho khớp bài |

**6. Backlog cùng Antigravity**

Metadata máy cho thấy **/Applications/Antigravity.app**, bundle **com.google.antigravity**, phiên bản **2.23.1**. Người dùng xác nhận Pro; chưa kiểm tra tài khoản/model/quyền phiên đang dùng. Google mô tả nhiều giao diện Antigravity, khả năng editor/terminal/browser và sandbox/quyền theo cấu hình. Cài ứng dụng/gói Pro không chứng minh agent hiện đã mở được repo, chạy lệnh/mạng/trình duyệt. [Tổng quan](https://www.antigravity.google/docs/home/), [IDE](https://www.antigravity.google/docs/ide/overview/), [sandbox](https://www.antigravity.google/docs/sandbox-mode).

Phiên đầu phải xác nhận đọc đúng repo, hướng dẫn, dependencies, chạy lệnh/test và browser nếu cần. Thiếu khả năng nào thì bàn giao lệnh/đường dẫn và ghi chưa thực hiện. Chưa có lý do mua thêm công cụ hay thay quyền hệ thống.

| ID/thứ tự | Mục tiêu nghiên cứu | Thay đổi/sản phẩm bàn giao | Dữ liệu/log và bảo vệ | Nghiệm thu | Xác minh | Phụ thuộc |
|---|---|---|---|---|---|---|
| R0 | Chốt bản đang đánh giá | Manifest working tree/framework/dữ liệu/lệnh | Hash/version, không env values | Xác định mã và nội dung tương ứng bài | Tạo lại manifest, test hiện có | Không |
| R1 | Trường hợp B23 rõ | RQ/khó khăn/nhiệm vụ/sản phẩm/tiêu chí 1 trang | Ma trận có nguồn | Mỗi nhiệm vụ có sản phẩm/tiêu chí | Đối chiếu hd/chương trình | R0 |
| R2 | Mở đường workflow | Chẩn đoán/sửa tối thiểu Auth/session/role trên dev xác định | Mã lỗi, không token/password | Tài khoản giả login/logout/giữ phiên/đúng vai | Tái hiện trước/sau, không chỉ HTTP 200 | R0, quyền môi trường |
| R3 | Giao–nộp–nhận | Một nhiệm vụ B23, không xây lại LMS | Dữ liệu giả/ownership | Giữ sau reload; sai lớp/vai bị từ chối máy chủ | Ca DB01–DB08 thích hợp từ hồ sơ | R1,R2, schema/RLS |
| R4 | Truy nguyên sản phẩm | response_version, mốc/snapshot tham số, JSON/CSV schema | Mã giả, free text riêng; chưa thu thật | Tách bản đầu/bản sửa, xuất đúng phiên bản | Round-trip fixture, mất mạng/nộp lại | R1; R3 nếu nộp tài khoản |
| R5 | Đúng mô hình | Pipeline tham chiếu B23/nguồn dữ liệu | T,N₀,version, loại mô hình/đo | Đúng số/đơn vị trong tập đã định | Oracle độc lập/bất biến | R1 |
| R6 | Bài khớp artifact | Inventory/claim–evidence tự sinh một phần | Path/hash, không PII | Giải quyết 212/213, 61/62 theo mốc | Đếm và đối chiếu tuyên bố | R0,R5 |
| R7 | Đánh giá ngoài nhóm | Gói thẩm định/nhận xét/lịch sửa | Đồng thuận, vai trò rõ | Tách người thật/AI; xử lí lỗi trọng yếu | Người chuyên môn chạy/đọc nguồn | R1,R3–R6 phù hợp; tiếp cận chuyên môn |
| R8 | Chuẩn bị tác động | Protocol B, 2 điều kiện, công cụ đo | Tập đo kín, pilot riêng | Hướng dẫn rà; có mẫu/thủ tục/cỡ mẫu | Review và pilot hợp lệ | Cổng chọn B |
| R9 | Hồ sơ có thể kiểm tra | README/demo/bài viết lại/báo cáo đóng góp | Loại secret/PII/tài nguyên hạn chế quyền | Người khác lần theo claim và chạy phần công bố | Môi trường sạch phù hợp, ghi dịch vụ riêng | R0–R7 theo phạm vi |

R4 có thể dùng xuất–nhập dữ liệu giả trước khi toàn LMS hoàn tất, nhưng phải gọi đường dùng thử công khai. Không biến nó thành tuyên bố lớp đã hoạt động. R2/R3 chưa có môi trường hợp lệ thì dừng ở chẩn đoán, không áp migration vào dự án chưa xác định. Nguyên nhân login chưa kết luận; ENOTFOUND lịch sử không chứng minh thiếu bảng/sai mật khẩu.

**Phân trách nhiệm.** Công cụ hỗ trợ đọc mã, sửa hạng mục nhỏ, chạy test, fixture, script và đối chiếu kết quả thật. Tác giả chịu trách nhiệm RQ, đóng góp, outcome, tiêu chí, kiến thức/nguồn, đạo đức và kết luận. Login/lưu/nộp/độ đúng nội dung/công cụ đo/hiệu quả học đều cần loại kiểm chứng tương ứng; lời kể agent không thay kết quả.

**Năm prompt dùng trực tiếp**

**Prompt 1 — khảo sát repo**

~~~text
Khảo sát /Users/vodoandangkhoi/Documents/WEB_WORKING_24-09 để chuẩn bị nghiên cứu. Đọc AGENTS.md và hướng dẫn thư mục áp dụng. Xác minh package.json, lockfile và phiên bản thực cài. Trước sửa Next.js phải đọc guide liên quan trong node_modules/next/dist/docs/. Giữ thay đổi chưa commit; không reset/clean.

Xác nhận khả năng thực tế của phiên Antigravity: đọc repo, ghi tệp nhỏ trong tmp nếu cần, terminal/test và browser nếu có. Không giả định Pro cấp mọi quyền. Không in secret hay gửi dữ liệu riêng ra ngoài.

Đọc hd.docx, ĐÃ SỬA - NCKH.docx và BAI_BAO_KHOA_HOC_CAP_NHAT_HOC_LIEU.docx bằng công cụ sẵn có; không đọc được thì báo rõ. Dựa trên mã thật, lập bản đồ B23, Auth, giao–nộp, bản ghi, ngân hàng và tests. Tái hiện login chỉ trên môi trường thử xác định; không tạo tài khoản/chạy migration trên dự án chưa xác minh.

Bàn giao bảng chức năng | file | lưu ở đâu | bằng chứng đã chạy | chưa kiểm chứng | điểm chặn. Chỉ chẩn đoán; chưa thêm tính năng hay viết kết quả giáo dục.
~~~

**Prompt 2 — lập kế hoạch phục vụ câu hỏi nghiên cứu**

~~~text
Đọc AGENTS.md/hướng dẫn áp dụng; xác minh framework/version từ mã thực cài và đọc tài liệu trong node_modules/next/dist/docs/ trước đề xuất sửa Next.js. Dựa trên mã thật và hiện trạng, lập kế hoạch hướng A cho một chuỗi B23: dự đoán → quan sát → giải thích → sửa giải thích → GV xem sản phẩm trên dev nếu khả dụng.

Lấy hd.docx làm brief sư phạm, không coi là protocol hay bằng chứng hiệu quả. Mỗi hạng mục có RQ/tuyên bố phục vụ, file sửa, dữ liệu lưu, nghiệm thu, cách kiểm chứng, phụ thuộc và khoảng giờ. Tái sử dụng; không thêm chatbot/3D/ngân hàng. Tách localStorage, file xuất và bài nộp tài khoản.

Đề xuất schema tối thiểu: mã giả, task/version, tham số, bản trả lời đầu/bản sửa; nêu quyền truy cập và thời hạn lưu nhóm phải quyết định. Dùng fixture giả. Tách việc công cụ làm được, quyết định khoa học của tác giả và kết quả cần chạy mới biết. Không tự đặt số người hay kết luận tác động. Ghi phần chưa kiểm chứng và cổng dừng/tiếp tục.
~~~

**Prompt 3 — triển khai hạng mục nhỏ**

~~~text
Đọc AGENTS.md/hướng dẫn thư mục, xác minh Next.js/React/TypeScript thực cài và guide liên quan trong node_modules/next/dist/docs/. Kiểm tra working tree, giữ thay đổi sẵn có. Dựa trên mã thật, triển khai đúng một hạng mục: xuất gói bằng chứng B23 từ cấu trúc bản ghi hiện có. Dùng dữ liệu giả; nêu phạm vi/file tối thiểu trước sửa.

Gói phải phân biệt dự đoán đầu và bản sửa nếu đã lưu được, kèm task_id, schema_version, content/app_version, T,N₀ tại quan sát, nguồn mô hình và trạng thái chỉ lưu cục bộ/chưa nộp nếu đúng. Nếu chưa giữ bản đầu/snapshot thì bổ sung tối thiểu hoặc báo thiếu; không tạo dữ liệu lịch sử tưởng tượng.

Nghiệm thu: fixture xuất/đọc lại không đổi thông tin, không secret/định danh, không mất bản ghi, không báo nộp giả. Chạy kiểm tra các bất biến và UI nếu có browser. Không chạy migration từ xa. Bàn giao diff, lệnh/kết quả thật, rủi ro và phần chưa kiểm chứng; không tuyên bố tăng tự học.
~~~

**Prompt 4 — pipeline thí nghiệm tái lập**

~~~text
Đọc AGENTS.md/hướng dẫn repo, xác minh framework/runtime thực tế và guide trong node_modules/next/dist/docs/ nếu chạm mã Next.js. Xây pipeline kiểm chứng kỹ thuật B23 cho hướng A, không phải nghiên cứu tác động HS.

Dựa trên decay-data.ts, UI và test thật, đặt trước trường hợp, oracle độc lập, dung sai và tiêu chí. Kiểm tra N(0), N(T), N/N₀, đơn vị, làm tròn, nguồn mô hình và cấu trúc gói xuất. Không gọi lại chính hàm đang kiểm tra để làm oracle.

Mỗi run lưu run_id, thời điểm, commit cùng manifest thay đổi chưa commit, lockfile/data hash, runtime/command/config, raw results và script tổng hợp. Có ngẫu nhiên thật thì lưu seed; không thêm seed vô nghĩa vào phép tính xác định. Gắn nhãn fixture giả tách khỏi dữ liệu nghiên cứu tương lai. Chạy thật nếu có quyền; chưa chạy ghi NOT_RUN, giữ thất bại. Không tạo điểm HS, p-value hoặc bảng thuận lợi. Bàn giao lệnh tái chạy/giới hạn.
~~~

**Prompt 5 — kiểm toán mã, dữ liệu và tuyên bố**

~~~text
Đọc AGENTS.md/hướng dẫn áp dụng, xác minh framework/version thực cài; đọc guide trong node_modules/next/dist/docs/ trước sửa mã. Dựa trên tệp thật, kiểm toán hai bản thảo, hd.docx, mã, dữ liệu và run logs.

Lập bảng tuyên bố | mục/trang/đoạn | phiên bản | mã/dữ liệu/nguồn | đã tái chạy hay chỉ đọc log | mức hỗ trợ | sửa đề xuất. Kiểm tra số câu runtime/fallback, số test theo ngày, nguồn CSV, local so với nộp tài khoản, AI, rubric chưa kiểm định, số lớp/lịch. Không chỉnh dữ liệu cho khớp bài.

Tách quan sát, phản biện, giả thuyết và đề xuất. Không truy cập được không là không tồn tại. AI đóng vai GV không là thẩm định thật; test pass không là hiệu quả tự học. Nguồn chưa đọc đủ phải ghi phạm vi, không bịa DOI. Báo mâu thuẫn và ảnh hưởng kết luận. Trước mắt đề xuất sửa bài; nếu được giao sửa Word thì sao lưu và render kiểm tra. Không viết kết luận trước kết quả.
~~~

**7. Định hướng thạc sĩ CCU Taiwan**

Nguồn chính thức xác nhận **National Chung Cheng University, 國立中正大學**, có Department of Computer Science and Information Engineering (CSIE). Bạn xác nhận muốn thạc sĩ nhưng chưa chốt chương trình, intake/ngôn ngữ; CSIE là ứng viên để định hướng, chưa là lựa chọn đã xác nhận. Không dùng tài liệu NCKU/National Cheng Kung hoặc NCHU/National Chung Hsing thay CCU. [Khoa CSIE](https://cs.ccu.edu.tw/?Lang=en).

**Kiểm tra ngày 15/10/2026:** đã tải và đọc phần liên quan của giản chương 2026 Fall/2027 Spring, PDF 495 trang: trang PDF 6–7 về văn bằng/bảng điểm, 290–293 về CSIE thạc sĩ, trang 3 về lịch. Đã xem ảnh trang bảng CSIE và lịch, không chỉ đọc kết quả tìm kiếm. [Giản chương chính thức, phần CSIE](https://oia.ccu.edu.tw/var/file/8/1008/img/814/372680683.pdf#page=290).

| Nội dung | Theo giản chương đang đọc | Ý nghĩa với kế hoạch |
|---|---|---|
| Bằng cấp | Thạc sĩ cần bằng cử nhân; người sắp tốt nghiệp nộp chứng nhận dự kiến theo hướng dẫn | Xây hồ sơ tương lai, cần biết năm tốt nghiệp |
| Ngôn ngữ | CSIE Master: tiếng Trung và Anh; đủ học phần tiếng Anh đáp ứng tín chỉ tốt nghiệp | Không tự gọi mọi lớp/lab là hoàn toàn tiếng Anh |
| Chứng chỉ | Tiếng Anh CEFR B1 trở lên | Kiểm tra loại chứng chỉ/quy đổi trong đúng kỳ sẽ nộp |
| Hồ sơ | Văn bằng, bảng điểm/thang điểm, tài chính, 2 thư giới thiệu, SOP, quốc tịch, ngoại ngữ và giấy tờ theo hướng dẫn | Repo/bài báo không thay yêu cầu nền |
| Bổ sung khoa | Tự truyện Trung/Anh, xếp hạng hoặc tài liệu hỗ trợ | Research statement và báo cáo có thể giải thích năng lực |
| Tài chính | Sao kê trong 3 tháng, ít nhất USD 3.000 ở mục CSIE | Cần kiểm tra lại kỳ tương lai |
| Hướng dẫn | Khuyến khích liên hệ và có xác nhận quan tâm của ít nhất một giáo sư | Không tự đổi thành thư nhận bắt buộc cho mọi kỳ |
| Học bổng | Có mục miễn học/phí và chỗ ở cho SV quốc tế; loại trừ chi phí sinh hoạt được liệt kê | Không đồng nghĩa tự động được cấp; kiểm tra xét/duy trì riêng |

Các mục trên dựa trực tiếp vào [PDF năm 2026/2027, tr. 290](https://oia.ccu.edu.tw/var/file/8/1008/img/814/372680683.pdf#page=290); điều kiện văn bằng ở [tr. 6](https://oia.ccu.edu.tw/var/file/8/1008/img/814/372680683.pdf#page=6). Đây là yêu cầu chính thức hiện đọc, không phải dự báo năm bạn tốt nghiệp.

Trang OIA giới thiệu cũ ghi đa số môn tiếng Trung, TOEFL iBT 42 và “Scholarship: None”, khác PDF có năm vừa đọc. Ưu tiên giản chương có năm; khi nộp phải kiểm tra bản mới/đính chính và xác nhận với khoa nếu xung đột. [Trang OIA để đối chiếu](https://oia.ccu.edu.tw/p/412-1008-1829.php?Lang=en).

Lịch trong giản chương hiện: Spring mở 15/8, hạn 30/9, kết quả 25/11. Không dùng lịch này ép bạn nộp ngay hoặc suy ra intake tương lai. Bạn đang học SGU, cần xây nền học thuật và nghiên cứu có thể kiểm tra trước. [Lịch chính thức trong PDF, tr. 3](https://oia.ccu.edu.tw/var/file/8/1008/img/814/372680683.pdf#page=3).

Hồ sơ đề tài ghi ngành Sư phạm Vật lí. Nếu chuyển sang CSIE, nên chứng minh lập trình, cấu trúc dữ liệu/thuật toán, thống kê, kiến thức hệ thống và khả năng tự giải thích mã. Đây là **lời khuyên cải thiện hồ sơ**, không phải danh sách môn bổ sung bắt buộc CCU đã xác nhận; điều kiện nhận ứng viên khác ngành còn phải kiểm tra theo chương trình/kỳ cụ thể.

**Ba mối liên hệ học thuật, không là xác nhận đang tuyển**

| Giáo sư/lab | Công trình/dự án làm căn cứ | Đánh giá phù hợp và giới hạn | Minh chứng nên xây |
|---|---|---|---|
| **Fu-Yin Cherng — Cognition and User Technology Lab** | Đồng tác giả DeepThinkingMap, CHI 2025, DOI 10.1145/3706598.3713426; [hồ sơ CCU](https://publication.ccu.edu.tw/user/385/research?Scopu=3), [bài gốc](https://jxliao6.github.io/files/publications/ThinkingNudge_CHI25.pdf) | Phù hợp rõ với cơ chế giao diện/phản tư/đánh giá người dùng; không riêng bán rã | RQ HCI, hai thiết kế so sánh, task protocol và phân tích sản phẩm |
| **Yu-Sheng Su — Advanced Information Technology Lab** | Geng & Su 2025: siêu nhận thức/SRL, 44 SV/18 tuần; [bài](https://www.sciencedirect.com/science/article/abs/pii/S0360131524002252), [nhân sự khoa](https://cs.ccu.edu.tw/p/404-1094-6502.php?Lang=en) | Phù hợp learning analytics khi có dữ liệu/mã hóa; không cần chạy ENA chỉ vì lab dùng ENA | Schema log, codebook, sản phẩm chấm, pipeline tái lập |
| **Pao-Ta Yu — hướng e-Learning/Computer-Assisted Instruction** | Đồng tác giả “Toward a Highly Interactive Model of Flipped Learning”, ICHL 2015, tr. 173–186; [kỷ yếu gốc](https://link.springer.com/book/10.1007/978-3-319-20621-9), [nhân sự khoa](https://cs.ccu.edu.tw/p/404-1094-6502.php?Lang=en) | Có liên hệ lớp đảo ngược/học liệu; căn cứ ở đây cũ hơn, phải kiểm tra hướng hiện tại và khả năng hướng dẫn | Lập luận nhiệm vụ–tương tác–phản hồi và đối chiếu tiền lệ |

Danh mục lab chính thức: [CCU CSIE laboratories](https://cs.ccu.edu.tw/p/412-1094-941.php?Lang=en). Trang này có footer cập nhật cũ; dùng để phát hiện hướng rồi đối chiếu công trình, không xem là thông báo tuyển. Một liên kết AIT lab trả 404 trong phiên này không chứng minh lab không còn hoạt động.

Không tìm thấy trong phạm vi kiểm tra thông báo xác thực ba người trên nhận ứng viên cho kỳ bạn sẽ nộp. Sự phù hợp là đánh giá có điều kiện về nội dung. Chưa gửi thư cho ai; không dự báo trúng tuyển/học bổng.

**Bộ minh chứng CV:** bản thảo đúng mức hoàn thành; repo được quyền chia sẻ và tái chạy; demo một workflow; báo cáo kết quả thật, cả lỗi/kết quả âm; research statement giải thích RQ–bằng chứng–giới hạn–bước tiếp; mô tả đóng góp cá nhân phân biệt tự thiết kế/lập trình, hỗ trợ AI và việc cộng sự. Có thể ghi “thiết kế và kiểm chứng bản mẫu…” khi đúng; chỉ ghi “cải thiện năng lực…” khi đã có nghiên cứu đủ bằng chứng.

**Chưa chọn nơi gửi bài.** Lĩnh vực có thể là giáo dục Vật lí, educational technology hoặc HCI tùy câu hỏi/bằng chứng cuối. Sau G4/G5 mới kiểm tra scope, dạng bài, bình duyệt, phí và chính sách artifact/AI của venue trên nguồn chính thức. Nhãn chỉ mục không thay đánh giá phù hợp/chất lượng.

**8. Lộ trình nhanh và khung 8–12 tuần**

Giả định lập lịch: chủ nhiệm có khoảng 10–15 giờ tập trung/tuần, hai cộng sự phụ trách nội dung/học liệu theo thuyết minh, hướng dẫn rà phương pháp tại các cổng. Bạn chưa xác nhận giờ và kinh phí thực nhận; đây là **kịch bản**, không cam kết. Có thể nén việc kỹ thuật khi đủ giờ, không nén thủ tục/thời gian đo bằng cách tạo dữ liệu.

Phân công gợi ý theo hồ sơ, cần nhóm xác nhận: Khôi phụ trách RQ, phạm vi, tích hợp và kết luận; Thy phụ trách chương trình, kiến thức/rubric; Phương phụ trách học liệu, nhiệm vụ, nguồn và QA. Không mặc định ai có kỹ năng backend; R0 phải chốt người phụ trách Auth/pipeline. Dự toán 12 triệu chưa là tiền đã có. A có thể bắt đầu với tài nguyên hiện tại; chưa có lý do mua GPU/nâng gói AI.

| Thời gian | Vấn đề ưu tiên | Sản phẩm bàn giao | Kiểm chứng/quyết định |
|---|---|---|---|
| Ngày 1 | Chưa chốt bản | Manifest, danh sách lỗi, đếm thống nhất | Test/hash; G0 chốt B23 |
| Ngày 2 | Câu hỏi rộng | Đặc tả B23 1 trang, hd→nhiệm vụ→sản phẩm | Nội dung/hướng dẫn rà; chưa là dữ liệu HS |
| Ngày 3–4 | Login/đường thu | Tái hiện, sửa tối thiểu dev nếu có quyền, ca hai vai | G1: môi trường và Auth; bị chặn thì báo rõ |
| Ngày 5 | Phép tính/nguồn | Run tham chiếu, CSV/JSON giả có metadata | Oracle/bất biến, không gọi số đo thật |
| Ngày 6 | Tuyên bố lệch bản | Claim–evidence ledger; sửa đề xuất số câu/test theo ngày | Đối chiếu từng đoạn và mã/dữ liệu |
| Ngày 7 | Chưa có gói review | Demo B23, báo cáo lỗi/giới hạn, dàn bài mới | G2: người khác tái tạo phần công bố |
| Tuần 2 | Workflow chưa kín | R3–R6 trong phạm vi dev | Mất mạng/reload/đổi vai/xem sản phẩm giả |
| Tuần 3–4 | Thiếu đánh giá độc lập | Gói thẩm định, nhận xét nếu mời được, vòng sửa có lý do | G3: insight thiết kế hay chỉ QA? Chọn A/B/C |
| Tuần 5–6 | Xác minh sau sửa | A: vòng hai/artifact. B nếu đủ điều kiện: công cụ/thủ tục/pilot | Không có HS thì tiếp tục A hoặc chuẩn bị C |
| Tuần 7–8 | Lập luận có thể đọc | Bản thảo theo RQ, related work cập nhật, README/đóng góp | G4: kết luận đúng bằng chứng; tái chạy phạm vi công bố |
| Tuần 9–12 tùy điều kiện | Nâng bằng chứng | B: thu/phân tích nếu đã được phép, đủ lịch; hoặc C benchmark; hoặc A đánh giá sâu | G5: quyết định loại bài/venue; thiếu mẫu/lịch thì gia hạn hoặc gọi pilot |

“Nhanh nhất” là có quyết định dựa trên bằng chứng trong tuần đầu và artifact kiểm tra được sau vài tuần. Không có căn cứ hứa bài quốc tế được chấp nhận trong 8–12 tuần. Có thể soạn bài ngay; kết luận HS tiến bộ phải chờ nghiên cứu tương ứng.

**9. Cổng quyết định tiếp tục hoặc đổi hướng**

- **G0, phạm vi:** thống nhất B23 đầu tiên; tách bài giai đoạn/đề tài rộng; sửa kế hoạch 2/4 lớp và lỗi năm trước thu dữ liệu.
- **G1, môi trường:** chưa xác định backend thử/root cause Auth thì chỉ báo chẩn đoán và demo công khai. Dành một đợt có giới hạn giờ, không viết lại toàn Auth theo phỏng đoán.
- **G2, vận hành:** chưa có gói lưu/xuất có nguồn, phiên bản, trạng thái thì chưa dùng nghiên cứu; test pass không tự qua cổng.
- **G3, cơ hội:** có nơi tiếp cận/người chấm/thủ tục thì chuẩn bị B; không có thì tiếp tục A hoặc C. Không đổi sang SV đại học rồi giữ nguyên kết luận THPT.
- **G4, đóng góp:** chỉ còn số tính năng/screenshot thì chưa đủ lập luận nghiên cứu; cần quyết định thiết kế, lỗi, đánh giá và insight. Nếu chưa có, giữ prototype/portfolio, tiếp tục học phương pháp.
- **G5, kết quả:** kết quả âm với thiết kế tốt giúp thu hẹp kết luận; thiếu mẫu/CI rộng là chưa xác định. Chọn venue theo đóng góp thực tế.

**10. Thông tin còn thiếu và giới hạn**

1. Chưa chốt chương trình/intake/năm tốt nghiệp/ngoại ngữ. Nếu chọn CSIE thiên hệ thống/thuật toán thay HCI/learning analytics, phải đánh giá lại độ phù hợp và lab.
2. Chưa biết giờ thực tế, kỹ năng backend/thống kê từng thành viên, kinh phí được cấp. Có thêm kỹ năng/giờ thì A nhanh hơn; thiếu thì thu hẹp.
3. Chưa chẩn đoán root cause login, chưa xác nhận Supabase dev. Mã/migration tồn tại không có nghĩa đã triển khai đúng.
4. Chưa có người dùng/dữ liệu/đường tiếp cận hợp lệ. Nếu có trường và hướng dẫn phương pháp, B đáng ưu tiên hơn về câu hỏi giáo dục.
5. Chưa biết quy định nghiệm thu/phê duyệt đề tài cấp trường; không tự thay mục tiêu đã duyệt. Cần hướng dẫn thống nhất bài giai đoạn, lịch và mẫu.
6. Chưa kiểm toán toàn kho tri thức/câu hỏi/ảnh/quyền phân phối. Đếm 212 câu, 62 test và một ca UI không xác nhận toàn bộ nội dung đúng.
7. Chưa đọc đủ toàn văn mọi bài hoặc sàng lọc cơ sở dữ liệu đầy đủ. Khoảng trống chỉ là ứng viên cần kiểm tra; không có tuyên bố “chưa ai làm”.
8. Đọc đủ nội dung chính/danh mục Word, xem trực quan trang liên quan; chưa QA mọi hình/trang. Trước gửi cần biên tập, kiểm template/tất cả trang.
9. Antigravity được nhận diện từ ứng dụng cài, chưa thử phiên bên trong; repo/terminal/browser phải qua preflight. Pro không xác lập đầu ra đúng.
10. Chưa chọn venue nên chưa kiểm phí/lịch/chính sách một nơi cụ thể; không dự báo nhận bài/trúng tuyển/học bổng.

Quyết định thực hành: giữ đề tài, thu hẹp việc làm ngay, sửa đường tạo bằng chứng và viết đúng mức hoàn thành. Sau gói B23 tái tạo được và quyết định tiếp cận người học, mới cam kết nghiên cứu tiếp.
