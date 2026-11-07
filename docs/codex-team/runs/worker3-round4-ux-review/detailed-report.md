# Worker 3 — vòng 4 review UX/3D

05/10/2026; browser MCP trên localhost:3001. Review công khai đã thực hiện; **chưa đủ nghiệm thu US01/US03**. Không có lỗi UX sản phẩm được xác nhận trong các trường hợp đã xét. Exact UI files đề xuất sửa: **[]**. Không đánh giá mô hình khoa học hoặc hiệu quả dạy học.

Đã đọc toàn bộ ba bản trích xuất hd, NCKH, bài báo và AGENTS/TEAM/acceptance trong yêu cầu. AGENTS/TEAM/acceptance cũng được đọc từ filesystem. Không viết code, đăng nhập, đọc auth/secrets/env values, ghi DB, commit, reset/clean hoặc dùng production.

## Actual tests — 13 nhóm thao tác

| Nhóm | Thao tác và kết quả | Evidence |
|---|---|---|
| Trang chính | Mở 1280×900 và 390×844, Tab focus brand có outline | home390.png; home1280.png đang ở root workspace |
| Kho desktop | Qua link Học liệu & 3D; chọn B21–B25. Status/article lần lượt 24/21/24/24/20, có mục dùng chung; scrollWidth 1280 | snapshots 08-20-35 đến 08-21-01 |
| Tìm kiếm trống | B25, nhập zzzz-no-resource: 0 học liệu, không card kết quả | catalog-empty1280.png đang ở root workspace |
| Kho mobile | Mở menu di động rồi Escape; menu đóng, focus trở lại menu; scrollWidth 390 | catalog390.png; snapshot 08-28-57 |
| Infographic B22 | Điểm 1 → Tab → Enter: kích hoạt điểm 2, nội dung quan sát/giải thích đổi | snapshot 08-34-07, tool evaluate |
| Lab B22 | Start, pause, bước cuối, góc Từ trên, reset; canvas có cảnh thật; nhãn proton/neutron và thời gian mô hình | fission-final1280.png, fission-final390.png; snapshots 08-21-59, 08-22-02, 08-22-09, 08-22-58 |
| Timeline | Slider → ArrowLeft: 3,95 s, status đổi sang kích thích/biến dạng. Chọn bước cuối: 7 s | snapshot 08-22-14, evaluate, snapshot 08-34-32 |
| B23 trực quan | Tab 3D mở mô phỏng các tia; đồ thị được mở riêng từ kho | snapshot 08-23-05 |
| Đồ thị B23 | Kho → B23 → Khảo sát đồ thị. T=30 s/N0=1000: bảng 30/500, 60/250, 90/125. Home + 11 ArrowRight đặt T=60: lambda 0,0116 s^-1, tại t=30 còn 707,1. scrollWidth 390. Chưa đổi N0 | snapshot 08-23-43, evaluate; graph390.png đang ở root workspace |
| Notebook | B23/Ghi & giải thích: 4 textarea có tên. Nhập dấu W3 review vào Dự đoán, mở lại URL/tab: còn nguyên. Đã xóa nội dung thử sau xác nhận; chỉ lưu trình duyệt | notebook-reloaded1280.png; snapshots 08-26-53, 08-27-05 |
| Bàn soạn | Theo link kho; xem 1280/390, mở Mẫu B23; trường hai vai/sản phẩm/đánh giá/ba pha hiện được. Chưa thử lưu/xuất | plan1280.png, plan390.png, plan-B23.yml |
| Không gian GV | Theo link menu bàn soạn /hoc-lieu/ai-giao-vien; ngân hàng/phiếu ba pha mở công khai. Mẫu B23 → Chỉnh phiếu; scrollWidth 390 | teacher1280.png, teacher390.png, worksheet390.png, snapshot 08-31-51 |
| Chuẩn bị giờ học | Chỉnh hoạt động → kiểm tra kế hoạch: đủ trường, 45 phút; Tab bước 1 có outline 3px. Không tải Word hay coi kiểm tra quy tắc là thẩm định sư phạm | preparation390.png, plan-check390.png, snapshot 08-32-52 |

Ảnh đã mở để xem: home390, catalog390, plan390, plan1280, fission390, fission-final1280, graph390. Các ảnh khác đã chụp thật nhưng chưa đọc từng chi tiết. Full-page screenshot có thể đặt thanh fixed vào giữa ảnh theo vị trí cuộn; không coi riêng hiện tượng này là lỗi web.

## Checkpoint còn mở — không phải lỗi UX web

| ID / severity | Trang / steps | Evidence | Source paragraph | Tác động dạy/học | Acceptance / exact UI files |
|---|---|---|---|---|---|---|
| W3-V4-C01 / giới hạn kiểm chứng | Luồng riêng qua lớp; không đăng nhập do chưa có tài khoản thử/DB phát triển xác minh | 0 giao/nộp hoặc ghi DB; notebook chỉ local | NCKH P122,P150,P163; bài báo P75,P128,P204–205,P215–216 | Chưa xác nhận GV nhận sản phẩm hoặc tính riêng tư | Cấp môi trường/tài khoản thử rõ ràng, thử hai vai. CHƯA KIỂM CHỨNG; không đề xuất file UI từ thiếu bằng chứng |
| W3-V4-C02 / giới hạn kiểm chứng | Mất mạng/lỗi tải, cảm ứng thật, toàn bộ keyboard/a11y, tốc độ/mọi góc nhìn, k/feedback | Đã xem trạng thái sẵn sàng/start/pause/reset/trống; chưa gây lỗi mạng, dùng screen reader, đổi N0 hoặc thử đầy đủ k/câu hỏi | hd P6–14,P19–20; bài báo P67–68,P91–95,P109–110,P197–199 | Chưa xác nhận mọi HS dùng độc lập khi thiếu mạng hoặc cần công nghệ hỗ trợ | Thử trường hợp còn lại. Không suy rộng 390px thành mọi thiết bị. CHƯA KIỂM CHỨNG; chưa có exact UI file cần sửa |
| W3-V4-C03 / giới hạn nghiệm thu | Hai lượt cùng hash | Chỉ một lượt review, không chốt hash mã nguồn đầu/cuối | TEAM; bài báo P68,P215–216 | Chưa đủ bằng chứng nghiệm thu cuối | Hai lượt Worker 2 cùng hash, không lỗi mới; không phải lỗi web |
| W3-V4-C04 / sự cố reviewer | Screenshot tên tương đối đầu phiên ghi sáu PNG vào root workspace; mv sang tạm bị automatic approval review từ chối | home1280.png, catalog-empty1280.png, fission390.png, fission1280.png, graph390.png, notebook390.png. Lý do: chuyển file là mutation vi phạm review không sửa workspace. Đã hỏi xin phép chuyển, chưa có trả lời | Quyền review [] của yêu cầu; TEAM read-only; bài báo P67–68 | Không đổi chức năng học; vi phạm nơi lưu bằng chứng, cần xử lý audit | Cho phép chuyển đúng sáu PNG do lượt này tạo hoặc trưởng nhóm thu hồi; không tự bypass, không sửa/xóa file khác |

## Actual tests và giới hạn cuối

13 nhóm thao tác thực tế, không phải bộ 58 test phần mềm lịch sử. Browser MCP thành công, không còn blocker approval-never vòng 2. Lỗi selector/strict-mode của reviewer không được gán lỗi web. Các file UI chỉ được tìm tên bằng rg; không đọc logic thay bằng chứng thao tác.

Có **18 ảnh thật: 12 trong evidence tạm, 6 còn ở root workspace** vì automatic review chặn dọn. Không có thay đổi code/tài liệu/DB; tuy nhiên không được tuyên bố workspace hoàn toàn không thay đổi do sáu PNG. Báo cáo này ghi ở thư mục tạm, không ghi report.md trong workspace. Không thẩm định toàn bộ khoa học, không thử tài khoản/độ tải/nghiên cứu người học hoặc kết luận hiệu quả dạy học. Danh sách exact UI files đề xuất sửa vẫn **[]**.
