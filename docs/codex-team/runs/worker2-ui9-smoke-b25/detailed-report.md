# Worker 2 — UI9 smoke B25 và kho học liệu

Kết quả: UI-0001 còn mở, CHƯA ĐẠT tiêu chí không che nội dung. Đây là phản biện/dùng thử bởi AI đóng vai giáo viên khó tính, không có người tham gia nghiên cứu thật. Không sửa workspace, mã hoặc DOCX; không login, DB/API DB, migration, production; không đọc auth/secrets/env.

Đã đọc toàn bộ ba tài liệu trích xuất, AGENTS và các hướng dẫn người dùng đưa (TEAM, acceptance, regulations, CHECKPOINT, USER_GUIDE, curriculum-matrix); đọc AGENTS thực tế. Không viết mã nên không áp dụng bước đọc guide Next trước viết mã. Công cụ thao tác: team_browser MCP (Playwright); đánh giá ảnh bằng view_image.

Phiên thao tác: 05/10/2026 khoảng 11:54–12:00 UTC (18:54–19:00 ICT). Web localhost:3001. Hash checkpoint baseline b1e5369bc393ec547e4441c6d28eec3baefe570c5ef8c235af40718727c6fec8; không đo hash live, không tuyên bố ảnh thuộc hash đóng băng. Có W3 song song; lỗi vẫn quan sát được tại thời điểm chụp, chưa nhận ảnh backup/root và không dựng before. Tên before nghĩa trước sửa trong lượt quan sát này, không chứng minh lịch sử phiên bản.

## UI-0001

- Severity: Major (ảnh hưởng khả năng đọc học liệu, không chặn toàn trang).
- Trang: /hoc-lieu/truc-quan?bai=B25 → Đọc hình.
- Steps: đặt 1440×900; mở URL; click Đọc hình; cuộn vùng Hình tổng quan vào viewport; chụp. Đổi 390×844 và chụp. Click điểm trên hình 2→3→1, Tab→Enter chọn 2; click Phóng to hình rồi Thu gọn hình.
- Evidence: evidence/b25-before-1440.png (11:54 UTC): nút 1 chạm phần dưới chữ Dữ liệu kì vọng; evidence/b25-before-390.png: nút 1 phủ tiêu đề/nhãn bảng. evidence/b25-enlarged-390.png: nút 1 vẫn chạm tiêu đề khi phóng to. ĐÃ MỞ cả ba file bằng view_image và trực tiếp xem ảnh. Snapshot hỗ trợ chứng cứ chọn điểm/aria-pressed, không thay ảnh.
- Source paragraph: hd P9–10, P19–20; bài báo P60–62, P88–89; acceptance US01. Bài báo P88 yêu cầu xem lớn nhưng thao tác phóng to chưa giải quyết hoàn toàn vị trí điểm.
- Tác động dạy/học: học sinh khó đọc nhãn dữ liệu và nối bảng với đồ thị khi tự học; giáo viên phải giải thích phần bị nút phủ. Nội dung chữ dưới hình giúp đọc thêm nhưng chưa đóng lỗi hình.
- Acceptance: thử 390×844,768×1024,1024×768,1280×900,1440×900; ở thường/phóng to điểm 1–3 không che chữ, bảng, đường đồ thị; điểm được chọn bằng chuột và bàn phím, focus thấy rõ; nội dung tương ứng đúng; thu gọn trở lại. Năm kích thước là tiêu chí đóng đề xuất, CHƯA KIỂM CHỨNG đủ năm trong smoke này.

## Actual tests

1. B25: hai kích thước baseline đã chụp/mở. Click điểm 1–3 thành công; snapshot ghi nội dung tương ứng, Tab từ điểm 1 rồi Enter chọn điểm 2, focus trên điểm 2 và hai nút điểm 2 cùng aria-pressed=true. Phóng to chuyển nhãn Thu gọn hình/vùng cuộn; Thu gọn hoạt động. Chưa kiểm mọi phím/chế độ ở desktop.
2. /hoc-lieu ở390×844: nhập zzzz_W2_UI9_no_resource_20261005 →0 học liệu, có Chưa tìm thấy học liệu phù hợp/Xóa bộ lọc. Click Xóa bộ lọc →search trống và89 học liệu. Nhập lại để chụp đúng vùng kết quả, sau đó clear bằng fill trống. Có trạng thái thông báo; chưa thử trình đọc màn hình.
3. Menu mobile: click Mở menu; Tab đi tới Hình thức lớp học đảo ngược với viền focus rõ. Escape đóng menu, focus trở lại nút Mở menu, aria-expanded=false. Không vào trang tài khoản.
4. ĐÃ MỞ bằng view_image: evidence/search-empty-390.png (ảnh đầu chỉ có ô tìm kiếm, không dùng chứng minh vùng0 kết quả); evidence/search-empty-result-390.png (ảnh bổ sung vùng kết quả); evidence/menu-tab-390.png; evidence/menu-escape-390.png. Hai ảnh menu xác nhận focus/đóng trực quan. Không kết luận thao tác chỉ vì ảnh được lưu.

## Giới hạn và bàn giao

Một lỗi mới được ghi trong phạm vi này; kho tìm kiếm/clear/menu không phát hiện lỗi chặn ở ca đã thử. Không kiểm thử đủ5 kích thước, toàn17 mô phỏng, tài khoản, tải/AI, nghiên cứu người thật hoặc toàn khả năng tiếp cận. Không nghiệm thu toàn bộ; không tính lượt hẹp này thành hai review cuối. Browser chạy được. Một snapshot selector quá rộng bị strict-mode violation, không lặp; đã dùng selector input[type=search] và DOM/snapshot chính xác. Shell heredoc bị chặn tạo temp, chuyển apply_patch chỉ ghi TMP; không dùng escalation. Báo cáo nháp report-draft.md và final report-final.md đều ở TMP được giao; ảnh/snapshot ở đường dẫn evidence tuyệt đối cùng TMP. Dừng sau smoke được giao.
