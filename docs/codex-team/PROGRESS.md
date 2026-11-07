# Tiến độ và bằng chứng các vòng

Ngày 05/10/2026, thư mục Documents/WEB_WORKING_24-09, branch main. Ba tài khoản đã xác nhận đăng nhập ChatGPT và khác nhau; không dùng API key. Trưởng nhóm trực tiếp sửa học liệu/khoa học/AI và tích hợp; Worker 2 phản biện, duy nhất sửa bài báo; Worker 3 sửa đúng file UI được giao. Trạng thái, session ID và log ở rounds-index.json và runs/.

| Vòng | Công việc và kết quả | Giới hạn / việc tiếp theo |
|---|---|---|
| 0–3 | Kiểm tra CLI/quyền; chưa dùng thử web thành công. Đổi MCP, đường dẫn socket ngắn, quyền review chỉ đọc và thư mục bằng chứng | Không tính là lượt đánh giá thực tế |
| 4 | W2 smoke thật desktop/mobile. W3 thử 13 nhóm thao tác, có 18 ảnh. W2 dùng thử B22/B23, phiếu/AI/B24/B25; phát hiện thiếu CSV, AI ngoài phạm vi bị ép H1, nút AI bị DevTools che | W2 hết thời gian; giữ nháp/log/ảnh, không kết luận nghiệm thu cuối |
| 5 | Root thêm CSV 61 điểm, hướng dẫn XY/T/đặt lại/nguồn/giới hạn; sửa OUT_OF_SCOPE. W3 sửa devIndicators:false. W2 tải ba CSV, tính T, thử hai câu AI và chuột ở 1280/390, bàn phím infographic B23 | W2 hết thời gian trước báo cáo cuối; còn hướng dẫn trống/tiêu chí đóng vai. Excel/Sheets và người học thật chưa thử |
| 6 | Root thêm hướng dẫn trống/aria-describedby và bốn tiêu chí B24/TXT. W2 dùng browser thật ở 390, thử sai→đúng và tải TXT: đạt phạm vi. W3 thử năm video nhưng media bị giới hạn công cụ | Không gán media bị chặn thành lỗi sản phẩm; bổ sung đúng host công khai đã thấy |
| 7 | Root thêm lịch sử B21; W2 kiểm tra bốn mốc/bàn phím/pressed/live/desktop/mobile: đạt phạm vi. W3 sửa tên video B24, xác nhận phát/dừng/tiếp tục B21–B24. Nguồn chương trình trên web đổi sang nguyên PDF người dùng cung cấp | W3 hết thời gian sau bốn ca; B25 tiếp tục lượt riêng. Backup .ts gây lỗi compiler đã giữ nguyên và đổi đuôi .bak; build chạy lại đạt |
| 8 | W3 xác nhận B25 phát/dừng/tiếp tục ở 390; tổng hồ sơ năm video có đoạn phát thật. W2 cập nhật DOCX có chọn lọc và render/xem từng trang. Root kiểm tra độc lập đủ 25 trang và audit ZIP | Chưa xem toàn bộ video, kiểm mọi phụ đề hoặc mức hiểu của HS. DOCX giữ 24 hình; chỉ word/document.xml đổi. Không đủ hai lượt đầy đủ US03 |

Kết quả kỹ thuật cuối: 61/61 tests; build và TypeScript đạt; lint 0 lỗi, 1 cảnh báo có sẵn. Có một cảnh báo build về truy vết tệp động; cần kiểm tra đóng gói khi chuẩn bị triển khai. Bằng chứng tại TECHNICAL_VERIFICATION.md và các log tương ứng. Hash web cuối ở web-version-final.json.

File dùng chung do trưởng nhóm tích hợp. Review chỉ đọc; audit changed_files có thay đổi đồng thời của trưởng nhóm/worker khác, không tự quy thuộc cho worker đang review. Backup mã nguồn giữ nguyên nội dung dưới hậu tố .bak; backup-paths-round7.json ghi vị trí. Hai DOCX căn cứ không đổi. Không reset/clean, ghi DB/migration hoặc triển khai thật.

Người dùng xác nhận chưa rõ Supabase từ xa là môi trường thử và yêu cầu giữ checkpoint. Giao–nộp/phân quyền/lưu lớp vẫn CHƯA ĐẠT; thiết lập môi trường riêng theo DEV_DATABASE_AND_RESUME.md. Nghiên cứu với GV/HS thật, kiểm định công cụ đánh giá, dữ liệu quy mô và việc bài báo được chấp nhận chưa có bằng chứng. Phản biện AI không thay thế các phần này.

CHECKPOINT.md ghi việc đã đạt theo ca, phạm vi còn thiếu, đánh giá riêng về triển khai rộng và cách tiếp tục.


## Đợt rà soát UI9–UI11 đang thực hiện (05/10/2026)

Baseline code giống checkpoint trước; server và hai account cùng Documents/main. W2 UI9 và W3 UI9 exit0 xác nhận B25 và cơ chế chung. W3 UI10 exit0 sửa infographic/zoom/role keyboard; root sửa nhãn B23, công thức N=A−Z, 404 và trạng thái chưa đăng nhập. Chưa đóng lỗi; chờ W2. W2 UI10 đang thử công cụ GV và luồng công khai; W3 UI11 đang thử17 mô phỏng. Bảng40route ở ui-review/coverage.md;8lỗi ở ui-review/issues.md. Supabase/luồng dữ liệu vẫn CHƯA KIỂM. Chưa hai lượt nghiệm thu cuối, chưa cập nhật bài báo đợt này. Không hoàn tất.

## UI13 — 2026-10-05T14:10:53.509157+00:00

Candidate 898fe3bf…c05e2, main tại Documents, server PID40707. W3 UI12b sửa marker/legend/camera/đồ thị, nhưng timeout và Chrome shell SIGABRT, không có ảnh sau; giữ CHƯA ĐẠT. Đổi cách sang MCP-only hai account riêng: W3 UI13 tập trung 3 lỗi; W2 UI13 root fixes và công cụ. TypeScript exit0; lint0 lỗi/2 cảnh báo (một cảnh báo ref PortalShell mới); 62/62 tests đạt. Lệnh test đầu dùng tsx chưa cài bị lỗi đã giữ log, chạy lại đúng resolver đạt. Build phiên này chưa chạy vì giữ dev cho worker. Bài báo/UI nghiệm thu cuối chưa cập nhật, 0 lượt cuối hợp lệ.
