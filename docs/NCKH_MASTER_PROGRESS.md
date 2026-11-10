# Cập nhật 10/11/2026 — Hoàn tất thiết kế lại 5 bài B21–B25, bộ 5 video v2 lồng tiếng, và bộ test 102/102

## Kết quả hiện tại

### Toàn bộ 5 bài học B21–B25 trên `/hoc-lieu/phong-hat-nhan-v2` — thiết kế lại hoàn chỉnh

Toàn bộ 5 bài Chương IV Vật lí 12 KNTT đã có trang học liệu tương tác v2 tại `/hoc-lieu/phong-hat-nhan-v2?bai=B21..B25`, thống nhất cấu trúc: **Hero kể chuyện 5 cảnh có câu hỏi chặn nút Tiếp** → **Mục lục điều hướng** → **Các mục theo SGK với phòng thí nghiệm tương tác** → **Tiêu chí hoàn thành** → **Video bài giảng v2 có lồng tiếng và phụ đề VTT**.

### Bài 21 (Cấu trúc hạt nhân — SGK tr. 91–95)

- **`B21Hero`** (5 cảnh): câu chuyện thí nghiệm tán xạ alpha của Rutherford tại Manchester 1911 (bối cảnh mô hình Thomson → bố trí thí nghiệm → kết quả quan sát 1/8000 hạt bật ngược → phát hiện hạt nhân → kí hiệu hạt nhân); câu hỏi kiểm tra chặn nút "Tiếp" ở cảnh quan sát.
- **`B21Lesson`** (4 mục + Video):
  - I. Thí nghiệm tán xạ hạt alpha (`RutherfordActivity` — đã sửa lỗi hydration mismatch toạ độ SVG bằng `.toFixed(2)`).
  - II. Cấu tạo hạt nhân (4 thẻ kiến thức proton/neutron/số khối/điện tích + `NuclearBuilderActivity`).
  - III. Đồng vị và kích thước hạt nhân (`IsotopeActivity` + giải thích quy luật $R = r_0 A^{1/3}$ và $V \propto A$).
  - IV. Tổng hợp (3 thẻ nối thí nghiệm với kí hiệu + checklist tiêu chí hoàn thành).
  - Video học liệu v2 (`b21.mp4`, 89,80 s, 1920×1080, phụ đề `b21.vi.vtt`).
- **Commit**: `bac1dc5` ("feat(B21): thiết kế lại Bài 21 theo cấu trúc SGK").

### Bài 22 (Phản ứng hạt nhân và năng lượng liên kết — SGK tr. 96–103)

- **`B22Hero`** (5 cảnh): từ phản ứng hạt nhân nhân tạo đầu tiên của Rutherford 1919, vết chữ Y trong buồng sương Blackett, bảo toàn số khối A và điện tích Z, độ hụt khối và đường cong năng lượng liên kết riêng, đến phân hạch và nhiệt hạch; câu hỏi chặn nút "Tiếp" ở cảnh cuối.
- **`B22Lesson`** (4 mục + Video):
  - I. Phản ứng hạt nhân — buồng sương Blackett (`NuclearReactionBalancer`).
  - II. Năng lượng liên kết riêng $E_{\mathrm{lkr}}$ (`BindingEnergyLab`).
  - III. Phân hạch hạt nhân (`NuclearFission` tải động).
  - IV. Nhiệt hạch (`NuclearFusion`) + checklist 4 tiêu chí hoàn thành.
  - Video học liệu v2 (`b22.mp4`, 75,20 s, 1920×1080, phụ đề `b22.vi.vtt`).
- **Commit**: `981bd6b` ("feat(B22): thiết kế lại Bài 22 theo cấu trúc SGK").

### Bài 23 (Hiện tượng phóng xạ — SGK tr. 104–113)

- **Trang hero có cốt truyện 5 cảnh**: giới thiệu thí nghiệm Becquerel qua tường thuật (tối phòng → phát hiện tia → kết luận); điều hướng "Trước/Tiếp" với nút bị khóa cho đến khi trả lời câu hỏi kiểm tra.
- **Buồng sương Wilson động** (`CloudChamberView`): mô phỏng canvas với các vệt ion hóa sinh ngẫu nhiên, nút Tạm dừng/Tiếp tục, hoạt ảnh 60fps thực tế.
- **Bốn loại tia phóng xạ** (`RadiationTypesExplorer`): tab α/β⁻/β⁺/γ với SVG minh họa tĩnh điện/từ trường, xuyên thấu, phương trình phân rã; bảng so sánh bốn loại có thể mở/đóng.
- **Định luật phóng xạ** (`DecayProcessLab` từ simulation-v2): Timeline 8 cảnh, điều chỉnh chu kì bán rã T và số hạt N₀, mô phỏng Monte-Carlo tự phân rã từng hạt theo xác suất P(t)=1−e^(−λΔt), đường cong lý thuyết N(t)=N₀e^(−λt) chồng lên dữ liệu thực nghiệm, bảng dữ liệu xuất CSV.
- **Mục III (ảnh hưởng + biển cảnh báo)** (`RadiationSafety`): minh họa ion hóa tế bào, 4 biển cảnh báo phổ biến có giải thích, câu hỏi kiểm tra đúng–sai về mức độ nguy hiểm.
- **Mục IV (nguyên tắc an toàn ALARA)** (`SafetyPrinciples`): tương tác 3 yếu tố (khoảng cách 1–10 m, thời gian 10–240 phút, vật liệu che chắn: không/gỗ/nhôm/chì), tính liều hấp thụ theo định luật nghịch bình phương I∝1/r² và hệ số suy giảm vật liệu, SVG minh họa nguồn/tia/chắn/người, 3 thẻ số liệu với thanh màu (xanh ≤5, vàng ≤25, đỏ >25), câu hỏi kiểm tra so sánh hiệu quả ba biện pháp.
- **Video học liệu B23**: tích hợp `<video>` HTML5 với poster JPG, phụ đề tiếng Việt VTT (1.5 KB), thời lượng 1:33 (93.7s), MP4 4.9 MB đã có sẵn tại `public/videos/nuclear-lessons-v2/`. Mục lục (TOC) đã cập nhật với cả 6 phần: Khởi động, I–IV, Video.
- **Commit**: `740fa569` ("feat(B23): thêm Mục IV (nguyên tắc an toàn phóng xạ) và video học liệu").

### Bài 24 (Công nghiệp hạt nhân — SGK tr. 114–118)

- **`B24Hero`** (5 cảnh): từ lò phản ứng Chicago Pile-1 (1942), điều khiển hệ số nhân neutron $k$ bằng thanh hấp thụ boron/cadmium, sơ đồ hai vòng nước tách biệt của lò nước áp lực (PWR), y học hạt nhân (PET/SPECT và xạ trị), đến công nghệ chiếu xạ nông sản; câu hỏi chặn nút "Tiếp" ở cảnh điều khiển phản ứng dây chuyền.
- **`B24Lesson`** (3 mục + Video):
  - I. Lò phản ứng hạt nhân (`ReactorControlConcept` tải động) + checklist 3 tiêu chí hoàn thành.
  - II. Y học hạt nhân (`NuclearMedicine`).
  - III. Chiếu xạ trong công nghiệp và nông nghiệp (`RadiationApplications`).
  - Video học liệu v2 (`b24.mp4`, 71,97 s, 1920×1080, phụ đề `b24.vi.vtt`).
- **Commit**: `01a39ae` ("feat(B24): thiết kế lại Bài 24 theo cấu trúc SGK").

### Bài 25 (Bài tập về vật lí hạt nhân — SGK tr. 119–122)

- **`B25Hero`** (5 cảnh): dẫn dắt qua ba nhóm kĩ năng (đọc đồ thị H(t) → chu kì bán rã; cân bằng phương trình theo A và Z; độ hụt khối → năng lượng liên kết), rồi vận dụng vào nhà máy điện, chiếu xạ, y học. Cảnh cuối là câu hỏi trắc nghiệm chặn nút "Tiếp": bốn lựa chọn 40 s / 60 s / 50 s / không chọn được từ một mốc — chỉ lựa chọn cuối đúng, kèm giải thích về nội suy 75,5 Bq giữa 85 và 55 Bq.
- **`B25Lesson`** (6 mục): I. Hệ thống hóa bốn công thức (thẻ có công thức KaTeX + lưu ý đơn vị); II. `B25DataProcessLab` — đồ thị Bảng 25.1 với 8 mốc đo giữ nguyên, chọn T giả thuyết, hiện đường lí thuyết, con trỏ thời gian, bảng đối chiếu; III. `NuclearEquationBalancer` — cân bằng phân rã α/β⁻/β⁺, cần đúng 2 ví dụ; IV. `BindingEnergyCalculator` — 5 hạt nhân, 4 bước tính Δm và Elk; V. Sáu bài tập SGK trang 121–122 với gợi ý đóng/mở; VI. Video B25 (`b25.mp4`, 76,23 s, 1920×1080, phụ đề `b25.vi.vtt`).
- **Hai sub-lab được export** từ `B25Activities.tsx` (`NuclearEquationBalancer`, `BindingEnergyCalculator`) để dùng trực tiếp trong trang bài học; `NuclearPhysicsPracticeLab` cũ giữ nguyên cho route in-class hiện có.
- **Route mở rộng**: `page.tsx` dùng bảng `LESSONS` cho cả 5 bài `B21`–`B25`.
- **Commit**: `5a33a74` ("feat(B25): thiết kế lại Bài 25 theo cấu trúc SGK").

### Bộ 5 video học liệu v2 (`public/videos/nuclear-lessons-v2/`) — hoàn tất render và tích hợp

Toàn bộ 5 video bài giảng (`b21.mp4`–`b25.mp4`) đã được dựng lại từ pipeline Remotion (`scripts/nuclear-videos/`) với:
- **Hình ảnh**: 1920×1080, 30 fps, H.264 (`yuv420p`, `+faststart`), bảng màu SGU (`#1b2a72 → #0a1230`, điểm nhấn `#43c4ec`), mô hình hạt nhân 3D và đồ thị/tiến trình vật lí động đồng bộ theo từng cảnh.
- **Lồng tiếng & phụ đề**: Giọng đọc tiếng Việt tổng hợp cục bộ (VieNeu-TTS v3 Turbo · Kim Thanh · seed 21 · AAC 48 kHz mono · `-18 LUFS / -1,9 dBTP`), đồng bộ với tệp phụ đề `.vi.vtt` và ảnh bìa `.jpg`.
- **Tích hợp & kiểm chứng trình duyệt (Playwright + Chrome thực, desktop 1440px & mobile 390px)**:
  - `B21`: 200 OK, `b21.mp4` (89,80 s, 1920×1080, `readyState: 4`, 1 track VTT), `desktopOverflow: 0`, `mobileOverflow: 0`.
  - `B22`: 200 OK, `b22.mp4` (75,20 s, 1920×1080, `readyState: 4`, 1 track VTT), `desktopOverflow: 0`, `mobileOverflow: 0`.
  - `B23`: 200 OK, `b23.mp4` (93,73 s, 1920×1080, `readyState: 4`, 1 track VTT), `desktopOverflow: 0`, `mobileOverflow: 0`.
  - `B24`: 200 OK, `b24.mp4` (71,97 s, 1920×1080, `readyState: 4`, 1 track VTT), `desktopOverflow: 0`, `mobileOverflow: 0`.
  - `B25`: 200 OK, `b25.mp4` (76,23 s, 1920×1080, `readyState: 4`, 1 track VTT), `desktopOverflow: 0`, `mobileOverflow: 0`.
  - Tổng cộng **0 lỗi console, 0 lỗi trang (`pageerror`)** trên toàn bộ 5 bài ở cả hai kích thước màn hình.

### Test suite toàn dự án — đã thiết lập và đạt

- **Vấn đề trước đây**: 20/20 test file bị lỗi `ERR_MODULE_NOT_FOUND` vì Node 24's native TypeScript stripper không phân giải (1) alias `@/*` → `src/*` từ `tsconfig.json`, (2) import không có phần mở rộng (ví dụ `"../src/lib/physics"` thay vì `"...physics.ts"`), (3) import JSON trần (`import x from "./a.json"`) thiếu `with { type: "json" }`.
- **Giải pháp**: tạo resolver hook `tests/node-resolve-hooks.mjs` (82 dòng) với `registerHooks({ resolve, load })` để:
  - Ánh xạ `@/*` vào `<repo>/src/*` + tìm file thật có đuôi `.ts`/`.tsx`/`.mts`/`.js`/`.jsx`/`.mjs` hoặc `index.*`.
  - Phân giải import tương đối/tuyệt đối thiếu đuôi bằng cách thử từng phần mở rộng.
  - Đọc `.json` và trả về module JS tương đương (`export default <JSON>`) để bỏ qua yêu cầu import assertion.
- **Kết quả**:
  - `node --import ./tests/node-resolve-hooks.mjs --test tests/*.test.ts` → **102/102 test đạt** (trước đây 0/102).
  - Thêm script `"test": "node --import ./tests/node-resolve-hooks.mjs --test tests/*.test.ts"` vào `package.json`.
  - `npm test` chạy thành công, không cần cài `vitest` hoặc bất kỳ test runner nào khác — dùng test runner gốc của Node 24 (`node:test`).

**Các test đã chạy** (102 test, 20 file):
- `tests/simulation-v2.test.ts` (24 test VÒNG 5): Timeline (8), decay physics (10), parameter utilities (2), B23 definition wiring (4).
- 19 file test còn lại (78 test): pathway-progress, exam-scoring, flipped-plan, nuclear-science/-sequence/-layout, fission/process/reactor-model, guided-teacher-workflows, local-ai, teaching-plan, unified-question-bank/-worksheet, teacher-production, physics, decay-data, youtube-learning.

### Ghi chú về các mục mở rộng tiềm năng

- **Route học sinh trên lớp (`/student/lessons/b2x/in-class`)**: vẫn giữ nguyên `FixedPhysicsActivityRenderer` để bảo toàn luồng lớp học đã kiểm định trước đó; phiên bản tương tác mới phục vụ đầy đủ cả 5 bài tại `/hoc-lieu/phong-hat-nhan-v2?bai=B21..B25`.
- **Mục III nội dung B23**: `RadiationSafety` trong B23 hiện có minh họa ion hóa cơ bản + 4 biển cảnh báo + câu hỏi đúng–sai; có thể bổ sung thêm bảng liều phơi nhiễm tham khảo khi có yêu cầu từ giảng viên hướng dẫn.

## Các công cụ và khung hỗ trợ

- **Simulation-v2 framework** (VÒNG 5, đã test): `Timeline` (8 scene, pause/resume, goToScene, callbacks), physics modules (decay, fission dự kiến), renderer (Canvas2DRenderer, Three.js dự kiến), parameter system (clamp, snap, derive). Đã dùng trong `DecayProcessLab` của B23.
- **Shared components**: `Lab` (wrapper thống nhất cho mọi thí nghiệm), `ChoiceCheck` (quiz đúng–sai + giải thích), CSS classes `physics-*` (guide, controls, field, button, checklist, …).
- **AI cục bộ** (VÒNG trước): Qwen3 4B Instruct qua Ollama, khung giáo viên/học sinh; không liên quan đến bài học tương tác này.
- **Ngân hàng câu hỏi, phiếu, kế hoạch, ma trận đề** (VÒNG trước): 213 câu, DOCX export, flipped classroom workflows — không đổi trong VÒNG 6.1.

## Hạn chế và ghi chú

- **Đã hoàn tất cả 5 bài B21–B25 trên `/hoc-lieu/phong-hat-nhan-v2`**: Toàn bộ 5 trang tương tác và 5 video bài giảng v2 (`public/videos/nuclear-lessons-v2/b21..b25.mp4`) đã tích hợp và kiểm chứng trên trình duyệt thực.
- **Kiểm chứng browser tự động**: dùng Playwright-core + Chrome thật (desktop 1440px và mobile 390px) xác nhận 200 OK, 0 lỗi console, 0 tràn ngang, metadata video và phụ đề nạp đầy đủ trên cả 5 bài.
- **Không có thẩm định độc lập bên ngoài**: nội dung vật lí, phương pháp sư phạm và độ chính xác đơn vị/công thức đã đối chiếu SGK Vật lí 12 KNTT nhưng cần giảng viên hướng dẫn và chuyên gia thẩm định chính thức trước khi nghiệm thu.
- **Không có dữ liệu học sinh thực nghiệm**: chưa thu thập kết quả học tập, khảo sát mức độ tự học, hay so sánh với phương pháp truyền thống.

## Nguồn và tham chiếu

- **SGK Vật lí 12 KNTT (Kết nối tri thức với cuộc sống, NXB Giáo dục Việt Nam)**:
  - Bài 21 "Cấu trúc hạt nhân" (tr. 91–95): thí nghiệm tán xạ alpha Rutherford 1911, cấu tạo hạt nhân, đồng vị, bán kính hạt nhân $R \approx 1{,}2 \cdot A^{1/3}\,\text{fm}$.
  - Bài 22 "Phản ứng hạt nhân và năng lượng liên kết" (tr. 96–103): phản ứng hạt nhân Rutherford 1919, ảnh buồng sương Blackett, định luật bảo toàn số khối A và điện tích Z, độ hụt khối, năng lượng liên kết riêng, phân hạch và nhiệt hạch.
  - Bài 23 "Hiện tượng phóng xạ" (tr. 104–113): thí nghiệm Becquerel 1896, buồng sương Wilson, tia $\alpha / \beta^- / \beta^+ / \gamma$, định luật phóng xạ, chu kì bán rã, biển cảnh báo, nguyên tắc ALARA.
  - Bài 24 "Công nghiệp hạt nhân" (tr. 114–118): lò phản ứng hạt nhân PWR, điều khiển hệ số nhân $k$, y học hạt nhân (PET, SPECT, xạ trị), chiếu xạ nông sản và công nghiệp.
  - Bài 25 "Bài tập về vật lí hạt nhân" (tr. 119–122): Bảng 25.1 (8 mốc $H(t)$), cân bằng phương trình, tính năng lượng liên kết, 6 bài tập SGK tr. 121–122.
- **Bộ 5 video học liệu v2 (`public/videos/nuclear-lessons-v2/`)**: `b21.mp4` (4,5 MB, 89,80 s), `b22.mp4` (3,7 MB, 75,20 s), `b23.mp4` (4,7 MB, 93,73 s), `b24.mp4` (3,7 MB, 71,97 s), `b25.mp4` (4,1 MB, 76,23 s) kèm `.jpg` poster và `.vi.vtt` phụ đề tiếng Việt (chi tiết SHA-256 trong `docs/VIDEO_AUDIT.md`).

## Các bước tiếp theo (gợi ý)

1. **Làm giàu Mục III của B23** (tùy chọn): thêm ví dụ liều phơi nhiễm nghề nghiệp, bảng phân loại mức độ nguy hiểm theo SGK khi có yêu cầu của giảng viên hướng dẫn.
2. **Thiết lập CI/CD**: chạy `npm test` tự động trên GitHub Actions hoặc GitLab CI mỗi khi push, để đảm bảo 102 test luôn xanh.
3. **Kiểm duyệt nội dung chuyên môn**: mời giảng viên hướng dẫn / giáo viên Vật lí xem xét độ chính xác khoa học, phù hợp chương trình THPT, và khả năng tự học của học sinh.
4. **Thực nghiệm sư phạm**: thử nghiệm học liệu B21–B25 với học sinh lớp 12 thực tế, thu thập phản hồi (khảo sát, phỏng vấn, điểm số trước/sau) để đánh giá hiệu quả lớp học đảo ngược.
5. **Hoàn thiện bài báo khoa học**: cập nhật `BAI_BAO_KHOA_HOC_CAP_NHAT_HOC_LIEU.docx` với kết quả 5 bài học tương tác B21–B25, bộ 5 video v2, và kết quả thực nghiệm (khi có).

---

**Cập nhật lần cuối**: 10/11/2026  
**Trạng thái hiện tại**: 5/5 bài học B21–B25 + 5/5 video v2 lồng tiếng hoàn tất trên `/hoc-lieu/phong-hat-nhan-v2` · `npm test` 102/102 đạt · `tsc` & `eslint` 0 lỗi  
**Không push, không deploy, không xóa dữ liệu** (theo quy ước dự án)
