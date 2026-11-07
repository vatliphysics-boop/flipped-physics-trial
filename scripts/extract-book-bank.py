"""Lossless embedded-image extraction and resumable local Vision OCR of supplied books."""
import hashlib,json,subprocess,unicodedata
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from pypdf import PdfReader
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'data/book-bank'; OUT.mkdir(parents=True,exist_ok=True)
BOOKS=[('ctst','Sách bài tập Vật lí 12 · Chân trời sáng tạo',Path.home()/'Downloads','757511248-'),('sbt-kntt','Sách bài tập Vật lí 12 · Kết nối tri thức',Path.home(),'tailieugiangday.vn '),('sgk-kntt','Sách giáo khoa Vật lí 12 · Kết nối tri thức',ROOT,'SGK VẬT LÍ 12 KNTT')]
manifest={'books':[],'pages':[],'embeddedImages':[],'method':'Embedded images retained byte for byte; Vision OCR is an unverified search aid.'}
for bid,title,directory,prefix in BOOKS:
 src=next(p for p in directory.glob('*.pdf') if unicodedata.normalize('NFC',p.name).startswith(unicodedata.normalize('NFC',prefix)))
 reader=PdfReader(src); book={'id':bid,'title':title,'source':str(src),'sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'pageCount':len(reader.pages)};manifest['books'].append(book)
 dest=OUT/bid/'pages'; dest.mkdir(parents=True,exist_ok=True)
 raw=OUT/bid/'embedded';raw.mkdir(exist_ok=True)
 for i,page in enumerate(reader.pages,1):
  candidates=[]
  for j,img in enumerate(page.images):
   suffix=Path(img.name).suffix or '.png'; path=raw/f'{i:03d}-{j:02d}{suffix}'
   if not path.exists():path.write_bytes(img.data)
   with Image.open(path) as im:w,h=im.size
   record={'book':bid,'page':i,'imageIndex':j,'file':str(path.relative_to(OUT)),'width':w,'height':h,'sha256':hashlib.sha256(img.data).hexdigest()}
   manifest['embeddedImages'].append(record);candidates.append((w*h,path,record))
  _,main,record=max(candidates)
  # The largest image is the entire scanned page; all other image objects remain in embedded/.
  target=dest/f'{i:03d}{main.suffix}'
  if not target.exists():target.write_bytes(main.read_bytes())
  manifest['pages'].append({'book':bid,'page':i,'file':str(target.relative_to(OUT)),'width':record['width'],'height':record['height'],'sha256':record['sha256']})
 print(f'Extracted {bid}: {len(reader.pages)} pages',flush=True)
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
ocr=ROOT/'tmp/book-extraction/ocr'
missing=[OUT/p['file'] for p in manifest['pages'] if not Path(str(OUT/p['file'])+'.ocr.json').exists()]
def recognize(path):
 r=subprocess.run([str(ocr),str(path)],capture_output=True,text=True,timeout=180)
 if r.returncode or not Path(str(path)+'.ocr.json').exists():raise RuntimeError(r.stderr or str(path))
 return path
with ThreadPoolExecutor(max_workers=2) as pool:
 for count,path in enumerate(pool.map(recognize,missing),1):
  print(f'OCR {count}/{len(missing)}: {path.relative_to(OUT)}',flush=True)
(OUT/'ocr-complete.json').write_text(json.dumps({'pages':len(manifest['pages']),'ocrPages':sum(Path(str(OUT/p['file'])+'.ocr.json').exists() for p in manifest['pages'])}))
