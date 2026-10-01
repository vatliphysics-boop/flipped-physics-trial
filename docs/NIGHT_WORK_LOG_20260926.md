# Nhật kí làm việc đêm 26/09/2026 — Phiên bảo mật & B21

## Thời gian: 23:34 – 23:46 ICT ngày 26/09/2026

---

## 1. Kiểm tra dự án

- **Thư mục:** `/Users/vodoandangkhoi/Documents/WEB_WORKING_24-09` ✅
- **Nhánh:** `rescue/weekend-final` ✅
- **Không dùng:** git reset --hard, db push, supabase reset ✅

---

## 2. Kết quả rà soát bản vá P0 — Lỗi xác nhận từ mã

### ✅ Đã sửa trong phiên này

| # | Vấn đề | File / Migration | Trạng thái |
|---|--------|------------------|------------|
| A | `video_checkpoints` base table vẫn đọc được qua policy `video_checkpoints_student_select_published` (008) — lộ `correct_option` | `017_secure_phase_gates.sql` | **SỬA: DROP POLICY** |
| B | `lesson_material_progress` INSERT/UPDATE từ 012 cho phép học sinh ghi `is_complete=true` cho **cả video** | `017_secure_phase_gates.sql` | **SỬA: DROP & tạo lại policy chỉ cho `material_type != 'video'`** |
| C | `phase_final_questions` policy `student_read_final_questions` (015): `using (true)` — học sinh toàn hệ thống đọc được | `017_secure_phase_gates.sql` | **SỬA: DROP POLICY** |
| D | `phase_assessment_questions` policy `student_read_assessment` (015): lộ `correctAnswer` | `017_secure_phase_gates.sql` | **SỬA: DROP POLICY** |
| E | `student_phase_progress` / `student_lesson_progress`: `student_manage_*` ALL cho học sinh tự ghi `is_completed=true` | `017_secure_phase_gates.sql` | **SỬA: DROP POLICY** |
| F | RPC `submit_phase_final_questions`: thiếu kiểm tra rỗng, thiếu REVOKE trước GRANT | `017_secure_phase_gates.sql` | **SỬA** |
| G | RPC `submit_phase_assessment`: fake ID check dùng EXISTS không có loop, thiếu kiểm tra blank answer, thiếu REVOKE | `017_secure_phase_gates.sql` | **SỬA** |
| H | `seedB21Catalog`: không có idempotency guard → bấm "Thiết lập" 2 lần tạo content trùng | `catalog-b21.ts` | **SỬA** |
| I | `setupLessonAction`: so sánh `"Bài 21. Cấu trúc hạt nhân"` nhưng `lessonTitle` thực tế là `"Cấu trúc hạt nhân"` | `teacher/actions.ts` | **SỬA** |

### 🟡 CHƯA KIỂM CHỨNG RUNTIME (cần kiểm tra sau khi push migration)

- Học sinh thực sự không đọc được `correct_option` trên DB sau khi DROP policy
- RPC từ chối nộp bài khi pha trước chưa xong
- RPC từ chối submission với ID giả
- Colab vẫn tự ghi progress qua saveActivityProgressAction (cần test thực)

---

## 3. Học liệu B21 đã tạo — Nội dung

### Tệp: `src/lib/catalog-b21.ts`

**Kích hoạt:** Tự động chạy khi giáo viên bấm "Thiết lập bài học" ở Bài 21.

#### Phase 1 — Trước giờ học
- **Video placeholder** (`material_type: 'video'`, `is_published: false`):
  - Kịch bản 12 phút chi tiết (00:00–12:00 theo từng đoạn)
  - 2 video checkpoints đã soạn sẵn (sẽ hoạt động khi GV tải video thật)
  - ⚠️ CHƯA CÓ VIDEO THẬT
- **Phiếu hướng dẫn tự học** (`material_type: 'worksheet'`, published):
  - Mục tiêu học tập rõ ràng (checkbox)
  - 5 câu điền chỗ trống
  - 3 câu tự kiểm tra CÓ phản hồi (đáp án ẩn trong text, không qua API)
  - Ô ghi câu hỏi còn thắc mắc
- **2 câu hỏi chốt pha**: `N = 143` (U-235) và `A = Z + N`

#### Phase 2 — Trong giờ học
- **Phiếu thực hành** (worksheet, published):
  - Hướng dẫn từng bước mô phỏng
  - Bảng ghi 5 hạt nhân (Helium-4 → Uranium-235)
  - Bảng so sánh 3 đồng vị Carbon
  - 3 câu thảo luận nhóm (lực hạt nhân, niên đại Carbon-14)
- **2 câu hỏi chốt pha**: đồng vị cùng Proton, N của U-235

#### Phase 3 — Sau giờ học
- **Phiếu bài tập** (worksheet, published):
  - Ghi rõ: "Chức năng tải PDF chưa khả dụng" — in bằng Ctrl+P
  - 4 bài tự luận theo 4 cấp độ
- **4 câu hỏi trắc nghiệm đánh giá** (is_published: true, correctAnswer chỉ trong DB):
  - Nhận biết: cấu tạo hạt nhân
  - Thông hiểu: ^27_13 Al
  - Vận dụng: đồng vị C-12 và C-14
  - Vận dụng cao: X có Z=15, A=31 → Phốt pho

**Kiểm tra vật lí:** ✅ Z, N, A đúng. ✅ Đồng vị cùng Z. ✅ N(U-235) = 143. ✅ Al-27: Z=13, N=14.

---

## 4. Tệp đã sửa

```
git status --short:
 M src/app/student/actions.ts
 M src/app/student/lessons/[lessonId]/after-class/page.tsx
 M src/app/student/lessons/[lessonId]/before-class/page.tsx
 M src/app/student/lessons/[lessonId]/in-class/page.tsx
 M src/app/teacher/actions.ts
 M src/components/learning/StudentInClassProgression.tsx
?? src/lib/catalog-b21.ts                          (mới, chưa tracked)
?? supabase/migrations/20260927_017_secure_phase_gates.sql  (mới, chưa tracked)
```

---

## 5. Kết quả kiểm tra lệnh

| Lệnh | Kết quả |
|------|---------|
| `npx tsc --noEmit` | ✅ PASS (0 errors) |
| `npm run lint` | ✅ PASS (1 warning không liên quan) |
| `npm run build` | ✅ PASS (20 pages, Turbopack) |
| Browser UI test | ⬜ CHƯA THỰC HIỆN |
| DB runtime test | ⬜ CHƯA THỰC HIỆN — CHƯA KIỂM CHỨNG RUNTIME |

---

## 6. Việc cần làm sáng mai (tối đa 5 bước)

1. **Áp migration 017:** Copy nội dung `supabase/migrations/20260927_017_secure_phase_gates.sql` vào SQL Editor trên Supabase Dashboard → Run. Kiểm tra: không có lỗi trong output.

2. **Thiết lập bài B21:** Bật `npm run dev`, đăng nhập Giáo viên → Chương trình → Bài 21 → "Thiết lập bài học". Vào bài học vừa tạo, xác nhận thấy 1 video placeholder + 1 phiếu tự học (Phase 1), 1 phiếu thực hành (Phase 2), 1 phiếu bài tập + 4 câu hỏi (Phase 3).

3. **Kiểm tra bảo mật (runtime):** Dùng trình duyệt ẩn danh với tài khoản học sinh. Vào Network Tab:
   - Thử `supabase.from('phase_final_questions').select('*')` → phải bị từ chối (no rows / permission denied)
   - Thử `supabase.from('video_checkpoints').select('correct_option')` → phải bị từ chối
   - Bấm nộp câu hỏi chốt khi pha 1 chưa xong → phải thấy thông báo lỗi "Em cần hoàn thành..."

4. **Tải video thật cho B21:** Quay/ghi màn hình theo kịch bản 12 phút đã soạn → upload lên bucket `lesson-videos` → cập nhật URL trong học liệu video placeholder → bật `is_published: true`.

5. **Commit khi xác nhận:** `git add supabase/migrations/20260927_017_secure_phase_gates.sql src/lib/catalog-b21.ts src/app/teacher/actions.ts src/app/student/ src/components/learning/StudentInClassProgression.tsx && git commit -m "feat(b21+security): phase gates hardened, B21 catalog seeded"`

---

## Ghi chú về `schedule`
Không có lịch `schedule` nào được tạo trong phiên này. Không có công việc tự chạy xuyên đêm.
