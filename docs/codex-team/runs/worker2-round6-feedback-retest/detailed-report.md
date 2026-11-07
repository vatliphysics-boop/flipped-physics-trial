# Worker 2 vòng 6 — review giới hạn
AI phản biện sư phạm, không phải người tham gia nghiên cứu. Chỉ đọc workspace; không sửa DOCX/code/DB. Đã đọc toàn bộ ba trích xuất và hướng dẫn trong prompt, AGENTS tại workspace; không viết mã ứng dụng.

## Ca 1 B21 — ĐẠT trong phạm vi thử
Trang: http://localhost:3001/hoc-lieu/truc-quan?bai=B21, 390×844.
Mở infographic mới: lời nhắc chưa chọn hiện ngay, fieldset và nút kiểm tra cùng aria-describedby tới phần hướng dẫn tồn tại. Đặt focus ban đầu vào radio; Space chọn Số neutron, Tab tới kiểm tra, Enter trả “Chưa chính xác” và giải thích cùng Z=6, khác N/A. Focus radio rồi ArrowRight chọn Số proton, Tab/Enter trả “Chính xác” cùng giải thích. Đây là thao tác bàn phím sau đặt focus, không kiểm chứng toàn bộ tuyến Tab từ đầu trang hoặc trình đọc màn hình.
Bằng chứng: evidence/b21-empty.png, b21-correct.png (đã xem ảnh thực tế); snapshot page-2026-10-05T09-23-28-891Z.yml và page-2026-10-05T09-23-49-177Z.yml. Các đường dẫn này tương đối với thư mục tạm chứa báo cáo, không phải workspace.
Căn cứ: hd P12–14; NCKH P98,P122; bài báo P63,P134. Hướng dẫn hỗ trợ bắt đầu nhiệm vụ; giải thích giữ căn cứ khoa học để sửa quan niệm sai. Không phát hiện vấn đề ảnh hưởng tiêu chí ca 1. Chưa suy rộng cho mọi câu chẩn đoán.

## Ca 2 B24
ĐẠT trong phạm vi thử. Trang http://localhost:3001/hoc-lieu, 390×844: mở mục “B24 · Đóng vai thảo luận dự án điện hạt nhân”. Bốn tiêu chí hiện ngay trong nội dung mở, không cần mở một bảng phụ: lập luận khoa học; bằng chứng truy nguyên; giới hạn; phản biện/tự điều chỉnh. Hướng dẫn nhóm tự đối chiếu trước tải và GV ghi tiêu chí đạt, nội dung/cách sửa; không tự chấm điểm chính thức.
Giữ vai Nhà khoa học, nhập đủ bốn trường bằng Browser MCP, mỗi trường ghi MẪU GIẢ ĐỊNH DO AI. Nhấn Tải sản phẩm nhóm và đọc tệp tải thật B24-roleplay-nhom.txt: đủ vai, bốn tiêu chí nguyên văn và cả bốn nội dung đã nhập. Mẫu chỉ kiểm tra lưu/xuất, không được đánh giá là bài làm đạt của học sinh; phần nguồn trong mẫu chưa cung cấp đường dẫn cụ thể.
Bằng chứng: evidence/b24-criteria-full.png, b24-filled.png (đã xem ảnh thực tế, chữ và ô nhập đọc được ở 390 px); evidence/B24-roleplay-nhom.txt; snapshot page-2026-10-05T09-25-27-149Z.yml. Căn cứ: hd P24–25; NCKH P98,P135; bài báo P119–122,P162. Tiêu chí nối lập luận với bằng chứng, giới hạn và điều chỉnh, giúp GV nhận xét sản phẩm thay vì chỉ đếm thao tác. Không phát hiện vấn đề ảnh hưởng tiêu chí ca 2.

## Actual tests và giới hạn
Đã thực hiện hai ca trên Browser MCP: B21 trống/sai/đúng, aria-describedby và Space/ArrowRight/Tab/Enter; B24 mở tiêu chí, nhập giả định, tải TXT và đối chiếu nội dung. Đã xem thực tế năm ảnh mobile (b21-empty, b21-correct, b24-criteria, b24-filled, b24-criteria-full). Không dùng đọc code làm bằng chứng thao tác.
Playwright bundled không chạy do thiếu chromium_headless_shell-1234; chuyển sang Browser MCP thành công. Hai lần tạo script bằng heredoc bị sandbox chặn tạo tệp tạm; script thử được lưu bằng apply_patch trong TMP. Không cài browser, không đọc auth/secrets/env, không thao tác tài khoản/DB. Chỉ ghi báo cáo và bằng chứng vào TMP được phép.
Không thử lịch sử, video, DB, desktop, trình đọc màn hình, nhóm thật hoặc hiệu quả dạy học. Luồng private CHƯA KIỂM CHỨNG. Không có thẩm định người thật hay dữ liệu nghiên cứu. Không xác nhận hash phiên bản cuối; không tính lượt này là một trong hai lượt đầy đủ cuối. Kết luận chỉ hai tiêu chí retest đạt trong các tình huống đã xét; không thay trạng thái nghiệm thu toàn bộ CHƯA ĐẠT.
Không có vấn đề mới cần ghi ID/severity/acceptance trong hai ca; các hạn chế trên là phạm vi kiểm thử, không gán thành lỗi sản phẩm thiếu chứng cứ.
