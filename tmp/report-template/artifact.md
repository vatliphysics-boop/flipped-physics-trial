# Hợp đồng soạn lại bài báo theo mẫu mới

- Mẫu duy nhất: /Users/vodoandangkhoi/Downloads/BÁO KHOA HỌC ĐĂNG KHÔI .docx
- SHA256: fd7df26a7999d65f72514e259668101f7eb96664f8cb3368cd9c07b9ddd346a6. Mẫu giữ nguyên, bản kết quả lưu tại BAI_BAO_KHOA_HOC_CAP_NHAT_HOC_LIEU.docx.
- Mẫu 12 trang, một section A4 dọc 21,00086 × 29,70036 cm; lề trên 3,49956, dưới 3,79942, trái/phải 2,49943 cm. Giữ nguyên sectPr, khoảng cách header/footer và hệ trang.
- Giữ header VJE/ISSN, vạch màu và footer số trang từ mẫu; không điền ngày Received/Accepted/Published. Footer PAGE của mẫu giữ nguyên; bật updateFields để Word cập nhật cache khi mở.
- Font gốc Times New Roman; docDefaults 10,5 pt, đen. Title 13 pt đậm, hoa, giữa. Subtitle 9,5 pt giữa. Heading 1 đậm, Heading 2 đậm nghiêng, Heading 3 nghiêng; giữ rPr/pPr nguồn. Normal căn đều, thụt đầu dòng khoảng 0,5 cm; Caption1 nghiêng giữa, Hình/Bảng đậm. Không áp dụng mẫu chữ/lề khác.
- Bảng đầu bài: giữ lưới, ô gộp, đường phân chia và tô xám. Bốn khối: tác giả; đơn vị/email/điện thoại; lịch bài và từ khóa; ABSTRACT/TÓM TẮT có ba nhãn Context/Result/Discussion và Bối cảnh/Kết quả/Bàn luận. Tên, đơn vị, email, điện thoại giữ như người dùng cung cấp.
- Thân bài đúng thứ tự: 1 Mở đầu; 2 Phương pháp (2.1–2.3); 3 Kết quả (3.1, 3.2.x, 3.3); 4 Kết luận và bình luận; vai trò tác giả; GenAI; xung đột; tài trợ; lời cảm ơn; tham khảo. Không thêm mục 5 hoặc tóm tắt ngoài bảng đầu bài.
- Hai bảng thân bài giữ header xám/lưới/độ rộng/hàng lặp. Cập nhật số kiểm tra 33 và số ảnh 12; thêm hàng AI theo mẫu hàng dữ liệu nguồn khi có bằng chứng.
- Giữ 10 ảnh và ba công thức Word từ mẫu cùng rId và kích thước. Bổ sung hai ảnh thật Hình 11–12 theo paragraph ảnh/caption nguồn; tối đa chiều ngang mẫu 8,6 cm để chữ/nhận dạng nhất quán; caption ghi thử nội bộ, không giả dữ liệu học sinh. Đánh dấu keepNext cho đoạn ảnh để không tách caption.
- Chỉ sửa các slot body /w:document/w:body/w:p[index] đã kiểm kê trong reference-text.txt; giữ phần không liên quan. Bảng abstract locate theo w:t bắt đầu Result/Kết quả; Bảng 2 theo header Hạng mục. Nút AI không phải Gemini/ChatGPT nhúng; liên kết ngoài được gọi đúng liên kết.
- Thư mục nguồn tham khảo hiện có 14 bản ghi CSL/RIS/BibTeX. Danh mục nguồn của mẫu đang hiển thị IEEE dù nội dung dẫn tác giả/năm. Yêu cầu APA đã có của người dùng được giữ: đổi văn bản danh mục sang APA và thêm Ollama, giữ outer control MENDELEY_BIBLIOGRAPHY/tag/id và dữ liệu add-in/customXml. Bản APA là văn bản kiểm chứng để rà soát, không tuyên bố đã đồng bộ Mendeley Cite. Nội dung và định dạng run của bibliography là slot được sửa; control metadata và các phần opaque được giữ.
- GenAI điền công cụ đã dùng: Codex OpenAI, Ollama 0.35.1 và Qwen3 4B Instruct; không bịa phiên bản ChatGPT/Gemini. Xung đột/tài trợ chưa có xác nhận thì ghi cần tác giả xác nhận, không tự tuyên bố không có. Phân công và lời cảm ơn giữ nguồn.
- Bản mẫu có nền xám trực tiếp ở vài đoạn kết luận/tuyên bố và chữ đỏ đánh dấu chờ; khi điền nội dung thực, xóa nền đánh dấu/chữ đỏ của slot đó để bài đọc rõ. Bố cục, cỡ chữ và header vẫn giữ mẫu.
- Package inventory: package-inventory.json. Chỉ sửa document.xml, document.xml.rels (thêm ảnh), settings.xml (updateFields); thêm hai media. Tất cả phần khác giữ nguyên từng byte: styles, themes, customXml, add-in, header/footer, 10 media, footnotes/endnotes, glossary, core/app. Không bỏ bookmark, quan hệ hay control.
- Gate: mẫu còn đúng SHA; một section và sectPr byte-equivalent; đủ tiêu đề/slots; ảnh/OMML cũ giữ; phần preserve unchanged; render_and_diff so sánh; xem mọi trang mới ở độ phân giải gốc; kiểm tra APA 14 và số ca 33 thống nhất. Chỉ báo cáo kiểm thử đã làm, chưa có kết quả thực nghiệm sư phạm.


## Hợp đồng cập nhật cuối 05/10/2026 (thay thế số liệu và giới hạn kích thước phía trên)

- Bộ tạo đang dùng: scripts/build-scientific-report.py. Mẫu duy nhất nằm ở docs/templates/BAO_KHOA_HOC_DANG_KHOI.docx, SHA không đổi. Mẫu cũ/generator cũ được chuyển vào superseded.
- Tiêu đề thân bài dùng tên đề tài NCKH đầy đủ, viết hoa theo mẫu; core title giữ đúng tên ở dạng chữ thường/hoa ban đầu.
- Bản cuối: 41/41 kiểm tra phần mềm, 16 ảnh web thật, 16 nguồn APA, 21 trang. Hình được mở rộng 13,5 cm theo yêu cầu đọc cặn kẽ, giữ tỉ lệ. Ba đoạn trống thuộc phần tuyên bố đã được bỏ để không để một tham khảo riêng một trang.
- Package thay đổi: word/document.xml, word/settings.xml, word/_rels/document.xml.rels và docProps/core.xml (chỉ tiêu đề). Tất cả phần khác giữ từng byte, thêm sáu media. Giữ SDT Mendeley/tag/id, không tuyên bố đồng bộ add-in.
- Đã xem toàn bộ 22 trang render vòng 2; vòng cuối 21 trang: trang 1–20 byte-identical với ảnh đã kiểm tra, trang 21 đã xem lại. Không có chữ/hình bị cắt, caption đi cùng hình, không còn trang cuối chỉ một tham khảo.
- Xuất Word web: bộ tạo được dựng/render; đã xem toàn bộ khóa đáp án 4 trang và phiếu học sinh 3 trang, trang đại diện 1/5/11/20 của đề mẫu 20 trang. Không coi việc này là xác nhận tải Blob thành công trong IAB.
