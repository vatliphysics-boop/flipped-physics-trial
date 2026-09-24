# Báo cáo kiểm thử

Ngày: 23/09/2026

## Đã chạy

- `npx tsc --noEmit`: PASS.
- `npm run lint`: PASS.
- `git diff --check`: PASS.
- `npm run build`: PASS. Next.js 16.3.5 biên dịch, kiểm tra TypeScript và sinh 14 route thành công.

## Kiểm tra tĩnh đã xác nhận

- Không còn `getPublicUrl`/`resolveVideoSource` trong luồng student video.
- Không còn `correct_option` hoặc `correctIndex` trong props/checkpoint mapping phía student.
- Luồng hiện tại vẫn còn `stages.map` và khóa pha mặc định trong `src/app/student/lessons/[lessonId]/page.tsx`; chưa đạt ca nghiệm thu “B21 không tự lặp ba lần” và “nhắc chuẩn bị không khóa hoạt động lớp”.
- `homework_response` rỗng được ghi là `''`, phù hợp `NOT NULL` migration.

## Chưa thể chạy (BLOCKED)

Không có URL/key Supabase DB thử, dữ liệu role mẫu hoặc browser test harness, vì vậy chưa thể khẳng định các ca: RLS cross-class, signed URL hết hạn trên Storage thật, RPC execution privileges, upload Tus, mất mạng, refresh client, hoặc flow teacher/student end-to-end. Migration `20260923_013_secure_video_learning.sql` cần được áp dụng và kiểm tra trên môi trường thử trước production.
