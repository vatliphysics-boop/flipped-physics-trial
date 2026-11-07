# Kiểm tra lời đọc và đồng bộ

Giọng tổng hợp: **Kim Thanh**, preset của VieNeu-TTS v3 Turbo, SDK 3.8.3, seed 21, ONNX CPU. Không dùng bản ghi giọng tham chiếu của cá nhân. Tệp nói và câu phụ đề nằm riêng trong `../narration.vi.json`. Phiên bản, quyền sử dụng, checksum mô hình và lệnh chuẩn bị ở [README](README.md).

## Những gì đã kiểm tra

- Tạo mẫu B21 có số hạt và thuật ngữ trước khi chạy năm bài. Lời đọc từng câu được đo từ WAV 48 kHz, căn vào lưới 30 fps, thêm khoảng ngắt giữa câu và cảnh. Không kéo nhanh giọng để ép về thời lượng bản cũ.
- Phân tích âm lượng theo hai lượt loudnorm, mục tiêu −18 LUFS và −2 dBTP cho PCM. Kênh AAC có thể chênh nhỏ do mã hóa; phép kiểm cuối yêu cầu không clipping, peak dưới −1 dBTP, âm lượng trong 0,6 LU của mục tiêu. Không có nhạc nền.
- ASR cục bộ bằng faster-whisper `small`, tiếng Việt, chạy trên toàn bộ 26 WAV cảnh. Phần ASR là kiểm tra tự động nội dung nghe được bởi mô hình nhận dạng, không phải một người đã nghe.
- Kết quả ban đầu giúp phát hiện cách viết tách âm `prô tôn` và `nu clê ôn` bị bộ phiên âm của TTS chèn thêm âm. Đã kiểm tra trực tiếp đầu ra phiên âm của SDK và tạo thử A/B cùng giọng, seed. Cách viết chuẩn `proton`, `neutron`, `nucleon` được bộ đọc Việt–Anh xử lí đúng cấu trúc thuật ngữ; mẫu A/B được ASR nhận đủ ba từ và các số 6, 6, 12.
- Đã tạo lại 13 câu liên quan ở B21/B22/B24 và chạy lại ASR trên 10 cảnh bị ảnh hưởng. Kí hiệu, số liệu chính và ý nghĩa câu được đối chiếu lại với nguồn. Bộ phiên âm cũng đã được kiểm tra cho tên nguyên tố, đồng vị, đơn vị MeV/fm/Bq và A/Z/N/H/T/λ đang dùng. Số liệu B23/B25 và lời nói của hai bài đó giữ nguyên.
- Âm thanh giải mã trực tiếp từ MP4 được so với WAV tổng đã căn thời gian. Kiểm tra tương quan, thời lượng, khoảng yên lặng, âm lượng, peak và mỗi vùng có phụ đề. Báo cáo lưu kèm SHA-256 của MP4 để tránh dùng kết quả kiểm tra của bản cũ.

## Giới hạn phải giữ khi bàn giao

**Chưa có lượt nghe trực tiếp bằng tai trong phiên làm việc này.** Công cụ hiển thị trả về “audio content omitted because you do not support audio input”. Không dùng kết quả FFprobe, tín hiệu âm thanh hay ASR để tuyên bố đã nghe hoặc bảo đảm mọi phát âm tự nhiên. ASR còn có lỗi chữ và thuật ngữ, chẳng hạn nhầm từ tương tự hoặc ghi sai kí hiệu đơn vị; các lỗi đó không tự chứng minh âm thanh nói sai. Những lỗi phiên âm xác định được đã được sửa như trên.

Giọng miền Nam có các đặc điểm phát âm vùng miền. Mẫu có quyền sử dụng theo xác nhận của tác giả VieNeu; không tự trình bày đây là giọng của giáo viên, diễn giả hoặc người thật cụ thể.

## Bằng chứng và tái kiểm tra

- `tmp/nuclear-voice/term-check/`: WAV A/B, lời đưa vào bộ đọc và ASR đối chiếu.
- `tmp/nuclear-voice/phoneme-full-audit.log`, `element-phoneme-audit.log`: kiểm tra phiên âm thuật ngữ và tên nguyên tố.
- `tmp/nuclear-voice/process-asr-scenes.jsonl`: lượt ASR 26 cảnh ban đầu.
- `tmp/nuclear-voice/process-asr-canonical.jsonl`: 10 cảnh sau khi sửa thuật ngữ.
- `tmp/nuclear-voice/media-signal-report.json`: phân tích âm thanh MP4 cuối và SHA-256.
- `tmp/nuclear-voice/process-review-final/<bài>/`: metadata, khung trích từ MP4, bảng ảnh và phép kiểm chuyển động 30 fps.

```sh
tmp/nuclear-voice/.qa-venv/bin/python scripts/nuclear-videos/voice/transcribe.py \
  --offline --threads 2 scripts/nuclear-videos/voice/generated/b2*/scene-[0-9][0-9].wav
tmp/nuclear-voice/.venv/bin/python scripts/nuclear-videos/voice/verify_media.py
```

Âm thanh nguồn từng cảnh và từng câu được giữ trong `voice/generated/`. Thư mục đó và model cache là đầu ra tạo lại được, được bỏ qua bởi Git; cần sao lưu cùng workspace khi chuyển máy, hoặc chạy lại từ kịch bản và model đã ghim. Website chỉ tải MP4/JPG/VTT, không tải bộ đọc, mô hình AI hoặc WAV trung gian.
