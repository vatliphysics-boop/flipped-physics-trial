# Giáo viên — kết quả UI R2

Bản production `http://127.0.0.1:3477`, buildId `ssNn6nqeiy1UBKL-Ml9VK`. Chrome hệ thống; QA riêng. Chỉ đọc dữ liệu trong lượt này.

- **100/100 trạng thái**: 19 tuyến × 4 viewport 320, 390, 768, 1366; 6 trạng thái bổ sung × 4 (3 tab công cụ, ma trận đề, soạn bước, xem trước thật). 76 phản hồi tuyến HTTP 200, không pageerror, không document overflow.
- **8 trạng thái biểu mẫu**: thêm học liệu và mở mẫu kế hoạch B21, cả 4 viewport. Không ghi database; nút lưu của hộp thêm học liệu nằm trong viewport.
- **8 kiểm tra bổ sung**: hàng học liệu thực tế nhìn đủ tên/nút ở cả 4 viewport; liên kết “Soạn kế hoạch” mở đúng `/teacher/plans?material=…`.
- Font đo thật Be Vietnam Pro; chữ chính `rgb(23,50,68)`, primary `rgb(17,107,112)`, nút radius 9 px.
- Lỗi tràn lớp 390 px đã hết (`scrollWidth` trước 583 → sau 390). Hàng học liệu không còn ép/cắt tên và che tác vụ.
- Kho công khai chưa đăng nhập: public agent xác nhận vẫn yêu cầu quyền giáo viên, hết spinner vĩnh viễn và thống kê 0 giả. Không thay guard hoặc dữ liệu sách.
- Lỗi chung còn lại **ở chính R2**: launcher chat 56 × 56 cắt chữ; root đã xếp sửa R3. Một lỗi nhỏ khác: thanh ba pha ở 320 px chỉ nhìn thấy một phần nhãn pha 3 vì dùng cuộn ngang; R3 chuyển riêng giáo viên sang ba cột nhãn tự xuống dòng. Hai chỉnh nhỏ thuộc teacher được đưa vào R3: nhãn “Ma trận và xuất Word”/“Tải lên ma trận” và selector nhãn mã lớp chỉ áp dụng first-child.

## Bằng chứng

- `inventory.json`: 100 dòng trạng thái, HTTP, heading, style và số đo overflow.
- `forms.json`: 8 biểu mẫu, vị trí nút lưu.
- `details.json`: 8 phép đo hàng học liệu/liên kết kế hoạch.
- Ảnh: `docs/previews/ui-consistency/after/teacher-*.png` (112 ảnh R2).
- Baseline: `tmp/ui-audit/teacher/AUDIT.md`, `inventory.json`, `forms-before.json` và 54 ảnh trước.

## Đang chờ

- Bản R3: kiểm tra lại launcher, nhãn ma trận, mã lớp và ba nhãn pha ở 320/390 px.
- Luồng lưu nháp → chèn công thức → reload → xem trước video thật không ghi tiến độ → giao HS1 → khôi phục đúng QA step; script đã chuẩn bị `tmp/ui-audit/teacher/flow.mjs`. Chờ snapshot học sinh kết thúc trước khi có ghi QA.
