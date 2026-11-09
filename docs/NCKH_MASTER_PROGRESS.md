# Cập nhật 10/11/2026 — VÒNG 6.1 hoàn tất, B25 thiết kế lại, test runner đã thiết lập

## Kết quả hiện tại

### Bài 23 (phóng xạ) — thiết kế lại hoàn chỉnh

- **Trang hero có cốt truyện 5 cảnh**: giới thiệu thí nghiệm Becquerel qua tường thuật (tối phòng → phát hiện tia → kết luận); điều hướng "Trước/Tiếp" với nút bị khóa cho đến khi trả lời câu hỏi kiểm tra.
- **Buồng sương Wilson động** (`CloudChamberView`): mô phỏng canvas với các vệt ion hóa sinh ngẫu nhiên, nút Tạm dừng/Tiếp tục, hoạt ảnh 60fps thực tế.
- **Bốn loại tia phóng xạ** (`RadiationTypesExplorer`): tab α/β⁻/β⁺/γ với SVG minh họa tĩnh điện/từ trường, xuyên thấu, phương trình phân rã; bảng so sánh bốn loại có thể mở/đóng.
- **Định luật phóng xạ** (`DecayProcessLab` từ simulation-v2): Timeline 8 cảnh, điều chỉnh chu kì bán rã T và số hạt N₀, mô phỏng Monte-Carlo tự phân rã từng hạt theo xác suất P(t)=1−e^(−λΔt), đường cong lý thuyết N(t)=N₀e^(−λt) chồng lên dữ liệu thực nghiệm, bảng dữ liệu xuất CSV.
- **Mục III (ảnh hưởng + biển cảnh báo)** (`RadiationSafety`): minh họa ion hóa tế bào, 4 biển cảnh báo phổ biến có giải thích, câu hỏi kiểm tra đúng–sai về mức độ nguy hiểm.
- **Mục IV (nguyên tắc an toàn ALARA)** (`SafetyPrinciples`): tương tác 3 yếu tố (khoảng cách 1–10 m, thời gian 10–240 phút, vật liệu che chắn: không/gỗ/nhôm/chì), tính liều hấp thụ theo định luật nghịch bình phương I∝1/r² và hệ số suy giảm vật liệu, SVG minh họa nguồn/tia/chắn/người, 3 thẻ số liệu với thanh màu (xanh ≤5, vàng ≤25, đỏ >25), câu hỏi kiểm tra so sánh hiệu quả ba biện pháp.
- **Video học liệu B23**: tích hợp `<video>` HTML5 với poster JPG, phụ đề tiếng Việt VTT (1.5 KB), thời lượng 1:33 (93.7s), MP4 4.9 MB đã có sẵn tại `public/videos/nuclear-lessons-v2/`. Mục lục (TOC) đã cập nhật với cả 6 phần: Khởi động, I–IV, Video.

**Kiểm chứng B23**:
- TypeScript: `tsc --noEmit` đạt 0 lỗi.
- ESLint: `eslint src/components/physics/B23*.tsx` đạt 0 lỗi, 0 cảnh báo.
- Playwright + Chrome thực (desktop 1440px, mobile 390px): 5 cảnh hero (điều hướng/khóa nút/câu trả lời), buồng sương (canvas đếm pixel vẽ ≠ nền), 4 tab tia + bảng so sánh (4 hàng tbody), section II canvas + table, section IV điều chỉnh 3 slider → đúng tính toán liều (từ 100 đv xuống 0.3 đv khi 4m + chì + 60 phút), quiz chọn đáp án đúng (tăng khoảng cách), video metadata (duration 93.73s, videoWidth 1920, 1 track phụ đề, poster đúng, readyState 4), 0 lỗi console (đã sửa hydration mismatch SVG do SSR/client float precision khác nhau bằng `.toFixed(2)`), 0 tràn ngang (mobile horizontalOverflow = 0).
- Route: `/hoc-lieu/phong-hat-nhan-v2?bai=B23`.
- Commit: `740fa569` ("feat(B23): thêm Mục IV (nguyên tắc an toàn phóng xạ) và video học liệu"), `+218` dòng, 2 file (`B23Activities.tsx`, `B23Lesson.tsx`).

### Bài 25 (bài tập về vật lí hạt nhân) — thiết kế lại

- **`B25Hero`** (5 cảnh): dẫn dắt qua ba nhóm kĩ năng (đọc đồ thị H(t) → chu kì bán rã; cân bằng phương trình theo A và Z; độ hụt khối → năng lượng liên kết), rồi vận dụng vào nhà máy điện, chiếu xạ, y học. Cảnh cuối là câu hỏi trắc nghiệm chặn nút "Tiếp": bốn lựa chọn 40 s / 60 s / 50 s / không chọn được từ một mốc — chỉ lựa chọn cuối đúng, kèm giải thích về nội suy 75,5 Bq giữa 85 và 55 Bq.
- **`B25Lesson`** (6 mục): I. Hệ thống hóa bốn công thức (thẻ có công thức KaTeX + lưu ý đơn vị); II. `B25DataProcessLab` — đồ thị Bảng 25.1 với 8 mốc đo giữ nguyên, chọn T giả thuyết, hiện đường lí thuyết, con trỏ thời gian, bảng đối chiếu; III. `NuclearEquationBalancer` — cân bằng phân rã α/β⁻/β⁺, cần đúng 2 ví dụ; IV. `BindingEnergyCalculator` — 5 hạt nhân, 4 bước tính Δm và Elk; V. Sáu bài tập SGK trang 121–122 với gợi ý đóng/mở; VI. Video B25.
- **Hai sub-lab được export** từ `B25Activities.tsx` (`NuclearEquationBalancer`, `BindingEnergyCalculator`) để dùng trực tiếp trong trang bài học; `NuclearPhysicsPracticeLab` cũ giữ nguyên cho route in-class hiện có.
- **Route mở rộng**: `page.tsx` chuyển từ `if (bai !== "B23")` sang bảng `LESSONS` — thêm bài mới chỉ cần một dòng.

**Kiểm chứng B25** (Playwright + Chrome thật, desktop 1440px + mobile 390px):
- Tiêu đề "Bài tập về vật lí hạt nhân"; 7 mục lục đúng thứ tự.
- Hero: 5 cảnh, nút "Tiếp" bị khóa ở cảnh cuối trước khi trả lời, sau khi chọn đáp án đúng hiện phản hồi "✓ Chính xác…".
- Mục II: 2 SVG (compact + wide), 8 hàng bảng, bật/tắt đường lí thuyết được, quiz trả lời đúng.
- Mục III: phân rã α cho "✓ Chính xác! A=234, Z=90 (Th). Đã đúng 1 bài."; chuyển sang β⁻ rồi kiểm tra cho "✓ A=14, Z=7 (N). Đã đúng 2 bài." → tiêu chí hoàn thành bật.
- Mục IV: metrics ⁴He = Δm 0,030377 u · Elk 28,3 MeV · Elk/A 7,07 MeV/nucleon (khớp giá trị tham chiếu); quiz U-235 trả lời đúng.
- Mục V: đủ 6 bài tập, phần gợi ý mở/đóng được.
- Video: duration 76,23 s, videoWidth 1920, readyState 4, 1 track phụ đề, poster và `src` đúng.
- 0 lỗi console, 0 tràn ngang ở cả 1440px và 390px.
- Commit: `5a33a74`, 7 file, +564 dòng.

**Sai sót đã sửa trong quá trình kiểm tra**: nhãn thời lượng video ghi "1:15" trong khi file thật dài 76,23 s → sửa thành 1:16.

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

### Trạng thái các bài còn lại

- **B21 (Cấu tạo hạt nhân), B22 (Năng lượng liên kết), B24 (Công nghiệp hạt nhân)**: chưa redesign theo mô hình VÒNG 6 (hero story + labs). Hiện vẫn chạy qua `/student/lessons/b2x/in-class` với `FixedPhysicsActivityRenderer`, chưa có trang `?bai=B2x`.
- **Mục III nội dung**: `RadiationSafety` trong B23 hiện tại chỉ có minh họa ion hóa cơ bản + 4 biển + câu hỏi đúng–sai. Theo gợi ý từ tóm tắt trước, có thể làm giàu thêm với các ví dụ SGK trang 110 về tác dụng sinh học cụ thể (phá hủy tế bào, đột biến, ung thư), liều an toàn cho nghề nghiệp, v.v. — chưa thực hiện.

## Các công cụ và khung hỗ trợ

- **Simulation-v2 framework** (VÒNG 5, đã test): `Timeline` (8 scene, pause/resume, goToScene, callbacks), physics modules (decay, fission dự kiến), renderer (Canvas2DRenderer, Three.js dự kiến), parameter system (clamp, snap, derive). Đã dùng trong `DecayProcessLab` của B23.
- **Shared components**: `Lab` (wrapper thống nhất cho mọi thí nghiệm), `ChoiceCheck` (quiz đúng–sai + giải thích), CSS classes `physics-*` (guide, controls, field, button, checklist, …).
- **AI cục bộ** (VÒNG trước): Qwen3 4B Instruct qua Ollama, khung giáo viên/học sinh; không liên quan đến bài học tương tác này.
- **Ngân hàng câu hỏi, phiếu, kế hoạch, ma trận đề** (VÒNG trước): 213 câu, DOCX export, flipped classroom workflows — không đổi trong VÒNG 6.1.

## Hạn chế và ghi chú

- **Chỉ B23 và B25 được redesign**: B21/B22/B24 vẫn thiếu trang tương tác tương đương. Cần các vòng tiếp theo để hoàn thiện bộ 5 bài.
- **Kiểm chứng browser tự động**: dùng Playwright-core + Chrome thật bên ngoài repo (tại `/tmp/b23-verify/`) vì dev server localhost:3000 không thể attach qua Claude's built-in Browser tool. Mọi lần kiểm tra B23 phải chạy script `node /tmp/b23-verify/shoot.js` hoặc `verify-iv.js` thủ công.
- **Không có thẩm định độc lập**: nội dung vật lí, phương pháp sư phạm và độ chính xác đơn vị/công thức chưa được giáo viên hoặc chuyên gia bên ngoài xác nhận. Video B23 do giáo viên cung cấp sẵn, chưa kiểm duyệt phụ đề đầy đủ.
- **Không có dữ liệu học sinh thực nghiệm**: chưa thu thập kết quả học tập, khảo sát mức độ tự học, hay so sánh với phương pháp truyền thống.
- **NCKH_MASTER_PROGRESS.md này**: tài liệu checkpoint đầu tiên cho dự án NCKH. Các tài liệu cập nhật trước (`PROGRESS_20261004.md`, `PROGRESS_20261005.md`) không bao quát VÒNG 6.

## Nguồn và tham chiếu

- **SGK Vật lí 12 KNTT (Kết nối tri thức)**: Bài 23 "Hiện tượng phóng xạ", trang 104–113, NXB Giáo dục Việt Nam 2023. Định luật phóng xạ, chu kì bán rã, các tia α/β/γ, biển cảnh báo, nguyên tắc ALARA.
- **Thí nghiệm Becquerel (1896)**: uranium + phim ảnh trong ngăn kéo tối, phát hiện tia vô hình.
- **Buồng sương Wilson**: Charles Thomson Rees Wilson, Nobel Prize 1927, quan sát vệt ion hóa của tia vũ trụ và phóng xạ.
- **ALARA (As Low As Reasonably Achievable)**: nguyên tắc an toàn phóng xạ quốc tế, ba yếu tố khoảng cách/thời gian/che chắn.
- **Video B23**: file `public/videos/nuclear-lessons-v2/b23.mp4` (4.9 MB), `b23.jpg` poster (287 KB), `b23.vi.vtt` phụ đề (1.5 KB) — nguồn từ giáo viên, chưa ghi rõ tác giả/giấy phép.
- **SGK Vật lí 12 KNTT, Bài 25** "Bài tập về vật lí hạt nhân", trang in 119–122: Bảng 25.1 (8 mốc H(t)), ba bài ví dụ (tĩnh điện kế, phân hạch U-235, xạ trị Co-60), sáu bài tập (tán xạ α, đồ thị H(t), định tuổi C-14, nhà máy 1400 MW, chiếu xạ Co-60, FDG/PET với ¹⁸F).
- **Video B25**: `public/videos/nuclear-lessons/b25.mp4` (4,3 MB, dài 76,23 s), `b25.jpg` poster (224 KB), `b25.vi.vtt` phụ đề (1,2 KB) — nguồn từ giáo viên.

## Các bước tiếp theo (gợi ý, chưa thực hiện)

1. **Redesign B21/B22/B24** theo mô hình tương tự B23/B25 (hero story + labs).
2. **Làm giàu Mục III** của B23: thêm ví dụ liều phơi nhiễm nghề nghiệp, bảng phân loại mức độ nguy hiểm theo SGK, hoặc video/ảnh thực tế (nếu có giấy phép).
3. **Thiết lập CI/CD**: chạy `npm test` tự động trên GitHub Actions hoặc GitLab CI mỗi khi push, để đảm bảo 102 test luôn xanh.
4. **Kiểm duyệt nội dung chuyên môn**: mời giáo viên Vật lí hoặc chuyên gia hạt nhân xem xét độ chính xác khoa học, phù hợp chương trình THPT, và khả năng tự học của học sinh.
5. **Thực nghiệm sư phạm**: thử nghiệm B23 với học sinh lớp 12 thực tế, thu thập phản hồi (khảo sát, phỏng vấn, điểm số trước/sau) để đánh giá hiệu quả flipped classroom.
6. **Viết bài báo khoa học**: cập nhật `BAI_BAO_KHOA_HOC_CAP_NHAT_HOC_LIEU.docx` với kết quả B23, phương pháp thiết kế simulation-v2, và kết quả thực nghiệm (khi có).

---

**Cập nhật lần cuối**: 10/11/2026  
**Cam kết hiện tại**: `5a33a74` (B25 redesign) sau `2b34eff` (test runner) và `740fa569` (B23 Mục IV + video) · `npm test` 102/102 đạt  
**Không push, không deploy, không xóa dữ liệu** (theo quy ước dự án)
