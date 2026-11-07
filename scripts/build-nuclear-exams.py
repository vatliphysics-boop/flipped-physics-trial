"""Author parallel B21–B25 practice papers and printable HTML, with explicit answer keys."""
import json, html
from pathlib import Path

root = Path(__file__).resolve().parents[1]
out = root / 'public/learning/exams'
out.mkdir(parents=True, exist_ok=True)
def mc(topic, level, text, options, answer, explanation):
    return dict(kind='choice', topic=topic, level=level, prompt=text, options=options, answer=answer, explanation=explanation, points=.4)
def tf(topic, text, statements):
    return dict(kind='true_false', topic=topic, level='Thông hiểu', prompt=text, statements=[dict(text=t, answer=a, explanation=e) for t,a,e in statements], points=1)
def num(topic, text, answer, unit, explanation, tolerance=.01):
    return dict(kind='numeric', topic=topic, level='Vận dụng', prompt=text, answer=answer, unit=unit, tolerance=tolerance, explanation=explanation, points=.5)
def essay(topic, text, criteria):
    return dict(kind='written', topic=topic, level='Vận dụng', prompt=text, rubric=[dict(text=t, points=p) for t,p in criteria], points=1, explanation='; '.join(t for t,p in criteria))

papers=[]
for final in [False, True]:
 for b in [False, True]:
    code=('final' if final else 'midterm')+('-b' if b else '-a')
    variant='B' if b else 'A'
    A,Z=(56,26) if b else (23,11)
    qs=[
      mc('B21','Nhận biết',f'Hạt nhân X có A = {A}, Z = {Z}. Số neutron là bao nhiêu?', [str(Z),str(A-Z),str(A),str(A+Z)],1,f'N = A − Z = {A-Z}.'),
      mc('B21','Thông hiểu','Hai hạt nhân là đồng vị của cùng nguyên tố khi có:', ['Cùng A, khác Z','Cùng N, khác Z','Cùng Z, khác N','Cùng khối lượng chính xác'],2,'Đồng vị có cùng số proton Z và khác số neutron N.'),
      mc('B21','Thông hiểu','Một số rất ít hạt α bị lệch góc lớn trong thí nghiệm Rutherford cho thấy:', ['Điện tích dương phân bố đều trong nguyên tử','Hạt nhân nhỏ, mang điện dương','Nguyên tử không có hạt nhân','Electron chứa gần hết khối lượng nguyên tử'],1,'Sự lệch mạnh gợi ý vùng điện tích dương tập trung; đa số hạt qua thẳng cho thấy phần lớn thể tích nguyên tử là khoảng trống.'),
      mc('B22','Nhận biết','Trong phản ứng hạt nhân, đại lượng nào được bảo toàn khi tính cả các hạt tham gia và sinh ra?', ['Số proton trong từng hạt nhân','Tổng số khối A và tổng điện tích Z','Khối lượng nghỉ của từng hạt','Số neutron của mỗi hạt nhân'],1,'Bảo toàn tổng số nucleon và điện tích, không bảo toàn riêng khối lượng nghỉ.'),
      mc('B22','Thông hiểu','Năng lượng liên kết riêng được xác định bằng:', ['E liên kết / A','E liên kết × A','Δm / Z','A / E liên kết'],0,'Năng lượng liên kết riêng là năng lượng liên kết tính trên một nucleon.'),
      mc('B22','Thông hiểu','Một phản ứng có tổng khối lượng nghỉ trước lớn hơn sau. Phản ứng:', ['Luôn thu năng lượng','Tỏa năng lượng','Không trao đổi năng lượng','Không thể xảy ra vì A không bảo toàn'],1,'Q = (m trước − m sau)c² > 0; chênh lệch khối lượng nghỉ chuyển thành năng lượng của sản phẩm.'),
      mc('B23','Nhận biết','Tia γ là:', ['Electron','Hạt nhân helium-4','Bức xạ điện từ','Neutron'],2,'Tia γ là photon năng lượng cao, không mang điện.'),
      mc('B23','Thông hiểu','Sau hai chu kì bán rã, phần số hạt nhân mẹ còn lại theo mô hình là:', ['50%','25%','12,5%','0%'],1,'N/N₀ = 2^(−2) = 1/4.'),
    ]
    if final:
      qs += [mc('B24','Thông hiểu','Trong mô hình nhà máy điện hạt nhân có hai vòng nước, bộ trao đổi nhiệt có nhiệm vụ:', ['Trộn trực tiếp hai vòng nước','Truyền nhiệt giữa hai vòng, không trộn nước','Biến neutron thành electron','Phát điện trực tiếp từ hạt α'],1,'Hai vòng tách biệt, trao đổi nhiệt để tạo hơi làm quay turbine.'),
             mc('B24','Thông hiểu','Thanh điều khiển được đưa sâu hơn vào vùng phản ứng để:', ['Tăng số neutron gây phân hạch','Hấp thụ thêm neutron và giảm phản ứng dây chuyền','Tạo thêm uranium','Chuyển phân hạch thành nhiệt hạch'],1,'Thanh điều khiển hấp thụ neutron; trong mô hình, đưa sâu làm giảm số neutron tiếp tục gây phân hạch.')]
    else:
      qs += [mc('B22','Thông hiểu','Phân hạch khác tổng hợp hạt nhân ở điểm nào?', ['Phân hạch kết hợp hai hạt nhẹ','Phân hạch tách hạt nhân nặng thành các mảnh','Phân hạch luôn cần nhiệt độ Mặt trời','Tổng hợp hạt nhân không bảo toàn điện tích'],1,'Phân hạch tách hạt nhân nặng; tổng hợp kết hợp các hạt nhân nhẹ.'),
             mc('B23','Thông hiểu','Độ phóng xạ H và số hạt nhân mẹ N liên hệ bởi:', ['H = N / λ','H = λN','H = λ / N','H = N + λ'],1,'H = λN, λ = ln2/T; đơn vị H là Bq nếu T theo giây.')]
    if b:
      # Vary option positions, not the correctness or explanation.
      for q in qs:
        q['options']=q['options'][1:]+q['options'][:1];q['answer']=(q['answer']-1)%4
    if final:
      qs += [tf('B24','Xét các ứng dụng hạt nhân sau.',[
        ('PET ghi nhận tín hiệu từ chất đánh dấu phóng xạ trong cơ thể.',True,'PET dùng chất đánh dấu phát positron, ghi cặp photon hủy cặp.'),
        ('PET và xạ trị đều có mục đích chính là tiêu diệt mô đích.',False,'PET phục vụ ghi hình; xạ trị đưa năng lượng vào mô đích để điều trị.'),
        ('Thực phẩm đã chiếu xạ đúng quy trình luôn trở thành nguồn phóng xạ.',False,'Chiếu xạ đúng quy trình không đồng nghĩa biến thực phẩm thành nguồn phóng xạ.'),
        ('Kiểm tra mối hàn bằng bức xạ sử dụng sự suy giảm khác nhau khi đi qua vật.',True,'Tín hiệu truyền qua phụ thuộc cấu trúc và độ dày vật.')]),
        tf('B25','Bảng mẫu SGK: H₀ = 151 Bq; H(30 s) = 85 Bq; H(60 s) = 55 Bq.',[
        ('H₀/2 = 75,5 Bq.',True,'151/2 = 75,5 Bq.'),
        ('Chu kì bán rã nằm giữa 30 s và 60 s theo bảng.',True,'Mức 75,5 Bq nằm giữa 85 và 55 Bq.'),
        ('Mọi điểm số liệu phải nằm chính xác trên đường cong mũ.',False,'Phép đo có dao động và sai số; cần đối chiếu mô hình.'),
        ('Không cần ghi đơn vị khi báo cáo T.',False,'T cần đơn vị thời gian và nêu cách ước lượng.')])]
    else:
      parentA,parentZ=(210,84) if b else (238,92)
      qs += [tf('B23',f'Hạt nhân mẹ có A = {parentA}, Z = {parentZ}, phát ra một hạt α.',[
        (f'Hạt nhân con có A = {parentA-4}.',True,'Hạt α có A = 4.'),
        (f'Hạt nhân con có Z = {parentZ-1}.',False,f'Z giảm 2, còn {parentZ-2}.'),
        ('Hạt α gồm hai proton và hai neutron.',True,'α là hạt nhân helium-4.'),
        ('Tổng điện tích trước và sau không được bảo toàn.',False,'Tổng điện tích được bảo toàn khi tính cả hạt α.')]),
        tf('B23','Xét mẫu phóng xạ có chu kì bán rã T không đổi.',[
        ('Sau mỗi T, số hạt nhân mẹ kì vọng còn lại giảm một nửa.',True,'N(t+T) = N(t)/2.'),
        ('Có thể biết chính xác thời điểm phân rã của từng hạt.',False,'Phân rã của từng hạt là ngẫu nhiên.'),
        ('H và N giảm theo cùng quy luật mũ với λ không đổi.',True,'H = λN.'),
        ('Sau 3T tất cả các hạt nhân mẹ đã phân rã.',False,'Theo mô hình kì vọng còn 1/8 N₀.')])]
    n0,T,k=(960,20,3) if b else (800,30,2)
    dm=.02 if b else .03
    qs += [num('B23',f'Mẫu có N₀ = {n0} hạt, T = {T} s. Số hạt nhân mẹ kì vọng sau {k*T} s là bao nhiêu?',n0/2**k,'hạt',f'N = {n0} × 2^(−{k}) = {n0/2**k:g} hạt.'),
           num('B22',f'Hạt nhân có độ hụt khối Δm = {dm} u. Lấy 1 u c² = 931,5 MeV. Tính năng lượng liên kết, làm tròn đến 0,01 MeV.',round(dm*931.5,2),'MeV',f'E = Δm × 931,5 = {dm*931.5:g} MeV.',.011)]
    if final:
      h0,ht,t=(640,80,90) if b else (480,120,60)
      age=17190 if b else 11460
      qs += [num('B25',f'Mô hình có H₀ = {h0} Bq, H({t} s) = {ht} Bq. Tính T.',t/(3 if b else 2),'s',f'T = t / log₂(H₀/H) = {t/(3 if b else 2):g} s.'),
             num('B23',f'Mẫu hữu cơ đã ngừng trao đổi carbon, tuổi {age} năm; giả sử hoạt tính C-14 ban đầu như mẫu sống, T = 5730 năm. Hoạt tính còn bao nhiêu phần trăm?',12.5 if b else 25,'%',f't/T = {3 if b else 2}; H/H₀ = 2^(−t/T), tức {12.5 if b else 25}%.')]
      qs += [essay('B24','Đề xuất cách tổ chức thảo luận nhóm về một ứng dụng hạt nhân. Nêu cơ chế, lợi ích và một giới hạn; dẫn ít nhất một nguồn học liệu có tác giả.',[
        ('Nêu đúng một ứng dụng và giải thích được cơ chế vật lí.',.4),('Nêu lợi ích cùng giới hạn phù hợp, tránh đồng nhất chẩn đoán với xạ trị.',.3),('Nêu nguồn, phân công vai trò và sản phẩm nhóm có thể kiểm tra.',.3)]),
        essay('B25','Một nhóm kết luận T = 30 s vì thời điểm 30 s xuất hiện trong bảng H(30 s) = 85 Bq, H₀ = 151 Bq. Hãy sửa lập luận, nêu một bước kiểm tra và cách xử lí số liệu chưa khớp mô hình.',[
        ('Tính đúng mức bán rã 75,5 Bq; 85 Bq chưa đạt mức này.',.4),('Đối chiếu H(60 s) = 55 Bq để kết luận 30 s < T < 60 s.',.3),('Ghi đơn vị, vẽ/khớp đường cong và giải thích sai số, không ép mọi điểm khớp tuyệt đối.',.3)])]
    else:
      A2,Z2=(131,53) if b else (235,92)
      qs += [num('B21',f'Hạt nhân có A = {A2}, Z = {Z2}. Tính số neutron.',A2-Z2,'neutron',f'N = A − Z = {A2-Z2}.'),
             num('B23',f'Sau {90 if b else 120} s, một mẫu còn 1/8 số hạt nhân mẹ ban đầu. Tính T.',30 if b else 40,'s','N/N₀ = 1/8 = 2^(−3), nên t = 3T.')]
      qs += [essay('B21','Trình bày kết luận từ thí nghiệm Rutherford và thiết kế một lượt quan sát 3D để kiểm tra nhận định “điện tích dương phân bố đều khắp nguyên tử”.',[
        ('Nêu đa số hạt đi gần thẳng, rất ít hạt lệch góc lớn.',.4),('Kết luận điện tích dương tập trung trong hạt nhân nhỏ; phần lớn thể tích là khoảng trống.',.3),('Nêu thao tác đổi khoảng cách tới tâm/góc nhìn và ghi kết quả; phân biệt mô hình quy ước với tần suất đo thật.',.3)]),
        essay('B23','Thiết kế cách xác định T từ bảng số hạt nhân mẹ theo thời gian. Nêu cách kiểm tra sai sót và một điều em sẽ điều chỉnh nếu câu trả lời ban đầu sai.',[
        ('Xác định N₀ và thời điểm N ≈ N₀/2, hoặc dùng T = t/log₂(N₀/N).',.4),('Ghi đúng đơn vị; đối chiếu thêm điểm tại 2T hoặc 3T và xét sai số.',.3),('Nêu một lỗi cụ thể như nhầm số hạt còn lại với đã phân rã và hành động sửa.',.3)])]
    for i,q in enumerate(qs):q['id']=f'{code}-{i+1}'
    papers.append(dict(id=code,title=f'Đề {"cuối kỳ" if final else "giữa kỳ"} · Mã {variant} · Vật lí hạt nhân',kind='final' if final else 'midterm',durationMinutes=60 if final else 45,scope=['B21','B22','B23','B24','B25'] if final else ['B21','B22','B23'],instructions='Đề mẫu tự luyện trong phạm vi chủ đề hạt nhân, không đại diện toàn bộ học kỳ Vật lí 12. Phần tự động tối đa 8 điểm; tự luận 2 điểm do giáo viên chấm theo rubric. Số liệu trong câu hỏi là dữ kiện đề, không phải thí nghiệm mới.',questions=qs))
(root/'src/data/nuclear-exams.json').write_text(json.dumps(papers,ensure_ascii=False,indent=2))
def esc(s):return html.escape(str(s))
style='<style>body{font:16px Arial,sans-serif;line-height:1.6;max-width:850px;margin:32px auto;padding:0 24px;color:#182d45}h1{font-size:26px}article{break-inside:avoid;margin:22px 0}table{border-collapse:collapse;width:100%}th,td{border:1px solid #adb8c5;padding:8px;text-align:left}@media print{body{margin:0;max-width:none}a{color:inherit}button{display:none}}</style>'
for paper in papers:
 for answers in [False,True]:
  body=[f'<h1>{esc(paper["title"])}{ " — Đáp án và hướng dẫn chấm" if answers else ""}</h1>',f'<p>Thời gian: {paper["durationMinutes"]} phút · Tổng: 10 điểm · Phạm vi: {", ".join(paper["scope"])}</p>',f'<p>{esc(paper["instructions"])}</p>']
  if not answers:body.append('<p>Họ tên ........................................ Lớp ....................</p>')
  for i,q in enumerate(paper['questions']):
   body.append(f'<article><b>Câu {i+1} ({q["points"]:g} điểm).</b> {esc(q["prompt"])}')
   if q['kind']=='choice':body.append('<ol type="A">'+''.join(f'<li>{esc(o)}</li>' for o in q['options'])+'</ol>')
   if q['kind']=='true_false':body.append('<ol type="a">'+''.join(f'<li>{esc(s["text"])}'+(f' — {"Đúng" if s["answer"] else "Sai"}. {esc(s["explanation"])}' if answers else ' □ Đúng □ Sai')+'</li>' for s in q['statements'])+'</ol>')
   if answers:
    if q['kind']=='choice':body.append(f'<p>Đáp án: {chr(65+q["answer"])}. {esc(q["explanation"])}</p>')
    if q['kind']=='numeric':body.append(f'<p>Đáp án: {q["answer"]} {esc(q["unit"])}; sai số chấm tự động ±{q["tolerance"]}. {esc(q["explanation"])}</p>')
    if q['kind']=='written':body.append('<ul>'+''.join(f'<li>{r["points"]:g} điểm: {esc(r["text"])}</li>' for r in q['rubric'])+'</ul>')
   elif q['kind'] in ['numeric','written']:body.append('<p>...................................................................................................</p>'*(4 if q['kind']=='written' else 1))
   body.append('</article>')
  if answers:
   body.append('<h2>Ma trận nội dung và mức độ</h2><table><tr><th>Bài</th><th>Mức độ</th><th>Câu</th><th>Điểm</th></tr>')
   for topic in paper['scope']:
    for level in ['Nhận biết','Thông hiểu','Vận dụng']:
     group=[(i+1,q) for i,q in enumerate(paper['questions']) if q['topic']==topic and q['level']==level]
     if group:body.append(f'<tr><td>{topic}</td><td>{level}</td><td>{", ".join(str(i) for i,q in group)}</td><td>{sum(q["points"] for i,q in group):g}</td></tr>')
   body.append('</table><p>Trắc nghiệm: 0,4 điểm/câu; đúng–sai: 0,25 điểm/mệnh đề; trả lời số: 0,5 điểm/câu; tự luận: 1 điểm/câu. Giáo viên rà soát trước khi dùng để đánh giá chính thức.</p>')
  body.append('<p>Nguồn kiến thức: SGK Vật lí 12 KNTT Chương IV; OpenStax College Physics 2e, mục 31.3–31.5. Câu hỏi do dự án biên soạn; chưa chuẩn hóa bằng dữ liệu học sinh.</p>')
  filename=paper['id']+('-answers' if answers else '')+'.html'
  (out/filename).write_text('<!doctype html><html lang="vi"><meta charset="utf-8"><title>'+esc(paper['title'])+'</title>'+style+'<body>'+''.join(body)+'</body></html>')
print('4 papers, 72 questions, 8 printable HTML files')
