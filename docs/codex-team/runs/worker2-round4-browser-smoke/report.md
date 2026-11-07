**W2-02-01: đã xác nhận khắc phục blocker MCP trong lượt smoke này. Không tuyên bố nghiệm thu web.** Đây là lượt kiểm tra của AI đóng vai giáo viên, không phải người tham gia nghiên cứu thật.

- **Severity:** Blocker kiểm chứng trước đây; không còn tái hiện.
- **Trang:** `http://localhost:3001/hoc-lieu`.
- **Steps:** MCP navigate → snapshot → chụp desktop `1280×900` → resize `390×844` → chụp mobile.
- **Evidence:** Navigate và snapshot thành công; tiêu đề **Học liệu số Vật lí hạt nhân 12**. MCP báo tạo [ảnh desktop](/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w2-EFaijB/evidence/desktop.png) và [ảnh mobile](/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w2-EFaijB/evidence/mobile.png).
- **Source paragraph:** Bài báo P67–68, P197–199; acceptance US01; TEAM.
- **Tác động dạy/học:** Đã mở được kho công khai để tiếp tục đánh giá thao tác giáo viên/học sinh.
- **Acceptance:** Đạt tiêu chí gỡ blocker: mở trang, lấy snapshot và chụp hai kích thước; không gặp lại lỗi approval `never` hoặc socket path quá dài.

**Tool errors:** Lần chụp đầu bị `File access denied` vì đường dẫn nằm ngoài root `evidence` của MCP. Đã chụp lại bằng đường dẫn tuyệt đối trong `evidence`, thành công. Hai ảnh dùng tên tương đối trước đó chưa xác định được vị trí qua shell.

**Actual tests và giới hạn:** Đọc đủ ba tài liệu trích xuất, đọc lại AGENTS/TEAM/acceptance; thực hiện smoke MCP nêu trên. Chưa xác minh trực quan hai ảnh cuối bằng công cụ đọc ảnh; chưa kiểm thử học liệu, a11y hay luồng tài khoản. Không đăng nhập/ghi DB, không đọc auth/secrets/env values, không khởi chạy browser qua shell và không sửa workspace.