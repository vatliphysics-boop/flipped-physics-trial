# Worker 2 — UI10 public teacher review

Trạng thái: **CHƯA ĐẠT nghiệm thu tổng; hoàn tất review mở rộng trong phạm vi ca dưới đây.** Có 1 vấn đề sư phạm mới UI-0100. Không phải hai lượt cuối trên cùng hash. AI đóng vai giáo viên theo chuẩn giả định tương đương 50 năm kinh nghiệm; không có người tham gia nghiên cứu thật.

Đã đọc toàn bộ hd, NCKH, bài báo được trích trong prompt; AGENTS, TEAM, acceptance, regulations, TEAM_HANDOFF, coverage MD/JSON và USER_GUIDE. Đọc lại AGENTS trên đĩa. Không sửa workspace, DOCX hoặc báo cáo chung; tất cả đầu ra ở thư mục tạm được giao. Không đọc env/secrets/auth config, đăng nhập/tạo user, nhập mật khẩu, ghi DB, migration, commit/reset/clean hoặc production. Không gọi AI sinh nội dung. Không dùng đọc mã thay bằng chứng UI.

## Phiên bản và bằng chứng

Web phát triển http://localhost:3001, browser MCP; viewport giả lập, không thiết bị thật. Thời gian bằng chứng khoảng 12:06–12:19 UTC ngày 05/10/2026. Baseline tham chiếu `8e5dd3508c6730a6673687ab52fb765f55c4f820381b0884c6d700ce043c92f8`. Live có thay đổi/HMR, không frozen. Hash tập con manifest (bỏ env/auth/supabase) lúc 12:14:43 UTC: `0d1a706b38db5e501a91641f11a30e219b16dfa4461db7376b46ba11bf85af9f`; chi tiết `evidence/live-version.json`. Khác baseline: globals.css, page.tsx, InteractiveInfographic.tsx, NuclearScienceIllustration.tsx. Hash trên đĩa này không xác lập hash tài nguyên browser tại từng ảnh; mọi ảnh gắn nhãn **live UI10/HMR, version chưa frozen**, không tuyên bố baseline đã đạt.

Đầu phiên MCP mở / và /hoc-lieu/ai-giao-vien bị ERR_CONNECTION_REFUSED; curl HEAD nhận 502. Sau đó demo và các trang mở được. Không quy lỗi kết nối thành lỗi code. Playwright bundled thiếu Chromium mặc định; Chrome headless trực tiếp bị SIGABRT trong sandbox. Chuyển sang MCP và thao tác thành công, không sửa môi trường/server.

Thư mục evidence tuyệt đối: `/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w2-srDDzd/evidence/`. Snapshot `page-*.yml` lưu tự động tại đây, chứa route/ref/state; không phải bằng chứng tài khoản thật.

## Coverage các ca thực tế

| Trang / vai | State và thao tác thật | Size thật | Kết quả / giới hạn |
|---|---|---|---|
| / — GV/HS mới | Mở, xem toàn trang; click Xem bài học minh họa | 1440×900,390×844 | Home ghi Bài 23 Hiện tượng phóng xạ; click ở 390 mở /demo-lesson đúng H1. UI-0002 đạt ca nhãn/đích đã xét, chưa đóng toàn tiêu chí |
| / — GV/HS mới | Tab đầu và header | 360×800; innerWidth=360,scrollWidth=360 | Focus tới brand, thấy viền; header/nút không tràn ngang ở ca này. Chưa duyệt hết thứ tự Tab |
| /demo-lesson — HS mới | Mở, xem toàn trang, đọc nhiệm vụ/giới hạn | 1440×900,390×844 | Chủ đề B23, có dự đoán–so sánh–giải thích và chỉ rõ số liệu mô hình; CHƯA KIỂM thao tác trọn ba pha/cards/progression trong lượt này |
| /login — GV/HS mới | Mở, click form trống; nhập email giả invalid-test rồi click | 1440×900 ảnh đầu;390×844 validation | Trống focus email, required; email thiếu @ bị chặn native. Không gửi valid data, không kiểm auth server |
| /register — GV/HS mới | Mở, click form trống | 1440×900 ảnh đầu;390×844 validation | Focus full_name, bốn trường required. Không nhập dữ liệu hợp lệ hoặc tạo user |
| /,/login,/register | Đối chiếu minh họa trước/sau | 1440×900,390×844 | Desktop thấy N=A−Z và A=Z+N; mobile login/register không hiện minh họa. UI-0003 đạt quan sát các trang đã xét; không suy mọi nơi dùng component |
| /hoc-lieu/lop-hoc-dao-nguoc — GV | Mở, click đủ bốn cách | 1440×900; ảnh đầu390×844 | demonstration→B25, discussion/group→B24, standard→B23; link có form tương ứng; hướng dẫn hai vai/ba pha/sản phẩm hiện |
| Cùng trang — GV | Đổi bài B21, click Soạn kế hoạch B21 | 1440×900 | Mở /hoc-lieu/soan-ke-hoach?template=B21&form=standard; thấy bàn soạn và 24 học liệu phạm vi B21. Chưa xác nhận chất lượng mẫu hoặc lưu/xuất |
| Bàn soạn công khai — GV | Mở menu, Escape | 390×844 | aria-expanded=false, focus về nút Mở menu |
| /hoc-lieu/ai-giao-vien — GV | Mở trang ban đầu | 1440×900,390×844 | Desktop ảnh ban đầu còn loading; mobile sau tải thấy 73 câu. Không coi loading là lỗi |
| Ngân hàng — GV | Click trắc nghiệm/đúng sai/trả lời ngắn/tự luận | 360×800 cho ba tab sau | Số đếm73/12/19/109; scrollWidth=360 trong ca đo. Không thẩm định mọi câu |
| Ngân hàng — GV | Tìm W2_NO_MATCH_20261005, xóa; mở Chỉnh sửa câu hỏi đầu | 768×1024 | 0 câu và thông báo trống rõ; xóa phục hồi73; editor có nội dung/phương án/đáp án/Bloom. Không lưu thay đổi |
| Phiếu — GV | B23 mặc định → chỉnh → mở thêm câu → thêm Becquerel trước giờ → preview | 390×844 bước1;768×1024 edit/add/preview | Từ3 thành4 câu; preview giữ ba pha/hướng dẫn/rubrics. Chỉ draft browser. Hướng dẫn cần GV chỉnh khi thêm câu; chưa tải Word hoặc kiểm phiếu trống/thiếu pha |
| Chuẩn bị giờ — GV | Mở tab → tiếp tục chỉnh hoạt động | 768×1024 | Hai vai/sản phẩm/tiêu chí;5+30+10=45 phút, tự học tách riêng. Chưa sửa/kiểm cuối/xuất |
| Ma trận — GV | Mở tab, chọn câu theo ma trận mẫu | 768×1024;360×800 fullpage | 6 câu10đ, phân bố điểm; vùng GV duyệt trước xuất. Thấy UI-0100; chưa nhập CSV/DOCX/XLSX hay xuất file |

Không dùng lượt này đóng UI-0001/UI-0004: W3 đang sửa các file khác. Không thử pin/infographic hay vai auth keyboard để nghiệm thu. 768 chỉ áp dụng ca công cụ ghi trên;360 chỉ header và ngân hàng/ma trận. Không kiểm browser zoom, screen reader, tải AI cả lớp,17 mô phỏng hoặc toàn video.

## UI-0100 — hai phương án nhiễu trùng trong câu được chọn làm đề

- Severity: **P2 / Major về chất lượng đánh giá**, không lỗi đáp án đúng đã chứng minh. Trạng thái OPEN, cần root đối chiếu nguồn.
- Trang: `/hoc-lieu/ai-giao-vien`; vai GV công khai; state Ngân hàng đề → Up ma trận đề và xuất ra đề file Word → Đề đã chọn; size768×1024 (cũng thấy trong ảnh360×800).
- Steps: mở trang; chờ ngân hàng tải; mở tab ma trận; giữ cấu hình mẫu và mã DE-01; nhấn Chọn câu theo ma trận; cuộn tới Câu1 ·0,5đ·B21.
- Before/evidence: câu “Các nguyên tử là nguyên tử đồng vị khi hạt nhân của chúng có”; A cùng số proton; **B cùng số neutron; C cùng số neutron**; D cùng khối lượng. Ảnh đã mở `evidence/UI-0100-final-768.png`; overview `evidence/matrix-selected-360.png`. Ảnh mang tên UI-0100-duplicate-768/confirmed-768 là các lần chụp lệch vùng, không dùng làm bằng chứng chính.
- Source paragraph: hd P12–14 (chẩn đoán/feedback); NCKH P135,P239 (ma trận và chính xác học liệu); bài báo P144–145,P179 (đối chiếu nguồn, kiểm nội dung trước xuất),P193,P215 (giới hạn kiểm chứng). Các đoạn này là yêu cầu đối chiếu, không phải nguồn của phương án đúng/sai cụ thể. Chưa đối chiếu trang sách gốc của câu này.
- Tác động dạy/học: hai phương án nhiễu giống nhau làm giảm lựa chọn có ý nghĩa, hạn chế chẩn đoán nhầm lẫn neutron/nucleon/khối lượng và tạo cảm giác đề thiếu kiểm duyệt. Không suy từ đó mọi câu hoặc điểm chấm sai.
- Expected: câu có phương án phân biệt, nguồn/khóa/giải thích được GV đối chiếu. Giữ quyền GV chỉnh, không tự bịa phương án thay thế để “đủ bốn”.
- Acceptance: xác định câu và trang nguồn; nếu bản gốc/biên tập chưa rõ thì loại khỏi tập chọn đã kiểm tra hoặc ghi cảnh báo cần rà; nếu có căn cứ sửa thì cập nhật đúng phương án/khóa/giải thích và hồ sơ nguồn. Chọn lại DE-01 và ít nhất một mã khác, xem ngân hàng/preview/DOCX để xác nhận dữ kiện thống nhất và không còn hai distractor trùng vô ý. Worker2 kiểm lại trên phiên bản frozen.

## Ảnh đã mở xem

Các file sau đã mở bằng view_image, không chỉ tạo screenshot. Prefix live là thư mục evidence tuyệt đối nêu trên; route theo stem, size là viewport (fullpage có chiều cao ảnh lớn hơn viewport), state ghi coverage; version live/HMR chưa frozen.

- home-1440.png,home-390.png,home-tab-360.png
- demo-lesson-1440.png,demo-lesson-390.png
- login-1440.png,login-390.png,login-empty-390.png
- register-1440.png,register-390.png,register-empty-390.png
- lop-hoc-dao-nguoc-1440.png,lop-hoc-dao-nguoc-390.png
- ai-giao-vien-1440.png,ai-giao-vien-390.png
- worksheet-390.png,worksheet-edit-768.png,worksheet-add-768.png,worksheet-preview-768.png
- preparation-edit-768.png,matrix-768.png,matrix-selected-360.png
- UI-0100-final-768.png,UI-0100-duplicate-768.png,UI-0100-confirmed-768.png
- bank-empty-768.png,bank-edit-768.png
- connection-error-1440.png: lỗi kết nối; connection-error-390.png: tên đặt trước khi server phục hồi nhưng ảnh thực tế demo ban đầu, không phải ảnh lỗi.

Ảnh root BEFORE đã mở từ `/Users/vodoandangkhoi/Documents/WEB_WORKING_24-09/docs/codex-team/ui-review/lead-evidence/`: home-before-1440x900.jpg,login-before-1440x900.jpg,register-before-1440x900.jpg,demo-before-1440x900.jpg. Ảnh trước có Z=N+P; ảnh mới desktop có N=A−Z. Không xem ảnh root AFTER riêng; dùng ảnh live mới tự chụp.

## Actual tests và giới hạn cuối

Actual tests là các thao tác browser trong bảng; không chạy lại61 tests/build/lint, không coi kết quả cũ là kết quả lượt này. Không có tài khoản/dữ liệu thử hoặc môi trường DB đã xác minh: toàn bộ giao–nộp, ownership, điểm lớp, auth thành công và chuyển giao CHƯA KIỂM CHỨNG. Không có GV/HS thật, hiệu quả hoặc mức tăng tự học CHƯA KIỂM CHỨNG. Chưa kiểm hết wizard, chưa kiểm đầy đủ mọi viewport/state, chưa tải/đọc Word, chưa hai lượt đầy đủ liên tiếp cùng hash. UI-0100 mới cần xử lí/đối chiếu; giữ CHƯA ĐẠT tổng.
