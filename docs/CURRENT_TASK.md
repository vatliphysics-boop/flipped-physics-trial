# Checkpoint hiện tại

Cập nhật: 2026-09-24

- Đợt: 01 — Định vị dự án, yêu cầu và dữ liệu
- Gói vừa chốt: 001-010, tương ứng B0001-B0100
- Trạng thái: DONE WITH BLOCKERS; chưa phải nghiệm thu toàn bộ website.
- Workspace: /Users/vodoandangkhoi/Documents/flipped-physics
- Branch: refactor/flipped-physics-consistency
- Server: PID 47572, next dev, cổng 3000, URL http://localhost:3000

## Kiểm tra đã chạy

- npm run lint — PASS
- npx tsc --noEmit — PASS
- / và /login — 200
- /teacher và /teacher/classes — 307 tới /login khi chưa xác thực
- /student — 200 khi chưa xác thực; cần audit guard trong Đợt 02.

## Blocker

- Chưa có browser automation.
- Chưa có tài khoản test/fixture và staging DB.
- Chưa chạy migration trên database thật.
- Assessment/Pha 3 chưa có schema/runtime đã xác nhận đầy đủ.

## Lệnh tiếp theo

Đọc auth/session, guard student, PortalShell, sidebar, callback Giao diện chính; rà migration 014 và action xóa; sau đó bắt đầu Đợt 02 Gói 011.
