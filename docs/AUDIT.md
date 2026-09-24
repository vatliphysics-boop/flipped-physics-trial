# Audit kỹ thuật — 23/09/2026

## Phạm vi đã kiểm tra

- Next.js 16.3.5 / React 19 / TypeScript / Supabase SSR; đã đọc quy tắc repo và hướng dẫn Server Actions/Data Security đúng bản cài cục bộ.
- Toàn bộ migration `supabase/migrations/`; working tree có thay đổi chưa commit và đã được bảo toàn trên nhánh `refactor/flipped-physics-consistency`.
- Luồng student lesson, video/checkpoint/progress, evidence, reflection, giáo viên video và B21.

## Lỗi xác nhận được

1. Player nhận `correctIndex`, `isComplete` và checkpoint đã trả lời từ client; action tiến độ tin các giá trị đó.
2. `getPublishedStudentMaterial()` trả `lesson.class_id` dưới khóa `lessonId`.
3. Video private đang được suy ra bằng `getPublicUrl`.
4. Đáp án checkpoint được gửi trong props học sinh; chỉ ẩn UI không phải kiểm soát truy cập dữ liệu.
5. Trang lesson lặp cùng học liệu/B21 trong `stages.map`.
6. B21 activities chưa gắn material/assignment ID, không lưu evidence thật.
7. `lesson_reflections.homework_response` là `NOT NULL` nhưng action ghi `null` khi trống.
8. Teacher video manager ép hai checkpoint và update xóa/tạo lại checkpoint, phá ID/lịch sử.
9. Dashboard phụ thuộc `is_complete` do client báo, chưa có service progress dùng chung.

## Giới hạn cần kiểm chứng

- Chỉ có PDF SGK scan ở root; `docs/reference/huong-dan.docx` và `thuyet-minh.pdf` không có trong working tree.
- Công cụ render từng trang PDF/OCR chưa khả dụng trong môi trường hiện tại. Ma trận SGK chỉ ghi các trang B21 do yêu cầu cung cấp, không suy đoán B22–B25.
- Không có credential DB thử: migration/RLS được kiểm tra tĩnh, cần chạy trên Supabase local/staging do chủ dự án cấu hình.
