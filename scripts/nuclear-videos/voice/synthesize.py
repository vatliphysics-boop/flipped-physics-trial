"""Generate local narration WAVs with the built-in VieNeu-TTS v3 Turbo voices."""

import argparse
import hashlib
import json
import os
import shutil
import tempfile
from pathlib import Path


HERE = Path(__file__).resolve().parent
WORKSPACE = HERE.parents[2]
DEFAULT_CACHE = WORKSPACE / "tmp/nuclear-voice/huggingface/hub"


def prepare(cache: Path) -> None:
    from huggingface_hub import hf_hub_download

    sources = json.loads((HERE / "model-lock.json").read_text(encoding="utf-8"))
    for source in sources:
        repo = source["repo"]
        revision = source["revision"]
        for name, expected_hash in source["files"].items():
            print(f"Kiểm tra {repo}/{name}", flush=True)
            asset = Path(hf_hub_download(repo, name, revision=revision, cache_dir=cache))
            with asset.open("rb") as stream:
                actual_hash = hashlib.file_digest(stream, "sha256").hexdigest()
            if actual_hash != expected_hash:
                raise RuntimeError(f"SHA-256 không khớp: {asset}")
            if asset.is_symlink():
                # ONNX external tensors must resolve inside the graph directory.
                # Keep verified graph/data files in one real snapshot directory.
                with tempfile.TemporaryDirectory(dir=asset.parent) as folder:
                    materialized = Path(folder) / asset.name
                    try:
                        os.link(asset.resolve(), materialized)
                    except OSError:
                        shutil.copyfile(asset, materialized)
                    materialized.replace(asset)

        # The SDK asks for main. Set that ref in this dedicated local cache so
        # offline synthesis uses the exact snapshot just verified.
        ref = cache / f"models--{repo.replace('/', '--')}" / "refs/main"
        ref.parent.mkdir(parents=True, exist_ok=True)
        ref.write_text(revision, encoding="ascii")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--prepare", action="store_true", help="Tải và kiểm tra mô hình đã ghim.")
    mode.add_argument("--text-file", type=Path, help="Tệp lời đọc UTF-8.")
    mode.add_argument("--batch", type=Path, help="Danh sách JSON {textFile, output}.")
    parser.add_argument("--output", type=Path, help="Đường dẫn WAV cho --text-file.")
    parser.add_argument("--voice", default="Kim Thanh", help="Tên giọng có sẵn trong VieNeu.")
    parser.add_argument("--seed", type=int, default=21, help="Seed lấy mẫu cho mỗi đoạn.")
    parser.add_argument("--cache-dir", type=Path, default=DEFAULT_CACHE, help="Cache riêng của công cụ.")
    args = parser.parse_args()

    if (args.text_file is None) != (args.output is None):
        parser.error("Dùng --text-file và --output cùng nhau.")
    if not 0 <= args.seed < 2**32:
        parser.error("--seed phải trong khoảng 0 đến 2^32 − 1.")

    cache = args.cache_dir.resolve()
    os.environ["HF_HUB_CACHE"] = str(cache)
    os.environ["HF_HUB_DISABLE_TELEMETRY"] = "1"
    os.environ["HF_HUB_DISABLE_IMPLICIT_TOKEN"] = "1"
    if args.prepare:
        prepare(cache)
        return

    if args.batch:
        batch_dir = args.batch.resolve().parent
        entries = json.loads(args.batch.read_text(encoding="utf-8"))
        jobs = [(batch_dir / entry["textFile"], batch_dir / entry["output"]) for entry in entries]
    else:
        jobs = [(args.text_file, args.output)]
    if not jobs or any(output.suffix.lower() != ".wav" for _, output in jobs):
        parser.error("Cần ít nhất một đoạn. Mỗi đầu ra phải có đuôi .wav.")

    os.environ["HF_HUB_OFFLINE"] = "1"
    import numpy as np
    import soundfile as sf
    from vieneu import Vieneu

    tts = Vieneu(device="cpu", backend="onnx", threads=4)
    if args.voice not in {voice_id for _, voice_id in tts.list_preset_voices()}:
        parser.error(f"Giọng {args.voice} không có trong danh sách giọng có sẵn.")

    for text_file, output in jobs:
        text = text_file.read_text(encoding="utf-8").strip()
        if not text:
            raise ValueError(f"Lời đọc trống: {text_file}")
        np.random.seed(args.seed)
        audio = tts.infer(text, voice=args.voice)
        if audio.ndim != 1 or not audio.size or not np.isfinite(audio).all() or not np.any(audio):
            raise RuntimeError(f"Mô hình không tạo lời đọc hợp lệ cho {text_file}")

        output.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(suffix=".wav", dir=output.parent, delete=False) as stream:
            temp_output = Path(stream.name)
        try:
            sf.write(temp_output, audio, tts.sample_rate, subtype="PCM_16")
            temp_output.replace(output)
        finally:
            temp_output.unlink(missing_ok=True)
        print(f"{output} · {audio.size / tts.sample_rate:.2f} s · {tts.sample_rate} Hz", flush=True)


if __name__ == "__main__":
    main()
