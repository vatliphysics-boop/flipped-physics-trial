from pathlib import Path
import json, shutil, re
from datetime import datetime
from docx import Document
from docx.shared import Cm, Pt, RGBColor
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
ROOT=Path('/Users/vodoandangkhoi/Documents/WEB_WORKING_24-09')
OUT=ROOT/'BAI_BAO_KHOA_HOC_CAP_NHAT_HOC_LIEU.docx'
REF=ROOT/'docs/references'; FIG=ROOT/'docs/article-figures'
refs=[
 dict(id='moet2018',type='report',authors=[{'literal':'Bộ Giáo dục và Đào tạo'}],year=2018,title='Chương trình giáo dục phổ thông môn Vật lí',note='Ban hành kèm theo Thông tư số 32/2018/TT-BGDĐT',url='https://thcsandong.haiphong.edu.vn/van-ban-bo-gddt/chuong-trinh-giao-duc-pho-thong-mon-vat-ly-ban-hanh-kem-theo-thong-tu-so-322018/vbctmb/20343/91436',claim='Căn cứ chương trình và phạm vi hạt nhân; không phải chứng nhận chất lượng website.'),
 dict(id='fuseschool',type='motion_picture',authors=[{'literal':'FuseSchool – Global Education'}],title='What is nuclear fission? | Radioactivity | Physics | FuseSchool',publisher='YouTube',url='https://www.youtube.com/watch?v=D91T-B-PVE0',claim='Video B22 được nhúng có nhiệm vụ; tên/kênh đối chiếu YouTube oEmbed. Chưa xác nhận ngày tải lên, ghi n.d. thay vì lấy ngày từ trang đăng lại.'),
 dict(id='iaea',type='webpage',authors=[{'literal':'International Atomic Energy Agency'}],title='Food irradiation',url='https://www.iaea.org/topics/food-irradiation',claim='Nguồn đọc cho thảo luận ứng dụng chiếu xạ thực phẩm.'),
 dict(id='liu2024',type='article-journal',authors=[{'family':'Liu','given':'Lejia'},{'family':'Hew','given':'Khe Foon'},{'family':'Du','given':'Jiahui'}],year=2024,title='Design principles for supporting self-regulated learning in flipped classrooms: A systematic review',journal='International Journal of Educational Research',volume='124',article='102319',doi='10.1016/j.ijer.2024.102319',url='https://www.sciencedirect.com/science/article/abs/pii/S0883035524000065',claim='Tổng quan 22 nghiên cứu; cần kết hợp hướng dẫn và thực hành. Kết quả không được coi là hiệu quả của bản mẫu này.'),
 dict(id='mai2024',type='article-journal',authors=[{'family':'Mai','given':'Hoàng Phương'},{'family':'Hồ','given':'Văn Tài'},{'family':'Phan','given':'Thanh Thúy'},{'family':'Phạm','given':'Thụy Phương Uyên'},{'family':'Nguyễn','given':'Thị Mỹ Duyên'}],year=2024,title='Xây dựng và sử dụng học liệu số hỗ trợ dạy học mạch nội dung Động lượng – Vật lí 10 theo mô hình lớp học đảo ngược',journal='TNU Journal of Science and Technology',volume='229',issue='01/S',pages='197–206',doi='10.34238/tnu-jst.9209',url='https://jst.tnu.edu.vn/jst/article/view/9209',claim='Ví dụ nghiên cứu học liệu Vật lí ở Việt Nam; đối chiếu tên đủ trên tạp chí, chuẩn hóa họ tên Việt Nam, không chép số người tham gia sang nghiên cứu này.'),
 dict(id='mckenney2019',type='book',authors=[{'family':'McKenney','given':'Susan'},{'family':'Reeves','given':'Thomas C.'}],year=2019,title='Conducting educational design research',edition='2',publisher='Routledge',url='https://www.routledge.com/Conducting-Educational-Design-Research-2nd-Edition/McKenney-Reeves/p/book/9781138095564',claim='Cơ sở nghiên cứu thiết kế giáo dục; bản mẫu chỉ báo cáo pha trước sử dụng. Năm 2019 theo trang nhà xuất bản, không dùng ngày crawl.'),
 dict(id='miao2023',type='book',authors=[{'family':'Miao','given':'Fengchun'},{'family':'Holmes','given':'Wayne'}],year=2023,title='Guidance for generative AI in education and research',publisher='UNESCO',doi='10.54675/EWZM9535',url='https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research',claim='Vai trò quyết định của con người và kiểm tra sản phẩm có AI; tác giả/năm trên trang UNESCO, DOI đối chiếu Crossref.'),
 dict(id='nibib',type='webpage',authors=[{'literal':'National Institute of Biomedical Imaging and Bioengineering'}],title='Nuclear medicine',url='https://www.nibib.nih.gov/science-education/science-topics/nuclear-medicine',claim='Phân biệt PET ghi sự hủy positron và SPECT ghi gamma; không suy ra tỉ lệ sử dụng đồng vị hoặc lời khuyên điều trị.'),
 dict(id='ollama',type='webpage',authors=[{'literal':'Ollama'}],title='qwen3:4b-instruct-2507-q4_K_M',url='https://ollama.com/library/qwen3:4b-instruct-2507-q4_K_M',claim='Trang phân phối mô hình: Qwen3 4B Instruct, lượng tử hóa Q4_K_M, khoảng 2,5 GB. Nguồn mô tả kỹ thuật, không chứng minh hiệu quả sư phạm. Trang không xác lập ngày xuất bản bản ghi, dùng n.d.'),
 dict(id='utep',type='report',authors=[{'literal':'University of Texas at El Paso'}],title='Flipped classroom models',url='https://www.utep.edu/technologysupport/_Files/docs/Flipping-the-Class-Models.pdf',claim='Sáu ví dụ tổ chức lớp đảo ngược; chọn bốn dạng thiết kế, không gọi là phân loại bắt buộc của Bộ GDĐT. PDF không ghi năm, dùng n.d.'),
 dict(id='urone2022',type='book',authors=[{'family':'Urone','given':'Paul Peter'},{'family':'Hinrichs','given':'Roger'}],year=2022,title='College physics',edition='2',publisher='OpenStax',url='https://openstax.org/details/books/college-physics-2e',claim='Công thức bán rã, năng lượng liên kết, phân hạch và bảng khối lượng; tác giả/ngày 13/07/2022 kiểm tra mục Preface.',sections=['https://openstax.org/books/college-physics-2e/pages/31-5-half-life-and-activity','https://openstax.org/books/college-physics-2e/pages/31-6-binding-energy','https://openstax.org/books/college-physics-2e/pages/32-6-fission','https://openstax.org/books/college-physics-2e/pages/a-atomic-masses']),
 dict(id='vanalten2019',type='article-journal',authors=[{'family':'van Alten','given':'David C. D.'},{'family':'Phielix','given':'Chris'},{'family':'Janssen','given':'Jeroen'},{'family':'Kester','given':'Liesbeth'}],year=2019,title='Effects of flipping the classroom on learning outcomes and satisfaction: A meta-analysis',journal='Educational Research Review',volume='28',article='100281',doi='10.1016/j.edurev.2019.05.003',url='https://www.sciencedirect.com/science/article/pii/S1747938X18305694',claim='Tổng hợp 114 nghiên cứu, hiệu ứng nhỏ và khác biệt giữa các nghiên cứu; không khẳng định website này làm tăng thành tích.'),
 dict(id='vu2024',type='book',authors=[{'family':'Vũ','given':'Văn Hùng'},{'family':'Nguyễn','given':'Văn Biên'},{'family':'Trần','given':'Ngọc Chất'},{'family':'Phạm','given':'Kim Chung'},{'family':'Đặng','given':'Thanh Hải'},{'family':'Tưởng','given':'Duy Hải'},{'family':'Bùi','given':'Gia Thịnh'}],year=2024,title='Vật lí 12',note='Kết nối tri thức với cuộc sống; bản mẫu tháng 1/2024',publisher='Nhà xuất bản Giáo dục Việt Nam',claim='Tệp SGK cung cấp tại dự án, trang bìa và trang tên sách xác nhận tác giả/bản mẫu. Dùng trang in 90–122, không tự coi là bản tái bản mới nhất.'),
 dict(id='zimmerman2002',type='article-journal',authors=[{'family':'Zimmerman','given':'Barry J.'}],year=2002,title='Becoming a self-regulated learner: An overview',journal='Theory Into Practice',volume='41',issue='2',pages='64–70',doi='10.1207/s15430421tip4102_2',url='https://www.tandfonline.com/doi/abs/10.1207/s15430421tip4102_2',claim='Cơ sở lí thuyết tự điều chỉnh học tập; năm tập 41 là 2002, không dùng ngày số hóa 2010; không coi khung của bản mẫu là thang đo đã kiểm định.')
]

def initials(g):
 return ' '.join(w[0]+'.' for w in g.split() if w and w[0].isalpha())
def apa_authors(r):
 a=[p.get('literal') or f"{p['family']}, {initials(p['given'])}" for p in r['authors']]
 return a[0] if len(a)==1 else ', '.join(a[:-1])+', & '+a[-1]
def ref_segments(r):
 author=apa_authors(r)
 seg=[(author+("" if author.endswith(".") else ".")+f" ({r.get('year','n.d.')}). ",False)]
 if r['type']=='article-journal':
  seg += [(r['title']+'. ',False),(r['journal']+', '+r['volume'],True)]
  if r.get('issue'):seg.append(('('+r['issue']+')',False))
  seg.append((', '+('Article '+r['article'] if r.get('article') else r['pages'])+'. ',False))
 else:
  seg.append((r['title'],True))
  if r.get('edition'):seg.append((' (2nd ed.)',False))
  if r.get('note'):seg.append((' ('+r['note']+')',False))
  if r['type']=='motion_picture':seg.append((' [Video]',False))
  seg.append(('. ',False))
  if r.get('publisher'):seg.append((r['publisher']+'. ',False))
 link='https://doi.org/'+r['doi'] if r.get('doi') else r.get('url','')
 if link:seg.append((link,False))
 return seg

def export_refs():
 csl=[]; ris=[]; bib=[]; apa=[]
 for r in refs:
  apa.append(''.join(t for t,_ in ref_segments(r)))
  c={'id':r['id'],'type':r['type'],'title':r['title'],'author':r['authors']}
  for src,dst in [('journal','container-title'),('volume','volume'),('issue','issue'),('pages','page'),('article','page'),('publisher','publisher'),('edition','edition'),('doi','DOI'),('url','URL'),('note','note')]:
   if r.get(src):c[dst]=r[src]
  if r.get('year'):c['issued']={'date-parts':[[r['year']]]}
  csl.append(c)
  ty={'article-journal':'JOUR','book':'BOOK','motion_picture':'VIDEO','report':'RPRT','webpage':'ELEC'}[r['type']]
  lines=['TY  - '+ty,'ID  - '+r['id']]
  for a in r['authors']:lines.append('AU  - '+(a['literal']+',' if a.get('literal') else a['family']+', '+a['given']))
  if r.get('year'):lines.append('PY  - '+str(r['year']))
  lines.append('TI  - '+r['title'])
  for s,d in [('journal','JO'),('volume','VL'),('issue','IS'),('publisher','PB'),('edition','ET'),('doi','DO'),('url','UR')]:
   if r.get(s):lines.append(d+'  - '+r[s])
  if r.get('pages'):
   sp,ep=r['pages'].split('–');lines+=['SP  - '+sp,'EP  - '+ep]
  if r.get('article'):lines.append('SP  - '+r['article'])
  if r.get('note'):lines.append('N1  - '+r['note'])
  if not r.get('year'):lines.append('N1  - Ngày xuất bản chưa được nguồn chính thức cung cấp; hiển thị n.d. trong APA.')
  lines.append('ER  - ');ris.append('\n'.join(lines))
  bt='article' if r['type']=='article-journal' else 'book' if r['type']=='book' else 'misc'
  fields={'author':' and '.join('{'+a['literal']+'}' if a.get('literal') else a['family']+', '+a['given'] for a in r['authors']),'title':r['title']}
  for s,d in [('year','year'),('journal','journal'),('volume','volume'),('issue','number'),('pages','pages'),('article','pages'),('publisher','publisher'),('doi','doi'),('url','url'),('note','note')]:
   if r.get(s):fields[d]=str(r[s]).replace('–','--')
  if r.get('edition'):fields['edition']=r['edition']
  bib.append('@'+bt+'{'+r['id']+',\n'+',\n'.join('  '+k+' = {'+v+'}' for k,v in fields.items())+'\n}')
 REF.mkdir(exist_ok=True)
 (REF/'BAI_BAO_MENDELEY.ris').write_text('\n\n'.join(ris)+'\n',encoding='utf-8')
 (REF/'BAI_BAO_MENDELEY.bib').write_text('\n\n'.join(bib)+'\n',encoding='utf-8')
 (REF/'BAI_BAO_CSL.json').write_text(json.dumps(csl,ensure_ascii=False,indent=2),encoding='utf-8')
 (REF/'TAI_LIEU_THAM_KHAO_APA.txt').write_text('\n\n'.join(apa)+'\n',encoding='utf-8')
 log=['# Kiểm chứng nguồn của bài báo','Ngày kiểm tra 04/10/2026. Tên tác giả, năm, tiêu đề và DOI được đối chiếu trang nhà xuất bản, cơ quan phát hành hoặc bản tài liệu cung cấp. Ngày truy cập không thay cho năm xuất bản.','']
 for r in refs:
  log+=['## '+r['id'],'- '+r['claim'],'- Nguồn: '+r.get('url','Tệp SGK VẬT LÍ 12 KNTT.pdf do người dùng cung cấp')]
  if r.get('doi'):log+=['- DOI: https://doi.org/'+r['doi']]
  if r.get('sections'):log+=['- Trang kiểm tra: '+u for u in r['sections']]
  log+=['']
 log+=['## Sử dụng trong Mendeley','Nhập một trong hai tệp RIS hoặc BibTeX vào Mendeley Reference Manager, không nhập cả hai để tránh trùng. Chọn American Psychological Association 7th edition trong Mendeley Cite. Kiểm tra tác giả tổ chức được giữ nguyên và họ tên Việt Nam đúng các trường Family/Given; đối chiếu tệp APA đi kèm.','Bản Word có trích dẫn tác giả–năm và danh mục APA 7 bằng văn bản; chưa tạo trường trích dẫn Mendeley Cite và chưa thực hiện nhập trên tài khoản Mendeley của người dùng. RIS/BibTeX/CSL chứa cùng 14 nguồn. Nguồn không ghi năm được để trống năm, không gán năm 2026.']
 (REF/'KIEM_CHUNG_NGUON.md').write_text('\n'.join(log)+'\n',encoding='utf-8')
 return apa

if OUT.exists() and not (ROOT/'tmp/article/previous.docx').exists():shutil.copy2(OUT,ROOT/'tmp/article/previous.docx')
doc=Document(OUT)
for el in list(doc._element.body):
 if el.tag!=qn('w:sectPr'):doc._element.body.remove(el)
sec=doc.sections[0]
sec.top_margin=Cm(2);sec.bottom_margin=Cm(2)
sec.header_distance=Cm(0.8);sec.footer_distance=Cm(0.8)
# Keep A4 and 2.5 cm side margins of the supplied article.
for n in ['Normal','Title','Subtitle','Heading 1','Heading 2','Heading 3','Caption']:
 if n not in doc.styles:doc.styles.add_style(n,WD_STYLE_TYPE.PARAGRAPH)
 st=doc.styles[n];st.font.name='Times New Roman';st.font.color.rgb=RGBColor(0,0,0)
 st.element.rPr.rFonts.set(qn('w:eastAsia'),'Times New Roman')
 st.font.size=Pt(11.5 if n=='Normal' else 18 if n=='Title' else 13 if n=='Heading 1' else 12 if n in ['Heading 2','Heading 3'] else 10.5)
 for e in list(st.element.iter(qn('w:color'))):
  for attr in ['themeColor','themeTint','themeShade']:
   e.attrib.pop(qn('w:'+attr),None)
 for border in list(st.element.iter(qn('w:pBdr'))):border.getparent().remove(border)
 st.paragraph_format.space_after=Pt(6)
 st.paragraph_format.line_spacing=1.08
 st.paragraph_format.widow_control=True
 if n!='Normal':st.paragraph_format.first_line_indent=0
 if n.startswith('Heading'):st.font.bold=True;st.paragraph_format.keep_with_next=True;st.paragraph_format.space_before=Pt(9)
normal=doc.styles['Normal'];normal.paragraph_format.first_line_indent=Cm(.5)
for sect in doc.sections:
 for pf in [sect.header,sect.footer]:
  for child in list(pf._element):pf._element.remove(child)
  pf.add_paragraph()
footer=sec.footer.paragraphs[0];footer.alignment=WD_ALIGN_PARAGRAPH.CENTER
r=footer.add_run();r.font.size=Pt(10)
fld=OxmlElement('w:fldSimple');fld.set(qn('w:instr'),'PAGE');r._r.addnext(fld)

def p(text='',style=None):
 x=doc.add_paragraph(text,style=style)
 x.alignment=WD_ALIGN_PARAGRAPH.JUSTIFY if not style else WD_ALIGN_PARAGRAPH.LEFT
 return x

def h(text,level=1,new=False):
 if new:doc.add_page_break()
 return doc.add_heading(text,level)
def figure(file,num,caption):
 x=p();x.alignment=WD_ALIGN_PARAGRAPH.CENTER;x.paragraph_format.first_line_indent=0;x.paragraph_format.keep_with_next=True;x.paragraph_format.space_before=Pt(5)
 r=x.add_run();pic=r.add_picture(str(FIG/file),width=Cm(16))
 pic._inline.docPr.set('descr',caption)
 cp=p(f'Hình {num}. {caption}','Caption');cp.alignment=WD_ALIGN_PARAGRAPH.CENTER;cp.paragraph_format.first_line_indent=0;cp.paragraph_format.keep_together=True;cp.paragraph_format.space_after=Pt(9)

def table(caption,headers,rows,widths):
 cp=p(caption,'Caption');cp.paragraph_format.keep_with_next=True;cp.paragraph_format.first_line_indent=0
 t=doc.add_table(rows=1,cols=len(headers));t.alignment=WD_TABLE_ALIGNMENT.CENTER;t.autofit=False
 for col,w in zip(t.columns,widths):col.width=Cm(w)
 pr=t._tbl.tblPr
 borders=OxmlElement('w:tblBorders')
 for tag in ['top','left','bottom','right','insideH','insideV']:
  e=OxmlElement('w:'+tag);e.set(qn('w:val'),'single');e.set(qn('w:sz'),'4');e.set(qn('w:color'),'D9D9D9');borders.append(e)
 pr.append(borders)
 mar=OxmlElement('w:tblCellMar')
 for tag in ['top','bottom','left','right']:
  e=OxmlElement('w:'+tag);e.set(qn('w:w'),'95');e.set(qn('w:type'),'dxa');mar.append(e)
 pr.append(mar)
 for j,v in enumerate(headers):t.rows[0].cells[j].text=v
 rpt=OxmlElement('w:tblHeader');t.rows[0]._tr.get_or_add_trPr().append(rpt)
 for row in rows:
  cells=t.add_row().cells
  for j,v in enumerate(row):cells[j].text=v
 for i,row in enumerate(t.rows):
  cant=OxmlElement('w:cantSplit');row._tr.get_or_add_trPr().append(cant)
  for j,c in enumerate(row.cells):
   c.width=Cm(widths[j]);c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
   for pa in c.paragraphs:
    pa.paragraph_format.first_line_indent=0;pa.paragraph_format.space_after=Pt(3);pa.paragraph_format.space_before=Pt(2);pa.paragraph_format.line_spacing=1.04
    pa.alignment=WD_ALIGN_PARAGRAPH.CENTER if j==0 else WD_ALIGN_PARAGRAPH.LEFT
    for rr in pa.runs:rr.font.size=Pt(10.5);rr.font.bold=(i==0)
   if i==0:
    e=OxmlElement('w:shd');e.set(qn('w:fill'),'EDEDED');c._tc.get_or_add_tcPr().append(e)
 p().paragraph_format.space_after=Pt(0)
 return t

def mt(text):
 r=OxmlElement('m:r');t=OxmlElement('m:t');t.text=text;r.append(t);return r

def sub(base,val):
 e=OxmlElement('m:sSub');b=OxmlElement('m:e');b.append(mt(base));s=OxmlElement('m:sub');s.append(mt(val));e.extend([b,s]);return e

def sup(base,val):
 e=OxmlElement('m:sSup');b=OxmlElement('m:e');b.append(mt(base));s=OxmlElement('m:sup');s.append(mt(val));e.extend([b,s]);return e

def isotope(base,a,z):
 e=OxmlElement('m:sPre');b=OxmlElement('m:e');b.append(mt(base));ss=OxmlElement('m:sub');ss.append(mt(z));su=OxmlElement('m:sup');su.append(mt(a));e.extend([ss,su,b]);return e

def eq(parts):
 x=p();x.alignment=WD_ALIGN_PARAGRAPH.CENTER;x.paragraph_format.first_line_indent=0;x.paragraph_format.keep_together=True
 op=OxmlElement('m:oMathPara');o=OxmlElement('m:oMath')
 for e in parts:o.append(mt(e) if isinstance(e,str) else e)
 op.append(o);x._p.append(op)
 return x

# Front matter
x=p('Thiết kế học liệu số có hỗ trợ AI cho lớp học đảo ngược chủ đề Vật lí hạt nhân lớp 12','Title');x.alignment=WD_ALIGN_PARAGRAPH.CENTER;x.paragraph_format.first_line_indent=0
for s in ['Võ Đoàn Đăng Khôi¹, Nguyễn Bảo Thy¹, Bùi Ngọc Xuân Phương¹','¹Khoa Sư phạm Khoa học Tự nhiên, Trường Đại học Sài Gòn, Việt Nam','Tác giả liên hệ: Vatliphysics@gmail.com']:
 x=p(s);x.alignment=WD_ALIGN_PARAGRAPH.CENTER;x.paragraph_format.first_line_indent=0
h('Tóm tắt',2)
p('Bài báo trình bày thiết kế kho học liệu số cho các bài B21–B25 thuộc chủ đề Vật lí hạt nhân lớp 12. Nghiên cứu được giới hạn ở pha phân tích, thiết kế và kiến tạo theo định hướng lí thuyết, kèm kiểm tra nội bộ trước sử dụng. Tài liệu chương trình, sách giáo khoa và nghiên cứu về lớp học đảo ngược được dùng để xác định mục tiêu, nhiệm vụ và sản phẩm của ba pha học tập. Bản mẫu có 78 mục học liệu, 17 mô phỏng 3D, năm infographic tương tác, bốn đề tự luyện và bàn soạn kế hoạch với nhiệm vụ riêng cho giáo viên, học sinh. Các phép kiểm tra cụ thể gồm bảo toàn số khối và điện tích trong phân hạch, quy luật bán rã và quy ước khối lượng khi tính năng lượng liên kết. Kiểm tra phần mềm đạt 29 ca; ảnh chụp giao diện minh họa các chức năng đã xây dựng. Luồng giao và nộp nhiệm vụ qua tài khoản còn cần hoàn thiện cơ sở dữ liệu và kiểm thử. Chưa có dữ liệu học sinh hoặc thẩm định độc lập; kết quả phản ánh sản phẩm thiết kế, chưa chứng minh hiệu quả dạy học.')
x=p('Từ khóa: học liệu số; lớp học đảo ngược; Vật lí hạt nhân; nghiên cứu thiết kế giáo dục; tự học.');x.runs[0].italic=True
h('Abstract',2)
p('This paper reports the design of a digital resource repository for lessons B21–B25 in Grade 12 nuclear physics. The study is limited to theory-informed analysis, design and construction, with internal checks before use. Curriculum documents, a supplied textbook and flipped learning research informed the learning objectives, tasks and products across three phases. The prototype contains 78 resource entries, 17 interactive 3D simulations, five interactive infographics, four practice papers and a lesson planning workspace with separate teacher and student tasks. Concrete checks address conservation of mass number and charge in fission, radioactive decay and consistent mass conventions in binding energy calculations. Twenty-nine software tests passed, and interface screenshots document the implemented features. Account-based assignment and submission workflows require database completion and verification. No student outcome data or independent expert appraisal are reported; the findings concern design products rather than teaching effectiveness.')
x=p('Keywords: digital learning resources; flipped classroom; nuclear physics; educational design research; self-directed learning.');x.runs[0].italic=True

h('1 Đặt vấn đề',new=True)
p('Trong chủ đề Vật lí hạt nhân, học sinh phải liên hệ kí hiệu hạt nhân, phương trình phản ứng, đồ thị và ứng dụng thực tế. Nhiều quá trình không thể quan sát trực tiếp trong lớp học phổ thông. Nghiên cứu này lấy nội dung hạt nhân và phóng xạ trong chương trình môn Vật lí làm căn cứ, chọn phạm vi B21–B25 của bộ Kết nối tri thức với cuộc sống để xây dựng học liệu (Bộ Giáo dục và Đào tạo, 2018; Vũ et al., 2024). Mục tiêu thiết kế là giúp giáo viên giao nhiệm vụ rõ ràng và giúp học sinh tạo sản phẩm từ thao tác, thay vì chỉ mở tài liệu.')
p('Lớp học đảo ngược tổ chức việc chuẩn bị trước giờ và vận dụng kiến thức trong giờ học. Tổng hợp 114 nghiên cứu của van Alten et al. (2019) ghi nhận hiệu ứng tích cực nhỏ đối với kết quả học tập, đồng thời cho thấy khác biệt đáng kể giữa các nghiên cứu. Liu et al. (2024), qua tổng quan 22 nghiên cứu thực nghiệm, nhấn mạnh việc kết hợp hướng dẫn và thực hành để hỗ trợ tự điều chỉnh học tập. Các kết quả này cung cấp căn cứ thiết kế, không thay thế bằng chứng về hiệu quả của sản phẩm đang xây dựng.')
p('Ở Việt Nam, Mai et al. (2024) đã xây dựng học liệu số cho nội dung Động lượng lớp 10 theo mô hình lớp học đảo ngược. Nghiên cứu hiện tại lựa chọn một chủ đề khác, đồng thời thiết kế thao tác 3D, nhiệm vụ quan sát và công cụ biên soạn kế hoạch trong cùng một kho. Câu hỏi nghiên cứu là: có thể tổ chức học liệu B21–B25 thành sản phẩm nào để giáo viên lựa chọn, điều chỉnh nhiệm vụ và học sinh quan sát, giải thích, tự kiểm tra; sản phẩm đã được kiểm tra đến mức nào trước sử dụng?')
h('2 Phương pháp nghiên cứu')
h('2 1 Phạm vi và tư liệu thiết kế',2)
p('Nghiên cứu áp dụng định hướng nghiên cứu thiết kế giáo dục có cơ sở lí thuyết, tham khảo McKenney và Reeves (2019). Báo cáo giới hạn ở ba hoạt động: phân tích vấn đề và điều kiện; thiết kế giải pháp; kiến tạo và kiểm tra nội bộ sản phẩm trước sử dụng. Chưa thực hiện chu trình triển khai, đánh giá và cải tiến dựa trên dữ liệu lớp học; do đó không mô tả nghiên cứu này như một nghiên cứu thực nghiệm đã hoàn tất.')
p('Tư liệu gồm chương trình môn Vật lí, bản SGK được cung cấp, yêu cầu thiết kế học liệu, tài liệu về lớp học đảo ngược và nguồn kiến thức vật lí. Bản SGK sử dụng ghi “bản mẫu tháng 1/2024”; việc áp dụng trên lớp cần rà soát với bản sách đang dùng. Phiên bản sản phẩm được kiểm tra ngày 04/10/2026. Đơn vị phân tích là mục học liệu, hoạt động học, trường sản phẩm và chức năng phần mềm; không có mẫu học sinh trong báo cáo này.')

h('2 2 Quy trình phân tích thiết kế và kiến tạo',2,new=True)
p('Ở bước phân tích, các yêu cầu được chuyển thành ma trận nội dung, thao tác và bằng chứng dự kiến. Khó khăn được xác định từ đặc điểm nội dung và điều kiện thiết kế; chưa tiến hành khảo sát để khẳng định nhu cầu của một quần thể giáo viên. Ở bước thiết kế, mỗi hoạt động có mục tiêu, nhiệm vụ, học liệu, sản phẩm và tiêu chí nhận xét. Ở bước kiến tạo, các chức năng được triển khai rồi sửa theo kết quả đối chiếu nguồn, tính lại số liệu và kiểm tra giao diện.')
table('Bảng 1. Nội dung và sản phẩm học tập dự kiến trong phạm vi B21–B25',['Bài','Trọng tâm và thao tác','Sản phẩm dự kiến'],[
['B21','Thay Z, N; quan sát tán xạ α và đồng vị.','Bảng A–Z–N và giải thích đường đi của α.'],
['B22','Cân bằng phản ứng; xem các bước phân hạch; tính độ hụt khối.','Phương trình và hai phép kiểm tra bảo toàn.'],
['B23','Đổi T, N₀; đọc bảng và đồ thị; phân biệt các tia.','Dự đoán, bảng t–N và giải thích sự thay đổi.'],
['B24','Theo dõi chuyển hóa năng lượng; thảo luận ứng dụng.','Sơ đồ năng lượng, lập luận và nguồn dẫn chứng.'],
['B25','Ước lượng T từ H(t); cân bằng và kiểm tra phép tính.','Đồ thị, kết quả có đơn vị và nhận xét sai khác.']
],[1.2,8,6.8])
p('AI được dùng hỗ trợ dự thảo nội dung, câu hỏi và mã của học liệu. Công thức, số liệu và thông tin dẫn nguồn phải được đối chiếu lại; AI không cung cấp dữ liệu thực nghiệm và không quyết định điểm chính thức. Cách sử dụng này đặt trách nhiệm kiểm tra ở người thiết kế và giáo viên, phù hợp định hướng coi con người giữ vai trò quyết định trong giáo dục có AI (Miao & Holmes, 2023).')
h('2 3 Cách kiểm tra và giới hạn bằng chứng',2)
p('Kiểm tra nội bộ gồm: đối chiếu nội dung với nguồn; tính lại các trường hợp định lượng; kiểm tra tự động quy tắc dữ liệu và chấm phần khách quan; thao tác trình duyệt ở chiều rộng 900 px và 390 px; kiểm tra đọc trạng thái cơ sở dữ liệu. Mỗi nhận xét được gắn với kết quả có thể kiểm tra lại. Ảnh trong bài là ảnh chụp giao diện bản mẫu ngày 04/10/2026, không phải bài làm học sinh. Kiểm tra nội bộ không được gọi là ý kiến chuyên gia độc lập hay bằng chứng giá trị của công cụ đánh giá.')

h('3 Kết quả thiết kế',new=True)
h('3 1 Kho học liệu và đường truy cập',2)
p('Kho mở tập hợp 78 mục được gắn bài và loại học liệu: 17 mô phỏng 3D, sáu mục ảnh hoặc sơ đồ, năm minh họa động, 11 mục video, 18 tài liệu hoặc phiếu, 17 câu hỏi hoặc hoạt động nhóm và bốn đề kiểm tra mẫu. Đây là số mục trong danh mục, không phải 78 nội dung hoàn toàn khác nhau; một số mục liên kết tới nguồn ngoài hoặc cùng học liệu được dùng ở nhiều vị trí. Menu xổ và bộ lọc giúp chọn bài, loại và mục đích sử dụng (Hình 1).')
figure('01-kho-hoc-lieu.png',1,'Kho mở với menu học liệu và các lối vào theo bài B21–B25.')
p('Giáo viên có thể chuyển học liệu đang xem sang bàn soạn kế hoạch. Học sinh có thể mở kho để tự luyện. Hoạt động công khai và thao tác lưu trên trình duyệt được phân biệt với nhiệm vụ được giao trong lớp có tài khoản; việc xem kho không tự chứng minh học sinh đã hoàn thành nhiệm vụ học tập.')

h('3 2 Hình thức tổ chức lớp học đảo ngược',2,new=True)
p('Tài liệu của University of Texas at El Paso (n.d.) nêu sáu cách tổ chức lớp học đảo ngược. Bản mẫu chọn bốn cách để xây dựng hướng dẫn và mẫu kế hoạch: học trước rồi luyện tập; minh họa rồi thực hành; thảo luận; làm việc nhóm (Hình 2). Học hoàn toàn trực tuyến và học sinh tạo video chưa được triển khai đầy đủ. Đây là lựa chọn thiết kế của nghiên cứu, không phải danh sách hình thức bắt buộc của Bộ Giáo dục và Đào tạo.')
figure('02-hinh-thuc-lop-hoc.png',2,'Bốn lựa chọn tổ chức có hướng dẫn và mẫu kế hoạch để điều chỉnh.')
p('Học trước rồi luyện tập được minh họa bằng B23: dự đoán số hạt ở nhà, xử lí bảng và giải thích trên lớp. Minh họa rồi thực hành được minh họa bằng B25: xem hướng dẫn, thao tác và trình bày kết quả. B24 sử dụng thảo luận theo vai hoặc sản phẩm nhóm. Video, mô phỏng, infographic và phiếu là loại học liệu có thể kết hợp trong các hình thức này, không phải các hình thức lớp học riêng.')

h('3 3 Infographic tương tác và cách dùng hình',2,new=True)
p('Năm infographic của B21–B25 có các điểm chọn để mở phần quan sát, giải thích và câu hỏi. Ở B22, hình thể hiện neutron tới, U-236 kích thích và hai mảnh phân hạch; hai dòng phép cộng giúp học sinh kiểm tra số khối và điện tích (Hình 3). Nội dung phương trình được đối chiếu ví dụ trong SGK, trang in 100–101 (Vũ et al., 2024).')
figure('03-infographic.png',3,'Infographic B22 thể hiện một kênh phân hạch và các điểm tương tác.')
p('Hình có bản PNG để chèn vào bài giảng hoặc phiếu, bản SVG để chỉnh sửa bằng phần mềm hỗ trợ và chế độ xem lớn. Nhãn nút nêu công dụng của từng định dạng. Màu và kích thước được quy ước; hình không được dùng làm phép đo cấu trúc hay khoảng cách thực của hạt nhân.')

h('3 4 Mô phỏng phân hạch trong không gian 3D',2,new=True)
p('Học sinh nhấn bắt đầu rồi quan sát bốn bước: neutron tới, hấp thụ, biến dạng và tách mảnh. Có thể tạm dừng, đặt lại, xem lại thời điểm và đổi góc nhìn. Một kênh được chọn để minh họa, không đại diện cho mọi sản phẩm phân hạch (Vũ et al., 2024; Urone & Hinrichs, 2022, mục 32.6).')
eq([isotope('n','1','0'),' + ',isotope('U','235','92'),' → ',isotope('U','236','92'),'* → ',isotope('Y','95','39'),' + ',isotope('I','138','53'),' + 3',isotope('n','1','0')])
figure('04-phan-hach.png',4,'Cảnh sau phân hạch với hai mảnh Y-95, I-138 và ba neutron tự do.')
p('Mô hình sử dụng 236 nucleon. Trước phản ứng, 235 + 1 = 236 và điện tích là 92; sau phản ứng, 95 + 138 + 3 = 236 và 39 + 53 = 92. Học sinh đếm neutron và giải thích khả năng neutron thoát ra hoặc bị hấp thụ. Với hệ số nhân k > 1, mô hình thể hiện sự tăng qua các thế hệ; không dùng điều kiện này để tự kết luận xảy ra vụ nổ.')

h('3 5 Video nguồn kèm nhiệm vụ quan sát',2,new=True)
p('Năm video YouTube được bổ sung theo bài, bên cạnh các liên kết bài giảng và video buồng sương. Trình phát chỉ kết nối YouTube khi học sinh mở; tên video, kênh và liên kết nguồn được giữ lại. Ví dụ B22 dùng video của FuseSchool – Global Education (n.d.) với nhiệm vụ nhận diện neutron tới, mảnh phân hạch và neutron sinh ra (Hình 5).')
figure('05-video-nhiem-vu.png',5,'Video B22 và nhiệm vụ quan sát bằng tiếng Việt trước khi mở trình phát.')
p('Các video được chọn là tiếng Anh, còn câu hỏi và hướng dẫn là tiếng Việt. Giáo viên cần kiểm tra khả năng hiểu ngôn ngữ và phụ đề trước khi giao. Tên và kênh của năm video đã được đối chiếu qua thông tin YouTube; video B22 đã được thử phát. Không suy rộng phép kiểm tra này thành việc mọi video đều phát ổn định trên mọi mạng hoặc thiết bị. Trường hợp không nhúng được có liên kết mở nguồn.')

h('3 6 Đồ thị bán rã và phép kiểm tra định lượng',2,new=True)
p('B23 cho thay đổi chu kì bán rã T và số hạt ban đầu N₀, đồng thời cập nhật đồ thị và bảng. Mô hình dùng quy luật hàm mũ; độ phóng xạ được liên hệ với số hạt qua H = λN, trong đó λ = ln 2/T (Urone & Hinrichs, 2022, mục 31.5). Số liệu trên Hình 6 là giá trị tính của mô hình.')
eq(['N(t) = ',sub('N','0'),' × ',sup('2','−t/T')])
figure('08-ban-ra.png',6,'Đồ thị và bảng khi N₀ = 1.000 và T = 30 s trong hoạt động B23.')
p('Với N₀ = 1.000, T = 30 s, giá trị tại t = 30 s là 500, sau 2T là 250 và sau 3T là 125. Khi tăng T lên 60 s, giá trị tại cùng t = 30 s khoảng 707,1; tăng N₀ gấp đôi sẽ tăng giá trị này gấp đôi. Đây là các trường hợp kiểm tra phép tính và phản hồi giao diện. Tham số của cảnh 3D được điều chỉnh riêng với bảng định lượng và được thông báo trên giao diện.')

h('3 7 Quy ước khối lượng và năng lượng liên kết',2,new=True)
p('Hoạt động B25 dùng thống nhất khối lượng nguyên tử trung hòa. Công thức độ hụt khối sử dụng khối lượng nguyên tử ¹H thay cho khối lượng proton; bỏ qua năng lượng liên kết electron. Khối lượng được đối chiếu bảng A.1 và công thức ở mục 31.6 của Urone và Hinrichs (2022).')
eq(['Δm = Z',sub('m','H'),' + (A − Z)',sub('m','n'),' − ',sub('m','nguyên tử'),';   E = Δm',sup('c','2')])
figure('09-nang-luong-lien-ket.png',7,'Các bước tính độ hụt khối và năng lượng liên kết của U-235.')
p('Ví dụ U-235 có Z = 92, N = 143, khối lượng nguyên tử 235,043924 u. Với mH = 1,007825 u và mn = 1,008665 u, tổng khối lượng là 236,958990 u, độ hụt khối 1,915066 u; dùng 931,5 MeV cho mỗi u cho E ≈ 1.783,9 MeV và E/A ≈ 7,59 MeV/nucleon. Giao diện làm tròn độ hụt khối thành 1,91507 u. Kiểm tra này đã dẫn đến sửa lỗi trộn hai quy ước khối lượng; không phải phép đo mới.')

h('3 8 Bàn soạn kế hoạch và nhiệm vụ của hai vai',2,new=True)
p('Bàn soạn có năm mẫu bài và kế hoạch trống. Giáo viên có thể sửa mục tiêu, thời lượng, học liệu, nhiệm vụ, sản phẩm, tiêu chí và hỗ trợ; mỗi hoạt động có trường riêng cho giáo viên và học sinh. Ở ví dụ thảo luận B24, giáo viên phân vai và yêu cầu bằng chứng, còn học sinh trình bày, phản biện và điều chỉnh kết luận (Hình 8).')
figure('07-ke-hoach-hai-vai.png',8,'Nhiệm vụ giáo viên và học sinh trong kế hoạch thảo luận B24.')
p('Trước giờ, giáo viên chọn nguồn và câu hỏi; học sinh chuẩn bị lập luận cá nhân. Trong giờ, hai vai cùng làm việc với sản phẩm nhưng có nhiệm vụ khác nhau. Sau giờ, giáo viên nhận xét, học sinh sửa giải thích và nêu điều cần học tiếp. Mẫu B24 còn dùng nguồn NIBIB để phân biệt PET với SPECT và nguồn IAEA cho ứng dụng thực phẩm (International Atomic Energy Agency, n.d.; National Institute of Biomedical Imaging and Bioengineering, n.d.). Kế hoạch lưu trên thiết bị có thể tiếp tục chỉnh sửa; lưu tài khoản và đưa vào lớp chưa được xác nhận vận hành.')

h('3 9 Bản ghi quan sát và phản tư tự học',2,new=True)
p('Bản ghi gồm dự đoán, điều quan sát, giải thích và câu hỏi mang đến lớp (Hình 9). Thiết kế hướng tới việc lưu dấu quá trình chuẩn bị và kiểm tra cách hiểu. Cơ sở lí thuyết là tự điều chỉnh học tập và sự cần thiết của hướng dẫn trong lớp đảo ngược (Zimmerman, 2002; Liu et al., 2024).')
figure('06-ban-ghi.png',9,'Bốn trường của bản ghi quan sát; giao diện trống, chưa có dữ liệu học sinh.')
p('Ví dụ nhiệm vụ B22 yêu cầu ghi số neutron dự đoán, số quan sát ở bước cuối và cách kiểm tra phương trình. Giáo viên có thể nhận xét sự khác nhau giữa dự đoán và giải thích, thay vì căn cứ riêng số lần nhấn nút. Khung đề xuất theo dõi bốn biểu hiện: đặt mục tiêu hoặc kế hoạch; theo dõi; giải thích có nguồn; tự điều chỉnh. Đây là khung thiết kế chưa kiểm định, không được dùng để tuyên bố mức tăng năng lực tự học. Bản ghi ở kho mở tự lưu trên trình duyệt, chưa tự gửi cho giáo viên.')

h('3 10 Đề tự luyện giữa kỳ và cuối kỳ theo chủ đề',2,new=True)
p('Kho có hai mã đề giữa kỳ trong phạm vi B21–B23 và hai mã đề cuối kỳ trong phạm vi B21–B25. Mỗi đề gồm 18 câu, thang 10 điểm; phần khách quan tối đa tám điểm, tự luận hai điểm cần giáo viên chấm. Thời gian mẫu là 45 phút và 60 phút. Hình 10 minh họa một lượt mở đề cuối kỳ, chưa chọn đáp án.')
figure('10-de-kiem-tra.png',10,'Giao diện đề cuối kỳ mã A với phạm vi, thời gian và câu hỏi B21.')
p('Câu minh họa yêu cầu tìm số neutron khi A = 23 và Z = 11; đáp số là 12. Các ca kiểm tra chấm điểm xét câu bỏ trống, đúng–sai từng ý, dấu phẩy thập phân và dung sai đáp số. Ma trận và hướng dẫn chấm được cung cấp để giáo viên rà soát. Đề công khai là tài liệu tự luyện theo chủ đề, chưa là công cụ thực nghiệm có độ tin cậy và độ giá trị đã xác lập; không đại diện cho toàn bộ học kỳ Vật lí 12.')

h('3 11 Hỗ trợ học tập và xử lí học liệu bằng AI cục bộ',2,new=True)
p('Bản mẫu bổ sung nút AI tròn ở góc phải trang học tập. Học sinh mở khung nhỏ, chọn bài B21–B25 và đặt câu hỏi mà không rời học liệu (Hình 11). Mô hình Qwen3 4B Instruct chạy qua Ollama trên máy chủ của hệ thống, không dùng khóa của dịch vụ AI thương mại; thông số mô hình được công bố tại trang phân phối (Ollama, n.d.). Liên kết Gemini và ChatGPT là lựa chọn mở dịch vụ bên ngoài, không phải hai mô hình được nhúng vào khung chat.')
figure('11-ai-cuc-bo.png',11,'Khung AI ở bài B23 trong lượt kiểm tra nội bộ; câu hỏi do người kiểm tra nhập, không phải dữ liệu học sinh.')
p('Chế độ gợi ý yêu cầu AI chọn mã đoạn kiến thức và đặt một câu hỏi tiếp theo; hệ thống trích nguyên văn đoạn đã chọn để hạn chế việc làm thay. Chế độ giải thích tạo phản hồi từ bản tóm tắt bài học, không đọc hồ sơ, điểm hoặc bài nộp của lớp. Lượt thử carbon-14 cho N = 14 − 6 = 8; lượt thử bán rã với N₀ = 800 sau 2T cho giá trị trung bình 200. Các lượt thử chỉ kiểm tra những trường hợp đã nêu, chưa xác lập độ chính xác của AI trên toàn bộ câu hỏi.')
p('Giáo viên có chức năng đọc TXT, DOCX và PDF có văn bản để tóm tắt, rút ý chính hoặc gợi ý câu hỏi. Văn bản trích xuất được hiển thị trước khi xử lí; phản hồi kèm các đoạn làm căn cứ và được ghi là bản nháp. Đã thử ba tác vụ với kiến thức phóng xạ và xác nhận yêu cầu chưa đăng nhập bị từ chối; chưa kiểm thử toàn bộ luồng bằng tài khoản giáo viên thật. Phản hồi vẫn có thể thiếu điều kiện áp dụng hoặc diễn đạt chưa chính xác. Giới hạn một yêu cầu tạo phản hồi đồng thời trên máy thử 8 GB chưa chứng minh khả năng phục vụ cả lớp. Việc kiểm tra và quyết định sử dụng thuộc giáo viên (Miao & Holmes, 2023).')

h('3 12 Kết quả kiểm tra nội bộ và việc cần hoàn thiện',2,new=True)
table('Bảng 2. Bằng chứng kiểm tra sản phẩm đến ngày 04/10/2026',['Hạng mục','Bằng chứng cụ thể','Giới hạn'],[
['Kiến thức và tính toán','Bảo toàn A/Z; bán rã; cùng quy ước khối lượng cho năm hạt nhân.','Đối chiếu các ví dụ, chưa là thẩm định toàn bộ bởi chuyên gia độc lập.'],
['Phần mềm','29/29 ca kiểm tra đạt; build đạt; lint không có lỗi, còn một cảnh báo có sẵn.','Không thay thế kiểm thử tài khoản và nghiên cứu trên lớp.'],
['Giao diện','Chụp 11 giao diện; đề kiểm tra ở 390 px không tràn ngang sau sửa.','Không suy rộng cho mọi thiết bị và công nghệ hỗ trợ.'],
['Video và lưu cục bộ','Năm tên/kênh được xác nhận; B22 thử phát; lưu/tải lại bản ghi và kế hoạch đã kiểm tra.','Chưa thử phát tất cả video; tải Blob chưa được xác nhận trên trình duyệt kiểm tra.'],
['Giao và nộp qua lớp','API cơ sở dữ liệu trả PGRST205 ở bảng lộ trình, tiến độ và kế hoạch.','Cần hoàn thiện migration/schema và kiểm thử hai vai có tài khoản thật.'],
['Đánh giá sư phạm','Có nhiệm vụ, sản phẩm và khung nhận xét để chuẩn bị thẩm định.','Chưa có ý kiến chuyên gia độc lập, dữ liệu học sinh hoặc kết quả hiệu quả.']
],[3.1,6.6,6.3])
p('Các lỗi được phát hiện và sửa gồm trộn khối lượng nguyên tử với khối lượng hạt nhân ở B25, giải thích k > 1 quá mức, diễn đạt chưa rõ sự khác nhau giữa PET và SPECT, cùng bố cục lựa chọn đáp án trên màn hình hẹp. Việc ghi lại lỗi và căn cứ sửa cho thấy quá trình kiểm tra đã tác động tới sản phẩm; số ca đạt chỉ xác nhận các tình huống đã xét.')
h('4 Thảo luận')
p('Đóng góp của sản phẩm là kết nối thao tác trực quan với nhiệm vụ và bằng chứng học tập, đồng thời để giáo viên điều chỉnh kế hoạch theo lớp. Ví dụ phân hạch yêu cầu học sinh kiểm tra hai tổng bảo toàn; đồ thị bán rã yêu cầu giữ một tham số và thay tham số còn lại; bản ghi yêu cầu giải thích điều quan sát. Các thiết kế này cụ thể hóa định hướng hỗ trợ học tập, nhưng chưa đủ để kết luận tăng hứng thú, thành tích hay năng lực tự học. Kết quả tổng quan của van Alten et al. (2019) và Liu et al. (2024) càng cho thấy cần đánh giá trong bối cảnh sử dụng thực tế.')
p('Trước khi sử dụng trong thực nghiệm sư phạm, cần hoàn thiện luồng tài khoản, giao và nộp; tổ chức thẩm định nội dung, mức phù hợp nhiệm vụ và tiêu chí đánh giá; kiểm tra thiết bị, mạng và ngôn ngữ video ở lớp dự kiến. Sau đó mới xác lập người tham gia, kế hoạch thu thập dữ liệu và công cụ đánh giá phù hợp. Các thông tin này là công việc tiếp theo, không được trình bày như đã hoàn thành. Phạm vi báo cáo hiện tại phù hợp pha thiết kế trước sử dụng theo McKenney và Reeves (2019).')
h('5 Kết luận')
p('Nghiên cứu đã kiến tạo bản mẫu học liệu B21–B25 với kho truy cập theo bài, mô phỏng 3D, hình tương tác, video có nhiệm vụ, bản ghi, đề tự luyện và bàn soạn kế hoạch phân rõ hai vai. Bài báo cung cấp ảnh giao diện và các phép kiểm tra cụ thể thay cho nhận định hiệu quả chung. Sản phẩm đã qua kiểm tra nội bộ và còn cần hoàn thiện vận hành tài khoản, thẩm định độc lập trước triển khai trên lớp. Chưa có cơ sở để báo cáo kết quả thực nghiệm hoặc khẳng định tác động tới học sinh.')

h('Tài liệu tham khảo',new=True)
apa=export_refs()
for r in refs:
 x=p();x.paragraph_format.first_line_indent=Cm(-.7);x.paragraph_format.left_indent=Cm(.7);x.paragraph_format.space_after=Pt(9);x.paragraph_format.keep_together=True;x.alignment=WD_ALIGN_PARAGRAPH.LEFT
 for text,it in ref_segments(r):x.add_run(text).italic=it
# Remove tracked changes/comments inherited from source packaging and set descriptive properties.
doc.core_properties.title='Thiết kế học liệu số có hỗ trợ AI cho lớp học đảo ngược chủ đề Vật lí hạt nhân lớp 12'
doc.core_properties.subject='Nghiên cứu thiết kế giáo dục trong phạm vi phân tích thiết kế và kiến tạo trước sử dụng'
doc.core_properties.author='Võ Đoàn Đăng Khôi; Nguyễn Bảo Thy; Bùi Ngọc Xuân Phương'
doc.core_properties.keywords='Vật lí 12, học liệu số, lớp học đảo ngược, APA'
doc.core_properties.comments=''
doc.save(OUT)
# Full text mirror for source/citation review only.
text='\n\n'.join(pa.text for pa in doc.paragraphs if pa.text)
(ROOT/'tmp/article/article-text.txt').write_text(text,encoding='utf-8')
print(json.dumps({'output':str(OUT),'figures':len(doc.inline_shapes),'references':len(refs),'paragraphs':len(doc.paragraphs),'tables':len(doc.tables)},ensure_ascii=False))
