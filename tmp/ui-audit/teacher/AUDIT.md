# Kiểm kê giao diện giáo viên — trước khi đồng bộ

Bản production cục bộ: `http://127.0.0.1:3476`. Đăng nhập tài khoản giáo viên QA; chỉ đọc dữ liệu. Chrome hệ thống. Hai viewport 1366 × 950 và 390 × 844. Ảnh thật được lưu trong `docs/previews/ui-consistency/before/teacher-*.png`.

## Phạm vi đã mở thật

| Nhóm | Tuyến / trạng thái | Desktop | Điện thoại |
|---|---|---|---|
| Tổng quan | `/teacher` (overview) | 200 | 200 |
| Danh sách lớp | `/teacher/classes` (classes) | 200 | 200 |
| Tạo lớp | `/teacher/classes/new` (class-new) | 200 | 200 |
| Quản trị lớp | `/teacher/classes/98bada8f-4191-409a-97d2-d486892dba39` (class-detail) | 200 | 200 |
| Tuyến cũ chuyển chương trình | `/teacher/curriculum?classId=98bada8f-4191-409a-97d2-d486892dba39` (class-curriculum-redirect) | 200 | 200 |
| Chương trình | `/teacher/curriculum` (curriculum) | 200 | 200 |
| Chương trình theo lớp | `/teacher/curriculum?classId=98bada8f-4191-409a-97d2-d486892dba39` (curriculum-selected) | 200 | 200 |
| Chương IV | `/teacher/curriculum/IV?classId=98bada8f-4191-409a-97d2-d486892dba39` (curriculum-chapter) | 200 | 200 |
| Năm bài | `/teacher/lessons?classId=98bada8f-4191-409a-97d2-d486892dba39` (lessons) | 200 | 200 |
| Tổng quan bài | `/teacher/lessons/69a09b43-e1e0-4643-99f5-efa28e3936bc` (lesson-overview) | 200 | 200 |
| Trước giờ học | `/teacher/lessons/69a09b43-e1e0-4643-99f5-efa28e3936bc/before-class` (lesson-before) | 200 | 200 |
| Trong giờ học | `/teacher/lessons/69a09b43-e1e0-4643-99f5-efa28e3936bc/in-class` (lesson-during) | 200 | 200 |
| Sau giờ học | `/teacher/lessons/69a09b43-e1e0-4643-99f5-efa28e3936bc/after-class` (lesson-after) | 200 | 200 |
| Minh chứng theo học sinh | `/teacher/lessons/91c1fb49-b33f-4f1d-93cd-9de855ce7938/ket-qua?phase=after_class` (lesson-results) | 200 | 200 |
| Kho học liệu | `/teacher/materials` (materials) | 200 | 200 |
| Đề kiểm tra trong kho | `/teacher/materials?type=assessment` (materials-assessment) | 200 | 200 |
| Bàn soạn kế hoạch | `/teacher/plans` (plans) | 200 | 200 |
| Ngân hàng đề và công cụ giáo viên | `/teacher/ai` (workroom) | 200 | 200 |
| Học sinh và kết quả | `/teacher/students` (students) | 200 | 200 |
| Phiếu học tập ba pha | `/teacher/ai` (workroom-worksheet) | UI | UI |
| Chuẩn bị giờ học | `/teacher/ai` (workroom-preparation) | UI | UI |
| Ngân hàng đề | `/teacher/ai` (workroom-bank) | UI | UI |
| Ma trận đề | `/teacher/ai` (workroom-matrix) | UI | UI |
| Soạn bước và công thức | `/teacher/lessons/69a09b43-e1e0-4643-99f5-efa28e3936bc/before-class` (lesson-editor) | UI | UI |
| Xem trước bước đã giao | `/teacher/lessons/69a09b43-e1e0-4643-99f5-efa28e3936bc/before-class` (lesson-preview) | UI | UI |

## Lỗi có bằng chứng và phạm vi sửa

1. `/teacher/classes` ở 390 px: document `scrollWidth=583`; hàng lớp dùng flex không co, mã tham gia và nút tràn khỏi màn hình. Ảnh `teacher-classes-390.png`. Đổi hàng sang grid co theo chiều rộng vùng chứa, xuống dòng mã/nút ở vùng hẹp.
2. `/teacher/materials` ở 390 px: document không tràn nhưng card `overflow:hidden` che tác vụ, tên học liệu chỉ còn cột khoảng 60 px, các badge bị bẻ thành nhiều dòng. Ảnh `teacher-materials-390.png`. Chuyển tác vụ xuống dưới tên, cho nội dung co đúng, bỏ `overflow:hidden`, bỏ lớp đệm 24 px lồng vào portal.
3. Kho học liệu dùng thanh tab cuộn ngang, tìm kiếm bị ép hẹp. Chuyển loại học liệu thành nhóm bộ lọc có trạng thái nhấn và tự xuống dòng, nhãn tìm kiếm đầy đủ cho công nghệ hỗ trợ.
4. Kế hoạch dạy học có đệm bên trong trùng với portal; bỏ đệm này riêng vùng giáo viên. Breadcrumb và hàng bước học được cho co, xuống dòng rõ.
5. Trang công cụ công khai nhận 401 từ ngân hàng nhưng vẫn hiện “Đang tải…” và thống kê 0. Giữ nguyên quyền truy cập, tách lỗi kết thúc khỏi trạng thái đang tải ở ngân hàng và phiếu học tập.
6. Màu nền ngà, nút đen, góc 6 px và phân cấp tiêu đề cũ được gửi cho tác vụ token/shell chung; không sửa globals hay PortalShell trong nhóm giáo viên.

## Kết quả nền

- 19 tuyến cho mỗi viewport đều HTTP 200, không có `pageerror`.
- 6 trạng thái bổ sung/viewport: ba tab công cụ, ma trận đề, trình soạn bước và hộp xem trước thật.
- Trình soạn và xem trước ở 390 px hiện nội dung/cuộn nội bộ đúng, công thức KaTeX nhìn thấy; chưa thực hiện lưu/giao trong vòng chụp nền.
- Không tạo lớp, bài học, bài nộp, điểm hoặc thay đổi schema trong vòng chụp nền.
- Font thực tế đã là Be Vietnam Pro. Bộ token và các sửa cục bộ sẽ được chụp lại sau build thống nhất.
