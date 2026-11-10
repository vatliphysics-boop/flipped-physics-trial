# Kiểm kê video B21–B25 (Vòng 4 — lô video sản xuất)

Ngày lập: 08/11/2026.

## 1. Công cụ có sẵn trong môi trường

| Công cụ | Trạng thái | Ghi chú |
| --- | --- | --- |
| Remotion 4.0.541 (Node renderer) | Có `scripts/nuclear-videos/node_modules` | Dựng hình bằng Chromium/React |
| FFmpeg (qua imageio_ffmpeg) | Có tại `tmp/nuclear-voice/.venv/.../ffmpeg-macos-aarch64-v7.1` | Dùng mã hóa H.264/AAC + trích khung |
| FFprobe | Không có hệ thống; FFmpeg dùng thay để đọc metadata | Kiểm định bằng `ffmpeg -i` |
| VieNeu-TTS v3 Turbo (Kim Thanh, Apache-2.0) | Mô hình đã tải tại `tmp/nuclear-voice/huggingface` (~540 MB) | Giọng có sẵn, seed 21, không clone giọng thật |
| Piper `vi_VN-vais1000-medium` | Có tại `tmp/nuclear-voice/models/` | Phương án dự phòng |
| Python 3.11 (venv `tmp/nuclear-voice/.venv`) | Hoạt động; đã tổng hợp lời đọc | `scripts/nuclear-videos/voice/synthesize.py` + `prepare.py` |
| Remotion storyboards + narration.vi.json | Có sẵn, đồng bộ về số cảnh | `scripts/nuclear-videos/storyboards.mjs`, `narration.vi.json` |
| Manim / Blender | **Không có** | Không cài mới |
| Chrome Headless Shell | Có trong `~/Library/Caches/Google/Chrome-headless` | Remotion dùng |

## 2. Video đang phục vụ website (`public/videos/nuclear-lessons/`)

Kiểm tra bằng `ffmpeg -i` (không có ffprobe). Tất cả 1920×1080, 30 fps, H.264, yuv420p, AAC stereo, đều có ảnh bìa `.jpg` và phụ đề `.vi.vtt`.

| Bài | Tên theo SGK/KNTT | Thời lượng | Dung lượng | Âm thanh | Phụ đề | Trang dùng |
| --- | --- | --- | --- | --- | --- | --- |
| B21 Cấu trúc hạt nhân | B21 (SGK tr.91–95) | 89,80 s | 4,4 MB | Có (AAC 116 kb/s) | b21.vi.vtt (1.488 B) | `/hoc-lieu/phong-hat-nhan?bai=B21`, `nuclear-lab-lessons.ts` |
| B22 Phản ứng hạt nhân và năng lượng liên kết | B22 (SGK tr.96–103) | 75,20 s | 3,6 MB | Có (ACC 116 kb/s) | b22.vi.vtt (1.255 B) | `/hoc-lieu/phong-hat-nhan?bai=B22` |
| B23 Hiện tượng phóng xạ | B23 (SGK tr.104–113) | 93,73 s | 4,6 MB | Có (AAC 119 kb/s) | b23.vi.vtt (1.529 B) | `/hoc-lieu/phong-hat-nhan?bai=B23` |
| B24 Công nghiệp hạt nhân | B24 (SGK tr.114–118) | 71,97 s | 3,7 MB | Có (AAC 115 kb/s) | b24.vi.vtt (1.317 B) | `/hoc-lieu/phong-hat-nhan?bai=B24` |
| B25 Bài tập về vật lí hạt nhân | B25 (SGK tr.119–122) | 76,23 s | 4,1 MB | Có (AAC 116 kb/s) | b25.vi.vtt (1.244 B) | `/hoc-lieu/phong-hat-nhan?bai=B25` |

Tổng ~35,5 phút. Video 5 bài này là học liệu chính của đề tài.

## 3. Video khác trong `public/videos/`

| File | Phạm vi | Ghi chú |
| --- | --- | --- |
| evolution-atomic-model.mp4 | 720×1280, 24 fps, ~10,11 s, 1,2 MB, **stereo AAC** | Dùng trong `VideoShowcase.tsx` (trang Học liệu trực quan) — không có phụ đề, nguồn gốc/giấy phép không ghi nhận |
| 5-types-chemical-bonds.mp4 | 1080×1920, 30 fps, ~20,04 s, 2,3 MB | Bản sao trong `video-mophong/` (cùng nội dung) |
| video-mophong/*.mp4 | ~3,5 MB | Các video tải về (tên FDown.vn) — không dùng, không xác nhận quyền |

Hai video `evolution-atomic-model` và `5-types-chemical-bonds` **không thuộc phạm vi nghiên cứu B21–B25**, không có phụ đề và giấy phép không rõ → không đưa vào sản phẩm bàn giao, đánh dấu cần xác minh.

## 4. Sản phẩm hiện có do dự án tạo (pipeline Remotion)

`tmp/nuclear-voice/rendered/`: b21–b25.mp4 (~4 MB mỗi file, kích thước tương đương bản public) + `.jpg` + `.vi.vtt` — cùng phiên bản đang phục vụ. `tmp/nuclear-voice/backups/2026-11-06T01-55-27.253Z/` là bản sao lưu. Không có nguồn video gốc tách riêng; mã nguồn dựng hoàn toàn trong `scripts/nuclear-videos/` (không cần asset ngoài).

## 5. Cấu trúc kịch bản hiện có

`storyboards.mjs` mỗi bài 5 cảnh × 12 s (silent) hoặc thời lượng theo lời đọc (có giọng). `narration.vi.json` tách `display` (phụ đề) và `spoken` (bản đọc TTS) đã chuẩn hóa phát âm tiếng Việt (Số tự nhiên, kí hiệu vật lí, Bq, eV…).

## 6. Xác định video cần làm lại

| Video | Quyết định | Lý do |
| --- | --- | --- |
| B21–B25 (public) | **Làm lại v2** | Giọng đọc máy móc, mẫu audio ~đã đo; nhận diện cũ teal/green "AI", chưa có nhận diện SGU; kịch bản chưa đặt cấu trúc giảng dạy theo yêu cầu (dẫn nhập – mục tiêu – hình thành – minh họa – câu hỏi – kết luận) |
| evolution-atomic-model.mp4 | Không làm lại; cần xác minh nguồn/cấp phép | Không thuộc đề tài |
| 5-types-chemical-bonds.mp4 | Không làm lại; cần xác minh nguồn/cấp phép | Không thuộc đề tài |
| video-mophong/*.mp4 | Loại khỏi phạm vi | Tải tự động, không rõ quyền |

## 7. Kết luận

- 5 video bài học: dựng lại đầy đủ hình + lời đọc + phụ đề, giữ video cũ trong `public/videos/nuclear-lessons/` để khôi phục.
- Giọng đọc: VieNeu-TTS v3 Turbo · Kim Thanh (mã cục bộ, không tốn phí, quyền sử dụng ghi nhận trong `voice/README.md`); Piper làm phương án dự phòng.
- Hình: Remotion + SVG/KaTeX scientific motion graphics, bảng màu SGU (navy + xanh lam nhạt).
- Không dùng hình ảnh AI sinh ngẫu nhiên, không clone giọng người thật.

## 9. Lô video hoạt hình 3D v2 sản xuất hoàn chỉnh — B21–B25 (2026-11-10)

Toàn bộ 5 bài B21–B25 đã được nâng cấp lên **video hoạt hình 3D liên tục** ở chuẩn 1920×1080, 30 fps, H.264 (`yuv420p`, `+faststart`), âm thanh AAC 48 kHz mono (VieNeu-TTS v3 Turbo · Kim Thanh · seed 21 · chuẩn hóa `-18 LUFS / -1,9 dBTP`), bảng màu SGU (`#1b2a72 → #0a1230`, điểm nhấn `#43c4ec`), kèm ảnh bìa `.jpg` và phụ đề `.vi.vtt`, xuất bản đồng thời tại cả `public/videos/nuclear-lessons/` và `public/videos/nuclear-lessons-v2/` (bản cũ sao lưu tại `tmp/nuclear-voice/backups/`):

| Bài | Tệp MP4 (`nuclear-lessons` & `nuclear-lessons-v2`) | Thời lượng | Số khung (captured / total) | Dung lượng (bytes) | Phụ đề `.vi.vtt` | Ảnh bìa `.jpg` | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| B21 | `b21.mp4` | 89,80 s (1:30) | 1.771 / 2.694 | 7.995.654 (~8,0 MB) | `b21.vi.vtt` (1.488 B) | `b21.jpg` (270.342 B) | `0b4fdb77ebb3f38165f3d99910dc31acf7cf69578537cb5a9ec0be8810b6982d` |
| B22 | `b22.mp4` | 75,20 s (1:15) | 1.377 / 2.256 | 6.408.049 (~6,4 MB) | `b22.vi.vtt` (1.255 B) | `b22.jpg` (228.615 B) | `bc610f070d4ab3d61b3e69c3600965895bd1c45b44c420abeaabd7731dd64648` |
| B23 | `b23.mp4` | 93,73 s (1:34) | 1.827 / 2.812 | 10.649.370 (~10,6 MB) | `b23.vi.vtt` (1.529 B) | `b23.jpg` (279.116 B) | `d30a7af81dfe6f97dedf5b582f9f975dbf85ffd319fe5cd2769e909acfe1a5c2` |
| B24 | `b24.mp4` | 71,97 s (1:12) | 1.646 / 2.159 | 5.816.768 (~5,8 MB) | `b24.vi.vtt` (1.317 B) | `b24.jpg` (273.684 B) | `c3464da7c91638dbc7bcc7689d43b474c7ec11ccfc5ebdc782e161bbd0793cea` |
| B25 | `b25.mp4` | 76,23 s (1:16) | 1.624 / 2.287 | 5.622.441 (~5,6 MB) | `b25.vi.vtt` (1.244 B) | `b25.jpg` (252.095 B) | `85f0160140237845e64d1e70d64526197d8e93b589549d3fbea4178b8634254f` |

- **Các mô hình hoạt hình 3D trong bộ video**:
  - `B21`: Mặt phẳng tán xạ Rutherford 3D với hạt nhân vàng ${}^{197}\text{Au}$ đa nucleon, vòng đẳng thế Coulomb 3D, màn huỳnh quang ZnS trụ 3D và chùm hạt $\alpha$ (${}^4\text{He}$) tứ diện 3D; mô hình nguyên tử ${}^{12}_6\text{C}$ 3D với 3 quỹ đạo electron nghiêng; mô hình hạt nhân ${}^{13}_6\text{C}$ xoay 3D liên tục; tổng kết so sánh 3 đồng vị Carbon-12, Carbon-13, Carbon-14 xoay 3D.
  - `B22`: Mô hình 3D các nucleon rời rạc kết hợp thành hạt nhân liên kết tỏa năng lượng $E_{\text{lk}} = \Delta m c^2$; mô hình giọt chất lỏng 3D ${}^{235}\text{U} + n \to {}^{236}\text{U}^* \to {}^{95}\text{Y} + {}^{138}\text{I} + 3n$; đối chiếu bảo toàn $A, Z$ với cụm nucleon 3D hai vế; mô phỏng 3D phản ứng nhiệt hạch ${}^2_1\text{H} + {}^3_1\text{H} \to {}^4_2\text{He} + {}^1_0\text{n}$.
  - `B23`: Hai khối mạng tinh thể lập phương 3D ($4\times 4\times 4 = 64$ hạt nhân mẹ) xoay trong không gian và phát tia phóng xạ 3D ngẫu nhiên theo chu kì bán rã $T_A = 20\text{ s}$ và $T_B = 40\text{ s}$; mô hình 3D khả năng đâm xuyên của tia $\alpha, \beta, \gamma$ qua Giấy, Nhôm và Chì.
  - `B24`: Mô hình 3D buồng tâm lò phản ứng hạt nhân với bó thanh nhiên liệu, thanh điều khiển Boron/Cadmium trượt 3D ở 3 mức (`0%`, `50%`, `100%`) kèm đám mây neutron nhân đôi theo hệ số $k$; sơ đồ 3D nhà máy điện PWR với tua-bin 6 cánh quay 3D và máy phát; tổng kết 3D ứng dụng hạt nhân.
  - `B25`: Mô hình 3D ống đếm Geiger–Müller và mẫu phóng xạ phát hạt 3D đồng bộ với đồ thị thực nghiệm 8 mốc Bảng 25.1 SGK tr. 121; tổng kết 3D liên kết cấu trúc hạt nhân, định luật phân rã và điều khiển lò phản ứng.
- **Kiểm định kỹ thuật & trực quan**: Toàn bộ 5 tệp đã giải mã khung hình kiểm tra (`start.jpg`, `middle.jpg`, `end.jpg`, `shot-*`, `caption-*`) và đối chiếu metadata trong `tmp/nuclear-voice/review/b21..b25/metadata.json`.
- **Tích hợp website**: Đã nối vào cả 5 trang bài học `/hoc-lieu/phong-hat-nhan?bai=B21..B25` và `/hoc-lieu/phong-hat-nhan-v2?bai=B21..B25`.
- **Sao lưu**: Các bản video cũ được sao lưu tự động trong `tmp/nuclear-voice/backups/`.
- **Chưa xác minh**: Quyền sử dụng hai video ngoài phạm vi B21–B25 (`evolution-atomic-model.mp4`, `5-types-chemical-bonds.mp4`).
