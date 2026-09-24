# Handoff

## Thay đổi chính

- Migration mới: `supabase/migrations/20260923_013_secure_video_learning.sql`.
- Student video/checkpoint actions: `src/app/student/actions.ts`.
- Private signed video helper: `src/lib/video-source.ts`.
- Server input validation: `src/lib/video-validation.ts`.
- Player và layout student lesson: `src/app/student/VideoCheckpointPlayer.tsx`, `src/app/student/lessons/[lessonId]/page.tsx`.

## Biến môi trường

Chỉ dùng tên biến đã có trong `.env.example`/`PROJECT_CONTEXT.md`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Không đưa service-role key vào client hoặc repo.

## Thứ tự migration / rollback

1. Backup DB staging trước.
2. Áp dụng toàn bộ migration lịch sử theo thứ tự hiện có.
3. Áp dụng `20260923_013_secure_video_learning.sql` sau `20260921_012_learning_evidence.sql`.
4. Test bằng user teacher/student thực. Nếu rollback trước khi có dữ liệu attempt mới, revoke EXECUTE RPC và drop view/table/function/policies do migration 013 tạo; không reset/drop các bảng lịch sử.

## Chủ dự án cần làm

- Cung cấp môi trường Supabase local/staging chỉ có dữ liệu thử để chạy migration/RLS integration.
- Cung cấp/copy đúng `huong-dan.docx` và `thuyet-minh.pdf`, hoặc công cụ OCR/render SGK scan để đối chiếu B22–B25.
- Quyết định chính sách retention/version cho checkpoint đã có attempt trước khi sửa teacher editor.

## Không làm

Không deploy production, không push remote, không commit secret, không export dữ liệu học sinh.
