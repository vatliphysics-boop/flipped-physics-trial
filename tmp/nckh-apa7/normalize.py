from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from lxml import etree as E
from copy import deepcopy
import json,re,unicodedata,hashlib

ROOT=Path(__file__).resolve().parents[2]
WORK=Path(__file__).parent
BACK=ROOT/'sao_luu_nckh/20261104_APA7_Mendeley'
NAMES=['DE_CUONG_NGHIEN_CUU_HOAN_CHINH.docx','BAI_BAO_KHOA_HOC_CAP_NHAT_HOC_LIEU.docx']
NS={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships','m':'http://schemas.openxmlformats.org/officeDocument/2006/math'}
def q(tag):p,n=tag.split(':');return '{'+NS[p]+'}'+n
def text(p):return ''.join(p.xpath('.//w:t/text()',namespaces=NS))
def key(s):return ''.join(c for c in unicodedata.normalize('NFD',s.casefold().replace('đ','d')) if not unicodedata.combining(c))

# Full Vietnamese name segmentation is explicit, so a given name is never
# accidentally imported as a family name by the reference manager.
VI={
'Huỳnh Thị Yến Nhi':('Huỳnh','Thị Yến Nhi'),
'Nguyễn Thị Thu Hương':('Nguyễn','Thị Thu Hương'),
'Lê Anh Đức':('Lê','Anh Đức'),
'Mai Hoàng Phương':('Mai','Hoàng Phương'),
'Hồ Văn Tài':('Hồ','Văn Tài'),
'Phan Thanh Thúy':('Phan','Thanh Thúy'),
'Phạm Thụy Phương Uyên':('Phạm','Thụy Phương Uyên'),
'Nguyễn Thị Mỹ Duyên':('Nguyễn','Thị Mỹ Duyên'),
'Mai Xuân Đào':('Mai','Xuân Đào'),
'Phan Đồng Châu Thủy':('Phan','Đồng Châu Thủy'),
'Nguyễn Thị Thu Thủy':('Nguyễn','Thị Thu Thủy'),
'Nguyễn Thị Trúc Linh':('Nguyễn','Thị Trúc Linh'),
'Hồ Sỹ Chương':('Hồ','Sỹ Chương'),
'Trương Thị Phương Chi':('Trương','Thị Phương Chi'),
'Võ Văn Duyên Em':('Võ','Văn Duyên Em'),
'Nguyễn Thị Kim Ánh':('Nguyễn','Thị Kim Ánh'),
'Trần Thị Thảo Quyên':('Trần','Thị Thảo Quyên'),
'Vũ Văn Hùng':('Vũ','Văn Hùng'),
'Nguyễn Văn Biên':('Nguyễn','Văn Biên'),
'Trần Ngọc Chất':('Trần','Ngọc Chất'),
'Phạm Kim Chung':('Phạm','Kim Chung'),
'Đặng Thanh Hải':('Đặng','Thanh Hải'),
'Tưởng Duy Hải':('Tưởng','Duy Hải'),
'Bùi Gia Thịnh':('Bùi','Gia Thịnh'),
}
def initials(s):return ' '.join(x[0]+'.' for x in s.split())
def vi_apa(s):a,b=VI[s];return a+', '+initials(b)

lines=(ROOT/'tmp/nckh-20261104/refs.txt').read_text().strip().splitlines()
extras=[
'FuseSchool – Global Education. (n.d.). *What is nuclear fission? | Radioactivity | Physics | FuseSchool* [Video]. YouTube. https://www.youtube.com/watch?v=D91T-B-PVE0',
'Krathwohl, D. R. (2002). A revision of Bloom’s taxonomy: An overview. *Theory Into Practice, 41*(4), 212–218. https://doi.org/10.1207/s15430421tip4104_2',
'McKenney, S., & Reeves, T. C. (2019). *Conducting educational design research* (2nd ed.). Routledge. https://www.routledge.com/Conducting-Educational-Design-Research-2nd-Edition/McKenney-Reeves/p/book/9781138095564',
'Miao, F., & Cukurova, M. (2024). *AI competency framework for teachers*. UNESCO. https://www.unesco.org/en/articles/ai-competency-framework-teachers',
'Ollama. (n.d.). *qwen3:4b-instruct-2507-q4_K_M*. https://ollama.com/library/qwen3:4b-instruct-2507-q4_K_M',
'Roy, P., Poet, H., Staunton, R., Aston, K., & Thomas, D. (2024). *ChatGPT in lesson preparation: A Teacher Choices trial*. Education Endowment Foundation. https://d2tic4wvo1iusb.cloudfront.net/production/documents/projects/chatgpt_in_lesson_planning_-_evaluation_report.pdf',
'Vũ Văn Hùng, Nguyễn Văn Biên, Trần Ngọc Chất, Phạm Kim Chung, Đặng Thanh Hải, Tưởng Duy Hải, & Bùi Gia Thịnh. (2024). *Vật lí 12* (Kết nối tri thức với cuộc sống; bản mẫu tháng 1/2024). Nhà xuất bản Giáo dục Việt Nam.',
]
ALL=[]
for i,line in enumerate(lines+extras):
 raw=line
 for full in sorted(VI,key=len,reverse=True):line=line.replace(full,vi_apa(full))
 line=line.replace('.. (','. (')
 line=line.replace('Mai, X. Đ. & Phan','Mai, X. Đ., & Phan')
 line=line.replace('self-study competence in Physics subject','self-study competence in physics subject')
 # Treat edition as an edition, not as an abbreviated part of the book title.
 line=line.replace('*College physics 2e*.','*College physics* (2nd ed.).')
 a,year,tail=re.match(r'^(.*?)\s+\((\d{4}|n\.d\.)\)\.\s+(.*)$',line).groups()
 # Stable local IDs: first 26 records are the outline sources; seven are article-only.
 ALL.append({'id':f'NCKH{i+1:02d}','line':line,'raw':raw,'author_display':a.rstrip('.'),'year':year,'tail':tail,'documents':['de_cuong'] if i<26 else ['bai_bao']})
article_ids=[3,4,5,7,27,9,10,28,11,12,29,30,14,16,31,32,20,22,23,33,26]
for i in article_ids:
 if 'bai_bao' not in ALL[i-1]['documents']:ALL[i-1]['documents'].append('bai_bao')

def sortref(d):
 # APA compares coauthors before year; punctuation and diacritics do not
 # change the family-name sorting. No split domestic/international list.
 authors=d['line'].split(' (',1)[0]
 return key(authors),d['year'],key(d['tail'])

# Citation edits preserve existing runs and any nontext XML.
def replace_in_p(p,old,new):
 ts=p.xpath('.//w:t',namespaces=NS);s=''.join(t.text or '' for t in ts)
 for match in reversed(list(re.finditer(re.escape(old),s))):
  a=match.start();b=match.end();pos=0;hits=[]
  for t in ts:
   v=t.text or '';end=pos+len(v)
   if pos<b and end>a:hits.append((t,max(0,a-pos),min(len(v),b-pos)))
   pos=end
  assert hits
  for n,(t,a0,b0) in enumerate(hits):
   v=t.text or '';t.text=v[:a0]+(new if n==0 else '')+v[b0:]
   t.set('{http://www.w3.org/XML/1998/namespace}space','preserve')

REPLACE={
'Huỳnh Thị Yến Nhi và cộng sự':'Huỳnh et al.',
'Mai Hoàng Phương và cộng sự':'Mai et al.',
'Mai Xuân Đào và Phan Đồng Châu Thủy':'X. Đ. Mai và Phan',
'Nguyễn Thị Thu Thủy và cộng sự':'T. T. T. Nguyễn et al.',
'Trương Thị Phương Chi (2017)':'Trương (2017)',
'Võ Văn Duyên Em và cộng sự':'Võ et al.',
'Vũ Văn Hùng và cộng sự':'Vũ et al.',
'và cộng sự':'et al.',
'(Zimmerman, 2002; Panadero, 2017)':'(Panadero, 2017; Zimmerman, 2002)',
'(Zimmerman, 2002; Liu et al., 2024)':'(Liu et al., 2024; Zimmerman, 2002)',
'(Vũ et al., 2024; Urone & Hinrichs, 2022, mục 32.6)':'(Urone & Hinrichs, 2022, mục 32.6; Vũ et al., 2024)',
}

def set_prop(parent,tag,attrs):
 e=parent.find(q(tag))
 if e is None:e=E.SubElement(parent,q(tag))
 for k,v in attrs.items():e.set(q(k),v)

def refparagraph(p,line,outline,rels):
 # Only reference paragraphs are rebuilt; preserve their paragraph style.
 props=p.find(q('w:pPr'))
 props=deepcopy(props) if props is not None else E.Element(q('w:pPr'))
 for child in list(p):p.remove(child)
 p.append(props)
 set_prop(props,'w:ind',{'w:left':'720','w:hanging':'720'})
 set_prop(props,'w:jc',{'w:val':'left'})
 # Keep the existing journal page design; outline reference list uses APA double spacing.
 set_prop(props,'w:spacing',{'w:before':'0','w:after':'0','w:line':'480' if outline else '240','w:lineRule':'auto'})
 set_prop(props,'w:keepNext',{'w:val':'0'})
 set_prop(props,'w:keepLines',{'w:val':'1'})
 italic=False
 for part in re.split(r'(\*)',line):
  if part=='*':italic=not italic;continue
  if not part:continue
  r=E.SubElement(p,q('w:r'));pr=E.SubElement(r,q('w:rPr'))
  set_prop(pr,'w:rFonts',{'w:ascii':'Times New Roman','w:hAnsi':'Times New Roman','w:eastAsia':'Times New Roman'})
  set_prop(pr,'w:sz',{'w:val':'28' if outline else '22'})
  if italic:E.SubElement(pr,q('w:i'))
  url=re.search(r'https?://\S+$',part)
  if url:
   before=part[:url.start()]
   t=E.SubElement(r,q('w:t'));t.text=before;t.set('{http://www.w3.org/XML/1998/namespace}space','preserve')
   target=url.group()
   rel=next((a for a in rels if a.get('Target')==target),None)
   if rel is None:
    rid='rId'+str(1+max([int(a.get('Id')[3:]) for a in rels if re.fullmatch(r'rId\d+',a.get('Id',''))]+[0]))
    rel=E.SubElement(rels,'{http://schemas.openxmlformats.org/package/2006/relationships}Relationship',Id=rid,Type=NS['r']+'/hyperlink',Target=target,TargetMode='External')
   link=E.SubElement(p,q('w:hyperlink'));link.set(q('r:id'),rel.get('Id'))
   rr=E.SubElement(link,q('w:r'));rr.append(deepcopy(pr))
   tt=E.SubElement(rr,q('w:t'));tt.text=target
  else:
   t=E.SubElement(r,q('w:t'));t.text=part;t.set('{http://www.w3.org/XML/1998/namespace}space','preserve')

changes={}
for fi,name in enumerate(NAMES):
 z=ZipFile(BACK/name);parts={k:z.read(k) for k in z.namelist()};r=E.fromstring(parts['word/document.xml'])
 rels=E.fromstring(parts['word/_rels/document.xml.rels'])
 ps=r.xpath('//w:p',namespaces=NS)
 ri=next(i for i,p in enumerate(ps) if text(p).strip().lower()=='tài liệu tham khảo')
 selected=sorted(ALL[:26] if fi==0 else [ALL[i-1] for i in article_ids],key=sortref)
 changes[name]=[]
 for i,p in enumerate(ps):
  if ri<i<ri+1+len(selected):continue
  before=text(p)
  for old,new in REPLACE.items():replace_in_p(p,old,new)
  if fi==0:
   replace_in_p(p,'Mai et al. (2024)','H. P. Mai et al. (2024)')
   replace_in_p(p,'Nguyen et al. (2020)','N. T. L. Nguyen et al. (2020)')
   replace_in_p(p,'Tài liệu IAEA về chiếu xạ thực phẩm và NIBIB về y học hạt nhân là nguồn đối chiếu,','Tài liệu của International Atomic Energy Agency (IAEA, n.d.) về chiếu xạ thực phẩm và National Institute of Biomedical Imaging and Bioengineering (NIBIB, n.d.) về y học hạt nhân là nguồn đối chiếu,')
   replace_in_p(p,'sửa đổi quy định đánh giá trong Thông tư 22/2021.','sửa đổi quy định đánh giá trong Thông tư 22/2021 (Bộ Giáo dục và Đào tạo, 2021, 2026).')
   replace_in_p(p,'theo Công văn 7991.','theo Công văn 7991 (Bộ Giáo dục và Đào tạo, 2024).')
  after=text(p)
  if after!=before:changes[name].append({'paragraph':i,'before':before,'after':after})
 for p,d in zip(ps[ri+1:ri+1+len(selected)],selected):refparagraph(p,d['line'],fi==0,rels)
 out=E.tostring(r,encoding='UTF-8',xml_declaration=True,standalone=True)
 relout=E.tostring(rels,encoding='UTF-8',xml_declaration=True,standalone=True)
 with ZipFile(ROOT/name,'w',ZIP_DEFLATED) as dst:
  for info in z.infolist():dst.writestr(deepcopy(info),{'word/document.xml':out,'word/_rels/document.xml.rels':relout}.get(info.filename,parts[info.filename]))
 # Integrity gate: no media, equations, headings, table structure or package parts lost.
 r0=E.fromstring(parts['word/document.xml'])
 for xp in ['//m:oMath','//w:drawing','//w:tblPr','//w:sectPr']:
  assert [E.tostring(x,method='c14n') for x in r0.xpath(xp,namespaces=NS)]==[E.tostring(x,method='c14n') for x in r.xpath(xp,namespaces=NS)],xp
 assert len(r0.xpath('//w:tbl',namespaces=NS))==len(r.xpath('//w:tbl',namespaces=NS))
 with ZipFile(ROOT/name) as dst:
  assert not dst.testzip()
  assert set(dst.namelist())==set(z.namelist())
  assert all(parts[k]==dst.read(k) for k in z.namelist() if k not in ('word/document.xml','word/_rels/document.xml.rels'))

def metadata(d):
 line=d['line'];tail=d['tail'];raw=d['raw']
 authors=raw.split(' (',1)[0].strip()
 people=[]
 if any(authors.startswith(n) for n in VI):
  chunks=re.sub(r',?\s+&\s+', ', ',authors.rstrip('.')).split(', ')
  people=[', '.join(VI[n.strip()]) for n in chunks]
 elif re.search(r', [A-Z][.]',authors):
  people=re.findall(r'(?:^|, )([^,]+, (?:[A-ZÀ-Ỹ]\. ?)+)',authors.replace('& ',''))
  people=[p.strip() for p in people]
 else:people=[authors.rstrip('.')+','] # corporate author as a whole family-name field
 assert people,authors
 url=re.search(r'https?://\S+$',line)
 url=url.group() if url else None
 doi=url.replace('https://doi.org/','') if url and url.startswith('https://doi.org/') else None
 tail=tail[:tail.rfind(url)].strip() if url else tail
 md={'TY':'JOUR','AU':people,'PY':d['year'] if d['year']!='n.d.' else None,'UR':url,'DO':doi,'ID':d['id'],'KW':d['documents']}
 journal=re.search(r'^(.*?)\. \*([^*]+), (\d+)\*(?:\(([^)]+)\))?, (.*?)\.$',tail)
 if journal:
  title,journal,volume,issue,pages=journal.groups()
  md.update(TI=title,JO=journal,VL=volume,IS=issue)
  if pages.startswith('Article '):md['SP']=pages[8:]
  else:
   pg=pages.split('–');md['SP']=pg[0];md['EP']=pg[1] if len(pg)>1 else None
 else:
  first_ital=re.search(r'\*([^*]+)\*',tail)
  assert first_ital,tail
  title=first_ital.group(1);md['TI']=title
  if d['id']=='NCKH03':
   md.update(TY='CONF',TI='The flipped classroom: A survey of the research',T2='2013 ASEE Annual Conference & Exposition',SP='23.1200.1',EP='23.1200.18',PB='ASEE Conferences')
  elif d['id']=='NCKH20':md.update(TY='THES',PB='Trường Đại học Vinh',M3='Luận án tiến sĩ khoa học giáo dục')
  elif d['id'] in ['NCKH22','NCKH29','NCKH33']:
   md.update(TY='BOOK')
   if d['id']=='NCKH22':md.update(ET='2',PB='OpenStax')
   if d['id']=='NCKH29':md.update(ET='2',PB='Routledge')
   if d['id']=='NCKH33':md.update(PB='Nhà xuất bản Giáo dục Việt Nam',ET='Kết nối tri thức với cuộc sống; bản mẫu tháng 1/2024')
  elif d['id'] in ['NCKH04','NCKH05','NCKH06','NCKH07','NCKH08','NCKH14','NCKH30','NCKH32']:
   md['TY']='RPRT'
   if d['id'] in ['NCKH14','NCKH30']:md['PB']='UNESCO'
   if d['id']=='NCKH32':md['PB']='Education Endowment Foundation'
   if d['id']=='NCKH04':md['M1']='Thông tư 32/2018/TT-BGDĐT'
   if d['id']=='NCKH05':md['M1']='5512/BGDĐT-GDTrH; Phụ lục IV'
  elif d['id']=='NCKH27':md.update(TY='VIDEO',PB='YouTube')
  else:md['TY']='ELEC'
 note='Dùng trong: '+', '.join(d['documents'])+'.'
 if d['id']=='NCKH18':note+=' Đã xác minh thông tin xuất bản; toàn văn trực tuyến chưa truy xuất được trong lần rà soát trước.'
 if d['id']=='NCKH20':note+=' URL là bản luận án lưu trên trang trung gian; đối chiếu trang tên luận án. Chưa xác lập URL kho lưu trữ của Trường Đại học Vinh.'
 if d['id']=='NCKH27':note+=' Chưa xác minh ngày đăng video; không tự điền năm. Cần xem lại toàn bộ video trước khi dùng dạy học.'
 if d['id']=='NCKH33':note+=' Nguồn là bản mẫu tháng 1/2024 có trong dự án; chưa tự thay bằng metadata bản thương mại.'
 md['N1']=note
 return md

records=[metadata(d) for d in sorted(ALL,key=sortref)]
ris=[]
for r in records:
 for k,v in r.items():
  if v is None:continue
  for item in v if isinstance(v,list) else [v]:ris.append(f'{k}  - {item}')
 ris+=['ER  - ','']
(ROOT/'TAI_LIEU_THAM_KHAO_MENDELEY.ris').write_text('\n'.join(ris),encoding='utf-8')
(WORK/'metadata.json').write_text(json.dumps(records,ensure_ascii=False,indent=2))
(WORK/'references-apa7.json').write_text(json.dumps(ALL,ensure_ascii=False,indent=2))
(WORK/'changes.json').write_text(json.dumps(changes,ensure_ascii=False,indent=2))
print(json.dumps({'reference_records':len(records),'outline_refs':26,'article_refs':len(article_ids),'paragraphs_changed':{k:len(v) for k,v in changes.items()}},ensure_ascii=False))
