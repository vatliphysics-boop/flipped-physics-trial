# AI cục bộ trong kho học liệu

Học sinh nhấn nút AI tròn ở góc phải, chọn B21–B25, chọn giải thích hoặc gợi ý rồi nhập câu hỏi. Phản hồi được tạo trên máy chạy Ollama; khung có các đoạn kiến thức đã cung cấp cho mô hình. Liên kết Gemini và ChatGPT mở dịch vụ bên ngoài, không chuyển lịch sử trò chuyện sang đó.

Giáo viên đăng nhập và mở `/teacher/ai` để tạo đề/phiếu có hình, đảo đề riêng hoặc chuẩn bị giờ học từ kho B21–B25. `/hoc-lieu/ai-giao-vien` là bản thử công khai. Công cụ đọc tài liệu và sinh bản nháp được đặt trong mục mở rộng; không tự lưu, công bố hoặc chấm điểm.

## Chạy trên máy hiện tại

Đã cài Ollama trong `.local-ai/runtime`; trọng số nằm trong `.local-ai/models` và không đưa vào Git. Không cần khóa của OpenAI hoặc Google.

```sh
# Lần đầu trên máy Mac khác
npm run ai:setup

# Giữ terminal này chạy
npm run ai:serve

# Terminal khác: tải mô hình nếu chưa có
npm run ai:pull

# Chạy web; máy hiện tại dùng cổng 3001
npm run dev -- --port 3001
```

Mặc định dùng `qwen3:4b-instruct-2507-q4_K_M`, một mô hình Qwen chạy cục bộ, không phải ChatGPT hoặc Gemini. Có thể đặt `LOCAL_AI_MODEL` và `LOCAL_AI_BASE_URL` ở cấu hình máy chủ; không dùng biến `NEXT_PUBLIC_` cho địa chỉ máy chủ AI. Khi đổi mô hình, cần kiểm tra lại chất lượng và mức sử dụng bộ nhớ. Mô hình thử 1,5B và 3B đã có lỗi diễn giải nên không được chọn làm mặc định.

`ai:serve` chỉ nghe trên `127.0.0.1:11434`, tắt Ollama Cloud và giới hạn một mô hình/một yêu cầu chạy đồng thời. Web gọi Ollama từ phía máy chủ. Không đưa cổng Ollama ra Internet. Bản web trên máy chủ khác cần có Ollama tại máy đó hoặc kết nối nội bộ được bảo vệ; dịch vụ không thể dùng địa chỉ localhost của máy giáo viên từ một máy chủ Vercel.

## Giới hạn và kiểm tra

- Học sinh chỉ dùng kiến thức tóm tắt công khai B21–B25. Không đọc hồ sơ, bài nộp, điểm hoặc đáp án bài kiểm tra của lớp. Máy chủ kiểm tra bài, vai tin nhắn, thứ tự và độ dài trước khi tạo phản hồi. Chế độ gợi ý dùng AI chọn mã đoạn và đặt câu hỏi tiếp theo, rồi trích nguyên văn kiến thức để hạn chế việc đưa lời giải thay học sinh.
- Lịch sử chat chỉ nằm trong bộ nhớ của trang. Bản ghi tự học ở trang riêng được lưu trong trình duyệt nếu học sinh chọn nhập nội dung; chưa nộp cho giáo viên. Không ghi nội dung yêu cầu/phản hồi vào log ứng dụng.
- Yêu cầu phải cùng nguồn với web. Một tiến trình web chỉ chạy một lượt tạo phản hồi và tối đa 12 yêu cầu/phút; trả lỗi có thể thử lại khi bận hoặc chưa kết nối. Đây là giới hạn cho máy thử 8 GB RAM, chưa phải cấu hình phục vụ đồng thời cả lớp. Khi triển khai nhiều máy chủ, cần giới hạn lượt dùng chung và kiểm thử tải.
- Giáo viên phải có vai `teacher` trên Supabase. Tệp tối đa 5 MB, PDF tối đa 30 trang; DOCX được kiểm tra dung lượng giải nén. Không OCR ảnh; công thức, chỉ số và bảng cần kiểm tra lại sau trích xuất.
- Văn bản đầu vào tối đa 60.000 kí tự. Mô hình đọc tối đa khoảng 4.000 kí tự đoạn trích, ưu tiên từ khóa yêu cầu; giao diện báo rõ khi chỉ đọc một phần. Đây là lựa chọn đoạn theo từ khóa, chưa phải tìm kiếm ngữ nghĩa toàn bộ tài liệu.
- AI có thể trả lời sai. Mã đoạn giúp kiểm tra căn cứ, không bảo đảm câu trả lời đúng. Kiểm tra nội bộ không thay thế thẩm định chuyên môn hoặc thực nghiệm sư phạm.

Nguồn kỹ thuật: [Ollama Chat](https://docs.ollama.com/api/chat), [Qwen3 4B Instruct](https://ollama.com/library/qwen3:4b-instruct-2507-q4_K_M), [Mammoth](https://github.com/mwilliamson/mammoth.js). Script cài Mac ghim Ollama v0.35.1 và kiểm tra SHA-256 của tệp phát hành chính thức trước khi giải nén.


## AI chọn cách hỗ trợ trong kế hoạch

`/api/ai/preparation` chỉ nhận mã bài, vấn đề đã biên soạn, thời lượng, loại thiết bị và số lượng tổng hợp tùy chọn. Không nhận hồ sơ học sinh hoặc văn bản riêng của giáo viên. Ollama trả JSON chọn hai mã câu hỏi Q1–Q4 và một mã hỗ trợ S1–S3; hệ thống kiểm tra mã rồi dựng phản hồi từ văn bản đã biên soạn. Giáo viên sửa và thêm vào kế hoạch bằng thao tác rõ ràng.

Lượt thử sinh văn bản tự do đã đổi N₀ = 800 thành 80.000 và diễn giải sai H = λN. Vì vậy phần hỗ trợ tình huống không dùng mô hình viết lại dữ kiện. Kiểm thử lựa chọn có cấu trúc đã giữ nguyên 800; đây chỉ là một lượt kiểm tra, không xác nhận mô hình phù hợp mọi lớp. Công cụ sinh văn bản trong mục mở rộng vẫn có thể sai và cần rà soát.

Đề, hình, khóa đáp án và phiếu Word được ghép bằng quy tắc từ ngân hàng đã biên soạn; các chức năng này không yêu cầu Ollama. Nhập đề DOCX/TXT giữ tệp trong trình duyệt, không tự gửi AI. Khung đọc tài liệu riêng trong mục mở rộng có luồng máy chủ và quyền giáo viên riêng; không đánh đồng hai luồng.

## Kiểm tra thực tế ngày 05/10/2026

Đã khởi động dịch vụ trên máy thử và xác nhận `/api/ai/status` trả `ready: true`. Đã gửi yêu cầu học sinh, giáo viên qua máy chủ và nhấn “Tạo bản nháp” trên giao diện giáo viên; ảnh phản hồi thật nằm tại `docs/article-figures/22-ai-giao-vien-hoat-dong.jpg`. Đây là kiểm tra vận hành trên một máy, chưa kiểm tra đồng thời cả lớp.

Trong không gian giáo viên, mục “Đọc tài liệu với AI cục bộ” chỉ xuất hiện khi dịch vụ sẵn sàng; thành phần chỉ nạp khi mở. Các gợi ý AI trong chuẩn bị giờ học cũng dùng trạng thái này. Khi chưa kết nối, giáo viên vẫn soạn phiếu, kế hoạch, đề và tải Word bằng quy tắc. Sau khi khởi động AI ở một phiên đang mở, tải lại trang để kiểm tra lại trạng thái.

Bản nháp tự do vẫn có lỗi: diễn đạt phân rã alpha thành “Z giảm −2” thay vì “Z giảm 2”; một lượt phản hồi còn có mã nguồn viết sai. Không coi mã trích dẫn hoặc trạng thái kết nối là xác nhận kiến thức đúng. Giáo viên phải đối chiếu học liệu và sửa trước khi dùng. Bài báo hiện tại ghi rõ các lỗi này và giới hạn kiểm tra.
