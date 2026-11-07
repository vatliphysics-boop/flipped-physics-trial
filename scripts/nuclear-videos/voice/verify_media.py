#!/usr/bin/env python3
"""Inspect actual MP4 audio, compare it with the aligned master, and save evidence.

This measures digital signals. It is not a listening or pronunciation assessment.
"""
import argparse
import hashlib
import json
import subprocess
import wave
from pathlib import Path
import numpy as np
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[3]


def measure(ffmpeg, file):
    process = subprocess.run([ffmpeg, "-hide_banner", "-nostdin", "-i", str(file), "-vn", "-af",
                              "loudnorm=I=-18:TP=-2:LRA=7:print_format=json", "-f", "null", "-"],
                             capture_output=True, text=True, check=True)
    return json.JSONDecoder().raw_decode(process.stderr[process.stderr.rfind("{"):])[0]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("codes", nargs="*", default=["B21", "B22", "B23", "B24", "B25"])
    parser.add_argument("--input", type=Path, default=ROOT / "tmp/nuclear-voice/rendered")
    parser.add_argument("--timing", type=Path, default=ROOT / "tmp/nuclear-voice/process-narration-timing.json")
    parser.add_argument("--report", type=Path, default=ROOT / "tmp/nuclear-voice/media-signal-report.json")
    args = parser.parse_args()
    plan = json.loads(args.timing.read_text())
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    reports = {}
    for code in args.codes:
        lesson = plan["lessons"][code]
        file = args.input / f"{code.lower()}.mp4"
        frames = sum(scene["durationFrames"] for scene in lesson["scenes"])
        expected = frames * 1600
        with wave.open(lesson["audioFile"], "rb") as reader:
            assert reader.getframerate() == 48000 and reader.getnchannels() == 1
            master = np.frombuffer(reader.readframes(reader.getnframes()), dtype="<i2").astype(np.float32) / 32768
        decoded = subprocess.run([ffmpeg, "-v", "error", "-xerror", "-i", str(file), "-vn", "-ar", "48000",
                                  "-ac", "1", "-f", "f32le", "-"], capture_output=True, check=True)
        audio = np.frombuffer(decoded.stdout, dtype="<f4")
        assert abs(audio.size - expected) <= 1600, f"{code}: AAC duration changed"
        assert master.size == expected and np.isfinite(audio).all()
        assert np.max(np.abs(audio)) < 0.99, f"{code}: audio clipped"
        count = min(audio.size, master.size)
        correlation = float(np.corrcoef(audio[:count:16], master[:count:16])[0, 1])
        assert correlation > .97, f"{code}: decoded AAC not aligned with master ({correlation})"
        scene_offset, cues = 0, []
        for scene in lesson["scenes"]:
            for cue in scene["cues"]:
                start = (scene_offset + cue["from"]) * 1600
                end = start + cue["duration"] * 1600
                rms = float(np.sqrt(np.mean(audio[start:end] ** 2)))
                assert rms > .008, f"{code}: empty/inaudible caption span: {cue['text']}"
                cues.append({"fromSeconds": start / 48000, "toSeconds": end / 48000, "rms": rms, "text": cue["text"]})
            scene_offset += scene["durationFrames"]
        # A 20 ms RMS gate locates long unplanned silences, including cue gaps.
        windows = audio[:audio.size // 960 * 960].reshape(-1, 960)
        quiet = np.sqrt(np.mean(windows ** 2, axis=1)) < .003
        longest, run = 0, 0
        for value in quiet:
            run = run + 1 if value else 0
            longest = max(longest, run)
        loudness = measure(ffmpeg, file)
        assert abs(float(loudness["input_i"]) + 18) < .6, f"{code}: mismatched loudness"
        assert float(loudness["input_tp"]) < -1, f"{code}: insufficient peak headroom"
        assert longest * .02 < 3, f"{code}: unplanned silence >=3s"
        with file.open("rb") as stream:
            fingerprint = hashlib.file_digest(stream, "sha256").hexdigest()
        reports[code] = {"sha256": fingerprint, "durationSeconds": frames / 30, "masterCorrelation": correlation,
                         "decodedSamples": int(audio.size), "peakAmplitude": float(np.max(np.abs(audio))),
                         "lufs": float(loudness["input_i"]), "truePeakDb": float(loudness["input_tp"]),
                         "longestQuietSeconds": longest * .02, "cues": cues}
        print(f"{code}: {frames/30:.3f}s; {loudness['input_i']} LUFS, {loudness['input_tp']} dBTP; master correlation={correlation:.5f}, longest quiet={longest*.02:.2f}s", flush=True)
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps({"method": "Signal analysis of decoded MP4, not listening/ASR", "lessons": reports}, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
