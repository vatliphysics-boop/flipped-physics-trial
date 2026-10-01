export const LEARNING_PHASES = ["before_class", "in_class", "after_class"] as const;

export type LearningPhase = (typeof LEARNING_PHASES)[number];

export const PHASE_META: Record<LearningPhase, { title: string; description: string; tone: "blue" | "green" | "orange" }> = {
  before_class: { title: "Trước giờ học", description: "Video, tài liệu và hướng dẫn trước khi đến lớp.", tone: "blue" },
  in_class: { title: "Trong giờ học", description: "Thí nghiệm ảo • Xử lí dữ liệu • Thảo luận • Vận dụng", tone: "green" },
  after_class: { title: "Sau giờ học", description: "Nhiệm vụ giáo viên giao sau bài học.", tone: "orange" },
};

export function isLearningPhase(value: unknown): value is LearningPhase {
  return typeof value === "string" && (LEARNING_PHASES as readonly string[]).includes(value);
}
