# Supabase foundation — bước tiếp theo

Các file nền đã được chuẩn bị nhưng chưa cần credential thật để build UI.

Khi tạo Supabase project:
1. Lấy Project URL.
2. Lấy public anon/publishable key phù hợp với project.
3. Tạo `.env.local` từ `.env.example`.
4. Dán hai giá trị vào `.env.local`.
5. Chạy migration SQL trong `supabase/migrations/20260920_001_initial_schema.sql`.
6. Sau đó mới nối form đăng ký/đăng nhập vào Supabase Auth.
