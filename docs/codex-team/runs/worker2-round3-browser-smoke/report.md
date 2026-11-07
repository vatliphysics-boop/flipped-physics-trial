**W2-02-01 chưa được khắc phục. Smoke trình duyệt: CHƯA KIỂM CHỨNG.** Đây là kiểm tra của AI đóng vai giáo viên, không phải thẩm định của người tham gia nghiên cứu thật.

**W2-03-01 — MCP vẫn chặn kiểm chứng**

- **Severity:** Blocker kiểm chứng.
- **Trang:** `http://localhost:3001/hoc-lieu`.
- **Steps:** Gọi MCP navigate → snapshot → screenshot desktop → resize `390×844` → screenshot mobile.
- **Evidence:** Navigate và resize trả `MCP tool call requires approval, but approval policy is never`. Snapshot và hai screenshot trả `Socket directory path is too long (128 chars); set PWTEST_SOCKETS_DIR to a shorter location.`
- **Tiêu đề trang:** CHƯA KIỂM CHỨNG.
- **Đường dẫn ảnh:** Không có ảnh được tạo; `desktop.png` và `mobile.png` chỉ là tên đích đã yêu cầu.
- **Source paragraph:** Bài báo P67–68, P197–199; acceptance US01; TEAM yêu cầu bằng chứng thao tác thực.
- **Tác động dạy/học:** Chưa xác nhận kho hiển thị được cho giáo viên/học sinh trên desktop và mobile.
- **Acceptance:** MCP mở trang thành công, trả snapshot và tiêu đề; tạo ảnh desktop và mobile `390×844`, không còn hai lỗi công cụ trên.

**Actual tests:** Đọc toàn bộ ba tài liệu trích xuất; đọc lại AGENTS, TEAM và acceptance trong workspace; thực hiện năm lời gọi MCP nêu trên.

**Giới hạn:** 0 thao tác giao diện thành công, 0 ảnh. Không khởi chạy browser qua shell, không đăng nhập/ghi DB, không đọc auth/secrets/env values, không sửa workspace. Không tuyên bố nghiệm thu hoặc đóng lỗi cũ.

Cơ chế phê duyệt công cụ từ chối navigate/resize vì chính sách `never`; các lời gọi còn lại lỗi khởi tạo socket. Đây là lỗi môi trường kiểm chứng, chưa phải bằng chứng lỗi website.