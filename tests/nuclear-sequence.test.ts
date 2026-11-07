import assert from "node:assert/strict";
import { test } from "node:test";
import katex from "katex";
import { NUCLEAR_SEQUENCES, formatLearningTask } from "../src/lib/nuclear-learning-sequence";
import { NUCLEAR_LAB_LESSONS } from "../src/lib/nuclear-lab-lessons";
import { getCurriculumLessonByTitle, getCanonicalPhysicsActivities } from "../src/lib/curriculum";
import { legacyNuclearMath } from "../src/lib/legacy-nuclear-math";
import { LEARNING_PHASES } from "../src/lib/learning-phases";

test("the lab titles and legacy numbered lesson names resolve to the same five modules", () => {
  for (const [index, lesson] of NUCLEAR_LAB_LESSONS.entries()) {
    assert.equal(getCurriculumLessonByTitle(lesson.title, "IV")?.code, lesson.code);
    assert.equal(getCurriculumLessonByTitle(`Bài ${21 + index}. ${lesson.title}`, "IV")?.code, lesson.code);
    assert.equal(getCurriculumLessonByTitle(`Bài 35. ${lesson.title}`, "IV"), undefined);
  }
});

test("each phase has distinct evidence requirements and the main simulation belongs to its own lesson", () => {
  const distinctTasks = new Set();
  for (const lesson of NUCLEAR_LAB_LESSONS) {
    const sequence = NUCLEAR_SEQUENCES[lesson.code];
    assert(getCanonicalPhysicsActivities(lesson.code).some(activity => activity.key === sequence.activity));
    for (const phase of LEARNING_PHASES) {
      const instructions = formatLearningTask(sequence.tasks[phase]);
      distinctTasks.add(instructions);
      assert.match(instructions, /Mục tiêu:.+\n\nNhiệm vụ:.+\n\nSản phẩm cần nộp:.+\n\nTiêu chí hoàn thành:/);
      for (const formula of instructions.matchAll(/\\\((.*?)\\\)/g)) {
        assert.doesNotThrow(() => katex.renderToString(formula[1], { throwOnError: true }), formula[1]);
      }
    }
  }
  assert.equal(distinctTasks.size, 15);
});

test("legacy assessment presentation renders key formulae without changing marked-up content", () => {
  const marked = String.raw`Đọc \(N(t)=N_0\,2^{-\frac{t}{T}}\).`;
  assert.equal(legacyNuclearMath(marked), marked);
  const formatted = legacyNuclearMath("N_t = N₀ · 2^(−t/T). H_t = λ · N_t; λ = ln2/T");
  assert.match(formatted, /\\frac\{t\}\{T\}/);
  assert.match(formatted, /\\frac\{\\ln 2\}\{T\}/);
  assert(!formatted.includes("^(−t/T)"));
  assert.equal(legacyNuclearMath("https://example.com/A/B"), "https://example.com/A/B");
});
