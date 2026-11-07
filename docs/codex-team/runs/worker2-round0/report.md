**Vòng 0: CHƯA ĐẠT điều kiện kiểm chứng thực tế.** Đã đọc toàn bộ ba tài liệu trích xuất, `AGENTS.md` và `docs/codex-team/TEAM.md`. Không sửa workspace, DOCX hoặc DB. Đây là phản biện AI, không phải thẩm định của giáo viên/người tham gia nghiên cứu thật.

### W2-00-01 — Không khởi chạy được trình duyệt

- **Severity:** Blocker kiểm chứng.
- **Trang:** `http://localhost:3001`, toàn bộ luồng công khai.
- **Steps:** Nạp Playwright bundled → gọi `chromium.launch({headless:true})` → dự kiến mở localhost.
- **Evidence:** Công cụ trả `EPERM: operation not permitted, mkdtemp '…/playwright-artifacts-…'`; thất bại trước khi mở trang. Không có ảnh.
- **Source paragraph:** Bài báo P67–68, P197–199; TEAM yêu cầu bằng chứng thao tác thực.
- **Tác động dạy/học:** Chưa xác nhận học sinh thực hiện được nhiệm vụ hoặc giáo viên sử dụng được học liệu.
- **Acceptance:** Trình duyệt chạy trong môi trường được phép; thực hiện desktop/mobile/keyboard và ghi bằng chứng cho từng luồng.

### W2-00-02 — Thiếu tài khoản thử và môi trường dữ liệu đã xác minh

- **Severity:** Blocker kiểm thử giao–nộp.
- **Trang:** Luồng lớp học, giao bài, nộp bài, nhận xét.
- **Steps cần kiểm chứng:** Giáo viên thử giao nhiệm vụ → học sinh thử nhận/nộp → giáo viên xem sản phẩm và phản hồi. **Chưa thực hiện.**
- **Evidence:** Phiên này không được cung cấp tài khoản thử hoặc xác nhận DB thử. P204 ghi lỗi `PGRST205` ở phiên trước; đó không phải kết quả tái hiện vòng này.
- **Source paragraph:** Thuyết minh P150, P163; bài báo P122, P174, P203–205.
- **Tác động dạy/học:** Chưa chứng minh giáo viên nhận được bằng chứng chuẩn bị trước lớp và phản tư sau lớp.
- **Acceptance:** Có hai vai thử, môi trường thử được xác minh và kiểm tra trọn luồng; không dùng dữ liệu học sinh thật.

### W2-00-03 — Bản nháp AI đã ghi nhận diễn đạt sai chiều biến đổi Z

- **Severity:** Major về nội dung nếu được dùng chưa kiểm duyệt.
- **Trang:** Công cụ AI giáo viên, Hình 24; chưa kiểm chứng giao diện hiện tại.
- **Steps đối chiếu:** Đọc P182 → kiểm tra câu “Z giảm −2” trong mô tả phân rã α.
- **Evidence:** Chính bài báo ghi cần sửa thành “Z giảm 2”.
- **Source paragraph:** Bài báo P182; thuyết minh P123, P150; hd P10.
- **Tác động dạy/học:** Dễ khiến học sinh hiểu ngược biến đổi điện tích và lập sai phương trình.
- **Acceptance:** Nội dung dùng trong dạy học thể hiện rõ `Z′ = Z − 2`, `A′ = A − 4`; có bằng chứng rà soát bản nháp trước sử dụng. Chưa đóng lỗi dựa riêng vào lời nhắc AI.

### W2-00-04 — Quy tắc làm tròn ví dụ U-235 chưa thống nhất

- **Severity:** Minor về trình bày định lượng.
- **Trang:** B25, Hình 7 và bài báo P117.
- **Steps đối chiếu:** Tính `92×1,007825 + 143×1,008665` → so với tổng trung gian được bài báo mô tả.
- **Evidence:** Tổng là `236,958995 u`; P117 ghi hình hiển thị `236,95899 u`, đồng thời thừa nhận cần thống nhất làm tròn.
- **Source paragraph:** Bài báo P112–117; hd P27.
- **Tác động dạy/học:** Học sinh khó phân biệt sai số làm tròn với sai công thức khi đối chiếu từng bước.
- **Acceptance:** Thống nhất số chữ số và quy tắc làm tròn giữa hình, lời giải và kết quả; giữ độ chính xác trung gian trước khi làm tròn cuối.

**Actual tests:** Đọc các hướng dẫn tại workspace; xác nhận module Playwright bundled tồn tại; thử khởi chạy Chromium và nhận lỗi EPERM. Đối chiếu diễn đạt phân rã α và tính lại tổng khối lượng U-235 từ số liệu đã cung cấp.

**Giới hạn:** Không mở được web, không thao tác 3D/chatbot/video, không thử desktop/mobile/keyboard, không tải Word hoặc kiểm thử tài khoản. Các tuyên bố 58 tests, build/lint và ảnh phiên trước **CHƯA KIỂM CHỨNG độc lập** trong vòng này. Chưa đủ căn cứ nghiệm thu web hoặc kết luận hiệu quả dạy học.