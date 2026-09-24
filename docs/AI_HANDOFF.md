CURRENT BRANCH: rescue/weekend-final
CURRENT COMMIT: b51eab1 (plus Milestone 2 and 3 changes)

COMPLETED
- [Milestone 2] Thống nhất Routing:
  - Teacher và Student sử dụng chung mô hình 3 pha: `/before-class`, `/in-class`, và `/after-class`.
  - Hợp nhất `simulation` vào `in-class` và `assessment` vào `after-class`. Đã xóa các route `simulation` và `assessment` thừa.
  - Cập nhật các liên kết (links) trong `LessonLearningCard`, `LessonNavigation`, và trang `student/assignments` để phản ánh route mới.
- [Milestone 3] Unified Application Shell:
  - Loại bỏ hoàn toàn `AppSidebar` khỏi hệ thống.
  - Áp dụng `StudentShell` cho tất cả các trang của học sinh (`/student`, `/student/curriculum`, `/student/curriculum/[chapterCode]`, `/student/classes`, `/student/journal`).
  - Đảm bảo `TeacherShell` và `StudentShell` hoạt động nhất quán, chia sẻ chung `PortalShell` bên dưới.

FILES CHANGED
- `src/app/teacher/lessons/[lessonId]/in-class/page.tsx` (ghi đè bằng nội dung từ simulation cũ)
- `src/app/teacher/lessons/[lessonId]/after-class/page.tsx` (ghi đè bằng nội dung từ assessment cũ)
- Tương tự cho `src/app/student/lessons/[lessonId]/after-class/page.tsx`
- Các thư mục bị xóa: `simulation/` và `assessment/` của cả teacher và student.
- `src/components/learning/LessonLearningCard.tsx`
- `src/components/learning/LessonNavigation.tsx`
- `src/app/student/assignments/page.tsx`
- `src/app/student/page.tsx`
- `src/app/student/curriculum/page.tsx`
- `src/app/student/curriculum/[chapterCode]/page.tsx`
- Đã xóa: `src/components/AppSidebar.tsx`

ROUTING DECISIONS
- Giữ lại 3 tên đường dẫn gốc: `/before-class` (Pha 1), `/in-class` (Pha 2), `/after-class` (Pha 3).
- Ngừng hỗ trợ các định dạng cũ như `simulation` hoặc `assessment` trên URL để đảm bảo 1 single source of truth.
- Component Navigation nhận trực tiếp các ID pha `in_class` và `after_class` thay vì alias cũ.

UI FOUNDATION DECISIONS
- Toàn bộ app sử dụng mô hình Layout có Navigation Side/Drawer (nhờ `PortalShell`), chia làm hai Role (`TeacherShell` và `StudentShell`).
- AppSidebar độc lập bị loại bỏ để tránh fragmentation giữa các layout component.

TEST STATUS
- TypeScript: PASS (npx tsc --noEmit: OK)
- Lint: PASS (npm run lint: OK)
- Build: PASS (npm run build: OK - compiled successfully in 3.2s)

KNOWN ISSUES
- Không có lỗi type, không lỗi compile. Cần chạy manual test (Smoke Test) giao diện thực tế.

NEXT TASK
- Mở trình duyệt, thực hiện luồng Teacher và Student Smoke Test để xác minh các component render chính xác trong Shell thống nhất, các Route link trơn tru.
