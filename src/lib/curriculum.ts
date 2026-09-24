export type CurriculumChapterCode = "I" | "II" | "III" | "IV";
export type CurriculumLessonCode =
  | "B01" | "B02" | "B03" | "B04" | "B05" | "B06" | "B07"
  | "B08" | "B09" | "B10" | "B11" | "B12" | "B13"
  | "B14" | "B15" | "B16" | "B17" | "B18" | "B19" | "B20"
  | "B21" | "B22" | "B23" | "B24" | "B25";

export type FixedCurriculumLesson = {
  code: CurriculumLessonCode;
  number: number;
  title: string;
  chapterCode: CurriculumChapterCode;
  order: number;
  activityKey: string;
  activityTitle: string;
  concepts: string[];
  activities?: readonly NuclearPhysicsActivity[];
};

export type NuclearPhysicsActivity = {
  activityCode: string;
  key: string;
  title: string;
  activityType: string;
  phase: string;
  order: number;
  shortDescription: string;
  fixed: true;
};

export type FixedCurriculumChapter = {
  code: CurriculumChapterCode;
  number: number;
  title: string;
  shortTitle: string;
  lessons: readonly FixedCurriculumLesson[];
};

export const NUCLEAR_PHYSICS_ACTIVITY_CATALOG = {
  B21: [
    { activityCode: "B21-A01", key: "rutherford_alpha_scattering", title: "Tán xạ alpha Rutherford", activityType: "simulation", phase: "explore", order: 1, shortDescription: "Khám phá thí nghiệm tán xạ alpha và bằng chứng về hạt nhân nguyên tử.", fixed: true },
    { activityCode: "B21-A02", key: "nuclear_structure_builder", title: "Mô hình cấu trúc hạt nhân", activityType: "builder", phase: "explore", order: 2, shortDescription: "Xây dựng hạt nhân từ proton và neutron để liên hệ Z, N và A.", fixed: true },
    { activityCode: "B21-A03", key: "isotope_and_nuclear_size", title: "Đồng vị và kích thước hạt nhân", activityType: "exploration", phase: "practice", order: 3, shortDescription: "So sánh các đồng vị và khảo sát sự phụ thuộc của kích thước hạt nhân.", fixed: true },
  ],
  B22: [
    { activityCode: "B22-A01", key: "nuclear_reaction_balancer", title: "Cân bằng phương trình phản ứng hạt nhân", activityType: "practice", phase: "practice", order: 1, shortDescription: "Cân bằng số khối và điện tích trong các phản ứng hạt nhân.", fixed: true },
    { activityCode: "B22-A02", key: "binding_energy_lab", title: "Phòng thí nghiệm năng lượng liên kết", activityType: "lab", phase: "explore", order: 2, shortDescription: "Tính độ hụt khối và phân tích năng lượng liên kết của hạt nhân.", fixed: true },
    { activityCode: "B22-A03", key: "nuclear_fission", title: "Mô phỏng phân hạch hạt nhân", activityType: "simulation", phase: "explore", order: 3, shortDescription: "Theo dõi phân hạch, neutron phát ra và năng lượng giải phóng.", fixed: true },
    { activityCode: "B22-A04", key: "nuclear_fusion", title: "Mô phỏng nhiệt hạch", activityType: "simulation", phase: "explore", order: 4, shortDescription: "Khảo sát điều kiện và năng lượng trong phản ứng nhiệt hạch.", fixed: true },
  ],
  B23: [
    { activityCode: "B23-A01", key: "geiger_random_decay", title: "Phân rã ngẫu nhiên với bộ đếm Geiger", activityType: "simulation", phase: "explore", order: 1, shortDescription: "Mô phỏng tính ngẫu nhiên của các sự kiện phân rã phóng xạ.", fixed: true },
    { activityCode: "B23-A02", key: "radiation_properties", title: "Tính chất của bức xạ", activityType: "exploration", phase: "explore", order: 2, shortDescription: "So sánh khả năng đâm xuyên và tác dụng của các loại bức xạ.", fixed: true },
    { activityCode: "B23-A03", key: "radioactive_decay_half_life", title: "Định luật phân rã và chu kỳ bán rã", activityType: "lab", phase: "practice", order: 3, shortDescription: "Phân tích đường cong phân rã và xác định chu kỳ bán rã.", fixed: true },
    { activityCode: "B23-A04", key: "carbon14_dating", title: "Định tuổi bằng carbon-14", activityType: "application", phase: "practice", order: 4, shortDescription: "Vận dụng phân rã carbon-14 để ước tính tuổi mẫu vật.", fixed: true },
    { activityCode: "B23-A05", key: "radiation_safety", title: "An toàn bức xạ", activityType: "scenario", phase: "practice", order: 5, shortDescription: "Lựa chọn biện pháp che chắn và làm việc an toàn với nguồn phóng xạ.", fixed: true },
  ],
  B24: [
    { activityCode: "B24-A01", key: "nuclear_power_energy_flow", title: "Dòng năng lượng trong nhà máy điện hạt nhân", activityType: "simulation", phase: "explore", order: 1, shortDescription: "Theo dõi quá trình chuyển hóa năng lượng từ phân hạch đến điện năng.", fixed: true },
    { activityCode: "B24-A02", key: "reactor_control_concept", title: "Khái niệm điều khiển lò phản ứng", activityType: "simulation", phase: "explore", order: 2, shortDescription: "Khảo sát vai trò của neutron và thanh điều khiển trong phản ứng dây chuyền.", fixed: true },
    { activityCode: "B24-A03", key: "nuclear_medicine", title: "Y học hạt nhân", activityType: "application", phase: "practice", order: 3, shortDescription: "Tìm hiểu cách đồng vị phóng xạ được dùng trong chẩn đoán và điều trị.", fixed: true },
    { activityCode: "B24-A04", key: "radiation_applications", title: "Ứng dụng của bức xạ", activityType: "application", phase: "practice", order: 4, shortDescription: "Phân loại và đánh giá các ứng dụng của bức xạ trong đời sống.", fixed: true },
  ],
  B25: [
    { activityCode: "B25-A01", key: "nuclear_physics_practice_lab", title: "Phòng thí nghiệm luyện tập vật lí hạt nhân", activityType: "lab", phase: "practice", order: 1, shortDescription: "Tổng hợp và vận dụng kiến thức vật lí hạt nhân qua các bài tập tương tác.", fixed: true },
  ],
} as const satisfies Record<"B21" | "B22" | "B23" | "B24" | "B25", readonly NuclearPhysicsActivity[]>;


export type NuclearPhysicsLessonCode = keyof typeof NUCLEAR_PHYSICS_ACTIVITY_CATALOG;
export type CanonicalActivityKey = (typeof NUCLEAR_PHYSICS_ACTIVITY_CATALOG)[NuclearPhysicsLessonCode][number]["key"];
export type CanonicalPhysicsActivity = (typeof NUCLEAR_PHYSICS_ACTIVITY_CATALOG)[NuclearPhysicsLessonCode][number];

export const CANONICAL_PHASE2_ACTIVITY_KEYS = Object.values(NUCLEAR_PHYSICS_ACTIVITY_CATALOG)
  .flatMap((activities) => activities.map((activity) => activity.key)) as readonly CanonicalActivityKey[];

export function normalizeActivityKey(value: unknown): CanonicalActivityKey | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase().replace(/^(activity|simulation):/i, "");
  return (CANONICAL_PHASE2_ACTIVITY_KEYS as readonly string[]).includes(normalized)
    ? normalized as CanonicalActivityKey
    : null;
}

export function getCanonicalPhysicsActivities(lessonCode: NuclearPhysicsLessonCode) {
  return NUCLEAR_PHYSICS_ACTIVITY_CATALOG[lessonCode];
}

export function getCanonicalPhysicsActivity(value: unknown): CanonicalPhysicsActivity | null {
  const key = normalizeActivityKey(value);
  if (!key) return null;
  for (const activities of Object.values(NUCLEAR_PHYSICS_ACTIVITY_CATALOG)) {
    const activity = activities.find((candidate) => candidate.key === key);
    if (activity) return activity;
  }
  return null;
}

const preparedLesson = (
  code: CurriculumLessonCode,
  number: number,
  title: string,
  chapterCode: CurriculumChapterCode,
  order: number,
): FixedCurriculumLesson => ({
  code,
  number,
  title,
  chapterCode,
  order,
  activityKey: "materials_preparing",
  activityTitle: "Học liệu đang được chuẩn bị.",
  concepts: [],
});

export const GRADE_12_CURRICULUM = [
  { code: "I", number: 1, title: "VẬT LÍ NHIỆT", shortTitle: "Vật lí nhiệt", lessons: [
    preparedLesson("B01", 1, "Cấu trúc của chất. Sự chuyển thể", "I", 1),
    preparedLesson("B02", 2, "Nội năng. Định luật I của nhiệt động lực học", "I", 2),
    preparedLesson("B03", 3, "Nhiệt độ. Thang nhiệt độ – nhiệt kế", "I", 3),
    preparedLesson("B04", 4, "Nhiệt dung riêng", "I", 4),
    preparedLesson("B05", 5, "Nhiệt nóng chảy riêng", "I", 5),
    preparedLesson("B06", 6, "Nhiệt hoá hơi riêng", "I", 6),
    preparedLesson("B07", 7, "Bài tập về vật lí nhiệt", "I", 7),
  ] },
  { code: "II", number: 2, title: "KHÍ LÍ TƯỞNG", shortTitle: "Khí lí tưởng", lessons: [
    preparedLesson("B08", 8, "Mô hình động học phân tử chất khí", "II", 1),
    preparedLesson("B09", 9, "Định luật Boyle", "II", 2),
    preparedLesson("B10", 10, "Định luật Charles", "II", 3),
    preparedLesson("B11", 11, "Phương trình trạng thái của khí lí tưởng", "II", 4),
    preparedLesson("B12", 12, "Áp suất khí theo mô hình động học phân tử. Quan hệ giữa động năng phân tử và nhiệt độ", "II", 5),
    preparedLesson("B13", 13, "Bài tập về khí lí tưởng", "II", 6),
  ] },
  { code: "III", number: 3, title: "TỪ TRƯỜNG", shortTitle: "Từ trường", lessons: [
    preparedLesson("B14", 14, "Từ trường", "III", 1),
    preparedLesson("B15", 15, "Lực từ tác dụng lên dây dẫn mang dòng điện. Cảm ứng từ", "III", 2),
    preparedLesson("B16", 16, "Từ thông. Hiện tượng cảm ứng điện từ", "III", 3),
    preparedLesson("B17", 17, "Máy phát điện xoay chiều", "III", 4),
    preparedLesson("B18", 18, "Ứng dụng hiện tượng cảm ứng điện từ", "III", 5),
    preparedLesson("B19", 19, "Điện từ trường. Mô hình sóng điện từ", "III", 6),
    preparedLesson("B20", 20, "Bài tập về từ trường", "III", 7),
  ] },
  { code: "IV", number: 4, title: "VẬT LÍ HẠT NHÂN", shortTitle: "Vật lí hạt nhân", lessons: [
    { code: "B21", number: 21, title: "Cấu trúc hạt nhân", chapterCode: "IV", order: 1, activityKey: "nuclear_structure", activityTitle: "Mô phỏng cấu trúc hạt nhân", concepts: ["proton Z", "neutron N", "nucleon A = Z + N", "kí hiệu hạt nhân", "đồng vị"], activities: NUCLEAR_PHYSICS_ACTIVITY_CATALOG.B21 },
    { code: "B22", number: 22, title: "Phản ứng hạt nhân và năng lượng liên kết", chapterCode: "IV", order: 2, activityKey: "binding_energy", activityTitle: "Mô phỏng năng lượng liên kết hạt nhân", concepts: ["thành phần proton/neutron", "độ hụt khối", "năng lượng liên kết", "năng lượng liên kết riêng", "năng lượng trong phản ứng hạt nhân"], activities: NUCLEAR_PHYSICS_ACTIVITY_CATALOG.B22 },
    { code: "B23", number: 23, title: "Hiện tượng phóng xạ", chapterCode: "IV", order: 3, activityKey: "radioactive_decay", activityTitle: "Mô phỏng hiện tượng phóng xạ", concepts: ["phân rã phóng xạ ngẫu nhiên", "số hạt nhân còn lại", "chu kì bán rã", "đường cong phân rã"], activities: NUCLEAR_PHYSICS_ACTIVITY_CATALOG.B23 },
    { code: "B24", number: 24, title: "Công nghiệp hạt nhân", chapterCode: "IV", order: 4, activityKey: "nuclear_industry", activityTitle: "Mô phỏng phản ứng dây chuyền có kiểm soát", concepts: ["phân hạch do neutron", "phản ứng dây chuyền", "thanh điều khiển và khái niệm kiểm soát", "phát điện", "an toàn khoa học"], activities: NUCLEAR_PHYSICS_ACTIVITY_CATALOG.B24 },
    { code: "B25", number: 25, title: "Bài tập về vật lí hạt nhân", chapterCode: "IV", order: 5, activityKey: "nuclear_physics_practice", activityTitle: "Luyện tập tương tác Vật lí hạt nhân", concepts: ["ôn tập khái niệm", "vận dụng công thức", "phân tích dữ liệu", "giải quyết bài tập"], activities: NUCLEAR_PHYSICS_ACTIVITY_CATALOG.B25 },
  ] },
] as const satisfies readonly FixedCurriculumChapter[];

export const NUCLEAR_PHYSICS_CURRICULUM = GRADE_12_CURRICULUM[3].lessons;

export function getCurriculumLesson(code: string | null | undefined) {
  return GRADE_12_CURRICULUM.flatMap((chapter) => chapter.lessons).find((lesson) => lesson.code === code);
}

export function getCurriculumChapter(code: string | null | undefined) {
  return GRADE_12_CURRICULUM.find((chapter) => chapter.code === code);
}

export function getLessonLabel(lesson: Pick<FixedCurriculumLesson, "number" | "title">) {
  return `Bài ${lesson.number} — ${lesson.title}`;
}