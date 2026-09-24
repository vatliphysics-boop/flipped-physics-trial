# LMS rebuild status

_Cập nhật: 23 September 2026 (local workspace)._ 

## Chặng A — đang thực hiện

### Đã thực hiện
- Đọc `AGENTS.md`, `CLAUDE.md`, `PROJECT_CONTEXT.md`, `package.json`, route tree và tài liệu App Router của Next.js 16.3.5 trước khi sửa.
- Kiểm tra công khai trang tham chiếu được yêu cầu. Fetch không trả nội dung quan sát được, nên không có tuyên bố đã xem phần đăng nhập hoặc sao chép thương hiệu/trang của hệ thống đó.
- Tạo `/Users/vodoandangkhoi/Documents/flipped-physics/src/components/PortalShell.tsx`: một shell dùng chung cho giáo viên/học sinh với header 64px, sidebar 264px, layout grid `minmax(0, 1fr)`, menu desktop đóng thật và drawer mobile có Escape, backdrop, khóa cuộn body, aria-controls/aria-expanded và hoàn focus về nút mở. Trạng thái menu hiện chỉ giữ theo phiên hiện tại; chưa lưu vào localStorage để tránh layout hydration/cascading render.
- Chuyển `StudentShell` và `TeacherShell` sang shell mới; tên cổng là **Học liệu Vật lí 12**.
- Điều chỉnh nhãn ba pha tại `src/lib/learning-phases.ts` và route builder tại `src/components/learning/LessonNavigation.tsx` sang `before-class`, `simulation`, `assessment`.
- Chuyển màn hình pha 1 giáo viên sang trình bày hàng danh sách, với CTA “Tải bài giảng lên”, trạng thái nháp/xuất bản và liên kết edit riêng.
- Thay phần token/base style cũ bằng token LMS mới trong `src/app/globals.css`; các lớp legacy còn lại vẫn tồn tại để tránh phá các page chưa được chuyển.

### Chưa hoàn thành / không được coi là nghiệm thu
- Trang chương trình học sinh và chapter page đang bị thay đổi đồng thời trong workspace, nên chưa được thay thế an toàn bằng shell mới trong lượt này.
- Routes `/simulation`, `/assessment`, trang upload video riêng và redirects từ `/in-class`, `/after-class` chưa hoàn chỉnh.
- Navigation legacy vẫn còn trên các route chưa chuyển; chưa thể nói mọi menu có URL/active state đúng.
- Chưa kiểm tra migration/backfill B01–B20 hoặc schema database; chưa chạy migration nào.
- Không có browser, tài khoản thử hoặc Supabase test data được cung cấp: visual QA ở 390/768/1280/1440, drawer focus thật, signed URL, RLS, upload/publish, checkpoint/progress và nộp bài đều **CHƯA KIỂM CHỨNG**.

### File thay thế / compatibility
- Thay thế trình bày shell: `StudentShell.tsx`, `TeacherShell.tsx` -> `components/PortalShell.tsx`.
- `components/AppSidebar.tsx` giữ wrapper legacy tối thiểu cho route chưa chuyển; không xóa vì còn tham chiếu.
- Không xóa dữ liệu, migration, secrets, lớp, thành viên, lesson, material hoặc tiến độ. Không dùng reset/clean/drop database.

## Kiểm tra đã chạy
- `npx tsc --noEmit`: PASS trước khi loại bỏ cảnh báo import dư.
- `git diff --check`: PASS.
- `npm run lint`: chỉ báo hai warning import type dư trong `AppSidebar.tsx`; đã được sửa, cần chạy lại ở lượt kế tiếp.
