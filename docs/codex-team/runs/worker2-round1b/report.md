**Vòng 1: CHƯA ĐẠT điều kiện kiểm chứng thực tế.** Network và TMP đã hoạt động, nhưng Chromium vẫn bị sandbox chặn trước khi mở trang. Đây là phản biện AI, không phải thẩm định của giáo viên hoặc người tham gia nghiên cứu thật. Không sửa workspace, DOCX hoặc DB; không đọc auth/secrets/env values.

**W2-01-01 — Chromium bị chặn ở bước khởi chạy**

- **Severity:** Blocker kiểm chứng.
- **Trang:** `http://localhost:3001/hoc-lieu`; chưa mở được.
- **Steps:** Nạp Playwright bundled → executable mặc định không tồn tại → tải Chromium Headless Shell vào TMP thành công → gọi `chromium.launch({headless:true})`.
- **Evidence:** Chromium thoát với `SIGTRAP`; log: `bootstrap_check_in … MachPortRendezvousServer … Permission denied (1100)`. Lỗi xảy ra trước `newPage` và `goto`; không có ảnh desktop/mobile.
- **Source paragraph:** Bài báo P67–68, P197–199; TEAM yêu cầu bằng chứng thao tác thực.
- **Tác động dạy/học:** Chưa xác nhận học sinh dùng độc lập được mô phỏng, bảng số liệu, bản ghi và chatbot; chưa xác nhận giáo viên sử dụng được công cụ công khai.
- **Acceptance:** Chromium khởi chạy được trong môi trường review; hoàn thành các thao tác được giao ở 1280 px và 390 px, lưu ảnh và kết quả cụ thể.

**W2-01-02 — Luồng tài khoản vẫn chưa có điều kiện kiểm thử**

- **Severity:** Blocker kiểm chứng giao–nộp.
- **Trang:** Lớp học, giao nhiệm vụ, nộp bài và phản hồi.
- **Steps:** Chưa thực hiện đăng nhập hoặc ghi dữ liệu; chưa có hai vai thử và môi trường dữ liệu thử được xác minh.
- **Evidence:** Không được cung cấp tài khoản thử trong vòng này. `PGRST205` ở bài báo P204 là ghi nhận lịch sử, chưa tái hiện.
- **Source paragraph:** Thuyết minh P150, P163; bài báo P122, P174, P203–205.
- **Tác động dạy/học:** Chưa chứng minh giáo viên nhận được sản phẩm chuẩn bị và tự điều chỉnh của học sinh.
- **Acceptance:** Kiểm tra trọn luồng bằng hai vai thử trên môi trường dữ liệu thử được xác minh.

**Trạng thái lỗi vòng trước**

- **W2-00-03:** CHƯA KIỂM CHỨNG bản chạy. Câu “Z giảm −2” tại P182 là ghi chú lỗi trong lượt thử trước; chưa đủ căn cứ kết luận giao diện hiện tại còn lỗi hoặc đã sửa.
- **W2-00-04:** CHƯA KIỂM CHỨNG bản chạy. P117 ghi sai khác làm tròn lịch sử; chưa đối chiếu được Hình 7 hiện tại. Không đóng lỗi.

**Actual tests:** Đọc toàn bộ ba tài liệu trích xuất; đọc lại `AGENTS.md` và `TEAM.md` tại workspace; HTTP HEAD localhost trả **200 OK**; nạp Playwright bundled; tải Chromium/FFmpeg vào TMP thành công; thử khởi chạy Chromium và nhận lỗi quyền MachPort.

**Giới hạn:** **0 ca thao tác trình duyệt, 0 ảnh chụp.** Kho và bộ lọc B21–B25, 3D B22, bảng B23, notebook lưu/tải lại, chatbot và công cụ giáo viên đều **CHƯA KIỂM CHỨNG**. HTTP 200 không chứng minh các chức năng dùng được. Chưa đủ bằng chứng nghiệm thu web hoặc đánh giá hiệu quả sư phạm.