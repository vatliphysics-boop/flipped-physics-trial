# Implementation ledger — Đợt 01

Cập nhật: 2026-09-24. Workspace `/Users/vodoandangkhoi/Documents/flipped-physics`; branch `refactor/flipped-physics-consistency`.

## Bằng chứng nền

- `package.json`: Next.js 16.3.5, React 19.2.0, Supabase SSR 0.12.7.
- Server: PID 47572, `next dev`, cổng 3000, URL `http://127.0.0.1:3000`.
- `npm run lint`: PASS; `npx tsc --noEmit`: PASS.
- HTTP chưa xác thực: `/` 200, `/login` 200, `/teacher` 307 tới `/login`, `/teacher/classes` 307 tới `/login`, `/student` 200.
- Working tree có thay đổi chưa commit từ trước; không reset/ghi đè.
- Chưa có browser automation, tài khoản test hoặc staging DB; ca cần chúng là BLOCKED.

## Quy ước

`PASS` chỉ khi có lệnh/kết quả hoặc bằng chứng tĩnh cụ thể. `N/A` chỉ khi không áp dụng. `TODO` là chưa đủ bằng chứng. `BLOCKED` là thiếu công cụ/quyền hoặc ca có nguy cơ ảnh hưởng ứng dụng thật.

## Đợt 01


| ID | Trạng thái | Bằng chứng |\n|---|---|---|
| B0001 | PASS | Workspace, route, component và migration đã truy vết. |
| B0002 | PASS | Tiêu chí gói và phần đã có/thiếu đã ghi trong checkpoint. |
| B0003 | N/A | Gói định vị không cần đổi runtime. |
| B0004 | PASS | CWD tuyệt đối và git status xác nhận workspace. |
| B0005 | PASS | Không gặp lỗi tải/chạy/lưu; không báo giả. |
| B0006 | PASS | Ledger/checkpoint nối vào điều hành, không đụng source. |
| B0007 | PASS | package.json xác nhận ứng dụng thực tế. |
| B0008 | BLOCKED | Chưa có bản sao thứ hai/browser để thử ca UI. |
| B0009 | PASS | Source modified/untracked được bảo toàn. |
| B0010 | PASS | Gói ghi trong ledger/checkpoint. |
| B0011 | PASS | PID/cwd/cổng/chế độ từ ps, lsof, HTTP. |
| B0012 | PASS | Tiêu chí server/cổng đã ghi. |
| B0013 | N/A | Không cần đổi server để định vị. |
| B0014 | BLOCKED | Chưa tạo ca chiếm cổng có kiểm soát. |
| B0015 | PASS | HTTP không có lỗi runtime quan sát được. |
| B0016 | PASS | URL/cổng ghi trong checkpoint. |
| B0017 | PASS | curl trả header Next.js và mã hợp lệ. |
| B0018 | BLOCKED | Không thử chiếm cổng để tránh ảnh hưởng app khác. |
| B0019 | PASS | Không restart/kill tiến trình hiện tại. |
| B0020 | PASS | Gói server/cổng đã chốt. |
| B0021 | PASS | Route lấy từ src/app và context. |
| B0022 | PASS | Phát hiện /student chưa redirect khi chưa xác thực. |
| B0023 | N/A | Chưa sửa route trong gói định vị. |
| B0024 | PASS | Chưa thấy route trùng trong route tree. |
| B0025 | PASS | Các route curl tải được hoặc redirect hợp lệ. |
| B0026 | BLOCKED | Chưa có browser kiểm tra bookmark. |
| B0027 | PASS | Trang chủ/login hoạt động; teacher có guard. |
| B0028 | BLOCKED | Chưa có browser test nhánh cũ/trùng. |
| B0029 | BLOCKED | Chưa kiểm tra bookmark bằng browser. |
| B0030 | PASS | Bản đồ route và giới hạn đã ghi. |
| B0031 | BLOCKED | Chưa có screenshot/browser baseline. |
| B0032 | BLOCKED | Chưa xác minh viewport/zoom trực quan. |
| B0033 | N/A | Không sửa giao diện trong gói baseline. |
| B0034 | BLOCKED | Thiếu browser automation. |
| B0035 | PASS | Không báo baseline hình ảnh giả. |
| B0036 | TODO | Chờ visual regression sau khi có browser. |
| B0037 | BLOCKED | Chưa có ảnh mốc so sánh. |
| B0038 | BLOCKED | Chưa chạy ca biên viewport. |
| B0039 | TODO | Chờ browser và baseline. |
| B0040 | PASS | Blocker trực quan ghi trung thực. |
| B0041 | PASS | Curriculum truy vết trong src/lib/curriculum.ts. |
| B0042 | PASS | Tiêu chí mã/thứ tự ghi; PDF chưa đối chiếu trang. |
| B0043 | N/A | Chưa đổi mapping. |
| B0044 | PASS | Đã nhận diện rủi ro B21/số 21. |
| B0045 | PASS | Không có lỗi tải tài liệu quan sát được. |
| B0046 | TODO | Chưa kiểm tra lesson ID qua đổi route/lớp. |
| B0047 | TODO | Chưa đủ bằng chứng bốn chương theo PDF. |
| B0048 | TODO | Chưa chạy mapping B21 bằng dữ liệu thật. |
| B0049 | TODO | Chưa kiểm tra ID lesson khi đổi route. |
| B0050 | PASS | Gói danh mục đã ghi trạng thái thật. |

| B0051 | PASS | Quan hệ lớp/bài/học liệu/progress truy vết qua migrations. |
| B0052 | PASS | Tiêu chí FK/cascade ghi; assessment schema chưa xác nhận đầy đủ. |
| B0053 | N/A | Chưa migration trong gói định vị. |
| B0054 | PASS | Phát hiện cascade classes/members và lessons/topics cần rà trước xóa. |
| B0055 | PASS | Chưa có lỗi migration/runtime quan sát được. |
| B0056 | BLOCKED | Chưa có DB staging để chạy migration tương thích. |
| B0057 | PASS | Có thể xác định ownership material qua lesson/class/teacher từ code/schema. |
| B0058 | BLOCKED | Chưa chạy ca cascade trên fixture cô lập. |
| B0059 | BLOCKED | Chưa áp dụng migration trong môi trường kiểm thử độc lập. |
| B0060 | PASS | Gói schema đã ghi phát hiện và phụ thuộc. |
| B0061 | PASS | Quyền truy vết từ proxy, server client, actions và RLS migrations. |
| B0062 | PASS | Tiêu chí khách/teacher/student đã ghi; RLS cần runtime test. |
| B0063 | N/A | Chưa đổi quyền trong gói định vị. |
| B0064 | BLOCKED | Chưa có hai tài khoản/lớp fixture để thử đổi classId. |
| B0065 | PASS | Không che lỗi query trong kết luận; chưa mutation trái quyền. |
| B0066 | TODO | Cần test API/server action trực tiếp sau khi có fixture. |
| B0067 | BLOCKED | Không có tài khoản teacher test. |
| B0068 | BLOCKED | Không có fixture lớp khác cho ca âm. |
| B0069 | TODO | Chờ test trực tiếp API/RLS. |
| B0070 | PASS | Gói phân quyền ghi blocker chính xác. |
| B0071 | PASS | Đã xác định fixture hai teacher/hai lớp/student. |
| B0072 | PASS | Tiêu chí cô lập và không xóa dữ liệu thật đã ghi. |
| B0073 | BLOCKED | Chưa có cơ chế seed/reset staging an toàn. |
| B0074 | PASS | Không dùng lớp thật để test xóa. |
| B0075 | PASS | Không báo fixture thành công khi chưa tạo. |
| B0076 | TODO | Cần script/fixture có phạm vi sau khi xác định DB test. |
| B0077 | BLOCKED | Chưa có fixture để thử upload/nộp. |
| B0078 | PASS | Ca xóa thật không được thực hiện. |
| B0079 | TODO | Chờ fixture cô lập. |
| B0080 | PASS | Gói fixture chốt ở trạng thái trung thực. |
| B0081 | PASS | Đã ghi nhóm lỗi phiên, xóa, CSS, student, simulation, assessment. |
| B0082 | PASS | Tiêu chí tái hiện và bằng chứng đã ghi. |
| B0083 | N/A | Chưa sửa lỗi runtime khi chưa có tái hiện đầy đủ. |
| B0084 | PASS | Không gán lỗi query thành thiếu dữ liệu; /student cần audit riêng. |
| B0085 | PASS | Chưa gặp lỗi tải/lưu trong truy vết. |
| B0086 | TODO | Cần test hồi quy sau từng sửa lỗi. |
| B0087 | PASS | Route và triệu chứng HTTP đã ghi. |
| B0088 | TODO | Chưa tái hiện browser/query error cụ thể. |
| B0089 | TODO | Chưa có test hồi quy tự động cho từng lỗi. |
| B0090 | PASS | Gói lỗi/truy vết ghi không phóng đại. |
| B0091 | PASS | Đã xác định 10 đợt và dependency chính. |
| B0092 | PASS | Tiêu chí ledger/checkpoint đã ghi. |
| B0093 | PASS | Tạo checkpoint/ledger là thay đổi tối thiểu cần thiết. |
| B0094 | PASS | Không đánh PASS hàng loạt; từng bước có trạng thái. |
| B0095 | PASS | Checkpoint nêu blocker và không chứa secret. |
| B0096 | PASS | CURRENT_TASK ghi bước tiếp theo và phụ thuộc. |
| B0097 | PASS | B0001-B0100 có trạng thái và bằng chứng riêng. |
| B0098 | PASS | Ca thiếu công cụ là BLOCKED/TODO, không PASS giả. |
| B0099 | PASS | Checkpoint đọc được để tiếp tục sau gián đoạn. |
| B0100 | PASS | Đợt 01 chốt bằng ledger/checkpoint, chưa tuyên bố toàn bộ dự án. |

## Tổng hợp Đợt 01

Các bước `BLOCKED`/`TODO`/`N/A` không phải hoàn tất chức năng; chỉ được chuyển trạng thái khi có bằng chứng mới.
