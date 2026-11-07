"""Build source-backed draft questions, figure regions, and formula review inventory."""
import json,re,unicodedata
from pathlib import Path
from collections import Counter,defaultdict
from PIL import Image
import numpy as np
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'data/book-bank'
manifest=json.loads((OUT/'manifest.json').read_text()); questions=[]; figures=[]; equations=[]; pages=[]
def flat(s):return ''.join(c for c in unicodedata.normalize('NFD',s).lower() if unicodedata.category(c)!='Mn').replace('đ','d')
def lines(p):
 result=json.loads(Path(str(OUT/p['file'])+'.ocr.json').read_text())
 if p['book']=='ctst' and p['page']==58:
  result.append({'text':'Bài 13.6 (H): Một điện áp xoay chiều được đặt vào hai đầu của một điện trở','confidence':1,'x':.08,'y':.140,'width':.87,'height':.02,'manualMarker':True})
  result.sort(key=lambda l:l['y'])
 return result
def clip(p,y1,y2,path,x1=0,x2=1):
 im=Image.open(OUT/p['file']);w,h=im.size;rect=(max(0,int(x1*w)),max(0,int(y1*h)),min(w,int(x2*w)),min(h,int(y2*h)))
 if rect[2]<=rect[0] or rect[3]<=rect[1]:return None
 path=OUT/path;path.parent.mkdir(parents=True,exist_ok=True);im.crop(rect).save(path,quality=95)
 return {'file':str(path.relative_to(OUT)),'width':rect[2]-rect[0],'height':rect[3]-rect[1],'page':p['page'],'rect':list(rect)}
def kind(text):
 t=flat(text)
 if re.search(r'(chon|chi ra|xac dinh).{0,45}dung.{0,12}sai|dung hoac sai|dung, sai|dung/sai',t):return 'true_false','Dấu hiệu yêu cầu đánh giá đúng sai'
 if len(re.findall(r'(?:^|\n|\s)[ABCD][.)]\s',text))>=3:return 'choice','Có các phương án A B C D'
 # Only explicit short-answer instructions are classified numeric automatically.
 if 'tra loi ngan' in t or 'chi ghi dap so' in t:return 'numeric','Có yêu cầu trả lời ngắn'
 return 'written','Không có phương án lựa chọn; giữ dạng tự luận của nguồn'
def add_question(bid,label,topic,segs,text,reason='Đánh dấu câu trong nguồn'):
 k,why=kind(text);qid=f'{bid}-q{len(questions)+1:04d}'
 clips=[clip(p,a,b,Path(bid)/'questions'/f'{qid}-{n+1}.jpg') for n,(p,a,b) in enumerate(segs)]
 questions.append({'id':qid,'book':bid,'label':label,'topic':topic,'kind':k,'classificationReason':why,'text':text,'images':[c for c in clips if c],'pages':sorted(set(p['page'] for p,a,b in segs)),'status':'needs_review','segmentationReason':reason})
for book in manifest['books']:
 bid=book['id']; bp=[p for p in manifest['pages'] if p['book']==bid]; answer_start={'ctst':82,'sbt-kntt':87}.get(bid,999)
 streams=[]
 for p in bp:
  ls=lines(p); text='\n'.join(l['text'] for l in ls)
  pages.append({**p,'text':text,'role':'answers' if p['page']>=answer_start else 'content'})
  streams.append((p,ls))
  # Caption regions include contextual area and are not claimed as perfectly isolated figures.
  for n,l in enumerate(ls):
   if re.match(r'^Hình\s+(?:\d+|[IVX]+)[.٫,]\d+',l['text']):
    fid=f'{bid}-f{len(figures)+1:04d}';top=max(.025,l['y']-.27);bottom=min(.97,l['y']+l['height']+.015)
    c=clip(p,top,bottom,Path(bid)/'figures'/f'{fid}.jpg')
    figures.append({'id':fid,'book':bid,'page':p['page'],'label':l['text'],'image':c,'status':'region_needs_review','colorStatus':'original'})
  for n,l in enumerate(ls):
   if re.search(r'[=≈≃∝]|\b(?:sin|cos|ln)\b',l['text']) and .03<l['y']<.96:
    eid=f'{bid}-e{len(equations)+1:04d}';c=clip(p,max(.02,l['y']-.03),min(.98,l['y']+l['height']+.035),Path(bid)/'equations'/f'{eid}.jpg')
    equations.append({'id':eid,'book':bid,'page':p['page'],'ocr':l['text'],'image':c,'status':'needs_transcription','officeMath':None})
 if bid!='sgk-kntt':
  markers=[];topic=''; mode=''
  for p,ls in streams:
   if not 4<=p['page']<answer_start:continue
   for l in ls:
    s=l['text']; t=flat(s)
    if bid=='ctst':s=re.sub(r'^Bai\s', 'Bài ',s)
    if bid=='sbt-kntt' and p['page']==56 and .67<l['y']<.70:s='17.9. '+s
    if re.match(r'^(?:bai\s+)?\d+\s*[.:]?\s*$',t) and l['height']>.015:topic=s
    if re.search(r'^[AB][.\s]+(?:trac nghiem|tu luan)',t):mode='written' if 'tu luan' in t else 'choice'
    # Corrections retain raw OCR in page files; only source markers are normalized here.
    if bid=='sbt-kntt':
     if 21<=p['page']<=23:s=re.sub(r'^1\.(\d+)',r'I.\1',s)
     s=re.sub(r'^1II\.', 'III.', s);s=re.sub(r'^IIL\.', 'III.', s)
     if p['page']==85:s=re.sub(r'^V\.11\.', 'IV.11.',s)
     if p['page']==48:s=re.sub(r'^15\.11\.', '15.14.',s)
     if p['page']==81:s=re.sub(r'^23-10\.', '23.10.',s)
    pattern=r'^(Câu|Bài)\s+(\d{1,2}[.]\d{1,2})' if bid=='ctst' else r'^((?:[1-9]\d?|[IVX]{1,3})[.]\d{1,2})[.\s]'
    m=re.match(pattern,s)
    if m and l['x']<.25 and .005<l['y']<.965:
     label=m.group(0).strip();num=m.group(2) if bid=='ctst' else m.group(1)
     markers.append((p,l['y'],label,num,mode))
  for i,(p,y,label,num,mode) in enumerate(markers):
   nextp,ny=(markers[i+1][0],markers[i+1][1]) if i+1<len(markers) else (bp[answer_start-2],.995)
   segs=[];texts=[]
   for sp,ls in streams:
    if p['page']<=sp['page']<=nextp['page']:
     a=max(.02,y-.007) if sp['page']==p['page'] else .025
     b=max(a,ny-.01) if sp['page']==nextp['page'] else .995
     if b-a>.008:
      segs.append((sp,a,b));texts.extend(l['text'] for l in ls if a<=l['y']<b)
   if not segs:continue
   add_question(bid,label,num.split('.')[0].split(',')[0],segs,'\n'.join(texts))
   if mode=='written' and questions[-1]['kind']!='true_false':questions[-1]['kind']='written'
 else:
  # Activity boxes retain all instructions and diagrams as one source group.
  for p,ls in streams:
   if not 7<=p['page']<=125:continue
   im=Image.open(OUT/p['file']).convert('RGB');arr=np.asarray(im.resize((350,500))).astype(int)
   r,g,b=arr[:,:,0],arr[:,:,1],arr[:,:,2]
   beige=(np.minimum(np.minimum(r,g),b)>155)&((np.maximum(np.maximum(r,g),b)-np.minimum(np.minimum(r,g),b))>4)&((np.maximum(np.maximum(r,g),b)-np.minimum(np.minimum(r,g),b))<75)
   ratios=beige[:,45:315].mean(axis=1);rows=np.where(ratios>.43)[0];bands=[]
   for y in rows:
    if not bands or y-bands[-1][-1]>10:bands.append([y])
    else:bands[-1].append(y)
   for band in bands:
    if band[-1]-band[0]<13:continue
    a=max(.03,(band[0]-3)/500);b=min(.96,(band[-1]+4)/500)
    text='\n'.join(l['text'] for l in ls if a<=l['y']<b)
    if len(text)<18 or re.search(r'EM CÓ BIẾT|GHI NHỚ',text):continue
    # Include activity boxes with instructions, never hide the original page.
    add_question(bid,f'Hoạt động trang {p["page"]-2}',str(p['page']),[(p,a,b)],text,'Nhóm câu hỏi trong khung hoạt động; chưa tách từng ý')
transcriptions=json.loads((ROOT/'src/data/book-equation-transcriptions.json').read_text()) if (ROOT/'src/data/book-equation-transcriptions.json').exists() else []
for entry in transcriptions:
 e=next((e for e in equations if e['id']==entry['id']),None)
 if e:e.update(officeMath=entry['latex'],status='transcribed_visual_check')
counts=Counter(q['kind'] for q in questions)
index={'books':manifest['books'],'questions':questions,'figures':figures,'equations':equations,'pages':pages,'counts':dict(counts),'coverage':{'sourcePages':len(manifest['pages']),'ocrPages':len(pages),'embeddedImages':len(manifest['embeddedImages']),'questionsReviewed':0,'note':'All page images retained; segmentation and OCR require review. SGK entries are activity groups.'}}
(OUT/'index.json').write_text(json.dumps(index,ensure_ascii=False))
(OUT/'questions.csv').write_text('id,book,label,kind,pages,status\n'+'\n'.join(f'{q["id"]},{q["book"]},{q["label"]},{q["kind"]},"{";".join(map(str,q["pages"]))}",{q["status"]}' for q in questions))
print(json.dumps({'questions':len(questions),'types':dict(counts),'figures':len(figures),'equations':len(equations),'pages':len(pages)},ensure_ascii=False))
