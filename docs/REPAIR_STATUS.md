# Repair status

Ngày cập nhật: 23/09/2026  
Nhánh: `refactor/flipped-physics-consistency`

## Mốc A — Kiểm kê và bảo toàn — hoàn tất

- [x] Đọc hướng dẫn dự án, package/lockfile, cấu hình, tài liệu trạng thái và route tree.
- [x] Kiểm tra Git; giữ nguyên thay đổi chưa commit của người dùng.
- [x] Không reset database, không xóa bucket, không ghi secret.
- [x] Xác minh giới hạn trang tham khảo: công cụ không quan sát được HTML giao diện hữu ích.
- [x] Tạo `docs/UI_REPAIR_AUDIT.md`.

## Mốc B — Token/layout nền tảng — đã thực hiện một phần

- [x] Bổ sung token CSS nền tảng cho nền, surface, chữ, chữ phụ, viền, màu chính, active và lỗi.
- [x] Sửa ref focus drawer mobile trong `PortalShell` để không dùng chung ref với nút desktop.
- [x] TypeScript, ESLint, build và diff check đều PASS.
- [ ] Chưa hoàn tất chuyển toàn bộ legacy `AppSidebar` sang `PortalShell`.
- [ ] Chưa có browser screenshot/DOM measurement ở các viewport yêu cầu.

## Mốc C — Route và sidebar — hoàn tất phần route

- [x] Có đủ menu portal teacher: `/teacher`, `/teacher/classes`, `/teacher/curriculum`, `/teacher/materials`, `/teacher/students`.
- [x] Có đủ menu portal student: `/student`, `/student/classes`, `/student/curriculum`, `/student/assignments`, `/student/journal`.
- [x] Mỗi bài có tổng quan và ba URL pha chuẩn ở cả hai vai trò.
- [x] Pha 2 dùng `/simulation`; Pha 3 dùng `/assessment`.
- [x] Route cũ teacher `/in-class` và `/after-class` redirect sang URL chuẩn.
- [x] Menu không còn anchor cho các mục bắt buộc có URL riêng.
- [ ] Bốn trang legacy vẫn import `AppSidebar`: student dashboard/curriculum/chapter và teacher class curriculum.


## Mốc D — Tổng quan teacher/student — hoàn tất mã nguồn

- [x] Thiết kế lại `/teacher`: tiêu đề vai trò, khối tiếp tục công việc có minh họa SVG trang trí, thống kê gọn từ dữ liệu thật, danh sách lớp dạng hàng, lối tắt đúng route và cấu trúc ba pha.
- [x] Thống kê giáo viên xác định rõ: lớp do giáo viên tạo; bài có `status = published`; “lượt tham gia lớp” là tổng bản ghi membership, không tuyên bố là học sinh duy nhất.
- [x] Đồng bộ `/student`: ưu tiên chọn/mở bài được phép truy cập, lối tắt lớp/chương trình/bài tập, giữ nguyên form tham gia lớp, danh sách lớp và nhật kí; không hiển thị tiến độ, điểm hay deadline không có dữ liệu.
- [x] Thêm CSS scoped `.overview-*` với grid `minmax(0, …)`, text wrapping, chiều cao tự nhiên và breakpoint cho tablet/mobile; không dùng `overflow` để che text.
- [x] `git diff --check`, `npx tsc --noEmit`, `npm run lint` và `npm run build` PASS ngày 23/09/2026.
- [ ] Chưa có browser screenshot hoặc kiểm chứng trực tiếp ở 360/390/768/1024/1440px và zoom 200% vì phiên làm việc không có browser/tài khoản role flow.

## Mốc E — Phần Lớp học — hoàn tất mã nguồn

- [x] Tách danh sách lớp `/teacher/classes` khỏi form tạo lớp; danh sách dùng hàng ngang responsive, tìm kiếm theo tên, trạng thái chưa có lớp, không có kết quả và lỗi tải.
- [x] Thêm route `/teacher/classes/new` với breadcrumb, form gọn, giới hạn độ dài client/server, trạng thái đang tạo và nút hủy.
- [x] Action tạo lớp vẫn dùng Supabase/RLS hiện có, không đổi schema; sau insert thành công trả `classId` thật và chuyển tới `/teacher/classes/[classId]?created=1`.
- [x] Chuẩn hóa trang chi tiết lớp: breadcrumb, sĩ số từ RPC hiện có, mã tham gia, sao chép mã, điều hướng chương trình/học liệu/học sinh và khu vực quản trị phụ.
- [x] Thêm CSS scoped cho phần Lớp học với `min-width: 0`, wrapping, grid co giãn và breakpoint mobile; không sửa token/layout Tổng quan.
- [x] Giữ các route Học liệu/Học sinh hiện có; liên kết từ chi tiết lớp truyền `classId` trong URL, chưa thay đổi truy vấn của hai trang toàn cục vì chúng chưa có contract lọc theo lớp.
- [x] `git diff --check`, `npx tsc --noEmit`, `npm run lint` và `npm run build` PASS ngày 23/09/2026.
- [ ] Chưa kiểm chứng browser thực tế, clipboard trên trình duyệt thật, dữ liệu Supabase/auth/RLS với tài khoản teacher/student và các viewport/zoom yêu cầu.


## Mốc D — Chương trình, bài và pha — đã thực hiện phần route/flow

- [x] Trang đích chương trình teacher, học liệu teacher, học sinh teacher và bài tập student dùng dữ liệu Supabase thật.
- [x] Pha 1 student chỉ truy vấn video đã xuất bản, kiểm tra membership qua `getStudentLesson`, tạo signed URL cho storage private và giữ checkpoint/progress hiện có.
- [x] Pha 2 không gắn mô phỏng của bài khác; bài chưa có mô phỏng hiển thị trạng thái trung thực.
- [x] Pha 3 teacher tái sử dụng `HomeworkManager`; pha 3 student chỉ hiển thị đề đã xuất bản, không tạo nút nộp giả.

## Kiểm tra đã chạy

- `npx tsc --noEmit`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS; Next.js 16.3.5 build nhận route portal và route pha.
- `git diff --check`: PASS.
- Static route/token/reference scan: PASS cho các URL và token đã kiểm tra.

## Giới hạn còn lại

- Chưa kiểm thử trực quan/browser ở 360, 390, 768, 1024, 1440px và zoom 200% vì phiên này không có browser automation/screenshot harness.
- Chưa kiểm chứng Supabase staging: upload/publish video, signed URL hết hạn, RLS khác lớp, checkpoint/progress thật và submit thật.
- Chưa đối chiếu đầy đủ 21–25 bài với SGK bằng dữ liệu staging/OCR.
- Chưa có luồng nộp bài học sinh đủ tin cậy trong source hiện tại nên không hiển thị trạng thái nộp giả.

## Bước tiếp theo cụ thể

1. Chạy browser QA với tài khoản teacher/student staging tại các viewport và zoom nêu trên.
2. Chuyển bốn trang còn dùng `AppSidebar` sang `StudentShell`/`TeacherShell`, sau đó xóa legacy CSS/component chỉ khi search không còn phụ thuộc.
3. Kiểm chứng RLS, upload/publish, signed URL, progress/checkpoint và submission trên staging.
4. Đối chiếu dữ liệu bài học thật với SGK và hoàn thiện các trạng thái tải/lỗi cụ thể theo backend.

