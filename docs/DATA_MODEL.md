# Mô hình dữ liệu tối thiểu

## Thực thể hiện có

- `curriculum_lessons`: danh mục chuẩn bằng `curriculum_code` B01–B25 và nguồn SGK.
- `lessons`: một bài triển khai theo `class_id`, `teacher_id`, không chia sẻ tiến độ giữa lớp.
- `lesson_materials`: học liệu/nhiệm vụ; `phase` phải là `before_class | in_class | after_class`; trạng thái xuất bản riêng với trạng thái học.
- `lesson_material_progress`: bằng chứng theo cặp `(material_id, student_id)`.
- `video_checkpoints` và `video_checkpoint_attempts`: định nghĩa câu hỏi và lượt trả lời; đáp án không được trả cho học sinh.
- `lesson_reflections`: nhật kí theo khóa ghép `(lesson_id, student_id)`; `homework_response` dùng chuỗi rỗng khi không có nội dung.

## Migration 20260923_013

- Tạo view `student_video_checkpoints` không có `correct_option`.
- Tạo `video_checkpoint_attempts` và RPC `submit_video_checkpoint`, `record_video_progress` có `auth.uid()`, membership/publication check và `search_path` cố định.
- Bỏ policy ghi trực tiếp progress của học sinh; RPC tự suy ra `is_complete` từ checkpoint đúng và tối thiểu 90% thời lượng.

## Nâng cấp dữ liệu cũ

Migration không DROP/reset. Progress cũ được giữ nguyên; lượt checkpoint lịch sử bắt đầu từ migration mới nên không được diễn giải ngược là bằng chứng đã chấm. Chạy trên DB thử sạch trước. Với DB có dữ liệu, backup trước khi áp dụng và kiểm tra policy/RPC bằng tài khoản teacher/student; không dùng `migration repair` trên production tự động.
