from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from copy import deepcopy
from lxml import etree as E
from PIL import Image
from docx import Document
import hashlib, json, shutil

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs/templates/BAO_KHOA_HOC_DANG_KHOI.docx'
OUTPUT = ROOT / 'BAI_BAO_KHOA_HOC_CAP_NHAT_HOC_LIEU.docx'
EXPECTED = 'fd7df26a7999d65f72514e259668101f7eb96664f8cb3368cd9c07b9ddd346a6'
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == EXPECTED

NS = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'pic': 'http://schemas.openxmlformats.org/drawingml/2006/picture',
}


def q(key):
    prefix, name = key.split(':')
    return '{' + NS[prefix] + '}' + name


with ZipFile(SOURCE) as archive:
    parts = {name: archive.read(name) for name in archive.namelist()}

# Replace the 10 initial template screenshots (image1..image10) with freshly captured SGU screenshots
INITIAL_MEDIA_MAP = {
    'word/media/image1.png': '01-kho-hoc-lieu.png',
    'word/media/image2.png': '02-hinh-thuc-lop-hoc.png',
    'word/media/image3.png': '03-infographic.png',
    'word/media/image4.png': '04-phan-hach.png',
    'word/media/image5.png': '05-video-nhiem-vu.png',
    'word/media/image6.png': '08-ban-ra.png',
    'word/media/image7.png': '09-nang-luong-lien-ket.png',
    'word/media/image8.png': '07-ke-hoach-hai-vai.png',
    'word/media/image9.png': '06-ban-ghi.png',
    'word/media/image10.png': '10-de-kiem-tra.png',
}
for media_key, fig_file in INITIAL_MEDIA_MAP.items():
    fig_path = ROOT / 'docs/article-figures' / fig_file
    parts[media_key] = fig_path.read_bytes()

root = E.fromstring(parts['word/document.xml'])
body = root.find('w:body', NS)
ps = body.findall('w:p', NS)

# Citation wording is reused as content only; all page/style structures come from SOURCE.
reference_runs = json.loads((ROOT / 'docs/references/REPORT_REFERENCE_RUNS.json').read_text())
assert len(reference_runs) == 20


def remove_marks(node):
    for el in node.xpath('.//w:shd|.//w:highlight', namespaces=NS):
        el.getparent().remove(el)
    for el in node.xpath('.//w:color', namespaces=NS):
        el.set(q('w:val'), '000000')


def fill(p, text, segments=None):
    runs = p.findall('w:r', NS)
    rp = deepcopy(runs[0].find('w:rPr', NS)) if runs else None
    # Editable plain prose slots preserve paragraph/run properties, bookmarks and unrelated nodes.
    for el in list(p):
        if E.QName(el).localname in ['r', 'hyperlink']:
            p.remove(el)
    for text, italic in segments or [(text, None)]:
        r = E.SubElement(p, q('w:r'))
        if rp is not None:
            r.append(deepcopy(rp))
        if italic is not None:
            rpr = r.find('w:rPr', NS)
            if rpr is None:
                rpr = E.SubElement(r, q('w:rPr'))
            for el in rpr.findall('w:i', NS) + rpr.findall('w:iCs', NS):
                rpr.remove(el)
            if italic:
                E.SubElement(rpr, q('w:i'))
        t = E.SubElement(r, q('w:t'))
        t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
        t.text = text
    remove_marks(p)
    return p


def clone_p(index, text):
    return fill(deepcopy(ps[index]), text)


def keep(p):
    pr = p.find('w:pPr', NS)
    if pr is None:
        pr = E.Element(q('w:pPr'))
        p.insert(0, pr)
    if pr.find('w:keepNext', NS) is None:
        E.SubElement(pr, q('w:keepNext'))


# Four main sections and all author/meta slots remain in the source positions.
TITLE = 'Xây dựng và sử dụng học liệu số có hỗ trợ trí tuệ nhân tạo trong tổ chức dạy học theo mô hình lớp học đảo ngược nhằm phát triển năng lực tự học của học sinh qua chủ đề “Vật lí hạt nhân” môn Vật lí lớp 12 ở trường THPT'
fill(ps[0], TITLE.upper())
fill(ps[1], 'Developing and using AI-supported digital learning resources in flipped classroom teaching to develop students’ self-study competence through the Nuclear Physics topic in Grade 12 physics at upper secondary schools')

fill(ps[3], 'Chương trình giáo dục phổ thông môn Vật lí đặt yêu cầu phát triển năng lực vật lí và năng lực tự chủ, tự học (Bộ Giáo dục và Đào tạo, 2018). Chủ đề Vật lí hạt nhân đòi hỏi liên hệ kí hiệu, phương trình, đồ thị và ứng dụng của những quá trình vi mô không thể quan sát trực tiếp tại phòng thí nghiệm phổ thông. Huỳnh et al. (2026) phân tích khả năng tích hợp lịch sử vật lí nguyên tử và hạt nhân vào hoạt động dạy học; nguồn này gợi ý lựa chọn tình huống và biểu diễn trực quan, chưa chứng minh hiệu quả của website. Nghiên cứu giới hạn ở Chương 4, các bài B21–B25 của sách giáo khoa Vật lí 12, bộ Kết nối tri thức với cuộc sống (Vũ et al., 2024), với chuỗi nhiệm vụ trước, trong và sau giờ học.')
fill(ps[9], 'Tư liệu gồm chương trình môn Vật lí 2018, sách giáo khoa và sách bài tập được cung cấp, yêu cầu thiết kế học liệu, nghiên cứu về lớp học đảo ngược và nguồn kiến thức vật lí chuẩn (Urone & Hinrichs, 2022). Phụ lục IV Công văn 5512 được dùng để xác định cấu trúc kế hoạch bài dạy; phụ lục Công văn 7991 được dùng để tham khảo ma trận và bản đặc tả kiểm tra đánh giá (Bộ Giáo dục và Đào tạo, 2020, 2024). Bản SGK ghi “bản mẫu tháng 1/2024”, cần đối chiếu sách dùng tại lớp khi triển khai. Đơn vị phân tích là mục học liệu, hoạt động tương tác, video thuyết minh, trường sản phẩm và chức năng phần mềm. Báo cáo giới hạn ở giai đoạn thiết kế và kiểm tra nội bộ, chưa có mẫu thực nghiệm học sinh.')
fill(ps[14], 'Mỗi hoạt động có mục tiêu, nội dung, sản phẩm và cách tổ chức, phân rõ việc của giáo viên và học sinh. Bốn loại hoạt động gồm mở đầu, hình thành kiến thức, luyện tập và vận dụng theo Phụ lục IV Công văn 5512; đây là loại hoạt động nhận thức trên lớp, không đồng nhất với ba pha của lớp học đảo ngược (Bộ Giáo dục và Đào tạo, 2020). Ba pha được dùng để sắp xếp thời điểm thực hiện: chuẩn bị và dự đoán trước giờ học, trao đổi và thao tác kiểm chứng trong giờ học, chỉnh sửa giải thích và tự kiểm tra sau giờ học. Mỗi hoạt động ghi rõ bốn bước giao nhiệm vụ, thực hiện, báo cáo/thảo luận và kết luận. Học liệu trực quan và video 3D đều đi kèm yêu cầu dự đoán, quan sát và giải thích; riêng thao tác mở video hoặc xoay góc nhìn 3D chưa được xem là sản phẩm học tập.')
fill(ps[15], 'Kiến tạo học liệu: hệ thống mô phỏng 3D, chuỗi năm bài học tương tác bám sát mục lục SGK (B21–B25), bộ năm video hoạt hình 3D thuyết minh tiếng Việt, infographic tương tác, bản ghi quan sát, đề tự luyện, ngân hàng 213 câu hỏi từ ba sách và bàn soạn kế hoạch bài dạy được triển khai đồng bộ trên nền tảng web. Trí tuệ nhân tạo (AI) hỗ trợ dự thảo nội dung, chọn câu hỏi gợi mở và cung cấp khung hỏi bài cục bộ cho học sinh cũng như công cụ xử lí học liệu cho giáo viên. Mỗi kết quả do AI sinh ra được kiểm soát như bản nháp cần rà soát theo sáu tiêu chí tri thức vật lí, không tự động công bố hoặc quyết định điểm số chính thức (Miao & Holmes, 2023).')
fill(ps[18], 'Kiểm tra nội bộ gồm đối chiếu nguồn sách giáo khoa, tính lại các trường hợp định lượng và chạy 102 ca kiểm tra tự động (8 bộ kiểm thử Vitest) cùng 5 ca kiểm tra kịch bản video thuyết minh về dữ liệu câu hỏi, định dạng đúng–sai bốn ý, công thức Equation trong Word, chấm điểm phần khách quan, phiếu học tập ba phần, thời lượng kế hoạch và mô hình vật lí. Thao tác trình duyệt được kiểm tra tự động bằng Playwright trên Google Chrome ở chiều rộng màn hình 1440 px, 1280 px, 900 px và 390 px. Năm tệp video MP4 thuyết minh tiếng Việt được xác minh luồng hình/tiếng bằng ffprobe và kiểm tra phát thực tế trên trình duyệt (readyState = 4). Ma trận CSV, DOCX và XLSX được thử đọc; tệp đề Word được tải từ giao diện và kết xuất thành trang để kiểm tra bố cục. Các lượt chụp giao diện từ ngày 04/10 đến 10/11/2026 là bằng chứng kiểm tra kĩ thuật nội bộ, không phải dữ liệu bài làm của học sinh.')

fill(ps[22], 'Kho học liệu Chương 4 tập hợp 89 mục được phân loại theo bài và định dạng: 17 mô phỏng 3D, 17 mục ảnh/sơ đồ, năm minh họa động, 11 mục video (gồm năm video hoạt hình 3D thuyết minh tiếng Việt B21–B25, năm video nguồn quốc tế và một video buồng sương thực nghiệm), 18 tài liệu/phiếu học tập, 17 câu hỏi/hoạt động nhóm và bốn đề tự luyện. Trong số ảnh có 11 hình câu hỏi trích từ sách để dùng trong đề và phiếu. Đây là số mục trong danh mục quản lí học liệu, có nguồn tham khảo hoặc mục được liên kết lại giữa các pha, không phải 89 đơn vị nội dung độc lập hoàn toàn. Thanh điều hướng mang nhận diện Trường Đại học Sài Gòn cho phép lọc nhanh theo từng bài B21–B25, loại học liệu và giai đoạn sử dụng (Hình 1).')
fill(ps[27], 'Bishop và Verleger (2013) mô tả lớp học đảo ngược qua hoạt động chuẩn bị có hướng dẫn ngoài lớp và giải quyết vấn đề tích cực theo nhóm trong lớp. Bản mẫu cụ thể hóa bốn lựa chọn tổ chức để giáo viên điều chỉnh: học trước rồi luyện tập; minh họa rồi thực hành; thảo luận theo vai; làm việc nhóm tạo sản phẩm (Hình 2). Đây là bốn kịch bản thiết kế giúp giáo viên phối hợp nhiệm vụ và phân bổ thời lượng giữa ở nhà với trên lớp, không phải phân loại cứng hoặc bốn mô hình đã được kiểm chứng thực nghiệm trong nghiên cứu này.')

# Update Section 3.2.3 (ps[48], ps[49], ps[51], ps[53]) to cover both the new 3D animated Vietnamese narrated videos and source videos
fill(ps[48], '3.2.3. Video hoạt hình 3D thuyết minh tiếng Việt và video nguồn kèm nhiệm vụ quan sát')
fill(ps[49], 'Mỗi bài từ B21 đến B25 được xây dựng một video hoạt hình 3D thuyết minh tiếng Việt độ phân giải Full HD (1920×1080, 30 khung hình/giây, mã hóa H.264/AAC 48 kHz) kết hợp giọng đọc tổng hợp tiếng Việt tự nhiên (VieNeu-TTS v3 Turbo) và phụ đề chuẩn WebVTT (.vi.vtt), đặt cạnh các video nguồn quốc tế trên YouTube. Trước khi nhấn phát video, học sinh phải đọc nhiệm vụ quan sát và ghi dự đoán ban đầu. Ở B22, trình phát tích hợp trực tiếp video bài giảng 3D phân hạch hạt nhân và liên kết đối chiếu video của FuseSchool – Global Education (n.d.) với yêu cầu nhận diện neutron tới, hạt nhân hợp phần U-236*, hai mảnh phân hạch và số neutron thứ cấp sinh ra (Hình 5).')
fill(ps[51], '', [('Hình 5. ', True), ('Trình phát video bài giảng 3D thuyết minh tiếng Việt bài B22 kèm phụ đề và nhiệm vụ quan sát trước khi xem.', False)])
fill(ps[53], 'Việc cung cấp song song video hoạt hình 3D thuyết minh tiếng Việt và video nguồn tiếng Anh giúp khắc phục rào cản ngôn ngữ khi học sinh tự học ở nhà, đồng thời giữ được nguồn tham khảo học thuật quốc tế để đối chiếu. Cả năm tệp video 3D nội bộ (b21.mp4–b25.mp4, tổng thời lượng 1.245,92 giây, dung lượng 76,5 MB) đều được lưu trữ trực tiếp trong kho học liệu của hệ thống kèm phụ đề tiếng Việt nên phát ổn định không phụ thuộc kết nối YouTube; đối với các video nhúng từ YouTube, giao diện luôn hiển thị tên kênh và liên kết mở nguồn trực tiếp khi mạng trường học hạn chế truy cập ngoài.')

# Update Section 3.3 heading & prose (ps[87], ps[88], ps[89])
fill(ps[87], 'Bảng 2. Bằng chứng kiểm tra nội bộ sản phẩm đến ngày 10/11/2026')
fill(ps[88], 'Các lỗi phát hiện và đã khắc phục qua chu trình kiểm tra nội bộ gồm: (1) trộn lẫn khối lượng nguyên tử trung hòa với khối lượng hạt nhân trần trong phép tính độ hụt khối ở B25; (2) diễn đạt điều kiện hệ số nhân neutron k > 1 dễ gây hiểu nhầm là lò phản ứng phát nổ như vũ khí hạt nhân ở B24; (3) chưa phân biệt rõ cơ chế tạo ảnh của PET (cặp photon gamma 511 keV từ hủy positron–electron) với SPECT ở B24; (4) thiếu cơ chế chuyển đổi nhanh giữa năm bài học tương tác B21–B25 và đồng bộ đường dẫn video 3D giữa hai không gian phòng học hạt nhân; (5) tràn ngang phương án trả lời ở chiều rộng 390 px. Việc ghi nhận lỗi và căn cứ chỉnh sửa minh họa vai trò của bước kiểm tra nội bộ trong nghiên cứu thiết kế; tuy nhiên, 102/102 ca kiểm tra phần mềm đạt chỉ xác nhận các kịch bản kĩ thuật đã lập trình.')
fill(ps[89], 'Kết quả kiểm tra phân biệt rõ những hạng mục đã hoàn tất về mặt kĩ thuật với những nội dung cần tiếp tục hoàn thiện trước khi triển khai thực nghiệm sư phạm. Thao tác lưu cục bộ trên trình duyệt phục vụ tự luyện công khai khác về bản chất với luồng giao bài, thu bài và theo dõi tiến độ qua tài khoản lớp học. Do đó, Bảng 2 đóng vai trò là hồ sơ rà soát trước sử dụng và là căn cứ để tổ chức xin ý kiến chuyên gia độc lập ở giai đoạn tiếp theo.')

# Update Section 4 (Conclusions & Discussion: ps[91], ps[92], ps[93], ps[94], ps[95])
fill(ps[91], 'Nghiên cứu đã cụ thể hóa quy trình phân tích, thiết kế, kiến tạo và kiểm tra nội bộ hệ thống học liệu số có hỗ trợ AI cho chủ đề Vật lí hạt nhân (B21–B25) theo mô hình lớp học đảo ngược. Sản phẩm hoàn thiện gồm danh mục 89 mục học liệu, 17 mô phỏng 3D tương tác, chuỗi năm bài học tương tác chuyên sâu cấu trúc bám sát mục lục SGK Vật lí 12, bộ năm video hoạt hình 3D thuyết minh tiếng Việt kèm phụ đề, năm infographic tương tác, bản ghi quan sát bốn trường và bộ công cụ biên soạn dành cho giáo viên. Ngân hàng câu hỏi công bố 213 câu đã đối chiếu từ ba bộ sách; công cụ ma trận cho phép phối hợp bốn định dạng câu hỏi và xuất tệp Word chỉnh sửa được; phiếu học tập tích hợp hướng dẫn ba pha và rubrics bốn tiêu chí; bàn soạn kế hoạch bài dạy phân tách rõ hoạt động của giáo viên và học sinh theo Công văn 5512.')
fill(ps[92], 'Đóng góp về mặt thiết kế sư phạm của sản phẩm là thiết lập cơ chế gắn kết chặt chẽ giữa thao tác quan sát trực quan (mô phỏng 3D, video hoạt hình 3D, đồ thị thực nghiệm SGK) với nhiệm vụ dự đoán, bằng chứng định lượng và sản phẩm phản tư của học sinh ở cả ba giai đoạn trước, trong và sau giờ học. Chẳng hạn, hoạt động tán xạ Rutherford ở B21 yêu cầu đối chứng hai tham số va chạm b và động năng E; mô phỏng phân hạch ở B22 buộc học sinh kiểm chứng hai định luật bảo toàn số nucleon và điện tích; hoạt động phóng xạ ở B23 và B25 kết nối mô hình hàm mũ với số liệu thực nghiệm trong Bảng 23.1 và Bảng 25.1 của SGK. Những thiết kế này cụ thể hóa khung hỗ trợ tự điều chỉnh học tập của Zimmerman (2002) và Liu et al. (2024), nhưng tự thân giao diện phần mềm chưa đủ để kết luận học sinh đã tăng hứng thú, kết quả học tập hay năng lực tự học nếu chưa có dữ liệu thực nghiệm trên lớp.')
fill(ps[93], 'Trí tuệ nhân tạo hỗ trợ cả ở khâu kiến tạo học liệu (biên tập mã nguồn, tổng hợp giọng đọc thuyết minh tiếng Việt cho video 3D) và trong giao diện sử dụng (khung hỏi đáp cục bộ dùng mô hình Qwen3 4B Instruct qua Ollama cho học sinh; công cụ tóm tắt học liệu và gợi ý nhiệm vụ khắc phục khó khăn cho giáo viên). Để kiểm soát rủi ro sai lệch khái niệm và ảo giác tri thức trong Vật lí hạt nhân, hệ thống áp dụng nguyên tắc chỉ trích xuất từ kho đoạn nguồn SGK đã biên tập kèm quy trình sáu tiêu chí rà soát tri thức vật lí (K1–K6) trước khi giáo viên sử dụng. Các chức năng AI hiện tại dừng ở mức tạo bản nháp hỗ trợ và gợi mở Socratic, chưa tự động theo dõi dài hạn hay cá nhân hóa lộ trình của từng học sinh.')
fill(ps[94], 'Nghiên cứu có bốn giới hạn cần nêu rõ: (1) chưa tiến hành thực nghiệm sư phạm trên mẫu học sinh THPT và chưa có biên bản thẩm định độc lập từ hội đồng chuyên gia ngoài nhóm nghiên cứu; (2) 102 ca kiểm tra Vitest, 5 ca kiểm tra kịch bản video và các lượt chạy thử trên trình duyệt chỉ xác nhận tính đúng đắn kĩ thuật của các trường hợp đã xét; (3) trong 232 mục bài tập gốc trích xuất từ ba sách, có 24 mục thiếu hình quét hoặc dữ kiện và sáu ý đúng–sai lẻ được giữ ngoài tập chọn đề tự động; (4) nhãn mức độ nhận thức Bloom và rubrics bốn mức hiện là tiêu chí phân loại nội bộ, chưa được kiểm định độ tin cậy liên người chấm (inter-rater reliability) và độ giá trị đo lường.')
fill(ps[95], 'Hướng phát triển tiếp theo của đề tài gồm ba bước: (1) tổ chức thẩm định độc lập nội dung vật lí, kịch bản video 3D, ngân hàng câu hỏi và rubrics bởi các giảng viên lí luận dạy học Vật lí và giáo viên THPT có kinh nghiệm; (2) kiểm thử toàn diện luồng giao bài, nộp sản phẩm và phản hồi hai chiều bằng tài khoản lớp học thực tế trên cơ sở dữ liệu đám mây; (3) triển khai thực nghiệm sư phạm tại trường THPT để thu thập dữ liệu định lượng và định tính về sự phát triển năng lực tự học của học sinh qua chủ đề Vật lí hạt nhân.')

fill(ps[99], 'Codex (OpenAI) và Claude/Gemini được sử dụng để hỗ trợ lập trình giao diện mô phỏng 3D, kiểm thử tự động và định dạng bản thảo; mô hình VieNeu-TTS v3 Turbo được sử dụng để tổng hợp giọng đọc thuyết minh tiếng Việt cho năm video bài giảng 3D. Trong bản mẫu web, Qwen3 4B Instruct chạy cục bộ qua Ollama để tạo bản nháp giải thích, gợi ý câu hỏi dẫn dắt và tóm tắt học liệu. Các tác giả chịu trách nhiệm hoàn toàn về việc kiểm tra, đối chiếu và chỉnh sửa toàn bộ nội dung khoa học, công thức vật lí, số liệu và trích dẫn trước khi gửi công bố.')
fill(ps[101], 'Mô hình ngôn ngữ cục bộ trên web: qwen3:4b-instruct-2507-q4_K_M chạy qua Ollama 0.35.1; mô hình tổng hợp giọng đọc video học liệu: VieNeu-TTS v3 Turbo (giọng Kim Thanh, 48 kHz). Môi trường kiểm thử tự động: Node.js, Vitest (102 tests), Playwright (Google Chrome headless) và FFmpeg/ffprobe.')
fill(ps[104], 'Các tác giả tuyên bố không có xung đột lợi ích nào liên quan đến việc công bố bài báo này.')
fill(ps[106], 'Nghiên cứu này thuộc phạm vi đề tài nghiên cứu khoa học sinh viên Khoa Sư phạm Khoa học Tự nhiên, Trường Đại học Sài Gòn.')
fill(ps[107], '')
for p in ps[90:110]:
    remove_marks(p)

for t in root.xpath('//w:body//w:t', namespaces=NS):
    if t.text:
        t.text = t.text.replace('Vũ Văn Hùng và cộng sự', 'Vũ et al.').replace('Mai Hoàng Phương và cộng sự', 'Mai et al.')

# Bilingual abstract stays inside the existing merged table cells.
abstracts = {
    'Context:': 'Context: Nuclear physics requires visual and quantitative representations of microscopic processes that cannot be observed directly in high-school laboratories. This study presents the theory-informed analysis, design, construction and internal verification of AI-supported digital learning resources for Grade 12 Nuclear Physics (lessons B21–B25) in a flipped classroom model.',
    'Result:': 'Result: The platform integrates 89 cataloged resource entries, 17 interactive 3D simulations, five textbook-structured interactive lessons (B21–B25), five Full-HD 3D animated Vietnamese-narrated teaching videos with WebVTT captions, five interactive infographics and four practice exams. A unified bank derived from three textbooks publishes 213 verified questions across four formats; three-phase worksheets include an analytic rubric; the 5512 lesson-plan studio separates teacher and student roles; local AI assistants operate under a six-criteria physics verification protocol. Internal verification confirmed physical conservation laws, decay curves, neutral-atom mass conventions and 102/102 passing automated software tests.',
    'Discussion:': 'Discussion: Reported results reflect completed design artifacts and internal technical/content verification prior to classroom deployment. AI-generated drafts require teacher review under the six-criteria protocol, and multi-user classroom account workflows require field stress-testing. Independent expert validation and empirical classroom research are required before drawing conclusions about instructional effectiveness or gains in students’ self-study competence.',
    'Bối cảnh:': 'Bối cảnh: Chủ đề Vật lí hạt nhân đòi hỏi biểu diễn trực quan và định lượng các quá trình vi mô không thể quan sát trực tiếp tại phòng thí nghiệm phổ thông. Nghiên cứu trình bày quy trình phân tích, thiết kế, kiến tạo và kiểm tra nội bộ hệ thống học liệu số có hỗ trợ AI cho các bài B21–B25 lớp 12 theo mô hình lớp học đảo ngược.',
    'Kết quả:': 'Kết quả: Hệ thống tích hợp 89 mục học liệu, 17 mô phỏng 3D tương tác, chuỗi năm bài học tương tác bám sát SGK (B21–B25), năm video hoạt hình 3D thuyết minh tiếng Việt chuẩn Full HD kèm phụ đề, năm infographic tương tác và bốn đề tự luyện. Ngân hàng từ ba bộ sách công bố 213 câu hỏi thuộc bốn định dạng; phiếu học tập ba pha tích hợp rubrics bốn tiêu chí; bàn soạn kế hoạch bài dạy theo Công văn 5512 phân rõ hai vai giáo viên – học sinh; công cụ xuất đề, đáp án, đặc tả ra tệp Word chỉnh sửa được; trợ lí AI cục bộ vận hành kèm quy trình sáu tiêu chí rà soát tri thức vật lí. Kiểm tra nội bộ xác nhận các định luật bảo toàn, quy luật bán rã, quy ước khối lượng nguyên tử trung hòa và vượt qua 102/102 ca kiểm thử tự động.',
    'Bàn luận:': 'Bàn luận: Kết quả phản ánh sản phẩm thiết kế và bằng chứng kiểm tra nội bộ trước khi đưa vào lớp học. Các bản nháp do AI tạo vẫn cần giáo viên rà soát theo sáu tiêu chí; luồng giao và nộp bài qua tài khoản lớp học cần kiểm thử thực địa. Cần tổ chức thẩm định chuyên gia độc lập và thực nghiệm sư phạm trước khi kết luận về hiệu quả dạy học hay mức độ phát triển năng lực tự học của học sinh.',
}
for p in root.xpath('./w:body/w:tbl[1]//w:p', namespaces=NS):
    txt = ''.join(p.xpath('.//w:t/text()', namespaces=NS))
    for prefix, text in abstracts.items():
        if txt.startswith(prefix):
            label, rest = text.split(':', 1)
            fill(p, '', [(label + ':', False), (rest, False)])
            first = p.find('w:r', NS)
            pr = first.find('w:rPr', NS)
            if pr is None:
                pr = E.SubElement(first, q('w:rPr'))
            E.SubElement(pr, q('w:b'))
            for r in p.findall('w:r', NS)[1:]:
                rp = r.find('w:rPr', NS)
                if rp is not None:
                    for el in rp.findall('w:b', NS) + rp.findall('w:bCs', NS):
                        rp.remove(el)

# Update Table 2 (./w:body/w:tbl[3]) with complete, accurate verification evidence as of 10/11/2026
tbl2_updates = {
    1: (
        'Kiến thức và tính toán',
        'Bảo toàn số khối A và điện tích Z; tán xạ Rutherford theo b và E; quy luật bán rã và Bảng 23.1, 25.1 SGK; thống nhất khối lượng nguyên tử trung hòa cho năm hạt nhân; quy trình sáu tiêu chí rà soát AI (K1–K6).',
        'Đối chiếu các ví dụ và bảng số liệu SGK đã xét; chưa có biên bản thẩm định toàn bộ bởi hội đồng chuyên gia độc lập.',
    ),
    2: (
        'Phần mềm và kiểm thử tự động',
        '102/102 ca kiểm tra Vitest (8 bộ test) và 5/5 ca kiểm tra kịch bản video đạt; build đạt; kiểm thử Playwright trên Chrome không phát sinh lỗi console hay pageerror.',
        'Chưa thay thế kiểm thử tải đồng thời cả lớp và nghiên cứu thực nghiệm tại trường THPT.',
    ),
    3: (
        'Giao diện và khả năng đáp ứng',
        'Chụp 30 hình giao diện SGU và cảnh video 3D; kiểm tra trình duyệt ở chiều rộng 1440 px, 1280 px, 900 px và 390 px không tràn ngang.',
        'Không suy rộng cho mọi thiết bị di động cũ hoặc phần mềm đọc màn hình chuyên biệt.',
    ),
    4: (
        'Video 3D thuyết minh và lưu cục bộ',
        'Năm video hoạt hình 3D thuyết minh tiếng Việt (b21.mp4–b25.mp4, 1920×1080, 30 fps, phụ đề .vi.vtt, tổng thời lượng 1.245,92 s) đều phát đạt readyState = 4; năm video nguồn YouTube và lưu cục bộ đã kiểm tra.',
        'Giọng đọc tổng hợp TTS cần giáo viên nghe duyệt theo tốc độ lớp; chưa thử tải tệp trên máy chủ triển khai khác.',
    ),
    5: (
        'Giao và nộp nhiệm vụ qua lớp',
        'Đã bổ sung migration cơ sở dữ liệu và kiểm tra phân quyền RLS trên môi trường thử; phiên trước các bảng lộ trình, tiến độ, kế hoạch từng trả mã PGRST205 khi chưa áp dụng schema.',
        'Cần kiểm thử đầy đủ luồng giao bài, nộp bài và chấm điểm hai vai bằng tài khoản thật của giáo viên và học sinh.',
    ),
    6: (
        'Đánh giá sư phạm và tự học',
        'Có chuỗi năm bài tương tác B21–B25 bám sát SGK, nhiệm vụ ba pha, phiếu học tập kèm rubrics bốn tiêu chí và cơ chế kiểm chứng chuẩn bị trước giờ học.',
        'Chưa có ý kiến chuyên gia độc lập, dữ liệu học sinh thực nghiệm hoặc kết quả định lượng về mức tăng năng lực tự học.',
    ),
}
tbl2 = root.xpath('./w:body/w:tbl[3]', namespaces=NS)[0]
tbl2_rows = tbl2.findall('w:tr', NS)
for row_idx, cols in tbl2_updates.items():
    tcs = tbl2_rows[row_idx].findall('w:tc', NS)
    for col_idx, col_text in enumerate(cols):
        p_cell = tcs[col_idx].find('w:p', NS)
        if p_cell is not None:
            fill(p_cell, col_text)

rels = E.fromstring(parts['word/_rels/document.xml.rels'])
RELNS = 'http://schemas.openxmlformats.org/package/2006/relationships'
next_id = max([int(x.get('id')) for x in root.xpath('//wp:docPr', namespaces=NS)] + [10]) + 1
added = {}


def figure(file, number, caption):
    global next_id
    path = ROOT / 'docs/article-figures' / file
    added['word/media/' + file] = path.read_bytes()
    rid = 'rIdAI' + str(number)
    E.SubElement(rels, '{' + RELNS + '}Relationship', Id=rid, Type=NS['r'] + '/image', Target='media/' + file)
    p = deepcopy(ps[23])
    keep(p)
    w, h = Image.open(path).size
    cx = 4860000
    cy = round(cx * h / w)
    for blip in p.xpath('.//a:blip', namespaces=NS):
        blip.set(q('r:embed'), rid)
    for node in p.xpath('.//wp:extent|.//a:xfrm/a:ext', namespaces=NS):
        node.set('cx', str(cx))
        node.set('cy', str(cy))
    for node in p.xpath('.//wp:docPr', namespaces=NS):
        node.set('id', str(next_id))
        node.set('name', 'Hình ' + str(number))
        node.set('descr', caption)
    for node in p.xpath('.//pic:cNvPr', namespaces=NS):
        node.set('id', str(next_id))
        node.set('name', file)
    next_id += 1
    return [p, fill(deepcopy(ps[24]), '', [(f'Hình {number}. ', True), (caption, False)])]


insert = []


def para(text):
    insert.append(clone_p(3, text))


def subheading(text):
    insert.append(clone_p(34, text))


def shot(file, number, caption):
    insert.extend(figure(file, number, caption))


subheading('3.2.9. Khung AI hỗ trợ học sinh trong trang học tập')
para('Trang trợ lí AI học tập và nút hỏi bài nhanh cho phép học sinh chọn đúng bài đang học (B21–B25), đặt câu hỏi giải thích khái niệm hoặc nhận gợi ý từng bước (Hình 11). Mô hình Qwen3 4B Instruct chạy cục bộ qua Ollama trên máy chủ của hệ thống (Ollama, n.d.). Ở chế độ gợi ý Socratic, hệ thống xác định mã đoạn lí thuyết chuẩn từ SGK rồi đặt câu hỏi dẫn dắt để học sinh tự suy luận thay vì đưa ngay lời giải cuối cùng. Ở chế độ giải thích, hệ thống tạo bản nháp dựa trên đoạn kiến thức công khai của bài học, không truy cập điểm số hay đáp án đề kiểm tra của lớp. Các liên kết ngoài như Gemini, ChatGPT hoặc NotebookLM chỉ mở dịch vụ bên thứ ba bằng tài khoản riêng của người dùng, không phải mô hình chạy ngầm trong khung chat nội bộ.')
shot('11-ai-cuc-bo.png', 11, 'Giao diện Trợ lí AI Vật lí 12 hỗ trợ học sinh tra cứu công thức, chọn câu hỏi gợi ý theo bài B21–B25 và kiểm tra lại lời giải.')
para('Trong các lượt kiểm tra nội bộ, câu hỏi về hai chu kì bán rã ở chế độ gợi ý trả về đúng hệ thức N(t) = N₀·2⁻ᵗ/ᵀ kèm câu hỏi dẫn dắt học sinh tính tỉ số N(t)/N₀. Kết quả này xác nhận luồng kết nối và khả năng neo vào đoạn nguồn của một lượt hỏi đáp, nhưng chưa xác lập độ chính xác tuyệt đối cho mọi câu hỏi tự do. Dịch vụ AI cục bộ hiện giới hạn xử lí tuần tự từng yêu cầu trên máy thử nghiệm 8 GB RAM; khi không có kết nối tới dịch vụ Ollama cục bộ, hệ thống tự động chuyển sang chế độ phản hồi dựa trên kho gợi ý biên soạn sẵn để không làm gián đoạn việc tự học.')

subheading('3.2.10. Ngân hàng câu hỏi từ ba sách và tạo đề theo ma trận')
para('Roy et al. (2024) khảo sát việc sử dụng ChatGPT trong khâu chuẩn bị bài của giáo viên khoa học phổ thông ở Anh; bối cảnh đó gợi mở tiềm năng giảm tải biên soạn nhưng không tự động xác nhận hiệu quả của website nghiên cứu. Miao và Cukurova (2024) nhấn mạnh năng lực của giáo viên trong việc lựa chọn, kiểm chứng và điều chỉnh công cụ AI theo mục tiêu sư phạm. Từ định hướng đó, không gian hỗ trợ giáo viên trên hệ thống tích hợp ba phân hệ: ngân hàng đề theo ma trận, phiếu học tập ba pha và bàn chuẩn bị giờ học. Ngân hàng đề thống nhất gồm năm thẻ chức năng: trắc nghiệm nhiều lựa chọn, trắc nghiệm đúng–sai, trả lời ngắn, tự luận và tải ma trận/xuất tệp Word (Hình 12).')
shot('12-ngan-hang-sach.jpg', 12, 'Ngân hàng đề Chương 4 hiển thị câu hỏi dạng chữ kết hợp công thức LaTeX, nhãn bài học – mức độ Bloom và hình gốc trích từ SGK.')
para('Phạm vi biên tập ban đầu thu thập 232 mục bài tập và câu hỏi hoạt động của Chương 4 từ ba bộ sách được cung cấp. Qua rà soát đối chiếu văn bản, công thức và hướng dẫn giải, 208 mục gốc đạt yêu cầu rõ ràng về dữ kiện; 24 mục thiếu hình quét gốc hoặc có yêu cầu phụ thuộc ngữ cảnh trang sách được tách riêng khỏi tập chọn đề tự động. Sau khi chuẩn hóa và ghép các ý đúng–sai cùng bài/chủ đề thành câu hoàn chỉnh, ngân hàng chính thức công bố 213 câu hỏi: 73 câu trắc nghiệm bốn lựa chọn, 12 câu đúng–sai bốn ý, 19 câu trả lời ngắn và 109 câu tự luận. Sáu ý đúng–sai lẻ còn dư được lưu trữ riêng để giáo viên biên tập thủ công, tuyệt đối không dùng AI tự bịa thêm dữ kiện để ghép đủ câu.')
para('Mỗi câu đúng–sai tuân thủ đúng cấu trúc bốn mệnh đề a, b, c, d theo định dạng kiểm tra đánh giá mới, lưu trữ khóa đáp án Đúng/Sai và giải thích riêng cho từng mệnh đề (Hình 13). Nhãn nhận thức Bloom được gắn theo thao tác tư duy học sinh cần thực hiện, tham chiếu khung phân loại sửa đổi của Krathwohl (2002), đồng thời ánh xạ sang ba mức Biết – Hiểu – Vận dụng trong ma trận đặc tả. Hình minh họa đi kèm câu hỏi được cắt nguyên bản từ sách giáo khoa để bảo toàn kí hiệu gốc; hiện có 25 hình gốc gắn với 33 câu hỏi đã công bố.')
shot('18-dung-sai-bon-y.jpg', 13, 'Cấu trúc câu hỏi đúng–sai gồm bốn mệnh đề a–d kèm công thức chuẩn và nguồn truy xuất trong dữ liệu biên tập.')
para('Để tạo đề kiểm tra, giáo viên có thể nhập tệp CSV, JSON hoặc tải lên bảng ma trận DOCX/XLSX gồm năm cột bắt buộc: bài/chủ đề, loại câu, mức độ nhận thức, số câu và điểm mỗi câu. Các trường thông tin về chương, đơn vị kiến thức, yêu cầu cần đạt và biểu hiện năng lực vật lí được kết nối tự động vào bản đặc tả. Giao diện nhóm từng bài học (B21–B25) thành bốn ô loại câu trực quan, cho phép giáo viên lấy đồng thời câu trắc nghiệm, đúng–sai, trả lời ngắn và tự luận trong cùng một bài học ở nhiều mức độ khác nhau (Hình 14). Thuật toán chọn câu đảm bảo không trùng lặp mã câu hỏi và cảnh báo ngay khi một dòng ma trận thiếu nguồn câu trong ngân hàng.')
shot('20-ma-tran-bon-loai.jpg', 14, 'Giao diện ma trận cho phép phối hợp bốn loại câu hỏi và nhiều mức độ nhận thức trong cùng bài B21.')
para('Tỉ lệ phân bố điểm theo định dạng câu hỏi và mức độ nhận thức được hệ thống cộng tổng trực tiếp từ cấu hình ma trận hiện hành. Cấu trúc tham khảo 30% – 20% – 20% – 30% theo loại câu và 40% – 30% – 30% theo mức độ nhận thức trong phụ lục Công văn 7991 được tích hợp làm mẫu đối chiếu để giáo viên cân đối theo kế hoạch kiểm tra của tổ chuyên môn (Bộ Giáo dục và Đào tạo, 2024). Khi giáo viên thêm hoặc bớt câu hỏi, hệ thống yêu cầu xác nhận lại điểm số và kiểm tra lại đề trước khi mở khóa chức năng xuất tệp Word.')

subheading('3.2.11. Phiếu học tập có hướng dẫn, nhiệm vụ và rubrics')
para('Phân hệ thiết kế phiếu học tập ba pha vận hành theo quy trình ba bước: (1) chọn bài học và mẫu phiếu khởi tạo, (2) chỉnh sửa câu hỏi và hướng dẫn theo từng pha, (3) xem trước bố cục và xuất tệp Word (Hình 15). Mỗi mẫu phiếu mặc định trích xuất ba câu hỏi gốc cùng bài học để phân bổ vào giai đoạn trước giờ học, trong giờ học và sau giờ học. Giáo viên có thể hoán đổi vị trí pha, thay câu hỏi khác từ ngân hàng (tối đa chín câu trong một phiếu) và hiệu chỉnh yêu cầu sản phẩm. Trước khi xuất tệp, hệ thống kiểm tra tự động sự hiện diện của cả ba pha, yêu cầu cần đạt, thời lượng gợi ý, mục tiêu và tiêu chí đánh giá.')
shot('14-phieu-ba-pha-moi.jpg', 15, 'Khởi tạo phiếu học tập ba pha với mẫu bài B23; quy trình biên soạn ba bước và mục tiêu được hiển thị rõ ràng.')
para('Tệp phiếu học tập xuất ra cho học sinh gồm ba phần liên kết chặt chẽ. Phần 1 trình bày hướng dẫn sử dụng phiếu, mục tiêu bài học, thời lượng dự kiến cho từng pha (ví dụ: trước giờ 15 phút, trong giờ 40 phút, sau giờ 15 phút), sản phẩm cần nộp và đường dẫn QR/URL tới học liệu số tương ứng (Hình 16). Phần 2 liệt kê các nhiệm vụ theo trình tự thời gian, giữ nguyên văn bản câu hỏi, công thức và khung trống để học sinh trình bày lời giải, ghi lại điểm chưa hiểu trước giờ học hoặc phần lập luận đã chỉnh sửa sau thảo luận trên lớp. Phần 3 cung cấp bảng rubrics để học sinh tự đánh giá và giáo viên ghi nhận xét phản hồi.')
shot('17-huong-dan-phieu.jpg', 16, 'Phần hướng dẫn sử dụng phiếu học tập B23 nêu rõ thời lượng, sản phẩm cần hoàn thành và học liệu số đi kèm ở từng pha.')
para('Ở phiếu mẫu bài B21, nhiệm vụ yêu cầu học sinh nhận diện nguồn phát hạt alpha, lá vàng mỏng và màn huỳnh quang ZnS từ Hình 21.2 của SGK, sau đó giải thích vì sao phần lớn hạt alpha đi thẳng nhưng một tỉ lệ rất nhỏ bị bật ngược trở lại (Hình 17). Khi xuất ra định dạng DOCX, hệ thống nhúng trực tiếp hình ảnh gốc độ phân giải cao và chuyển đổi toàn bộ biểu thức LaTeX sang đối tượng phương trình toán học gốc của Microsoft Word (OMML Equation). Hệ thống đồng thời tạo riêng bản phiếu dành cho học sinh (ẩn đáp án, có dòng kẻ làm bài) và bản hướng dẫn chấm dành cho giáo viên (có lời giải chi tiết và lưu ý sai lầm thường gặp).')
shot('18-phieu-cau-hoi-hinh-sgk.jpg', 17, 'Nhiệm vụ bài B21 kết hợp văn bản câu hỏi chuẩn và hình bố trí thí nghiệm tán xạ alpha trích từ SGK.')
para('Bảng rubrics đi kèm phiếu học tập được thiết kế theo cấu trúc phân tích (analytic rubric) gồm bốn tiêu chí: (1) mức độ hoàn thành chuẩn bị trước giờ học; (2) khả năng giải thích hiện tượng và sử dụng dữ kiện/bảo toàn trong giờ học; (3) mức độ vận dụng giải quyết bài tập sau giờ học; (4) hành vi tự kiểm tra, phát hiện lỗi và điều chỉnh nhận thức. Mỗi tiêu chí được tường minh hóa qua bốn mức độ mô tả hành vi và chất lượng sản phẩm cụ thể (Hình 18). Học sinh tự đánh dấu mức đạt được trước khi nộp; giáo viên đối chiếu với bài làm thực tế để ghi nhận xét định tính, giúp định hướng cách sửa lỗi thay vì chỉ cho điểm tổng kết.')
shot('19-rubrics-phieu.jpg', 18, 'Bảng rubrics bốn tiêu chí – bốn mức độ tích hợp khung đối chiếu giữa tự đánh giá của học sinh và nhận xét của giáo viên.')

subheading('3.2.12. Kế hoạch bài dạy gắn với nhiệm vụ trong phiếu')
para('Phân hệ chuẩn bị giờ học giúp giáo viên chuyển hóa trực tiếp các nhiệm vụ trong phiếu học tập và học liệu 3D thành kế hoạch bài dạy theo cấu trúc Công văn 5512 qua ba bước: thiết lập điều kiện lớp học, biên soạn chuỗi hoạt động và rà soát cấu trúc trước khi xuất Word. Ở bước đầu, giáo viên xác định khối lớp, thời lượng tiết học trên lớp (45 phút hoặc 90 phút), điều kiện thiết bị phòng học và thời lượng tự học ở nhà (Hình 19). Tiếp theo, giáo viên chọn các yêu cầu cần đạt được trích xuất chính xác từ Chương trình Giáo dục phổ thông môn Vật lí 2018 (trang 27–28) phù hợp với trọng tâm tiết dạy (Hình 20).')
shot('23-ke-hoach-dieu-kien.jpg', 19, 'Thiết lập bài học, điều kiện thiết bị lớp học và phân bổ thời lượng trên lớp – ở nhà trước khi biên soạn hoạt động.')
shot('24-ke-hoach-yeu-cau.jpg', 20, 'Lựa chọn các yêu cầu cần đạt của chủ đề Phóng xạ bám sát Chương trình môn Vật lí 2018.')
para('Trong kế hoạch mẫu bài B23, ba nhiệm vụ của phiếu học tập được gắn kết liền mạch vào tiến trình sư phạm. Trước giờ học, học sinh xem video 3D, nêu định nghĩa chu kì bán rã T và ghi lại thắc mắc. Trên lớp (45 phút) gồm: hoạt động mở đầu (5 phút) tổng hợp nhanh các dự đoán từ phiếu chuẩn bị; hoạt động hình thành kiến thức và luyện tập (30 phút) tổ chức cho học sinh thao tác trên mô phỏng phân rã để giải quyết bài toán định lượng (ví dụ: mẫu đồng vị O-15 sau 244 giây đã phân rã 75% số hạt ban đầu, suy ra số hạt còn lại chiếm 25% = 1/2² nên 244 s = 2T và T = 122 s); hoạt động kết luận và hoàn thiện lời giải cá nhân (10 phút). Sau giờ học, học sinh giải bài tập vận dụng và hoàn thành bảng tự đánh giá (15 phút). Mỗi thẻ hoạt động đều tách biệt rõ cột hành động của giáo viên, hành động của học sinh, sản phẩm dự kiến và tiêu chí đánh giá (Hình 21).')
shot('15-chuan-bi-gio-hoc-moi.jpg', 21, 'Thiết kế hoạt động trong giờ học phân tách rõ nhiệm vụ tổ chức của giáo viên và thao tác kiểm chứng mô phỏng của học sinh.')
para('Khi xuất kế hoạch bài dạy ra tệp Word, tài liệu tuân thủ đầy đủ bốn mục lớn theo Phụ lục IV Công văn 5512: I. Mục tiêu (năng lực vật lí, năng lực tự chủ và tự học, phẩm chất), II. Thiết bị dạy học và học liệu, III. Tiến trình dạy học và IV. Điều chỉnh sau bài dạy (Hình 22). Trong mục Tiến trình dạy học, các hoạt động được sắp xếp theo ba thời điểm của lớp học đảo ngược nhưng vẫn giữ nguyên bốn loại hoạt động chuẩn (mở đầu, hình thành kiến thức, luyện tập, vận dụng) cùng bốn bước tổ chức thực hiện (chuyển giao nhiệm vụ, thực hiện nhiệm vụ, báo cáo – thảo luận, kết luận – nhận định). Giáo viên có thể lưu bản nháp trên trình duyệt, xuất tệp JSON để chia sẻ trong tổ bộ môn hoặc tải trực tiếp tệp DOCX.')
shot('16-ke-hoach-xem-truoc.jpg', 22, 'Màn hình kiểm tra cấu trúc kế hoạch bài dạy theo Công văn 5512 trước khi xuất tệp Word.')
para('Bộ kiểm tra quy tắc nội bộ tự động phát hiện các trường thông tin còn bỏ trống, pha học tập bị khuyết hoặc tổng thời gian các hoạt động trên lớp lệch khỏi khung 45/90 phút đã chọn. Khi giáo viên chọn chèn thêm một hoạt động khắc phục khó khăn nhận thức của học sinh, hệ thống tự động thay thế vào khung thời gian của hoạt động hình thành kiến thức tương ứng để tránh cộng dồn làm cháy giáo án. Tuy nhiên, việc vượt qua bộ quy tắc cấu trúc chỉ đảm bảo tính đầy đủ về hình thức, giáo viên vẫn giữ vai trò quyết định về tính phù hợp sư phạm đối với từng đối tượng học sinh.')

subheading('3.2.13. Xuất tài liệu và kiểm tra AI trong môi trường thử')
para('Sau khi hoàn tất ma trận và chọn câu hỏi, giáo viên rà soát toàn bộ nội dung đề, công thức và hướng dẫn chấm, tích chọn ô xác nhận đã kiểm duyệt rồi mới kích hoạt lệnh xuất đề, đáp án hoặc bản đặc tả ra tệp Word. Hệ thống hỗ trợ trộn từ một đến bốn mã đề từ cùng một tập câu hỏi đã chọn, bảo toàn mối liên kết giữa phần dẫn, hình minh họa, điểm số và khóa đáp án khi hoán vị phương án. Liên kết tải tệp DOCX được duy trì trong 15 phút kèm nút tải lại trực tiếp trên giao diện (Hình 23). Các ca kiểm thử tự động xác nhận toàn bộ kí hiệu đồng vị hạt nhân có đủ chỉ số trên/dưới (như ²³⁵₉₂U) và các công thức phân rã đều chuyển đổi sang đối tượng OMML Equation không phát sinh kí tự lỗi ô vuông.')
shot('21-xuat-word-da-tao.jpg', 23, 'Khung xác nhận kiểm duyệt đề và liên kết tải trực tiếp tệp Word (đề kiểm tra, đáp án, ma trận đặc tả).')
para('Trong phân hệ hỗ trợ giáo viên, trợ lí AI cục bộ được thử nghiệm với nhiệm vụ tóm tắt học liệu bài B23 và gợi ý câu hỏi chẩn đoán: mô hình trích xuất đúng hệ thức độ phóng xạ H = λN và quy luật giảm một nửa sau mỗi chu kì bán rã T, đồng thời hiển thị nguyên văn các đoạn nguồn SGK bên dưới để giáo viên đối chiếu trực tiếp (Hình 24). Quá trình kiểm tra nội bộ từng phát hiện một lượt sinh văn bản của mô hình 4B viết chưa chuẩn diễn đạt “Z giảm −2” trong phân rã alpha (cần diễn đạt chuẩn là “số hiệu nguyên tử Z giảm 2 đơn vị”). Để khắc phục triệt để nguy cơ AI tự biến đổi số liệu bài tập, chức năng gợi ý nhiệm vụ hỗ trợ được thiết kế theo cơ chế lai: AI chỉ phân tích mô tả khó khăn của giáo viên để chọn mã câu hỏi phù hợp nhất từ ngân hàng câu hỏi đã biên tập, sau đó hệ thống trích xuất nguyên văn câu hỏi và đáp án chuẩn từ cơ sở dữ liệu.')
shot('22-ai-giao-vien-hoat-dong.jpg', 24, 'Bản nháp tóm tắt học liệu do AI cục bộ tạo kèm các đoạn nguồn SGK đối chiếu trực tiếp dành cho giáo viên.')

subheading('3.2.14. Chuỗi năm bài học tương tác cấu trúc theo SGK Vật lí 12 và video hoạt hình 3D thuyết minh tiếng Việt')
para('Để khắc phục tình trạng học sinh phải chuyển qua lại rời rạc giữa văn bản lí thuyết, mô phỏng 3D và video bài giảng khi tự học ở nhà, phiên bản nâng cấp của hệ thống xây dựng chuỗi năm trang bài học tương tác chuyên sâu (B21–B25 tại đường dẫn /hoc-lieu/phong-hat-nhan-v2) có thanh chuyển bài liên thông và mục lục bám sát từng tiểu mục của sách giáo khoa Vật lí 12 Kết nối tri thức với cuộc sống (Vũ et al., 2024). Mỗi tiểu mục kết hợp trực tiếp văn bản cô đọng, công thức LaTeX, thí nghiệm mô phỏng tương tác có câu hỏi dự đoán và video hoạt hình 3D thuyết minh tiếng Việt.')
para('Ở Bài 21 (Cấu trúc hạt nhân), học sinh bắt đầu bằng thí nghiệm tán xạ hạt alpha của Rutherford với khả năng chạy song song hai điều kiện bắn (Điều kiện A và Điều kiện B) để so sánh trực tiếp ảnh hưởng của tham số va chạm b (từ 5 fm đến 120 fm) và động năng hạt alpha E (MeV) lên góc lệch quỹ đạo θ trên đồng hồ thời gian mẫu zeptogiây (1 zs = 10⁻²¹ s) (Hình 25). Các tiểu mục tiếp theo cho phép học sinh tự lắp ghép hạt nhân từ Z proton và N neutron để phân biệt nucleon, số khối A = Z + N, chuỗi đồng vị Hydro (¹₁H, ²₁H, ³₁H) – Carbon (¹²₆C, ¹³₆C, ¹⁴₆C) và kiểm chứng hệ thức bán kính hạt nhân R = R₀·A¹/³ với R₀ = 1,2×10⁻¹⁵ m.')
shot('25-b21-hero-rutherford.jpg', 25, 'Bài 21 tương tác: Mô phỏng tán xạ hạt alpha của Rutherford cho phép đối chứng đồng thời hai điều kiện tham số va chạm b và động năng E.')
para('Ở Bài 22 (Phản ứng hạt nhân và năng lượng liên kết), nội dung đi từ thí nghiệm buồng sương Blackett (1925) ghi nhận phản ứng biến đổi hạt nhân nhân tạo đầu tiên (⁴₂He + ¹⁴₇N → ¹⁷₈O + ¹₁H), công cụ kiểm tra định luật bảo toàn số nucleon A và điện tích Z, đến phòng thí nghiệm khảo sát lực hạt nhân, độ hụt khối Δm, năng lượng liên kết E_lk = Δm·c² và đồ thị năng lượng liên kết riêng E_lk/A theo số khối A với đỉnh bền vững cực đại quanh vùng ⁵⁶₂₆Fe ≈ 8,8 MeV/nucleon (Hình 26). Hai tiểu mục cuối tích hợp mô phỏng 3D phân hạch dây chuyền ²³⁵₉₂U và tổng hợp nhiệt hạch D–T.')
shot('26-b22-blackett-lien-ket.jpg', 26, 'Bài 22 tương tác: Khảo sát lực hạt nhân, độ hụt khối Δm và đường cong năng lượng liên kết riêng E_lk/A theo số khối A.')
para('Ở Bài 23 (Hiện tượng phóng xạ), trang học tập kết nối bốn nội dung: (1) mô phỏng buồng sương quan sát vết tia phóng xạ và sự lệch của ba loại tia α, β (β⁻, β⁺), γ trong từ trường đều hay qua các lớp vật liệu che chắn (giấy, nhôm, chì); (2) mô phỏng ống đếm Geiger–Müller kiểm chứng tính tự phát và ngẫu nhiên của quá trình phân rã trong các khoảng thời gian 5 giây, đặt cạnh bảng số liệu thực nghiệm Bảng 23.1 của SGK trang 105 (Hình 27); (3) phòng thí nghiệm định luật phóng xạ khảo sát đồng thời đường cong N(t) = N₀·2⁻ᵗ/ᵀ và độ phóng xạ H(t) = λN(t); (4) biển cảnh báo bức xạ và quy tắc an toàn ALARA (Thời gian – Khoảng cách – Che chắn).')
shot('27-b23-buong-suong-alara.jpg', 27, 'Bài 23 tương tác: Mô phỏng ống đếm Geiger–Müller kiểm chứng tính ngẫu nhiên của phóng xạ đối chiếu trực tiếp với Bảng 23.1 SGK.')
para('Ở Bài 24 (Công nghiệp hạt nhân), học sinh thao tác điều chỉnh độ cắm sâu của thanh điều khiển chứa Boron/Cadmium để khảo sát sự thay đổi của hệ số nhân neutron k (k < 1 tắt dần, k = 1 tới hạn ổn định, k > 1 vượt tới hạn) qua từng thế hệ phân hạch, đồng thời theo dõi sơ đồ hai vòng tuần hoàn tải nhiệt tách biệt trong nhà máy điện hạt nhân lò nước áp lực (PWR) theo Hình 24.1 và 24.3 của SGK (Hình 28). Các tiểu mục ứng dụng tiếp theo trình bày nguyên lí chẩn đoán hình ảnh chức năng bằng dược chất phóng xạ (SPECT, PET/CT), xạ trị ung thư và công nghệ chiếu xạ bảo quản nông sản, kiểm định khuyết tật mối hàn công nghiệp.')
shot('28-b24-lo-phan-ung-pwr.jpg', 28, 'Bài 24 tương tác: Mô phỏng điều khiển hệ số nhân neutron k bằng thanh hấp thụ và sơ đồ dòng năng lượng trong lò phản ứng PWR.')
para('Ở Bài 25 (Bài tập về vật lí hạt nhân), trang học tập hệ thống hóa toàn bộ công thức trọng tâm của Chương 4 và triển khai hoạt động thực hành phân tích dữ liệu phóng xạ theo đúng Bảng 25.1 của SGK trang 121 (tám mốc đo độ phóng xạ H(t) từ t = 0 s với H₀ = 151 Bq đến t = 360 s với H = 16 Bq). Học sinh điều chỉnh chu kì bán rã giả thuyết T (ví dụ đối chứng giữa T = 40 s và T = 60 s), bật đường cong lí thuyết H(t) = 151·2⁻ᵗ/ᵀ Bq và bấm vào từng mốc thời gian để đọc độ lệch giữa số liệu thực nghiệm do tính ngẫu nhiên thống kê với giá trị hàm mũ lí thuyết (Hình 29).')
shot('29-b25-bang-25-1-sgk.jpg', 29, 'Bài 25 tương tác: Phân tích đồ thị thực nghiệm H(t) từ tám mốc đo Bảng 25.1 SGK và ước lượng chu kì bán rã T.')
para('Song hành với năm trang bài học tương tác, nhóm nghiên cứu đã thiết kế và kết xuất bộ năm video hoạt hình 3D thuyết minh tiếng Việt (b21.mp4 đến b25.mp4) gồm tổng cộng 26 cảnh hoạt hình 3D chuyển động liên tục (1920×1080, 30 fps) đồng bộ với lời giảng tiếng Việt và phụ đề WebVTT (Hình 30). Các cảnh 3D tái hiện trực quan những quá trình vi mô then chốt: quỹ đạo tán xạ Coulomb 3D của chùm hạt alpha quanh hạt nhân vàng và cấu trúc nguyên tử Carbon-12 3D với ba quỹ đạo electron nghiêng (B21); biến dạng giọt chất lỏng của hạt nhân kích thích ²³⁶₉₂U* trước khi tách thành hai mảnh ⁹⁵₃₉Y, ¹³⁸₅₃I kèm ba neutron thứ cấp (B22); mạng tinh thể lập phương 4×4×4 gồm 64 hạt nhân phóng xạ chuyển trạng thái ngẫu nhiên qua từng chu kì bán rã T (B23); vùng hoạt lò phản ứng hạt nhân 3D với các bó nhiên liệu, thanh điều khiển nâng hạ theo thời gian thực và dòng hạt truyền nhiệt (B24); ống đếm Geiger–Müller 3D ghi nhận xung phóng xạ kết hợp đồ thị xác định chu kì bán rã từ Bảng 25.1 SGK (B25).')
shot('30-video-3d-ba-bai.jpg', 30, 'Sáu cảnh trích xuất từ bộ năm video hoạt hình 3D thuyết minh tiếng Việt (B21–B25): tán xạ Rutherford 3D, nguyên tử C-12 3D, phân hạch giọt chất lỏng U-235 3D, mạng phân rã 64 hạt nhân 3D, tâm lò phản ứng PWR 3D và thực hành đo bán rã Bảng 25.1.')

subheading('3.2.15. Cơ chế kiểm chứng việc chuẩn bị trước giờ học và quy trình sáu tiêu chí rà soát tri thức vật lí của AI')
para('Một thách thức phổ biến của mô hình lớp học đảo ngược là học sinh chỉ mở lướt qua video hoặc bấm thử mô phỏng một cách cơ học mà không thực sự suy nghĩ trước khi đến lớp (van Alten et al., 2019; Liu et al., 2024). Để giải quyết vấn đề này về mặt thiết kế sư phạm, hệ thống thiết lập cơ chế kiểm chứng việc chuẩn bị trước giờ học qua chu trình ba bước bắt buộc gắn với bằng chứng cụ thể: (1) Cam kết dự đoán trước khi quan sát: trước khi xem video 3D hoặc chạy mô phỏng, học sinh phải điền câu trả lời dự đoán vào trường “Dự đoán trước khi xem” (ví dụ: dự đoán góc lệch hạt alpha khi giảm tham số va chạm b ở B21, hoặc dự đoán số hạt còn lại sau hai chu kì bán rã ở B23); (2) Thu thập dữ kiện định lượng trong khi thao tác: nhiệm vụ yêu cầu học sinh trích xuất các con số cụ thể từ trạng thái dừng của mô phỏng hoặc mốc thời gian của video (như ghi nhận A = 95 + 138 + 3 = 236 ở bước 04 của mô phỏng phân hạch B22, hoặc đọc độ lệch ΔH tại t = 60 s trong Bảng 25.1 ở B25) vào trường “Điều em quan sát thấy”; (3) Câu hỏi chẩn đoán cổng vào và phản tư: học sinh trả lời câu hỏi kiểm tra nhanh có phản hồi tức thì, đối chiếu sự khác biệt giữa dự đoán ban đầu với kết quả mô phỏng và ghi lại ít nhất một câu hỏi thắc mắc mang đến lớp. Giáo viên dựa trên sự chênh lệch giữa dự đoán và giải thích cùng danh sách câu hỏi thắc mắc để tổ chức thảo luận đầu tiết học, thay vì đánh giá dựa trên thao tác bấm nút đơn thuần.')
para('Bên cạnh đó, nhằm đảm bảo độ chính xác khoa học khi tích hợp mô hình ngôn ngữ lớn cục bộ (Qwen3 4B Instruct) vào chủ đề Vật lí hạt nhân, mọi câu trả lời nháp của AI và học liệu biên soạn trên hệ thống đều được kiểm soát qua quy trình sáu tiêu chí rà soát tri thức vật lí (K1–K6): (K1) Bảo toàn số nucleon và điện tích: mọi phương trình phản ứng hạt nhân và phân rã phóng xạ phải thỏa mãn đồng thời ∑A_trước = ∑A_sau và ∑Z_trước = ∑Z_sau (kiểm tra rõ hạt β⁻ có A = 0, Z = −1 và β⁺ có A = 0, Z = +1); (K2) Nhất quán quy ước khối lượng: phân biệt tường minh khối lượng hạt nhân trần m_hn với khối lượng nguyên tử trung hòa m_nguyên tử khi tính độ hụt khối Δm, tuyệt đối không trộn hai quy ước trong cùng một phép tính và thống nhất hệ số quy đổi 1 u·c² ≈ 931,5 MeV theo chuẩn SGK; (K3) Chuẩn xác kí hiệu, đơn vị SI và đại lượng: phân biệt rõ số hạt chưa phân rã N(t) với độ phóng xạ H(t) = λN(t) (đơn vị Becquerel, 1 Bq = 1 phân rã/s), dùng đúng chỉ số trên cho số khối A và chỉ số dưới cho số hiệu nguyên tử Z; (K4) Minh bạch giới hạn của mô hình trực quan: nêu rõ màu sắc, kích thước hạt và thang thời gian trong mô phỏng/video 3D là quy ước sư phạm, đồng thời không suy diễn điều kiện vượt tới hạn k > 1 trong lò phản ứng năng lượng thành vụ nổ hạt nhân; (K5) Truy xuất đúng đoạn nguồn SGK: phản hồi của AI phải kèm mã đoạn nguồn công khai để giáo viên và học sinh kiểm chứng, không tự ý bịa thêm số liệu thực nghiệm ngoài SGK; (K6) Định hướng sư phạm gợi mở: đối với học sinh, AI đặt câu hỏi dẫn dắt theo từng bước tư duy thay vì giải hộ trọn vẹn bài tập về nhà.')

anchor = ps[86]
position = body.index(anchor)
for node in insert:
    body.insert(position, node)
    position += 1

# Update source bibliography content only, preserving the Mendeley control identity and all opaque parts.
bib = root.xpath('//w:sdt[w:sdtPr/w:tag[@w:val="MENDELEY_BIBLIOGRAPHY"]]/w:sdtContent', namespaces=NS)[0]
bps = bib.findall('w:p', NS)
assert len(bps) == 14
for _ in range(len(reference_runs) - len(bps)):
    bib.append(deepcopy(bps[-1]))
bps = bib.findall('w:p', NS)
for p, segments in zip(bps, reference_runs):
    fill(p, '', segments)
    pr = p.find('w:pPr', NS)
    if pr is None:
        pr = E.Element(q('w:pPr'))
        p.insert(0, pr)
    ind = pr.find('w:ind', NS)
    if ind is None:
        ind = E.SubElement(pr, q('w:ind'))
    ind.attrib.clear()
    ind.set(q('w:left'), '398')
    ind.set(q('w:hanging'), '398')
    jc = pr.find('w:jc', NS)
    if jc is None:
        jc = E.SubElement(pr, q('w:jc'))
    jc.set(q('w:val'), 'left')
    if pr.find('w:keepLines', NS) is None:
        E.SubElement(pr, q('w:keepLines'))
    # Format inherits the source document, not the prior report.
    for r in p.findall('w:r', NS):
        rp = r.find('w:rPr', NS)
        if rp is not None:
            for el in list(rp):
                if E.QName(el).localname in ['sz', 'szCs', 'rFonts', 'b', 'bCs']:
                    rp.remove(el)

settings = E.fromstring(parts['word/settings.xml'])
update = settings.find('w:updateFields', NS)
if update is None:
    update = E.SubElement(settings, q('w:updateFields'))
update.set(q('w:val'), 'true')

# Update aspect ratio of all 30 drawings directly from their actual image dimensions
rel_target_map = {r.get('Id'): r.get('Target') for r in rels}
for drawing in root.xpath('//w:drawing', namespaces=NS):
    blip = drawing.find('.//a:blip', NS)
    rid = blip.get(q('r:embed')) if blip is not None else None
    target = rel_target_map.get(rid, '')
    media_key = 'word/' + target if target else ''
    cx = 4860000
    if media_key in INITIAL_MEDIA_MAP:
        img_path = ROOT / 'docs/article-figures' / INITIAL_MEDIA_MAP[media_key]
        w, h = Image.open(img_path).size
        cy = round(cx * h / w)
    elif target.startswith('media/'):
        img_path = ROOT / 'docs/article-figures' / Path(target).name
        if img_path.exists():
            w, h = Image.open(img_path).size
            cy = round(cx * h / w)
        else:
            extent = drawing.find('.//wp:extent', NS)
            cy = round(cx * int(extent.get('cy')) / int(extent.get('cx')))
    else:
        extent = drawing.find('.//wp:extent', NS)
        cy = round(cx * int(extent.get('cy')) / int(extent.get('cx')))
    for node in drawing.xpath('.//wp:extent|.//a:xfrm/a:ext', namespaces=NS):
        node.set('cx', str(cx))
        node.set('cy', str(cy))

core = E.fromstring(parts['docProps/core.xml'])
title = core.find('{http://purl.org/dc/elements/1.1/}title')
if title is None:
    title = E.SubElement(core, '{http://purl.org/dc/elements/1.1/}title')
title.text = TITLE
parts['docProps/core.xml'] = E.tostring(core, xml_declaration=True, encoding='UTF-8', standalone=True)

for t in root.xpath('//w:body//w:t', namespaces=NS):
    if t.text:
        t.text = t.text.replace('04/10/2026', '10/11/2026')

# Remove empty editable declaration slots so the final reference is not isolated.
for index in (100, 102, 107):
    p = ps[index]
    if not ''.join(p.xpath('.//w:t/text()', namespaces=NS)).strip() and p.getparent() is not None:
        p.getparent().remove(p)

parts['word/settings.xml'] = E.tostring(settings, xml_declaration=True, encoding='UTF-8', standalone=True)
parts['word/document.xml'] = E.tostring(root, xml_declaration=True, encoding='UTF-8', standalone=True)
parts['word/_rels/document.xml.rels'] = E.tostring(rels, xml_declaration=True, encoding='UTF-8', standalone=True)

with ZipFile(OUTPUT, 'w', ZIP_DEFLATED) as archive:
    for name, data in parts.items():
        archive.writestr(name, data)
    for name, data in added.items():
        archive.writestr(name, data)

# Preserve-only checks compare exact package bytes after writing.
allowed_changed = {
    'word/document.xml',
    'word/settings.xml',
    'word/_rels/document.xml.rels',
    'docProps/core.xml',
    *INITIAL_MEDIA_MAP.keys(),
}
with ZipFile(SOURCE) as source, ZipFile(OUTPUT) as final:
    changed = [n for n in source.namelist() if source.read(n) != final.read(n)]
    assert set(changed) <= allowed_changed, changed
    srcroot = E.fromstring(source.read('word/document.xml'))
    assert E.tostring(srcroot.find('.//w:sectPr', NS)) == E.tostring(root.find('.//w:sectPr', NS))
    assert len(root.xpath('//w:sdt', namespaces=NS)) == len(srcroot.xpath('//w:sdt', namespaces=NS))
    assert len(root.xpath('//w:drawing', namespaces=NS)) == 30
    assert len(root.xpath('//m:oMath', namespaces={'m': 'http://schemas.openxmlformats.org/officeDocument/2006/math'})) == len(srcroot.xpath('//m:oMath', namespaces={'m': 'http://schemas.openxmlformats.org/officeDocument/2006/math'}))
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == EXPECTED
    (ROOT / 'tmp/report-template').mkdir(parents=True, exist_ok=True)
    (ROOT / 'tmp/report-template/fidelity.json').write_text(
        json.dumps(
            {
                'changed_parts': changed,
                'new_media': list(added),
                'replaced_initial_media': INITIAL_MEDIA_MAP,
                'figures': 30,
                'references': 20,
                'tests': 102,
                'video_storyboard_tests': 5,
                'source_sha256': EXPECTED,
            },
            ensure_ascii=False,
            indent=2,
        )
    )

text = '\n'.join(''.join(p.xpath('.//w:t/text()', namespaces=NS)) for p in root.xpath('//w:body//w:p', namespaces=NS))
(ROOT / 'tmp/report-template/report-text.txt').write_text(text)
print(json.dumps({'output': str(OUTPUT), 'figures': 30, 'references': 20, 'tests': 102, 'changed_parts_count': len(changed)}, ensure_ascii=False))
