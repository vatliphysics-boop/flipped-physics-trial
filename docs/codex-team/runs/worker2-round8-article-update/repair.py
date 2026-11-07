from zipfile import ZipFile,ZIP_DEFLATED
from lxml import etree
from pathlib import Path
import json,hashlib
f=Path('/Users/vodoandangkhoi/Documents/WEB_WORKING_24-09/BAI_BAO_KHOA_HOC_CAP_NHAT_HOC_LIEU.docx')
with ZipFile(f) as z: d={n:z.read(n) for n in z.namelist()}
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
r=etree.fromstring(d['word/document.xml']);ps=r.xpath('//w:body//w:p',namespaces=ns)
for i in [26,31]:
 ts=ps[i-1].xpath('.//w:t',namespaces=ns);s=ts[0].text;label,body=s.split(':',1);ts[0].text=label+':';ts[1].text=body
 # ensure body normal, retain original label formatting
 rp=ts[1].getparent().find('w:rPr',ns)
 if rp is not None:
  for b in rp.findall('w:b',ns):rp.remove(b)
for i,a,b in [(102,'B25 chưa có kết quả hoàn tất ở thời điểm cập nhật.','Vòng 8 xác nhận B25 phát/dừng/tiếp tục ở 390 px, phụ đề Anh hiện và thời gian dừng ổn định; không tái thử B21–B24 trên cùng hash cuối.'),(201,'B21–B24 thử đoạn phát/dừng/tiếp tục.','B21–B24 thử đoạn phát/dừng/tiếp tục ở vòng 7, B25 ở vòng 8.'),(202,'B25 đang chờ kết quả.','Các ca video thuộc hai lượt khác nhau, chưa xác lập cùng hash cuối.')]:
 ts=ps[i-1].xpath('.//w:t',namespaces=ns);ts[0].text=ts[0].text.replace(a,b)
d['word/document.xml']=etree.tostring(r,xml_declaration=True,encoding='UTF-8',standalone=True)
with ZipFile(f,'w',ZIP_DEFLATED) as z:
 for n,b in d.items():z.writestr(n,b)
p=Path('/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w2-jvkqeA/audit.json');a=json.loads(p.read_text());a['article_sha256']=hashlib.sha256(f.read_bytes()).hexdigest();p.write_text(json.dumps(a,ensure_ascii=False,indent=2))
