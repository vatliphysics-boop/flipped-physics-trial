# Trạng thái triển khai

_Cập nhật 23/09/2026 — Chặng 1 đang hoàn thành một phần, không phải nghiệm thu toàn bộ dự án._

## Đã thực hiện

- Tạo nhánh `refactor/flipped-physics-consistency`, bảo toàn working tree có sẵn.
- Thêm định nghĩa chung phase và service progress: `src/lib/learning-phases.ts`, `src/lib/learning-progress.ts`.
- Video Storage: thay suy luận public URL bằng signed URL sau khi trang/action kiểm tra membership; URL chỉ được tạo từ bucket/path (`storage:lesson-videos/...`).
- Checkpoint: props học sinh không còn `correct_option`/`correctIndex`; migration mới có view an toàn, attempt log và RPC server-side.
- Tiến độ: client chỉ gửi `materialId` + vị trí phát hữu hạn; server/RPC tính completion từ thời lượng và checkpoint đúng. Player phục hồi sau metadata, lưu định kỳ/pause/end, có retry URL và trạng thái lưu.
- Trang student lesson: **chưa hoàn tất** thay `stages.map`/khóa mặc định pha 2/3 trong source local; đây là việc ưu tiên kế tiếp. Không coi yêu cầu B21 chỉ mount pha 2 là đã nghiệm thu.
- Sửa nhật kí không ghi `null` vào `lesson_reflections.homework_response` vốn `NOT NULL`.
- Bổ sung `AUDIT`, `IMPLEMENTATION_PLAN`, `SGK_ACTIVITY_MATRIX`, `DATA_MODEL`.

## Lệnh đã chạy

| Lệnh | Kết quả |
|---|---|
| `npx tsc --noEmit` | PASS |
| `npm run lint` | PASS |
| `git diff --check` | PASS |
| `npm run build` | PASS; Next.js 16.3.5 build 14 routes |

## BLOCKED / chưa hoàn thành

- Không có Supabase local/staging credential: chưa chạy migration 013, RPC/RLS/Storage integration hay browser role flow.
- Chưa tìm thấy `docs/reference/huong-dan.docx` và `thuyet-minh.pdf`; SGK PDF là scan nhưng môi trường không có workflow render/OCR trang tin cậy.
- B21 simulation chưa được nối material/assignment ID và evidence bền vững; chưa coi là hoàn chỉnh end-to-end.
- Teacher editor vẫn ép/ghi đè checkpoint theo implementation cũ; homework upload/nộp/feedback private, dashboard/CSV, B22–B25 và trạng thái B01–B20 chưa hoàn tất.

## Bước tiếp theo

1. Áp dụng migration trên DB thử, kiểm tra SQL/RLS với teacher A/B và student trong/ngoài lớp.
2. Cập nhật teacher checkpoint editor để số mốc linh hoạt và version thay vì delete/reinsert.
3. Chuẩn hóa assignment/evidence B21, homework pha 3 và dashboard bằng progress service.
4. Render/OCR SGK, đối chiếu B22–B25 trước khi triển khai module.
