"""Build original Vietnamese worksheets and visual teaching resources from the committed lesson catalog."""
import json, math, html
from pathlib import Path
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_LEFT
from pypdf import PdfReader, PdfWriter
root=Path(__file__).resolve().parents[1]
lessons=json.loads((root/'src/data/nuclear-learning.json').read_text())
pdfmetrics.registerFont(TTFont('Vietnamese','/System/Library/Fonts/Supplemental/Arial Unicode.ttf'))
pdfmetrics.registerFont(TTFont('VietnameseBold','/System/Library/Fonts/Supplemental/Arial Bold.ttf'))
normal=ParagraphStyle('body',fontName='Vietnamese',fontSize=10,leading=15,spaceAfter=8,textColor=colors.HexColor('#25374e'))
heading=ParagraphStyle('heading',parent=normal,fontName='VietnameseBold',fontSize=14,leading=19,spaceBefore=12,spaceAfter=12)
title=ParagraphStyle('title',parent=heading,fontSize=21,leading=28,spaceBefore=0)
small=ParagraphStyle('small',parent=normal,fontSize=8,leading=12)
def p(text,style=normal):return Paragraph(html.escape(text).replace('\n','<br/>'),style)
def footer(canvas,doc):
 canvas.setFont('Vietnamese',8);canvas.setFillColor(colors.HexColor('#50627b'));canvas.drawString(42,26,'Học liệu Vật lí 12 | Phiếu tự học và thảo luận');canvas.drawRightString(553,26,str(doc.page))
for l in lessons:
 story=[p(l['code']+' '+l['title'],title),p('Kiến thức nền và phiếu học tập',heading),p('Mục tiêu: '+'; '.join(l['goals']))]
 for i,t in enumerate(l['theory']):story.append(p(f'{i+1}. {t}'))
 story += [p('Mô hình có kích thước và thời gian quy ước. Phân biệt dữ liệu mô phỏng với dữ liệu thực nghiệm và bảng SGK.',small),p('Nguồn đối chiếu: SGK Vật lí 12 Kết nối tri thức, Chương IV; '+l['source'],small),PageBreak(),p(l['code']+' Phiếu ghi kết quả',title),p('Họ tên ......................................... Lớp ............... Nhóm ...............')]
 for name,label in [('before','Trước giờ học'),('during','Trong giờ học')]:
  story.append(p(label,heading))
  for i,t in enumerate(l[name]):story += [p(f'{i+1}. {t}'),p('..................................................................................................................'),Spacer(1,5)]
 story += [PageBreak(),p(l['code']+' Vận dụng và tự đánh giá',title),p('Sau giờ học',heading)]
 for i,t in enumerate(l['after']):story += [p(f'{i+1}. {t}'),p('..................................................................................................................')]
 story.append(p('Tự chẩn đoán kiến thức',heading))
 for i,q in enumerate(l['quiz']):story += [p(f'{i+1}. '+q['question']),p('   '.join(f'{chr(65+j)}. {o}' for j,o in enumerate(q['options'])))]
 story += [p('Đối chiếu sau khi tự làm',heading)]
 for i,q in enumerate(l['quiz']):story.append(p(f'{i+1}. {chr(65+q["answer"])}. '+q['explanation'],small))
 SimpleDocTemplate(str(root/f'public/learning/{l["code"]}-worksheet.pdf'),pagesize=(595.28,841.89),leftMargin=42,rightMargin=42,topMargin=42,bottomMargin=44).build(story,onFirstPage=footer,onLaterPages=footer)
# Extract the supplied textbook's Chapter IV: physical pages 92-124 correspond to printed pages 90-122.
source=root/'SGK VẬT LÍ 12 KNTT.pdf'
if source.exists():
 reader=PdfReader(source);writer=PdfWriter()
 for page in reader.pages[91:124]:writer.add_page(page)
 writer.add_metadata({'/Title':'SGK Vật lí 12 KNTT - Chương IV','/Subject':'Trích từ tệp SGK người dùng cung cấp; trang in 90-122'})
 with (root/'public/learning/SGK-chuong-IV.pdf').open('wb') as f:writer.write(f)
# An executable notebook with labelled synthetic data, not a fabricated experiment.
nb={'nbformat':4,'nbformat_minor':5,'metadata':{'kernelspec':{'display_name':'Python 3','language':'python','name':'python3'}},'cells':[
 {'cell_type':'markdown','id':'guide','metadata':{},'source':['# Phân tích dữ liệu phân rã B23-B25\n','Dữ liệu mẫu do mô hình N(t) = N0*2**(-t/T) tạo ra, không phải dữ liệu đo. Thay N0, T, rồi so sánh ba giả thuyết. Chạy bằng Jupyter hoặc tải tệp lên Google Colab.\n','Đơn vị: t và T theo giây; N là số hạt.']},
 {'cell_type':'code','id':'data','metadata':{},'execution_count':None,'outputs':[],'source':['import math, csv\n','N0 = 800\n','T = 30\n','times = list(range(0, 121, 10))\n','counts = [N0 * 2**(-t/T) for t in times]\n','for t, n in zip(times, counts):\n','    print(f"t={t:3d} s, N={n:.1f}")\n']},
 {'cell_type':'code','id':'fit','metadata':{},'execution_count':None,'outputs':[],'source':['# Chỉ ước lượng từ dữ liệu dương; không xử lí sai số đếm/nền trong ví dụ này.\n','estimates = [t * math.log(2) / math.log(N0/n) for t, n in zip(times, counts) if t > 0 and 0 < n < N0]\n','print("T ước lượng (s):", sum(estimates)/len(estimates))\n','with open("decay-model.csv", "w", newline="", encoding="utf-8") as f:\n','    writer = csv.writer(f)\n','    writer.writerow(["t_seconds", "N_model"])\n','    writer.writerows(zip(times, counts))\n']},
 {'cell_type': 'code', 'id': 'plot', 'metadata': {}, 'execution_count': None, 'outputs': [], 'source': ['# Vẽ SVG bằng Python chuẩn, không cần cài thư viện đồ thị.\n', '# Các đường thử T = 20, 30, 40 s; chấm đen là dữ liệu mô hình.\n', 'def xy(t, n):\n', '    return 60 + t / 120 * 480, 330 - n / N0 * 280\n', 'svg = [\'<svg xmlns="http://www.w3.org/2000/svg" width="650" height="400" viewBox="0 0 650 400">\', \'<rect width="650" height="400" fill="white"/>\', \'<path d="M60 40V330H560" fill="none" stroke="black"/>\', \'<text x="60" y="25">N (số hạt)</text>\', \'<text x="290" y="380">t (s)</text>\']\n', 'for trial, color in [(20, "#be4242"), (30, "#137b65"), (40, "#286bb0")]:\n', '    points = " ".join(f"{xy(t, N0*2**(-t/trial))[0]:.1f},{xy(t, N0*2**(-t/trial))[1]:.1f}" for t in range(121))\n', '    svg.append(f\'<polyline points="{points}" fill="none" stroke="{color}" stroke-width="2"/>\')\n', '    svg.append(f\'<text x="430" y="{25+trial*2}" fill="{color}">T = {trial} s</text>\')\n', 'for t, n in zip(times, counts):\n', '    x, y = xy(t, n)\n', '    svg.append(f\'<circle cx="{x}" cy="{y}" r="3"/>\')\n', 'for t in [0,30,60,90,120]:\n', '    x, _ = xy(t, 0)\n', '    svg.append(f\'<text x="{x-8}" y="352">{t}</text>\')\n', 'for n in [0,N0/2,N0]:\n', '    _, y = xy(0, n)\n', '    svg.append(f\'<text x="12" y="{y+4}">{n:g}</text>\')\n', "svg.append('</svg>')\n", "plot_svg = ''.join(svg)\n", "with open('decay-comparison.svg', 'w', encoding='utf-8') as f:\n", '    f.write(plot_svg)\n', 'try:\n', '    from IPython.display import SVG, display\n', '    display(SVG(plot_svg))\n', 'except ImportError:\n', "    print('Đã tạo decay-comparison.svg; mở tệp để xem đồ thị.')\n"]},
 {'cell_type':'markdown','id':'reflection','metadata':{},'source':['## Thảo luận\n','1. Giả thuyết nào khớp? Tại sao?\n','2. Nếu dữ liệu đo dao động ngẫu nhiên, cách ước lượng cần thay đổi gì?\n','3. Phân biệt N với H = lambda*N. Ghi giả thiết và đơn vị.']} ]}
(root/'public/learning/decay-analysis.ipynb').write_text(json.dumps(nb,ensure_ascii=False,indent=2))
with (root/'public/learning/decay-model.csv').open('w') as f:
 f.write('t_seconds,N_model\n');f.writelines(f'{t},{800*2**(-t/30):.2f}\n' for t in range(0,121,10))
flows={
 'B21':(['Nguồn α','Lá vàng mỏng','Màn thu tín hiệu'],['Hạt nhân nhỏ, mang điện +','A = Z + N · Đồng vị: cùng Z','R ≈ 1,2 A^(1/3) fm']),
 'B22':(['Hạt ban đầu','Phản ứng','Sản phẩm + năng lượng'],['Bảo toàn tổng A và tổng Z','Δm = Zmₚ + Nmₙ − m hạt nhân','E liên kết = Δm c² · Q = (m trước − m sau)c²']),
 'B23':(['N₀','N₀ / 2 sau T','N₀ / 4 sau 2T'],['N(t) = N₀ × 2^(−t/T) · λ = ln2 / T','H = λN · Đơn vị H: Bq','α: (A−4, Z−2) · β⁻: (A, Z+1) · γ: (A, Z)']),
 'B24':(['Nhiệt từ phân hạch','Turbine quay','Máy phát điện'],['Vòng nước sơ cấp và thứ cấp tách biệt','Ứng dụng: năng lượng · y học · thực phẩm · công nghiệp','Chẩn đoán ghi tín hiệu · Xạ trị tác động mô đích']),
 'B25':(['Bảng H(t)','Đồ thị + mô hình','Ước lượng T'],['H₀ = 151 Bq → H₀/2 = 75,5 Bq','H(30 s) = 85 Bq · H(60 s) = 55 Bq → 30 s < T < 60 s','Ghi giả thiết, đơn vị, nguồn dữ liệu và sai khác'])}
for l in lessons:
 code=l['code'];nodes,lines=flows[code]
 for animated in [False,True]:
  parts=[f'<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="560" viewBox="0 0 1000 560" role="img" aria-labelledby="title desc"><title id="title">{code} {html.escape(l["title"])}</title><desc id="desc">{html.escape(". ".join(nodes+lines))}. Sơ đồ định tính không theo tỉ lệ.</desc><style>text{{font-family:Arial,sans-serif}} @media(prefers-reduced-motion:reduce){{.moving{{display:none}}}}</style><rect width="1000" height="560" rx="24" fill="#eef4fb"/><text x="42" y="64" font-size="30" font-weight="700" fill="#17375e">{code} · {html.escape(l["title"])}</text>']
  for i,label in enumerate(nodes):
   x=42+i*325;parts.append(f'<rect x="{x}" y="130" width="266" height="105" rx="18" fill="{["#17375e","#226997","#13786b"][i]}"/><text x="{x+133}" y="190" fill="white" font-size="20" text-anchor="middle">{html.escape(label)}</text>')
   if i<2:parts.append(f'<path d="M{x+272} 182h40m-10 -9l10 9 -10 9" fill="none" stroke="#385c86" stroke-width="4"/>')
  for i,line in enumerate(lines):parts.append(f'<text x="42" y="{310+i*64}" font-size="21" fill="#25374e">{html.escape(line)}</text>')
  parts.append('<text x="42" y="527" font-size="16" fill="#4c627c">Học liệu Vật lí 12 · Hình minh họa quy ước · Đối chiếu SGK Chương IV</text>')
  if animated:parts.append('<circle class="moving" r="10" fill="#ffc95b"><animateMotion dur="5s" repeatCount="indefinite" path="M55 252 L930 252"/></circle>')
  parts.append('</svg>');(root/f'public/illustrations/{code}-{"animation" if animated else "diagram"}.svg').write_text(''.join(parts))
(root/'public/illustrations/rutherford_scheme.svg').write_text((root/'public/illustrations/B21-diagram.svg').read_text())
print('Built 5 worksheets, Chapter IV extract, 11 SVGs, notebook and CSV')
