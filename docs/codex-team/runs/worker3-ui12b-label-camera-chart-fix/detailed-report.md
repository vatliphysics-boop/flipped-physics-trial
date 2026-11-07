# Worker 3 UI12b — nhãn, camera và đồ thị

Đã đọc toàn bộ ba bản trích xuất DOCX trong yêu cầu, AGENTS, TEAM và các hướng dẫn nghiệm thu/UI11/UI12. Đã đọc hướng dẫn Next `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md` trước sửa. Chỉ sửa Simulation3D.tsx, B22Activities.tsx và globals.css. Không thay công thức, dữ liệu, tên/kí hiệu khoa học, tọa độ hay quy tắc chuyển động. Không DOCX/auth/DB/env/secret/production/commit/reset/clean.

Trạng thái: đang kiểm tra tập trung; chưa đóng lỗi độc lập, CHƯA ĐẠT nghiệm thu tổng. Evidence tuyệt đối: `/private/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w3-5CukgI/evidence`. Script `focused.mjs` ở TMP cùng cấp; `after-hashes.json` ghi hash ba file, `actual-tests.json` ghi từng lượt và lỗi thật.

## UI-0200 — P2 / Medium

Trang: các cảnh dùng Simulation3D, trọng tâm B21 nuclear-builder/isotope-size, B23 geiger-decay, B24 reactor-control.
Steps: mở tài nguyên từ simulations.json ở desktop/mobile → bắt đầu → tạm dừng → đọc nhãn; đổi slider Home/End và mode.
Evidence BEFORE: UI11 durable `detailed-report.md`, ảnh builder/isotope/geiger/reactor trong `all-evidence` hoặc TMP UI11, là bằng chứng phiên trước. AFTER: ảnh `system-sim-…-1440/390-initial.png` và Home/End trong evidence phiên này; actual-tests ghi legend sau từng thao tác.
Source paragraph: hd P2/P6–7; NCKH P84/P95/P121; bài báo P49–50/P55–56/P88/P95/P197–199.
Tác động dạy/học: nhãn quá nhỏ làm khó nối tên/kí hiệu với vật thể.
Sửa: thay thanh chữ trong thế giới bằng marker số tròn 28px theo màn hình, không tương tác; chú giải cùng số 15px ngoài canvas lấy nguyên existing strings. Legend tạo lại khi tham số/mode đổi. Không tăng font texture đơn thuần.
Acceptance: đọc được nhãn thiết yếu ở 1440/390/360, liên hệ marker rõ, không che hiện tượng; giữ đơn vị và giới hạn; W2 kiểm độc lập. Chờ kết quả ca tập trung và ảnh.

## UI-0201 — P2 / Medium

Trang: B23 radiation-properties/radiation-safety.
Steps: mở/start mobile 360/390 → bốn preset → slider min/max → về toàn cảnh; so sánh 1440/1280/768.
Evidence BEFORE: UI11 ảnh cắt đầu thu/vị trí quan sát theo detailed-report. AFTER: `system-sim-radiation-properties/safety-W-Home/End-P.png` tại evidence; W là width, P=0 phối cảnh/1 trước/2 trên/3 cạnh.
Source paragraph: hd P7/P10; NCKH P121/P146; bài báo P55–56/P197–199/P213.
Tác động: cắt đích làm khó nhận ra quan hệ nguồn–chắn–đích.
Sửa: fit camera theo bounds apparatus và label anchors, loại gridhelper, dùng cả FOV ngang/dọc và aspect; padding 18%; cập nhật start/resize/tham số/preset, không fit mỗi frame. Nút Về toàn cảnh phục hồi sau zoom/drag; mở rộng camera far/maxDistance theo khung cảnh, giữ orbit.
Acceptance: đủ đối tượng/marker ở năm size, bốn preset, cực trị; không đổi world coordinates/physics. Chờ ảnh/W2 kiểm độc lập.

## UI-0202 — P2 / Medium

Trang: B22 binding-energy.
Steps: Tab qua chín nút điểm, Enter chọn Fe-56, Space chọn U-235 → xem trạng thái/tooltip/criteria; năm size.
Evidence BEFORE: UI11 chart-tests và ảnh binding-chart; AFTER: `chart-W-buttons.png` và actual-tests gồm Tab/activate/height/pressed/status/criteria.
Source paragraph: hd P6–7/P13; NCKH P96/P121; bài báo P52–53/P197–199/P213; US01.
Tác động: bàn phím không chọn được điểm bắt buộc, điểm chạm quá nhỏ.
Sửa: chín button ngoài SVG cùng handler/state, >=44px, aria-pressed và focus rõ; tên Fe-56/U-235/He-4 dùng tên đã có, các điểm khác chỉ A; giá trị từ getEnergy hiện có. Chữ ngoài SVG nêu trục/đơn vị và giá trị; selected point hiện trên đồ thị. Giữ geometry/data/formula.
Acceptance: Tab/Enter/Space chọn và cập nhật đúng cùng criteria, chữ đọc ở mobile, không tràn ngang; chờ W2 kiểm độc lập.

## Actual tests và giới hạn

Lint hai file TSX đã chạy, exit 0. Browser Chrome headless thật qua Playwright bundled đang chạy focused checks và smoke 17 tài nguyên; chưa coi script tồn tại là bằng chứng ca đã đạt. Sẽ cập nhật kết quả thực tế cuối. Không dùng 61 tests cũ làm kết quả phiên này. Không tài khoản thử/môi trường DB: giao–nộp và quyền tài khoản CHƯA KIỂM CHỨNG. Không người học thật/touch vật lý/screen reader/hiệu quả giáo dục. Root có thay đổi độc lập ngoài job, không quy chúng cho Worker3.
