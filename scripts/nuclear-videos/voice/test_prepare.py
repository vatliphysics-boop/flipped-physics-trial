import struct
import tempfile
import unittest
import wave
from pathlib import Path

from prepare import RATE, SAMPLES_PER_FRAME, align_lesson, read_pcm, write_pcm


class AlignLessonTest(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.addCleanup(self.folder.cleanup)
        self.path = Path(self.folder.name)

    def clip(self, name, value, samples):
        file = self.path / f"{name}.wav"
        pcm = struct.pack("<h", value) * samples
        write_pcm(file, pcm)
        return file, pcm

    def test_two_scenes_preserve_utterances_and_pad_exact_frame_boundaries(self):
        brief, brief_pcm = self.clip("brief", 813, SAMPLES_PER_FRAME + 17)
        long, long_pcm = self.clip("long", -1173, 42 * SAMPLES_PER_FRAME + 5)
        exact, exact_pcm = self.clip("exact", 305, 36 * SAMPLES_PER_FRAME)
        source = [
            {"sceneIndex": 0, "utterances": [
                {"display": "Câu thứ nhất", "spoken": "Câu thứ nhất."},
                {"display": "Câu thứ hai", "spoken": "Câu thứ hai."},
            ]},
            {"sceneIndex": 1, "utterances": [
                {"display": "Cảnh tiếp theo", "spoken": "Cảnh tiếp theo."},
            ]},
        ]
        pcm, scenes = align_lesson(source, {(0, 0): brief, (0, 1): long, (1, 0): exact})
        self.assertEqual([scene["durationFrames"] for scene in scenes], [127, 81])
        self.assertEqual([
            [(cue["from"], cue["duration"], cue["speechFrames"], cue["text"]) for cue in scene["cues"]]
            for scene in scenes
        ], [
            [(15, 36, 2, "Câu thứ nhất"), (54, 49, 43, "Câu thứ hai")],
            [(15, 42, 36, "Cảnh tiếp theo")],
        ])

        frame_bytes = SAMPLES_PER_FRAME * 2
        total = 208 * frame_bytes
        self.assertEqual(len(pcm), total)
        last = 0
        for frame, clip in [(15, brief_pcm), (54, long_pcm), (142, exact_pcm)]:
            start = frame * frame_bytes
            self.assertEqual(pcm[last:start], bytes(start - last))
            last = start + len(clip)
            self.assertEqual(pcm[start:last], clip)
        self.assertEqual(pcm[last:], bytes(total - last))
        self.assertEqual(pcm[106 * frame_bytes:142 * frame_bytes], bytes(36 * frame_bytes))

        master = self.path / "master.wav"
        write_pcm(master, pcm)
        self.assertEqual(read_pcm(master), pcm)
        with wave.open(str(master), "rb") as reader:
            self.assertEqual(reader.getnframes(), 208 * SAMPLES_PER_FRAME)
            self.assertEqual(reader.getframerate(), RATE)

    def test_rejects_empty_and_non_48khz_pcm(self):
        empty, _ = self.clip("empty", 0, 0)
        scene = [{"sceneIndex": 0, "utterances": [{"display": "Câu", "spoken": "Câu"}]}]
        with self.assertRaisesRegex(ValueError, "Empty audio"):
            align_lesson(scene, {(0, 0): empty})

        wrong_rate = self.path / "wrong-rate.wav"
        with wave.open(str(wrong_rate), "wb") as writer:
            writer.setparams((1, 2, 44100, 0, "NONE", "not compressed"))
            writer.writeframes(struct.pack("<h", 42))
        with self.assertRaisesRegex(ValueError, "48000"):
            align_lesson(scene, {(0, 0): wrong_rate})


if __name__ == "__main__":
    unittest.main()
