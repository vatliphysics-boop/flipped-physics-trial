# Kiểm chứng video B21–B25 có lời đọc

Ngày 06/11/2026, năm video dưới đây đã được thay vào website cục bộ. Tất cả dùng H.264 1920 × 1080, 30 fps và AAC mono 48 kHz. Giọng tổng hợp là Kim Thanh, preset của VieNeu-TTS v3 Turbo. [Metadata và SHA-256 của tệp đang phục vụ](previews/narrated-videos/asset-metadata.json)

| Bài | MP4 | Số khung | Đoạn phụ đề | AAC, LUFS | Đỉnh thực AAC, dBTP | Ảnh đầu, giữa, cuối và chuyển cảnh |
| --- | --- | --- | --- | --- | --- | --- |
| B21 | [89,800 s](../public/videos/nuclear-lessons/b21.mp4) | 2.694 | 12 | −18,04 | −1,95 | [B21](previews/narrated-videos/b21-overview-transitions.jpg) |
| B22 | [75,200 s](../public/videos/nuclear-lessons/b22.mp4) | 2.256 | 10 | −18,04 | −1,84 | [B22](previews/narrated-videos/b22-overview-transitions.jpg) |
| B23 | [93,733 s](../public/videos/nuclear-lessons/b23.mp4) | 2.812 | 11 | −18,05 | −1,92 | [B23](previews/narrated-videos/b23-overview-transitions.jpg) |
| B24 | [71,967 s](../public/videos/nuclear-lessons/b24.mp4) | 2.159 | 10 | −18,05 | −1,95 | [B24](previews/narrated-videos/b24-overview-transitions.jpg) |
| B25 | [76,233 s](../public/videos/nuclear-lessons/b25.mp4) | 2.287 | 10 | −18,06 | −1,94 | [B25](previews/narrated-videos/b25-overview-transitions.jpg) |

Các SHA-256 của MP4 công khai trùng với bản xuất đã giải mã, báo cáo tín hiệu và bảng ảnh kiểm tra độc lập. Đã kiểm tra số khung, codec, thời lượng, mốc AAC bắt đầu bằng 0, phụ đề và ảnh trích trực tiếp từ MP4. Trong đoạn diễn biến, Remotion tính từng khung ở 30 fps. Hình kết quả được giữ để đọc. Phép kiểm theo cặp khung chẵn/lẻ xác nhận có thay đổi hình trong các cửa sổ chuyển động đã chọn. [Kết quả giải mã và chuyển động](previews/narrated-videos/export-verification.json)

PCM tổng được chuẩn hóa theo mục tiêu −18 LUFS và −2 dBTP. Đo lại AAC trong MP4 cho các giá trị ở bảng, tương quan với PCM tổng trên 0,9996 và không có clipping. Mỗi khoảng phụ đề đều có tín hiệu lời đọc. [Báo cáo âm thanh có hash](previews/narrated-videos/media-signal-report.json), [dạng sóng từ MP4 đang phục vụ](previews/narrated-videos/waveforms.png)

Chrome 156 trên bản production cục bộ cổng 3476 đạt **20/20 trường hợp**, gồm năm bài trên trang công khai và cửa sổ giáo viên xem trước, ở 1366 và 390 px. Đã phát tín hiệu âm thanh giải mã có RMS dương, tạm dừng, đổi âm lượng, tắt tiếng, tua giữa và gần cuối rồi phát tiếp, tải đúng số đoạn VTT và kiểm tra thời lượng. Video chờ thao tác mới tải MP4 và phát. Yêu cầu byte-range trên trang công khai trả 206, đủ 1.000 byte và cache yêu cầu kiểm tra lại. Xem trước không phát sinh POST/PUT/PATCH/DELETE sau khi đăng nhập. [Báo cáo trình duyệt](previews/narrated-videos/browser-report.json), [nhật kí 20 trường hợp](previews/narrated-videos/browser-audio-release.log)

Ảnh giao diện thực tế gồm [trang công khai 1366 px](previews/narrated-videos/public-b21-1366.png), [trang công khai 390 px](previews/narrated-videos/public-b21-390.png), [giáo viên xem trước 1366 px](previews/narrated-videos/teacher-preview-b25-1366.png) và [giáo viên xem trước 390 px](previews/narrated-videos/teacher-preview-b25-390.png).

Lời đọc được rà bằng phiên âm của TTS, ASR 26 cảnh và lượt ASR bổ sung trên 10 cảnh sau khi sửa 13 câu chứa thuật ngữ. Thử A/B cùng giọng và seed xác định cách viết tách âm gây thừa âm tiết. Đã chuyển các từ liên quan sang `proton`, `neutron`, `nucleon` và căn lại thời lượng. Bản ASR gốc không ghi hash lúc chạy; mười bản chép chạy lại có hash khớp WAV cảnh hiện tại. [Các bản chép và nguồn từng lượt](previews/narrated-videos/scene-asr-final.json), [ASR thử A/B](previews/narrated-videos/term-asr-comparison.jsonl), [kiểm tra phiên âm](previews/narrated-videos/phoneme-full-audit.log), [tên nguyên tố](previews/narrated-videos/element-phoneme-audit.log)

**Chưa có lượt nghe trực tiếp bằng tai trong phiên này.** Công cụ âm thanh báo không hỗ trợ đầu vào nghe. ASR và phân tích tín hiệu giúp kiểm tra nội dung, đồng bộ và lỗi phiên âm, còn độ tự nhiên của toàn bộ lời đọc cần được người nghe đánh giá. Quyền dùng âm thanh từ preset trong video được tác giả mô hình xác nhận. [Phương pháp và giới hạn lời đọc](../scripts/nuclear-videos/voice/QUALITY.md), [điều khoản VieNeu](https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo#usage-rights--licensing-faq)

Nội dung và tiến trình dùng chung kernel với website cho tán xạ, phân hạch, phân rã, lò áp lực và Bảng 25.1. Phạm vi SGK dựa trên bản mẫu Kết nối tri thức tháng 01/2024 trong workspace. Lệnh tổng hợp, dựng lại, kiểm tra và thay các tệp cục bộ được giữ cùng nguồn. [Kịch bản lời đọc](../scripts/nuclear-videos/NARRATION.vi.md), [hướng dẫn dựng lại](../scripts/nuclear-videos/README.md), [đối chiếu SGK và đề cương](SGK_RESEARCH_WEB_MATRIX.md)
