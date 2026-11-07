from PIL import Image,ImageOps,ImageDraw
from pathlib import Path
from pypdf import PdfReader
import sys
folder=Path(sys.argv[1]);ims=sorted(folder.glob('page-*.png'),key=lambda p:int(p.stem.split('-')[1]));reader=PdfReader(next(folder.glob('*.pdf')))
assert len(ims)==len(reader.pages)
for k in range(0,len(ims),8):
 sheet=Image.new('RGB',(4*330,2*493),'#cccccc');draw=ImageDraw.Draw(sheet)
 for j,p in enumerate(ims[k:k+8]):
  with Image.open(p) as im:
   a=im.convert('RGB'); assert a.size[0] > 1000; bbox=ImageOps.invert(a).getbbox();assert bbox
   a.thumbnail((320,460));x=(j%4)*330+5;y=(j//4)*493+22;sheet.paste(a,(x,y));draw.text((x,y-16),f'{p.stem}',fill='black')
 sheet.save(folder/f'proof-{k//8+1}.jpg',quality=90)
print(len(ims),'rendered pages decoded at source resolution')
