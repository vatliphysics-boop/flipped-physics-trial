# Worker 3 — UI10 infographic và chọn vai

Ngày 05/10/2026. Mode fix, localhost:3001. **COMPLETED_PENDING_LEAD_REVIEW**; không đóng lỗi thay Worker2, nghiệm thu tổng vẫn CHƯA ĐẠT. Đã đọc toàn bộ ba tài liệu trích xuất và các hướng dẫn được cung cấp trong yêu cầu, AGENTS thực tế, TEAM/handoff thực tế; không tìm thấy AGENTS con trong src/docs/public. Đã đọc toàn bộ Next CSS và use-client guide trước code. Không đọc env/secrets, không submit tài khoản, không DB/migration/production/commit/reset/clean/DOCX.

## Phạm vi sửa

Chỉ sửa `src/components/learning/InteractiveInfographic.tsx` và `src/app/globals.css`. Bỏ toàn bộ button absolute trong ảnh, giữ danh sách số+tiêu đề ngoài ảnh, aria-pressed và aria-controls tới vùng explanation live. Toolbar và helper mô tả tổng quan, phóng to, cuộn bằng touch/bàn phím. Giữ nội dung quan sát/giải thích, SVG, tọa độ dữ liệu và các liên kết PNG/SVG/chỉnh sửa/tab mới. Không đổi mô hình khoa học.

Zoom làm ảnh rộng 200% vùng hiển thị, tối thiểu1200px; desktop thực sự tăng rộng, mobile đọc ở độ rộng gốc1200. Tổng quan vẫn toàn ảnh, không giới hạn chiều cao/cắt ảnh. Các nút chọn và zoom ít nhất44px; focus ngoài ảnh, tabs có padding4/gap12. CSS mới scoped `.interactive-infographic`; CSS radio scoped `.role-selector`, label relative/min-height44, input visually hidden bằng clip-path thay display:none, focus-visible ring trên label. Không sửa CSS menu/table khác; các thay đổi có sẵn trong globals không quy cho job này.

## Bằng chứng thực tế

Evidence root tuyệt đối: `/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w3-7Jyp8v/evidence/`. `actual-tests.json` ghi124 trạng thái browser thật và viewport thật. `check.mjs` ở TMP ghi chính xác thao tác. Chrome Playwright headless chạy qua Node bundled; lần launch sandbox thất bại, lần được auto-review cho phép đã hoàn tất. Browser MCP cũng hoạt động, B25 năm size/TabEnter/zoom có JSON riêng và snapshot.

Route infographic: `http://localhost:3001/hoc-lieu/truc-quan?bai=Bxx`. B25 1440×900,1280×720,768×1024,390×844,360×800; B21–B24 mỗi1440×900 và390×844. Mỗi tổ hợp: ảnh tổng quan, click từng button trong danh sách, Tab→Enter/Space, zoom→Tab vào region→ArrowRight/ArrowDown, thu gọn. Lưu `{Bxx}-{width}-fit.png`, `{Bxx}-{width}-zoom.png`; là ảnh element, không phải ảnh toàn viewport. B21 còn có các button lịch sử cùng class được script chọn; chưa gọi đó là thẩm định lịch sử.

Đã MỞ xem trực tiếp BEFORE: UI9 `/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w3-wwcQ6x/evidence/B25-before-1440.png`, `B25-before-390.png`; `/Users/vodoandangkhoi/Documents/WEB_WORKING_24-09/docs/codex-team/ui-review/lead-evidence/register-before-390x844.jpg`. AFTER đã MỞ xem: B21–B25 fit1440/390, B25 zoom1440/390, register390student và login390teacher. Các ảnh còn lại đã chụp nhưng chưa mở xem từng ảnh. Screenshot element dài có sticky header được Chrome chụp ở vị trí cuộn; không suy từ ảnh ghép này rằng header là overlay bên trong SVG.

## Vấn đề và kết quả

**UI-0001 — P2/Medium — Đọc hình B21–B25.** Steps: mở route theo bài, xem hình, chọn từng số ngoài hình, Tab/Enter đổi giải thích; resize theo danh sách trên. Evidence: `actual-tests.json`, B25 fit1440/390 và B21–B24 fit1440/390. Source: hd P9–10/P19–20; NCKH P121–122; bài báo P88–89/P103–110/P213. Tác động: trước sửa pin che heading/bảng/công thức/nhãn; sau sửa không còn button trong region (overlay=0 tất cả ca), ảnh giữ nguyên và explanation đổi theo lựa chọn. Acceptance: không control/focus che kiến thức, điểm vẫn chọn/giải thích đúng, đủ năm size và zoom. Sửa và smoke đã thực hiện; W2 cần review độc lập toàn acceptance.

**UI-0005 (W3-UI9-02) — P2/Medium — vùng bấm infographic.** Steps: click từng điểm, Tab→Enter/Space, đo bounding rect ở các size. Evidence: actual-tests.json, các ảnh fit. Source: bài báo P88–89/P197–199, US01, yêu cầu hit area44px trong job. Tác động: giảm khó chạm trên mobile. Acceptance: ≥44×44 CSS px, focus thấy rõ và không cắt/chồng ảnh. Min-height thực đo44px; desktop45px; width đều>44. Không cần giữ pin hoặc tăng kích thước tại tọa độ cũ. Chưa kiểm touch thật/screen reader; chờ W2.

**UI-0006 (W3-UI9-03) — P2/Medium — đọc ảnh mobile/zoom desktop.** Steps: mở tổng quan, nhấn Phóng to, Tab vào region, ArrowRight/Down, thu gọn. Evidence: actual-tests.json và B25 zoom1440/390. Source: hd P10/P20; NCKH P121; bài báo P88/P95/P109–110. Tác động: chữ SVG nhỏ ở fit mobile có đường đọc chi tiết rõ ràng. Acceptance: fit toàn ảnh, zoom thực tăng kích thước, cuộn được hai chiều và không mất nội dung. B25 desktop fit1040×607→zoom2076×1211; mobile fit296×173→zoom1200×700, region294×547; ArrowRight/Down ghi scrollLeft/Top40 (desktop1440 ca đầu4 do animation đang chạy). Thu gọn trả về fit. Zoom có viewport cắt phần đang xem theo thiết kế cuộn, không gọi đó là toàn ảnh; chưa đi đến mọi cạnh bằng touch/bàn phím. Tổng quan vẫn toàn ảnh. Chưa có bảng chữ responsive đầy đủ: root cân nhắc bổ sung dữ liệu/nhãn trục/công thức nguồn nếu cần khả năng đọc không phụ thuộc ảnh. Không tự biên soạn science.

**UI-0004 — P2/Medium — /login và /register chọn vai.** Steps: mở route mới ở1440×900/390×844; Tab đến radio, ArrowRight chọn student, ArrowLeft+Space về teacher. Không nhập/submit. Evidence: actual-tests.json và `{login|register}-{1440|390}-{student|teacher}.png`. Source: bài báo P197–199, US01/US02, TEAM_HANDOFF UI-0004; NCKH P96 về khả năng tiếp cận. Tác động: người dùng bàn phím chọn được không gian vai phù hợp. Acceptance: native radio tham gia Tab/arrows, checked đổi, focus rõ, tap target44. Cả4 ca checked/focused student rồi teacher đúng; computed display block; label188×44 desktop/143×44 mobile, outline solid3px. Chưa submit/auth/permission tests; chờ W2 đóng lỗi.

## Actual tests và giới hạn

Thao tác browser thật13 tổ hợp bài/size, fit/zoom/pan/thu gọn, click các điểm và Enter/Space;4 tổ hợp route/size chọn vai;124 trạng thái lưu. Kiểm tra eslint riêng component exit0, `tsc --noEmit --incremental false` exit0, `git diff --check` hai file exit0. Không build/production. Đây là kiểm tra kỹ thuật, không phải bài làm/nghiên cứu người học.

PNG/SVG/edit links giữ nguyên trong implementation và xuất hiện trong ảnh; CHƯA KIỂM CHỨNG tải file cuối/khả năng sửa bằng phần mềm SVG. CHƯA KIỂM CHỨNG browser zoom thật125/200%, screen reader, touch vật lý, mọi cạnh scroll, mọi trạng thái focus ở cả5size, đầy đủ17mô phỏng, tài khoản/DB/giao–nộp/phân quyền. Không dùng code thay bằng chứng thao tác cho các mục đó. Không đủ hai lượt W2 đầy đủ trên cùng hash.

SHA256 cuối hai file: globals.css `ad8ab541b665271dc5e03669700f7a23d28abf106f510d7b4318a58597cc9b65`; InteractiveInfographic.tsx `aae3a3d6250de97d8eba169281299c1276e6397b50d0223437c911db5a31fed8`. Không có audit hash toàn workspace đầu phiên; trưởng nhóm dùng audit điều phối, không quy thay đổi các file khác cho Worker3. Có bản draft ở TMP ngay sau sửa.
