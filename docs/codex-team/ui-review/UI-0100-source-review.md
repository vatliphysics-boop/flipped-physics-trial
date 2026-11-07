# UI-0100 — root đối chiếu nguồn và xử lý

Codex chính đã mở ảnh gốc data/book-bank/sbt-kntt/pages/071.jpg ở original resolution: câu21.3 B/C cùng số neutron. Đây là lỗi của bản nguồn được chép đúng, không tự bịa phương án C khác. Giữ nguyên prompt/options/key bản chép, chuyển sbt-kntt-nuclear-003 thành draft, ghi lý do; loại khỏi unified bank để không chọn/xuất tự động. Tập xuất212 câu (trắc nghiệm72, ba loại khác giữ12/19/109), trước213. Script curate giữdraft khi tạo lại. validateUnifiedQuestion từ chối4option bị trùng sau chuẩn hóa khoảng trắng/NFC; giáo viên vẫn có thể biên tập phương án khác và duyệt theo nguồn. Không thay tài liệu gốc/sách/DB.

Regression test kiểm hai mã DE-01/DE-02 không chọn câu bị giữ lại và phát hiện sửa thủ công cóoptiontrùng. Cần Worker2 dùng lại UI/ngân hàng/preview và tải/đọc DOCX để đóng. Tests chỉ bằng chứng kỹ thuật. Ảnh trước thật ở runs/worker2-ui10-public-teacher-review/all-evidence/UI-0100-final-768.png.
