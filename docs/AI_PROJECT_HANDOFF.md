# AI PROJECT HANDOFF - VẬT LÍ 12 FLIPPED CLASSROOM

## 1. Kết quả kiểm tra Hệ thống (Migrations 017 & 018)

Đã thực hiện kiểm toán mã nguồn, cấu trúc CSDL và các API/RPC liên quan:

- **Migration 017 & 018**: Được thiết kế chặt chẽ và an toàn. Các bảng `lesson_pathway_steps`, `material_bank`, `student_step_progress` đã có policy RLS và constraints hợp lý.
- **Quyền đọc học liệu (RLS)**: Chính sách `material_bank_student_read` đã giới hạn chính xác học sinh chỉ được xem các học liệu (trừ system material) nếu nó thuộc một bước pathway `is_published` trong bài học `published` mà học sinh đang theo học. Storage bucket `lesson-materials` cũng được cấu hình lại RLS đúng đắn (loại bỏ lỗ hổng SVG và chấp nhận các pattern path mới).
- **Khóa pha (Phase Gates)**: RPCs `submit_phase_final_questions` và `submit_phase_assessment` kiểm tra đầy đủ các điều kiện (đã học xong pha trước, đã xem hết materials, simulation, pathway steps) trước khi ghi nhận hoàn thành.
- **Bảo vệ đáp án**: Hàm `get_student_assessment_questions` và `get_student_final_questions` sử dụng `security definer` và lọc cẩn thận (loại bỏ field `correctAnswer` và `isCorrect`) trước khi trả về phía Client. Học sinh không thể Inspect Network để xem đáp án đúng.

## 2. Các lỗi đã phát hiện và sửa chữa (Bằng chứng trong code)

### Lỗi 1: Giao diện nhập câu hỏi Đúng/Sai bị thiếu `statements`
- **Bằng chứng**: File `src/components/learning/QuestionBankManager.tsx` (dòng 270+) chỉ có state nhập `prompt` và `answer` cho mọi loại câu hỏi. Trong khi đó, Schema CSDL và `StudentPhase3Assessment.tsx` (dòng 103) kỳ vọng `content.statements` là một mảng cho loại câu `true_false`. Nếu giáo viên tạo câu Đúng/Sai, học sinh sẽ không thấy các phát biểu để chọn.
- **Cách sửa**: 
  - Đã thêm state `tfStatements` vào `QuestionBankManager.tsx`.
  - Thêm UI form để giáo viên nhập nhiều phát biểu, đồng thời chọn Đúng/Sai cho từng phát biểu.
  - Cập nhật hàm `handleSave` để lưu trường `statements`.

### Lỗi 2: Trích xuất PDF thiếu xử lý `statements` cho câu Đúng/Sai
- **Bằng chứng**: File `src/app/teacher/pdf-action.ts` (dòng 154) hàm `saveExtractedQuestions` khi lưu bản nháp PDF vào DB đã không tạo mảng `statements` nếu giáo viên chọn đổi sang loại `true_false`.
- **Cách sửa**: Bổ sung logic tự động chuyển các `options` (nếu có) thành `statements` mặc định khi lưu câu hỏi `true_false`.

## 3. Mâu thuẫn Routes Teacher / Student (Cần làm tiếp)

- **Sự bất đồng bộ tính năng**: Teacher Route (`src/app/teacher/lessons/[lessonId]/before-class/page.tsx`) đã được cập nhật để sử dụng thành phần mới của Migration 018 là `PathwayStepManager`. GIáo viên có thể tạo các `lesson_pathway_steps`.
- **Tác động**: Student Route (`src/app/student/lessons/[lessonId]/before-class/page.tsx`) vẫn dùng code cũ (`lesson_materials`), hoàn toàn không có UI `StudentPathwayStepViewer` để render các bước này.
- **Hệ quả (Nghiêm trọng)**: Do RPC `submit_phase_final_questions` có đoạn kiểm tra ép buộc học sinh phải hoàn thành tất cả `lesson_pathway_steps` bắt buộc (`is_required = true`), nếu giáo viên tạo một bước pathway mới, học sinh sẽ bị **KHÓA PHA VĨNH VIỄN** (vì không thấy UI bước học đó để ấn hoàn thành).

## 4. Các phần chưa kiểm chứng (Untested)
- **Trình duyệt / Tương tác UI thực**: Chưa thực hiện quy trình đăng nhập học sinh, click nút để test thử submit form qua trình duyệt thật. 
- **Database data**: Chưa chèn dữ liệu thật vào DB (Supabase) để kiểm tra performance của các truy vấn RPC. (Đã tuân thủ nguyên tắc không được đánh dấu PASS cho DB/Browser nếu chưa kiểm thử).

## 5. Việc cần làm tiếp theo (Next Steps)
1. **Phát triển Component StudentPathwayStepViewer**: Nhanh chóng xây dựng giao diện hiển thị các `lesson_pathway_steps` cho học sinh (giao diện liệt kê từng bước: tài liệu, bài tập, video) để học sinh có thể click hoàn thành và gọi RPC `complete_pathway_step`.
2. **Cập nhật lại Student Routes**: Thay thế đoạn map `videos` và `colabs` cũ bằng `StudentPathwayStepViewer` trong tất cả các pha (before, in, after class).
3. Triển khai testing thực tế trên môi trường Staging với dữ liệu mô phỏng.

*Quá trình Build (`npm run build`) sau khi sửa đổi hoàn toàn thành công, không phát sinh lỗi Typescript.*
