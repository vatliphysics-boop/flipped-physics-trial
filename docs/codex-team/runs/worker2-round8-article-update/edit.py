from zipfile import ZipFile, ZIP_DEFLATED
from lxml import etree
from pathlib import Path
import hashlib,json,copy
base=Path('/Users/vodoandangkhoi/Documents/WEB_WORKING_24-09')
tmp=Path('/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w2-jvkqeA')
f=base/'BAI_BAO_KHOA_HOC_CAP_NHAT_HOC_LIEU.docx'
data=f.read_bytes(); (tmp/'article-before.docx').write_bytes(data)
with ZipFile(f) as z: parts={n:z.read(n) for n in z.namelist()}
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
root=etree.fromstring(parts['word/document.xml']); ps=root.xpath('//w:body//w:p',namespaces=ns)
def text(p): return ''.join(p.xpath('.//w:t/text()',namespaces=ns))
def setp(i,s):
 p=ps[i-1]; ts=p.xpath('.//w:t',namespaces=ns); assert ts
 ts[0].text=s
 for t in ts[1:]: t.text=''
for i in [26,31,67,215]: setp(i,text(ps[i-1]).replace('58','61'))
setp(67,text(ps[66])+' Bộ kiểm tra trước có 58 ca; phiên cuối có 61 ca. Phản biện và dùng thử bằng AI đóng vai giáo viên theo tiêu chuẩn giả định được tách khỏi kiểm tra kĩ thuật; không có giáo viên hoặc học sinh thật tham gia nghiên cứu này.')
setp(102,'Câu hỏi và hướng dẫn video là tiếng Việt. Vòng 7 đã thử phát, dừng và tiếp tục các đoạn B21–B24; phụ đề tiếng Anh được quan sát ở B21–B23 và tiếng Việt ở đoạn B24. Tên B24 được sửa thành “Những vấn đề của năng lượng hạt nhân” của M. V. Ramana và Sajan Saini. B23 từng lỗi kết nối nhúng rồi mở lại được. Tên và kênh năm video đã được đối chiếu, nhưng chưa xem hết nội dung hoặc kiểm chứng toàn bộ phụ đề. B25 chưa có kết quả hoàn tất ở thời điểm cập nhật. Giáo viên cần kiểm tra ngôn ngữ, mạng và nguồn thay thế trước giao; liên kết mở nguồn không tự chứng minh video phát được.')
setp(110,text(ps[109])+' CSV tải từ B23 có 61 mốc từ 0 đến 360 s, sáu cột và ghi tham số, nguồn mô hình. Ba tệp thử với (N₀, T) = (1000, 30 s), (1000, 60 s), (2000, 60 s) cho N(30 s) lần lượt 500; 707,106781; 1414,213562. Tính T từ hai điểm theo T = (t₂ − t₁)ln2/ln(N₁/N₂) thu lại 30 hoặc 60 s. Hướng dẫn vẽ XY và đặt lại bảng được bổ sung để hỗ trợ xử lí dữ liệu; chưa thao tác Excel/Sheets thật hoặc tổ chức nhóm học sinh.')
setp(139,text(ps[138])+' Sau lỗi gán câu ngoài phạm vi vào đoạn lí thuyết, cơ chế giới hạn phạm vi được bổ sung. Hai câu thử tuần tự trên giao diện 1280/390 px xác nhận từ chối câu làm bánh và gợi ý đúng công thức ở hai chu kì bán rã; không xác nhận mọi câu hỏi đều đúng. Công cụ chỉ báo phát triển đã được ẩn để tránh che nút AI; đây là sửa môi trường phát triển.')
setp(195,'61/61 ca đạt; build và TypeScript chạy lại cuối đạt; lint không có lỗi, còn một cảnh báo có sẵn. Build còn cảnh báo truy vết hệ thống tệp động.')
setp(198,'Hồ sơ trước có 24 giao diện; các ca bổ sung xét 1280/390 px, bàn phím, hướng dẫn trống và lịch sử B21.')
setp(201,'Tên/kênh năm video được đối chiếu; B21–B24 thử đoạn phát/dừng/tiếp tục. Lưu cục bộ và xuất TXT B24 đã được thử.')
setp(202,'Chưa xem hết video; B25 đang chờ kết quả. Chưa kiểm chứng mọi phụ đề hoặc tải tệp trên máy chủ khác.')
setp(204,'PGRST205 là kết quả phiên trước. Chẩn đoán đọc hiện tại với chín schema thất bại DNS ENOTFOUND; chưa xác minh môi trường thử hoặc schema.')
setp(205,'Không kết luận thiếu bảng từ lỗi DNS. Chưa có tài khoản/dữ liệu thử; giữ checkpoint, không ghi DB hoặc chạy migration; cần môi trường phát triển riêng rồi kiểm thử hai vai.')
setp(208,'Phản biện AI và dùng thử giới hạn, không phải thẩm định của giáo viên 50 năm kinh nghiệm thật. Không có người tham gia, dữ liệu học sinh hoặc hiệu quả dạy học.')
setp(210,text(ps[209])+' Các vòng 4–7 cung cấp ca kiểm tra giới hạn, chưa tạo thành hai lượt đầy đủ liên tiếp trên cùng phiên bản cuối; vòng 8 cập nhật bài báo theo hồ sơ. Trạng thái nghiệm thu tổng vẫn CHƯA ĐẠT.')
setp(209,text(ps[208])+' Hướng dẫn chưa chọn đáp án B21 và phản hồi sai/đúng đã được thử bằng bàn phím ở 390 px. B24 bổ sung bốn tiêu chí lập luận khoa học, bằng chứng truy nguyên, giới hạn, phản biện/tự điều chỉnh; tệp TXT giữ tiêu chí và bốn trường giả định do AI nhập. Những sửa đổi giúp người học biết cách bắt đầu và giáo viên nhận xét sản phẩm, chưa chứng minh chất lượng bài làm thật.')
setp(89,text(ps[88])+' B21 bổ sung bốn mốc 1896/1898/1911/1932 và nhiệm vụ hai cặp bằng chứng–kết luận cùng một dự đoán đã sửa. Vòng 7 chọn đủ bốn mốc, thử Tab/Enter và xem ở 1280/390 px; trạng thái chọn và vùng thông báo cập nhật đúng. Đây là kiểm tra giao diện và tính nhất quán theo hồ sơ nguồn, không phải phép thử với người học; nguồn Curie chỉ có metadata được chỉ mục, trang trực tiếp bị chặn.')
setp(166,text(ps[165])+' Đối chiếu 15/15 yêu cầu ở trang 27–28 của PDF chương trình do người dùng cung cấp không phát hiện bỏ sót hoặc sai nghĩa; kết quả mapping không xác nhận mọi hoạt động và kế hoạch đã đạt. Hồ sơ pháp lí chưa xác minh đầy đủ tình trạng áp dụng hiện tại của các công văn hướng dẫn; tỉ lệ mẫu không mặc định bắt buộc cho mọi đề tự luyện.')
setp(215,text(ps[214])+' Chưa hoàn thành hai lượt dùng thử đầy đủ liên tiếp trên cùng hash bản cuối. Quy mô lớp và mốc tiến độ trong thuyết minh gốc còn mâu thuẫn, cần tác giả xác nhận trước nghiên cứu; hai tài liệu căn cứ được giữ nguyên.')
setp(230,'Bộ Giáo dục và Đào tạo. (2018). Chương trình giáo dục phổ thông môn Vật lí (Ban hành kèm theo Thông tư số 32/2018/TT-BGDĐT). Cơ sở dữ liệu văn bản Bộ Giáo dục và Đào tạo. https://vbpl.vn/bogiaoducdaotao/Pages/vbpq-van-ban-goc.aspx?ItemID=146721&dvid=317')
parts['word/document.xml']=etree.tostring(root,xml_declaration=True,encoding='UTF-8',standalone=True)
with ZipFile(f,'w',ZIP_DEFLATED) as z:
 for n,b in parts.items(): z.writestr(n,b)
with ZipFile(tmp/'article-before.docx') as a,ZipFile(f) as b:
 changed=[n for n in a.namelist() if a.read(n)!=b.read(n)]
 assert changed==['word/document.xml'],changed
audit={'changed_parts':changed,'media':24,'tables_xml':len(root.xpath('//w:tbl',namespaces=ns)),'paragraphs':len(ps),'article_sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'sources':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in base.glob('*.docx') if p.name in ['hd.docx','ĐÃ SỬA - NCKH.docx']}}
(tmp/'audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2))
print(json.dumps(audit,ensure_ascii=False))
