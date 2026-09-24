CURRENT BRANCH: rescue/weekend-final
CURRENT COMMIT: 52e5904 (plus Milestone 1 changes)

COMPLETED
- Tạo snapshot an toàn của toàn bộ trạng thái hệ thống.
- [Bug A] Fix lỗi RLS khi truy vấn video_checkpoints trong `src/app/student/lessons/[lessonId]/before-class/page.tsx`. Đổi sang view `student_video_checkpoints` và map chính xác cấu trúc dữ liệu cho `VideoCheckpointPlayer`.
- [Bug B] Fix lỗi `lessonId` bị gán nhầm thành `class_id` trong `getPublishedStudentMaterial` tại `src/app/student/actions.ts`.
- [Bug C] Cải thiện data safety cho `updateVideoMaterialAction` tại `src/app/teacher/actions.ts`: áp dụng update an toàn (upsert), không DROP cascade nhằm bảo vệ lịch sử trả lời của học sinh.
- [Bug D] Khắc phục lỗi 404 khi giáo viên bấm "Tải bài giảng lên" ở trang Before Class. Phục hồi component `VideoMaterialManager` và tích hợp ngay tại `src/app/teacher/lessons/[lessonId]/before-class/page.tsx`.

FILES CHANGED
- `src/app/student/lessons/[lessonId]/before-class/page.tsx`
- `src/app/student/actions.ts`
- `src/app/teacher/actions.ts`
- `src/app/teacher/lessons/[lessonId]/before-class/page.tsx`

TEST STATUS
TypeScript: PASS (npx tsc --noEmit: OK)
Lint: PASS (npm run lint: OK)
Build: PASS (npm run build: OK - compiled successfully in 4.3s)

KNOWN ISSUES
Các script test cục bộ đã pass hoàn toàn. Không có lỗi Known Issue nào trong phạm vi Milestone 1.

DO NOT CHANGE
- Branch name và base commit.
- Các strategy database/update (upsert) đã sửa.
- Supabase migrations chưa apply.

NEXT TASK
Mở localhost, thực hiện các thao tác Smoke Test qua UI và chuyển sang Milestone 2.
