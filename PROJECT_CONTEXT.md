# Học liệu số Vật lí 12 — Lớp học đảo ngược

Ứng dụng học liệu số hỗ trợ dạy và học Vật lí 12 theo mô hình lớp học đảo ngược. Hệ thống giữ chương trình cố định B01–B25, cho phép giáo viên tổ chức lớp, xuất bản học liệu và theo dõi bằng chứng học tập; học sinh học theo ba pha trước giờ học, trong giờ học và sau giờ học.

## Công nghệ

- Next.js 16.3.5, React 19, TypeScript
- Supabase Auth, Postgres, RLS và Storage
- `@supabase/ssr` cho client SSR/proxy
- `tus-js-client` cho tải video trực tiếp, an toàn với tệp lớn

## Chạy cục bộ

1. Cài dependencies: `npm install`
2. Tạo `.env.local` với các tên biến:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   ```
3. Áp dụng các migration Supabase theo thứ tự trong `supabase/migrations/`.
4. Chạy môi trường phát triển: `npm run dev`

Không đặt service-role key hoặc secret vào biến `NEXT_PUBLIC_*`.

## Route chính

- `/login`, `/register`, `/auth/confirm` — xác thực
- `/student` — tổng quan học sinh
- `/student/curriculum` và `/student/curriculum/[chapterCode]` — chương trình học
- `/student/lessons/[lessonId]` — bài học và tiến độ video/checkpoint
- `/teacher` — tổng quan giáo viên
- `/teacher/classes`, `/teacher/classes/[classId]` — quản lý lớp
- `/teacher/classes/[classId]/curriculum` — chương trình của lớp
- `/teacher/lessons/[lessonId]` — quản lý học liệu bài học

## Kiến trúc Supabase

Các Server Action và Server Component dùng Supabase SSR theo người dùng đăng nhập; quyền vai trò giáo viên/học sinh và RLS là lớp bảo vệ chính. Video được tải trực tiếp lên Supabase Storage từ trình duyệt bằng Tus, sau đó chỉ lưu tham chiếu Storage trong học liệu; không đưa video dung lượng lớn qua Server Action body.

## Kiểm tra

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Triển khai

Thiết lập hai biến môi trường công khai của Supabase ở môi trường triển khai, áp dụng migration trước khi triển khai ứng dụng, và không commit `.env.local` hoặc bất kỳ secret nào.
