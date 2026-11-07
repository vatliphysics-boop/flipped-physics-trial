from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from copy import deepcopy
from lxml import etree as E
from PIL import Image
from docx import Document
import hashlib,json,shutil
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'docs/templates/BAO_KHOA_HOC_DANG_KHOI.docx'
OUTPUT=ROOT/'BAI_BAO_KHOA_HOC_CAP_NHAT_HOC_LIEU.docx'
EXPECTED='fd7df26a7999d65f72514e259668101f7eb96664f8cb3368cd9c07b9ddd346a6'
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==EXPECTED
NS={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships','wp':'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing','a':'http://schemas.openxmlformats.org/drawingml/2006/main','pic':'http://schemas.openxmlformats.org/drawingml/2006/picture'}
def q(key):prefix,name=key.split(':');return '{'+NS[prefix]+'}'+name
with ZipFile(SOURCE) as archive:
 parts={name:archive.read(name) for name in archive.namelist()}
root=E.fromstring(parts['word/document.xml']);body=root.find('w:body',NS);ps=body.findall('w:p',NS)
# Citation wording is reused as content only; all page/style structures come from SOURCE.
reference_runs=json.loads((ROOT/'docs/references/REPORT_REFERENCE_RUNS.json').read_text())
assert len(reference_runs)==20

def remove_marks(node):
 for el in node.xpath('.//w:shd|.//w:highlight',namespaces=NS):el.getparent().remove(el)
 for el in node.xpath('.//w:color',namespaces=NS):el.set(q('w:val'),'000000')

def fill(p,text,segments=None):
 props=deepcopy(p.find('w:pPr',NS))
 runs=p.findall('w:r',NS);rp=deepcopy(runs[0].find('w:rPr',NS)) if runs else None
 # Editable plain prose slots preserve paragraph/run properties, bookmarks and unrelated nodes.
 for el in list(p):
  if E.QName(el).localname in ['r','hyperlink']:p.remove(el)
 for text,italic in segments or [(text,None)]:
  r=E.SubElement(p,q('w:r'))
  if rp is not None:r.append(deepcopy(rp))
  if italic is not None:
   rpr=r.find('w:rPr',NS)
   if rpr is None:rpr=E.SubElement(r,q('w:rPr'))
   for el in rpr.findall('w:i',NS)+rpr.findall('w:iCs',NS):rpr.remove(el)
   if italic:E.SubElement(rpr,q('w:i'))
  t=E.SubElement(r,q('w:t'));t.set('{http://www.w3.org/XML/1998/namespace}space','preserve');t.text=text
 remove_marks(p)
 return p

def clone_p(index,text):return fill(deepcopy(ps[index]),text)
def keep(p):
 pr=p.find('w:pPr',NS)
 if pr is None:pr=E.Element(q('w:pPr'));p.insert(0,pr)
 if pr.find('w:keepNext',NS) is None:E.SubElement(pr,q('w:keepNext'))

# Four main sections and all author/meta slots remain in the source positions.
TITLE='Xây dựng và sử dụng học liệu số có hỗ trợ trí tuệ nhân tạo trong tổ chức dạy học theo mô hình lớp học đảo ngược nhằm phát triển năng lực tự học của học sinh qua chủ đề “Vật lí hạt nhân” môn Vật lí lớp 12 ở trường THPT'
fill(ps[0], TITLE.upper())
fill(ps[1], 'Developing and using AI-supported digital learning resources in flipped classroom teaching to develop students’ self-study competence through the Nuclear Physics topic in Grade 12 physics at upper secondary schools')

fill(ps[3],'Chương trình giáo dục phổ thông môn Vật lí đặt yêu cầu phát triển năng lực vật lí và năng lực tự chủ, tự học (Bộ Giáo dục và Đào tạo, 2018). Chủ đề Vật lí hạt nhân đòi hỏi liên hệ kí hiệu, phương trình, đồ thị và ứng dụng của những quá trình khó quan sát trực tiếp. Huỳnh et al. (2026) phân tích khả năng tích hợp lịch sử vật lí nguyên tử và hạt nhân vào hoạt động dạy học; nguồn này gợi ý lựa chọn tình huống và biểu diễn, chưa chứng minh hiệu quả của website. Nghiên cứu giới hạn ở Chương 4, các bài B21–B25 của sách Vật lí 12, bộ Kết nối tri thức với cuộc sống (Vũ et al., 2024), với nhiệm vụ trước, trong và sau giờ học.')
fill(ps[9],'Tư liệu gồm chương trình môn Vật lí, SGK và sách bài tập được cung cấp, yêu cầu thiết kế học liệu, nghiên cứu về lớp học đảo ngược và nguồn kiến thức vật lí. Phụ lục IV Công văn 5512 được dùng để xác định cấu trúc kế hoạch bài dạy; phụ lục Công văn 7991 được dùng để tham khảo ma trận và bản đặc tả (Bộ Giáo dục và Đào tạo, 2020, 2024). Bản SGK ghi “bản mẫu tháng 1/2024”, cần đối chiếu sách dùng tại lớp. Đơn vị phân tích là mục học liệu, hoạt động, trường sản phẩm và chức năng phần mềm. Báo cáo chưa có mẫu học sinh; dữ liệu trích xuất các chương khác được lưu để biên tập, không mở rộng phạm vi nghiên cứu.')
fill(ps[14],'Mỗi hoạt động có mục tiêu, nội dung, sản phẩm và cách tổ chức, phân rõ việc giáo viên và học sinh. Bốn loại hoạt động gồm mở đầu, hình thành kiến thức, luyện tập và vận dụng theo Phụ lục IV; đây là loại hoạt động, không phải ba pha học đảo ngược (Bộ Giáo dục và Đào tạo, 2020). Ba pha được dùng để sắp thời điểm: chuẩn bị trước giờ, trao đổi và thao tác trong giờ, sửa giải thích và tự kiểm tra sau giờ. Mỗi hoạt động ghi các bước giao nhiệm vụ, thực hiện, báo cáo/thảo luận và kết luận. Học liệu trực quan đi kèm yêu cầu quan sát và giải thích; mở video hoặc đổi góc nhìn chưa được xem là sản phẩm học tập.')
fill(ps[15],'Kiến tạo học liệu: mô phỏng, hình tương tác, video có nhiệm vụ, bản ghi, đề tự luyện và mẫu kế hoạch được triển khai trên web. AI hỗ trợ dự thảo nội dung, câu hỏi và mã; bản mẫu còn có khung hỏi bài cho học sinh và công cụ xử lí học liệu cho giáo viên. Mỗi kết quả AI được xem là bản nháp để kiểm tra, không tự công bố hoặc quyết định điểm chính thức. Công thức, số liệu và nguồn dẫn do người thiết kế, giáo viên đối chiếu trước khi sử dụng (Miao & Holmes, 2023).')
fill(ps[18],'Kiểm tra nội bộ gồm đối chiếu nguồn, tính lại trường hợp định lượng và 58 ca tự động về dữ liệu, định dạng đúng–sai, công thức Word, chấm phần khách quan, phiếu ba phần và thời lượng kế hoạch. Thao tác trình duyệt đã xét màn hình 900 px, 390 px ở phiên trước và 1280 px ở phiên cập nhật. Ma trận CSV, DOCX và XLSX được thử đọc; tệp đề Word được tải từ giao diện, so sánh nội dung tải và kết xuất thành trang để xem bố cục. Ảnh ngày 04–05/10/2026 và tham số thử không phải bài làm học sinh. Kiểm tra kĩ thuật không xác lập giá trị công cụ đánh giá hoặc hiệu quả sư phạm.')
fill(ps[91],'Nghiên cứu cụ thể hóa phân tích, thiết kế và kiến tạo học liệu số có hỗ trợ AI cho B21–B25 theo lớp học đảo ngược. Sản phẩm gồm kho truy cập theo bài, 17 mô phỏng 3D, năm infographic, video có nhiệm vụ, bản ghi quan sát và các công cụ giáo viên. Ngân hàng 213 câu giữ dữ kiện từ ba sách; ma trận phối hợp bốn loại câu trong cùng bài và xuất Word. Phiếu có hướng dẫn, nhiệm vụ và rubrics; kế hoạch ghi mục tiêu, hai vai, sản phẩm và bốn bước tổ chức. Đây là kết quả thiết kế và kiểm tra nội bộ trước sử dụng.')
fill(ps[93],'AI hỗ trợ cả khâu kiến tạo học liệu và tạo bản nháp trong giao diện sử dụng. Khung học sinh đọc lí thuyết công khai; công cụ giáo viên xử lí văn bản và đề xuất nhiệm vụ. Các chức năng này chưa tự theo dõi hoặc cá nhân hóa quá trình học của từng học sinh. Việc xuất hiện bản nháp trên giao diện chưa chứng minh năng lực tự học đã được phát triển; kết luận về tác động cần dữ liệu trên lớp và công cụ đánh giá phù hợp.')
fill(ps[94],'Nghiên cứu chưa có mẫu học sinh, thẩm định độc lập hoặc kiểm thử đầy đủ luồng giao, nộp qua tài khoản. 58 ca phần mềm và các lượt thử chỉ xác nhận tình huống đã xét. Ngân hàng đã đối chiếu 208 mục gốc; 24 mục có vấn đề nguồn và sáu ý đúng–sai chưa ghép đủ bốn ý được giữ ngoài tập chọn đề. Nhãn Bloom và rubrics là phân loại, tiêu chí nội bộ; chưa được kiểm định độ tin cậy. Chưa phục dựng toàn bộ hình trắng đen, chưa kiểm thử tải AI đồng thời cả lớp. Bản SGK ghi “bản mẫu tháng 1/2024”. Cần thẩm định chuyên môn và thử dùng với lớp trước khi đánh giá tác động.')
fill(ps[99],'Codex (OpenAI) được sử dụng để hỗ trợ viết mã, biên tập ngôn ngữ và định dạng bản thảo. Trong bản mẫu web, Qwen3 4B Instruct chạy cục bộ qua Ollama để tạo bản nháp giải thích, nhiệm vụ và học liệu. Các tác giả chịu trách nhiệm kiểm tra và chỉnh sửa nội dung, số liệu, trích dẫn trước khi gửi công bố. Công cụ được mô tả theo hồ sơ thao tác; việc có liên kết Gemini, ChatGPT hoặc NotebookLM không được xem là bằng chứng đã dùng các dịch vụ đó để tạo toàn bộ học liệu.')
fill(ps[101],'Mô hình đang dùng: qwen3:4b-instruct-2507-q4_K_M; bộ chạy Ollama 0.35.1 trên máy thử 8 GB RAM. Môi trường hỗ trợ soạn và lập trình: Codex trên máy tính. Hồ sơ của bản mẫu không xác lập phiên bản mô hình ChatGPT hoặc Gemini đã dùng bởi các tác giả ngoài các thao tác được báo cáo.')
fill(ps[104],'Các tác giả cần xác nhận tuyên bố về xung đột lợi ích trước khi gửi công bố.')
fill(ps[106],'Thông tin tài trợ, cơ quan cấp kinh phí và mã số đề tài cần được các tác giả xác nhận trước khi gửi công bố.')
fill(ps[107],'')
for p in ps[90:110]:remove_marks(p)
fill(ps[22], 'Kho Chương 4 tập hợp 89 mục: 17 mô phỏng 3D, 17 mục ảnh/sơ đồ, năm minh họa động, 11 mục video, 18 tài liệu/phiếu, 17 câu hỏi/hoạt động nhóm và bốn đề tự luyện. Trong số ảnh có 11 hình câu hỏi để dùng trong đề và phiếu. Đây là số mục danh mục, có nguồn ngoài hoặc mục được dùng lại; không phải 89 nội dung độc lập. Menu Chương trình Vật lí 12 xổ bốn chương, nhưng học liệu nghiên cứu chỉ triển khai B21–B25. Bộ lọc cho phép chọn bài, loại học liệu và mục đích sử dụng (Hình 1).')
fill(ps[27], 'Bishop và Verleger (2013) mô tả lớp học đảo ngược qua chuẩn bị ngoài lớp và giải quyết vấn đề tích cực theo nhóm trong lớp. Bản mẫu cụ thể hóa bốn lựa chọn tổ chức: học trước rồi luyện tập; minh họa rồi thực hành; thảo luận; làm việc nhóm (Hình 2). Đây là lựa chọn thiết kế để giáo viên phối hợp nhiệm vụ, không phải phân loại chính thức hoặc bốn mô hình đã được nghiên cứu này kiểm chứng. Học hoàn toàn trực tuyến và học sinh tạo video chưa được triển khai đầy đủ.')

for t in root.xpath('//w:body//w:t',namespaces=NS):
 if t.text:t.text=t.text.replace('Vũ Văn Hùng và cộng sự','Vũ et al.').replace('Mai Hoàng Phương và cộng sự','Mai et al.')
# Bilingual abstract stays inside the existing merged table cells.
abstracts={
 'Context:':'Context: Nuclear physics requires representations of processes that cannot be observed directly at school. This study describes theory-informed analysis, design and construction of AI-supported resources for lessons B21–B25 in a flipped classroom, with internal checks before use.',
 'Result:':'Result: The prototype contains 89 resource entries, 17 interactive 3D simulations, five interactive infographics and four practice papers. The source-based bank publishes 213 questions; worksheets include instructions, three-phase tasks and an analytic rubric. The guided planning workspace separates teacher and student actions. A unified question bank exports papers, answer guides and specifications to editable Word; AI selects authored support prompts. Checks cover fission conservation, radioactive decay and binding energy mass conventions; 58 software tests passed.',
 'Discussion:':'Discussion: Results concern design products and internal verification. AI drafts still require content review. Account-based assignment and submission workflows need further verification. Independent appraisal and classroom research are needed before drawing conclusions about teaching effectiveness or self-study competence.',
 'Bối cảnh:':'Bối cảnh: Chủ đề Vật lí hạt nhân cần biểu diễn các quá trình không thể quan sát trực tiếp ở trường phổ thông. Nghiên cứu trình bày quy trình phân tích, thiết kế, kiến tạo học liệu có hỗ trợ AI cho B21–B25 theo mô hình lớp học đảo ngược, kèm kiểm tra nội bộ trước sử dụng.',
 'Kết quả:':'Kết quả: Bản mẫu có 89 mục học liệu, 17 mô phỏng 3D, năm infographic tương tác và bốn đề tự luyện. Ngân hàng từ ba sách công bố 213 câu; phiếu gồm hướng dẫn, nhiệm vụ ba pha và rubrics; quy trình soạn kế hoạch phân rõ hai vai. Ngân hàng đề thống nhất xuất đề, đáp án và bản đặc tả Word; AI chọn câu hỏi hỗ trợ đã biên soạn. Kiểm tra xem xét bảo toàn trong phân hạch, bán rã và quy ước khối lượng; 58 ca phần mềm đạt.',
 'Bàn luận:':'Bàn luận: Kết quả phản ánh sản phẩm thiết kế và kiểm tra nội bộ. Bản nháp AI vẫn cần rà soát kiến thức; luồng giao, nộp qua tài khoản cần kiểm thử thêm. Cần thẩm định độc lập và nghiên cứu trên lớp trước khi kết luận về hiệu quả dạy học hoặc năng lực tự học.'}
for p in root.xpath('./w:body/w:tbl[1]//w:p',namespaces=NS):
 txt=''.join(p.xpath('.//w:t/text()',namespaces=NS))
 for prefix,text in abstracts.items():
  if txt.startswith(prefix):
   label,rest=text.split(':',1);fill(p,'',[(label+':',False),(rest,False)])
   first=p.find('w:r',NS);pr=first.find('w:rPr',NS)
   if pr is None:pr=E.SubElement(first,q('w:rPr'))
   E.SubElement(pr,q('w:b'))
   for r in p.findall('w:r',NS)[1:]:
    rp=r.find('w:rPr',NS)
    if rp is not None:
     for el in rp.findall('w:b',NS)+rp.findall('w:bCs',NS):rp.remove(el)
# Source tables keep original grid and typography.
for t in root.xpath('./w:body/w:tbl[3]//w:t',namespaces=NS):
 if t.text:t.text=t.text.replace('23/23','58/58').replace('Chụp 10 giao diện','Chụp 24 giao diện').replace('Chưa thử phát tất cả video; thao tác tải Blob chưa được xác nhận trên trình duyệt kiểm tra.','Chưa thử phát tất cả video hoặc tải tệp trên một máy chủ triển khai khác.').replace('API cơ sở dữ liệu trả mã PGRST205 ở các bảng lộ trình, tiến độ và kế hoạch.','Phiên trước: các bảng lộ trình, tiến độ, kế hoạch trả mã PGRST205. Chưa thử lại luồng tài khoản.')

rels=E.fromstring(parts['word/_rels/document.xml.rels']);RELNS='http://schemas.openxmlformats.org/package/2006/relationships'
next_id=max([int(x.get('id')) for x in root.xpath('//wp:docPr',namespaces=NS)]+[10])+1
added={}
def figure(file,number,caption):
 global next_id
 path=ROOT/'docs/article-figures'/file;added['word/media/'+file]=path.read_bytes()
 rid='rIdAI'+str(number)
 E.SubElement(rels,'{'+RELNS+'}Relationship',Id=rid,Type=NS['r']+'/image',Target='media/'+file)
 p=deepcopy(ps[23]);keep(p)
 w,h=Image.open(path).size;cx=4860000;cy=round(cx*h/w)
 for blip in p.xpath('.//a:blip',namespaces=NS):blip.set(q('r:embed'),rid)
 for node in p.xpath('.//wp:extent|.//a:xfrm/a:ext',namespaces=NS):node.set('cx',str(cx));node.set('cy',str(cy))
 for node in p.xpath('.//wp:docPr',namespaces=NS):node.set('id',str(next_id));node.set('name','Hình '+str(number));node.set('descr',caption)
 for node in p.xpath('.//pic:cNvPr',namespaces=NS):node.set('id',str(next_id));node.set('name',file)
 next_id+=1
 return [p,fill(deepcopy(ps[24]),'',[(f'Hình {number}. ',True),(caption,False)])]
insert=[]
def para(text):insert.append(clone_p(3,text))
def subheading(text):insert.append(clone_p(34,text))
def shot(file,number,caption):insert.extend(figure(file,number,caption))
subheading('3.2.9. Khung AI hỗ trợ học sinh trong trang học tập')
para('Nút AI tròn mở khung chat ở góc phải để học sinh chọn bài, hỏi giải thích hoặc nhận gợi ý (Hình 11). Qwen3 4B Instruct chạy qua Ollama trên máy chủ của hệ thống (Ollama, n.d.). Chế độ gợi ý chọn mã đoạn lí thuyết rồi đặt câu hỏi dẫn dắt; hệ thống trích nguyên văn đoạn đã chọn. Chế độ giải thích tạo bản nháp từ kiến thức công khai, không đọc điểm hoặc đáp án bài kiểm tra của lớp. Liên kết Gemini và ChatGPT mở dịch vụ ngoài bằng tài khoản của người dùng; không được coi là mô hình chạy trong khung chat.')
shot('11-ai-cuc-bo.png',11,'Khung hỏi bài B23 trong lượt thử nội bộ; câu hỏi do người kiểm tra nhập.')
para('Trong lượt kiểm tra ngày 05/10/2026, câu hỏi về hai chu kì bán rã ở chế độ gợi ý nhận đoạn N(t) = N₀2⁻ᵗ/ᵀ và câu hỏi dẫn dắt. Kết quả này xác nhận một lượt hoạt động, chưa xác lập độ chính xác trên toàn bộ câu hỏi. Dịch vụ giới hạn một yêu cầu xử lí đồng thời trên máy thử; chưa kiểm chứng đáp ứng cả lớp. Khi dịch vụ không có kết nối, phần công cụ AI giáo viên được bỏ khỏi giao diện; khi có kết nối, công cụ chỉ được tải lúc người dùng mở.')
subheading('3.2.10. Ngân hàng câu hỏi từ ba sách và tạo đề theo ma trận')
para('Roy et al. (2024) xem xét ChatGPT trong chuẩn bị bài của giáo viên khoa học Year 7–8 ở Anh; bối cảnh đó không xác nhận hiệu quả của website này. Miao và Cukurova (2024) nhấn mạnh năng lực lựa chọn và đánh giá công cụ của giáo viên. Bản mẫu tổ chức ba công việc: ngân hàng đề, phiếu ba pha và chuẩn bị giờ học. Ngân hàng thống nhất có năm mục: trắc nghiệm, đúng–sai, trả lời ngắn, tự luận và tải ma trận/xuất Word (Hình 12).')
shot('12-ngan-hang-sach.jpg',12,'Ngân hàng dùng câu hỏi chữ và công thức LaTeX, số thứ tự câu; hình gốc bổ sung cho câu hỏi.')
para('Phạm vi biên tập có 232 mục bài tập/hoạt động của Chương 4 trong ba sách được cung cấp. Trong đó, 208 mục gốc được đối chiếu phần chữ, công thức và hướng dẫn trả lời; 24 mục có dữ kiện, bản quét hoặc yêu cầu chưa đủ rõ được giữ ngoài tập chọn đề. Sau tách và ghép bảng đúng–sai theo cùng bài/chủ đề, ngân hàng công bố 213 câu: 73 trắc nghiệm, 12 đúng–sai, 19 trả lời ngắn và 109 tự luận. Đây là số câu của sản phẩm, không phải kết quả đo trên học sinh. Sáu ý đúng–sai còn dư được lưu để biên tập, không tự thêm ý mới cho đủ câu.')
para('Mỗi câu đúng–sai có đúng bốn ý a–d, giữ đáp án theo từng ý (Hình 13). Nhãn Bloom được phân loại theo thao tác nhận thức cần thực hiện, tham chiếu hệ phân loại sửa đổi (Krathwohl, 2002). Sáu mức Bloom được phân biệt với ba mức Biết–Hiểu–Vận dụng trong ma trận. Nhãn và căn cứ phân loại do người biên soạn rà soát nội bộ; chưa có thẩm định độc lập. Ảnh câu hỏi được cắt từ sách, không dùng ảnh quét thay phần dẫn. Dữ liệu giữ 25 hình gốc khác nhau gắn với 33 câu đã công bố; không tuyên bố đã xử lí mọi hình trong toàn bộ ba sách.')
shot('18-dung-sai-bon-y.jpg',13,'Câu đúng–sai gồm bốn ý với công thức dạng chữ; nguồn gốc được giữ trong dữ liệu biên tập.')
para('Giáo viên nhập CSV, JSON hoặc bảng DOCX/XLSX có năm cột bắt buộc: bài/chủ đề, loại câu, mức độ, số câu và điểm mỗi câu. Trường chương, đơn vị kiến thức, yêu cầu cần đạt và năng lực bổ sung bản đặc tả. Mỗi bài được hiện thành một nhóm với bốn ô loại câu; giáo viên có thể lấy trắc nghiệm và tự luận cùng B21, đồng thời thêm các mức độ trong từng loại (Hình 14). Bộ chọn không lặp câu và báo dòng thiếu nguồn câu. Khi đổi ma trận, tập câu và xác nhận cũ được bỏ để tránh xuất đề theo cấu hình trước.')
shot('20-ma-tran-bon-loai.jpg',14,'Cùng bài B21 chọn hai câu trắc nghiệm và một câu tự luận; các loại còn lại có thể thêm riêng.')
para('Phân bố điểm theo loại câu và mức độ được tính từ ma trận hiện tại. Mẫu 30–20–20–30% theo loại câu và 40–30–30% theo mức độ trong phụ lục Công văn 7991 là căn cứ tham khảo để giáo viên đối chiếu kế hoạch kiểm tra của trường, không phải chứng nhận chất lượng đề (Bộ Giáo dục và Đào tạo, 2024). Thêm câu làm thay đổi tổng điểm; giáo viên phải điều chỉnh điểm từng dòng. Ví dụ phối hợp trong Hình 14 là thao tác thử, chưa phải đề định kì đã thẩm định.')
subheading('3.2.11. Phiếu học tập có hướng dẫn, nhiệm vụ và rubrics')
para('Công cụ phiếu dùng ba bước: chọn bài/mẫu, chỉnh phiếu, xem trước/xuất Word (Hình 15). Mỗi mẫu chọn ba câu gốc cùng bài, chia trước, trong và sau giờ học. Giáo viên có thể đổi pha, bỏ hoặc thêm câu, tối đa chín câu khác nhau; khi thay câu cần chỉnh hướng dẫn và sản phẩm. Hệ thống kiểm tra đủ ba pha, yêu cầu cần đạt và các trường thời gian, mục tiêu, sản phẩm, tiêu chí trước khi xuất.')
shot('14-phieu-ba-pha-moi.jpg',15,'Bắt đầu với mẫu B23; các bước biên soạn và mục tiêu được hiện ngay trong công cụ.')
para('Tệp học sinh có ba phần. Phần 1 hướng dẫn cách dùng, mục tiêu, thời lượng, sản phẩm và đường dẫn học liệu (Hình 16). Phần 2 ghi việc cần làm theo thứ tự, câu hỏi và chỗ viết lời giải, điều chưa hiểu hoặc điều đã sửa. Phần 3 là rubrics để học sinh tự nhận xét và giáo viên đối chiếu bài làm. Các phần này giúp người học biết phải làm gì, dùng học liệu nào, nộp sản phẩm gì; sự rõ ràng của cấu trúc chưa chứng minh kết quả học tập đã cải thiện.')
shot('17-huong-dan-phieu.jpg',16,'Phần hướng dẫn B23: trước giờ 15 phút, trong giờ 40 phút, sau giờ 15 phút; mỗi pha có sản phẩm và học liệu.')
para('Ở mẫu B21, nhiệm vụ yêu cầu xác định nguồn alpha, lá vàng và màn quan sát, rồi giải thích bằng chứng về hạt nhân. Câu hỏi được giữ dưới dạng chữ, kèm hình bố trí thí nghiệm 21.2 cắt từ SGK (Hình 17). Tệp Word giữ nguyên hình, kí hiệu và câu hỏi; bản dành cho học sinh có chỗ làm bài, bản hướng dẫn giáo viên chứa đáp án và lưu ý. Hình trắng đen trong sách được giữ nguyên khi chưa có bản phục dựng đã đối chiếu.')
shot('18-phieu-cau-hoi-hinh-sgk.jpg',17,'Nhiệm vụ B21 và hình bố trí thí nghiệm gốc; ảnh bổ sung cho câu hỏi, không thay câu hỏi bằng ảnh.')
para('Rubrics có bốn tiêu chí: chuẩn bị trước giờ; giải thích và dùng dữ kiện; vận dụng sau giờ; tự kiểm tra và điều chỉnh. Mỗi tiêu chí có bốn mức mô tả hành vi/sản phẩm (Hình 18). Học sinh tự chọn mức; giáo viên dùng lời giải và phần tự kiểm tra để nhận xét, ghi nội dung cần sửa và cách sửa. Rubrics được xây dựng cho phiếu, chưa phải thang đo năng lực tự học đã kiểm định. Phiếu dùng cho học tập và đánh giá thường xuyên bằng nhận xét; khi dùng kiểm tra định kì cần bổ sung ma trận, bản đặc tả, đề và hướng dẫn chấm.')
shot('19-rubrics-phieu.jpg',18,'Bốn tiêu chí, bốn mức của rubrics; có phần đối chiếu tự đánh giá học sinh và nhận xét giáo viên.')
subheading('3.2.12. Kế hoạch bài dạy gắn với nhiệm vụ trong phiếu')
para('Chuẩn bị giờ học đi theo ba bước: chọn bài và điều kiện lớp; chỉnh hoạt động; kiểm tra và xuất kế hoạch. Giáo viên chọn lớp, thời gian trên lớp 45 hoặc 90 phút và thiết bị; thời gian tự học được tính riêng (Hình 19). Các yêu cầu cần đạt được diễn giải từ chương trình Vật lí theo Thông tư 32/2018, trang 27–28; chọn yêu cầu phù hợp với nội dung thực hiện (Hình 20). Ví dụ bán rã chọn định nghĩa T và vận dụng luật phân rã, không tự nhận là bao phủ toàn bộ B23.')
shot('23-ke-hoach-dieu-kien.jpg',19,'Chọn bài, lớp, thời gian và thiết bị trước khi biên soạn hoạt động.')
shot('24-ke-hoach-yeu-cau.jpg',20,'Chọn yêu cầu cần đạt phù hợp nội dung bán rã; các yêu cầu khác của chủ đề vẫn được liệt kê để giáo viên lựa chọn.')
para('Kế hoạch mẫu B23 dùng cùng ba nhiệm vụ của phiếu. Trước giờ, học sinh định nghĩa T và ghi điều chưa hiểu. Trên lớp gồm mở đầu 5 phút, xử lí câu 2 bằng mô phỏng và trao đổi 30 phút, hoàn thiện lời giải cá nhân 10 phút. Sau giờ, học sinh giải câu 3 và tự đánh giá 15 phút. Ví dụ câu 2: O-15 sau 244 s đã phân rã 75%, nên còn 25% và 244 = 2T, suy ra T = 122 s. Hoạt động thể hiện riêng việc giáo viên, học sinh, sản phẩm, tiêu chí và học liệu (Hình 21).')
shot('15-chuan-bi-gio-hoc-moi.jpg',21,'Giáo viên tổ chức và hỏi căn cứ; học sinh dùng mô phỏng, phân biệt phần còn lại với phần đã phân rã, hoàn thiện lời giải.')
para('Word kế hoạch có I. Mục tiêu, II. Thiết bị dạy học và học liệu, III. Tiến trình, IV. Điều chỉnh sau bài dạy (Hình 22). Tiến trình giữ ba thời điểm học đảo ngược; mỗi hoạt động vẫn có loại mở đầu, hình thành kiến thức, luyện tập hoặc vận dụng và các mục mục tiêu, nội dung, sản phẩm, tổ chức. Mục tổ chức ghi giao nhiệm vụ, thực hiện, báo cáo/thảo luận và kết luận theo Phụ lục IV Công văn 5512 (Bộ Giáo dục và Đào tạo, 2020). Mẫu có thể sửa và lưu thiết bị, tải bản soạn JSON để mở lại; lưu/giao qua tài khoản cần kiểm thử đầy đủ với lớp thật.')
shot('16-ke-hoach-xem-truoc.jpg',22,'Kiểm tra cấu trúc kế hoạch và xem mục tiêu kiến thức, năng lực, phẩm chất trước khi xuất Word.')
para('Kiểm tra bằng quy tắc phát hiện trường thiếu, pha thiếu hoặc tổng thời gian trên lớp lệch; chưa xác nhận toàn bộ chất lượng sư phạm. Khi chọn hỗ trợ một khó khăn, nhiệm vụ thay hoạt động hình thành kiến thức và giữ thời gian đã dành cho hoạt động đó, tránh cộng chồng vượt tiết học. Giáo viên phải xem lại mục tiêu và câu hỏi sau khi thay. Bốn lựa chọn tổ chức có hướng dẫn vai khác nhau; chọn hình thức là mở mẫu để giáo viên điều chỉnh, không tự đồng nhất một mẫu với mọi lớp.')
subheading('3.2.13. Xuất tài liệu và kiểm tra AI trong môi trường thử')
para('Sau chọn câu, giáo viên xem nội dung và khóa, đánh dấu đã kiểm tra rồi xuất đề, đáp án hoặc ma trận/đặc tả. Hệ thống tạo một đến bốn mã từ cùng tập câu, giữ quan hệ câu–hình–điểm–khóa khi đảo thứ tự; chưa suy ra các mã tương đương độ khó. Nút xuất tạo đường dẫn tải trực tiếp có thời hạn 15 phút và liên kết tải lại (Hình 23). Trong lượt thử đã tải được tệp DOCX từ giao diện, giữ hình gốc và công thức Equation. Kí hiệu đồng vị đủ A/Z và kí hiệu chỉ có số khối được kiểm tra để loại ô vuông trống khi hiển thị trong Word.')
shot('21-xuat-word-da-tao.jpg',23,'Vùng kiểm tra và tải Word với xác nhận đề, trạng thái đã tạo tệp và liên kết tải lại.')
para('AI cục bộ được thử với học liệu B23: tạo tóm tắt phóng xạ, nêu H = λN và phần còn lại sau mỗi T (Hình 24). Các đoạn học liệu được hiện để giáo viên đối chiếu bản nháp. Một lượt thử có mã đoạn bị viết lệch; lượt trên giao diện viết “Z giảm −2” trong phân rã α, cần sửa thành Z giảm 2. Các kiểm tra mã và lời nhắc chưa thay cho rà soát kiến thức. Phần hỗ trợ khó khăn dùng AI chọn phương án câu hỏi từ danh sách đã biên soạn rồi hiển thị nguyên văn, nhằm hạn chế đổi dữ kiện. Những kết quả này là bằng chứng vận hành giới hạn, không xác nhận AI chính xác với mọi tài liệu, xử lí hình trong bản quét hoặc đáp ứng đồng thời cả lớp.')
shot('22-ai-giao-vien-hoat-dong.jpg',24,'Bản nháp do AI cục bộ tạo từ học liệu công khai; giáo viên có thể đối chiếu đoạn nguồn và chỉnh sửa trước khi dùng.')
para('Các công cụ được phát triển từ yêu cầu thiết kế và phản hồi sử dụng, chưa có khảo sát nhu cầu trên một mẫu giáo viên hoặc đo thời gian tiết kiệm. Sự liên kết học liệu, câu hỏi, phiếu, kế hoạch và tệp Word là giả thuyết thiết kế cần đánh giá. Kết quả phản ánh tính hiện thực hóa của giải pháp và trường hợp kiểm tra, chưa phải bằng chứng phát triển năng lực tự học của học sinh.')
anchor=ps[86];position=body.index(anchor)
for node in insert:body.insert(position,node);position+=1
# Update source bibliography content only, preserving the Mendeley control identity and all opaque parts.
bib=root.xpath('//w:sdt[w:sdtPr/w:tag[@w:val="MENDELEY_BIBLIOGRAPHY"]]/w:sdtContent',namespaces=NS)[0]
bps=bib.findall('w:p',NS);assert len(bps)==14
for _ in range(len(reference_runs)-len(bps)):
 bib.append(deepcopy(bps[-1]))
bps=bib.findall('w:p',NS)
for p,segments in zip(bps,reference_runs):
 fill(p,'',segments)
 pr=p.find('w:pPr',NS)
 if pr is None:pr=E.Element(q('w:pPr'));p.insert(0,pr)
 ind=pr.find('w:ind',NS)
 if ind is None:ind=E.SubElement(pr,q('w:ind'))
 ind.attrib.clear();ind.set(q('w:left'),'398');ind.set(q('w:hanging'),'398')
 jc=pr.find('w:jc',NS)
 if jc is None:jc=E.SubElement(pr,q('w:jc'))
 jc.set(q('w:val'),'left')
 if pr.find('w:keepLines',NS) is None:E.SubElement(pr,q('w:keepLines'))
 # Format inherits the source document, not the prior report.
 for r in p.findall('w:r',NS):
  rp=r.find('w:rPr',NS)
  if rp is not None:
   for el in list(rp):
    if E.QName(el).localname in ['sz','szCs','rFonts','b','bCs']:rp.remove(el)
settings=E.fromstring(parts['word/settings.xml']);update=settings.find('w:updateFields',NS)
if update is None:update=E.SubElement(settings,q('w:updateFields'))
update.set(q('w:val'),'true')
# All screenshots retain their aspect ratio and original inline placement.
for drawing in root.xpath('//w:drawing',namespaces=NS):
 extent=drawing.find('.//wp:extent',NS)
 if extent is not None:
  ratio=int(extent.get('cy'))/int(extent.get('cx'));cx=4860000;cy=round(cx*ratio)
  for node in drawing.xpath('.//wp:extent|.//a:xfrm/a:ext',namespaces=NS):node.set('cx',str(cx));node.set('cy',str(cy))
core=E.fromstring(parts['docProps/core.xml']);title=core.find('{http://purl.org/dc/elements/1.1/}title')
if title is None:title=E.SubElement(core,'{http://purl.org/dc/elements/1.1/}title')
title.text=TITLE
parts['docProps/core.xml']=E.tostring(core,xml_declaration=True,encoding='UTF-8',standalone=True)
for t in root.xpath('//w:body//w:t',namespaces=NS):
 if t.text:t.text=t.text.replace('04/10/2026','04–05/10/2026')
# Remove empty editable declaration slots so the final reference is not isolated.
for index in (100,102,107):
 p=ps[index]
 if not ''.join(p.xpath('.//w:t/text()',namespaces=NS)).strip() and p.getparent() is not None:p.getparent().remove(p)
parts['word/settings.xml']=E.tostring(settings,xml_declaration=True,encoding='UTF-8',standalone=True)
parts['word/document.xml']=E.tostring(root,xml_declaration=True,encoding='UTF-8',standalone=True)
parts['word/_rels/document.xml.rels']=E.tostring(rels,xml_declaration=True,encoding='UTF-8',standalone=True)
with ZipFile(OUTPUT,'w',ZIP_DEFLATED) as archive:
 for name,data in parts.items():archive.writestr(name,data)
 for name,data in added.items():archive.writestr(name,data)
# Preserve-only checks compare exact package bytes after writing.
with ZipFile(SOURCE) as source,ZipFile(OUTPUT) as final:
 changed=[n for n in source.namelist() if source.read(n)!=final.read(n)]
 assert set(changed)<= {'word/document.xml','word/settings.xml','word/_rels/document.xml.rels','docProps/core.xml'},changed
 srcroot=E.fromstring(source.read('word/document.xml'))
 assert E.tostring(srcroot.find('.//w:sectPr',NS))==E.tostring(root.find('.//w:sectPr',NS))
 assert len(root.xpath('//w:sdt',namespaces=NS))==len(srcroot.xpath('//w:sdt',namespaces=NS))
 assert len(root.xpath('//w:drawing',namespaces=NS))==24
 assert len(root.xpath('//m:oMath',namespaces={'m':'http://schemas.openxmlformats.org/officeDocument/2006/math'}))==len(srcroot.xpath('//m:oMath',namespaces={'m':'http://schemas.openxmlformats.org/officeDocument/2006/math'}))
 assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==EXPECTED
 (ROOT/'tmp/report-template/fidelity.json').write_text(json.dumps({'changed_parts':changed,'new_media':list(added),'figures':24,'references':20,'tests':58,'source_sha256':EXPECTED},ensure_ascii=False,indent=2))
text='\n'.join(''.join(p.xpath('.//w:t/text()',namespaces=NS)) for p in root.xpath('//w:body//w:p',namespaces=NS))
(ROOT/'tmp/report-template/report-text.txt').write_text(text)
print(json.dumps({'output':str(OUTPUT),'figures':24,'references':20,'changed_parts':changed},ensure_ascii=False))
