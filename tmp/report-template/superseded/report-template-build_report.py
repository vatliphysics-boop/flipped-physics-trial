from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from copy import deepcopy
from lxml import etree as E
from PIL import Image
from docx import Document
import hashlib,json,shutil
ROOT=Path('/Users/vodoandangkhoi/Documents/WEB_WORKING_24-09')
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
assert len(reference_runs)==16

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

fill(ps[9],'Tư liệu gồm chương trình môn Vật lí, bản SGK được cung cấp, yêu cầu thiết kế học liệu, tài liệu về lớp học đảo ngược và nguồn kiến thức vật lí. Bản SGK ghi “bản mẫu tháng 1/2024”; khi áp dụng cần rà soát với bản sách đang dùng. Sản phẩm được kiểm tra ngày 04/10/2026. Đơn vị phân tích là mục học liệu, hoạt động học, trường sản phẩm và chức năng phần mềm; báo cáo chưa có mẫu học sinh.')
fill(ps[15],'Kiến tạo học liệu: mô phỏng, hình tương tác, video có nhiệm vụ, bản ghi, đề tự luyện và mẫu kế hoạch được triển khai trên web. AI hỗ trợ dự thảo nội dung, câu hỏi và mã; bản mẫu còn có khung hỏi bài cho học sinh và công cụ xử lí học liệu cho giáo viên. Mỗi kết quả AI được xem là bản nháp để kiểm tra, không tự công bố hoặc quyết định điểm chính thức. Công thức, số liệu và nguồn dẫn do người thiết kế, giáo viên đối chiếu trước khi sử dụng (Miao & Holmes, 2023).')
fill(ps[18],'Kiểm tra nội bộ gồm đối chiếu nội dung với nguồn, tính lại trường hợp định lượng, kiểm tra tự động quy tắc dữ liệu và chấm phần khách quan, thao tác trình duyệt ở 900 px và 390 px, cùng kiểm tra trạng thái cơ sở dữ liệu. Các lượt thử AI sử dụng kiến thức công khai B21–B25; kết quả và lỗi phát hiện được lưu để điều chỉnh. Ảnh trong bài là giao diện bản mẫu ngày 04/10/2026, không phải bài làm học sinh. Kiểm tra này chưa phải thẩm định độc lập hoặc xác lập giá trị của công cụ đánh giá.')
fill(ps[93],'AI hỗ trợ cả khâu kiến tạo học liệu và tạo bản nháp trong giao diện sử dụng. Khung học sinh đọc lí thuyết công khai; công cụ giáo viên xử lí văn bản và đề xuất nhiệm vụ. Các chức năng này chưa tự theo dõi hoặc cá nhân hóa quá trình học của từng học sinh. Việc xuất hiện bản nháp trên giao diện chưa chứng minh năng lực tự học đã được phát triển; kết luận về tác động cần dữ liệu trên lớp và công cụ đánh giá phù hợp.')
fill(ps[94],'Giới hạn của nghiên cứu là chưa có mẫu học sinh, thẩm định độc lập hoặc kiểm thử đầy đủ luồng giao, nộp nhiệm vụ qua tài khoản. Các 41 ca kiểm tra phần mềm, ví dụ vật lí và ảnh giao diện chỉ xác nhận những tình huống đã xét. Các lượt thử AI vẫn phát hiện lỗi diễn đạt về bán rã và độ phóng xạ; mã nguồn dẫn không bảo đảm mọi nhận xét đúng. Chưa kiểm thử tải AI đồng thời cả lớp. Bản SGK là bản mẫu tháng 1/2024, cần rà soát với sách dùng tại lớp dự kiến.')
fill(ps[99],'Codex (OpenAI) được sử dụng để hỗ trợ viết mã, biên tập ngôn ngữ và định dạng bản thảo. Trong bản mẫu web, Qwen3 4B Instruct chạy cục bộ qua Ollama để tạo bản nháp giải thích, nhiệm vụ và học liệu. Các tác giả chịu trách nhiệm kiểm tra và chỉnh sửa nội dung, số liệu, trích dẫn trước khi gửi công bố. Công cụ được mô tả theo hồ sơ thao tác; việc có liên kết Gemini, ChatGPT hoặc NotebookLM không được xem là bằng chứng đã dùng các dịch vụ đó để tạo toàn bộ học liệu.')
fill(ps[101],'Mô hình đang dùng: qwen3:4b-instruct-2507-q4_K_M; bộ chạy Ollama 0.35.1 trên máy thử 8 GB RAM. Môi trường hỗ trợ soạn và lập trình: Codex trên máy tính. Hồ sơ của bản mẫu không xác lập phiên bản mô hình ChatGPT hoặc Gemini đã dùng bởi các tác giả ngoài các thao tác được báo cáo.')
fill(ps[104],'Các tác giả cần xác nhận tuyên bố về xung đột lợi ích trước khi gửi công bố.')
fill(ps[106],'Thông tin tài trợ, cơ quan cấp kinh phí và mã số đề tài cần được các tác giả xác nhận trước khi gửi công bố.')
fill(ps[107],'')
for p in ps[90:110]:remove_marks(p)
fill(ps[22], 'Kho mở tập hợp 89 mục được gắn bài và loại học liệu: 17 mô phỏng 3D, 17 mục ảnh hoặc sơ đồ, năm minh họa động, 11 mục video, 18 tài liệu hoặc phiếu, 17 câu hỏi hoặc hoạt động nhóm và bốn đề kiểm tra mẫu. Trong số ảnh có 11 hình câu hỏi mới để giáo viên dùng trong đề và phiếu. Đây là số mục trong danh mục, không phải 89 nội dung hoàn toàn khác nhau; một số mục liên kết nguồn ngoài hoặc dùng lại ở nhiều vị trí. Menu xổ và bộ lọc giúp chọn bài, loại và mục đích sử dụng (Hình 1).')

for t in root.xpath('//w:body//w:t',namespaces=NS):
 if t.text:t.text=t.text.replace('Vũ Văn Hùng và cộng sự','Vũ et al.').replace('Mai Hoàng Phương và cộng sự','Mai et al.')
# Bilingual abstract stays inside the existing merged table cells.
abstracts={
 'Context:':'Context: Nuclear physics requires representations of processes that cannot be observed directly at school. This study describes theory-informed analysis, design and construction of AI-supported resources for lessons B21–B25 in a flipped classroom, with internal checks before use.',
 'Result:':'Result: The prototype contains 89 resource entries, 17 interactive 3D simulations, five interactive infographics, four practice papers and a planning workspace. A teacher workspace assembles illustrated questions, Word worksheets and shuffled versions; AI selects authored support prompts. Checks cover fission conservation, radioactive decay and binding energy mass conventions; 41 software tests passed.',
 'Discussion:':'Discussion: Results concern design products and internal verification. AI drafts still require content review. Account-based assignment and submission workflows need further verification. Independent appraisal and classroom research are needed before drawing conclusions about teaching effectiveness or self-study competence.',
 'Bối cảnh:':'Bối cảnh: Chủ đề Vật lí hạt nhân cần biểu diễn các quá trình không thể quan sát trực tiếp ở trường phổ thông. Nghiên cứu trình bày quy trình phân tích, thiết kế, kiến tạo học liệu có hỗ trợ AI cho B21–B25 theo mô hình lớp học đảo ngược, kèm kiểm tra nội bộ trước sử dụng.',
 'Kết quả:':'Kết quả: Bản mẫu có 89 mục học liệu, 17 mô phỏng 3D, năm infographic tương tác, bốn đề tự luyện và bàn soạn kế hoạch. Không gian giáo viên ghép câu có hình, xuất Word và đảo mã đề; AI chọn câu hỏi hỗ trợ đã biên soạn. Kiểm tra xem xét bảo toàn trong phân hạch, bán rã và quy ước khối lượng; 41 ca phần mềm đạt.',
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
 if t.text:t.text=t.text.replace('23/23','41/41').replace('Chụp 10 giao diện','Chụp 16 giao diện')

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
insert.append(clone_p(34,'3.2.9. Khung AI hỗ trợ học sinh trong trang học tập'))
insert.append(clone_p(3,'Nút AI tròn mở khung chat nhỏ ở góc phải, cho học sinh chọn bài và yêu cầu giải thích hoặc gợi ý (Hình 11). Qwen3 4B Instruct chạy qua Ollama trên máy chủ của hệ thống (Ollama, n.d.). Chế độ gợi ý chọn mã đoạn lí thuyết rồi đặt câu hỏi dẫn dắt; hệ thống trích nguyên văn đoạn đã chọn. Chế độ giải thích tạo bản nháp từ kiến thức công khai, không đọc điểm hoặc đáp án bài kiểm tra của lớp.'))
insert+=figure('11-ai-cuc-bo.png',11,'Khung AI tại B23 trong lượt thử nội bộ; câu hỏi do người kiểm tra nhập.')
insert.append(clone_p(3,'Lượt thử carbon-14 cho N = 14 − 6 = 8; lượt thử N₀ = 800 sau 2T cho giá trị trung bình 200. Các ví dụ chỉ xác nhận những trường hợp đã thử, chưa xác lập độ chính xác trên toàn bộ câu hỏi. Liên kết Gemini và ChatGPT mở dịch vụ ngoài bằng tài khoản của người dùng; hai trang web này không được nhúng làm mô hình của khung chat.'))
insert.append(clone_p(34,'3.2.10. Không gian hỗ trợ giáo viên chuẩn bị học liệu và giờ học'))
insert.append(clone_p(3,'Nghiên cứu về công việc giáo viên cần phân biệt khả năng tạo văn bản với việc hoàn thành tài liệu sử dụng được. Báo cáo của Roy et al. (2024) xét thời gian chuẩn bị bài và tài liệu của giáo viên khoa học Year 7–8 ở Anh. Nguồn này gợi ý chọn khâu chuẩn bị để nghiên cứu, không xác nhận hiệu quả của web đang thiết kế. Khung năng lực AI của Miao và Cukurova (2024) đặt vai trò lựa chọn và quyết định của giáo viên trong việc vận dụng công cụ. Từ yêu cầu sử dụng, bản mẫu tổ chức bốn công việc: tạo đề có hình, tạo phiếu ba pha, chuẩn bị giờ học và đảo đề riêng (Hình 12).'))
insert+=figure('12-ai-giao-vien.png',12,'Các công việc dành cho giáo viên trong kho B21–B25; ảnh bản thử ngày 05/10/2026.')
insert.append(clone_p(3,'Ngân hàng hiện có 105 câu: 72 câu từ bốn đề mẫu và 33 câu mới gắn với 11 hình. Hình gồm cấu trúc và đồng vị, tán xạ, liên kết, phân hạch, bán rã, số đếm, dòng năng lượng, che chắn, PET và khoảng cách. Mỗi câu có mã, bài, mức độ do người biên soạn gán, điểm, đáp án và lời giải; các câu có hình lưu mã hình để giữ đúng quan hệ khi xuất. Dữ liệu đếm được ghi là mô phỏng. Ví dụ, đường N(t) cho N₀ = 800 và N(2T) = 200 đi với hai câu riêng: phần còn lại 25% và phần đã phân rã 600; hình không được tự ghép vào một câu không phù hợp.'))
insert.append(clone_p(3,'Giáo viên chọn đề 15 phút, giữa kỳ hoặc cuối kỳ trong phạm vi hạt nhân, chọn bài và số câu rồi kiểm tra bảng phân bố thực tế. Khi không yêu cầu mọi câu có hình, bộ chọn ưu tiên ít nhất một câu có hình cho mỗi bài đã chọn nếu kho có. Đề được tạo thành 1–8 mã dùng cùng tập câu hỏi và điểm; thứ tự được đảo trong từng dạng, lựa chọn của câu trắc nghiệm được đảo khi không có tham chiếu vị trí như “A và B”. Đáp án được ánh xạ theo thứ tự mới (Hình 13). Word dành cho học sinh chứa đề và hình; Word giáo viên chứa đáp án, lời giải và bảng phân bố. Cách giữ cùng tập câu chưa chứng minh các mã tương đương về độ khó.'))
insert+=figure('13-de-co-hinh.png',13,'Bảng phân bố câu và điểm trước khi tạo mã đề; số liệu thuộc đề mẫu nội bộ.')
insert.append(clone_p(3,'Phiếu học tập được tạo theo bài và vấn đề cần hỗ trợ; hình và câu được lọc theo chủ đề của phiếu (Hình 14). Ba pha có phần đọc và dự đoán, thao tác và giải thích, rồi tự sửa và học tiếp. Chẳng hạn phiếu bán rã sử dụng đường N(t), yêu cầu phân biệt phần còn lại với phần đã phân rã và ghi cách sửa dự đoán. Phiếu học sinh có chỗ viết sản phẩm; lưu ý kiến thức, hỗ trợ và đáp án nằm trong tệp hướng dẫn giáo viên riêng. Bộ xuất Word đã được kiểm tra giữ hình, kí hiệu và nội dung ba pha; giáo viên vẫn chỉnh nhiệm vụ và thời lượng phù hợp lớp.'))
insert+=figure('14-phieu-ba-pha.png',14,'Chọn phiếu, vấn đề cần hỗ trợ và câu có hình phù hợp trước khi xuất Word.')
insert.append(clone_p(3,'Trong chuẩn bị giờ học, giáo viên chọn khó khăn đã quan sát, điều kiện thiết bị và thời lượng; số lượng tổng hợp là tùy chọn (Hình 15). Hệ thống đề xuất hoạt động có mục tiêu, nhiệm vụ hai vai, sản phẩm, tiêu chí và mô phỏng tương ứng. Khi thêm hoạt động bán rã 10 phút vào mẫu có 35 phút trong giờ, tổng được kiểm tra thành 45 phút; thời gian tự học được tính riêng. Kiểm tra bằng quy tắc chỉ nhắc trường còn trống, pha thiếu hoặc thời lượng lệch, không thẩm định chất lượng toàn bộ kế hoạch. AI cục bộ chọn hai câu hỏi và một cách hỗ trợ từ phương án đã biên soạn; hệ thống chỉ nhận mã hợp lệ rồi hiển thị nguyên văn phương án. Giáo viên có thể sửa gợi ý trước khi đưa vào hoạt động, chưa tự giao cho lớp.'))
insert+=figure('15-chuan-bi-gio-hoc.png',15,'Chuẩn bị hoạt động hỗ trợ theo điều kiện lớp; 12/40 là tham số kiểm thử, không phải số liệu học sinh thật.')
insert.append(clone_p(3,'Phần đảo đề riêng đọc TXT hoặc DOCX trong trình duyệt, hỗ trợ câu trắc nghiệm bốn phương án và một hình PNG/JPEG ở phần dẫn. Đề cần được nhận dạng theo từng câu, có khóa đáp án và được giáo viên kiểm tra trước khi tạo mã (Hình 16). Một lượt thử đã đọc hai câu và hai hình từ DOCX, ghép khóa D/C rồi tạo hai mã vẫn giữ hình đi với câu. Điểm ghi ở đầu câu được giữ; câu chưa ghi điểm tạm có một điểm để giáo viên chỉnh. Công thức Word dạng đối tượng toán, bảng, đề PDF quét và hình nằm trong phương án chưa được xử lí đầy đủ; hệ thống yêu cầu chuẩn hóa thay vì tự đảo và làm mất cấu trúc.'))
insert+=figure('16-dao-de-nhap.png',16,'Câu và hình đọc từ tệp Word thử nghiệm sau khi kiểm tra khóa và tạo mã đề.')
insert.append(clone_p(3,'Lượt thử sinh văn bản tự do đã phát hiện lỗi H = λN và việc tự đổi N₀ = 800 thành 80.000. Do đó, phần hỗ trợ tình huống chuyển sang AI chọn phương án từ danh sách, không viết lại dữ kiện khoa học. Các công cụ đọc tài liệu riêng và tạo bản nháp vẫn yêu cầu giáo viên rà soát; liên kết Gemini, ChatGPT và NotebookLM để giáo viên tự sử dụng. Chưa khảo sát nhu cầu trên mẫu giáo viên, chưa đo thời gian tiết kiệm và chưa kiểm thử tải cả lớp; các chức năng mới là giả thuyết thiết kế cần đánh giá khi sử dụng.'))
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
 if t.text:t.text=t.text.replace('04/10/2026','04–05/10/2026').replace('23/23','41/41').replace('33/33','41/41')
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
 assert len(root.xpath('//w:drawing',namespaces=NS))==16
 assert len(root.xpath('//m:oMath',namespaces={'m':'http://schemas.openxmlformats.org/officeDocument/2006/math'}))==len(srcroot.xpath('//m:oMath',namespaces={'m':'http://schemas.openxmlformats.org/officeDocument/2006/math'}))
 assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==EXPECTED
 (ROOT/'tmp/report-template/fidelity.json').write_text(json.dumps({'changed_parts':changed,'new_media':list(added),'figures':16,'references':16,'tests':41,'source_sha256':EXPECTED},ensure_ascii=False,indent=2))
text='\n'.join(''.join(p.xpath('.//w:t/text()',namespaces=NS)) for p in root.xpath('//w:body//w:p',namespaces=NS))
(ROOT/'tmp/report-template/report-text.txt').write_text(text)
print(json.dumps({'output':str(OUTPUT),'figures':16,'references':16,'changed_parts':changed},ensure_ascii=False))
