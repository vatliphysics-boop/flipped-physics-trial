# Worker 3 — UI11, review toàn bộ 17 mô phỏng

Ngày 05/10/2026. **COMPLETED_PENDING_LEAD_REVIEW; CHƯA ĐẠT nghiệm thu tổng.** Review chỉ đọc tại Documents/localhost:3001. Không sửa workspace, source, CSS, DOCX; không commit/reset/clean, auth submit, DB/migration hoặc production. Đã đọc toàn bộ ba tài liệu trích xuất và hướng dẫn trong yêu cầu, AGENTS và TEAM thực tế. Chỉ đọc một số đoạn cơ chế điều khiển/nhãn trong Simulation3D, GuidedFissionLab, B22Activities, B25Activities để chẩn đoán sau thao tác; không dùng code làm bằng chứng vận hành.

## Phiên bản và hồ sơ

Hash đầu khớp `version-ui10.json`: `a0497186e3e2d0cb8dc2f4a84e94b8d24d823eea59c965b65dc64b8b67361c9e`. Hash cuối lúc 12:35:02 UTC: `653b4bbca498e9c11d3cd19d024d67fe4f644a356f824363c43560d7bdb60b74`. Sáu file thay đổi trong lúc review: StudentShell.tsx, teacher/classes/new/page.tsx, PortalShell.tsx, unified-question-bank.json, workbook-nuclear-transcriptions.json, unified-question-bank.ts. Không quy các thay đổi này cho Worker3. Toàn bộ file `src/components/physics/` vẫn khớp UI10. Không có hash từng thời điểm click, nên **không gọi mọi ca là ca trên cùng hash frozen**; cần root audit và W2 kiểm lại.

Evidence root tuyệt đối: `/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w3-x7ZyQr/evidence/`.

- `actual-tests.json`: 49 tổ hợp, 12:19:57–12:23:17 UTC; trạng thái initial/running/paused/changed/feedback/reset, viewport thật, kích thước điều khiển, canvas và overflow.
- `deep-tests.json`: 34 tổ hợp trang mới, 12:23:11–12:28:06 UTC; Home/End slider, mọi option select, nút hoạt động, đáp án/feedback.
- `verify-tests.json`: 14 tổ hợp; bốn góc nhìn qua focus→Enter, ảnh viewport, focus/outline; kiểm lại Rutherford và phân hạch.
- `chart-tests.json`: năm viewport, Tab thật và click A=56/A=235; vùng bấm thực đo.
- `tabs-tests.json`, `remaining-tests.json`, `energy-tests.json`: mở details/k phân hạch, các tab B25, checkbox ba tình huống, ba lượt Geiger mỗi size, năm đồng vị năng lượng.
- `coverage-final.json`: đúng 17 URL nguồn, viewport, action và **đường dẫn tuyệt đối từng ảnh**; `summary-final.json`, `hash-final.json`: tổng hợp/audit. Script tái hiện nằm tại TMP: check.mjs/deep.mjs/verify.mjs/chart.mjs/tabs.mjs/remaining.mjs/energy.mjs.
- Mốc 5/10/15/17: `checkpoint-N.json` và `draft-N.md` tại evidence. Bản nháp có nhận xét bổ sung: `/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w3-x7ZyQr/report-draft.md`.

Chrome thật qua Browser MCP và Chrome headless Playwright/Node bundled. Mỗi ca 17 tài nguyên có 1440×900 và390×844. Reaction balancer, fission, half-life, nuclear power, practice có thêm1280×720/768×1024/360×800; radiation-properties/radiation-safety/binding chart cũng thử đủ năm size sau khi phát hiện vấn đề. Không thay CSS zoom và không gọi resize là browser zoom.

Đã **MỞ xem 34 ảnh viewport active của tất cả17 desktop/mobile**, 17 ảnh section mobile, 17 ảnh fresh mobile; thêm fresh desktop builder/isotope, các ảnh preset/đồ thị/tab được dẫn trong lỗi. Các ảnh khác đã lưu nhưng không tuyên bố đã mở từng ảnh. Section dài có sticky header do cơ chế chụp của Chrome; không coi header trong ảnh ghép là overlay của mô phỏng. Ảnh section được xem thu nhỏ chỉ dùng xem bố cục tổng thể; lỗi đọc chữ căn cứ ảnh viewport thật.

## Bao phủ thao tác 17 tài nguyên

URL đầy đủ và ảnh từng dòng ở `coverage-final.json`; mọi URL đều lấy nguyên từ simulations.json. Tất cả dòng đã thử cảnh initial→start→pause, góc nhìn, slider/select nếu có, kéo chuột/wheel, resume/reset cảnh 3D. Lượt A giữ state khi đổi size cùng URL; lượt B mở page mới để kiểm khởi đầu. Cảnh static vẫn có timer chung; không bắt chuyển động riêng khi chức năng không có.

| Bài / resource ID | Thao tác bảng/hoạt động đã thực hiện thêm | Quan sát và giới hạn |
|---|---|---|
| B21 system-sim-rutherford | Hai slider bảng, bắn một hạt/chùm; các lựa chọn nhận định | Số hạt/góc và feedback đổi; reset 3D riêng. Không xác nhận tỉ lệ thật bằng mô hình |
| B21 system-sim-nuclear-builder | Z/N, preset Si-28/He-4/C-12, mode N=Z/+2/+4 | Kí hiệu Z–N–A/bảng đổi; radio đúng/sai có giải thích |
| B21 system-sim-isotope-size | A cảnh; +/− proton/neutron cho hai hạt nhân | Tên/kí hiệu/bán kính bảng đổi. Run/pause bảng 2D: N/A vì chỉnh trạng thái trực tiếp |
| B22 system-sim-reaction-balancer | Tốc độ cảnh; nhập 17/8 và1/1 vào bốn ô phản ứng | Có cập nhật kiểm tra phương trình; phản hồi radio. Bảng không có run/reset riêng: N/A |
| B22 system-sim-binding-energy | Độ tách cảnh; click A56/A235 trên SVG; Tab kiểm đường tới điểm | Click cập nhật tooltip/tiêu chí; bàn phím bỏ qua điểm — UI-0202 |
| B22 system-sim-nuclear-fission | Bốn bước, timeline0–8, ba tốc độ, nhập3, mở details và k0,6/1/1,4 | Chú giải/bảo toàn/text bước đổi; có reset/resume. Nút bước disabled trước start. Có lỗi harness đã kiểm lại |
| B22 system-sim-nuclear-fusion | Năng lượng cảnh min/max, bắn chậm/rất nhanh | Trạng thái 2D và tiêu chí hai điều kiện đổi; phản hồi nhận định |
| B23 system-sim-geiger-decay | Hoạt tính cảnh; ba lượt đếm5s ở mỗi size | Nút đếm disabled lúc đang đếm, kết quả/lịch sử/tiêu chí đổi; không kiểm âm thanh |
| B23 system-sim-radiation-properties | Bề dày; α/β⁻/γ cảnh; bốn nút loại tia bảng | Bảng bản chất/hướng lệch/vật cản đổi; mobile cắt nhãn canvas — UI-0201 |
| B23 system-sim-half-life | T cảnh; T/N₀ bảng Home/End và Arrow; CSV; reset tham số | Đồ thị/bảng/text định lượng đổi, có phân biệt tham số cảnh/bảng. CSV click đã thực hiện; chưa lưu/đối chiếu file |
| B23 system-sim-carbon14-dating | Tuổi cảnh, tỷ lệ bảng, bốn ví dụ | Tuổi/tỷ lệ và sản phẩm bảng đổi; không xác minh niên đại lịch sử |
| B23 system-sim-radiation-safety | Khoảng cách/chắn; ba tình huống; check/uncheck từng biện pháp | Chỉ số/nhận xét tình huống đổi; mobile cắt vị trí quan sát — UI-0201. Không thẩm định khuyến nghị an toàn thực tế |
| B24 system-sim-nuclear-power | Tốc độ cảnh; thanh điều khiển min/max; bật mô phỏng bảng | Trạng thái k/công suất/nhiệt độ/tiêu chí đổi; nhãn nhỏ. Các giá trị khoa học giao root |
| B24 system-sim-reactor-control | Độ cắm cảnh và tỷ lệ hấp thụ bảng | k/thế hệ/nhận xét đổi; min/max đã thử; feedback radio |
| B24 system-sim-nuclear-medicine | Mode PET/xạ trị cảnh; ba tab PET/SPECT/Điều trị | Nội dung/nguồn đồng vị và tiêu chí đổi; không xác minh hiệu quả y học |
| B24 system-sim-radiation-applications | Tốc độ/mode cảnh; ba lĩnh vực Nông/Công/Nghiên | Nội dung lợi ích/giới hạn/tiêu chí đổi; phản hồi nhận định |
| B25 system-sim-practice-lab | T cảnh; T fit; bật đường lí thuyết; ba tab; α/β⁻/β⁺; ô số; năm đồng vị | Đồ thị, phương trình và phép tính hiển thị đổi. Bảng mobile có vùng overflow:auto riêng300→378px, không overflow document. Chưa thẩm định phép tính toàn bộ |

Nhãn/đơn vị/giới hạn có trên các section đã mở: giây mô hình, năm, tỷ lệ/đơn vị tương đối, kích thước/màu/thời gian quy ước; nhiều bảng ghi tham số riêng. Không suy độ chính xác khoa học từ sự hiện diện của dòng giới hạn. Các nút bảng thông thường thực đo chiều cao nhỏ nhất khoảng37,5–39px ở390, không gán lỗi chỉ vì chưa44px. Focus preset thấy viền trong ảnh và logs; chưa audit mọi target/focus trên mọi trạng thái.

## Vấn đề cần root phân công

### UI-0200 — P2 / Medium — Nhãn canvas quá nhỏ để đọc ngay khi quan sát

**Trang/state/size:** `/hoc-lieu?bai=B21&resource=system-sim-nuclear-builder#resource-system-sim-nuclear-builder`, tương tự isotope-size, geiger-decay, reactor-control và các cảnh dùng Simulation3D. Fresh start→pause, Phối cảnh, chưa drag/zoom;1440×900 và390×844.

**Steps:** mở URL, Bắt đầu, đợi khoảng2,5s, Tạm dừng; đọc nhãn Z/N/A, Carbon12 hoặc tên thiết bị ngay trên vật. Không zoom browser/camera. So sánh với chữ hướng dẫn/điều khiển ngoài canvas.

**Evidence đã mở:** `/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w3-x7ZyQr/evidence/system-sim-nuclear-builder-1440-fresh.png`, `/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w3-x7ZyQr/evidence/system-sim-nuclear-builder-390-fresh.png`, `/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w3-x7ZyQr/evidence/system-sim-isotope-size-1440-fresh.png`, `/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w3-x7ZyQr/evidence/system-sim-isotope-size-390-fresh.png`, `/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w3-x7ZyQr/evidence/system-sim-geiger-decay-390-fresh.png`, `/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w3-x7ZyQr/evidence/system-sim-reactor-control-390-fresh.png`. Các dấu `/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w3-x7ZyQr/evidence/` ở đây là evidence root tuyệt đối đã ghi trên; coverage JSON chứa đường dẫn đầy đủ. Nhãn trong ảnh chỉ cao vài pixel, khó phân biệt chữ/số ở kích thước thật, trong khi body text đọc được. Đây là quan sát ảnh, không khẳng định số font CSS của WebGL.

**Cause:** cơ chế nhãn Simulation3D.tsx:169–188 dùng texture512×80, font28 trong texture, sprite scale2,9×0,45 theo thế giới3D; không có cỡ chữ tối thiểu theo màn hình. Đọc cơ chế chỉ giải thích hiện tượng ảnh đã xác nhận.

**Source paragraph:** hd P2/P6–7; NCKH P84/P95/P121; bài báo P49–50/P55–56/P88/P95/P197–199. **Learning impact:** khó gắn tên/kí hiệu với vật thể trong quá trình quan sát; học sinh phải rời cảnh để dò bảng hoặc tự zoom, cản trở nhiệm vụ nhận diện và giải thích.

**Acceptance:** nhãn thiết yếu đọc được ở1440/390/360 và các góc nhìn, hoặc có chú giải chữ rõ ngoài canvas giữ liên hệ với vật; zoom vẫn dùng được và không đổi nội dung khoa học. W2 xem ảnh/thao tác độc lập; không yêu cầu trang trí mới. **Trạng thái: OPEN, chưa sửa.**

### UI-0201 — P2 / Medium — Góc nhìn mặc định mobile cắt nhãn/đích quan sát

**Trang:** `http://localhost:3001/hoc-lieu?bai=B23&resource=system-sim-radiation-properties#resource-system-sim-radiation-properties` và `http://localhost:3001/hoc-lieu?bai=B23&resource=system-sim-radiation-safety#resource-system-sim-radiation-safety`.

**Steps/state:** page mới390×844 hoặc360×800; nhấn Bắt đầu, đợi1,8–2,5s, Tạm dừng; giữ Phối cảnh, chưa drag/wheel. Đọc “Đầu thu”/“Vị trí quan sát” ở bên phải. Sau đó chọn Từ trên bằng focus→Enter.

**Evidence đã mở:** `/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w3-x7ZyQr/evidence/system-sim-radiation-properties-390-preset-0.png`, `/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w3-x7ZyQr/evidence/system-sim-radiation-properties-360-preset-0.png`, `/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w3-x7ZyQr/evidence/system-sim-radiation-safety-390-fresh.png`, `/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w3-x7ZyQr/evidence/system-sim-radiation-safety-360-preset-0.png`, `/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w3-x7ZyQr/evidence/system-sim-radiation-properties-390-preset-2.png`; verify-tests.json. Mobile mất phần bên phải nhãn/đích; Từ trên còn cắt. Ảnh1280 radiation-properties và768 safety đã mở cho thấy đủ nhãn ở cùng preset. Đây là cắt bên trong WebGL; document không tràn ngang, không phải vùng bảng cuộn có chủ đích. Không lấy các ảnh sau wheel ở lượt A làm bằng chứng lỗi mặc định.

**Cause:** camera/preset cố định quanh target(0,0,0); resize đổi aspect nhưng không fit toàn bounds cảnh rộng theo canvas hẹp (Simulation3D.tsx:646–655/705–711). Cơ chế phù hợp ảnh thực tế; chưa thử mọi cực trị khoảng cách để xác lập phạm vi ngoài ca này.

**Source paragraph:** hd P7/P10; NCKH P121/P146; bài báo P55–56/P197–199/P213. **Learning impact:** không thấy đầy đủ đích thu/vị trí quan sát khi đối chiếu tia qua chắn hoặc khoảng cách; khó nhận ra quan hệ nguồn–chắn–đích.

**Acceptance:** mở/start và chọn các preset ở360/390 hiển thị đủ đối tượng/nhãn cần quan sát; có thao tác đưa toàn cảnh trở lại nếu người dùng zoom; không đổi mô hình khoa học. Kiểm lại năm size và cực trị điều khiển liên quan. **OPEN, chưa sửa.**

### UI-0202 — P2 / Medium — Điểm đồ thị B22 không chọn được bằng bàn phím, vùng bấm mobile rất nhỏ

**Trang:** `http://localhost:3001/hoc-lieu?bai=B22&resource=system-sim-binding-energy#resource-system-sim-binding-energy`; bảng năng lượng liên kết bên dưới3D, năm viewport.

**Steps:** đọc nhiệm vụ bấm A56/A235; focus slider cuối trong section rồi Tab12 lần. Không điểm nào nhận focus; Tab đầu đến radio nhận định, rồi các link. Dùng chuột bấm circle tương ứng A56/A235: tooltip/tiêu chí đổi. Thử1440/1280/768/390/360.

**Evidence đã mở:** `/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w3-x7ZyQr/evidence/binding-chart-1440-4.png`, `/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w3-x7ZyQr/evidence/binding-chart-390-8.png`, `/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w3-x7ZyQr/evidence/binding-chart-360-4.png`; chart-tests.json ghi Tab thật, rect/role/tabindex và nội dung sau click. Circle bình thường thực đo8,896px ở desktop/tablet,4,128px ở390,3,648px ở360; chưa có target thay thế. Nhãn số/trục đồ thị cũng rất nhỏ trong ảnh mobile.

**Cause:** g SVG có onClick/cursor:pointer, circle r4, không role/tabindex/handler bàn phím hay danh sách chọn thay thế (B22Activities.tsx:235–238); DOM live cùng Tab xác nhận. Không coi click bằng automation chính xác là bằng chứng dễ chạm bằng tay.

**Source paragraph:** hd P6–7/P13; NCKH P96/P121; bài báo P52–53/P197–199/P213; US01. **Learning impact:** học sinh dùng bàn phím không hoàn thành hai lựa chọn bắt buộc; người chạm màn hình dễ chọn nhầm/bỏ điểm khi so sánh năng lượng liên kết.

**Acceptance:** A56/A235 và các điểm cần học có đường chọn Tab→Enter/Space, tên/giá trị/focus rõ, cập nhật cùng tooltip/tiêu chí; vùng chạm đủ sử dụng, có thể dùng danh sách nút ngoài đồ thị để giữ chính xác hình. Nhãn/trục có cách đọc rõ ở360/390. W2 kiểm năm size, đúng/sai và reset nếu được bổ sung. **OPEN, chưa sửa.**

## Actual tests và giới hạn

112 nhóm tổ hợp ban đầu/bổ sung (49+34+14+5+4+6) và hai ca chọn5 đồng vị năng lượng; không phải112 ca tự động đơn vị hay112 ca đều đạt. Lượt A0 lỗi harness; lượt B có3 timeout giữ nguyên: start Rutherford1440 và nút k trong details phân hạch ở hai size. Rutherford kiểm lại thành công; fission mở details rồi thử k thành công trong tabs-tests. Không suy timeout do harness thành lỗi web. Không có sự cố kết nối localhost cần restart/retry; không đổi máy chủ.

Không có overflow document trong49 trạng thái đo; B25 mobile có vùng bảng overflow:auto riêng. Chưa dùng touch vật lý, pinch, screen reader, browser zoom125/200%, offline/lỗi WebGL, mọi cạnh pan, mọi lần chạy trọn3T hoặc khảo sát hiệu năng/GPU. Camera mouse/drag/wheel và bốn preset đã thao tác; chưa chứng minh hỗ trợ mọi công nghệ trợ giúp. CSV có click nhưng **CHƯA KIỂM CHỨNG file tải cuối**; chưa Excel/Sheets. Không có tài khoản thử/môi trường DB xác minh: giao–nộp/phân quyền/lưu qua tài khoản **CHƯA KIỂM CHỨNG**. Không đọc/in auth/secrets/env values. Không chạy fullbuild/test suite; không dùng61 tests cũ làm kết quả vòng này.

Ảnh và trường nhập là thao tác của người review, không phải bài làm học sinh; không có người học thật/thẩm định sư phạm hay dữ liệu hiệu quả. Khoa học chỉ đọc nhãn/giới hạn/feedback, chưa kiểm chứng độc lập mọi phép tính và tình huống; root chịu trách nhiệm. Không sửa/đóng lỗi thay W2. Hash toàn web thay đổi giữa phiên: lượt này không đủ hai lượt nghiệm thu đầy đủ liên tiếp trên cùng phiên bản cuối.
