# Bộ điều phối ba tài khoản

Chạy tại thư mục người dùng yêu cầu `/Users/vodoandangkhoi/Documents/WEB_WORKING_24-09`, branch hiện tại `main`. Checkout desktop khác không được đồng bộ/reset để thay thế. Xem `docs/codex-team/TEAM.md` và bảng nghiệm thu trước giao việc. Trưởng nhóm giữ file chung; Worker 2 chỉ sửa bài báo; Worker 3 sửa đúng file UI được chỉ định. Các thay đổi đang có được giữ nguyên.

```sh
node scripts/codex-team/run.mjs preflight
node scripts/codex-team/run.mjs run scripts/codex-team/worker2-round5-retest.json
```

Mỗi job JSON có `id` duy nhất, `worker` 2 hoặc 3, `mode` review/fix/article, `timeout_seconds` 30–3600, `task`, `previous_runs`, `context_files`, `allowed_files` chính xác khi ghi. `browser_mcp` bật trình duyệt sạch; `browser_origins` chỉ cho các nguồn video công khai được bộ điều phối liệt kê. `allowed_domains` là mạng cho tiến trình CLI; không thay chính sách ứng dụng.

CLI đã xác minh: codex-cli 0.160.0. `codex exec --help` là căn cứ tùy chọn; dùng `--ignore-user-config`, `--strict-config`, `-C`, `--json`, `-o`, `-c cli_auth_credentials_store="file"`, provider OpenAI và profile quyền được CLI này hỗ trợ. Không truyền model khác để thay tài khoản. `CODEX_HOME` trỏ đúng `.codex-plus-2` hoặc `.codex-plus-3`; API key/token từ biến môi trường được loại trước chạy. Đăng nhập phải được `login status` xác nhận ChatGPT; lỗi dừng job, không lấy credentials của trưởng nhóm. Kiểm tra trong bộ nhớ rằng account_id của `.codex`, `.codex-plus-2`, `.codex-plus-3` đều có và khác nhau; chỉ lưu kết quả boolean.

Quyền CLI kế thừa read-only. Review chỉ ghi thư mục bằng chứng/tạm và báo cáo; fix/article thêm quyền ghi đúng file được giao. Có khóa theo worker/file, ID lượt không được tái dùng, sao lưu file trước sửa, hash trước/sau, kiểm tra hai nguồn DOCX bất biến, timer kết thúc cả process group và log trạng thái. Không xóa khóa của tiến trình còn sống. Signal khi hết thời gian và `exit_code: null` được giữ đúng thực tế; không đổi thành mã 0. Thất bại chưa tạo report được trưởng nhóm thu hồi thành checkpoint từ log, ghi rõ tác giả/giới hạn.

Browser MCP chạy tại host và cwd ở evidence; nó không nằm hoàn toàn trong sandbox filesystem của CLI. Luôn truyền filename ảnh/snapshot tuyệt đối trong evidence. Origin allowlist là giới hạn thao tác công cụ, không được quảng cáo là ranh giới bảo mật đầy đủ. Bộ điều phối giữ audit thay đổi ngoài danh sách; trưởng nhóm xem và xác định thay đổi do mình/worker khác/bằng chứng. Sáu ảnh lượt UX4 ghi nhầm root đã được trưởng nhóm chuyển nguyên vẹn vào evidence; không xóa dữ liệu khác.

Trong `docs/codex-team/runs/<id>/` có prompt, command (không credentials), status, session ID, events JSONL, stderr, backup nếu sửa, hash và browser-evidence. Một số report cuối chỉ là liên kết đến report tạm; trưởng nhóm thu hồi bản đó thành `detailed-report.md`. `COMPLETED_PENDING_LEAD_REVIEW` chỉ có nghĩa tiến trình hoàn tất, chưa đạt nghiệm thu.

Khi Worker 2 cập nhật DOCX, làm mới trích xuất bài báo và source-manifest sau khi kiểm tra file. Bộ điều phối cố ý từ chối nguồn/trích xuất có hash cũ. Không sửa hai DOCX gốc. Bản web cuối được chốt bằng `docs/codex-team/web-version-final.json`, gồm src/public và cấu hình/phụ thuộc; tài liệu báo cáo không làm đổi hash web. Các bản hash theo vòng vẫn giữ để truy nguyên. Hai lượt nghiệm thu cuối chỉ hợp lệ nếu cùng hash, không có vấn đề mới thuộc tiêu chí và không có luồng bắt buộc chưa kiểm chứng.

Backup mã nguồn dùng hậu tố `.bak` để không bị TypeScript biên dịch như một bản mã thứ hai; backup DOCX giữ đuôi `.docx`. Không chạy lại ID job đã có: ví dụ trên chỉ minh họa cấu trúc lệnh, lượt tiếp tục phải tạo JSON với ID mới và truyền báo cáo vòng trước. Xem `docs/codex-team/CHECKPOINT.md` và `DEV_DATABASE_AND_RESUME.md` trước khi chạy tiếp.

Hạn mức, lỗi quyền/công cụ, thiếu môi trường/tài khoản thử hoặc dữ liệu nghiên cứu phải ghi CHƯA ĐẠT trong checkpoint. Đổi phương án khi cùng nguyên nhân lặp lại; không đếm số vòng để tuyên bố hoàn tất. Triển khai thật, chạy migration trên database thật, xuất bản bài báo và nghiên cứu với người học là các bước riêng cần điều kiện thích hợp.
