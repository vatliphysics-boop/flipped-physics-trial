# PHASE 2 IMPLEMENTATION LOG

- Ngày bắt đầu: 23/09/2026
- Pass hiện tại: Pass 2 — science map và shared architecture
- Baseline trước thay đổi: `npx tsc --noEmit`, `npm run lint`, `npm run build` đều PASS.
- Workspace có nhiều thay đổi chưa commit từ trước; chỉ chỉnh các file cần cho Phase 2.
- Hiện trạng: chỉ có B21Activities.tsx/shared.tsx; chưa có catalog hoặc FixedPhysicsActivityRenderer.
- PDF SGK có trong workspace nhưng không có `pdftotext`/`pdfinfo`; dùng specification được cung cấp làm science map, không suy diễn dữ kiện mới.
- Đã xác nhận có `saveActivityProgressAction` dùng `lesson_material_progress.response` qua server-side auth.
- Đang làm: catalog, renderer, shared physics helpers, route integration.
- Pending: B21→B25 labs, teacher publication controls, responsive/accessibility/scientific/performance QA.

## Pass 3 — catalog routing scaffold (23/09/2026)
- `FixedPhysicsActivityRenderer.tsx` hiện có catalog canonical cho B21–B25 và chỉ dispatch B21 tới ba hoạt động đã tồn tại (`RutherfordActivity`, `NuclearBuilderActivity`, `IsotopeActivity`).
- B22–B25 hiện hiển thị fallback có tiêu đề theo đúng activity key; chưa phải mô phỏng tương tác hoàn chỉnh.
- Student và teacher simulation routes đã dùng `curriculum.code` để render đúng catalog bài học, không còn hard-code chỉ B21 hoặc thay nội dung từ bài khác.
- Validation: đọc lại ba file sau chỉnh sửa; `npm run lint` không báo lỗi; `git diff --check` PASS; `npx tsc --noEmit` không trả về diagnostic trong lần chạy xác nhận cuối.
- Chưa hoàn tất: B22–B25 interactive implementations, material ID/evidence persistence wiring, published-material filtering, teacher publication/order controls, browser/RLS E2E, build và responsive/accessibility QA.

