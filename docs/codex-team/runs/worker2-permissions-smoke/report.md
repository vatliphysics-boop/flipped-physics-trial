**Probe browser: CHƯA ĐẠT.** MCP đã trả lỗi khởi tạo; tôi dừng probe theo yêu cầu.

**W2-SMOKE-01**

- **Severity:** Blocker kiểm chứng.
- **Trang:** `http://localhost:3001/hoc-lieu`.
- **Steps/log:** Gọi `team_browser.browser_navigate` với URL trên → nhận `isError: true` → dừng, không click hoặc chụp ảnh.
- **Evidence — nguyên văn:**
  ```text
  Error: async initializeServer: Socket directory path is too long (125 chars); set PWTEST_SOCKETS_DIR to a shorter location.
  ```
- **URL trước/sau:** URL trước chưa xác định; URL đích chưa được xác nhận mở thành công.
- **Trạng thái bộ lọc:** CHƯA KIỂM CHỨNG.
- **Ảnh:** Chưa tạo `smoke-worker2.png`.
- **Source paragraph:** Bài báo P67–68, P197–199; acceptance US01, US03.
- **Tác động dạy/học:** Chưa có bằng chứng thao tác để xác nhận khả năng truy cập và chọn học liệu.
- **Acceptance:** Khắc phục đường dẫn socket của MCP; mở trang, chọn B23 hoặc Thí nghiệm 3D, xác nhận UI thay đổi và lưu ảnh.

**Actual tests:** Đọc toàn bộ ba bản trích xuất; đọc lại AGENTS, TEAM và acceptance trong workspace; tìm công cụ MCP; thực hiện một lần `browser_navigate`.

**Giới hạn:** 0 thao tác UI thành công, 0 ảnh. Không sửa workspace/app/DOCX/DB; không khởi chạy browser qua shell; không đọc auth, secrets hoặc env values. Lỗi lượt này là khởi tạo socket, chưa đủ bằng chứng xác nhận quyền browser đã hoạt động.