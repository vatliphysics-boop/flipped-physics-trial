# Học liệu số Vật lí 12 — Lớp học đảo ngược

Ứng dụng học liệu số hỗ trợ dạy và học Vật lí 12 theo mô hình lớp học đảo ngược. Chương trình chính thức B01–B25 là cố định; giáo viên tổ chức lớp và xuất bản học liệu, còn học sinh học theo ba pha trước giờ học, trong giờ học và sau giờ học.

## Stack

- Next.js 16.3.5, React 19, TypeScript
- Supabase Auth, Postgres, RLS và Storage
- `@supabase/ssr` cho SSR và `proxy.ts`
- `tus-js-client` cho tải video trực tiếp, phù hợp tệp lớn

## Chạy cục bộ

```bash
npm install
```

Tạo `.env.local` với **tên biến** sau:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Áp dụng migration theo thứ tự trong `supabase/migrations/`, sau đó chạy:

```bash
npm run dev
```

## Route chính

- `/login`, `/register`, `/auth/confirm` — xác thực
- `/student` — tổng quan học sinh
- `/student/curriculum`, `/student/curriculum/[chapterCode]` — chương trình học
- `/student/lessons/[lessonId]` — học liệu, video/checkpoint và tiến độ
- `/teacher` — tổng quan giáo viên
- `/teacher/classes`, `/teacher/classes/[classId]` — quản lý lớp
- `/teacher/classes/[classId]/curriculum` — chương trình của lớp
- `/teacher/lessons/[lessonId]` — quản lý học liệu

## Ghi chú Supabase và video

Client SSR, Server Component và Server Action luôn chạy theo người dùng đăng nhập; RLS và kiểm tra vai trò là lớp bảo vệ chính. Không đưa service-role key hay bất kỳ secret nào vào biến `NEXT_PUBLIC_*`.

Video MP4, WebM và MOV được tải trực tiếp lên Supabase Storage bằng Tus; ứng dụng lưu tham chiếu Storage vào học liệu thay vì gửi tệp dung lượng lớn qua Server Action.

## Validation

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Triển khai

Thiết lập hai biến môi trường Supabase nêu trên trong môi trường triển khai, áp dụng migration trước khi deploy, và không commit `.env.local` hoặc secret.
