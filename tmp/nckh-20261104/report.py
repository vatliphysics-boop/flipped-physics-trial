from pathlib import Path
from zipfile import ZipFile
from lxml import etree as E
from docx import Document
from pypdf import PdfReader
import hashlib,json,re,collections
w=Path(__file__).parent; base=Path.cwd()
out=Path('DE_CUONG_NGHIEN_CUU_HOAN_CHINH.docx')
article=Path('BAI_BAO_KHOA_HOC_CAP_NHAT_HOC_LIEU.docx');back=Path('sao_luu_nckh/20261104')
sourcehash=json.load(open(w/'protected-source-sha256.json'));manifest=json.load(open(w/'docx-manifest.json'));heads=json.load(open(w/'heads.json'));pages=json.load(open(w/'toc-pages.json'));changes=json.load(open(w/'article-changes.json'))
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
changed=[p for p,s in sourcehash.items() if sha(p)!=s];assert not changed,changed
for v in manifest[:4]:assert sha(back/v['path'])==v['sha256']
for v in manifest:
 if v['path']!=article.name:assert sha(v['path'])==v['sha256']
def inspect(p):
 with ZipFile(p) as z:
  assert z.testzip() is None;files=set(z.namelist())
  for f in files:
   if f.endswith(('.xml','.rels')):E.fromstring(z.read(f))
  e=E.fromstring(z.read('word/document.xml'));ns=e.nsmap
  count=lambda k:len(e.xpath(k,namespaces=ns))
  eqs=[E.tostring(x,method='c14n',exclusive=True) for x in e.xpath('//m:oMath',namespaces=ns)]
  captions=[''.join(x.xpath('.//w:t/text()',namespaces=ns)) for x in e.xpath('//w:p',namespaces=ns)];figs=[c for c in captions if re.match('^Hình \\d+\\.',c)]
  return files,count('//w:tbl'),eqs,figs,e
of,ot,oq,oc,oe=inspect(out);bf,bt,bq,bc,be=inspect(back/article);af,at,aq,ac,ae=inspect(article)
assert bf==af and aq==bq and at==bt and ac==bc and len(ac)==24
with ZipFile(back/article) as a, ZipFile(article) as b:
 partdiff=[n for n in b.namelist() if a.read(n)!=b.read(n)];assert set(partdiff)=={'word/document.xml','[Content_Types].xml'},partdiff
media=[p for p in af if p.startswith('word/media/')]
d=Document(out);apar=Document(article)
assert len(d.tables)==7 and len(oq)==8
lookup={v:k for k,v in heads.items()}
toc=[p.text.split('\t') for p in d.paragraphs if p.style.name=='TOC Cached'];assert len(toc)==39 and all(int(pg)==pages[lookup[h]] for h,pg in toc)
def pdfstats(dirname):
 folder=w/dirname;fp=next(folder.glob('*.pdf'));r=PdfReader(fp);nn=len(r.pages)
 assert len(list(folder.glob('page-*.png')))==nn
 for i,p in enumerate(r.pages):
  s=p.extract_text();assert len(s.strip())>20,(i+1,len(s))
 return nn
op=pdfstats('outline-final');ap=pdfstats('article-final')
# Check the text of every relevant passage, not layout placeholders or auto-field caches.
ps=d.paragraphs;idxs={p.text:i for i,p in enumerate(ps) if p.style.name.startswith('Heading ')}
sec={}
for key,h in heads.items():
 i=idxs[h];ls=[]
 for p in ps[i+1:]:
  if p.style.name.startswith('Heading '):break
  if p.text:ls.append(p.text)
 assert ls,h;sec[key]=ls
articlebody=ae.xpath('//w:body//w:t/text()',namespaces=ae.nsmap);textbody=' '.join(articlebody)
for phrase in ['62/62','212','207','25 mục','theo quy tắc','tiền kiểm','Trương Thị Phương Chi']:
 assert phrase in textbody,phrase
assert '213 câu' not in textbody and '208 mục' not in textbody
stats={'outline_pages':op,'article_pages':ap,'outline_headings':len(heads),'toc_entries':len(toc),'source_files_unchanged':len(sourcehash),'article_changed_parts':partdiff,'article_media':len(media),'article_tables':at,'article_OMML':len(aq),'outline_tables':ot,'outline_OMML':len(oq),'article_changed_paragraphs':len(changes),'outline_sha256':sha(out),'article_sha256':sha(article)}
(w/'final-integrity.json').write_text(json.dumps(stats,indent=2))
report=[]
def add(s):report.append(s.strip()+'\n')
add('''# Báo cáo đối chiếu đề cương và bài báo nghiên cứu khoa học sinh viên

**Trường Đại học Sài Gòn · Ngày 04/11/2026**

**Đề tài**: Xây dựng và sử dụng học liệu số có hỗ trợ trí tuệ nhân tạo trong tổ chức dạy học theo mô hình lớp học đảo ngược nhằm phát triển năng lực tự học của học sinh qua chủ đề “Vật lí hạt nhân” môn Vật lí lớp 12 ở trường THPT.

**Nhóm**: Võ Đoàn Đăng Khôi (chủ nhiệm), Nguyễn Bảo Thy, Bùi Ngọc Xuân Phương. **Giảng viên hướng dẫn**: PGS.TS. Nguyễn Thị Nhị.

Hai sản phẩm Word đã mở được bằng LibreOffice và được kết xuất thành trang để rà hiển thị. Đề cương giữ đủ toàn bộ hệ thống đề mục. Bài báo được chỉnh trên gói Word đã có. Bằng chứng hiện tại cho phép báo cáo sản phẩm, cấu trúc dữ liệu và các ca kiểm thử cụ thể. Các mục khảo sát, thẩm định chuyên gia và tác động lên học sinh đang chờ dữ liệu thực địa.
''')
add('''## 1. Kiểm kê và phân loại nguồn

Kiểm kê đệ quy ban đầu ghi nhận 47.052 tệp, kể cả lịch sử Git, phụ thuộc cài đặt và kết quả build. Có 31 tệp Word thuộc hồ sơ nghiên cứu, học liệu, thử xuất hoặc bản lưu. Đã đọc nội dung toàn văn, bao gồm đoạn trong bảng, phần phụ, đầu/chân trang và công thức. Các đoạn trùng giữa bản lưu được đối chiếu theo văn bản gốc và phần sai khác. Hai tệp khóa Word bắt đầu bằng `~$` và 18 tài liệu mẫu kiểm thử của thư viện mammoth trong thư mục phụ thuộc không phải tài liệu của đề tài. Danh mục đầy đủ được lưu trong [kiểm kê ban đầu](tmp/nckh-20261104/inventory.json), kèm [dấu vân tay của 31 tệp Word](tmp/nckh-20261104/docx-manifest.json).

| Tệp Word đã đọc | Vai trò và cách sử dụng |
|---|---|''')
roles=['Mẫu của cô Nhị. Khóa cấu trúc, yêu cầu triển khai, mục tiêu và nhiệm vụ.','Bài báo đích. Chỉnh trên đúng gói nguồn đã sao lưu.','Thuyết minh. Căn cứ mục tiêu, phạm vi, phương pháp, tiến độ, phân công và sản phẩm dự kiến.','Tài liệu gợi ý hoạt động trước và trong giờ. Bổ sung giai đoạn sau giờ theo mẫu chính.']
for j,x in enumerate(manifest):
 p=x['path'];role=roles[j] if j<4 else ('Học liệu hoặc kết quả xuất Word để đối chiếu câu hỏi, phiếu, kế hoạch, hướng dẫn và công thức.' if p.startswith(('docs/worksheets','output/','tmp/book-extraction','tmp/report-template/export-qa')) else 'Bản lưu, mẫu hoặc hồ sơ vòng phát triển. Dùng đối chiếu lịch sử và hình thức, không dùng thay nguồn chính.')
 add('| `'+p+'` | '+role+' |')
add('''**Hồ sơ dự án và học liệu.** Đã đọc AGENTS.md, CLAUDE.md, PROJECT_CONTEXT.md, docs/CURRENT_TASK.md và package.json để phân biệt hướng dẫn hiện hành với trạng thái cũ. Đã đối chiếu hồ sơ kiểm tra kỹ thuật, bản ghi chạy ca thử, tài liệu kiểm chứng nguồn, bài rà soát ngày 15/10, ảnh chụp cũ trong bài báo và sổ biên tập ngân hàng. Bản SGK Kết nối tri thức trong dự án ghi bản mẫu tháng 1/2024. Khi triển khai cần thống nhất với sách nhà trường sử dụng.

| Minh chứng | Phương pháp kiểm tra và giới hạn |
|---|---|
| `public/learning/physics-curriculum-2018.pdf`, tr. 27–28 và `src/lib/nuclear-curriculum.ts` | Đọc 15 yêu cầu cho mạch hạt nhân và phóng xạ. YC1–YC15 là mã nhóm đặt để truy vết. |
| `src/lib/material-bank.ts`, danh mục `CANONICAL_SYSTEM_MATERIALS` | Đếm 89 mục theo danh mục chuẩn, gồm 17 ảnh, 4 kiểm tra, 18 tài liệu, 17 hoạt động hợp tác, 5 hình động, 10 video bài giảng, 1 video thực tế, 17 mô phỏng. Năm infographic không cộng thêm vào 89. |
| `src/components/physics/FixedPhysicsActivityRenderer.tsx`, `src/lib/physics.ts`, `src/lib/decay-data.ts` | 17 khóa hoạt động phân theo bài 3/4/5/4/1. Có lớp hiển thị dùng chung và bảng dữ liệu mô hình. CSV phân rã có 61 mốc, khác với số ca kiểm thử. |
| `src/data/unified-question-bank.json`, `data/book-bank/unified.json`, `curation-audit.json` và `true-false-pending-statements.json` trong cùng thư mục dữ liệu | Hai tệp hợp nhất bằng nhau theo nội dung, có 212 mã duy nhất ở trạng thái ready. 72 chọn, 12 đúng–sai, 19 trả lời số, 109 tự luận. Có 25 ảnh nguồn khác nhau gắn với 33 câu. Sáu ý đúng–sai chờ ghép. Đây là bằng chứng tại kho dự án, không mặc định bản triển khai từ xa dùng cùng dữ liệu khi cấu hình khác. |
| `src/components/learning/ObservationNotebook.tsx`, `NuclearLearningNotebook.tsx`, `src/lib/flipped-classroom.ts`, `guided-preparation.ts`, `guided-worksheet.ts`, các tệp Word trong docs/worksheets | Xác nhận tài liệu dạy học và cơ chế lưu tại trình duyệt, xuất tệp. Cần kiểm tra giao–nộp có tài khoản và lịch sử sửa trước khi xem là dữ liệu quá trình của học sinh. |
| `src/app/api/ai/student/route.ts`, `src/lib/student-physics-chat-engine.ts`, `src/app/api/ai/teacher/route.ts` và cấu hình mô hình cục bộ | Học sinh có nhánh tạo sinh và nhánh quy tắc. Phép gọi trực tiếp hàm dự phòng B21 với câu hỏi về làm bánh trả gợi ý Rutherford. Giáo viên có kiểm tra tài khoản cho API chính. Chưa kiểm thử tải lớp học hoặc xác nhận mô hình đang phục vụ mọi phiên. |
| `docs/codex-team/TECHNICAL_VERIFICATION.md`, `docs/codex-team/tests-round7.log`, `docs/TEST_REPORT.md`, `docs/research/DEEP_RESEARCH_2026-10-15.md`, `docs/references/KIEM_CHUNG_NGUON.md` | Nguồn lịch sử. Giữ đúng mốc phiên thử và phân biệt phản hồi do AI đóng vai với ý kiến của chuyên gia thật. |
| `tests/*.test.ts` | Chạy bộ thử sẵn có ngày 04/11, 62 đạt, 0 trượt, 0 bỏ qua. Không chạy lại build/lint hay các lượt thử trình duyệt và mô hình tháng 10 như thể chúng là phép thử mới. |

Lệnh tái lập phép thử trên phiên bản đã kiểm tra: `node --import ./scripts/test-resolver.mjs --experimental-strip-types --test tests/*.test.ts`. Đã dùng Node đi kèm workspace. [Nhật kí chạy thực tế](tmp/nckh-20261104/tests-20261104.log) và [danh mục mô phỏng kèm số đếm](tmp/nckh-20261104/website-counts.json).
''')
add('''## 2. Bảng đối chiếu toàn bộ đề mục của cô Nhị

Đã so khớp theo thứ tự đoạn XML của mẫu, không suy từ mục lục tự động. Mỗi dòng là một tiêu đề nghiên cứu. Hai dòng “CHƯƠNG …” và tên chương trong mẫu được trình bày trong cùng một tiêu đề cấp 1. Mọi mục đều có văn bản triển khai. Cột trang chỉ trang bắt đầu trong bản kết xuất bằng LibreOffice, có thể dịch chuyển khi đổi máy hoặc phông. Mã P là số thứ tự đoạn Word, tính từ 0, bao gồm đoạn trống và đoạn trong bảng.

| Đoạn mẫu | Đề mục đã đối chiếu | Trang | Kết quả và vai trò |
|---|---|---:|---|''')
def category(i):
 if i==255:return 'Đủ · nguồn trích dẫn trong đề cương'
 if i==260:return 'Đủ · công cụ, đáp án và biểu mẫu chưa điền'
 if 141<=i<=148:return 'Đủ · thiết kế khảo sát, kết quả chờ dữ liệu thật'
 if 247<=i<=254:return 'Đủ · kế hoạch phân tích, chưa có kết quả thực nghiệm'
 if i>=225:return 'Đủ · phương án bán thực nghiệm theo thuyết minh'
 if i>=218:return 'Đủ · tách kiểm thử đã chạy và thẩm định dự kiến'
 if i>=200:return 'Đủ · kế hoạch bài dạy dự kiến và minh chứng cá nhân'
 if i>=186:return 'Đủ · mã/dữ liệu sản phẩm, giới hạn và cách sử dụng'
 if i>=179:return 'Đủ · chương trình, mã yêu cầu và ma trận'
 if i>=149:return 'Đủ · yêu cầu, nguyên tắc, quy trình và cách thu minh chứng'
 if i>=105:return 'Đủ · cơ sở lí luận, minh chứng và giới hạn chuyển giao'
 return 'Đủ · căn cứ mẫu và thuyết minh'
for k,h in heads.items():
 i=int(k);pid=f'P{i:04}' if i not in [105,179] else f'P{i-1:04}–P{i:04}'
 add(f'| {pid} | {h} | {pages[k]} | {category(i)} |')
add('''**Đối chiếu nội dung bắt buộc ngoài tiêu đề.** Tám mục tiêu cụ thể (P0072–P0079), 11 nhiệm vụ (P0083–P0093), sáu yêu cầu (P0151–P0156), sáu nguyên tắc (P0158–P0163) và sáu bước (P0165–P0170) được giữ nguyên văn. Mục tiêu tổng quát và giả thuyết của mẫu được giữ và giải thích bằng biến kết quả. Phần mô tả cấu trúc ở mục 9 triển khai ý nghĩa từng chương thay cho ba dòng giữ chỗ P0098–P0100.

**Lỗi hình thức của mẫu.** Sau mục 2 ở Mở đầu là mục 4. Danh sách nhiệm vụ đi từ 6 tới 8. Giữ nguyên cả hai khoảng trống số. P0094 sửa “vfa” thành “và”, P0096 sửa “đề tái” thành “đề tài”, P0247 viết hoa chữ đầu “Kết quả”. Chuẩn hóa khoảng trắng kép và giữ cách viết “Vật lý” trong tiêu đề do cô giao. Bìa dùng tên đề tài chính thức, tên thành viên, logo SGU của mẫu và tháng lập đề cương. Không điền mã đề tài chưa cấp hoặc ký thay trên trang xác nhận của mẫu báo cáo tổng kết.
''')
add('''## 3. Nội dung đề cương đã hoàn thiện

- **Mở đầu.** Đối chiếu mục tiêu, giả thuyết, nhiệm vụ, khách thể, phạm vi, phương pháp hỗn hợp và sản phẩm. Yêu cầu có bài báo được chấp nhận/đăng và khoản dự toán trong thuyết minh được giữ ở trạng thái dự kiến.
- **Chương 1.** Phân biệt năng lực tự chủ và tự học trong GDPT 2018 với quá trình SRL. Liên kết mục tiêu, kế hoạch, xử lí thông tin, giám sát và điều chỉnh với mười chỉ báo. Đặt nghiên cứu cạnh luận án E-learning hạt nhân năm 2017 và nghiên cứu lớp học đảo ngược có AI ở Khoa học tự nhiên 9 năm 2026. Mục khảo sát giữ đủ bảy tiểu mục, có công cụ và phương án phân tích. Chưa có tỉ lệ thực trạng.
- **Chương 2.** Đối chiếu 15 yêu cầu chương trình với kho B21–B25. Tách hình động, lớp hiển thị 3D, mô hình định lượng, tệp CSV kỳ vọng, phản hồi theo quy tắc và mô hình tạo sinh. Trình bày hai quy ước khối lượng, kiểm tra ví dụ He-4, C-12, Fe-56 và bảo toàn A, Z. Ba kế hoạch lần lượt là cấu trúc–liên kết, phóng xạ–bán rã, phản ứng–ứng dụng–an toàn. Phân bổ 5, 5 và 6 tiết là phương án do nhóm đề xuất cho tổ chuyên môn xem xét. Trong mỗi kế hoạch có thiết bị và bản thay thế, mục tiêu, công việc trước/trong/sau, nhiệm vụ, sản phẩm, tổ chức, thời lượng và đánh giá cá nhân. Bốn chức năng hoạt động của Phụ lục IV được ghi riêng với ba thời điểm đảo ngược.
- **Chương 3.** Xác định đơn vị phân nhóm là lớp, hai kịch bản 2 hoặc 4 lớp, biến chính, biến bổ trợ, kiểm soát sai lệch, phân tích SPSS, ghép dữ liệu trước–sau, xử lí thiếu và đối chiếu định lượng–định tính. Với một lớp mỗi nhánh, hiệu ứng lớp lẫn với can thiệp. Bốn lớp cũng còn ít để suy luận thống kê theo cụm. Tác động riêng của AI không thể tách khỏi tác động của cả gói.
- **Phụ lục.** Có rubric 10 chỉ báo với mô tả 4 mức, phiếu GV-01, HS-01, 15 câu tự báo cáo, 2 dạng thực hành 25 phút, 2 đề kiến thức 35 phút với đáp án/thang 10, PHT1–PHT3, nhật kí, phiếu thẩm định, quan sát, phỏng vấn, đồng thuận và từ điển biến. Đây là bộ công cụ đã biên soạn, cần thử nhận thức, thử chấm và thẩm định trước dùng chính thức.
''')
add('''## 4. Các chỉnh sửa cụ thể trong bài báo

Đã dùng đúng bài báo gốc làm đầu vào, chỉnh các đoạn nội dung, bổ sung một tài liệu tham khảo và sửa khai báo JPEG còn thiếu trong gói nguồn. Giữ khung bài của Tạp chí Giáo dục, toàn bộ các tiểu mục, hình minh họa website, chú thích, bảng và biểu thức toán. Bài vẫn mang tính chất bản thảo.

| Vị trí gốc | Chỉnh sửa và căn cứ |
|---|---|
| Nhan đề tiếng Việt và tiếng Anh, P0000–P0001 | Thu hẹp nhan đề bài báo vào thiết kế và kiểm tra học liệu cho mục tiêu tự học. Tên chính thức của đề tài ở bìa đề cương vẫn đầy đủ. |
| Lịch sử bài và hai tóm tắt, P0013–P0031 | Giữ ô ngày nhận/chấp nhận/đăng để trống cả năm. Hai bản tóm tắt cùng phạm vi, mốc kiểm kê, số đếm, hai nhánh hỗ trợ và điều kiện đánh giá học sinh. |
| Mở đầu và phương pháp, P0033–P0040, P0066–P0067 | Bổ sung tiền lệ Trương Thị Phương Chi (2017), phân biệt SRL với năng lực chung của chương trình. Đặt pha thiết kế trong nghiên cứu hỗn hợp của đề tài. Ghi đơn vị đếm và tách hồ sơ tháng 10 khỏi phép thử ngày 04/11. |
| Kho học liệu và công cụ, P0070, P0135–P0144 | Đếm lại kho, khóa mô phỏng, câu hỏi. Giải thích nhánh Qwen và nhánh quy tắc, trường hợp câu ngoài phạm vi. Đối chiếu 232 mục gốc với sổ biên tập và tệp dữ liệu. Giữ mô tả cấu trúc câu hỏi, hình từ sách và xuất Word. |
| Kế hoạch bài dạy, P0165, P0184 | Chỉnh cách diễn đạt căn cứ Công văn 5512/7991 và mức minh chứng về giáo viên. |
| Bảng 2 và các đoạn kế tiếp, P0186–P0209 | Thay mốc chung bằng hai mốc kiểm tra, giữ đúng lịch sử build/lint, làm rõ lỗi kết nối ở lần trước và trạng thái luồng giao–nộp. Tách nhận xét AI đóng vai với thẩm định chuyên gia. |
| Kết luận và bình luận, P0211–P0215 | Trả lời hai câu hỏi nghiên cứu qua thiết kế nhiệm vụ, nguồn minh chứng và phạm vi kiểm tra. Nêu ý nghĩa sư phạm của bản sửa bài, khả năng phụ thuộc trợ giúp, điều kiện kiểm chứng và rủi ro suy luận khi quá ít lớp. |
| Tuyên bố tác giả và GenAI, P0217–P0220 | Ghi vai trò theo phân công, phần việc thực tế cần nhóm xác nhận. Phân biệt mô hình được dùng trong hồ sơ thử với nhánh quy tắc. Giữ lời cảm ơn giảng viên hướng dẫn. |
| Tài liệu tham khảo, P0228 trở đi | Giữ danh mục gốc, chuẩn hóa tên Việt và dẫn trong bài, bổ sung đường dẫn văn bản, thêm luận án đã đối chiếu bìa. Nguồn Huỳnh Thị Yến Nhi và cộng sự theo thứ tự trên PDF xuất bản. |

[Nhật kí thay đổi từng đoạn, gồm văn bản trước và sau](tmp/nckh-20261104/article-changes.json). Chỉ số P là vị trí trong bài gốc, không phải số trang. Việc thêm một mục thư mục tạo một đoạn mới. Độ dài bản thảo cần được đối chiếu với thể lệ cụ thể khi chọn nộp tạp chí. Không cắt hình hay lược phần khoa học để ép số trang.
''')
add('''## 5. Mâu thuẫn giữa tài liệu và cách xử lí

| Vấn đề | Các phiên bản và vị trí | Cách xử lí |
|---|---|---|
| Số lớp | Thuyết minh mục 10, P0136 ghi một trường/hai lớp. Mục 12.4, P0158 ghi hai lớp thực nghiệm và hai lớp đối chứng. | Không chọn ngầm. Đề cương 3.3–3.6 có hai kịch bản. Cần văn bản xác nhận trước tuyển mẫu. |
| Địa bàn | Mục 10 nêu một trường. Mục 11, P0147 nêu một số trường ở TP.HCM. | Tách mẫu khảo sát nhu cầu khỏi mẫu thực nghiệm. Chưa điền tên trường hoặc số trường đã đồng ý. |
| Thời gian | Toàn đề tài 10/2026–04/2027. Bảng tiến độ 13.2 dòng nội dung học liệu ghi 11/2026–12/2027 (P0197–P0198), dòng kế hoạch bài dạy ghi 12/2027–01/2027 (P0204–P0205). | Giữ bản gốc. Tháng 12/2026 là giả thiết sửa lỗi năm cần xác nhận. Dự kiến 6–8 tuần trong 01–02/2027 chỉ triển khai khi phù hợp lịch thực tế. |
| Tên và loại văn bản | Bìa mẫu cô ghi báo cáo tổng kết tháng 4/2027, dùng biến thể “có sự hỗ trợ … Vật lý 12 THPT”. Người dùng cung cấp tên chính thức khác về câu chữ. | Bìa đề cương dùng tên chính thức được giao. Nhan đề bài báo nêu kết quả của pha thiết kế. Không giả chữ ký, mã số hoặc tình trạng công bố. |
| Câu hỏi nguồn | Bài gốc P0143/P0214 ghi 232/208/24 và 213 câu, 73 nhiều lựa chọn. Sổ biên tập hiện là 232/207/25, 212 câu, 72 nhiều lựa chọn. Sáu ý đúng–sai chưa ghép vẫn là sáu. | Dùng số hiện hành và nói rõ phạm vi. Hồ sơ ghi UI-0100 có phương án nhiễu trùng nhau nên giữ dự thảo. Không suy đã có chuyên gia thẩm định từng câu. |
| Số ca phần mềm | Hồ sơ cũ: 58, sau đó 61 ca. Phép chạy ngày 04/11: 62/62 đạt. | Giữ mốc lịch sử ở phần phương pháp và Bảng 2. Không gọi 62 là số chức năng đã được người dùng chấp nhận hoặc tổng số tình huống có thể xảy ra. |
| Số 17 và số 89 | “17 mô phỏng 3D” có thể gợi 17 mô hình độc lập. Kho 89 mục có cả liên kết và tài nguyên tham khảo. | Báo cáo 17 hoạt động cấu hình dùng lớp hiển thị 3D chung, 89 bản ghi danh mục. Không cộng thêm infographic ngoài danh mục. |
| AI học sinh | Bài cũ P0135–P0138 mô tả Qwen và lượt từ chối câu ngoài phạm vi. Mã hiện tại có nhánh quy tắc và từ khóa gây lạc chủ đề. | Giữ lượt thử cũ có ngày. Bổ sung phép thử trực tiếp hàm dự phòng và giới hạn của kết luận. Không khẳng định luôn dùng mô hình tạo sinh. |
| Vai trò tác giả | Dòng phân công thuyết minh và P0217 của bài báo nêu phần việc được giao. Bản lưu tmp/article/previous.docx đoạn P0131 có cách ghi khác về người phát triển học liệu và phần hỗ trợ thuyết minh/đề cương. | Giữ họ tên và vai trò theo phân công. Chờ ba tác giả xác nhận phần đóng góp thực tế trước gửi bài. |
| Sản phẩm dự kiến và trạng thái thật | Thuyết minh nêu thẩm định, thực nghiệm, một bài được chấp nhận/đăng. Hồ sơ hiện có tên tạp chí, giao diện và phản hồi do AI đóng vai. | Không coi mẫu tạp chí là thông báo xuất bản, phản hồi AI là đánh giá chuyên gia, hoặc kiểm thử là bằng chứng năng lực học sinh đã tăng. |
| Khung đánh giá | Phiếu website dùng bốn tiêu chí học tập. Đề cương đề xuất 5 thành phần, 10 chỉ báo chấm nhiệm vụ chung. | Phân biệt công cụ phản hồi thường xuyên với công cụ nghiên cứu. Đối chiếu các nguồn minh chứng, không quy đổi điểm máy móc. |
| Phản ứng phân hạch | hd.docx có mô tả dễ hiểu là hai nguyên tử uranium va vào nhau. Các hoạt động website dùng một kênh minh họa; bài học ở đề cương còn dùng một kênh khác. | Sửa cách giải thích trong sản phẩm mới thành neutron gây phân hạch. Kênh Ba-141/Kr-92 và kênh Y-95/I-138 đều được kiểm A/Z với ba neutron. Các kênh chỉ là ví dụ, không sửa tài sản gốc. |
| Chỉ dẫn số trong thuyết minh | Ví dụ P0121 dẫn [8]–[11] cho nhận định về học đảo ngược, trong khi [8] thuộc AI trong Vật lí và [9] thuộc lịch sử Vật lí. | Tra từng nguồn theo tác giả – năm và luận điểm. Dùng APA theo nguồn xuất bản ở hai sản phẩm, không sao chép các chỉ dẫn số thiếu chính xác. |
''')
add('''## 6. Đối chiếu tài liệu tham khảo và phần chưa xác minh trọn vẹn

Việc xác minh gồm kiểm tra danh tính công trình, thông tin xuất bản và mức độ nguồn hỗ trợ luận điểm. Một DOI có thật không xác nhận kết quả áp dụng cho website. Các đề xuất riêng của nhóm, ví dụ quy tắc tám chỉ báo hợp lệ, thời lượng bài kiểm tra và phân bổ tiết, được ghi là quyết định thiết kế chưa kiểm định.

| Cụm nguồn | Căn cứ xác minh |
|---|---|
| Chương trình và đánh giá | [Thông tư 32/2018](https://vbpl.moj.gov.vn/bogiaoducdaotao/Pages/vbpq-toanvan.aspx?ItemID=146721), PDF chương trình môn Vật lí tr. 27–28, [Công văn 5512 và phụ lục](https://tunghia.quangngai.edu.vn/tai-nguyen/cac-phu-luc-kem-theo-cong-van-5512-bgddt-gdtrh-ngay-18-12-2020-cua-bo-giao-duc-va-dao-tao), [Công văn 7991](https://pgddtcumgar.edu.vn/wp-content/uploads/2024/12/Cong-van-7991-huong-dan-KTDGDK.pdf). TT22/2021 được sửa đổi bởi [TT89/2026](https://datafiles.chinhphu.vn/cpp/files/vbpq/2026/10/89-bgddt.signed.pdf), có hiệu lực 01/12/2026 theo Điều 24. Cần kế hoạch năm học của trường cho thời điểm triển khai. |
| Nghiên cứu trong nước | [Mai Xuân Đào và Phan Đồng Châu Thủy](https://journal.hcmue.edu.vn/index.php/hcmuejos/article/view/2825), [Nguyen và cộng sự](https://vje.vn/index.php/journal/article/view/8), [Mai Hoàng Phương và cộng sự](https://doi.org/10.34238/tnu-jst.9209), [luận án Trương Thị Phương Chi](https://www.tailieu5s.net/stream-viewer/217443/luan-an-tien-si-khoa-hoc-giao-duc%3A-xay-dung-va-su-dung-e-learning-vao-day-hoc-cac-kien-thuc-hat-nhan-nguyen-tu-vat-li-12-thpt-theo-mo-hinh-lop-hoc-dao-nguoc), [Võ Văn Duyên Em và cộng sự](https://tcgd.tapchigiaoduc.edu.vn/index.php/tapchi/article/view/5570). Phân biệt phạm vi chương trình, môn và cấp học. |
| Nguồn thuyết minh cần đối chiếu riêng | Lê Thị Phượng và Bùi Phương Anh (2017), [thư mục thư viện](https://lib.hpu.edu.vn/jspui/bitstream/123456789/31124/1/Quan-ly-GD-so-10.pdf), xác nhận số 10, tr. 1–8, chưa dùng toàn văn để diễn giải hiệu quả. Lê Thị Cẩm Tú và Lê Thị Thu Hà (2024), [trang tạp chí](https://tcgd.tapchigiaoduc.edu.vn/index.php/tapchi/article/view/1475), xác nhận 24(4), tr. 7–12. Nguyễn Thị Thu Thủy và cộng sự (2026), [mục tạp chí](https://vjol.info.vn/tckh-dhdongnai/vi/article/view/217317) và [hồ sơ tác giả](https://scv.dnpu.edu.vn/thuyntt/bai-bao), xác nhận tập 211, số 02, tr. 1–15 theo đối chiếu. Truy cập toàn văn trực tiếp chưa ổn định, nên chỉ dùng phạm vi nghiên cứu, không dẫn hệ số hoặc kết quả chưa kiểm tra. |
| Thứ tự tác giả | Metadata trang bài Huỳnh/Lê liệt kê Lê trước. [PDF xuất bản, trang 537](https://journal.hcmue.edu.vn/index.php/hcmuejos/article/download/5418/3902/22938) ghi Huỳnh Thị Yến Nhi, Nguyễn Thị Thu Hương, Lê Anh Đức. Chọn thứ tự ở PDF và hướng dẫn trích dẫn trong chính PDF. |
| Khung SRL và lớp học đảo ngược | [Zimmerman](https://doi.org/10.1207/s15430421tip4102_2), [Panadero](https://doi.org/10.3389/fpsyg.2017.00422), [Bishop và Verleger](https://doi.org/10.18260/1-2--22585), [van Alten và cộng sự](https://doi.org/10.1016/j.edurev.2019.05.003), [Liu và cộng sự](https://www.sciencedirect.com/science/article/abs/pii/S0883035524000065), [Tunggyshbay và cộng sự](https://doi.org/10.29333/ejmste/13258). Các nguồn phục vụ cơ sở thiết kế, không dùng kết quả ở mẫu khác để điền mục 3.6. |
| AI và khoa học | [Almasri](https://doi.org/10.1007/s11165-024-10176-3), [Banihashem và cộng sự](https://doi.org/10.1186/s41239-025-00548-8), [Xia và cộng sự](https://doi.org/10.1016/j.compedu.2025.105465), [UNESCO 2023](https://doi.org/10.54675/EWZM9535), [khung UNESCO cho giáo viên](https://www.unesco.org/en/articles/ai-competency-framework-teachers), [Roy và cộng sự](https://d2tic4wvo1iusb.cloudfront.net/production/documents/projects/chatgpt_in_lesson_planning_-_evaluation_report.pdf). Hỗ trợ lập luận về thiết kế, đánh giá nguồn và trách nhiệm giáo viên. |
| Phương pháp và kiến thức chuyên ngành | [McKenney và Reeves](https://www.routledge.com/Conducting-Educational-Design-Research-2nd-Edition/McKenney-Reeves/p/book/9781138095564), [Krathwohl](https://doi.org/10.1207/s15430421tip4104_2), [Morales López và Tuzón Marco](https://doi.org/10.1007/s11191-021-00251-w), [OpenStax](https://openstax.org/details/books/college-physics-2e), [IAEA](https://www.iaea.org/topics/food-irradiation), [NIBIB](https://www.nibib.nih.gov/science-education/science-topics/nuclear-medicine), [trang phân phối Qwen](https://ollama.com/library/qwen3:4b-instruct-2507-q4_K_M). |

**Những giới hạn chưa xác minh trọn vẹn.** Hồ sơ video FuseSchool có tên, kênh và liên kết gốc đã được nhóm kiểm tra trước đây. Lần mở lại trang YouTube chưa xác nhận độc lập toàn bộ video, phụ đề, khả năng phát hoặc quyền tái sử dụng. Nguồn lịch sử Curie trong hồ sơ học liệu có metadata nhưng truy cập trực tiếp bị hạn chế. Chưa xác minh phiên bản SGK thực tế tại trường, kế hoạch giáo dục trường, quyền sử dụng toàn bộ hình sách hoặc thông báo tạp chí chấp nhận bài. Các tài liệu không được dùng để khẳng định tác động hoặc điền dữ liệu. Danh mục tham khảo chỉ ghi DOI khi có căn cứ và dùng “n.d.” cho trang chưa xác định ngày. Các đường dẫn trong Word của đề cương là liên kết có thể mở.
''')
add('''## 7. Dữ liệu và xác nhận còn cần nhóm cung cấp

1. Xác nhận bằng văn bản về số trường, số lớp mỗi điều kiện, cách chọn lớp, giáo viên, lịch dạy, sĩ số và lịch năm học 2026–2027. Xác nhận hai mốc đang ghi tháng 12/2027.
2. Phiên bản phiếu đã thẩm định và dữ liệu khảo sát có thời điểm, cách tuyển, số được mời/phản hồi/hợp lệ. Dự kiến 20–30 giáo viên và 150–250 học sinh chỉ là chỉ tiêu khảo sát.
3. Phiếu chuyên gia có chuyên môn, ngày, phiên bản học liệu, đánh giá từng tiêu chí và biên bản tiếp thu. Cần kết quả thử nhỏ và quyết định khóa phiên bản.
4. Phê duyệt của đơn vị, quy trình đồng thuận, kênh liên hệ, thời hạn lưu, người giữ bảng mã và quy tắc bảo vệ học sinh. Hoàn thiện mẫu ở Phụ lục I trước phát hành.
5. Một lượt thử có tài khoản giáo viên/học sinh, bằng chứng giao–làm–nộp–nhận–xuất, thử lỗi mạng và hai nhánh trợ giúp. Ghi cách xử lí lỗi ngoài phạm vi B21 và phương án thay thế nếu mô hình không sẵn sàng.
6. Bài tiền/hậu kiểm có mã cá nhân, lớp, điều kiện, dạng đề và thời điểm, rubric hai người chấm, nhật kí bài học, phiếu tuân thủ, sản phẩm trước/sau, vắng/rút lui và lý do thiếu. Tách tài khoản thử, dữ liệu mô hình và dữ liệu học sinh.
7. Xác nhận phân công tác giả, cơ quan/tình trạng tài trợ, mã số đề tài, xung đột lợi ích và các thông tin liên hệ trước gửi bài. Ngày nhận, chấp nhận và công bố chỉ cập nhật khi tạp chí thông báo.
''')
add(f'''## 8. Kiểm tra tính toàn vẹn và hiển thị

| Kiểm tra | Kết quả |
|---|---|
| Đề cương | {op} trang qua LibreOffice. {len(heads)} tiêu đề đúng thứ tự có nội dung, {len(toc)} mục cấp 1–2 trong mục lục tự động, số trang đệm khớp trang kết xuất. Tiêu đề cấp 3 có cấu trúc Heading để điều hướng trong Word. |
| Bảng và phương trình đề cương | {ot} bảng Word kể cả sơ đồ chu trình dạng bảng, {len(oq)} đối tượng toán OMML, logo SGU từ mẫu. Bảng có tên, nguồn và hàng tiêu đề lặp khi qua trang. |
| Bài báo | {ap} trang qua LibreOffice. Giữ nguyên {len(media)} tệp ảnh và 24 chú thích Hình 1–24. Giữ 2 bảng khoa học đánh số và 1 bảng bố trí phần đầu bài, tổng {at} bảng OOXML. Giữ {len(aq)} đối tượng OMML, gồm 2 công thức trình bày riêng và 3 kí hiệu trong dòng. |
| Sửa trực tiếp | {len(changes)} đoạn gốc được chỉnh về nội dung hoặc cách trích dẫn, cộng 1 đoạn tài liệu tham khảo. Hai phần khác với bản sao lưu là `word/document.xml` và `[Content_Types].xml`. Bản gốc thiếu khai báo jpg=image/jpeg cho 13 ảnh có đuôi .jpg, làm trình đọc python-docx báo lỗi. Đã thêm đúng một khai báo sau khi kiểm tra chữ ký ảnh. 11 mục mang đuôi .png cũng có nội dung JPEG và đã được gói gốc khai báo là image/jpeg. Mọi tệp ảnh, quan hệ, styles, header/footer và các phần còn lại giống theo byte. Nội dung OMML đối chiếu XML chuẩn hóa trùng bản gốc. |
| Khả năng mở và sửa | CRC của hai gói Word hợp lệ, toàn bộ XML/quan hệ đọc được, mở lại bằng thư viện xử lí Word và bằng LibreOffice để kết xuất. Các đoạn, bảng và phương trình là đối tượng Word có thể sửa. |
| Hiển thị | Đã kết xuất từng trang thành PNG và rà bố cục, chú thích, bảng, hình, phông chữ và phương trình. Đã chỉnh ngắt trang phần mục lục và Chương 3. Hình giao diện lớn và khoảng trắng ở một số trang bài báo được giữ theo mẫu gốc. Kiểm tra trên LibreOffice, chưa kiểm tra trên mọi phiên bản Microsoft Word. |
| Bảo toàn nguồn | 4 tệp Word gốc đã sao lưu riêng. {len(sourcehash)} tệp mã nguồn, tài sản, migration, kiểm thử và tệp cấu hình đã lấy dấu vân tay đầu kỳ được đối chiếu lại, không có tệp nào thay đổi. Các tệp Word nguồn ngoài bài báo vẫn trùng dấu vân tay ban đầu. |

**Dấu vân tay đầu ra (SHA-256)**

- Đề cương: `{sha(out)}`
- Bài báo đã chỉnh: `{sha(article)}`
- Bài báo gốc trong [thư mục sao lưu](sao_luu_nckh/20261104/): `{sha(back/article)}`

Để cập nhật lại mục lục sau khi sửa đề cương trong Microsoft Word, đặt con trỏ vào mục lục, chọn **Cập nhật bảng → Cập nhật toàn bộ bảng**. Số trang hiện tại đã được điền sẵn theo bản kết xuất ngày 04/11/2026.
''')
# Avoid blank lines between adjacent table rows.
s='\n'.join(report);s=re.sub(r'(?<=\|)\n\n(?=\|)','\n',s)
Path('BAO_CAO_DOI_CHIEU_NCKH.md').write_text(s)
print(stats)
