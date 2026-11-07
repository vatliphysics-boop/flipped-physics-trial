# Worker 3 — UI-0001 smoke và nguyên nhân

Ngày 05/10/2026; thao tác browser 11:54–11:59 UTC (18:54–18:59 giờ Việt Nam). Mode review, không sửa workspace, không DOCX/DB/env/auth, không commit. Đã đọc toàn bộ ba bản trích xuất trong yêu cầu và AGENTS/TEAM/acceptance/regulations/CHECKPOINT/USER_GUIDE/curriculum-matrix. Đọc AGENTS thực tế; tìm không thấy AGENTS con trong src/public/docs. Đọc Next guide `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` trước đề xuất. Browser MCP hoạt động; evaluate chỉ đọc hình học/trạng thái, không sửa DOM hay giả zoom.

Kết luận: **UI-0001 tái hiện, CHƯA ĐẠT**. Đây là lỗi lớp điều khiển chung đặt trên nội dung SVG, không phải sai số liệu khoa học. Có cùng nguy cơ trên B21–B25; B23/B24 cũng thấy che nhãn. Phóng to có ích cho chữ mobile nhưng chưa giải quyết pin chồng nội dung.

## Bằng chứng và ca thực tế

Tất cả filename bên dưới nằm trong thư mục tuyệt đối `/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w3-wwcQ6x/evidence/`. Route mỗi bài là `http://localhost:3001/hoc-lieu/truc-quan?bai=Bxx`, state Đọc hình, thu gọn, điểm 1 chọn nếu không ghi khác. Snapshot browser có URL; JSON state có ISO time, viewport và bounding boxes. Ảnh là screenshot thật và đã xem trực tiếp bằng view_image.

| Viewport B25 | Ảnh vùng hình | Nhận xét trực tiếp |
|---|---|---|
| 1440×900 | B25-before-1440.png | Pin 1/vòng chọn chạm phần dưới chữ Dữ liệu kì vọng; pin 2 nằm trên vùng đồ thị; pin 3 trên panel công thức |
| 1280×720 | B25-before-1280.png | Pin 1 che nhiều hơn phần dưới heading |
| 768×1024 | B25-before-768.png | Heading bị pin 1/vòng chọn che rõ; pin 3 gần công thức |
| 390×844 | B25-before-390.png | Pin 1 che heading, vùng đầu bảng; pin 3 che công thức đầu; chữ bảng/đồ thị rất nhỏ |
| 360×800 | B25-before-360.png | Che heading/bảng/công thức nghiêm trọng hơn do hình hẹp |

Có thêm ảnh viewport đúng 1440×900/390×844: B25-before-1440-viewport.png, B25-before-390-viewport.png. Ảnh vùng hình có kích thước theo element, không phải toàn viewport; JSON B25-1440/1280/768/390/360-state.json xác nhận viewport. Không nhận ảnh element là ảnh màn hình đủ kích thước.

| Bài / ảnh 1440 và 390 | Mẫu pin kiểm tra bằng ảnh |
|---|---|
| B21 — B21-1440.png / B21-390.png | Pin 2 chèn đường tán xạ đỏ, pin 3 gần/chèn cụm nucleon; mobile pin chiếm diện tích lớn hơn |
| B22 — B22-1440.png / B22-390.png | Pin 3 tại đầu mũi tên neutron; mobile pin 1 gần/chèn vùng hạt nhân U-235. Không thấy pin che phương trình bảo toàn phía dưới trong các ảnh này |
| B23 — B23-1440.png / B23-390.png | Pin 1 chạm/che nhãn Giấy, pin 2 trên vật chắn nhôm, pin 3 trên chì. Mobile nhãn Giấy khó đọc vì pin |
| B24 — B24-1440.png / B24-390.png | Pin 3 chèn đầu nhãn Máy phát; pin 1 chèn bộ phận lò, pin 2 gần đường trao đổi |
| B25 — ảnh năm size | Pin 1 trên heading/bảng, pin 2 trong vùng graph, pin 3 panel formula; mobile che công thức |

Đã mở và chụp đủ năm hình. Đã xem tất cả ảnh B21–B25 desktop/mobile và năm ảnh B25. Mẫu heading/formula/table/graph được kiểm tra qua B25; không suy rằng pin 2 đang che đường cong ở 1440 vì ảnh cho thấy nó ở vùng trống giữa các gridline.

## Vấn đề

**UI-0001 — P2/Medium — B25 Đọc hình và cơ chế pin chung.** Steps: mở route B25, chọn Đọc hình (mặc định), giữ hình thu gọn, quan sát pin 1; lần lượt resize năm size trên. Evidence: B25-before-*.png và state JSON; B23/B24 ảnh đối chiếu. Source paragraph: hd P9–10/P19–20; NCKH P121–122; bài báo P88–89/P103–110/P213. Tác động dạy/học: học sinh khó xác định tiêu đề bảng, đọc công thức và đối chiếu dữ liệu với đồ thị; pin lấn đối tượng cần quan sát. Acceptance: trên cả B21–B25, năm size, mọi điểm chọn/không chọn/focus, thu gọn/phóng to, không pin hoặc vòng focus che heading, công thức, ô bảng, nhãn trục, đường/điểm graph hay thành phần sơ đồ có ý nghĩa; không đổi nội dung khoa học.

**W3-UI9-02 — P2/Medium — B21–B25 vùng bấm nhỏ.** Steps: mở từng bài; đo button pin bằng DOM đọc-only và snapshot; so sánh 1440/390. Evidence: B21–B24-state.json, B25-*-state.json, B25-390-snapshot.md. Desktop 34×34 CSS px, mobile 30×30; ring/shadow không tăng hit area. Source paragraph: bài báo P88–89/P197–199, USER_GUIDE mục Bàn phím, US01; yêu cầu job control click area 44px. Tác động: khó chạm chính xác, đặc biệt gần dữ liệu thu nhỏ. Acceptance: tất cả control tương tác infographic có hit area ít nhất 44×44 CSS px, khoảng cách đủ để không bấm nhầm, focus thấy rõ và không chồng nội dung. Không chỉ tăng pin lên 44 tại tọa độ cũ: cách này sẽ tăng che khuất.

**W3-UI9-03 — P2/Medium — mobile ảnh tổng quan.** Steps: B25 ở 390/360 và B21–B24 ở 390, giữ thu gọn; đọc heading, formula, bảng/trục; phóng to B25. Evidence: ảnh mobile và B25-zoom-390.png. Source paragraph: hd P10/P20; NCKH P121; bài báo P88/P95/P109–110. Tác động: nội dung SVG 16–24 đơn vị được co xuống vài CSS px, khó đọc độc lập; alt và phần giải thích không thay toàn bộ bảng/graph. Acceptance: responsive vẫn có cách đọc đầy đủ nội dung, đơn vị, nhãn và dữ liệu trên mobile; phóng to/cuộn được bằng touch và bàn phím, không mất nội dung; có bản chữ/bảng thích ứng nếu cần. Không đòi toàn SVG 1200 đơn vị phải nhét vừa 360 mà vẫn đọc được.

## Root cause đã đối chiếu mã với browser

`src/components/learning/InteractiveInfographic.tsx` đặt img rồi các button absolute ngay trong `.infographic-image`, left/top lấy `s.x/s.y` phần trăm. `src/app/globals.css:2222` cho ảnh width 100%, height auto; pin translate(-50%,-50%), 34px, active outline 3px và shadow. `:2237` đổi pin thành 30px dưới 700px. Không có vùng dành riêng, collision avoidance hoặc quy tắc ưu tiên nội dung SVG.

`src/lib/visual-learning.ts` B25 điểm 1 x15/y31. SVG viewBox 1200×700 nên tâm tương ứng (180,217). Trong `public/illustrations/B25-diagram.svg`, heading bắt đầu x65 baseline y203, font24; pin/vòng chọn ở ngay bên dưới heading và phủ phần dưới chữ khi render. Ở viewport1440 ảnh rộng1040, scale≈0,867, pin34 tương đương39,2 đơn vị SVG (chưa tính outline). Mobile390 ảnh rộng294, scale≈0,245, pin30 tương đương122,4 đơn vị SVG. Vì nội dung/ khoảng cách co theo ảnh còn button không co tương ứng, che khuất tăng mạnh. Đây là phối hợp vị trí và kích thước điều khiển; không có bằng chứng Next hoặc tải SVG lỗi.

Tất cả năm SVG đã được đọc toàn bộ qua parse XML (title/desc, elements và text khi đọc nguồn B25, cấu trúc/text các bài còn lại); cùng viewBox 1200×700. Cùng component/CSS áp dụng cho cả năm bài. Không có thay tọa độ, SVG hoặc khoa học trong phiên này.

Zoom riêng của component: `.is-zoomed` max-height560, image min-width1000. Tại1440 ảnh vốn1040 nên nút Phóng to không tăng bề rộng, chỉ tạo vùng cuộn/cắt chiều cao; tại390 ảnh tăng1000, viewport294 nên chữ dễ đọc hơn nhưng pin1 vẫn gần/chạm heading. B25-zoom-1440/390.png xác nhận; không coi zoom là sửa UI-0001.

## Tương tác

Đã click pin1 B25, Tab→Enter sang pin2: focus Điểm2, aria-pressed true, giải thích đổi đúng; B25-keyboard.json lúc 11:56:57.796Z. Đã click phóng to, thu gọn, Enter phóng to từ button đang focus; Tab đến region, ArrowRight cuộn ngang40px, scrollWidth1000/clientWidth294, B25-zoom-keyboard.json lúc11:57:50.232Z. Đã click thu gọn lại. Đây là ca bàn phím B25, chưa kiểm mọi pin bằng Space và chưa trình đọc màn hình.

Browser zoom: gửi phím thật ControlOrMeta++ bằng MCP, đọc innerWidth390/height844, DPR1, visualViewport scale1; sau đó ControlOrMeta+0. Không thấy zoom thực tế thay đổi, không có MCP menu/browser zoom chuyên dụng: **CHƯA KIỂM CHỨNG browser zoom**. Không dùng evaluate/style/transform giả zoom. Root nên thử browser có UI zoom thật 100/125/200%, lặp năm bài và keyboard/focus; ghi mức zoom từ chrome UI.

## Phương án chung để trưởng nhóm thống nhất

Ưu tiên tách toàn bộ nút số khỏi vùng nội dung ảnh: dùng danh sách điểm đánh số và tiêu đề ngoài SVG, chọn điểm cập nhật giải thích như hiện có. Hình giữ nguyên, không button/vòng focus trên nội dung; danh sách cho cùng thao tác ở desktop/mobile/zoom. Nếu cần giữ hotspot trực quan, phải thiết kế vùng callout riêng ngoài vùng kiến thức và leader line, được trưởng nhóm duyệt về quan hệ điểm–đối tượng; không dời x/y tùy ý. Có thể cho xem tổng quan và chế độ đọc chi tiết cuộn với chỉ dẫn rõ, phần chữ/bảng responsive hỗ trợ người học. Không chỉ thu nhỏ pin hoặc tăng z-index.

File cần sửa CHÍNH XÁC cho phương án ưu tiên: `src/components/learning/InteractiveInfographic.tsx` (cấu trúc control ngoài ảnh, semantics, trạng thái/zoom) và `src/app/globals.css` (bỏ overlay cho component, click area44px, focus, bố cục responsive và vùng zoom). Đây là đề xuất, chưa được thực hiện. Không cần sửa `src/lib/visual-learning.ts` hay `public/illustrations/B21-diagram.svg`, `B22-diagram.svg`, `B23-diagram.svg`, `B24-diagram.svg`, `B25-diagram.svg` với phương án này. Nếu trưởng nhóm chọn callout/vị trí mới thì phải giao lại các file/tọa độ cụ thể, kiểm nội dung tương ứng trước sửa.

Next CSS guide đã đọc: global CSS có thể tồn tại qua navigation, cần selectors scoped theo component và kiểm đường chuyển B21→B25. Guide đề nghị CSS Modules cho custom scoped CSS; phiên sửa nhỏ có thể giữ file globals hiện tại với phạm vi component rõ, không cần mở rộng refactor. Không chạy production/build trong review này.

## Actual tests và giới hạn

Đã thực hiện browser navigation thật trên localhost3001, B25 đủ5size; B21–B24 ở1440/390 (13 tổ hợp bài/size), chụp/xem15 ảnh vùng hình gồm2 zoom và2 ảnh viewport bổ sung; đo pin/state đọc-only, B25 Tab/Enter, zoom/thu gọn và ArrowRight. Nháp lưu report-draft.md sau ca đầu. Không có bài làm người thật, account tests, DB, 3D dynamics hoặc kết luận hiệu quả học tập. Không test toàn bộ17 mô phỏng, mọi control, browser zoom thật, screen reader hay production. B21–B24 chưa thử ở1280/768/360 và chưa zoom riêng từng bài; cần retest chung sau sửa. Có console log do browser tự lưu, chưa phân tích mọi lỗi console vì job giới hạn nguyên nhân pin.

Không có kiểm tra hash trước phiên để so sánh audit toàn workspace; git diff cho thấy thay đổi có sẵn, không quy chúng cho job. Không gọi công cụ ghi workspace; mọi tác vụ ghi báo cáo/ảnh ở TMP. Trưởng nhóm cần dùng audit của bộ điều phối để xác nhận bất biến workspace. Kết quả này đủ xác định nguyên nhân UI-0001 và phạm vi sửa đề xuất, chưa đóng lỗi hoặc nghiệm thu tổng.
