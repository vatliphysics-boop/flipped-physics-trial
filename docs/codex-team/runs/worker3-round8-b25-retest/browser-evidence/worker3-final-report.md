# Worker 3 — vòng 8, B25 video

Trạng thái: hoàn tất ca được giao, chờ trưởng nhóm review. Không phải nghiệm thu cuối toàn web. Đã đọc toàn bộ ba tài liệu trích xuất trong yêu cầu và AGENTS, TEAM, acceptance, regulations, detailed-report vòng 7 trước thao tác. Review chỉ đọc workspace; không sửa code/DOCX/mô hình khoa học, không đăng nhập, không DB/migration, không commit/reset/clean, không đọc auth/secrets/env. Báo cáo và bằng chứng mới chỉ ghi thư mục tạm được phép.

## Actual tests vòng này

Trình duyệt thật, localhost:3001, viewport 390×844. Trang /hoc-lieu/truc-quan?bai=B25 → Xem video → Mở video tại đây → Phát video trong iframe. Nguồn hiện Half-life | Physics | Khan Academy, kênh Khan Academy. Chờ 12 giây mỗi đoạn; thao tác/chụp làm tổng thời gian phát thực tế dài hơn thời gian chờ.

Khung hình chuyển từ thumbnail sang minh họa Trái Đất và hóa thạch; phụ đề tiếng Anh thay đổi từ “And this is Earth…” sang câu hỏi “How do we know these things?”. Nhấn k tạm dừng: hai snapshot b25-paused1.yml/b25-paused2.yml và hai bản đọc thanh tua b25-time1.json/b25-time2.json giữ 2%, cách nhau hơn 10 giây. Click Phát video tiếp, chờ 12 giây, k dừng: thanh tua tăng lên 5%, currentTime=36.683925 giây, duration=655.821 giây, paused=true. Hai lần đọc DOM media tiếp theo cách nhau hơn 10 giây đều giữ chính xác currentTime=36.683925, paused=true (b25-stable1.json/b25-stable2.json). Đây là bằng chứng thao tác và trạng thái media trên trình duyệt, không dùng đọc code để thay thao tác.

Đã chụp và mở xem b25-paused.png ở 390 px. Trình phát và nhiệm vụ đọc được; phụ đề Anh thực sự hiện trên ảnh. Nhiệm vụ: “Dừng sau mỗi chu kì bán rã. Từ 800 hạt, dự đoán số còn lại sau 1T, 2T, 3T; phân biệt số hạt N với tốc độ phân rã H.” Hướng dẫn hiện rõ video tiếng Anh, câu hỏi/hướng dẫn tiếng Việt, chọn phụ đề nếu tác giả cung cấp, dùng liên kết nguồn nếu không phát. Không xác nhận phụ đề Việt cho B25. Fallback có liên kết gDpyBifg6-s; không click/thử phát fallback vòng này. Không gặp hostname mới bị chặn trong ca này.

## Gộp bốn ca vòng trước

Vòng 7 TIMED_OUT sau B21–B24; giữ nguyên giới hạn đó. Bằng chứng gốc: docs/codex-team/runs/worker3-round7-video-retest-fix/detailed-report.md và all-evidence/. Không tái thử bốn trang này vòng 8; không khẳng định cùng hash phiên bản cuối.

| Ca | Bằng chứng vòng 7 | Kết luận giới hạn |
|---|---|---|
| B21 | Khung hình/phụ đề Anh đổi; paused1/2 giữ 0:45/11:23; resume tới 1:00; PNG đã xem | Phát/dừng/tiếp tục được trong đoạn thử; không xem toàn bộ/phụ đề Việt |
| B22 | paused1/2 giữ 0:25/2:59; resumed.yml tới 0:40; hình cân/nucleon và phụ đề Anh; PNG đã xem | Phát/dừng/tiếp tục được trong đoạn thử; không xem toàn bộ |
| B23 | Lần mở đầu www.youtube-nocookie.com đóng kết nối; đóng/mở UI tải được; paused1/2 giữ 0:17/8:01; resumed tới 0:32; PNG lỗi/paused đã xem | Có lỗi tải nhất thời, sau đó phát/dừng/tiếp tục được; không suy ổn định mọi mạng |
| B24 | Nhãn đúng nguồn sau sửa vòng 7; paused1/2 giữ 0:15/8:06; resume 0:32; phụ đề Việt thực sự hiện; fallback mở đúng ID/tên/kênh | Không xem toàn bộ hoặc kiểm độ chính xác toàn bộ phụ đề; không thử phát fallback |

## Vấn đề và tiêu chí đóng

W3-VID-01 — severity: Medium (khoảng trống kiểm chứng ngôn ngữ, không kết luận lỗi phần mềm). Trang: B21–B25, đặc biệt B25 vòng này. Steps: mở Video, phát đoạn đầu, đọc phụ đề và hướng dẫn. Evidence: b25-video.yml, b25-playing.yml, b25-paused.png; detailed-report vòng 7 ghi B21–B23 phụ đề Anh, B24 phụ đề Việt. Source paragraph: hd P3–5/P15; bài báo P98/P102; NCKH P121–122. Tác động dạy/học: nhiệm vụ Việt không tự chứng minh học sinh hiểu lời giải thích tiếng Anh để tự học độc lập. Acceptance: giáo viên kiểm ngôn ngữ/phụ đề các đoạn được giao, cung cấp hỗ trợ phù hợp và thử khả năng hiểu với học sinh dự kiến; không yêu cầu phụ đề Việt chỉ vì thiếu bằng chứng. Trạng thái: CHƯA KIỂM CHỨNG khả năng hiểu độc lập và nội dung/phụ đề toàn video.

W3-VID-02 — severity: Low (lỗi tải nhất thời vòng trước). Trang: B23. Steps: mở embed lần đầu; lỗi đóng kết nối; đóng/mở lại bằng UI. Evidence: all-evidence/B23-load.png, B23-open.yml và detailed-report vòng 7. Hostname: www.youtube-nocookie.com. Source paragraph: bài báo P102, hd P15. Tác động dạy/học: gián đoạn chuẩn bị bài; cần biết cách dùng nguồn thay thế. Acceptance: thử lại ở mạng/thiết bị lớp dự kiến, kiểm fallback phát được khi embed thất bại. Trạng thái: đoạn embed đã phục hồi và phát được vòng 7; độ ổn định/fallback B23 CHƯA KIỂM CHỨNG, không lặp thử vòng này.

## Kết luận và giới hạn

B25 ĐẠT ca thao tác phát/dừng/tiếp tục, đổi khung hình, tiến độ tăng và thời gian dừng ổn định ở 390 px đã xét. Gộp hồ sơ vòng 7: cả năm video có bằng chứng phát thật trong đoạn ngắn ở các lượt đã nêu. Không xem 10 phút/toàn video; không kiểm toàn bộ khoa học/phụ đề, hiểu của người học, tải đồng thời, mọi mạng/thiết bị/a11y, tài khoản/giao–nộp. Không chạy build/lint/tests phần mềm hoặc thử trang khác. Không tính đây là full final acceptance, hai lượt cùng hash hoặc bằng chứng hiệu quả dạy học. Tổng nghiệm thu giữ CHƯA ĐẠT theo acceptance.md; các mục ngoài phạm vi CHƯA KIỂM CHỨNG trong vòng này.

Evidence mới dùng đường dẫn tuyệt đối dưới /var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w3-f5BQC8/evidence/. Một lần selector đọc thanh tua bị strict-mode vì trùng slider âm lượng, đã đổi sang aria-label Thanh tua; không ảnh hưởng playback. Trưởng nhóm thu hồi bằng chứng và kiểm audit workspace theo TEAM.md; vòng này không xác lập hash web cuối hoặc quy thuộc thay đổi đồng thời của trưởng nhóm.
