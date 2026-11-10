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

## 9. Lô video v2 sản xuất hoàn chỉnh — B21–B25 (2026-11-10)

Toàn bộ 5 bài B21–B25 đã được render đầy đủ ở chuẩn 1920×1080, 30 fps, H.264 (`yuv420p`, `+faststart`), âm thanh AAC 48 kHz mono (VieNeu-TTS v3 Turbo · Kim Thanh · seed 21 · chuẩn hóa `-18 LUFS / -1,9 dBTP`), bảng màu SGU (`#1b2a72 → #0a1230`, điểm nhấn `#43c4ec`), kèm ảnh bìa `.jpg` và phụ đề `.vi.vtt` tại `public/videos/nuclear-lessons-v2/`:

| Bài | Tệp MP4 (`public/videos/nuclear-lessons-v2/`) | Thời lượng | Số khung (30 fps) | Dung lượng (bytes) | Phụ đề `.vi.vtt` | Ảnh bìa `.jpg` | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| B21 | `b21.mp4` | 89,80 s (1:30) | 2.694 (829 motion) | 4.704.059 (~4,5 MB) | `b21.vi.vtt` (1.488 B) | `b21.jpg` (245.850 B) | `1e89a3e00c1fc5825c4c907072e6b0005c43a7e10c813281ba51806c95a054ff` |
| B22 | `b22.mp4` | 75,20 s (1:15) | 2.256 (485 motion) | 3.836.871 (~3,7 MB) | `b22.vi.vtt` (1.255 B) | `b22.jpg` (189.630 B) | `e1d6dacb34d90e8e4d1cf7e4159836f2f0e2e97af1ee37fde0215977ed90152e` |
| B23 | `b23.mp4` | 93,73 s (1:34) | 2.812 (828 motion) | 4.878.234 (~4,7 MB) | `b23.vi.vtt` (1.529 B) | `b23.jpg` (287.562 B) | `1ed298e3399361b8cb00bb5ebc5e9fbb1b3e6b3874bb67026f48b5bab9f834f4` |
| B24 | `b24.mp4` | 71,97 s (1:12) | 2.159 (1.122 motion) | 3.896.582 (~3,7 MB) | `b24.vi.vtt` (1.317 B) | `b24.jpg` (245.687 B) | `9376807dfe68160e4375205237a91bdb5ad2523e013b5545fdf51734a673e4ae` |
| B25 | `b25.mp4` | 76,23 s (1:16) | 2.287 (952 motion) | 4.329.816 (~4,1 MB) | `b25.vi.vtt` (1.244 B) | `b25.jpg` (228.531 B) | `bc524060233a375044bc75cd35ddddcc313714677e36ae03d8183b4a14f4b0cb` |

- **Kiểm định kỹ thuật & trực quan**: Toàn bộ 5 tệp đã giải mã khung hình kiểm tra (`start.jpg`, `middle.jpg`, `end.jpg`, `shot-*`, `caption-*`) và đối chiếu metadata trong `tmp/nuclear-voice/review/b21..b25/metadata.json`.
- **Tích hợp website**: Đã nối vào 5 trang bài học `B21Lesson`–`B25Lesson` trên route `/hoc-lieu/phong-hat-nhan-v2?bai=B21..B25`.
- **Video cũ**: Giữ nguyên bản v1 trong `public/videos/nuclear-lessons/b21..b25.mp4` để bảo toàn khả năng đối chiếu và khôi phục.
- **Chưa xác minh**: Quyền sử dụng hai video ngoài phạm vi B21–B25 (`evolution-atomic-model.mp4`, `5-types-chemical-bonds.mp4`).
