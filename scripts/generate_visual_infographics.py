"""Scientific vector originals. Regenerate with python3 scripts/generate_visual_infographics.py."""
from pathlib import Path
from html import escape
from json import loads
from math import sin,cos,sqrt,pi
OUT=Path(__file__).resolve().parents[1]/'public/illustrations'
W,H=1200,700
NAVY='#172f4d'; MUTED='#506980'; RED='#d54f53'; BLUE='#268fbc'; TEAL='#147e7b'
def text(x,y,t,size=20,color=NAVY,weight=400,anchor='start'):
 return f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" font-weight="{weight}" text-anchor="{anchor}">{escape(str(t))}</text>'
def lines(x,y,ts,size=18,color=MUTED,gap=28): return ''.join(text(x,y+i*gap,t,size,color) for i,t in enumerate(ts))
def rect(x,y,w,h,c='#fff',r=18,stroke='none'):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{c}" stroke="{stroke}"/>'
def nuclide(x,y,element,a,z):
 return text(x-4,y-10,a,13,NAVY,600,'end')+text(x-4,y+6,z,13,NAVY,600,'end')+text(x,y,element,23,NAVY,700)
def fraction(x,y,numerator,denominator,width=56):
 return text(x,y-10,numerator,20,NAVY,600,'middle')+path(f'M {x-width/2} {y} H {x+width/2}',NAVY,1.5)+text(x,y+23,denominator,20,NAVY,600,'middle')
def circle(x,y,r,c,opacity=1):return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}" opacity="{opacity}"/>'
def path(d,c=BLUE,width=4,arrow=False,dash=False):return f'<path d="{d}" stroke="{c}" stroke-width="{width}" fill="none" stroke-linecap="round"'+(' marker-end="url(#arrow)"' if arrow else '')+(' stroke-dasharray="8 8"' if dash else '')+'/>'
def nucleus(x,y,z,n,r=60):
 # Actual nucleon count, deterministic packing in a 2D explanatory projection.
 total=z+n; nr=min(9,r/sqrt(total)*.88)
 return ''.join(circle(round(x+sqrt(((i*37)%total+.5)/total)*r*cos((i*37)%total*2.399963),2),round(y+sqrt(((i*37)%total+.5)/total)*r*sin((i*37)%total*2.399963),2),round(nr,2),RED if i<z else BLUE) for i in range(total))
def base(code,title,sub,body,note):
 return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(sub+' '+note)}</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke"/></marker><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#f0f6fb"/><stop offset="1" stop-color="#e4eef7"/></linearGradient></defs><g font-family="Arial, sans-serif">{rect(0,0,W,H,'url(#bg)',24)}{rect(36,34,76,36,NAVY,9)}{text(74,60,code,21,'#fff',700,'middle')}{text(132,62,title,34,NAVY,700)}{text(40,103,sub,19,MUTED)}{body}{text(40,670,note,16,MUTED)}</g></svg>'''
# B21 — scattering + counted carbon nucleus
b=rect(35,140,675,460)+rect(730,140,435,460)
b+=rect(361,198,16,280,'#e9b659',3)+text(369,183,'Lá vàng mỏng',19,MUTED,400,'middle')
for yy in [245,305,385,455]:b+=path(f'M 75 {yy} L 645 {yy}',TEAL,2,True)
b+=path('M 75 342 L 349 342 Q 405 340 480 215 L 605 192',RED,4,True)+path('M 75 360 L 338 360 Q 401 360 285 418 L 184 466',RED,4,True)
b+=circle(368,350,12,'#e5ac3e')+text(368,357,'+',19,NAVY,700,'middle')
b+=circle(89,342,10,RED)+text(85,325,'α',24,RED,700)
b+=lines(60,530,['Phần lớn α đi gần như thẳng.','Một số rất ít bị lệch mạnh hoặc bật ngược.'],20)
b+=nucleus(941,325,6,6,90)+text(941,466,'C-12',36,NAVY,700,'middle')
b+=lines(770,515,['Z = 6 proton     N = 6 neutron','A = Z + N = 12','C-14: cùng Z = 6, nhưng N = 8.'],20)
b+=circle(795,193,7,RED)+text(814,200,'Proton (+)',17)+circle(987,193,7,BLUE)+text(1006,200,'Neutron',17)
(OUT/'B21-diagram.svg').write_text(base('B21','Bằng chứng cho một hạt nhân nhỏ','Từ đường đi của hạt α đến cách đọc A, Z, N',b,'Sơ đồ định tính, hạt nhân phóng đại; không thể suy ra tỉ lệ kích thước từ hình.'),encoding='utf-8')
# B22 — exact SGK illustrative channel
b=rect(35,140,1130,420)
b+=nucleus(205,305,92,143,64)+circle(81,305,9,BLUE)+path('M 98 305 L 127 305',TEAL,3,True)
b+=text(205,425,'U-235',28,NAVY,700,'middle')+text(205,457,'92p · 143n',19,MUTED,400,'middle')
b+=path('M 295 305 L 392 305',MUTED,3,True)+nucleus(492,305,92,144,66)
b+=text(492,425,'U-236*',28,NAVY,700,'middle')+text(492,457,'92p · 144n',19,MUTED,400,'middle')
b+=path('M 575 305 L 656 305',MUTED,3,True)+nucleus(760,270,39,56,48)+nucleus(960,360,53,85,57)
for x,y in [(873,209),(873,439),(1062,252)]: b+=circle(x,y,8,BLUE)
b+=path('M 865 250 L 873 222',TEAL,2,True)+path('M 845 360 L 869 422',TEAL,2,True)+path('M 1002 317 L 1050 262',TEAL,2,True)
b+=text(760,350,'Y-95',24,NAVY,700,'middle')+text(960,445,'I-138',24,NAVY,700,'middle')
b+=text(1000,195,'+ 3 neutron',21,BLUE,700,'middle')
b+=text(130,520,'Neutron tới',18,MUTED)+text(405,520,'Hấp thụ & kích thích',18,MUTED)+text(725,520,'Biến dạng → tách mảnh',18,MUTED)
b+=rect(35,580,1130,54,NAVY,12)+text(60,615,'A: 235 + 1 = 95 + 138 + 3 = 236',22,'#fff',700)+text(720,615,'Z: 92 = 39 + 53',22,'#fff',700)
b+=text(43,118,'Một kênh minh họa',18,MUTED)+nuclide(252,118,'n',1,0)+text(282,118,'+',23)+nuclide(325,118,'U',235,92)+text(363,118,'→',23)+nuclide(418,118,'U*',236,92)+text(467,118,'→',23)+nuclide(518,118,'Y',95,39)+text(552,118,'+',23)+nuclide(602,118,'I',138,53)+text(630,118,'+ 3',23)+nuclide(699,118,'n',1,0)
(OUT/'B22-diagram.svg').write_text(base('B22','Theo dấu một phản ứng phân hạch','',b,'Đỏ: proton · Xanh: neutron. Theo SGK tr. 100–101; hình và thời gian không theo tỉ lệ thực.'),encoding='utf-8')
# B23 — attenuation, never absolute gamma cutoff
b=rect(35,140,1130,455)
for x,w,label,c in [(354,20,'Giấy','#e9d6ae'),(623,36,'Nhôm','#aebdca'),(882,102,'Chì / bê tông','#657f95')]:b+=rect(x,217,w,314,c,4)+text(x+w/2,186,label,23,NAVY,700,'middle')
for y,symbol,colour in [(275,'α',RED),(380,'β',BLUE),(485,'γ','#8a55b5')]:
 b+=circle(129,y,36,colour)+text(129,y+10,symbol,31,'#fff',700,'middle')
b+=path('M 185 275 L 340 275',RED,5,True)+circle(355,275,8,RED)
b+=path('M 185 380 L 608 380',BLUE,4,True)+circle(630,380,7,BLUE)
b+=path('M 185 485 L 874 485','#8a55b5',4,True)+path('M 982 485 L 1092 485','#bea5d2',2,True,True)
b+=lines(70,567,['α: hạt nhân He-4        β: electron / positron        γ: photon năng lượng cao'],20)
b+=text(60,627,'Phân rã: tự phát · ngẫu nhiên với từng hạt · có quy luật thống kê với nhiều hạt',22,NAVY,700)
(OUT/'B23-diagram.svg').write_text(base('B23','Ba loại bức xạ, ba cách đọc hình','So sánh bản chất và sự suy giảm qua vật liệu chắn',b,'Mức đâm xuyên phụ thuộc năng lượng và vật liệu; tia γ suy giảm, không bị chặn tuyệt đối như nét vẽ.'),encoding='utf-8')
# B24 — separate PWR circuits
b=rect(35,140,1130,464)
b+=rect(118,276,124,163,'#dbe7f0',24,NAVY)+rect(147,307,20,92,RED,3)+rect(187,307,20,92,RED,3)
b+=path('M 164 228 L 164 326',MUTED,7)+path('M 195 228 L 195 326',MUTED,7)
b+=text(175,483,'Lò phản ứng',22,NAVY,700,'middle')+text(175,511,'Phân hạch → nhiệt',18,MUTED,400,'middle')
b+=rect(468,266,99,176,'#edf3f7',16,NAVY)
b+=path('M 242 318 L 397 318 Q 440 318 484 334 L 493 397 Q 455 424 399 424 L 244 424',RED,5,True)
b+=path('M 277 318 L 333 318',RED,4,True)+text(346,287,'Vòng sơ cấp',20,RED,700,'middle')
b+=path('M 545 294 L 716 294 L 756 325', '#b98529',5,True)
b+=path('M 804 383 L 804 470 L 551 470 L 545 417', '#b98529',5,True)
b+=path('M 532 308 L 532 418', '#b98529',5)
b+=path('M 499 325 L 524 325',TEAL,3,True)+path('M 499 368 L 524 368',TEAL,3,True)
b+=text(518,511,'Trao đổi nhiệt',22,NAVY,700,'middle')+text(518,538,'Hai vòng không trộn lẫn',17,MUTED,400,'middle')
b+=rect(756,314,96,86,'#e9c77e',9,NAVY)+path('M 770 321 L 833 356 L 770 391',NAVY,3)+text(804,266,'Turbine',22,NAVY,700,'middle')
b+=path('M 852 357 L 930 357',NAVY,6)+circle(981,357,51,'#c9e4df')+text(981,368,'G',30,TEAL,700,'middle')+text(981,266,'Máy phát',22,NAVY,700,'middle')
b+=path('M 1039 357 L 1111 357',TEAL,4,True)+text(1083,400,'Điện',20,TEAL,700,'middle')
b+=rect(762,446,91,40,'#b9d9ed',6)+text(848,552,'Ngưng tụ',19,MUTED,400,'middle')+path('M 735 482 L 735 525 L 1033 525 L 1033 482 L 854 482',BLUE,3,True)
b+=text(645,243,'Vòng thứ cấp (hơi / nước)',19,'#9b6a1c')
b+=text(64,636,'Năng lượng hạt nhân   →   Nhiệt năng   →   Cơ năng   →   Điện năng',25,NAVY,700)
(OUT/'B24-diagram.svg').write_text(base('B24','Điện được tạo ra ở đâu?','Sơ đồ nguyên lí lò nước áp lực: theo dòng vật chất và dòng năng lượng',b,'Mô hình giản lược một thiết kế lò; không đại diện cho mọi nhà máy. Mũi tên trong bộ trao đổi chỉ dòng nhiệt.'),encoding='utf-8')
# B25 — measurements from Table 25.1, with linear interpolation only across the bracket
measurements=loads((OUT.parents[1]/'src/data/sgk-b25-table-25-1.json').read_text())
def decay_x(seconds): return 402 + 432*seconds/360
def decay_y(activity): return 529 - 268*activity/160
half=measurements[0]['h']/2
estimate=30+30*(measurements[1]['h']-half)/(measurements[1]['h']-measurements[2]['h'])
b=rect(35,140,285,455)+rect(340,140,545,455)+rect(905,140,260,455)
b+=text(64,192,'Bảng 25.1',24,NAVY,700)
b+=text(70,233,'t (s)',19,MUTED)+text(271,233,'H (Bq)',19,MUTED,400,'end')
for i,point in enumerate(measurements):
 yy=264+i*37
 b+=rect(55,yy-22,245,30,'#eef4f9',6)+text(71,yy,point['t'],18)+text(271,yy,point['h'],20,NAVY,700,'end')
b+=path('M 402 261 L 402 529 L 834 529',NAVY,2)+text(365,225,'Hoạt độ (Bq)',18,NAVY,700)+text(770,575,'Thời gian (s)',17,NAVY)
for v in [0,50,100,150]:
 yy=decay_y(v)
 b+=path(f'M 402 {yy} L 834 {yy}','#d5e1ec',1)+text(390,yy+6,v,16,MUTED,400,'end')
for v in range(0,361,60):
 b+=text(decay_x(v),555,v,16,MUTED,400,'middle')
for point in measurements:
 b+=circle(decay_x(point['t']),decay_y(point['h']),6,TEAL)
x=decay_x(estimate); y=decay_y(half)
b+=path(f'M 402 {y} H {x} V 529','#9d6a11',2,False,True)+text(510,y-10,'75,5 Bq',17,'#8b5c10',700)
points=f"{decay_x(30)},{decay_y(85)} {decay_x(60)},{decay_y(55)}"
b+=f'<polyline points="{points}" stroke="#9d6a11" fill="none" stroke-width="3"/>'
b+=text(930,202,'Mức nửa hoạt độ',23,NAVY,700)
b+=text(925,267,'H(T) =',22,NAVY,700)+fraction(1010,262,'H₀','2',36)+text(1038,267,'= 75,5 Bq',20,NAVY,700)
b+=text(930,343,'Công thức liên hệ',23,NAVY,700)
b+=text(925,413,'H(t) = H₀ · 2',20,NAVY,600)+text(1031,398,'−',15,NAVY,600)+text(1047,388,'t',14,NAVY,600,'middle')+path('M 1040 392 H 1054',NAVY,1)+text(1047,405,'T',14,NAVY,600,'middle')
b+=text(925,471,'λ =',21,NAVY,700)+fraction(992,464,'ln 2','T')
b+=text(926,528,'H(t) = λN(t)',22,TEAL,700)
b+=text(57,634,'T nằm giữa 30 và 60 giây. Nội suy thẳng giữa hai điểm cho khoảng 39,5 giây.',23,NAVY,700)
(OUT/'B25-diagram.svg').write_text(base('B25','Ước lượng chu kì bán rã từ số liệu','Theo SGK Vật lí 12 Kết nối tri thức, Bảng 25.1, trang in 121',b,'Chấm xanh là số liệu SGK. Đoạn nối màu vàng dùng để nội suy; 39,5 giây là giá trị ước lượng.'),encoding='utf-8')
print('Generated 5 scientific SVG infographics')
# Animated variants keep the scientific figure intact; moving markers guide observation.
# Motion is qualitative and disabled for users requesting reduced motion.
motions={
 'B21': f'<circle r="8" fill="{RED}"><animateMotion dur="5s" repeatCount="indefinite" path="M 75 342 L 349 342 Q 405 340 480 215 L 605 192"/></circle><circle r="7" fill="{TEAL}"><animateMotion dur="5s" repeatCount="indefinite" path="M 75 245 L 645 245"/></circle>',
 'B22': f'<circle r="11" fill="{BLUE}" stroke="white" stroke-width="2"><animateMotion dur="6s" repeatCount="indefinite" path="M 65 305 L 147 305" keyTimes="0;0.3;1" keyPoints="0;1;1" calcMode="linear"/><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.3;0.31;1" dur="6s" repeatCount="indefinite"/></circle><rect x="388" y="215" width="210" height="185" rx="40" fill="none" stroke="{TEAL}" stroke-width="4"><animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.3;0.31;0.6;0.61;1" dur="6s" repeatCount="indefinite"/></rect><rect x="681" y="217" width="420" height="274" rx="30" fill="none" stroke="{TEAL}" stroke-width="4"><animate attributeName="opacity" values="0;0;1;1" keyTimes="0;0.6;0.61;1" dur="6s" repeatCount="indefinite"/></rect>',
 'B23': f'<circle r="8" fill="{RED}"><animateMotion path="M 185 275 L 345 275" dur="4s" repeatCount="indefinite"/></circle><circle r="7" fill="{BLUE}"><animateMotion path="M 185 380 L 620 380" dur="4s" repeatCount="indefinite"/></circle><circle r="6" fill="#8a55b5"><animateMotion path="M 185 485 L 1092 485" dur="4s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;1;0.25;0.25" keyTimes="0;0.75;0.9;1" dur="4s" repeatCount="indefinite"/></circle>',
 'B24': f'<circle r="7" fill="{RED}" stroke="white" stroke-width="2"><animateMotion path="M 242 318 L 397 318 Q 440 318 484 334 L 493 397 Q 455 424 399 424 L 244 424 L 158 424 L 158 318 Z" dur="7s" repeatCount="indefinite"/></circle><circle r="7" fill="#b98529" stroke="white" stroke-width="2"><animateMotion path="M 545 294 L 716 294 L 804 345 L 804 470 L 551 470 L 545 417 Z" dur="7s" repeatCount="indefinite"/></circle>',
 'B25': f'<polyline points="{points}" fill="none" stroke="#d09a37" stroke-width="6" stroke-dasharray="60" stroke-dashoffset="60"><animate attributeName="stroke-dashoffset" values="60;0;0" keyTimes="0;0.8;1" dur="6s" repeatCount="indefinite"/></polyline>'
}
for code,motion in motions.items():
 original=(OUT/f'{code}-diagram.svg').read_text()
 original=original.replace('</defs>','</defs><style>@media(prefers-reduced-motion:reduce){.motion-guide{display:none}}</style>')
 original=original.replace('</g></svg>',f'<g class="motion-guide">{motion}</g></g></svg>')
 (OUT/f'{code}-animation.svg').write_text(original,encoding='utf-8')
print('Generated 5 animated visual guides')
