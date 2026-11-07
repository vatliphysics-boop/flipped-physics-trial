# AI PROJECT HANDOFF - VẬT LÍ 12 FLIPPED CLASSROOM

> Cập nhật: 2026-11-05 (Hoàn tất Chặng 1: Kiểm chứng PGlite 19/19, Kiểm thử Trình duyệt 7/7, Unit Tests 62/62, Typecheck, Lint & Build)

> Tiếp nối công việc Antigravity ngày 2026-11-05: phần chỉnh sửa bước học, công thức và xem trước được ghi riêng ở mục 6. Các kết quả Chặng 1 bên dưới là lịch sử kiểm chứng, không phải tất cả đều được chạy lại trong lượt tiếp nối.

## 1. Hiện trạng Migration (Đã xác minh bằng thực nghiệm)

| Migration | Trạng thái trên Supabase Live (`phlqyaitafkhpnyuwklw`) | Bằng chứng xác minh |
|-----------|--------------------------------------------------------|---------------------|
| 001–006, 008–010, 015–016 | ✅ Đã áp dụng từ trước | Xác minh qua `information_schema.tables` và `pg_policies` |
| 007, 012, 013, 017, 018, 019 | ✅ Đã hợp nhất vào **020** & áp dụng | Ban đầu live DB thiếu `lesson_material_progress`, `lesson_reflections`, `video_checkpoint_attempts`, `student_video_checkpoints`, `material_bank`, `lesson_pathway_steps`, `student_step_progress`, `teacher_teaching_plans`, `teacher_plan_applications` và cột `simulation_completed`/`assessment_answers`. Toàn bộ đã được hợp nhất vào `020` |
| **020** (`20261105_020_catchup_017_018_019.sql`) | ✅ **ĐÃ ÁP DỤNG & XÁC MINH** | Chạy thành công trong transaction qua `supabase db query --linked -f`; chạy lại lần 2 xác nhận idempotent; `node scripts/verify/probe-remote-schema.mjs` xác nhận toàn bộ 21 bảng/view tồn tại và cả 9 RPC chặn `anon` (`42501`) |

## 2. Những lỗi đã sửa và tệp chính liên quan

1. **Swap thứ tự bước học (`reorderPathwayStepsAction`) không nguyên tử:**
   - **Tệp:** `src/app/teacher/pathway-actions.ts`
   - **Sửa:** Chuyển sang hoán đổi 3 bước qua giá trị tạm âm (`-(step_order + 1)`) và kiểm tra lỗi từng câu lệnh UPDATE.
2. **Bước học tự chọn (`is_required = false`) bị từ chối khi bằng chứng rỗng:**
   - **Tệp:** `src/app/student/actions.ts` (`completePathwayStepAction`)
   - **Sửa:** Đọc `is_required` của bước học trước; chỉ bắt buộc `validatePathwayEvidence` khác `null` khi `step.is_required === true`, truyền `{}` cho bước tự chọn.
3. **Bài học tạo mới (`setupLessonAction`) ở trạng thái `draft` làm học sinh không thấy bài sau khi giáo viên giao bước học:**
   - **Tệp:** `src/app/teacher/pathway-actions.ts`, `src/app/teacher/actions.ts`, `src/app/teacher/lessons/[lessonId]/page.tsx`
   - **Sửa:** Khi giáo viên giao/xuất bản bước học (`addPathwayStepAction`, `setPathwayStepPublishedAction`), tự động cập nhật `lessons.status = 'published'`; đồng thời bổ sung nút `"Xuất bản bài học" / "Chuyển về bản nháp"` (`toggleLessonStatusAction`) trên trang tổng quan bài học của giáo viên.
4. **Học sinh nhận lỗi 404 khi mở bài học do bảng `topics` thiếu chính sách RLS cho học sinh:**
   - **Tệp:** `supabase/migrations/20261105_020_catchup_017_018_019.sql`, `src/lib/student-lesson.ts`
   - **Sửa:** Thêm policy `topics_student_select` cho phép học sinh đọc `topics` gắn với bài học `published` thuộc lớp mình tham gia; bổ sung fallback ánh xạ bài học theo tiêu đề trong `getStudentLesson`.
5. **Migration tiến tới tương thích (`020`) & lỗi trùng tên biến `id` trong `get_student_final_questions`:**
   - **Tệp:** `supabase/migrations/20261105_020_catchup_017_018_019.sql`
   - **Sửa:** Hợp nhất idempotent `007/012/013/017/018/019`, sửa `get_student_final_questions` dùng vòng lặp gán biến tường minh tránh lỗi `42702 column reference "id" is ambiguous`, ép kiểu `::uuid` trong policy `storage.objects`, và `REVOKE ALL ON FUNCTION ... FROM public, anon`.

## 3. Bảng kiểm chứng hành vi thực tế

### 3.1. Kiểm chứng tích hợp PostgreSQL/RLS/RPC cô lập (PGlite — `scripts/verify/b23-flow.mjs`: **19/19 ĐẠT**)

| Mã | Kịch bản | Trạng thái | Bằng chứng |
|---|---|---|---|
| T01 | Giáo viên đọc các bước học của bài mình tạo | ✅ ĐẠT | `asUser(teacher)` trả đúng 1 dòng |
| T02 | Học sinh trong lớp thấy bước học đã xuất bản | ✅ ĐẠT | `asUser(student1)` trả đúng 1 dòng |
| T03 | Người ngoài lớp không truy cập được bước học | ✅ ĐẠT | `asUser(outsider)` trả 0 dòng (RLS) |
| T04 | Học sinh 1 nộp bằng chứng qua RPC `complete_pathway_step` | ✅ ĐẠT | Trả `{ success: true }` |
| T05 | Yêu cầu gửi lặp (idempotent) không tạo bản ghi trùng | ✅ ĐẠT | Gọi lặp `complete_pathway_step` trả `{ success: true }`, giữ 1 bản ghi |
| T06 | Học sinh 2 không đọc được tiến độ của Học sinh 1 | ✅ ĐẠT | `asUser(student2)` truy vấn `student_step_progress` trả 0 dòng |
| T07 | Học sinh 2 chưa xong bước bắt buộc → không lấy được câu hỏi chốt | ✅ ĐẠT | `get_student_final_questions` trả 0 dòng |
| T08 | Học sinh 1 đã xong bước bắt buộc → lấy được 2 câu hỏi chốt | ✅ ĐẠT | `get_student_final_questions` trả 2 dòng |
| T09 | Đáp án đúng (`correct_answer`) không bị lộ xuống client ở Pha 1/2 | ✅ ĐẠT | Kết quả `get_student_final_questions` không chứa `correct_answer` |
| T10 | Học sinh 1 nộp câu trả lời chốt sai → bị từ chối chuyển pha | ✅ ĐẠT | `submit_phase_final_questions` trả `{ success: false }` |
| T11 | Học sinh 1 nộp câu trả lời chốt đúng → hoàn thành `before_class` | ✅ ĐẠT | `submit_phase_final_questions` trả `{ success: true }` |
| T12 | Học sinh 2 chưa xong `before_class` không thể nộp chốt `in_class` | ✅ ĐẠT | `submit_phase_final_questions('in_class')` trả `{ success: false }` |
| T13 | Giáo viên xem được tiến độ bước học của học sinh trong lớp | ✅ ĐẠT | `asUser(teacher)` đọc `student_step_progress` đúng `student_id` |
| T14 | Học sinh 1 không đọc được bản ghi `student_step_progress` của Học sinh 2 | ✅ ĐẠT | `asUser(student1)` lọc theo `student2` trả 0 dòng |
| T15 | Người ngoài lớp gọi RPC `complete_pathway_step` bị từ chối | ✅ ĐẠT | Trả `{ success: false }` (`Not enrolled in this class`) |
| T16 | Giáo viên lưu kế hoạch, áp dụng qua `apply_teacher_plan_draft`, chặn áp dụng trùng | ✅ ĐẠT | Lần 1 trả `{ success: true, count: 1 }`; lần 2 bị chặn với lỗi `already_applied` |
| T17 | Hai học sinh nộp bằng chứng khác nhau; giáo viên đọc cả hai không bị lẫn | ✅ ĐẠT | `student1` = `"resp"`, `student2` = `"resp_hs2_unique"` |
| T18 | Học sinh 1 không thể `UPDATE` hoặc sửa bài nộp của Học sinh 2 | ✅ ĐẠT | Sau lệnh `UPDATE` của `student1`, dữ liệu của `student2` vẫn giữ nguyên `"resp_hs2_unique"` |
| T19 | `get_student_assessment_questions` chặn khi chưa xong `in_class` và lọc sạch đáp án | ✅ ĐẠT | Trước khi xong `in_class` trả 0 dòng; sau khi xong trả câu hỏi đã loại bỏ `correctAnswers`, `correctValue`, `explanation` |

### 3.2. Kiểm chứng E2E trên trình duyệt thật (Playwright + Google Chrome — **7/7 ĐẠT**)

| # | Kịch bản trình duyệt (`http://localhost:3000`) | Trạng thái | Bằng chứng |
|---|---|---|---|
| B01 | Giáo viên tạo lớp và bài B23 | ✅ ĐẠT | Tạo lớp `12A1-KiemThu-B23` (`STJL8U`), thiết lập bài B23 (`8d4d729c-4600-47ed-857b-7effb4962200`) |
| B02 | Lưu, áp dụng kế hoạch và xuất bản bước học | ✅ ĐẠT | Lưu mẫu B23, tạo 6 bước nháp, xuất bản 1 bước ở Pha 1 (`Đã giao`), giữ 2 bước `Bản nháp` |
| B03 | Hai học sinh tham gia, nộp bằng chứng khác nhau | ✅ ĐẠT | `b23-hs1` và `b23-hs2` tham gia mã `STJL8U`, chỉ thấy 1 bước đã giao, nộp 2 bằng chứng riêng |
| B04 | Tải lại trang vẫn giữ tiến độ và bài nộp | ✅ ĐẠT | Sau `page.reload()`, cả 2 học sinh vẫn thấy `✓ Đã lưu bài nộp` và nguyên nội dung đã nhập |
| B05 | Giáo viên xem đúng từng bài nộp | ✅ ĐẠT | `/teacher/lessons/.../ket-qua?student=...` hiển thị đúng bài nộp từng học sinh |
| B06 | Chưa đủ điều kiện không chuyển pha; đủ điều kiện chuyển được | ✅ ĐẠT | Chưa nộp bước bắt buộc hoặc trả lời sai câu hỏi chốt bị redirect về `/before-class`; trả lời đúng mở khóa `/in-class` |
| B07 | Học sinh không truy cập được bài nộp của nhau | ✅ ĐẠT | UI/RLS cô lập; HS1 truy cập URL `ket-qua` của HS2 bị redirect về `/student` |

### 3.3. Kiểm tra chất lượng mã nguồn (Typecheck, Unit Tests, Lint, Build)

| Kiểm tra | Lệnh thực thi | Kết quả |
|---|---|---|
| TypeScript (`tsc`) | `npx tsc --noEmit` | ✅ ĐẠT (0 lỗi) |
| Unit tests | `node --import ./scripts/test-resolver.mjs --test tests/*.test.ts` | ✅ ĐẠT (62/62 pass) |
| ESLint | `npm run lint` | ✅ ĐẠT (0 lỗi) |
| Next.js Production Build | `npm run build` | ✅ ĐẠT |

## 4. Cách mở và kiểm tra kết quả

1. **Chạy bộ kiểm chứng PGlite cô lập (19 kịch bản):**
   ```bash
   PGLITE_DIR=/Users/vodoandangkhoi/.gemini/antigravity/brain/17e91277-4016-4e60-920d-e3b6e5d338ed/scratch/pg-harness node scripts/verify/b23-flow.mjs
   ```
2. **Chạy unit tests, typecheck và lint:**
   ```bash
   npx tsc --noEmit
   node --import ./scripts/test-resolver.mjs --test tests/*.test.ts
   npm run lint
   ```
3. **Kiểm tra trực tiếp trên trình duyệt:**
   - Chạy `npm run dev` và mở `http://localhost:3000/login`
   - Tài khoản kiểm thử đã tạo sẵn:
     - Giáo viên: `b23-gv@example.com` / `TestB23Pass!`
     - Học sinh 1: `b23-hs1@example.com` / `TestB23Pass!`
     - Học sinh 2: `b23-hs2@example.com` / `TestB23Pass!`
   - Bài B23 kiểm thử: `/teacher/lessons/8d4d729c-4600-47ed-857b-7effb4962200/ket-qua`

## 5. Bước tiếp theo khuyến nghị

Mở rộng kịch bản kiểm chứng trình duyệt cho trọn vẹn Pha 2 (`in-class` — tương tác mô phỏng `declare_simulation_completed` + câu hỏi chốt Pha 2) và Pha 3 (`after-class` — làm 6 câu đánh giá `submit_phase_assessment` + gửi phản hồi `lesson_reflections`) của bài B23 trước khi nhân rộng sang B21, B22, B24, B25.

## 6. Tiếp nối trình chỉnh sửa bước học và công thức (2026-11-05)

Dấu vết Antigravity mới nhất nằm ở kiểm chứng `verify-step-editor-math.mjs` và ảnh giao diện lúc 19:37, sau phần bàn giao Chặng 1. Phạm vi tiếp nối là hoàn thiện trình chỉnh sửa, xem trước nhiệm vụ và hiển thị công thức cho học sinh.

### Các lỗi phát hiện và sửa trong lượt tiếp nối

- **Xem trước bị trình soạn thảo che:** hai hộp thoại dùng cùng lớp hiển thị; trình soạn thảo xuất hiện sau nên chặn thao tác xem trước. Giữ trình soạn thảo được mount nhưng ẩn khi xem trước để bảo toàn nội dung, vị trí con trỏ và trạng thái chưa lưu. Đóng xem trước quay lại bản đang soạn.
- **Chatbox AI che nút lưu trên điện thoại:** đã tái hiện bằng thao tác bấm thật tại viewport 390 × 844. Đặt backdrop của trình soạn thảo và xem trước phía trên Chatbox; nút lưu bấm được bình thường.
- **Lưu khi mất kết nối:** bắt lỗi Server Action, giữ nguyên nội dung và cho phép thử lại. Khóa các trường nhập trong lúc lưu để tránh ghi đè nội dung giáo viên vừa sửa khi phản hồi cũ quay về. Áp dụng giới hạn 8000 kí tự cả ở ô nhập và trước khi gửi.
- **Văn bản và công thức:** sửa hiển thị dấu đô la được escape (`\$`); sửa mẫu phân số/căn thức để không gán tỉ số phóng xạ bằng một biểu thức chứa biến `n` chưa xác định quan hệ.
- **Hai lỗi lint quản lý lớp:** chuyển cập nhật danh sách sau khi xóa thành viên và đóng hộp tạo mã sang xử lý kết quả action; không gọi `setState` đồng bộ từ effect.

### Kiểm chứng có thể chạy lại

Script mới: `scripts/verify/step-editor-e2e.mjs`. Script sử dụng tài khoản kiểm thử B23 ở mục 4, lưu một nội dung tạm rồi khôi phục nội dung gốc trong `finally` và kiểm tra lại sau reload. Chỉ chạy với bài kiểm thử, không dùng bài đang dạy. Bản sao nội dung gốc được lưu tại `tmp/step-editor-e2e/fixture-original.json` để khôi phục nếu tiến trình bị dừng ngoài ý muốn.

```bash
# Chạy npm run dev ở terminal khác trước.
# PLAYWRIGHT_CORE_PATH trỏ tới package playwright-core đã cài nếu repo chưa có.
B23_LESSON_ID=8d4d729c-4600-47ed-857b-7effb4962200 \
PLAYWRIGHT_CORE_PATH=/duong/dan/node_modules/playwright-core \
node scripts/verify/step-editor-e2e.mjs
```

Các ca kiểm tra gồm: dấu đô la và thông báo lỗi công thức; khả năng bấm cửa sổ xem trước; giữ bản chưa lưu; cảnh báo khi đóng; giả lập mất kết nối và thử lưu lại; LaTeX/xuống dòng sau reload; kích thước mobile; học sinh đọc đúng nội dung; khôi phục dữ liệu gốc bằng nút lưu trên mobile.

Kết quả lượt tiếp nối:

- `npm run lint`: đạt, 0 lỗi.
- `npx tsc --noEmit`: đạt; production build cũng hoàn tất kiểm tra TypeScript.
- Unit tests: 62/62 đạt.
- `step-editor-e2e.mjs`: cả 7 nhóm kiểm tra đạt; đã khôi phục và xác minh nội dung gốc sau reload, không còn marker kiểm thử trên bài học.
- `npm run build`: đạt. Còn cảnh báo tracing toàn dự án ở `src/lib/book-bank-server.ts:6` do đường dẫn filesystem động; nằm ngoài phạm vi trình chỉnh sửa.
- `git diff --check` trên các tệp đã sửa trong lượt này: đạt. Kiểm tra toàn cây vẫn báo dòng trống cuối tệp có sẵn ở `PublicShell.tsx`, `layout.tsx`, `page.tsx`.
- Log E2E và build: `tmp/continuation-20261105/`; ảnh desktop/mobile: `tmp/step-editor-e2e/`.

Chưa triển khai bản sửa này lên môi trường production. Phần mở rộng kiểm chứng Pha 2/Pha 3 ở mục 5 là công việc riêng, chưa được xác nhận hoàn tất trong lượt tiếp nối này.

## 7. Đóng gói kho câu hỏi cho production (2026-11-05)

Cảnh báo ghi ở mục 6 đã được xử lý. Build cũ báo nguyên văn:

```text
./src/lib/book-bank-server.ts:6:31
Warning: Dynamic filesystem access causes tracing of the whole project

Static analysis determined that this filesystem access causes the whole project to be traced and included in the output.
```

Dòng gây cảnh báo là `path.resolve(process.env.BOOK_BANK_DIR || "data/book-bank")`. Bộ phân tích tĩnh không xác định được gốc đường dẫn từ biến môi trường. Trước khi sửa, các manifest của cả API tải Word và các API kho câu hỏi chứa nhiều tệp nằm ngoài phạm vi cần dùng.

`next.config.ts` tạo bộ dữ liệu riêng trong `data/book-bank/.next-runtime` ở bước production build. Bộ này gồm `index.json`, `unified.json` và các ảnh được chỉ mục tham chiếu. Tracing được khai báo theo từng route. Thư mục trung gian tách các ảnh thật khỏi tệp OCR trùng tiền tố mà Turbopack có thể khớp cùng lúc. Các vị trí đọc đường dẫn lúc chạy dùng chỉ dẫn bỏ qua suy luận tự động vì danh sách file mặc định đã được khai báo tường minh.

`BOOK_BANK_DIR` vẫn được đọc lúc chạy và ưu tiên hơn bộ đã đóng gói. Đường dẫn tương đối tính từ thư mục chạy ứng dụng. Khi biến không được đặt, production ưu tiên bộ đã đóng gói và dùng `data/book-bank` nếu không có thư mục đó. Mọi tệp kho nằm ngoài `public/`.

Kiểm chứng:

- `npm run build` và kiểm tra TypeScript đạt, cảnh báo mục tiêu đã hết. ESLint cho năm tệp mã thay đổi và 11 kiểm thử kho câu hỏi đều đạt.
- Các manifest `.next/server/app/api/**/route.js.nft.json` có đúng dữ liệu cần thiết. `/api/question-bank` có `unified.json`, `/api/book-bank` có `index.json`, `/api/book-bank/asset` có chỉ mục và 2.888 ảnh, còn `/api/word-download` có 0 tệp kho. Đã đối chiếu với chỉ mục gốc và xác nhận không có ảnh thiếu, tệp OCR, bản scan gốc, tài liệu hoặc tệp làm việc bị kéo theo.
- Đã mở `/teacher/ai` trên bản `next start` với tài khoản giáo viên. Cổng 3417 dùng mặc định, cổng 3418 dùng `BOOK_BANK_DIR` trỏ tới bộ được tái dựng từ manifest. Cả hai hiển thị 212 câu, đọc chỉ mục ba sách và trả ảnh có nội dung khớp file nguồn. Yêu cầu chưa đăng nhập nhận 401 và truy cập trực tiếp đường dẫn dữ liệu nhận 404.
- Cổng 3419 trỏ `BOOK_BANK_DIR` tới thư mục không tồn tại. Giao diện vẫn hiển thị kho dự phòng cùng thông báo “Máy chủ chưa cài dữ liệu trích xuất từ ba sách.” API chỉ mục và ảnh trả 503 với thông báo tiếng Việt. Server thử nghiệm được đóng sau khi kiểm tra.

Khi đóng gói từ manifest, giữ đúng cấu trúc `data/book-bank/.next-runtime` và bảo đảm tiến trình Next.js có quyền đọc. Với `BOOK_BANK_DIR` tùy chỉnh, cấp riêng thư mục có `index.json`, `unified.json` và ảnh theo cấu trúc chỉ mục. `.vercelignore` hiện loại `data/book-bank` khỏi nguồn upload, nên build từ nguồn đó cần được cấp kho riêng để dùng dữ liệu đầy đủ. Đã xác minh manifest Next.js và bản chạy production local. Chưa có `.vercel/output` để kiểm tra gói Vercel, và chưa kiểm tra môi trường Vercel thật.

## 8. Phòng khám phá 3D và video B21–B25 (2026-11-05)

- Mở trang chủ tại `/`, phòng khám phá tại `/hoc-lieu/phong-hat-nhan?bai=B21` (đổi mã tới B25). Mỗi bài có mô hình, video, một câu hỏi dẫn và nhiệm vụ quan sát. Kho học liệu và phòng mô phỏng hiện có cũng dẫn tới khu vực mới.
- Mô hình web dựng bằng Three.js, tọa độ ổn định theo seed và theo từng đồng vị. Góc trước, sau, bên, trên, phóng to/thu nhỏ, đặt lại, tự xoay, chọn hạt và cắt lớp là thao tác quan sát. Số A, Z, N giữ nguyên. Carbon-12 có 6 proton, 6 neutron. Hình cầu và vị trí là quy ước, không mô tả vị trí thực của nucleon. Không thêm quỹ đạo electron hay làm đồng vị bền phân rã.
- Học liệu mới được đăng ký theo từng bài để dùng trực tiếp trong kho giáo viên và trình xem trước. Chọn học liệu trong tiến trình, xem thử, rồi chọn “Lưu bản nháp” hoặc “Giao bước học”. Giáo viên chỉnh công thức trong trình soạn hiện có. Bản nháp chỉ xuất hiện phía giáo viên và việc xem thử không nộp bài.
- Dữ liệu và nguồn đối chiếu ở [NUCLEAR_SCIENCE_SOURCES.md](NUCLEAR_SCIENCE_SOURCES.md). Dữ liệu hạt nhân nằm trong `src/lib/nuclear-science.ts`, tọa độ minh họa trong `src/lib/nucleus-layout.ts`. Áp dụng quy trình dựng bằng primitives và kiểm chứng nhiều góc từ [img2threejs](https://github.com/img2threejs/img2threejs), phân cảnh, thử khung hình và kiểm tra đầu ra từ [video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft).
- Mã render, storyboard và lời đọc tiếng Việt để thu âm ở [scripts/nuclear-videos](../scripts/nuclear-videos/README.md). Các MP4, ảnh poster và VTT nằm trong `public/videos/nuclear-lessons/`. Bộ render độc lập với runtime Next.js.
- Ảnh WebGL thực tế gồm [trước](previews/nuclear-lab/carbon-12-truoc.png), [sau](previews/nuclear-lab/carbon-12-sau.png), [bên](previews/nuclear-lab/carbon-12-ben.png), [trên](previews/nuclear-lab/carbon-12-tren.png) và [cắt lớp](previews/nuclear-lab/carbon-12-cat-lop.png).

| Bài | Tệp MP4 | Thời lượng | Kết quả |
| --- | --- | --- | --- |
| B21 · Cấu trúc hạt nhân | [b21.mp4](../public/videos/nuclear-lessons/b21.mp4) | 72 giây | Render, phát, tua đạt |
| B22 · Năng lượng liên kết và phản ứng | [b22.mp4](../public/videos/nuclear-lessons/b22.mp4) | 60 giây | Render, phát, tua đạt |
| B23 · Phóng xạ | [b23.mp4](../public/videos/nuclear-lessons/b23.mp4) | 60 giây | Render, phát, tua đạt |
| B24 · Công nghiệp hạt nhân | [b24.mp4](../public/videos/nuclear-lessons/b24.mp4) | 60 giây | Render, phát, tua đạt |
| B25 · Bài tập tổng hợp | [b25.mp4](../public/videos/nuclear-lessons/b25.mp4) | 60 giây | Render, phát, tua đạt |

Tất cả tệp là H.264 1920 × 1080, 30 fps. Đã xem khung đầu, giữa, cuối và các cảnh chính từ MP4 giải mã. B22–B25 lấy mẫu chuyển động 15 lần/giây ở đoạn chuyển động ngắn rồi xuất 30 fps. Có phụ đề tiếng Việt trên hình và VTT. Video chưa có giọng đọc, có [kịch bản riêng](../scripts/nuclear-videos/NARRATION.vi.md).

- Chrome desktop và giả lập điện thoại 390 × 844 kiểm tra góc nhìn, zoom, chọn hạt, cắt lớp, tự xoay, toàn màn hình, vuốt ngang xoay và vuốt dọc cuộn trang. Đã kiểm tra điều khiển camera bằng bàn phím, chế độ giảm chuyển động và sơ đồ dự phòng khi tắt WebGL. Cả năm bài có số hạt đúng khi cắt lớp. Nút Chatbox nổi được chuyển khỏi trang chủ và phòng khám phá để tránh che nút, lối vào Trợ lí học tập vẫn có trong mục lục.
- `scripts/verify/nuclear-lab-browser.mjs` kiểm tra phát và tua cả năm video trên production local cổng 3461, xác nhận video chỉ được tải khi người dùng mở, và phát video B21 trong xem trước của giáo viên. Tên học sinh và ngày tham gia hiển thị trên hai dòng ở 390 px.
- Với fixture B23, đã xác minh xem thử mô hình trước khi lưu, nháp tồn tại sau khi tải lại, có thể mở chỉnh sửa và học sinh không nhìn thấy nháp. `scripts/verify/step-editor-e2e.mjs` xác nhận LaTeX, cảnh báo bản chưa lưu, lưu lại khi lỗi mạng và kết quả phía học sinh. Đã khôi phục nội dung ban đầu và xóa toàn bộ bản nháp kiểm thử của lượt này. Không chạy migration hay thay đổi schema.
- `npm run lint`, TypeScript, 28 kiểm thử liên quan và 2 kiểm thử storyboard/KaTeX đạt. `npm run build` đạt, không có cảnh báo tracing cũ. API production local trả 212 câu hỏi từ bộ đóng gói và manifest kho vẫn đúng. Nhật ký ở `tmp/nuclear-lab-qa/`, bằng chứng giải mã theo cảnh ở `tmp/nuclear-video-qa/`.

**BÀN GIAO CHO CHATGPT**

Mở `/hoc-lieu/phong-hat-nhan?bai=B21` tới `B25` trên localhost, dùng `nuclear-lab-lessons.ts` để điều chỉnh nhiệm vụ và `scripts/nuclear-videos/README.md` để render lại. Giữ `nuclear-science.ts` và `nucleus-layout.ts` làm nguồn chung cho web/video. Dùng fixture B23 cho kiểm chứng có ghi dữ liệu và khôi phục ngay sau đó. Kết quả hiện xác minh cục bộ, bao gồm giả lập thiết bị di động.

## 9. Đối chiếu nội dung và hoàn thiện luồng B21–B25 (2026-11-05)

### Nguồn và phạm vi

[Bảng đối chiếu SGK, đề cương và website](SGK_RESEARCH_WEB_MATRIX.md) ghi vị trí nguồn, phần đã sửa và tiêu chí kiểm tra. Tên và trang in của năm bài lấy từ bản mẫu SGK Vật lí 12 Kết nối tri thức tháng 1/2024 trong workspace. Đề cương sau lần cập nhật 04/11/2026 và thuyết minh ngày 04/09/2026 là căn cứ cho tiến trình và thông tin công trình. Ba kế hoạch dạy học của đề cương lần lượt là B21, B23 và cụm B22/B24/B25. Website giữ năm mục theo SGK để chọn và giao học liệu. Chưa có bản SGK thương mại để đối chiếu khác biệt ấn bản. Các mục về địa bàn và số lớp trong hồ sơ nghiên cứu cần được xác nhận khi tổ chức thực nghiệm.

| Bài | Trang in | Hoạt động chính |
| --- | --- | --- |
| B21 · Cấu trúc hạt nhân | 91–95 | Giải thích tán xạ alpha, dựng và so sánh đồng vị |
| B22 · Phản ứng hạt nhân và năng lượng liên kết | 96–103 | Cân bằng phản ứng và giải thích ý nghĩa năng lượng liên kết riêng |
| B23 · Hiện tượng phóng xạ | 104–113 | So sánh quy luật kì vọng và phân rã ngẫu nhiên, giải thích và chọn hành động an toàn |
| B24 · Công nghiệp hạt nhân | 114–118 | Theo dõi dòng năng lượng và tác dụng của thanh điều khiển, phân tích một ứng dụng |
| B25 · Bài tập về vật lí hạt nhân | 119–122 | Đọc Bảng 25.1, ước lượng chu kì bán rã, kiểm tra phương trình và đơn vị |

### Đã triển khai

- Mỗi bài có ba nhiệm vụ riêng với mục tiêu, thao tác, sản phẩm và tiêu chí. Mẫu mới có video trước giờ, hoạt động chính phù hợp trong giờ, bài tập và tự đánh giá sau giờ. Các hoạt động bổ sung có thể dùng để mở rộng. Thông tin dùng chung nằm trong `src/lib/nuclear-learning-sequence.ts`.
- Giáo viên mở **Bài học**, chọn lớp rồi **Thiết lập bài học**. Ba bước tạo ở trạng thái nháp. Trong từng pha, mở **Xem trước** hoặc **Chỉnh sửa**, kiểm tra rồi chọn **Giao cho học sinh**. Với bài đã có, nút **Bổ sung mẫu còn thiếu** trên trang tổng quan chỉ bổ sung phần còn thiếu. Mẫu không thay thế nhiệm vụ/câu hỏi đã lưu.
- Học sinh ghi mục tiêu hoặc dự đoán, bằng chứng và điều chỉnh theo pha. Giáo viên mở **Kết quả học sinh**, chọn học sinh và pha để xem yêu cầu cạnh bài nộp, phần vận dụng và nhật kí. Các trường là minh chứng định tính cho TH1–TH10, giữ riêng điểm kiến thức và mức tự tin do học sinh tự ghi. Lớp có tiền tố `[QA]` và câu trả lời kiểm thử chỉ dùng cho QA kỹ thuật.
- Mô hình tán xạ, phân hạch và phân rã dùng đúng thành phần hạt nhân minh họa. A, Z, N giữ nguyên khi đổi camera hoặc cắt lớp. Vị trí, màu sắc và kích thước hạt là quy ước. Đồ thị B25 phân biệt tám điểm của Bảng 25.1 với đường hàm minh họa. B24 dùng mức định tính cho sơ đồ lò. Xem [hồ sơ khoa học](NUCLEAR_SCIENCE_SOURCES.md).
- Công thức trong nội dung mới, lời giải, mô phỏng và xem trước dùng KaTeX hoặc công thức đã kết xuất. Trình hiển thị chuyển các mẫu công thức B23 cũ mà không đổi dữ liệu/đáp án đã lưu. Các bản chép và kho hợp nhất được đồng bộ các phép chia, số mũ đã dàn lại. Footer dùng danh mục chuẩn chung, có thông tin công trình mở rộng và các liên kết thật. Trang trực quan dùng trợ lí trong nội dung để tránh hai bảng chat cùng nổi.
- Cả năm video đã cập nhật theo SGK và kết xuất lại. B21 dài 72 giây, B22–B25 mỗi phim 60 giây. Đầu ra H.264 1920 × 1080, 30 fps. Đoạn chuyển động tính từng khung ở 30 fps, sau đó giữ khung tĩnh cho thời gian đọc. Ghi chú 15 fps tại mục 8 thuộc bản cũ. MP4, poster và VTT ở `public/videos/nuclear-lessons/`. [Lệnh render và kịch bản](../scripts/nuclear-videos/README.md). Có phụ đề tiếng Việt và [lời đọc riêng](../scripts/nuclear-videos/NARRATION.vi.md).

### Mở và trình bày

Chạy `npm run dev` trong workspace với cấu hình Supabase hiện có. Mở `/`, `/hoc-lieu/phong-hat-nhan?bai=B21` hoặc `/hoc-lieu/truc-quan?bai=B23`. Đổi mã bài để xem mô hình, video và ví dụ tiến trình tương ứng. Với bản production cục bộ, chạy `npm run build`, rồi `npm run start -- -H 127.0.0.1 -p 3471` nếu cổng này rảnh.

Ảnh giao diện đã chụp trong trình duyệt gồm [trang chủ 1366 px](previews/sgk-review/public-home-1366.png), [footer 390 px](previews/sgk-review/public-footer-390.png), [tiến trình và công thức B25 390 px](previews/sgk-review/b25-phase-formulas-390.png), [phòng trực quan B23 320 px](previews/sgk-alignment/truc-quan-b23-320.png), [infographic B25 1366 px](previews/sgk-alignment/b25-infographic-1366.png). [Ảnh nhiều góc carbon-12](previews/nuclear-lab/) ở mục 8 là ảnh của phiên bản phòng khám phá dùng chung.

### Đã kiểm chứng

- Chrome trên bản production cục bộ cổng 3472, một lớp `[QA]` riêng và ba tài khoản kiểm thử. B21–B25 qua đủ 15 pha. Từng bài được thiết lập và giao từ màn hình giáo viên. Học sinh thực hiện hoạt động đúng bài, nộp minh chứng, tải lại và chuyển pha đúng điều kiện. Các bài đã lưu đủ hai câu đánh giá cuối bài và nhật kí. Giáo viên đọc đúng sản phẩm ở cả ba pha. Lượt xem trước video B25 giữ nguyên trạng thái nháp và học sinh trong lớp nhận 404 trước khi giao. B21 đã kiểm tra lưu lại LaTeX và đọc lại công thức từ bản lưu. [Xem trước ở 390 px](previews/sgk-review/teacher-b21-preview-390.png), [kết quả B23](previews/sgk-alignment/kiem-thu-b23-ket-qua.png) và [kết quả B25](previews/sgk-review/teacher-b25-evidence-1366.png).
- Tài khoản ngoài lớp nhận 404 đối với cả năm bài. Kiểm tra quyền ở Supabase xác nhận RPC từ ngoài lớp bị từ chối, học sinh trong lớp không đọc được bước nháp và bạn cùng lớp không đọc/sửa được bài nộp của học sinh khác. Bản nháp và thành viên tạm dùng cho phép kiểm tra quyền đã được dọn trong lớp QA. Giữ lớp QA và kết quả kiểm thử để đối chiếu.
- Giao diện công khai kiểm tra 15 tổ hợp trang/kích thước 320, 375, 390, 768, 1366 px, cùng 20 tổ hợp ở phòng trực quan và năm kích thước cho xem trước giáo viên. Các ca kiểm tra không tràn ngang hoặc cắt công thức. Chrome WebGL đã thử đổi góc, zoom, chọn proton, cắt lớp và toàn màn hình. Trong mô phỏng phân hạch B22, xác nhận hai mảnh và ba neutron tự do, đồng thời chụp ảnh [góc trước](previews/sgk-alignment/b22-phan-hach-390.png), [góc trên](previews/sgk-alignment/b22-phan-hach-768.png) và [góc bên](previews/sgk-alignment/b22-phan-hach-1366.png).
- Năm MP4 thực sự phát, tua đến giữa và gần cuối ở Chrome 390 px. Track tiếng Việt tải đủ cue. Đã giải mã các mốc đầu, giữa, cuối và chuyển cảnh; kiểm tra 1.664 khung chuyển động từ 26 cảnh. Các dấu hiệu lỗi xếp ô phát hiện trong bản nháp đã được sửa và kiểm tra lại. Log, khung hình và contact sheet ở `tmp/nuclear-video-review/`. Mỗi MP4 có HTTP Range 206 khi tua.
- ESLint, TypeScript và 42 kiểm thử liên quan đạt. Hai kiểm tra storyboard/KaTeX của bộ render đạt. Build cuối sau hai chỉnh sửa câu hướng dẫn B23/B25 chạy thành công, bản `next start` cổng 3473. Không có cảnh báo tracing cũ. API production cục bộ trả 212 câu, chỉ mục ba sách và ảnh khớp dữ liệu gốc. Manifest gồm chỉ mục và 2.888 ảnh được dùng, không kéo PDF/OCR. Log và bằng chứng luồng nằm ở `tmp/sgk-phase-qa/`, `tmp/sgk-phase-b22-b23/` và `tmp/sgk-phase-b24-b25/`.

### Chưa xác minh

- Nội dung đối chiếu theo bản SGK mẫu trong workspace và hồ sơ nghiên cứu có sẵn. Chưa đối chiếu ấn bản SGK thương mại khác, chưa xác nhận hồ sơ địa bàn, số lớp hoặc thẩm định công cụ. Các giá trị tự đánh giá và dữ liệu QA không dùng để kết luận hiệu quả nghiên cứu.
- Đã kiểm tra trên Chrome desktop và giả lập kích thước thiết bị. Chưa kiểm tra điện thoại vật lí, trình duyệt khác hoặc môi trường triển khai từ xa. Khi đóng gói triển khai thực, cấp bộ kho câu hỏi theo mục 7 và xác nhận phục vụ MP4 theo byte range. Video có phụ đề và kịch bản, chưa có giọng đọc.
- Trong phép dọn lớp QA, yêu cầu trực tiếp bằng tài khoản học sinh không xóa bản ghi thành viên trên Supabase đang cấu hình. Đã dọn và xác minh bằng tài khoản giáo viên. Hành vi tự rời lớp nằm ngoài luồng nộp bài đã kiểm chứng.
- Không chạy migration, không đặt lại dữ liệu và không triển khai công khai. Các bản ghi ghi thử thuộc lớp kiểm thử được đánh dấu riêng.

**BÀN GIAO CHO CHATGPT**

Đọc mục 9 cùng [bảng đối chiếu](SGK_RESEARCH_WEB_MATRIX.md). Khi soạn cho lớp thật, chọn bài tại `/teacher/lessons`, kiểm tra ba bước nháp và chỉ giao sau khi xem trước. Giữ bảng số liệu B25 ở `src/data/sgk-b25-table-25-1.json`, dữ liệu hạt nhân ở `src/lib/nuclear-science.ts` và nội dung từng pha ở `src/lib/nuclear-learning-sequence.ts`. Kiểm thử có ghi dữ liệu bằng `scripts/verify/sgk-phase-browser.mjs` và `scripts/verify/sgk-phase-rls.mjs` trên lớp QA riêng. Dùng thư mục artifact mới cho lượt chạy mới. Tài liệu và log cục bộ là căn cứ bàn giao kỹ thuật. Việc xác nhận ấn bản và hồ sơ nghiên cứu vẫn theo thẩm quyền của nhóm và giảng viên.

## 10. Mô phỏng quá trình và năm video có giọng đọc (2026-11-06)

Mục này ghi hiện trạng mới nhất, tiếp nối mục 9. Năm video có thuyết minh dưới đây đã thay bộ video phụ đề của chặng trước trong website cục bộ. Trang phòng khám phá đưa **Mô phỏng và dữ liệu** lên trước phần quan sát cấu tạo hạt nhân. Giáo viên dùng được các quá trình này trong bản xem trước học liệu. [Phạm vi và bằng chứng mô phỏng](PHYSICS_PROCESS_VERIFICATION.md), [đối chiếu SGK – đề cương](SGK_RESEARCH_WEB_MATRIX.md)

### Sản phẩm đã triển khai và cách mở

Bản production cục bộ cuối đang phục vụ tại `http://127.0.0.1:3476`. Đã build thành công sau khi cập nhật video và metadata. Khi cần khởi động lại, chạy từ workspace bằng `npm run build`, rồi `npm run start -- -H 127.0.0.1 -p 3476` với cổng còn trống. Bản dev của người dùng ở cổng 3000 vẫn được giữ.

| Bài | Mở mô phỏng quá trình | Nội dung chính | MP4 có thuyết minh | Thời lượng |
| --- | --- | --- | --- | --- |
| B21 | [Tán xạ alpha](http://127.0.0.1:3476/hoc-lieu/phong-hat-nhan?bai=B21#qua-trinh) | Hai lượt alpha cùng đồng hồ, đổi tham số va chạm hoặc động năng, ghi góc tán xạ và vị trí chạm màn. | [b21.mp4](../public/videos/nuclear-lessons/b21.mp4) | 89,800 s |
| B22 | [Phân hạch cảm ứng](http://127.0.0.1:3476/hoc-lieu/phong-hat-nhan?bai=B22#qua-trinh) | Neutron tới, hấp thụ, biến dạng, sản phẩm. So với lượt không có neutron, kiểm tra tổng A/Z và năng lượng của kênh. | [b22.mp4](../public/videos/nuclear-lessons/b22.mp4) | 75,200 s |
| B23 | [Mẫu phóng xạ](http://127.0.0.1:3476/hoc-lieu/phong-hat-nhan?bai=B23#qua-trinh) | Thời điểm phân rã có seed, bộ đếm lí tưởng, lượt chạy và đường kì vọng, đối chiếu điều kiện và xuất CSV. | [b23.mp4](../public/videos/nuclear-lessons/b23.mp4) | 93,733 s |
| B24 | [Điều khiển và truyền nhiệt](http://127.0.0.1:3476/hoc-lieu/phong-hat-nhan?bai=B24#qua-trinh) | Mức cắm thanh và chỉ số theo thế hệ, sau đó diễn tiến nhiệt qua hai vòng nước PWR tới tua-bin, máy phát và bình ngưng. | [b24.mp4](../public/videos/nuclear-lessons/b24.mp4) | 71,967 s |
| B25 | [Đọc Bảng 25.1](http://127.0.0.1:3476/hoc-lieu/phong-hat-nhan?bai=B25#qua-trinh) | Tám điểm nguồn giữ nguyên, hai giả thuyết bán rã, con trỏ đọc và độ lệch giữa mô hình với bảng. | [b25.mp4](../public/videos/nuclear-lessons/b25.mp4) | 76,233 s |

Cả năm bản đã render và tích hợp, có poster và WebVTT cùng tên tại `public/videos/nuclear-lessons/`. Định dạng H.264 1920 × 1080, 30 fps, AAC mono 48 kHz. Lời đọc dùng giọng tổng hợp **Kim Thanh · VieNeu-TTS v3 Turbo**, chạy cục bộ theo mô hình và phiên bản đã ghim. Quyền sử dụng preset được ghi cùng nguồn xác nhận của tác giả. [Thiết lập và điều khoản giọng](../scripts/nuclear-videos/voice/README.md)

Các hàm dùng chung giữa web và phim nằm trong `rutherford-model.ts`, `fission-model.ts`, `radioactive-decay-model.ts`, `reactor-model.ts` và `sgk-b25-decay.ts` ở `src/lib/`. Dữ liệu khoa học, cấu trúc hạt và số liệu Bảng 25.1 giữ ở các nguồn chung. Mã cảnh, lời đọc, phụ đề và lệnh dựng ở [scripts/nuclear-videos](../scripts/nuclear-videos/README.md). Mốc cảnh bản có lời được tạo từ độ dài WAV trên lưới 30 fps.

### Đã kiểm chứng

- TypeScript, ESLint cho các tệp liên quan và build cuối đạt. Có **23 kiểm thử mô hình**, **5 kiểm thử bộ dựng** và **2 kiểm thử Python** đạt. [Log mô hình](../tmp/nuclear-process/final-model-tests.log), [log Python](../tmp/nuclear-voice/prepare-tests.log), [build cuối](../tmp/nuclear-process/build-release.log).
- B21 đã kiểm tra chạy, dừng giữ thời gian, tiếp tục, bước, tốc độ, đổi điều kiện, tới màn và đặt lại ở 320, 390, 768, 1366 px. B22–B25 đã kiểm tra lại trên bản production cuối ở cả bốn độ rộng. B22/B24 dừng đồng hồ khi hoạt động ra khỏi màn hình; trở lại không tự chạy tiếp. [Ảnh và thao tác cụ thể](PHYSICS_PROCESS_VERIFICATION.md).
- Đợt kiểm tra màn hình hẹp phát hiện chữ trong sơ đồ/đồ thị nhỏ. B23/B25 nay đổi bố cục theo chiều rộng khung, đưa tiêu đề/chú giải ra HTML và giảm số mốc trục; B24 có sơ đồ dọc cho hai vòng nước và đường neutron. Nhãn SVG đã kiểm tra kích thước thực và biên khung. Histogram B23 dùng thang bao trọn số đếm của lượt: ca N₀ = 32, T = 5 s, seed 3262 ghi 12 phân rã trong giây đầu, không còn vượt thang cũ 11. Chỉ thay phần dựng hình, giữ hàm vật lí và dữ liệu/video. Build sau các chỉnh sửa này đạt.
- Năm mô phỏng trong bản xem trước giáo viên đã phản hồi thao tác ở 390 và 1366 px. Mười ca ghi nhận 0 yêu cầu ghi dữ liệu sau đăng nhập. Cửa sổ không có nút nộp bài hoặc ghi điểm. [Bằng chứng xem trước](PHYSICS_PROCESS_VERIFICATION.md#xem-trước-trong-kho-học-liệu-giáo-viên).
- Đã giải mã và xem **158 khung thực từ năm MP4 cuối**, gồm đầu, giữa, cuối, các lần cắt cảnh và khung trước/tại/sau mốc lời giải. Ba dấu neutron B22 đã tách rõ, nhãn sơ đồ PWR B24 đã dời khỏi bình ngưng, nhãn 85/55 của B25 tránh đường lí thuyết. Ảnh độc lập và bảng khung có SHA-256 nằm ở `tmp/nuclear-voice/process-review-final/<bài>/independent/`. [Chỉ mục kiểm tra hình](../tmp/nuclear-voice/independent-visual-summary.json).
- Codec, số khung, nhịp chuyển động 30 fps, thời lượng AAC, âm lượng và peak được kiểm tra trên MP4 đã mã hóa. Tín hiệu AAC được đối chiếu WAV tổng và từng khoảng phụ đề. Năm MP4 trong `public` khớp SHA-256 với bản đã kiểm tra. Bộ thay video sao lưu bản trước khi cập nhật cả năm tệp và metadata. [Báo cáo âm thanh cuối](../tmp/nuclear-voice/media-signal-report.json), [log cập nhật video cục bộ](../tmp/nuclear-voice/publish.log).
- Chrome hệ thống trên production cục bộ **3476 đạt đủ 20 ca** cho năm bài, hai bề mặt (trang công khai và xem trước giáo viên), ở 390 và 1366 px. Đã phát với tín hiệu âm thanh giải mã, tạm dừng, đổi âm lượng, bật/tắt tiếng, tua giữa/gần cuối rồi tiếp tục, tải đủ phụ đề và xác nhận không tự phát hoặc tải video trước khi mở. Yêu cầu Range nhận 206 với đủ 1.000 byte và `max-age=0`. Không ghi nhận POST, PUT, PATCH hoặc DELETE sau đăng nhập giáo viên trong lượt xem trước. [Báo cáo trình duyệt](../tmp/nuclear-voice/browser/report.json), [log đủ 20 ca](../tmp/nuclear-voice/browser-audio-release.log), [kiểm chứng video có lời](NARRATED_VIDEO_VERIFICATION.md).

### Giới hạn và thông tin cần giữ

Nguồn SGK là **bản mẫu tháng 01/2024** đã có trong workspace. Chưa đối chiếu bản thương mại. Các giả thiết định lượng của tán xạ, tọa độ phân hạch, chu kì minh họa, mức thanh và đồng hồ trình bày đều được ghi tại học liệu. Hai lượt B21 không cho tần suất thí nghiệm lá vàng. B23 tách số hạt của một mẫu với kì vọng. B24 dùng chỉ số tương đối theo thế hệ. B25 giữ riêng số liệu nguồn, giá trị thử và nội suy. [Nguồn và giá trị đối chiếu](PHYSICS_PROCESS_VERIFICATION.md).

**Chưa có lượt nghe trực tiếp bằng tai trong phiên làm việc này.** Đã dùng ASR, kiểm tra phiên âm, thử thuật ngữ A/B và phân tích tín hiệu. Các phép đó xác nhận những thuộc tính đã đo, còn độ tự nhiên của toàn bộ lời đọc vẫn cần được nghe trực tiếp. Đã sửa cách viết thuật ngữ làm TTS chèn âm tiết thừa và tạo lại các câu liên quan trước bản xuất cuối. [Phương pháp, lỗi đã sửa và giới hạn](../scripts/nuclear-videos/voice/QUALITY.md).

Chưa kiểm tra điện thoại vật lí hoặc môi trường triển khai từ xa. Khi chuyển máy, lưu bộ model/WAV trung gian hoặc tái tạo theo bản ghim. Website cần MP4/JPG/VTT và bộ dữ liệu kho câu hỏi theo mục 7. Chặng này không đổi schema, chạy migration, reset dữ liệu, tự push hoặc triển khai công khai. Những bước và bài nộp cũ tiếp tục theo cơ chế phân quyền hiện có.

Đã kiểm tra 60 manifest truy vết của build cuối: không có bộ render, WAV trung gian hoặc mô hình TTS trong gói server. [Kết quả tách runtime](../tmp/nuclear-process/render-runtime-separation.json). Bộ kiểm tra 15 pha ở mục 9 không chạy lại toàn bộ trong chặng này; đã kiểm tra các mô phỏng, điều kiện hoàn thành liên quan và tính chỉ đọc của xem trước.

**BÀN GIAO CHO CHATGPT**

Đọc mục 10, [kiểm chứng quá trình](PHYSICS_PROCESS_VERIFICATION.md), [bảng đối chiếu](SGK_RESEARCH_WEB_MATRIX.md), [kiểm chứng video](NARRATED_VIDEO_VERIFICATION.md) và [chất lượng lời đọc](../scripts/nuclear-videos/voice/QUALITY.md). Mở bản production cục bộ cổng 3476 bằng năm liên kết trong bảng. Giữ các kernel, nguồn SGK, seed và dữ liệu Bảng 25.1 dùng chung cho web/video. Khi sửa lời đọc, đo lại WAV, dựng từ manifest mới, kiểm tra khung giải mã và tín hiệu MP4 rồi mới thay cả bộ tệp bằng `publish-narrated.mjs`. Dùng ảnh khung và SHA của đúng bản xuất. Việc nghe trực tiếp, đối chiếu ấn bản thương mại và xác nhận hồ sơ nghiên cứu vẫn cần ghi rõ trạng thái thực tế.
