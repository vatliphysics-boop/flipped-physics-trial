#!/usr/bin/env python3
"""Synthesize reusable utterances, then align captions/scenes to measured PCM.

Run with the same isolated Python environment as synthesize.py. No network
service, credentials, time stretching, or website/database changes are used.
"""
import argparse
import hashlib
import json
import math
import subprocess
import sys
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
FPS, RATE = 30, 48000
SAMPLES_PER_FRAME = RATE // FPS


def read_pcm(file):
    with wave.open(str(file), "rb") as reader:
        if (reader.getnchannels(), reader.getsampwidth(), reader.getframerate()) != (1, 2, RATE):
            raise ValueError(f"Expected mono PCM16/{RATE} Hz: {file}")
        return reader.readframes(reader.getnframes())


def write_pcm(file, pcm):
    file.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(file), "wb") as writer:
        writer.setparams((1, 2, RATE, 0, "NONE", "not compressed"))
        writer.writeframes(pcm)


def silence(frames):
    return bytes(frames * SAMPLES_PER_FRAME * 2)


def align_lesson(scenes, clip_files):
    """No cut speech; each clip has a short caption tail and an observation gap."""
    pcm, plan = bytearray(), []
    for scene in scenes:
        cursor, data, cues = 15, bytearray(silence(15)), []
        for index, utterance in enumerate(scene["utterances"]):
            file = clip_files[(scene["sceneIndex"], index)]
            clip = read_pcm(file)
            clip_frames = math.ceil(len(clip) / 2 / SAMPLES_PER_FRAME)
            if not clip_frames:
                raise ValueError(f"Empty audio: {file}")
            # At least 1.2 s per caption, six extra frames after speech, then
            # three empty frames. Longer silence is reserved for scene changes.
            caption_frames = max(36, clip_frames + 6)
            cues.append({"from": cursor, "duration": caption_frames,
                         "text": utterance["display"], "spoken": utterance["spoken"],
                         "audioFile": str(file), "speechFrames": clip_frames})
            data.extend(clip)
            data.extend(bytes((caption_frames + 3) * SAMPLES_PER_FRAME * 2 - len(clip)))
            cursor += caption_frames + 3
        data.extend(silence(21))
        cursor += 21
        plan.append({"sceneIndex": scene["sceneIndex"], "durationFrames": cursor, "cues": cues})
        pcm.extend(data)
    return bytes(pcm), plan


def normalize(ffmpeg, raw, target, expected_samples):
    prefix = [ffmpeg, "-hide_banner", "-nostdin", "-y", "-i", str(raw)]
    measured = subprocess.run(prefix + ["-af", "loudnorm=I=-18:TP=-2:LRA=7:print_format=json",
                                      "-f", "null", "-"], capture_output=True, text=True, check=True)
    info = json.JSONDecoder().raw_decode(measured.stderr[measured.stderr.rfind("{"):])[0]
    if not math.isfinite(float(info["input_i"])):
        raise ValueError("Narration contains no measurable speech")
    filt = ("loudnorm=I=-18:TP=-2:LRA=7:linear=true:" +
            ":".join(f"{out}={info[key]}" for out, key in [
                ("measured_I", "input_i"), ("measured_TP", "input_tp"),
                ("measured_LRA", "input_lra"), ("measured_thresh", "input_thresh"),
                ("offset", "target_offset")]))
    subprocess.run(prefix + ["-af", filt, "-ar", str(RATE), "-ac", "1", "-c:a", "pcm_s16le", str(target)],
                   capture_output=True, check=True)
    normalized = read_pcm(target)
    # Loudness processing is not allowed to change the timeline.
    if abs(len(normalized) // 2 - expected_samples) > SAMPLES_PER_FRAME:
        raise ValueError("Loudness normalization changed audio duration")
    normalized = normalized[:expected_samples * 2].ljust(expected_samples * 2, b"\0")
    write_pcm(target, normalized)
    return normalized, info


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("codes", nargs="*", default=["B21", "B22", "B23", "B24", "B25"])
    parser.add_argument("--source", type=Path, default=HERE.parent / "narration.vi.json")
    parser.add_argument("--output", type=Path, default=HERE / "generated")
    parser.add_argument("--timing", type=Path, default=ROOT / "tmp/nuclear-voice/narration-timing.json")
    parser.add_argument("--ffmpeg", required=True)
    parser.add_argument("--voice", default="Kim Thanh")
    args = parser.parse_args()
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    source = json.loads(args.source.read_text())
    timing = json.loads(args.timing.read_text()) if args.timing.exists() else {"fps": FPS, "lessons": {}}
    batch, all_files = [], {}
    for code in args.codes:
        files = {}
        for scene in source["lessons"][code]:
            for index, utterance in enumerate(scene["utterances"]):
                spoken = utterance["spoken"].strip()
                if "\\" in spoken or "^" in spoken or "_" in spoken:
                    raise ValueError(f"Unexpanded math in {code}/{scene['sceneIndex']}/{index}")
                digest = hashlib.sha256((args.voice + "\n" + spoken).encode()).hexdigest()[:12]
                name = f"scene-{scene['sceneIndex'] + 1:02}-sentence-{index + 1:02}-{digest}"
                folder = output / code.lower() / "utterances"
                folder.mkdir(parents=True, exist_ok=True)
                text_file, audio_file = folder / f"{name}.txt", folder / f"{name}.wav"
                text_file.write_text(spoken + "\n")
                files[(scene["sceneIndex"], index)] = audio_file
                if not audio_file.exists():
                    batch.append({"textFile": str(text_file), "output": str(audio_file)})
        all_files[code] = files
    batch_path = output / "synthesis-batch.json"
    batch_path.write_text(json.dumps(batch, ensure_ascii=False, indent=2) + "\n")
    if batch:
        subprocess.run([sys.executable, str(HERE / "synthesize.py"), "--batch", str(batch_path),
                        "--voice", args.voice], check=True)
    for code in args.codes:
        raw_pcm, scenes = align_lesson(source["lessons"][code], all_files[code])
        folder = output / code.lower()
        raw, master = folder / "narration-raw.wav", folder / "narration.wav"
        write_pcm(raw, raw_pcm)
        pcm, loudness = normalize(args.ffmpeg, raw, master, len(raw_pcm) // 2)
        offset = 0
        for scene in scenes:
            size = scene["durationFrames"] * SAMPLES_PER_FRAME * 2
            file = folder / f"scene-{scene['sceneIndex'] + 1:02}.wav"
            write_pcm(file, pcm[offset:offset + size])
            scene["audioFile"] = str(file)
            offset += size
        timing["lessons"][code] = {"audioFile": str(master), "scenes": scenes}
        (folder / "alignment.json").write_text(json.dumps({
            "voice": args.voice, "fps": FPS, "sampleRate": RATE, "loudnessTargetLufs": -18,
            "sourceSha256": hashlib.sha256(args.source.read_bytes()).hexdigest(),
            "loudnessBefore": loudness, "scenes": scenes,
        }, ensure_ascii=False, indent=2) + "\n")
        print(f"{code}: {len(pcm) / 2 / RATE:.3f}s, {len(scenes)} scenes, {sum(len(s['cues']) for s in scenes)} captions", flush=True)
    args.timing.parent.mkdir(parents=True, exist_ok=True)
    args.timing.write_text(json.dumps(timing, ensure_ascii=False, indent=2) + "\n")
    print(args.timing, flush=True)


if __name__ == "__main__":
    main()
