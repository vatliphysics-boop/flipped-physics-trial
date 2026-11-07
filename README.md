# Học liệu số Vật lí 12 — Lớp học đảo ngược

Ứng dụng học liệu số hỗ trợ dạy và học Vật lí 12 theo mô hình lớp học đảo ngược. Chương trình chính thức B01–B25 là cố định; giáo viên tổ chức lớp và xuất bản học liệu, còn học sinh học theo ba pha trước giờ học, trong giờ học và sau giờ học.

## Stack

- Next.js 16.3.5, React 19, TypeScript
- Supabase Auth, Postgres, RLS và Storage
- `@supabase/ssr` cho SSR và `proxy.ts`
- `tus-js-client` cho tải video trực tiếp, phù hợp tệp lớn

## Chạy cục bộ

```bash
npm install
```

Tạo `.env.local` với **tên biến** sau:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Áp dụng migration theo thứ tự trong `supabase/migrations/`, sau đó chạy:

```bash
npm run dev
```

## Route chính

- `/login`, `/register`, `/auth/confirm` — xác thực
- `/student` — tổng quan học sinh
- `/student/curriculum`, `/student/curriculum/[chapterCode]` — chương trình học
- `/student/lessons/[lessonId]` — học liệu, video/checkpoint và tiến độ
- `/teacher` — tổng quan giáo viên
- `/teacher/classes`, `/teacher/classes/[classId]` — quản lý lớp
- `/teacher/classes/[classId]/curriculum` — chương trình của lớp
- `/teacher/lessons/[lessonId]` — quản lý học liệu
- `/hoc-lieu/lop-hoc-dao-nguoc` — hình thức tổ chức, nhiệm vụ của giáo viên và học sinh, các nhóm học liệu
- `/teacher/lessons/[lessonId]/ket-qua` — xem nhiệm vụ cạnh bằng chứng học sinh; cần schema, phiên giáo viên và dữ liệu lớp phù hợp

## Ghi chú Supabase và video

Client SSR, Server Component và Server Action luôn chạy theo người dùng đăng nhập; RLS và kiểm tra vai trò là lớp bảo vệ chính. Không đưa service-role key hay bất kỳ secret nào vào biến `NEXT_PUBLIC_*`.

Video MP4, WebM và MOV được tải trực tiếp lên Supabase Storage bằng Tus; ứng dụng lưu tham chiếu Storage vào học liệu thay vì gửi tệp dung lượng lớn qua Server Action.

## Validation

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Triển khai

Thiết lập hai biến môi trường Supabase nêu trên trong môi trường triển khai, áp dụng migration trước khi deploy, và không commit `.env.local` hoặc secret.

## Cập nhật học liệu ngày 04/10/2026

Phần khám phá bán rã B23 có thể xem tại `/demo-lesson`. Tiến trình giáo viên giao được hiển thị ở cả ba pha học sinh, kèm biểu mẫu ghi dự đoán, kết quả và điều cần sửa. Cần migration 017 và 018 để lưu bước và chuyển pha; xem `docs/PROGRESS_20261004.md` về kiểm tra và các phần chưa xác nhận.

Kiểm tra quy tắc tiến trình bằng Node.js 24:

```bash
node --test tests/pathway-progress.test.ts
```

### Kho học liệu và thí nghiệm 3D B21–B25 (04/10/2026)

- Mở `/hoc-lieu` để dùng kho 89 mục mà không cần tài khoản; `/student/materials` dùng trong cổng học sinh, `/teacher/materials` dùng trong cổng giáo viên. Nhấn cả dòng **Học liệu** để xổ các danh mục.
- Cả 17 hoạt động dùng WebGL/Three.js: nhấn bắt đầu mới chạy, tạm dừng/đặt lại, thay đổi tham số, xoay/thu phóng và bốn góc nhìn. Chỉ mở một tài nguyên trong kho để giới hạn số ngữ cảnh đồ họa. Các mô hình có kích thước/thời gian quy ước; bảng định lượng có tham số riêng. Bán rã dừng sau 3T, không tự tái tạo các hạt đã phân rã.
- Có năm phiếu PDF (mỗi phiếu 3 trang), 5 sơ đồ và 5 minh họa động, 15 câu chẩn đoán, hoạt động tư duy/đóng vai/trò chơi trên cùng một thiết bị, notebook Python và dữ liệu CSV có nguồn mô hình rõ ràng. Có thêm 5 video YouTube xem trực tiếp với nhiệm vụ tiếng Việt; các nguồn không hỗ trợ nhúng mở ở trang tác giả. Video không phải do nhóm sản xuất.
- Phiếu số lưu bản nháp trong trình duyệt; bản ghi nhóm và điểm trò chơi chỉ giữ trong phiên. Các phần này chưa tự gửi giáo viên; nộp qua bước được giao trong lớp. Tham khảo `docs/PROGRESS_20261004.md` về điều kiện migration còn thiếu.
- `scripts/build-nuclear-handouts.py` tạo tài liệu từ `src/data/nuclear-learning.json`; dùng Python có reportlab/pypdf và các phông Arial Unicode/Arial Bold. Bản trích SGK dùng tệp người dùng cung cấp, trang vật lí 92–124 (trang in 90–122). Notebook chỉ cần Python chuẩn, tự hiển thị SVG nếu chạy trong Jupyter/Colab.

### Đề mẫu và kế hoạch riêng cho giáo viên

- Kho `/hoc-lieu?type=assessment`: 2 mã giữa kỳ (B21–B23, 45 phút) và 2 mã cuối kỳ (B21–B25, 60 phút). Mỗi đề 18 câu, tổng 10 điểm; chấm tự động tối đa 8 điểm, tự luận 2 điểm theo rubric. Đây là đề mẫu công khai để tự luyện trong chủ đề hạt nhân, không phải đề đầy đủ toàn học kỳ hay đề thi bảo mật.
- Kho hiện có 89 mục, gồm thêm 5 hướng dẫn dạy học, 15 thẻ sửa lỗi trong 5 hoạt động, phiếu phản tư 4 chỉ báo và 8 nguồn PhET/OpenStax/CERN có nhiệm vụ tiếng Việt.
- `/hoc-lieu/soan-ke-hoach`: 5 mẫu B21–B25, chọn/phối hợp nguồn, biên tập hoạt động theo pha, sắp xếp, thời lượng, mục tiêu/sản phẩm/đánh giá/phân hóa, lưu thiết bị, nhập/xuất JSON và bản HTML để in.
- `/teacher/plans`: kho riêng theo tài khoản, lưu kế hoạch và nhập thành bước nháp vào bài học thuộc giáo viên. Cần áp dụng migration 017 → 018 → `20261004_019_teacher_plans_and_assessments.sql`. Migration 019 có RLS kế hoạch riêng và RPC nhập nguyên tử, chống nhập lặp cùng kế hoạch/bài học. Chưa áp dụng vào Supabase từ phiên làm việc này; cần kiểm thử theo tài khoản thật trước công bố luồng lưu/giao.
- Xây lại đề/hướng dẫn bằng Python chuẩn: `scripts/build-nuclear-exams.py`, `scripts/build-teaching-guides.py`. Bản in HTML không cần thư viện PDF và mở được khi không dùng khung tương tác.

### Hành trình học trực quan và thao tác nhanh

- `/hoc-lieu/truc-quan?bai=B22`: chọn B21–B25, đi qua đọc hình → thao tác 3D → xem video → ghi và giải thích; chế độ trình chiếu ẩn phần điều hướng phụ.
- 5 infographic vector có ba điểm tương tác, giải thích quan sát/kiến thức, câu hỏi có phản hồi và tải PNG 2400×1400 hoặc SVG. 5 minh họa động được thay bằng cùng hệ đồ họa khoa học; giảm chuyển động theo tùy chọn trình duyệt.
- Phân hạch dùng đúng kênh SGK KNTT tr. 100–101: U-235 + n → U-236* → Y-95 + I-138 + 3n. Cảnh 3D dùng 236 nucleon, dừng sau một lượt, có bốn bước xem lại, thanh thời gian, bốn góc nhìn và phép kiểm tra A/Z. k là hệ số nhân hiệu dụng, tách biệt số neutron sinh ra.
- 5 video YouTube từ Khan Academy/FuseSchool/TED-Ed được kiểm tra tên và kênh qua oEmbed. Trình phát youtube-nocookie chỉ tải khi nhấn mở, có liên kết nguồn khi không phát được. Ngôn ngữ nguồn là tiếng Anh.
- Kho có lọc theo nhu cầu trước giờ/trên lớp/ôn tập, đánh dấu yêu thích trên thiết bị và liên kết mở trực tiếp từng tài nguyên. Bản ghi quan sát tự lưu theo bài trên thiết bị, tải TXT để mang tới lớp. Các bản ghi/yêu thích không phải bài nộp hoặc dữ liệu nghiên cứu.
- Tái tạo đồ họa: `python3 scripts/generate_visual_infographics.py`, rồi `node scripts/render-infographic-pngs.mjs`. Kiểm thử: `node --test tests/*.test.ts`. Nguồn và đối chiếu thiết kế ở `docs/VISUAL_LEARNING_SOURCES.md`.

## AI trong học liệu

Nút AI góc phải hỗ trợ hỏi bài B21–B25 bằng mô hình cục bộ. Giáo viên có mục `/teacher/ai` để xử lí văn bản học liệu. Cách chạy, phạm vi và giới hạn: [docs/LOCAL_AI.md](docs/LOCAL_AI.md).


### Không gian giáo viên (05/10/2026)

- `/hoc-lieu/ai-giao-vien`: bản dùng thử công khai; `/teacher/ai`: không gian theo phiên giáo viên. Bốn việc: tạo đề có hình, phiếu ba pha, chuẩn bị giờ học, nhập và đảo đề riêng.
- Ngân hàng 105 câu B21–B25, trong đó 33 câu gắn 11 hình PNG/SVG. Chọn đề 15 phút, giữa kỳ hoặc cuối kỳ trong chủ đề hạt nhân; sửa câu/điểm/khóa, xem bảng phân bố thực tế rồi xuất DOCX riêng cho học sinh và giáo viên.
- Tạo 1–8 mã cùng tập câu; đảo phương án phù hợp và ánh xạ đáp án. Không suy ra tương đương độ khó từ việc đảo thứ tự.
- Phiếu chọn hình theo vấn đề hỗ trợ, có trước/trong/sau giờ học. Kế hoạch có nhiệm vụ giáo viên/học sinh, sản phẩm, tiêu chí, hỗ trợ và nguồn thực tế trong kho. Kiểm tra quy tắc nhắc trường thiếu/thời lượng, chưa phải thẩm định sư phạm.
- Đề riêng TXT/DOCX đọc trong trình duyệt, tối đa 5 MB; hỗ trợ trắc nghiệm bốn phương án và một hình PNG/JPEG ở phần dẫn. Bảng, công thức Word OMML, ảnh phương án, PDF quét cần chuẩn hóa; không dùng AI tự đoán khóa đáp án.
- Bản nháp đề/phiếu giữ trong phiên trang; tải Word để giữ trước khi tải lại. Chưa có kho câu hỏi riêng đồng bộ theo tài khoản. Lưu/giao kế hoạch qua lớp vẫn cần migration và kiểm thử tài khoản thật như mô tả bên trên.
- `scripts/build-scientific-report.py` dùng mẫu duy nhất `docs/templates/BAO_KHOA_HOC_DANG_KHOI.docx`, giữ bộ phận mẫu và trích dẫn APA từ `docs/references/REPORT_REFERENCE_RUNS.json`. Chạy bằng Python có python-docx/lxml/Pillow. Các mẫu/generator cũ đã chuyển sang `tmp/report-template/superseded`, không dùng tạo bản báo hiện tại.
- Kiểm tra: `node --experimental-strip-types --test tests/*.test.ts` (41/41), `npm run lint` (0 lỗi, một cảnh báo có sẵn), `npm run build` đạt. Kiểm tra bộ xuất DOCX qua tệp dựng/render; lượt tải Blob hoàn tất chưa xác nhận trong trình duyệt kiểm tra.
