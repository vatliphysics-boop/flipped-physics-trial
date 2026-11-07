**Vòng 2: CHƯA ĐẠT điều kiện kiểm chứng thực tế.** Đây là phản biện AI đóng vai giáo viên, không phải thẩm định của giáo viên hoặc người tham gia nghiên cứu thật. Không sửa workspace, DOCX hay DB; không đọc auth, secrets hoặc env values.

**W2-02-01 — MCP trình duyệt bị chặn bởi chính sách phê duyệt**

- **Severity:** Blocker kiểm chứng.
- **Trang:** `http://localhost:3001/hoc-lieu`.
- **Steps:** Tìm thấy công cụ `team_browser` → gọi `browser_navigate` tới kho học liệu.
- **Evidence:** Công cụ trả `isError: true`: “MCP tool call requires approval, but approval policy is never”. Trang chưa mở trong trình duyệt. HTTP HEAD riêng trả **200 OK**.
- **Source paragraph:** Bài báo P67–68, P197–199; TEAM yêu cầu bằng chứng thao tác thực.
- **Tác động dạy/học:** Chưa xác nhận học sinh hoặc giáo viên có thể dùng độc lập các nhiệm vụ và công cụ công khai.
- **Acceptance:** MCP được phép mở trang; hoàn thành thao tác yêu cầu tại 1280 px và 390 px, có ảnh và kết quả cụ thể.

**W2-02-02 — Luồng giao–nộp qua tài khoản chưa có điều kiện kiểm thử**

- **Severity:** Blocker kiểm chứng luồng riêng.
- **Trang:** Lớp học, giao nhiệm vụ, nộp bài, nhận xét.
- **Steps:** Không đăng nhập hoặc ghi dữ liệu vì chưa có tài khoản thử và môi trường DB thử được xác minh.
- **Evidence:** Vòng này không cung cấp hai vai thử hoặc xác nhận môi trường dữ liệu. Mã `PGRST205` trong bài báo là ghi nhận lịch sử, chưa tái hiện.
- **Source paragraph:** NCKH P150, P163; bài báo P122, P174, P203–205.
- **Tác động dạy/học:** Chưa chứng minh giáo viên nhận được sản phẩm chuẩn bị, lời giải và phần tự điều chỉnh của học sinh.
- **Acceptance:** Kiểm thử trọn luồng bằng hai vai thử trên môi trường dữ liệu thử đã xác minh, gồm phân quyền và lưu sau đăng nhập lại.

**Trạng thái vấn đề cũ**

- **W2-00-03:** CHƯA KIỂM CHỨNG. “Z giảm −2” tại bài báo P182 là lỗi được ghi trong lượt trước; chưa xác nhận bản chạy hiện tại còn lỗi hay đã sửa.
- **W2-00-04:** CHƯA KIỂM CHỨNG. Sai khác làm tròn tại P117 là ghi nhận lịch sử; chưa đối chiếu được Hình 7 hiện tại. Không đóng lỗi.

**Actual tests:** Đọc toàn bộ ba tài liệu trích xuất; đọc lại `AGENTS.md`, `TEAM.md`, `acceptance.md` trong workspace; tìm công cụ MCP; thử mở `/hoc-lieu` và nhận từ chối; HTTP HEAD trả 200.

**Giới hạn:** **0 ca thao tác giao diện, 0 ảnh desktop/mobile.** Bộ lọc B21–B25, 3D B22, bảng B23 thay T/N₀, notebook lưu/tải lại, chatbot B23 và công cụ giáo viên công khai đều **CHƯA KIỂM CHỨNG**. Chưa đủ căn cứ xác nhận dùng độc lập, đóng lỗi hoặc nghiệm thu.

Cơ chế phê duyệt công cụ đã từ chối thao tác mở trang MCP vì phiên có chính sách `never`; đây là chặn trước thao tác trình duyệt, không phải lỗi đã xác định của website.