from pathlib import Path
from zipfile import ZipFile
import re,json
from lxml import etree as E
from docx import Document
from pypdf import PdfReader
w=Path(__file__).parent
heads=json.loads((w/'heads.json').read_text());src=next((w/'extracted').glob('OK*.txt')).read_text().split('PART word/footnotes')[0]
orig={int(m[1]):m[2].strip() for m in re.finditer(r'^P(\d+) (.*)$',src,re.M)}
exclude={70,81,98,99,100,104,178,*range(72,80),*range(83,94),*range(151,157),*range(158,164),*range(165,171)}
expect=[i for i in orig if i>=61 and i not in exclude]
assert list(map(int,heads))==expect,(set(expect)-set(map(int,heads)))
d=Document('DE_CUONG_NGHIEN_CUU_HOAN_CHINH.docx')
observed=[p.text for p in d.paragraphs if p.style.name.startswith('Heading ')]
canon=lambda t:' '.join(t.replace('vfa','và').replace('đề tái','đề tài').replace('3.6. kết quả','3.6. Kết quả').split())
assert list(map(canon,observed))==[canon((orig[i-1]+' ' if i in (105,179) else '')+orig[i]) for i in expect]
with ZipFile('DE_CUONG_NGHIEN_CUU_HOAN_CHINH.docx') as z:
 assert z.testzip() is None
 for f in z.namelist():
  if f.endswith(('.xml','.rels')):E.fromstring(z.read(f))
print('Independent match:',len(observed),'headings. Goals/tasks and 1.8 enumerations:',all(orig[i] in [p.text for p in d.paragraphs] for i in [*range(72,80),*range(83,94),*range(151,157),*range(158,164),*range(165,171)]))
f=next((w/'outline-final').glob('*.pdf'));r=PdfReader(f);pages=[' '.join(p.extract_text().split()) for p in r.pages]
start=next(i for i,s in enumerate(pages) if 'Đề cương triển khai nghiên cứu' in s)
pgs={}
for i,h in heads.items():
 term=' '.join(h.split())
 for k in range(start,len(pages)):
  if term in pages[k]:pgs[i]=k+1;break
 if i not in pgs:
  for k in range(start,len(pages)):
   if term[:min(65,len(term))] in pages[k]:pgs[i]=k+1;break
(w/'toc-pages.json').write_text(json.dumps(pgs,ensure_ascii=False,indent=2));print('Rendered pages',len(r.pages),'located',len(pgs),'missing',[(i,s[:60]) for i,s in heads.items() if i not in pgs]);print([(i,s[:90]) for i,s in enumerate(pages[:6],1)])
