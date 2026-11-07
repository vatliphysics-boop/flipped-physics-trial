from pathlib import Path
import json
root=Path('docs/references')
items=[
 {'id':'moet2020plan','type':'report','title':'Khung kế hoạch bài dạy','author':[{'literal':'Bộ Giáo dục và Đào tạo'}],'issued':{'date-parts':[[2020,12,18]]},'note':'Phụ lục IV kèm Công văn số 5512/BGDĐT-GDTrH ngày 18/12/2020; đối chiếu bản do người dùng cung cấp'},
 {'id':'moet2024assessment','type':'report','title':'Công văn số 7991/BGDĐT-GDTrH về thực hiện kiểm tra, đánh giá đối với cấp THCS, THPT','author':[{'literal':'Bộ Giáo dục và Đào tạo'}],'issued':{'date-parts':[[2024,12,17]]},'note':'Phụ lục ma trận và bản đặc tả; đối chiếu ba trang bản do người dùng cung cấp'},
 {'id':'huynh2026nuclear','type':'article-journal','title':'Tích hợp lịch sử vật lí nguyên tử và hạt nhân trong giảng dạy','author':[{'family':'Huỳnh','given':'Thị Yến Nhi'},{'family':'Nguyễn','given':'Thị Thu Hương'},{'family':'Lê','given':'Anh Đức'}],'issued':{'date-parts':[[2026]]},'container-title':'Tạp chí Khoa học Trường Đại học Sư phạm Thành phố Hồ Chí Minh','volume':'23','issue':'SI1','page':'537–547','DOI':'10.54607/hcmue.js.23.SI1.5418(2026)','URL':'https://journal.hcmue.edu.vn/index.php/hcmuejos/article/download/5418/3902/22620'}]
refs=json.loads((root/'BAI_BAO_CSL.json').read_text());known={r['id'] for r in refs};refs += [r for r in items if r['id'] not in known];(root/'BAI_BAO_CSL.json').write_text(json.dumps(refs,ensure_ascii=False,indent=2))
new_runs=[
 [['Bộ Giáo dục và Đào tạo. (2020). ',False],['Khung kế hoạch bài dạy',True],[' (Phụ lục IV kèm Công văn số 5512/BGDĐT-GDTrH ngày 18/12/2020).',False]],
 [['Bộ Giáo dục và Đào tạo. (2024). ',False],['Công văn số 7991/BGDĐT-GDTrH về thực hiện kiểm tra, đánh giá đối với cấp THCS, THPT',True],['.',False]],
 [['Huỳnh, T. Y. N., Nguyễn, T. T. H., & Lê, A. Đ. (2026). Tích hợp lịch sử vật lí nguyên tử và hạt nhân trong giảng dạy. ',False],['Tạp chí Khoa học Trường Đại học Sư phạm Thành phố Hồ Chí Minh, 23',True],['(SI1), 537–547. https://doi.org/10.54607/hcmue.js.23.SI1.5418(2026)',False]]]
runs=json.loads((root/'REPORT_REFERENCE_RUNS.json').read_text());texts={''.join(s[0] for s in r) for r in runs}
for r in new_runs:
 if ''.join(s[0] for s in r) not in texts:runs.append(r)
runs.sort(key=lambda r:''.join(s[0] for s in r));(root/'REPORT_REFERENCE_RUNS.json').write_text(json.dumps(runs,ensure_ascii=False,indent=2));(root/'TAI_LIEU_THAM_KHAO_APA.txt').write_text('\n\n'.join(''.join(s[0] for s in r) for r in runs)+'\n')
ris='''\nTY  - RPRT
AU  - Bộ Giáo dục và Đào tạo
PY  - 2020
TI  - Khung kế hoạch bài dạy
N1  - Phụ lục IV kèm Công văn số 5512/BGDĐT-GDTrH ngày 18/12/2020
ER  -

TY  - RPRT
AU  - Bộ Giáo dục và Đào tạo
PY  - 2024
TI  - Công văn số 7991/BGDĐT-GDTrH về thực hiện kiểm tra, đánh giá đối với cấp THCS, THPT
DA  - 2024/12/17
ER  -

TY  - JOUR
AU  - Huỳnh, Thị Yến Nhi
AU  - Nguyễn, Thị Thu Hương
AU  - Lê, Anh Đức
PY  - 2026
TI  - Tích hợp lịch sử vật lí nguyên tử và hạt nhân trong giảng dạy
JO  - Tạp chí Khoa học Trường Đại học Sư phạm Thành phố Hồ Chí Minh
VL  - 23
IS  - SI1
SP  - 537
EP  - 547
DO  - 10.54607/hcmue.js.23.SI1.5418(2026)
UR  - https://journal.hcmue.edu.vn/index.php/hcmuejos/article/download/5418/3902/22620
ER  -
'''
p=root/'BAI_BAO_MENDELEY.ris';s=p.read_text();p.write_text(s if '5418(2026)' in s else s+ris)
bib='''\n@techreport{moet2020plan,
 author = {{Bộ Giáo dục và Đào tạo}},
 title = {Khung kế hoạch bài dạy}, year = {2020},
 note = {Phụ lục IV kèm Công văn số 5512/BGDĐT-GDTrH ngày 18/12/2020}
}
@techreport{moet2024assessment,
 author = {{Bộ Giáo dục và Đào tạo}},
 title = {Công văn số 7991/BGDĐT-GDTrH về thực hiện kiểm tra, đánh giá đối với cấp THCS, THPT},
 year = {2024}, note = {Ngày 17/12/2024}
}
@article{huynh2026nuclear,
 author = {Huỳnh, Thị Yến Nhi and Nguyễn, Thị Thu Hương and Lê, Anh Đức},
 title = {Tích hợp lịch sử vật lí nguyên tử và hạt nhân trong giảng dạy},
 journal = {Tạp chí Khoa học Trường Đại học Sư phạm Thành phố Hồ Chí Minh},
 year = {2026}, volume = {23}, number = {SI1}, pages = {537--547},
 doi = {10.54607/hcmue.js.23.SI1.5418(2026)},
 url = {https://journal.hcmue.edu.vn/index.php/hcmuejos/article/download/5418/3902/22620}
}
'''
p=root/'BAI_BAO_MENDELEY.bib';s=p.read_text();p.write_text(s if '5418(2026)' in s else s+bib)
with (root/'KIEM_CHUNG_NGUON.md').open('a') as f:f.write('''\n## Đối chiếu bổ sung ngày 05/10/2026

- huynh2026nuclear: bản bài báo trực tiếp trên journal.hcmue.edu.vn, trang 537–547; trang đầu ghi tác giả theo thứ tự Huỳnh Thị Yến Nhi, Nguyễn Thị Thu Hương, Lê Anh Đức, tập 23, SI1, năm 2026 và DOI 10.54607/hcmue.js.23.SI1.5418(2026). Nghiên cứu tổng quan và thiết kế hoạt động có tích hợp lịch sử; không dùng làm bằng chứng tác động của website. Không lấy thứ tự tác giả trong tài liệu dẫn lại thay cho thứ tự trên bài gốc.
- moet2024assessment: đối chiếu cả ba trang bản công văn người dùng cung cấp, số 7991/BGDĐT-GDTrH, ngày 17/12/2024. Phụ lục được gọi là tham khảo; không gọi tỉ lệ điểm là quy định tuyệt đối cho mọi đề. Không xác nhận tình trạng pháp lí hiện hành chỉ từ bản đính kèm.
- moet2020plan: Phụ lục IV bản Word người dùng cung cấp ghi Công văn 5512/BGDĐT-GDTrH ngày 18/12/2020. Bốn loại hoạt động không đồng nhất với ba pha lớp học đảo ngược.
- Không dùng Google Scholar làm tác giả hoặc nhà xuất bản; chỉ dùng để phát hiện tài liệu rồi đối chiếu bài gốc. Nguồn chưa đối chiếu đủ không đưa thêm vào thư mục trích dẫn.
''')
print('References:',len(refs),'APA entries:',len(runs))
