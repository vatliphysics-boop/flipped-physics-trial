Vòng 0 — **CHƯA ĐẠT điều kiện review; UX/3D CHƯA KIỂM CHỨNG**.

Đã đọc toàn bộ ba tài liệu trích xuất, cùng [AGENTS.md](/Users/vodoandangkhoi/Documents/WEB_WORKING_24-09/AGENTS.md) và [TEAM.md](/Users/vodoandangkhoi/Documents/WEB_WORKING_24-09/docs/codex-team/TEAM.md). Không sửa workspace, không đọc nội dung auth/secrets/env, không tác động DB.

Không đủ bằng chứng để đưa ra 3–8 lỗi UX thực tế. Các mục sau là **trở ngại kiểm chứng**, không phải lỗi giao diện đã xác nhận.

| ID / severity | Trang / steps | Evidence | Source paragraph | Tác động dạy/học | Acceptance |
|---|---|---|---|---|---|
| W3-V0-01 / Blocker kiểm thử | `http://localhost:3001`; chạy HTTP HEAD tới địa chỉ được giao | `curl: (7) Failed to connect to localhost port 3001`. Chưa xác định do server hay giới hạn môi trường | Bài báo P67–68, P197–199 | Chưa đánh giá được truy cập kho và học liệu | Truy cập được bản chạy từ môi trường review; xác định phiên bản kiểm thử |
| W3-V0-02 / Blocker kiểm thử | Kho công khai, infographic, mô phỏng; tìm công cụ trình duyệt | Không có công cụ browser điều khiển; không tìm thấy executable Playwright/Chromium/Chrome hoặc package Playwright ở các vị trí đã kiểm tra | hd P7; bài báo P88–95, P109–110 | Chưa xác nhận xoay cảnh, tạm dừng, đặt lại, đọc nhãn và đối chiếu kết quả | Thao tác bằng browser thực ở desktop/mobile; lưu bằng chứng cho từng trường hợp |
| W3-V0-03 / Blocker luồng tài khoản | Trang giáo viên/học sinh; kiểm tra điều kiện tài khoản thử | Chưa được cung cấp tài khoản/dữ liệu thử xác định rõ; không đăng nhập hoặc ghi dữ liệu | Bài báo P75, P122, P128, P203–205; TEAM quy định dữ liệu thử | Chưa xác nhận phân biệt lưu cục bộ với giao/nộp cho giáo viên | Có tài khoản thử hai vai và môi trường thử được xác nhận; kiểm tra trọn luồng |

Đã xác nhận **đường dẫn file tồn tại**, chưa xác nhận route hoạt động:

- `src/app/hoc-lieu/page.tsx`
- `src/app/hoc-lieu/truc-quan/page.tsx`
- `src/components/physics/Simulation3D.tsx`
- `src/components/physics/FissionScene.tsx`
- `src/components/physics/GuidedFissionLab.tsx`

Ba file component cuối là danh sách ứng viên để trưởng nhóm xem xét giao việc UX/hiển thị sau khi có lỗi tái hiện. **Chưa đề nghị sửa cụ thể**, chưa đọc triển khai để thay bằng chứng thao tác; không đề xuất đổi mô hình khoa học.

Actual tests: đọc hướng dẫn; tra danh mục công cụ; kiểm tra sự hiện diện browser/package; liệt kê đường dẫn; một HTTP HEAD thất bại. **0 ca thao tác trình duyệt**. Chưa kiểm tra responsive, bàn phím, tương tác 3D, video, lưu/tải hoặc tài khoản. Các kết quả và ảnh trong bài báo là bằng chứng phiên trước, không phải kết quả lượt review này.