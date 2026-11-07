from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from lxml import etree as E
from copy import deepcopy
from docx import Document
import re,json,hashlib
R=Path(__file__).resolve().parents[2];W=Path(__file__).parent
N=['DE_CUONG_NGHIEN_CUU_HOAN_CHINH.docx','BAI_BAO_KHOA_HOC_CAP_NHAT_HOC_LIEU.docx']
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main','m':'http://schemas.openxmlformats.org/officeDocument/2006/math'}
pg=json.loads((W/'head-pages.json').read_text())
assert len(pg)==147
z=ZipFile(R/N[0]);parts={n:z.read(n) for n in z.namelist()};root=E.fromstring(parts['word/document.xml'])
n=0
for p in root.xpath('//w:p',namespaces=ns):
 instr=p.xpath('.//w:instrText/text()',namespaces=ns)
 m=re.search(r'PAGEREF nd_(\d+)',' '.join(instr))
 if not m:continue
 ts=p.xpath('.//w:t',namespaces=ns);assert ts[-1].text.isdigit()
 ts[-1].text=str(pg[m[1]]);n+=1
assert n==39
parts['word/document.xml']=E.tostring(root,encoding='UTF-8',xml_declaration=True,standalone=True)
with ZipFile(R/N[0],'w',ZIP_DEFLATED) as out:
 for info in z.infolist():out.writestr(deepcopy(info),parts[info.filename])

# Independent structural and citation checks against the saved pre-APA files.
audit={}
refs=json.loads((W/'references-apa7.json').read_text())
meta=json.loads((W/'metadata.json').read_text())
ris=(R/'TAI_LIEU_THAM_KHAO_MENDELEY.ris').read_text()
chunks=[x for x in ris.split('ER  -') if x.strip()]
assert len(chunks)==33 and ris.count('TY  -')==33
by_id={}
for chunk in chunks:
 entries={}
 for line in chunk.strip().splitlines():
  assert re.match(r'^[A-Z0-9]{2}  - ',line),line
  tag,value=line.split('  - ',1);entries.setdefault(tag,[]).append(value)
 assert all(k in entries for k in ['TY','AU','TI','ID'])
 by_id[entries['ID'][0]]=entries
assert len(by_id)==33
for m in meta:
 assert by_id[m['ID']]['AU']==m['AU']
 assert by_id[m['ID']]['TI']==[m['TI']]
 if m.get('DO'):assert by_id[m['ID']]['DO']==[m['DO']]

for fi,f in enumerate(N):
 old=ZipFile(R/'sao_luu_nckh/20261104_APA7_Mendeley'/f);new=ZipFile(R/f)
 assert not new.testzip()
 for part in new.namelist():
  if part.endswith(('.xml','.rels')):E.fromstring(new.read(part))
 a=E.fromstring(old.read('word/document.xml'));b=E.fromstring(new.read('word/document.xml'))
 for path in ['//m:oMath','//w:drawing','//w:sectPr']:
  assert [E.tostring(x,method='c14n') for x in a.xpath(path,namespaces=ns)]==[E.tostring(x,method='c14n') for x in b.xpath(path,namespaces=ns)]
 assert all(old.read(k)==new.read(k) for k in old.namelist() if k not in ('word/document.xml','word/_rels/document.xml.rels'))
 doc=Document(R/f);old_doc=Document(R/'sao_luu_nckh/20261104_APA7_Mendeley'/f)
 headings=lambda d:[p.text for p in d.paragraphs if p.style.name.startswith('Heading')]
 assert headings(doc)==headings(old_doc)
 if fi==0:assert len(headings(doc))==147
 ps=b.xpath('//w:p',namespaces=ns);texts=[''.join(p.xpath('.//w:t/text()',namespaces=ns)) for p in ps]
 start=next(i for i,s in enumerate(texts) if s.strip().lower()=='tài liệu tham khảo')
 count=26 if fi==0 else 21
 bib=texts[start+1:start+1+count]
 assert len(bib)==count and all(re.search(r'\((?:20\d{2}|n\.d\.)\)',s) for s in bib)
 assert not any('.. (' in s for s in bib)
 body=texts[:start]+texts[start+1+count:]
 assert not any('và cộng sự' in s for s in body)
 cited=[]
 for d in refs:
  if ('de_cuong' if fi==0 else 'bai_bao') not in d['documents']:continue
  m=next(m for m in meta if m['ID']==d['id']);surname=m['AU'][0].split(',')[0]
  assert any(surname in s and d['year'] in s for s in body),(f,d['id'],surname,d['year'])
  cited.append(d['id'])
 audit[f]={'sha256':hashlib.sha256((R/f).read_bytes()).hexdigest(),'headings':len(headings(doc)),'media':len([k for k in new.namelist() if k.startswith('word/media/')]),'tables':len(b.xpath('//w:tbl',namespaces=ns)),'OMML':len(b.xpath('//m:oMath',namespaces=ns)),'references':count,'reference_ids_matched_in_body':cited}
(W/'integrity.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2))
print(json.dumps(audit,ensure_ascii=False,indent=2))
