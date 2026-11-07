# Tổng hợp lời đọc tiếng Việt cục bộ

Lời đọc tổng hợp bằng VieNeu-TTS v3 Turbo, dùng giọng có sẵn **Kim Thanh** (nữ miền Nam, giọng kể chuyện). Trình tổng hợp chạy ONNX trên CPU và lưu WAV PCM 16-bit mono, 48 kHz. Phần lời đọc do dự án soạn. [Hướng dẫn và danh sách giọng của VieNeu](https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo#preset-voices-23)

Tác giả Phạm Nguyễn Ngọc Bảo phát hành mô hình và các giọng có sẵn theo Apache 2.0. FAQ của tác giả xác nhận quyền dùng âm thanh tạo từ giọng có sẵn trong video, kể cả video thương mại, và xác nhận đã có sự đồng ý của người nói hoặc chủ thể quyền cho việc tạo giọng tổng hợp. Ghi nguồn trong học liệu với nhãn **Giọng đọc tổng hợp · VieNeu-TTS v3 Turbo · Kim Thanh**. [FAQ về quyền sử dụng](https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo#usage-rights--licensing-faq), [mã nguồn VieNeu](https://github.com/pnnbao97/VieNeu-TTS), [codec OpenMOSS](https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX), [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

## Cài và chạy từ thư mục gốc workspace

```sh
uv venv --python 3.11 tmp/nuclear-voice/.venv
uv pip install --python tmp/nuclear-voice/.venv/bin/python -r scripts/nuclear-videos/voice/requirements.txt
tmp/nuclear-voice/.venv/bin/python scripts/nuclear-videos/voice/synthesize.py --prepare
tmp/nuclear-voice/.venv/bin/python scripts/nuclear-videos/voice/synthesize.py \
  --text-file tmp/nuclear-voice/loi-doc.vi.txt --output tmp/nuclear-voice/loi-doc.wav
```

Lần chuẩn bị đầu tiên tải khoảng 560 MB từ hai phiên bản Hugging Face đã ghim trong `model-lock.json` và kiểm tra SHA-256 của từng tệp. Cache riêng mặc định ở `tmp/nuclear-voice/huggingface/hub`. Từ đó, các lần tổng hợp dùng cache ngoại tuyến. Công cụ chỉ dùng giọng có sẵn theo tên `--voice`. Mỗi đoạn dùng `--seed` mặc định 21. Trình phát chỉ cần tệp MP4 được tạo từ WAV, còn môi trường Python và trọng số ở khu vực công cụ cục bộ.

Để tạo nhiều đoạn trong một lần tải mô hình, dùng `--batch tmp/nuclear-voice/loi-doc.json`. Manifest là mảng các đối tượng như bên dưới. Có thể dùng đường dẫn tuyệt đối hoặc đường dẫn tương đối với thư mục chứa manifest.

```json
[
  { "textFile": "b21-00.vi.txt", "output": "b21-00.wav" },
  { "textFile": "b21-12.vi.txt", "output": "b21-12.wav" }
]
```

Nếu chỉnh lời đọc, viết số, kí hiệu và thuật ngữ theo cách phát âm phù hợp, sau đó đo lại độ dài mỗi đoạn trước khi đưa vào cảnh. Seed cố định giữ cách lấy mẫu ổn định trong cùng phiên bản công cụ. Xác nhận các số, tên đồng vị và điểm ngắt sau khi tổng hợp.

Với giọng Kim Thanh, dùng đúng chính tả `proton`, `neutron` và `nucleon` để mô hình Việt–Anh nhận diện thuật ngữ. Thử hai bản cùng câu, giọng và seed. Bản giữ chính tả chuẩn được máy nhận dạng đúng cả ba thuật ngữ và các số 6, 6, 12. Cách viết tách âm làm xuất hiện âm tiết thừa trong đầu vào phiên âm của bộ tổng hợp. Các cách viết rõ chữ cái và đơn vị đã kiểm tra được giữ trong `narration.vi.json`.

## Kiểm tra âm thanh

Môi trường tổng hợp đi kèm bản FFmpeg có bộ lọc EBU R128 `loudnorm` để chuẩn hóa lời đọc. Lấy đường dẫn executable khi lệnh ghép lời đọc cần tham số `--ffmpeg`. [FFmpeg loudnorm](https://ffmpeg.org/ffmpeg-filters.html#loudnorm), [imageio-ffmpeg](https://pypi.org/project/imageio-ffmpeg/0.6.0/)

```sh
tmp/nuclear-voice/.venv/bin/python -c 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'
```

Có thể đối chiếu lại số liệu và thuật ngữ bằng nhận dạng giọng nói cục bộ. Lần đầu tải mô hình Whisper nhỏ vào `tmp/nuclear-voice/asr-models`, khoảng 460 MB. Sau đó dùng `--offline`. Bản chép tự động có thể nhận sai cách viết thuật ngữ và cần đối chiếu lại với lời đọc. [Faster Whisper](https://github.com/SYSTRAN/faster-whisper)

```sh
uv venv --python 3.11 tmp/nuclear-voice/.qa-venv
uv pip install --python tmp/nuclear-voice/.qa-venv/bin/python faster-whisper==1.2.1
tmp/nuclear-voice/.qa-venv/bin/python scripts/nuclear-videos/voice/transcribe.py \
  tmp/nuclear-voice/samples/b21-00-vieneu.wav
```

Mẫu B21 đã tạo dài 10,08 giây, giữ đủ ba câu và số 12 trong bản chép tự động. Hai lần chạy độc lập bằng chế độ một tệp và chế độ hàng loạt cho cùng SHA-256. Bản chép là phép kiểm tra máy, và mô tả này chỉ ghi các kết quả đã đo.
