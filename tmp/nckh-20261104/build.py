from pathlib import Path
from zipfile import ZipFile
import io,re,json
from docx import Document
from docx.shared import Cm, Pt, RGBColor
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.text import WD_ALIGN_PARAGRAPH as A, WD_TAB_ALIGNMENT, WD_TAB_LEADER
from docx.oxml import OxmlElement as X
from docx.oxml.ns import qn
from docx.opc.constants import RELATIONSHIP_TYPE as RT

W=Path(__file__).parent
root=Path.cwd()
temp=next(root.glob('OK*.docx'))
doc=Document(temp)
body=doc._element.body
for el in list(body):
 if el.tag!=qn('w:sectPr'):body.remove(el)
sec=doc.sections[0]
sec.different_first_page_header_footer=True
sec.header.is_linked_to_previous=False
sec.footer.is_linked_to_previous=False
sec.header._element.clear_content() if hasattr(sec.header._element,'clear_content') else None
for h in [sec.header,sec.footer]:
 for el in list(h._element):h._element.remove(el)
 h.add_paragraph()
def node(tag,**attrs):
 e=X(tag)
 for k,v in attrs.items():e.set(qn(k),str(v))
 return e
def font(st,size,bold=False):
 st.font.name='Times New Roman';st.font.size=Pt(size);st.font.bold=bold;st.font.italic=False;st.font.color.rgb=RGBColor(0,0,0)
 rf=st.element.get_or_add_rPr().find(qn('w:rFonts'))
 for key in list(rf.attrib):
  if 'Theme' in key or 'theme' in key:del rf.attrib[key]
 for k in ('ascii','hAnsi','eastAsia','cs'):rf.set(qn('w:'+k),'Times New Roman')
def style(name,size,bold=False):
 try:s=doc.styles[name]
 except KeyError:s=doc.styles.add_style(name,WD_STYLE_TYPE.PARAGRAPH)
 font(s,size,bold)
 return s
norm=style('Normal',14); pf=norm.paragraph_format
pf.line_spacing=1.14;pf.space_after=Pt(5);pf.space_before=Pt(0);pf.first_line_indent=Cm(.75);pf.alignment=A.JUSTIFY;pf.keep_with_next=False;pf.keep_together=False;pf.widow_control=True
for nd,size in [(1,15),(2,14),(3,14)]:
 st=style('Heading '+str(nd),size,True); f=st.paragraph_format;f.space_before=Pt(11);f.space_after=Pt(5);f.keep_with_next=True;f.keep_together=True;f.first_line_indent=Cm(0);f.left_indent=Cm(0);f.line_spacing=1.10;f.alignment=A.LEFT
 for x in list(st.element.get_or_add_pPr()):
  if x.tag==qn('w:numPr'):st.element.get_or_add_pPr().remove(x)
st=style('Title',16,True)
for e in list(st.element.get_or_add_pPr()):
 if e.tag==qn('w:pBdr'):st.element.get_or_add_pPr().remove(e)
st.paragraph_format.first_line_indent=Cm(0)
for name,size in [('Body Source',11),('Biblio',12),('Table Body',11.5),('TOC Cached',12)]:
 st=style(name,size);st.base_style=norm;st.paragraph_format.first_line_indent=Cm(0);st.paragraph_format.space_after=Pt(4);st.paragraph_format.alignment=A.LEFT
st=doc.styles['Biblio'];st.paragraph_format.left_indent=Cm(.7);st.paragraph_format.first_line_indent=Cm(-.7);st.paragraph_format.keep_together=True
doc.styles['Body Source'].font.italic=True
doc.styles['Table Body'].paragraph_format.line_spacing=1.04
def field(p,command,cache=None):
 p.add_run()._r.append(node('w:fldChar',**{'w:fldCharType':'begin'}))
 el=node('w:instrText');el.set(qn('xml:space'),'preserve');el.text=' '+command+' ';p.add_run()._r.append(el)
 p.add_run()._r.append(node('w:fldChar',**{'w:fldCharType':'separate'}))
 if cache is not None:p.add_run(str(cache))
 p.add_run()._r.append(node('w:fldChar',**{'w:fldCharType':'end'}))
p=sec.footer.paragraphs[0];p.alignment=A.CENTER;p.paragraph_format.first_line_indent=Cm(0);field(p,'PAGE',1)
u=doc.settings.element.find(qn('w:updateFields'))
if u is None:u=node('w:updateFields');doc.settings.element.append(u)
u.set(qn('w:val'),'true')
title='Xây dựng và sử dụng học liệu số có hỗ trợ trí tuệ nhân tạo trong tổ chức dạy học theo mô hình lớp học đảo ngược nhằm phát triển năng lực tự học của học sinh qua chủ đề “Vật lí hạt nhân” môn Vật lí lớp 12 ở trường THPT'
doc.core_properties.title=title;doc.core_properties.author='Võ Đoàn Đăng Khôi, Nguyễn Bảo Thy, Bùi Ngọc Xuân Phương';doc.core_properties.subject='Đề cương nghiên cứu khoa học sinh viên'
def cover(txt,size=14,bold=False,before=0,after=4,sty=None):
 p=doc.add_paragraph(style=sty);p.alignment=A.CENTER;f=p.paragraph_format;f.first_line_indent=Cm(0);f.space_before=Pt(before);f.space_after=Pt(after);f.line_spacing=1.1
 r=p.add_run(txt);r.font.name='Times New Roman';r.font.size=Pt(size);r.bold=bold;return p
cover('ỦY BAN NHÂN DÂN THÀNH PHỐ HỒ CHÍ MINH',14,False,10)
cover('TRƯỜNG ĐẠI HỌC SÀI GÒN',15,True)
p=cover('',before=22,after=23)
with ZipFile(temp) as z:p.add_run().add_picture(io.BytesIO(z.read('word/media/image1.jpg')),width=Cm(2.7))
cover('ĐỀ CƯƠNG NGHIÊN CỨU KHOA HỌC',17,True,8,6,'Title')
cover('Đề tài nghiên cứu khoa học sinh viên cấp Trường',14,False,0,24)
cover(title,16,True,0,30)
cover('Nhóm ngành Khoa học Giáo dục',14,False,0,14)
for txt in ['Chủ nhiệm đề tài: Võ Đoàn Đăng Khôi','Thành viên: Nguyễn Bảo Thy, Bùi Ngọc Xuân Phương','Giảng viên hướng dẫn: PGS.TS. Nguyễn Thị Nhị']:
 cover(txt,14,False,0,6)
cover('Thành phố Hồ Chí Minh, tháng 11 năm 2026',14,False,30)
src={int(m[1]):m[2].strip() for m in re.finditer(r'^P(\d+) (.*)$',next((W/'extracted').glob('OK*.txt')).read_text().split('PART word/footnotes')[0],re.M)}
content={}
for file in sorted(W.glob('content-*.txt')):
 for m in re.finditer(r'(?ms)^@(\d+)\n(.*?)(?=^@\d+\n|\Z)',file.read_text()):content[int(m[1])]=m[2].strip().splitlines()
content[94][0]=content[94][0].replace('Khách thể là hoạt động dạy học Vật lí ở THPT.','Khách thể theo mục 11 của thuyết minh gồm học sinh lớp 12 và giáo viên Vật lí tại trường THPT được chọn để khảo sát và thực nghiệm.')
content[107].append('Một tiền lệ sát với đề tài là luận án của Trương Thị Phương Chi (2017). Tác giả đã xây dựng hệ thống E-learning, phiếu tự học ở nhà và tiến trình trên lớp cho chính nội dung hạt nhân nguyên tử lớp 12. Vì vậy, đóng góp cần kiểm tra ở nghiên cứu hiện nay nằm ở cách học sinh kiểm chứng gợi ý của AI, lưu dấu vết điều chỉnh và thực hiện nhiệm vụ theo Chương trình GDPT 2018. Một phép thử có ý nghĩa là xem người học còn tự giải thích được khi chuyển sang bài tương tự và bỏ trợ giúp hay không.')
content[118].append('Rubric bốn tiêu chí của phiếu học tập trên website phục vụ phản hồi trong bài. Khung TH1–TH10 phục vụ chấm nhiệm vụ nghiên cứu chung cho hai nhóm. Tiêu chí chuẩn bị trước giờ cung cấp minh chứng TH1–TH4. Giải thích và dùng dữ kiện liên hệ TH5–TH8. Vận dụng và tự sửa cung cấp minh chứng TH9–TH10 khi có bản đầu, bản sửa và câu hỏi cụ thể. Giáo viên phải chấm từ minh chứng gốc, không quy đổi cơ học điểm của hai công cụ.')
content[190].append('Sổ biên tập hiện ghi 232 mục nguồn, 207 mục đã đối chiếu và 25 mục chờ. Sáu ý đúng–sai chưa tạo được cụm đủ bốn ý nằm ngoài tập chọn đề. Bản ghi UI-0100 được chuyển về dự thảo vì các phương án nhiễu trùng nhau. Các số này thuộc hồ sơ biên tập và cần phân biệt với 212 bản ghi câu hỏi sẵn sàng dùng.')
content[260]=[s.replace('92,164','92,163').replace('28,296','28,296').replace('Phụ lục K.','Phụ lục J.') for s in content[260]]
content[254]=['Thiết kế đã xác định biến, công cụ và cách phân tích cho hai phương án số lớp. Số lớp, lịch dạy, công cụ và quy trình thu dữ liệu cần được xác nhận trước thực nghiệm. Việc đánh giá giả thuyết chờ dữ liệu thực tế.']
content[255]=(W/'refs.txt').read_text().strip().splitlines()
ids=sorted(content)
def heading(i):
 s=src[i].replace('vfa','và').replace('đề tái','đề tài').replace('3.6. kết quả','3.6. Kết quả').replace('  ',' ')
 if i in [105,179]:s=src[i-1]+' '+s
 return s
def level(i):
 if i in [61,105,179,225,255,260]:return 1
 return (2 if heading(i).split()[0].count('.')==(1 if i<100 else 2) else 3)
tocitems=[i for i in ids if level(i)<=2]
def bookmark(p,i):
 p._p.insert(1,node('w:bookmarkStart',**{'w:id':i,'w:name':f'nd_{i}'}));p._p.append(node('w:bookmarkEnd',**{'w:id':i}))
def paginate(p):p.paragraph_format.page_break_before=True
p=cover('MỤC LỤC',16,True,0,12);paginate(p)
maps=json.loads((W/'toc-pages.json').read_text()) if (W/'toc-pages.json').exists() else {}
for ind,i in enumerate(tocitems):
 p=doc.add_paragraph(style='TOC Cached');f=p.paragraph_format;f.keep_together=True;f.space_after=Pt(3);f.line_spacing=1.03;f.left_indent=Cm(0 if level(i)==1 else .45);f.tab_stops.add_tab_stop(Cm(16.05),WD_TAB_ALIGNMENT.RIGHT,WD_TAB_LEADER.DOTS)
 if i==179:paginate(p)
 if ind==0:
  p.add_run()._r.append(node('w:fldChar',**{'w:fldCharType':'begin'}))
  t=node('w:instrText');t.set(qn('xml:space'),'preserve');t.text=' TOC \\o "1-2" \\h \\z \\u ';p.add_run()._r.append(t)
  p.add_run()._r.append(node('w:fldChar',**{'w:fldCharType':'separate'}))
 r=p.add_run(heading(i));r.bold=level(i)==1;p.add_run('\t');field(p,'PAGEREF nd_'+str(i)+' \\h',maps.get(str(i),'1'))
 if ind==len(tocitems)-1:p.add_run()._r.append(node('w:fldChar',**{'w:fldCharType':'end'}))
def prose(s):
 p=doc.add_paragraph()
 if s.startswith('**'):
  parts=s[2:].split('**',1);p.add_run(parts[0]).bold=True;p.add_run(parts[1]);p.paragraph_format.first_line_indent=Cm(0)
  if not parts[1].strip():p.paragraph_format.keep_with_next=True
 else:p.add_run(s)
 return p
def bibliography(s):
 p=doc.add_paragraph(style='Biblio');a,_,url=s.partition(' https://')
 for j,t in enumerate(a.split('*')):p.add_run(t).italic=j%2==1
 if url:
  p.add_run(' ');link=node('w:hyperlink',**{'r:id':doc.part.relate_to('https://'+url,RT.HYPERLINK,is_external=True)});r=node('w:r');t=node('w:t');t.text='https://doi.org/'+url.split('doi.org/',1)[1] if 'doi.org/' in url else 'Nguồn trực tuyến';r.append(t);link.append(r);p._p.append(link)
def table(lines):
 data=[[v.strip() for v in l.strip().strip('|').split('|')] for l in lines];n=len(data[0]);tb=doc.add_table(rows=0,cols=n);tb.style='Table Grid';tb.autofit=False
 for col in tb.columns:col.width=Cm(16.2/n)
 for k,vals in enumerate(data):
  row=tb.add_row();trp=row._tr.get_or_add_trPr();trp.append(node('w:cantSplit'))
  if k==0:trp.append(node('w:tblHeader',**{'w:val':'true'}))
  for c,txt in zip(row.cells,vals):
   c.width=Cm(16.2/n);p=c.paragraphs[0];p.style='Table Body';p.paragraph_format.space_before=Pt(2);p.paragraph_format.space_after=Pt(2);p.add_run(txt).bold=k==0
   if k==0:c._tc.get_or_add_tcPr().append(node('w:shd',**{'w:fill':'E7ECF0'}));p.paragraph_format.keep_with_next=True
def mathrun(s):
 r=node('m:r');t=node('m:t');t.text=s;r.append(t);return r
def script(tag,base,v):
 x=node('m:'+tag);e=node('m:e');e.append(mathrun(base));x.append(e);e=node('m:'+('sub' if tag=='sSub' else 'sup'));e.append(mathrun(v));x.append(e);return x
def sub(s,v):return script('sSub',s,v)
def sup(s,v):return script('sSup',s,v)
def iso(sym,a,z):
 x=node('m:sPre')
 for tag,txt in [('sub',z),('sup',a),('e',sym)]:
  y=node('m:'+tag);y.append(mathrun(txt));x.append(y)
 return x
def equation(key):
 defs={
 'nuclear':[iso('X','A','Z'),',     A = Z + ',sub('N','n')],
 'binding':['Δm = Z',sub('m','p'),' + (A − Z)',sub('m','n'),' − ',sub('m','hn')],
 'atomic':['Δm ≈ Z',sub('m','H'),' + (A − Z)',sub('m','n'),' − ',sub('m','nt')],
 'energy':[sub('E','lk'),' = Δm',sup('c','2'),',     ε = ',sub('E','lk'),' / A'],
 'reaction':[iso('n','1','0'),' + ',iso('U','235','92'),' → ',iso('Ba','141','56'),' + ',iso('Kr','92','36'),' + 3',iso('n','1','0')],
 'qvalue':['Q = (Σ',sub('m','trước'),' − Σ',sub('m','sau'),')',sup('c','2')],
 'decay':['N(t) = ',sub('N','0'),sup('e','−λt'),' = ',sub('N','0'),' · ',sup('2','−t/T')],
 'activity':['H(t) = λN(t),     λ = ln 2 / T']}
 p=doc.add_paragraph();p.alignment=A.CENTER;p.paragraph_format.first_line_indent=Cm(0);m=node('m:oMath');p._p.append(m)
 for e in defs[key]:m.append(mathrun(e) if isinstance(e,str) else e)
for i in ids:
 p=doc.add_paragraph(heading(i),style='Heading '+str(level(i)));bookmark(p,i)
 if level(i)==1:paginate(p);p.alignment=A.CENTER
 lines=content[i];ix=0
 while ix<len(lines):
  s=lines[ix];ix+=1
  if i==255:bibliography(s);continue
  if s.startswith('|'):
   arr=[s]
   while ix<len(lines) and lines[ix].startswith('|'):arr.append(lines[ix]);ix+=1
   table(arr)
  elif s.startswith('!original'):
   a,b=map(int,s.split()[1:]);[prose(src[v]) for v in range(a,b+1)]
  elif s.startswith('!eq '):equation(s[4:])
  elif s.startswith('!caption '):
   p=doc.add_paragraph();p.paragraph_format.keep_with_next=True;p.paragraph_format.first_line_indent=Cm(0);p.add_run(s[9:]).bold=True
  elif s.startswith('!source '):doc.add_paragraph(s[8:],style='Body Source')
  elif s.strip():prose(s)
out=root/'DE_CUONG_NGHIEN_CUU_HOAN_CHINH.docx';doc.save(out)
(W/'heads.json').write_text(json.dumps({str(i):heading(i) for i in ids},ensure_ascii=False,indent=2))
print('Headings',len(ids),'TOC',len(tocitems),'paragraphs',len(doc.paragraphs),'tables',len(doc.tables),out.stat().st_size)
