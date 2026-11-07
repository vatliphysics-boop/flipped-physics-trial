# Hợp đồng file và lỗi ban đầu UI9

Mã/asset baseline giống checkpoint trước (so file hash không khác); manifest canonical đợt UI ở version-baseline.json. Máy chủ PID31476 cwd Documents, main, localhost3001. Hai account CLI riêng ChatGPT xác nhận khác nhau, thực sự chạy browser ở UI9.

Root giữ src/app/page.tsx, src/components/learning/NuclearScienceIllustration.tsx, các nội dung khoa học, bảng báo cáo và file route nếu cần lỗi. Worker3 chỉ sửa những file UI được giao ở job fix. Root không sửa globals.css trong lúc Worker3 giữ quyền file.

UI-0001 P2: B25 số1 che Dữ liệu kì vọng. Root xem/lưu1440 trước sửa tại lead-evidence/UI-0001-B25-before-1440x900.jpg. W2/W3 đang thử các kích thước và B21–B25. Nghiệm thu: không có điều khiển/nhãn che chữ, bảng, đường/hạt cần quan sát; các điểm vẫn chọn được, lời giải đúng; keyboard/zoom/fit/pan hữu ích; 5 viewport.

UI-0002 P2: / ghi Bài21 Cấu tạo hạt nhân nhưng link minh họa mở /demo-lesson Hiện tượng phóng xạ B23. Root sửa nhãn/tags cho phù hợp đích; giữ bài minh họa thực tế và teacher autonomy. Căn cứ NCKH121–122/135, hd12–14. Trước: home-before-1440x900.txt, demo-before-1440x900.txt/jpg. Nghiệm thu link/tên/chủ đề khớp desktop/mobile; Worker2 kiểm lại.

UI-0003 P1 khoa học: NuclearScienceIllustration trên /,/login,/register ghi Z=N+P sai. Root sửa thành N=A−Z, giữ A=Z+N. Căn cứ chương trình structure-symbol, SGK B21. Trước: home/login/register desktop jpg thấy công thức. Nghiệm thu không còn công thức sai ở các nơi dùng; Worker2 xem ảnh và đối chiếu.

UI-0004 P2: radio chọn vai trong /login và /register có computed display:none; firstTab ở register tới full_name, không chọn vai được bằng bàn phím. Root đã thực hiện Tab và đọc AX/DOM thực tế. Worker3 được giao globals.css để giữ native radio accessible/keyboard, visible focus cho label, tap target phù hợp. Không submit tài khoản/DB; kiểm Tab→ArrowRight/Space chọn học sinh và quay giáo viên. Trước: register-before-390x844.jpg/txt; phải chụp/xem sau và ghi checked/focus.

Danh mục40routes ở coverage.json/md; trạng thái mới mặc định CHƯA KIỂM. Supabase riêng chưa xác minh, giữ dữ liệu/lưu/giao–nộp/ownership CHƯA KIỂM. Không thử tạo user thật, không môi trường/auth giả thành nghiệm thu thật.

Báo cáo phải ghi ảnh đã MỞ để xem, size thật (đọc innerWidth/height), route/state/version. Dùng exact filepaths evidence. Browser zoom chưa xác nhận nếu phím không đổi metrics; không thay CSS zoom rồi gọi là browser zoom.

Các đợt cuối phải hai lượt đầy đủ liên tiếp trên cùng manifest frozen; các smoke/phạm vi hẹp không tính. W2 chỉ báo cáo/DOCX, W3 UX, root science. Tất cả giữ nguồn DOCX bất biến, không reset/DB/deploy.
