# Video Vật lí hạt nhân 12

Các video dạy học B21–B25 dùng công thức, phụ đề và giọng đọc tổng hợp tiếng Việt. Mã dựng, ảnh nháp và mô hình giọng đọc nằm ngoài runtime. Website phục vụ MP4, ảnh bìa và VTT trong `public/videos/nuclear-lessons`. Bảng ghi các bản tiến trình có thuyết minh đã kiểm tra và tích hợp vào website cục bộ.

| Bài | Thời lượng MP4 | Video | Nội dung trọng tâm |
| --- | --- | --- | --- |
| B21 | 89,800 giây | [b21.mp4](../../public/videos/nuclear-lessons/b21.mp4) | Hai lượt tán xạ alpha và diễn giải kí hiệu hạt nhân |
| B22 | 75,200 giây | [b22.mp4](../../public/videos/nuclear-lessons/b22.mp4) | Phân hạch cảm ứng có hoặc không có neutron tới, bảo toàn và năng lượng của kênh |
| B23 | 93,733 giây | [b23.mp4](../../public/videos/nuclear-lessons/b23.mp4) | Mẫu ngẫu nhiên, đổi chu kì, đối chiếu kì vọng và độ phóng xạ |
| B24 | 71,967 giây | [b24.mp4](../../public/videos/nuclear-lessons/b24.mp4) | Ba mức thanh điều khiển, phản ứng dây chuyền và hai vòng nước PWR |
| B25 | 76,233 giây | [b25.mp4](../../public/videos/nuclear-lessons/b25.mp4) | Giữ dữ liệu Bảng 25.1, so hai đường thử và ước lượng chu kì |

## Cách sửa và render lại

Yêu cầu Node.js 22 trở lên. Để Remotion dùng Chrome Headless Shell đi kèm phiên bản renderer. Chrome hệ thống từng tạo một số khung lỗi ô ảnh trên macOS. FFmpeg và FFprobe đi kèm Remotion. Có thể đặt `FFMPEG_PATH`, `FFPROBE_PATH`, `REMOTION_CONCURRENCY` hoặc một cổng rảnh qua `REMOTION_PORT` cho máy cụ thể.

```bash
npm ci --prefix scripts/nuclear-videos
npm --prefix scripts/nuclear-videos run check
npm --prefix scripts/nuclear-videos run render -- B21 --draft
npm --prefix scripts/nuclear-videos run render -- B21
npm --prefix scripts/nuclear-videos run render -- B22 B23 B24 B25 --draft
npm --prefix scripts/nuclear-videos run render -- B22 B23 B24 B25
```

- `storyboards.mjs` chứa các cảnh và phụ đề. [narration.vi.json](narration.vi.json) chứa phụ đề và lời phát âm. [NARRATION.vi.md](NARRATION.vi.md) trình bày bản đọc theo thứ tự cảnh.
- `film.jsx` và `film.css` dựng bố cục, góc quan sát hạt nhân và công thức KaTeX. `process-visuals.jsx` đọc cùng kernel với web để diễn biến tán xạ, phân hạch, phân rã, dây chuyền PWR và mô hình đối chiếu Bảng 25.1 theo thời gian. Cảnh đồng vị dùng chung `nucleus-layout.ts` và `nuclear-science.ts`.
- Cảnh không lời đọc dài 12 giây. Bản có giọng căn thời lượng theo WAV. Remotion dựng đủ 30 khung mỗi giây trong suốt diễn biến. Hình được giữ sau khi có kết quả để đọc, và được dựng thêm tại mốc đổi phụ đề. FFmpeg mã hóa H.264 1920 × 1080 ở 30 fps, pixel format yuv420p, đặt chỉ mục MP4 ở đầu để bắt đầu phát sớm. FFprobe xác minh số khung, codec và kích thước trước khi thay tệp.
- `--draft` chỉ render ảnh kiểm tra. Render đầy đủ kiểm tra thông số và trích từ MP4 khung đầu, giữa, cuối cùng các cảnh đã ổn định. Ảnh, metadata và tệp tạm nằm trong `tmp/nuclear-video-review`.
- Phụ đề có sẵn trong hình và được xuất riêng dạng VTT. Bản có lời dùng giọng tổng hợp tiếng Việt chạy cục bộ. [Thiết lập và điều khoản giọng đọc](voice/README.md)

### Dựng bản có lời đọc

Sau khi [cài công cụ giọng đọc và chuẩn bị mô hình](voice/README.md), chạy từ gốc dự án. Có thể truyền nhiều mã bài cho `prepare.py` để dùng chung một lần nạp mô hình.

```bash
ffmpeg_full=$(tmp/nuclear-voice/.venv/bin/python -c 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())')
tmp/nuclear-voice/.venv/bin/python scripts/nuclear-videos/voice/prepare.py B21 \
  --ffmpeg "$ffmpeg_full" --timing tmp/nuclear-voice/process-narration-timing.json
npm --prefix scripts/nuclear-videos run render -- B21 --draft \
  --timing "$PWD/tmp/nuclear-voice/process-narration-timing.json"
FFMPEG_PATH="$ffmpeg_full" npm --prefix scripts/nuclear-videos run render -- B21 \
  --timing "$PWD/tmp/nuclear-voice/process-narration-timing.json"
```

- Manifest ghi thời lượng từng cảnh và mốc bắt đầu, độ dài của từng phụ đề theo khung hình 30 fps. Mỗi bài trỏ tới WAV tổng đã căn với số khung. Remotion và tệp VTT lấy cùng văn bản và mốc từ manifest.
- Mỗi khung chuyển động vẫn được dựng ở 30 fps. Trong đoạn giữ hình, Remotion dựng thêm tại mốc phụ đề xuất hiện hoặc kết thúc. Dãy JPEG có đúng một mục cho mỗi khung xuất nên mốc phụ đề không bị làm tròn do nối các đoạn thời lượng lẻ.
- FFmpeg ghép kênh AAC 48 kHz với H.264 1920 × 1080. Bộ dựng kiểm tra độ dài WAV trước khi dựng, số khung MP4 và mốc đầu/kết thúc của kênh âm thanh sau khi mã hóa.
- MP4, ảnh bìa và VTT được xuất trước vào `tmp/nuclear-voice/rendered`. Các tệp trong thư mục này chỉ đưa vào website sau khi kiểm tra. `--draft` chỉ dựng ảnh. Ảnh giải mã tại các cảnh và các mốc phụ đề, số khung, thông số âm thanh và danh sách phụ đề nằm trong `tmp/nuclear-voice/review`. Có thể chỉ định thư mục khác bằng `--output` và `--qa-dir`.

### Dữ liệu dùng chung với website

| Bài | Kernel và điều kiện trong video |
| --- | --- |
| B21 | `rutherford-model.ts` cho hai lượt alpha động năng xa tâm 8 MeV, tham số va chạm 90 fm và 10 fm. Hai lượt so cùng đồng hồ; góc lệch là góc giữa hai hướng xa tâm. |
| B22 | `fission-model.ts` cho lượt có và không có neutron tới, diễn biến của kênh Y-95/I-138/3 neutron và năng lượng theo khối lượng đã kiểm chứng. |
| B23 | `radioactive-decay-model.ts` cho hai mẫu 64 hạt cùng seed, chu kì 20 và 40 giây. So ở mốc 40 giây, tách số hạt mô phỏng khỏi kì vọng. |
| B24 | `reactor-model.ts` cho các mức cắm quy ước và chỉ số theo thế hệ. Tiến trình truyền năng lượng của lò nước áp lực có đồng hồ minh họa riêng. |
| B25 | `sgk-b25-decay.ts` cho tám điểm SGK, hai đường thử và kết quả nội suy. Các điểm SGK vẫn hiển thị khi đường lí thuyết thay đổi. |

## Bằng chứng bản xuất

`tmp/nuclear-voice/process-review-final/<bài>/metadata.json` ghi codec, kích thước, tốc độ, mốc phụ đề, tổng khung và thông số kênh lời đọc. Ảnh `decoded/` trích trực tiếp từ MP4 tại đầu, giữa, cuối, giữa chuyển động, điểm dừng và mốc phụ đề của mỗi cảnh. `contact.jpg` tập hợp khung kiểm tra. `export-verification.json` ghi kết quả giải mã, đo âm lượng AAC và kiểm tra nhịp chuyển động trên các cặp khung chẵn/lẻ.

Bản lưu bằng chứng gọn nằm trong `docs/previews/narrated-videos`, gồm bảng ảnh năm video, hash, metadata, ASR, dạng sóng và kiểm tra trình duyệt. [Biên bản kiểm chứng bản đã tích hợp](../../docs/NARRATED_VIDEO_VERIFICATION.md)

Tệp lời đọc PCM được chuẩn hóa ở mốc −18 LUFS và −2 dBTP. Các phép đo sau mã hóa AAC có thể chênh nhẹ. `tmp/nuclear-voice/term-check/asr.log` ghi đối chiếu hai cách viết thuật ngữ cùng giọng và seed. Bản chép máy được dùng cùng dữ liệu phiên âm của bộ tổng hợp để rà lời đọc.

Hồ sơ các bản phụ đề từ chặng trước còn ở `tmp/nuclear-video-review`, gồm kiểm tra khung hình và phát trên Chrome cổng 3471.

## Đối chiếu nguồn

- Tên bài và phạm vi đối chiếu bản mẫu SGK Vật lí 12 Kết nối tri thức tháng 01/2024 trong workspace, trang in 91–122. B25 giữ đủ tám cặp số trong Bảng 25.1, trang in 121, và đối chiếu với hai đường lí thuyết có chu kì thử 40 và 60 giây. [OpenStax University Physics 3, Chương 10](https://openstax.org/books/university-physics-volume-3/pages/10-introduction)
- A, Z, N và đồng vị ở trạng thái cơ bản đối chiếu với IAEA. N = A − Z, ba đại lượng đều là số đếm. [IAEA LiveChart of Nuclides](https://nucleus.iaea.org/Pages/livechart-of-nuclides-av.aspx)
- Kênh phân hạch minh họa Y-95/I-138 dùng `fission-model.ts` từ lúc neutron tới đến khi các sản phẩm tách ra. Đường đi và thời gian của cảnh theo quy ước. Số khối, điện tích và năng lượng lấy từ kênh phản ứng dùng chung. [IAEA AME2020](https://www-nds.iaea.org/amdc/ame2020/mass_1.mas20.txt), [U.S. DOE về nhiên liệu tổng hợp đơteri-triti](https://www.energy.gov/science/doe-explainsdeuterium-tritium-fusion-fuel)
- Sơ đồ B24 giới thiệu nguyên lí phát điện và chất đánh dấu chẩn đoán. [IAEA về năng lượng hạt nhân](https://www.iaea.org/newscenter/news/what-is-nuclear-energy-the-science-of-nuclear-power), [IAEA về y học hạt nhân](https://www.iaea.org/topics/nuclear-medicine)
- Quả cầu, màu và vị trí là quy ước. Hạt nhân không theo tỉ lệ kích thước. Góc camera thay đổi, cấu trúc hạt không thay đổi theo frame. Đồ thị quy luật ở B23 biểu diễn giá trị kì vọng. Đồ thị đọc dữ liệu ở B25 dùng các số trong Bảng 25.1.

## Kỹ thuật tham khảo

- Đọc `SKILL.md`, `references/pipeline.md`, card `chart-live-moves` và mã `template/src/aifl/Main.tsx`, `PageCam.tsx`. Áp dụng cách đặt frame bằng `Sequence`, chuyển động có điểm dừng đọc và khung kiểm tra theo cảnh. Hình vẽ và nội dung bài học được viết mới. [video-shotcraft, 1266a3e](https://github.com/Vincentwei1021/video-shotcraft/tree/1266a3e)
- Dựng mô hình bằng mã và giữ bố cục hạt cố định qua các góc. [img2threejs, 0c0c49b](https://github.com/img2threejs/img2threejs/tree/0c0c49b)

## Kiểm tra và thay bộ video đang phục vụ

Sau khi dựng đủ năm bản vào `tmp/nuclear-voice/rendered`, kiểm tra ảnh giải mã và kết quả lời đọc. Chạy từ gốc workspace:

```sh
tmp/nuclear-voice/.venv/bin/python scripts/nuclear-videos/voice/verify_media.py
ffmpeg_full=$(tmp/nuclear-voice/.venv/bin/python -c 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())')
FFMPEG_PATH="$ffmpeg_full" node scripts/nuclear-videos/publish-narrated.mjs
```

Lệnh cuối kiểm tra SHA-256 từ báo cáo âm thanh, codec, thời lượng, số khung, VTT và giải mã đủ năm video trước khi chạm tới tệp đang phục vụ. Bản cũ được sao lưu ở `tmp/nuclear-voice/backups/<mốc-thời-gian>/`. Chỉ sau khi tất cả đạt, MP4/JPG/VTT mới được thay và `src/data/nuclear-video-metadata.json` được ghi. Build lại website sau khi metadata đổi.

Chạy render không truyền `--timing` chỉ tạo bản dựng nháp không có lời vào `tmp/nuclear-video-review/rendered-silent`, không tự ghi đè video website. Không dùng bản đó làm học liệu có thuyết minh.

[Phương pháp kiểm tra lời đọc, lỗi phiên âm đã sửa và giới hạn nghe trực tiếp](voice/QUALITY.md). Nguồn WAV từng câu/cảnh trong `voice/generated/` được giữ cục bộ và có thể tái tạo; thư mục này cùng model cache không nằm trong runtime website.
