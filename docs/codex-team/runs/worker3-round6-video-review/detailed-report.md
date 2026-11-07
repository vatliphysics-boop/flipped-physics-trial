# Worker 3 round 6 video review
Đã đọc toàn bộ ba tài liệu trích xuất và hướng dẫn liên quan. Read-only workspace. Checkpoint: đang kết nối browser; B21–B25 CHƯA KIỂM CHỨNG.

B21 checkpoint: tab Video mở, nguồn Khan Academy https://www.youtube.com/watch?v=bVlwH1kfDeg; nhiệm vụ vẽ đường alpha/giải thích tiếng Việt; có hướng dẫn phụ đề nếu tác giả cung cấp và link nguồn. Iframe tải nhưng chưa có bằng chứng thời gian tiến. Console ERR_BLOCKED_BY_CLIENT cho google/gstatic/ggpht; CHƯA KIỂM CHỨNG phát. Ảnh evidence/B21-1280.png.

B22 checkpoint: mở video và nhấn Play thật; 0:00/2:59 không tiến, spinner chặn lần click controls tiếp. Nguồn FuseSchool, nhiệm vụ nhận diện neutron tới/mảnh/neutron sinh ra; hướng dẫn tiếng Việt/phụ đề có điều kiện và fallback. Media googlevideo bị ERR_BLOCKED_BY_CLIENT. CHƯA KIỂM CHỨNG phát/pause. Evidence B22-ui.txt, B22-play.yml, B22-retry.yml, B22-play-1280.png. B21 sau Play 0:00/11:24 cũng bị cùng chặn.

B23 checkpoint: Intro to radioactive decay/Khan Academy; nhiệm vụ bảng ba tia và so sánh biểu diễn; cùng hướng dẫn phụ đề/fallback. Click Play thật, vẫn 0:00/8:02; CHƯA KIỂM CHỨNG. Evidence B23-ui.txt/B23-play.yml/B23-play-1280.png.

B24 checkpoint: How do nuclear power plants work?/TED-Ed; nhiệm vụ chuỗi chuyển hóa, lưu ý số liệu năm 2017. Play thật, 0:00/8:07; CHƯA KIỂM CHỨNG. Evidence B24-ui.txt/B24-play.yml/B24-play-1280.png.

B25 checkpoint: Half-life/Khan Academy; nhiệm vụ dự đoán 800 hạt qua 1T/2T/3T và phân biệt N/H. Play thật, 0:00/10:56; CHƯA KIỂM CHỨNG. Evidence B25-ui.txt/B25-play.yml/B25-play-1280.png.

## Kết quả cuối — COMPLETED_PENDING_LEAD_REVIEW
Ngày 05/10/2026; web phát triển http://localhost:3001. Trạng thái HD01/HD05: CHƯA ĐẠT kiểm chứng đầy đủ; 5/5 đã thao tác mở iframe và nhấn Play thật, 0/5 xác nhận thời gian tiến/hình chuyển động; phát/pause cả năm CHƯA KIỂM CHỨNG.

Đã đọc toàn bộ hd.docx, ĐÃ SỬA - NCKH.docx và BAI_BAO_KHOA_HOC_CAP_NHAT_HOC_LIEU.docx từ bản trích xuất đầy đủ trong yêu cầu; đọc AGENTS.md, TEAM.md, acceptance.md, regulations.md trên đĩa. Không viết code nên không áp dụng bước đọc guide Next trước viết code. Không đọc auth/secrets/env values; không login, CAPTCHA, session người thật, DB hay production. Tất cả tác vụ ghi của lượt này nằm trong thư mục tạm được giao; không ghi báo cáo vào workspace.

### Actual tests
Thao tác cho từng bài: chọn B21..B25 qua UI → tab Xem video → đọc tên/kênh/nhiệm vụ/hướng dẫn → Mở video tại đây → click nút Play bên trong iframe YouTube thật → chụp ảnh và snapshot controls/thời gian → mở Xem trên YouTube từ UI và kiểm tra trang mới. Có 5 lượt Play thành công ở mức click, không có bằng chứng phát. B22 thử click controls tiếp bị spinner intercept; không coi click bị chặn là pause thành công.

| Bài | Nguồn mở qua fallback | Nhiệm vụ tiếng Việt đã nhìn thấy | Thời gian sau Play trong iframe | Kết quả |
|---|---|---|---|---|
| B21 | Khan Academy — bVlwH1kfDeg | Vẽ hai đường alpha và giải thích phần lớn đi thẳng, số ít lệch mạnh | 0:00/11:24 | CHƯA KIỂM CHỨNG phát/pause |
| B22 | FuseSchool — D91T-B-PVE0 | Nhận diện neutron tới, mảnh, neutron sinh ra; lưu ý kênh khác mô phỏng | 0:00/2:59 | CHƯA KIỂM CHỨNG phát/pause |
| B23 | Khan Academy — P_SD5Rt6XMk | Bảng ba bức xạ, A/Z, đâm xuyên; so sánh biểu diễn | 0:00/8:02 | CHƯA KIỂM CHỨNG phát/pause |
| B24 | TED-Ed — R7WPEYGr1Vs | Ghi chuỗi lò–turbine–máy phát; lưu ý số liệu thị phần năm 2017 | 0:00/8:07 | CHƯA KIỂM CHỨNG phát/pause; tên nguồn lệch |
| B25 | Khan Academy — gDpyBifg6-s | Dự đoán từ 800 hạt qua 1T/2T/3T; phân biệt N/H | 0:00/10:56 | CHƯA KIỂM CHỨNG phát/pause |

Cả năm có hướng dẫn video tiếng Anh, câu hỏi tiếng Việt, chọn phụ đề nếu tác giả cung cấp, dùng link nguồn nếu không phát. Đây là hướng dẫn có điều kiện, không xác nhận có phụ đề tiếng Việt; chưa thử trường hợp không có phụ đề và chưa xác nhận học sinh hiểu video độc lập.
Fallback: 5/5 click mở đúng trang YouTube công khai và tên/kênh tương ứng; không xác nhận phát qua fallback. Snapshot B24-fallback có controls quảng cáo 0:00/0:30; không tính quảng cáo/title là video bài học đã phát.

Đã chụp 7 PNG thật, xem thực tế 6 ảnh (B21-play, B22/B23/B24/B25-play-1280, B25-390). 1280×900 cho cả năm; 390×844 cho B25. Mobile document scrollWidth=390, innerWidth=390; nhiệm vụ/hướng dẫn/link nguồn đọc được, không tràn ngang toàn trang trong ca này. Thanh chọn bài cuộn ngang riêng. Ảnh full-page có vị trí header cố định theo scroll; không suy luận thành lỗi header từ ảnh ghép. Chưa kiểm tra toàn bộ a11y hoặc mobile cho bốn bài còn lại.

### W3-R6-ENV01
- Severity: Blocker kiểm chứng (không xác nhận là lỗi sản phẩm).
- Trang: /hoc-lieu/truc-quan?bai=B21..B25, tab Video.
- Steps: các bước actual tests ở trên; Play thật, đợi qua các thao tác snapshot/ảnh, kiểm tra 0:00 và spinner.
- Evidence: B21-play.yml/B21-play.png; B22-play.yml/B22-retry.yml/B22-play-1280.png; B23/B24/B25-play.yml và PNG tương ứng; console-2026-10-05T09-02-19-422Z.log; media-network.txt.
- Quan sát: YouTube/YouTube-nocookie tải title/player metadata, nhưng media tới các host rr* googlevideo.com bị ERR_BLOCKED_BY_CLIENT.Inspector. google.com/gstatic/ggpht cũng có tài nguyên bị chặn. Thêm hai origins iframe chưa đủ để tải media. Không quy kết nhà cung cấp yêu cầu CAPTCHA/tài khoản vì chưa thấy bằng chứng đó.
- Source paragraph: hd P3–5/P15; bài báo P98/P102, P200–202; acceptance HD01/HD05.
- Tác động dạy/học: chưa chứng minh học sinh xem được hoạt hình và dừng để trả lời nhiệm vụ trong môi trường này.
- Acceptance: trưởng nhóm cấu hình môi trường browser cho các host media công khai thực tế cần thiết, rồi thử lại đủ năm: thời gian tăng và hình phát, pause giữ thời gian, tiếp tục phát; xác nhận phụ đề/ngôn ngữ và fallback. Không sửa code để né chặn mạng.
- Exact UI files đề xuất sửa: [].

### W3-R6-UI01
- Severity: Low/P3 — sai lệch nhãn tên nguồn B24.
- Trang: /hoc-lieu/truc-quan?bai=B24 → Xem video.
- Steps: đọc tên thẻ trước mở (How do nuclear power plants work?) → Mở video tại đây → nhìn tên YouTube → click Xem trên YouTube và đọc heading.
- Evidence: B24-ui.txt ghi How do nuclear power plants work?; B24-play-1280.png và B24-fallback.yml ghi Những vấn đề của năng lượng hạt nhân - M. V. Ramana và Sajan Saini, cùng ID R7WPEYGr1Vs.
- Source paragraph: hd P3–5/P15; bài báo P98/P102 (giữ tên/kênh, đối chiếu thông tin YouTube).
- Tác động dạy/học: khó truy nguyên nguồn theo tên, người học có thể kỳ vọng video chỉ giải thích cấu tạo nhà máy. Chưa kết luận nhiệm vụ không phù hợp nội dung: chưa phát được video.
- Acceptance: đối chiếu tên gốc của R7WPEYGr1Vs, dùng tên nguồn chính xác (có thể kèm bản dịch và nhãn nhiệm vụ riêng); mở lại UI/fallback thấy thống nhất; giáo viên kiểm tra video khi media hoạt động trước giao.
- Exact UI file cho trang đang review: src/lib/visual-learning.ts (dòng videoTitle B24). Tìm kiếm đọc-only còn thấy tên tương tự src/data/nuclear-learning.json:249; ngoài phạm vi UI đang kiểm tra, trưởng nhóm đối chiếu trước quyết định giao sửa.
- Không sửa file trong lượt này.

### Evidence và giới hạn
Root evidence tuyệt đối: /var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w3-Ja5CwN/evidence. Các tên evidence ở trên đều tương đối với root này. Browser screenshot/snapshot/evaluate/network đã dùng filename tuyệt đối; snapshot tự sinh của MCP cũng nằm trong evidence.
Playwright standalone bundled không có headless-shell; thử channel Chrome sạch trong sandbox bị SIGABRT, không dùng profile người thật và không cài browser. Review thực tế hoàn tất bằng browser MCP. Không sửa cấu hình origins MCP trong phiên vì không có công cụ cấu hình được cung cấp; bằng chứng cho thấy hai origins iframe truy cập được, media origins vẫn bị chặn.

Không chạy software tests/build/lint vì review thao tác không sửa code; không dùng đọc code thay bằng chứng phát. Chỉ đọc hai vị trí metadata để map exact file cho vấn đề UI đã thấy. Chưa xem hết video, chưa kiểm chứng âm thanh, pause/resume, phụ đề tiếng Việt, phù hợp nội dung toàn video, mạng trường/lớp, tài khoản/DB hay hiệu quả học tập. Không tuyên bố HD01/HD05 ĐẠT và không suy rộng ảnh 390 px cho mọi thiết bị.

Hash metadata lúc cuối (không phải hash toàn phiên bản web, không đáp ứng US03):
src/lib/visual-learning.ts: 17e67d6916882d80f944025cb38460e988872c23133a581674718eda7a64d1a2
src/data/nuclear-learning.json: 3cfe32faeb71e9f2d59fb5dec0160aed5ecb51c0dd5094f7b86bf1ba8fcd0710
Không có audit hash toàn workspace đầu/cuối trong lượt này; không khẳng định đã chứng minh không có thay đổi từ tiến trình khác.
