"""Transcribe local lesson audio for Vietnamese narration checks."""

import argparse
import hashlib
import json
import os
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("files", nargs="+", type=Path, help="Tệp WAV hoặc MP4 cục bộ.")
    parser.add_argument("--offline", action="store_true", help="Chỉ dùng model đã tải.")
    parser.add_argument("--threads", type=int, default=2, help="Luồng CPU, giữ nhẹ khi dựng video.")
    args = parser.parse_args()

    os.environ["HF_HUB_DISABLE_TELEMETRY"] = "1"
    os.environ["HF_HUB_DISABLE_IMPLICIT_TOKEN"] = "1"
    from faster_whisper import WhisperModel

    workspace = Path(__file__).resolve().parents[3]
    model = WhisperModel(
        "small", device="cpu", compute_type="int8", cpu_threads=args.threads,
        download_root=str(workspace / "tmp/nuclear-voice/asr-models"),
        local_files_only=args.offline,
    )
    for file in args.files:
        clips, info = model.transcribe(str(file), language="vi", beam_size=5, condition_on_previous_text=False)
        result = {"file": str(file), "sha256": hashlib.sha256(file.read_bytes()).hexdigest(), "seconds": info.duration, "segments": [
            {"start": round(clip.start, 3), "end": round(clip.end, 3), "text": clip.text.strip()}
            for clip in clips
        ]}
        print(json.dumps(result, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
