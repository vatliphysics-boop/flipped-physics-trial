from pathlib import Path
from zipfile import ZipFile
from lxml import etree as E
from copy import deepcopy
import re,json,os,hashlib
w=Path(__file__).parent
name='BAI_BAO_KHOA_HOC_CAP_NHAT_HOC_LIEU.docx'
src=Path('sao_luu_nckh/20261104')/name
assert hashlib.sha256(src.read_bytes()).hexdigest()=='cfb905cd7559457ac4496ecba44597cf67c5be6c2ee9fb25bb456aa8a2fd5826'
z=ZipFile(src);root=E.fromstring(z.read('word/document.xml'));ns=root.nsmap
pars=root.xpath('//w:p',namespaces=ns)
def wt(p):return p.xpath('.//w:t',namespaces=ns)
def txt(i):return ''.join(x.text or '' for x in wt(pars[i]))
log={}
def change(i,t,skip=0):
 p=pars[i];assert not p.xpath('.//m:oMath|.//w:drawing',namespaces=ns)
 els=wt(p)[skip:];a=txt(i);els[0].text=t
 for e in els[1:]:e.text=''
 log[i]={'before':a,'after':txt(i)}
def add(i,t):
 e=wt(pars[i])[-1];before=txt(i);e.text=(e.text or '')+' '+t;log[i]={'before':log.get(i,{}).get('before',before),'after':txt(i)}
change(0,'THIẾT KẾ VÀ KIỂM TRA HỌC LIỆU SỐ CÓ HỖ TRỢ TRÍ TUỆ NHÂN TẠO CHO DẠY HỌC ĐẢO NGƯỢC CHỦ ĐỀ “VẬT LÍ HẠT NHÂN” LỚP 12 THEO ĐỊNH HƯỚNG PHÁT TRIỂN NĂNG LỰC TỰ HỌC')
change(1,'Design and internal verification of AI-supported learning resources for Grade 12 nuclear physics in a flipped classroom to support self-study competence')
for i in (13,14,15):change(i,txt(i).replace('2026','…'))
change(24,' Nuclear physics requires students to connect representations of processes they cannot observe directly at school. This study examines the design of flipped learning tasks for lessons B21–B25 and the internal verification of the resources developed for those tasks.',1)
change(25,' On 4 November 2026, the catalogue contained 89 entries, including 17 simulation activities with a shared 3D rendering component. It included five interactive infographics and four practice papers. The question bank contained 212 questions. Three-phase worksheets, an analytic rubric and a planning workspace connect student products with teacher feedback. The system exports editable Word materials. Checks covered conservation in fission, radioactive decay and mass conventions for binding energy. All 62 automated software tests passed.',1)
change(26,' The student assistant uses a local generative model when available and rule-based responses as a fallback. Both require content review. Independent appraisal, verification of account-based submission and classroom data are needed to assess feasibility and change in self-study competence.',1)
change(29,' Chủ đề Vật lí hạt nhân đòi hỏi học sinh liên hệ các biểu diễn của những quá trình khó quan sát trực tiếp ở trường. Nghiên cứu xem xét thiết kế nhiệm vụ đảo ngược cho B21–B25 và kiểm tra nội bộ các học liệu phục vụ những nhiệm vụ đó.',1)
change(30,' Ngày 04/11/2026, danh mục có 89 mục, trong đó có 17 hoạt động mô phỏng dùng chung thành phần hiển thị 3D. Hệ thống có năm infographic tương tác, bốn đề tự luyện và ngân hàng 212 câu hỏi. Phiếu học tập ba pha, rubric và công cụ soạn kế hoạch gắn sản phẩm của học sinh với phản hồi của giáo viên, đồng thời hỗ trợ xuất tài liệu Word chỉnh sửa được. Kiểm tra nội bộ xét bảo toàn trong phân hạch, phân rã phóng xạ và quy ước khối lượng khi tính năng lượng liên kết. Cả 62 ca kiểm thử phần mềm tự động đều đạt.',1)
change(31,' Trợ lí học sinh dùng mô hình tạo sinh cục bộ khi dịch vụ sẵn sàng và phản hồi theo quy tắc khi cần dự phòng. Cả hai nhánh đều cần kiểm duyệt nội dung. Đánh giá tính khả thi và thay đổi năng lực tự học cần thẩm định độc lập, xác minh luồng nộp bài qua tài khoản và dữ liệu lớp học.',1)
add(34,'Trương Thị Phương Chi (2017) đã sử dụng E-learning và phiếu tự học cho chính nội dung hạt nhân nguyên tử lớp 12 theo lớp học đảo ngược. Câu hỏi tiếp nối là làm thế nào để nhận biết khi nào gợi ý AI giúp học sinh kiểm tra lập luận và khi nào nó cung cấp sẵn phần việc học sinh cần tự thực hiện.')
add(38,'Trong đề tài cấp Trường, phương pháp hỗn hợp dự kiến kết hợp khảo sát, thẩm định, bán thực nghiệm và phỏng vấn. Bài báo này chỉ báo cáo pha thiết kế và phép kiểm tra sản phẩm đã thực hiện.')
change(40,'Chương trình GDPT 2018 xác định tự chủ và tự học là năng lực chung. Khung self-regulated learning mô tả quá trình người học đặt mục tiêu, theo dõi và điều chỉnh chiến lược (Zimmerman, 2002). Đề tài dùng khung này để thiết kế nhiệm vụ gắn với biểu hiện tự học của chương trình Việt Nam. Chẳng hạn, với bài bán rã, sản phẩm có ý nghĩa khi học sinh ghi dự đoán, đối chiếu kết quả với nguồn và giải thích quyết định sửa bài. Trường nhập liệu trên giao diện tạo cơ hội ghi nhận các hành vi này. Việc xác định mức năng lực cần nhiệm vụ thực hành chung, tiêu chí chấm và minh chứng của từng học sinh (Liu et al., 2024).')
change(66,'Hồ sơ ngày 04–05/10/2026 ghi nhận kiểm tra dữ liệu, cấu trúc câu đúng–sai, công thức Word, chấm phần khách quan, phiếu ba pha và thời lượng kế hoạch. Bộ thử từng có 58 rồi 61 ca. Hồ sơ giao diện bao gồm kích thước 390, 900 và 1280 px ở các phiên khác nhau, thao tác nhập ma trận CSV, DOCX, XLSX và mở tệp Word tải từ giao diện. Các ảnh và tệp thử là sản phẩm của người kiểm tra. Nhận xét do AI đóng vai giáo viên được xếp vào rà soát nội bộ. Chưa có biên bản thẩm định độc lập của giáo viên hoặc chuyên gia.')
add(67,'Ngày 04/11/2026, nhóm đối chiếu danh mục chuẩn trong mã nguồn, đếm khóa hoạt động mô phỏng, đối chiếu hai tệp ngân hàng hợp nhất theo mã câu và chạy lại toàn bộ bộ kiểm thử hiện có. Mỗi mục danh mục, mỗi khóa hoạt động và mỗi câu hỏi là một đơn vị đếm khác nhau. Sổ biên tập nguồn dùng đơn vị bài tập gốc. Bảng 2 ghi riêng thời điểm kiểm tra để các ảnh chụp tháng 10 có thể được đọc đúng phiên bản.')
change(70,txt(70).replace('17 mô phỏng 3D','17 hoạt động mô phỏng có lớp hiển thị 3D chung'))
add(70,'Các hoạt động mô phỏng phân theo B21–B25 lần lượt là 3, 4, 5, 4 và 1. Năm infographic là nội dung đã nằm trong danh mục. Bốn đề tự luyện ứng với bốn mục kiểm tra.')
change(135,'Nút AI mở khung hỏi bài, cho học sinh chọn bài, chế độ giải thích hoặc gợi ý (Hình 11). Phiên bản ngày 04/11/2026 ưu tiên gọi mô hình cục bộ qua Ollama, với cấu hình mặc định Qwen3 4B Instruct (Ollama, n.d.). Ở nhánh tạo sinh, chế độ gợi ý dùng đoạn kiến thức của bài để đặt câu hỏi dẫn dắt. Khi dịch vụ không sẵn sàng hoặc lời gọi thất bại, hệ thống chọn phản hồi do người biên soạn viết theo quy tắc nhận dạng câu hỏi. Trạng thái sẵn sàng của khung chat có thể phản ánh một trong hai nhánh. Gemini và ChatGPT là các liên kết tới dịch vụ ngoài.')
change(138,'Hồ sơ ngày 05/10/2026 ghi nhận một lượt gợi ý đúng về hai chu kì bán rã và một lượt từ chối câu hỏi làm bánh trên giao diện thử. Máy thử xử lí một yêu cầu mô hình tại một thời điểm. Ở lần đối chiếu ngày 04/11/2026, phép gọi trực tiếp hàm dự phòng với câu “Làm bánh ngọt như thế nào?” trả về gợi ý tán xạ Rutherford do từ khóa “bánh ngọt” khớp quy tắc B21. Phép thử ở cấp hàm xác định một lỗi phân loại của nhánh dự phòng. Cần kiểm tra riêng hai nhánh với câu ngoài phạm vi và tình huống mất kết nối trước khi tổ chức học cả lớp. Học sinh cần ghi điều đã thử, kiểm tra gợi ý bằng tài liệu và giải thích bằng lời của mình.')
change(143,'Hồ sơ biên tập ngày 04/11/2026 ghi 232 mục nguồn thuộc Chương 4 của ba sách, gồm 207 mục được ghi đã đối chiếu và 25 mục chờ xử lí. Một mục có phương án nhiễu trùng nhau được giữ ở bản dự thảo. Hai tệp ngân hàng hợp nhất trong dự án có cùng nội dung với 212 mã câu duy nhất ở trạng thái sẵn sàng, gồm 72 câu nhiều lựa chọn, 12 câu đúng–sai, 19 câu trả lời số và 109 câu tự luận. Sáu ý đúng–sai chưa đủ cụm bốn ý nằm ngoài tập chọn đề. Những số liệu về biên tập mô tả hồ sơ của nhóm. Việc đếm lại bản ghi chỉ xác nhận quy mô ngân hàng ở phiên bản kiểm tra.')
change(165,txt(165).replace('Hồ sơ pháp lí chưa xác minh đầy đủ tình trạng áp dụng hiện tại của các công văn hướng dẫn; tỉ lệ mẫu không mặc định bắt buộc cho mọi đề tự luyện.','Cấu trúc bài dạy tham chiếu Công văn 5512, còn tỉ lệ trong phụ lục Công văn 7991 dùng làm ví dụ tham khảo. Khi triển khai tại trường, giáo viên đối chiếu kế hoạch giáo dục năm học và quy định đánh giá có hiệu lực.'))
change(184,'Các công cụ giáo viên được xây dựng theo yêu cầu thiết kế và hồ sơ rà soát nội bộ. Sự liên kết giữa học liệu, câu hỏi, phiếu, kế hoạch và tệp Word có thể giúp giáo viên chọn sản phẩm cần quan sát trước khi giao nhiệm vụ. Cần thu phản hồi của giáo viên và quan sát dạy học thực tế để biết sự liên kết này có hỗ trợ việc nhận xét bài làm hoặc giảm thời gian chuẩn bị hay không.')
change(186,'Bảng 2. Minh chứng kiểm tra nội bộ ngày 04–05/10/2026 và đối chiếu ngày 04/11/2026')
change(194,'Tháng 10: 61/61 ca đạt. Hồ sơ ghi build và TypeScript đạt, lint còn một cảnh báo, build còn cảnh báo truy vết tệp động. Ngày 04/11: chạy lại 62/62 ca đạt, không có ca bỏ qua.')
change(201,'Hồ sơ phát video thuộc hai lượt thử. Cần kiểm tra nội dung toàn bộ video, phụ đề và khả năng tải trên môi trường dạy học.')
change(203,'Hồ sơ tháng 10 ghi lỗi PGRST205 ở phiên trước và lỗi phân giải tên miền khi kiểm tra sau đó. Trạng thái hiện tại của luồng giao – nộp chưa được xác minh.')
change(204,'Cần môi trường thử có tài khoản cho hai vai để xác nhận tác vụ giao, nhận và xuất sản phẩm. Lỗi kết nối chỉ mô tả phiên kiểm tra tương ứng.')
change(207,'Rà soát bằng AI đóng vai người dùng là kiểm tra nội bộ. Chưa có phiếu thẩm định độc lập, dữ liệu người học hoặc kết quả thực nghiệm sư phạm.')
change(209,'Bảng 2 phân biệt việc mở lại sản phẩm lưu trên trình duyệt với việc giáo viên nhận bài qua lớp. Các vòng 4–7 cung cấp ca thử cho những tình huống cụ thể, vòng 8 cập nhật hồ sơ bài báo. Theo hồ sơ tháng 10, các điều kiện nghiệm thu toàn bộ hệ thống còn thiếu hai lượt dùng thử liên tiếp trên cùng phiên bản. Lần chạy bộ kiểm thử ngày 04/11 bổ sung bằng chứng về phần mềm. Luồng có tài khoản và việc sử dụng trong lớp vẫn cần đánh giá riêng.')
change(211,txt(211).replace('17 mô phỏng 3D','17 hoạt động mô phỏng có lớp hiển thị 3D').replace('213 câu','212 câu'))
change(212,'Điểm nối giữa học liệu và tự học thể hiện ở cách sử dụng sản phẩm của hoạt động trước cho quyết định tiếp theo. Ở B22, học sinh dự đoán số neutron, kiểm tra hai tổng bảo toàn rồi giải thích vì sao giữ hoặc sửa phương trình. Ở B23, em phân biệt giá trị kỳ vọng từ hàm mũ với số đếm của một lần quan sát. Bản giải thích trước và sau phản hồi giúp giáo viên xem xét cách kiểm chứng, trong khi chỉ một đáp số đúng cho biết ít hơn về chiến lược học. Công trình của Trương Thị Phương Chi (2017) đã kết nối phiếu tự học ở nhà với hoạt động trên lớp cho cùng chủ đề. Bài báo phát triển tiếp cách tổ chức đó bằng việc xác định điểm dùng gợi ý AI và yêu cầu học sinh giải trình bước kiểm tra. Kết quả không đồng nhất trong tổng quan của Liu et al. (2024) và van Alten et al. (2019) cho thấy vai trò của cách tổ chức nhiệm vụ cần được xem xét trong từng lớp.')
change(213,'Hai cơ chế hỗ trợ ở khung học sinh có giới hạn khác nhau. Mô hình tạo sinh có thể giải thích theo câu hỏi nhưng đầu ra cần kiểm chứng. Phản hồi theo quy tắc ổn định về văn bản, song từ khóa có thể dẫn tới nội dung không thích hợp như phép thử B21. Vì vậy, nghiên cứu trên lớp cần lưu nhánh trợ giúp khi xác định được, mức hỗ trợ và hành động tiếp theo của học sinh. Để phân biệt năng lực cá nhân với sản phẩm có trợ giúp, nhóm đề xuất bổ sung nhiệm vụ thực hành chung không dùng AI, chấm hai bản theo cùng rubric.')
change(214,'Bộ 62 ca kiểm thử chỉ bao phủ các tình huống đã viết. Việc rà nguồn còn 25 mục chờ, sáu ý đúng–sai chưa ghép đủ và các hình trắng đen chưa được phục dựng toàn bộ. Nhãn Bloom và rubric hiện là công cụ biên soạn nội bộ. Bản SGK được cung cấp là bản mẫu tháng 1/2024. Chưa có dữ liệu tải đồng thời cả lớp, kiểm thử đầy đủ luồng có tài khoản, thẩm định độc lập hoặc dữ liệu học sinh. Giới hạn này đặt ra hai việc riêng: hoàn thiện điều kiện vận hành và kiểm tra giá trị sư phạm của nhiệm vụ.')
change(215,'Giai đoạn tiếp theo dự kiến thẩm định chuyên môn, thử nhỏ và tổ chức bán thực nghiệm tiền kiểm – hậu kiểm theo đề cương. Thuyết minh ghi một trường với hai lớp ở mục 10 và hai lớp cho mỗi điều kiện ở mục 12.4. Số lớp, địa bàn và lịch triển khai cần được xác nhận trước tuyển mẫu. Nếu chỉ có một lớp mỗi điều kiện, thay đổi điểm được diễn giải ở mức thăm dò do đặc trưng lớp và tác động can thiệp khó tách biệt. Trong phạm vi hai câu hỏi của bài báo, kết quả hiện có là cấu trúc kho, nhiệm vụ và các bằng chứng kiểm tra bản mẫu trước sử dụng.')
change(217,'Theo phân công của đề tài, Võ Đoàn Đăng Khôi là chủ nhiệm, phụ trách tổ chức nghiên cứu và phát triển bộ học liệu. Nguyễn Bảo Thy được phân công phân tích chương trình và ma trận dạy học. Bùi Ngọc Xuân Phương được phân công thiết kế học liệu trực quan và quản lí phiên bản. Danh mục công việc từng tác giả thực tế đã hoàn thành cần được cả nhóm xác nhận trước khi gửi công bố.')
change(219,'Codex (OpenAI) được sử dụng để hỗ trợ viết mã, biên tập ngôn ngữ, đối chiếu tài liệu và định dạng bản thảo. Trong hồ sơ thử, mô hình Qwen3 4B Instruct qua Ollama hỗ trợ tạo bản nháp. Phiên bản website được kiểm kê có cả nhánh phản hồi học sinh theo quy tắc. Nhóm tác giả chịu trách nhiệm kiểm tra nội dung, số liệu và trích dẫn trước khi gửi công bố. Các liên kết dịch vụ ngoài được mô tả theo đúng vai trò trong giao diện.')
change(220,txt(220).replace('Mô hình đang dùng:','Hồ sơ máy thử tháng 10 ghi mô hình'))
# Giữ cách trình bày các run chứa tên tạp chí in nghiêng và các công thức gốc.
for i in range(228):
 if pars[i].xpath('.//m:oMath',namespaces=ns):continue
 for el in wt(pars[i]):
  old=el.text or '';new=old
  for a,b in [('Huỳnh et al.','Huỳnh Thị Yến Nhi và cộng sự'),('Vũ et al.','Vũ Văn Hùng và cộng sự'),('Mai et al.','Mai Hoàng Phương và cộng sự'),('Liu et al.','Liu và cộng sự'),('Roy et al.','Roy và cộng sự'),('van Alten et al.','van Alten và cộng sự')]:
   new=new.replace(a,b)
  if new!=old:
   before=txt(i);el.text=new;log[i]={'before':log.get(i,{}).get('before',before),'after':txt(i)}
for i,new in [(233,'Huỳnh Thị Yến Nhi, Nguyễn Thị Thu Hương, & Lê Anh Đức.'),(237,'Mai Hoàng Phương, Hồ Văn Tài, Phan Thanh Thúy, Phạm Thụy Phương Uyên, & Nguyễn Thị Mỹ Duyên.'),(246,'Vũ Văn Hùng, Nguyễn Văn Biên, Trần Ngọc Chất, Phạm Kim Chung, Đặng Thanh Hải, Tưởng Duy Hải, & Bùi Gia Thịnh.')]:
 el=wt(pars[i])[0];before=txt(i);el.text=new+' ('+el.text.split(' (',1)[1];log[i]={'before':before,'after':txt(i)}
add(230,'https://tunghia.quangngai.edu.vn/tai-nguyen/cac-phu-luc-kem-theo-cong-van-5512-bgddt-gdtrh-ngay-18-12-2020-cua-bo-giao-duc-va-dao-tao')
add(231,'https://pgddtcumgar.edu.vn/wp-content/uploads/2024/12/Cong-van-7991-huong-dan-KTDGDK.pdf')
# Thêm một tài liệu đã dẫn, giữ dạng mục tài liệu tham khảo đang dùng.
ref=next(s for s in (w/'refs.txt').read_text().splitlines() if s.startswith('Trương'))
newp=deepcopy(pars[244]);els=wt(newp);a,b,c=ref.split('*');els[0].text=a;els[1].text=b;els[2].text=c.split(' https://')[0]+'. ';els[2].text=els[2].text.replace(']..','].')
for el in els[3:]:el.text=''
# URL gắn dưới dạng hyperlink không ngắt dòng dài trong trang.
link=E.SubElement(newp,'{'+ns['w']+'}fldSimple');link.set('{'+ns['w']+'}instr','HYPERLINK "https://'+ref.split(' https://')[1]+'"')
r=E.SubElement(link,'{'+ns['w']+'}r');t=E.SubElement(r,'{'+ns['w']+'}t');t.text='Bản luận án trực tuyến'
pars[244].addprevious(newp)
xml=E.tostring(root,encoding='UTF-8',xml_declaration=True,standalone=True)
types=E.fromstring(z.read('[Content_Types].xml'))
jpeg_type=E.Element('{'+types.nsmap[None]+'}Default',Extension='jpg',ContentType='image/jpeg')
types.insert(0,jpeg_type)
type_xml=E.tostring(types,encoding='UTF-8',xml_declaration=True,standalone=True)
out=w/'article-edited.docx'
with ZipFile(out,'w') as zz:
 for ent in z.infolist():zz.writestr(ent,xml if ent.filename=='word/document.xml' else type_xml if ent.filename=='[Content_Types].xml' else z.read(ent.filename))
(w/'article-changes.json').write_text(json.dumps(log,ensure_ascii=False,indent=2))
os.replace(out,name)
print('Changed paragraphs',len(log),'+ one reference. JPEG media type repaired; other ZIP parts preserved.')
