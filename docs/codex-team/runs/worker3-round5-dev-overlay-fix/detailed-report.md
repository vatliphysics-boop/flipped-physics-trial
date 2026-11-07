# Worker 3 vòng 5 — COMPLETED_PENDING_LEAD_REVIEW

Đọc toàn bộ ba tài liệu và hướng dẫn cung cấp; đọc hướng dẫn devIndicators cục bộ trước sửa. Chỉ sửa next.config.ts, thêm `devIndicators: false`; giữ nguyên toàn bộ cấu hình khác, gồm outputFileTracingExcludes có sẵn trước job. Không commit, kill server, tác động DB hoặc đọc auth/secrets/env.

## W3-05-01
- Severity: P2; trang http://localhost:3001/hoc-lieu. Lỗi che nút được Worker 2 vòng 4 báo; không tái hiện trước sửa trong lượt này.
- Steps: mở trang ở1280×900 và390×844; click trái “Mở khung AI học tập”; Escape; Shift+Tab rồi Tab.
- Evidence: bốn ảnh thật ai-open-1280.png, ai-focus-1280.png, ai-open-390.png, ai-focus-390.png dưới thư mục evidence cùng cấp báo cáo. Browser MCP thực hiện locator.click; ảnh mở mobile đã xem trực tiếp.
- Source paragraph: bài báo P136–139; NCKH P98/P121–123; acceptance US01. Hướng dẫn node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/devIndicators.md xác nhận false ẩn indicator, vẫn hiện lỗi compile/runtime.
- Tác động dạy/học: nút Dev Tools che thao tác có thể cản truy cập gợi ý tự học trong dùng thử.
- Acceptance: chuột mở được, Escape đóng và trả focus, Tab focus được nút, không bị Dev Tools che ở cả hai kích thước. Đạt lượt Worker 3; chờ review độc lập.

## Exact diff và kiểm tra
Thay đổi duy nhất của Worker 3: thêm dòng `devIndicators: false,` ngay sau `const nextConfig: NextConfig = {`. Diff so với HEAD còn có outputFileTracingExcludes đã tồn tại trước job, không phải sửa của Worker 3.

SHA256 cuối next.config.ts: 02e0d475900d6b69f8ca629e409f74aacda602701c05b5f3b163f466a9fd9fe7.

## Actual tests và giới hạn
Browser MCP: hai click trái mở thành công; hai Escape đóng, focus “Mở khung AI học tập”; hai cặp Shift+Tab/Tab trả focus đúng nút; bốn PNG thật. Mobile sau đóng innerWidth=390, scrollWidth=390. Indicator không có nhãn Open Next.js Dev Tools; portal vẫn tồn tại cho overlay. git diff --check -- next.config.ts exit0. Không cần restart/kill server.

Không chạy build hoặc cố tình gây compile/runtime error: việc lỗi vẫn hiện dựa hướng dẫn cục bộ, CHƯA KIỂM CHỨNG bằng lỗi thật. Không thử hội thoại AI, science/B23, tài khoản, giao/nộp/DB; các luồng đó CHƯA KIỂM CHỨNG trong job. Không kết luận hiệu quả giáo dục hoặc nghiệm thu toàn web.

Một click đầu sai tên tham số bị tool từ chối; đã sửa sang target, chạy lại và chụp đè ảnh1280 sau click thành công. Lệnh ghi báo cáo bằng heredoc bị sandbox từ chối tạo temp; apply_patch ghi đúng thư mục tạm được phép.
