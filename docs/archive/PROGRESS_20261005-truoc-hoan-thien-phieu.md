## Sửa định dạng đúng sai theo góp ý

- Mỗi câu đúng–sai trên web và khi xuất đề/phiếu Word có đúng bốn ý a–d. Bộ kiểm tra từ chối mọi số lượng khác bốn và ý chưa có đáp án.
- Tách/ghép các bảng dài từ sách theo cùng chủ đề. Giữ nguyên từng phát biểu, đáp án; phần dẫn có dữ kiện riêng được giữ nguyên. Không tạo ý mới, không lặp ý để lấp chỗ trống.
- 12 câu đúng–sai được công bố (48 ý); 6 ý còn dư chưa ghép đủ bốn theo chủ đề, lưu riêng tại `data/book-bank/true-false-pending-statements.json`. Tổng ngân hàng hiện có 213 câu; 24 bài nguồn khác còn chờ xác minh.
- Mỗi nhóm ghép lưu vị trí từng ý trong nguồn nội bộ. Giao diện dùng Câu 1–12 và không hiển thị nguồn hay mã nội bộ.
- Đáp án và giải thích được đánh lại a–d theo nhóm mới, không giữ thứ tự a–m của bảng cũ.
- Bổ sung stylesheet KaTeX để công thức hiển thị đúng, sửa xuất kí hiệu hạt nhân bằng prescript OMML không có ô trống. Đối chiếu cấu trúc với tài liệu Microsoft: https://learn.microsoft.com/en-us/dotnet/api/documentformat.openxml.math.presubsuper.
- 53/53 kiểm thử đạt; kiểm tra kiểu và production build đạt. Lint còn một cảnh báo có sẵn ở StudentPhase3Assessment, không có lỗi.
- Đã kiểm tra web và render đề mẫu/đáp án Word; ảnh web `docs/article-figures/18-dung-sai-bon-y.jpg`. Bản bài báo chưa được dựng lại trong lượt sửa định dạng này; số liệu/ảnh bài báo cần cập nhật trước khi gửi đăng.

# Cập nhật 05/10/2026

## Không gian giáo viên

Bốn công việc đã triển khai: tạo đề có hình, phiếu ba pha, chuẩn bị giờ học và nhập/đảo đề riêng. Ngân hàng hiện có 105 câu (72 câu có sẵn, 33 câu mới), 11 hình câu hỏi mới. Danh mục học liệu có 89 mục. Các hình là sơ đồ khoa học biên soạn, dữ liệu mô hình ghi rõ, không phải ảnh đo thực tế.

- Đề 15 phút/giữa kỳ/cuối kỳ trong chủ đề B21–B25; chỉnh câu, khóa và điểm, xem bảng phân bố, tạo 1–8 mã. Cùng tập câu và tổng điểm, khóa theo phương án sau đảo. Chưa xác lập tương đương độ khó.
- Bộ xuất DOCX giữ hình trong đề/phiếu học sinh; đáp án và hướng dẫn giáo viên xuất riêng. Bản nháp giữ khi chuyển bốn mục trong cùng phiên, không tự lưu kho riêng khi tải lại.
- Nhập TXT/DOCX trắc nghiệm bốn phương án; giữ điểm ghi đầu câu và một hình PNG/JPEG ở phần dẫn. Không tự gửi tài liệu nhập đến AI. Cấu trúc không hỗ trợ được báo lỗi để chuẩn hóa.
- Mười tình huống hỗ trợ B21–B25 gắn học liệu thật và được thêm vào bản soạn kế hoạch đang chỉnh. Kiểm tra quy tắc nhắc thiếu trường/pha hoặc lệch tổng phút trong giờ.

## Lỗi AI và điều chỉnh

Sinh văn bản tự do đã thay N₀ = 800 bằng 80.000 và diễn giải sai H = λN. Phần hỗ trợ tình huống chuyển sang JSON chọn hai mã Q1–Q4 và một mã S1–S3. Chỉ mã hợp lệ được chấp nhận; văn bản cuối lấy từ phương án đã biên soạn. Lượt thử thực tế giữ nguyên 800. Các công cụ sinh bản nháp trong mục mở rộng vẫn cần giáo viên kiểm tra.

## Bằng chứng kiểm tra

- 41/41 ca tự động đạt, build đạt. Lint không có lỗi, một cảnh báo có sẵn tại StudentPhase3Assessment.tsx.
- Đã kiểm tra bảo toàn câu/điểm/hình và khóa đúng qua tám mã, trường hợp thiếu câu, mã trùng, khóa sai, ZIP không hợp lệ và giữ điểm đề nhập.
- Giao diện đề/phiếu/đảo đề ở 390 px không tràn ngang. Mẫu Word đã dựng, render và kiểm tra bố cục, hình, khóa và phân biệt tệp học sinh/giáo viên. Lượt tải Blob hoàn tất chưa xác nhận trong trình duyệt kiểm tra.
- DOCX thử nhập có hai câu/hai hình được đọc; khóa nhập D/C, tạo mã và giữ hình đi cùng câu. Dữ liệu lớp 12/40 trong ảnh chuẩn bị là tham số thử, không phải học sinh thật.

## Bài báo

Soạn lại từ mẫu duy nhất BAO_KHOA_HOC_DANG_KHOI.docx, dùng đúng tên đề tài trong NCKH đã sửa. Bản kết quả có 16 ảnh web thật, 16 tài liệu tham khảo APA, 21 trang đã kiểm tra trực quan. RIS/BibTeX/CSL được cập nhật để nhập Mendeley; chưa thao tác đồng bộ Mendeley Cite.

Giữ nguyên styles, header/footer, section, ba công thức Word, mười media nguồn và dữ liệu add-in/customXml. Chỉ đổi nội dung văn bản, quan hệ thêm sáu ảnh, updateFields và core title. Phóng hình đến 13,5 cm để dễ đọc, giữ tỉ lệ. Mẫu và generator cũ chuyển vào tmp/report-template/superseded để không tiếp tục dùng, vẫn có thể khôi phục.

Báo cáo theo nghiên cứu thiết kế ở pha phân tích–thiết kế–kiến tạo/kiểm tra trước sử dụng. Không có kết quả thực nghiệm, thẩm định độc lập, khảo sát nhu cầu giáo viên hoặc bằng chứng giảm thời gian. Tuyên bố xung đột và tài trợ cần tác giả xác nhận. Luồng tài khoản/lưu/giao/nộp qua Supabase và tải đồng thời cả lớp chưa xác nhận; xem tiến độ 04/10/2026.
