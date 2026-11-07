from pathlib import Path
import json,math
R=Path('/Users/vodoandangkhoi/Documents/WEB_WORKING_24-09'); D=R/'public/learning/question-images';D.mkdir(parents=True,exist_ok=True)
assets=[]
def svg(id,lesson,title,content,description):
 s=f'''<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="540" viewBox="0 0 1000 540"><defs><marker id="arrow" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0 0L8 4L0 8" fill="#334155"/></marker></defs><rect width="1000" height="540" fill="white"/><g font-family="Arial, sans-serif" fill="#172b4d"><text x="48" y="52" font-size="27" font-weight="bold">{title}</text>{content}<text x="48" y="510" font-size="17" fill="#526174">Mô hình minh họa phục vụ học tập · {lesson} · Không theo tỉ lệ kích thước thật</text></g></svg>'''
 (D/(id+'.svg')).write_text(s)
 assets.append(dict(id=id,lesson=lesson,title=title,description=description,url='/learning/question-images/'+id+'.png',svgUrl='/learning/question-images/'+id+'.svg',source='Nhóm thiết kế học liệu; sơ đồ và dữ liệu mô hình được mô tả trong từng câu hỏi.'))
def text(x,y,s,size=24):return f'<text x="{x}" y="{y}" font-size="{size}">{s}</text>'
def line(x1,y1,x2,y2,stroke='#334155',arrow=False):return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="3"'+(' marker-end="url(#arrow)"' if arrow else '')+'/>'
def circle(x,y,c):return f'<circle cx="{x}" cy="{y}" r="24" fill="{c}" stroke="white" stroke-width="2"/>'
c=''
for x,z,n,name in [(235,6,6,'Hạt nhân I'),(685,6,8,'Hạt nhân II')]:
 for j in range(z+n):c+=circle(x+(j%4-1.5)*51,170+(j//4)*51,'#d65858' if j<z else '#3975ad')
 c+=text(x-70,390,name)
c+=circle(80,438,'#d65858')+text(116,446,'Proton',20)+circle(330,438,'#3975ad')+text(366,446,'Neutron',20)
svg('isotopes','B21','Hai mô hình hạt nhân',c,'Đếm proton và neutron của hai mô hình; màu đỏ là proton, xanh là neutron.')
c=text(68,175,'Nguồn α')+f'<rect x="365" y="105" width="12" height="285" fill="#c28a38"/>'+text(320,430,'Lá vàng')+line(90,240,345,240,'#b45309',True)+line(380,240,825,240,'#b45309',True)+line(380,240,790,120,'#b45309',True)+line(380,240,165,350,'#b45309',True)+text(770,285,'Qua gần thẳng',20)+text(720,98,'Lệch góc nhỏ',20)+text(92,395,'Lệch góc lớn / bật ngược',20)+text(425,360,'Sơ đồ các đường đi minh họa',20)
svg('rutherford','B21','Tán xạ hạt alpha qua lá vàng',c,'Ba đường đi minh họa; không biểu diễn tỉ lệ xác suất các đường đi.')
c=text(55,118,'Năng lượng liên kết riêng (MeV/nuclon)',21)+line(100,420,900,420,arrow=True)+line(100,420,100,140,arrow=True)
for i,(name,v) in enumerate([('He-4',7.07),('Fe-56',8.79),('U-235',7.59)]):
 x=255+i*235;h=v*28;c+=f'<rect x="{x-60}" y="{420-h}" width="120" height="{h}" rx="5" fill="#407f9b"/>'+text(x-26,405-h,str(v).replace('.',','),22)+text(x-42,455,name,22)
svg('binding','B22','So sánh mức liên kết trung bình',c,'Giá trị gần đúng E/A của ba hạt nhân, dữ kiện phục vụ câu hỏi so sánh.')
c=circle(98,240,'#3975ad')+text(80,305,'n')+line(135,240,260,240,arrow=True)+f'<circle cx="330" cy="240" r="66" fill="#d1b17d"/>'+text(278,248,'U-235',24)+line(415,240,550,150,arrow=True)+line(415,240,550,330,arrow=True)+f'<ellipse cx="640" cy="150" rx="80" ry="50" fill="#aacddd"/><ellipse cx="640" cy="330" rx="80" ry="50" fill="#e9bcbc"/>'+text(601,157,'Ba-141')+text(601,337,'Kr-92')
for j,y in enumerate([190,245,300]):c+=circle(815,y,'#3975ad')+line(850,y,930,y,arrow=True)
c+=text(770,372,'Neutron sinh ra',20)+text(62,440,'Một nhánh phản ứng minh họa; sản phẩm thật có nhiều khả năng khác nhau.',19)
svg('fission','B22','Một nhánh phân hạch uranium',c,'Nhánh U-235 + n cho Ba-141, Kr-92 và ba neutron; dùng kiểm tra bảo toàn A, Z.')
c=line(120,420,900,420,arrow=True)+line(120,420,120,135,arrow=True)+text(68,130,'N',22)+text(908,427,'t',22)
pts=[]
for j in range(61):x=120+j*12;y=420-250*2**(-j/20);pts.append(f'{x},{y}')
c+=f'<polyline points="{" ".join(pts)}" fill="none" stroke="#247b91" stroke-width="5"/>'
for j,v in enumerate([800,400,200,100]):
 x=120+j*240;y=420-v/800*250;c+=f'<circle cx="{x}" cy="{y}" r="6" fill="#b45309"/>'+text(x-18,458,['0','T','2T','3T'][j],22)+text(x+14,y-12,str(v),22)
c+=text(525,132,'N₀ = 800; T không đổi',23)
svg('decay-curve','B23','Số hạt nhân mẹ còn lại theo thời gian',c,'Đường N(t) lí thuyết, giá trị trung bình; không phải dữ liệu đo thực tế.')
c=text(74,130,'Cùng điều kiện mô phỏng, mỗi lượt đếm 10 giây',22)
for j,v in enumerate([18,22,20]):
 x=220+j*240;h=v*10;c+=f'<rect x="{x-55}" y="{420-h}" width="110" height="{h}" fill="#487ea5"/>'+text(x-12,405-h,str(v),24)+text(x-50,453,'Lượt '+str(j+1),21)
c+=line(100,420,910,420)+text(64,170,'Số đếm',21)
svg('counting','B23','Ba lượt đếm trong cùng điều kiện',c,'Dữ liệu mô phỏng cố định 18, 22, 20 số đếm trong 10 giây; không phải phép đo thật.')
c=''
for j,(name,col) in enumerate([('Lò phản ứng','#e8c7a3'),('Bộ trao đổi nhiệt','#b6d6e5'),('Turbine','#c9d3df'),('Máy phát điện','#bdd8bd')]):
 x=45+j*245;c+=f'<rect x="{x}" y="190" width="210" height="130" rx="16" fill="{col}"/>'+text(x+16,260,name,19)
 if j<3:c+=line(x+214,253,x+242,253,arrow=True)
c+=text(58,380,'Theo dõi dạng năng lượng ở từng giai đoạn.',22)
svg('power-flow','B24','Các bộ phận chính của nhà máy điện hạt nhân',c,'Sơ đồ đơn giản để học sinh tự điền dòng chuyển hóa năng lượng.')
c=text(76,135,'Tia α')+text(76,235,'Tia β')+text(76,335,'Tia γ')
for x,name,col in [(320,'Giấy','#ead2a5'),(535,'Nhôm','#b6c5d3'),(780,'Chì dày','#738499')]:c+=f'<rect x="{x}" y="88" width="32" height="305" fill="{col}"/>'+text(x-32,435,name,20)
c+=line(170,128,316,128,'#b45309',True)+line(170,228,530,228,'#306ba0',True)+line(170,328,774,328,'#477958',True)+line(814,328,926,328,'#99bba5',True)+text(596,476,'γ bị suy giảm, không bị chắn tuyệt đối',18)
svg('shielding','B24','Minh họa khả năng đâm xuyên',c,'Khả năng chắn phụ thuộc năng lượng và vật liệu; tia gamma bị suy giảm, không chắn tuyệt đối.')
c=f'<circle cx="135" cy="265" r="39" fill="#e7b960"/>'+text(80,355,'Nguồn điểm',22)+line(180,230,850,130,'#8fa4b8')+line(180,300,850,400,'#8fa4b8')
for x,name in [(420,'r'),(730,'2r')]:c+=f'<rect x="{x}" y="180" width="38" height="160" fill="#91becf"/>'+text(x-12,388,name,25)+text(x-35,157,'Máy đếm',18)
c+=text(230,455,'Giả thiết: nguồn điểm, bỏ qua hấp thụ và bức xạ nền.',21)
svg('distance','B25','So sánh hai khoảng cách tới nguồn',c,'Sơ đồ nguồn điểm để xét tỉ số cường độ ở r và 2r dưới các giả thiết được ghi.')
c=text(65,130,'Thời gian mỗi lượt: 20 giây; nền mô phỏng: 4 số đếm/lượt',22)
for j,v in enumerate([44,48,40,52]):
 x=210+j*190;h=v*4.5;c+=f'<rect x="{x-50}" y="{420-h}" width="100" height="{h}" fill="#588c8a"/>'+text(x-13,405-h,str(v),23)+text(x-45,452,'Lượt '+str(j+1),20)
c+=line(100,420,920,420)
svg('background','B25','Số đếm mô phỏng và bức xạ nền',c,'Bốn lượt mô phỏng 44,48,40,52; nền 4 trong20s; dùng luyện đọc dữ liệu, không suy liều.')
(R/'src/data/question-images.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2))
questions=[]
def q(id,topic,image,prompt,options,ans,ex,level='Thông hiểu'):
 questions.append(dict(id=id,kind='choice',topic=topic,level=level,prompt=prompt,options=options,answer=ans,explanation=ex,points=1,imageId=image,source='Câu hỏi do nhóm thiết kế biên soạn từ kiến thức B21–B25; hình là mô hình, cần giáo viên rà soát trước khi giao.'))
q('img-B21-1','B21','isotopes','Dựa vào màu chú giải, hai hạt nhân trong hình có quan hệ nào?',['Cùng Z, khác N','Cùng A, khác Z','Cùng N, khác Z','Khác Z và khác N'],0,'Hạt nhân I:6proton,6neutron; II:6proton,8neutron. Cùng Z=6, khác N nên là đồng vị.')
q('img-B21-2','B21','isotopes','Số neutron của hạt nhân II trong hình là bao nhiêu?',['6','8','12','14'],1,'Hạt nhân II có8hạt màu xanh, tức8neutron.','Nhận biết')
q('img-B21-3','B21','rutherford','Việc một số rất ít hạt alpha bật ngược gợi ý điều gì?',['Điện tích dương phân bố đều','Electron chứa gần hết khối lượng','Vùng điện tích dương tập trung trong hạt nhân rất nhỏ','Nguyên tử là khối đặc'],2,'Lệch góc lớn cho bằng chứng về vùng điện tích dương tập trung; hình chỉ minh họa đường đi, không cho tần suất.')
q('img-B21-4','B21','rutherford','Sơ đồ đường đi này có cho phép suy chính xác tỉ lệ hạt bật ngược không?',['Có, vì vẽ một đường bật ngược','Không, hình không biểu diễn tần suất đo','Có, tỉ lệ là1/3','Có, tỉ lệ là2/3'],1,'Không thể suy tần suất từ số đường minh họa trên sơ đồ.')
q('img-B22-1','B22','binding','Hạt nhân nào có năng lượng liên kết riêng lớn nhất trong hình?',['He-4','Fe-56','U-235','Cả ba bằng nhau'],1,'Fe-56 có E/A gần8,79MeV/nuclon.','Nhận biết')
q('img-B22-2','B22','binding','Từ dữ kiện hình, năng lượng liên kết tổng của He-4 gần bằng bao nhiêu?',['1,77MeV','7,07MeV','28,28MeV','56,56MeV'],2,'E=(E/A)A=7,07×4=28,28MeV.','Vận dụng')
q('img-B22-3','B22','fission','Với nhánh trong hình, số neutron sinh ra cần có để bảo toàn A là bao nhiêu?',['1','2','3','4'],2,'236=141+92+k nên k=3. Điện tích92=56+36.','Vận dụng')
q('img-B22-4','B22','fission','Nhận xét nào đúng về nhánh phản ứng được minh họa?',['Mọi lần phân hạch U-235 đều có hai mảnh như hình','Đây là một nhánh minh họa; phân hạch có thể tạo các mảnh khác','Không có năng lượng tỏa ra','Số khối mỗi mảnh bằng235'],1,'Phân hạch có nhiều nhánh; hình không mô tả mọi sản phẩm có thể có.')
q('img-B23-1','B23','decay-curve','Theo đường lí thuyết, sau2T phần hạt nhân mẹ còn lại là bao nhiêu?',['25%','50%','75%','100%'],0,'N(2T)=200, N₀=800, tỉ lệ còn lại25%.')
q('img-B23-2','B23','decay-curve','Theo hình, sau2T có bao nhiêu hạt nhân mẹ đã phân rã?',['100','200','400','600'],3,'Nđãphânrã=800−200=600; tương ứng75%.','Vận dụng')
q('img-B23-3','B23','counting','Giá trị trung bình của ba lượt đếm trong hình là bao nhiêu?',['18','19','20','22'],2,'(18+22+20)/3=20 số đếm mỗi10s.','Vận dụng')
q('img-B23-4','B23','counting','Ba lượt đếm khác nhau ở cùng điều kiện phù hợp với nhận xét nào?',['Máy đếm chắc chắn hỏng','Phân rã có tính ngẫu nhiên, số đếm có thể dao động','Chu kì bán rã đổi ở mỗi lượt','Số đếm phải bằng nhau tuyệt đối'],1,'Phân rã ngẫu nhiên gây dao động số đếm; cần lặp và kiểm soát điều kiện.')
q('img-B24-1','B24','power-flow','Trình tự chuyển hóa năng lượng nào phù hợp sơ đồ?',['Hạt nhân→nhiệt→cơ→điện','Điện→hạt nhân→nhiệt→cơ','Cơ→hạt nhân→điện→nhiệt','Nhiệt→điện→hạt nhân→cơ'],0,'Năng lượng hạt nhân tạo nhiệt, nhiệt tạo cơ năng quay turbine rồi máy phát tạo điện.')
q('img-B24-2','B24','power-flow','Bộ phận nào biến cơ năng quay thành điện năng?',['Lò phản ứng','Bộ trao đổi nhiệt','Turbine','Máy phát điện'],3,'Máy phát điện chuyển cơ năng thành điện năng.','Nhận biết')
q('img-B24-3','B24','shielding','Phát biểu nào phù hợp phần minh họa tia gamma?',['Một tờ giấy chắn hết gamma','Gamma bị suy giảm qua vật liệu chắn, không xem là bị chắn tuyệt đối','Gamma không tương tác với vật chất','Mọi gamma bị nhôm mỏng chắn hết'],1,'Tia gamma bị suy giảm tùy vật liệu, độ dày và năng lượng; sơ đồ chỉ định tính.')
q('img-B24-4','B24','shielding','Để dùng sơ đồ này trong câu hỏi, điều kiện nào cần nêu rõ?',['Chỉ màu tia là đủ','Khả năng đâm xuyên còn phụ thuộc năng lượng bức xạ và vật liệu','Sơ đồ cho liều thật','Kích thước tia vẽ bằng kích thước thật'],1,'Sơ đồ định tính, không cho liều hoặc mọi giá trị năng lượng.')
q('img-B25-1','B25','distance','Dưới các giả thiết trong hình, cường độ tại2r so với tại r gần bằng bao nhiêu?',['2','1/2','1/4','4'],2,'I∝1/r² nên I(2r)/I(r)=1/4.','Vận dụng')
q('img-B25-2','B25','distance','Khi nào không thể áp dụng trực tiếp tỉ số lí tưởng1/4 trong hình?',['Nguồn điểm, bỏ qua hấp thụ và nền','Nguồn trải rộng hoặc hấp thụ và nền đáng kể','Giữ cùng nguồn và điều kiện lí tưởng','Khoảng cách tăng từ r lên2r ở mô hình lí tưởng'],1,'Nguồn trải rộng, hấp thụ hoặc nền phá vỡ giả thiết đơn giản.')
q('img-B25-3','B25','background','Trung bình số đếm sau trừ nền mỗi lượt trong hình là bao nhiêu?',['40','42','46','50'],1,'Trung bình thô=(44+48+40+52)/4=46; trừ nền4 được42.','Vận dụng')
q('img-B25-4','B25','background','Trung bình tốc độ đếm sau trừ nền là bao nhiêu?',['0,21 số đếm/s','2,1 số đếm/s','4,2 số đếm/s','42 số đếm/s'],1,'42/20=2,1 số đếm/s. Không đồng nhất với H hoặc liều thật.','Vận dụng')
(R/'src/data/illustrated-questions.json').write_text(json.dumps(questions,ensure_ascii=False,indent=2))
print(len(assets),'images',len(questions),'new questions')
