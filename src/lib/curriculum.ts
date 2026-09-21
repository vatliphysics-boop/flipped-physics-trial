export type FixedCurriculumLesson = {
  code: "B21" | "B22" | "B23" | "B24" | "B25";
  number: number;
  title: string;
  order: number;
  activityKey: string;
  activityTitle: string;
  concepts: string[];
};

export const NUCLEAR_PHYSICS_CURRICULUM = [
  {
    code: "B21",
    number: 21,
    title: "Bài 21. Cấu trúc hạt nhân",
    order: 1,
    activityKey: "nuclear_structure",
    activityTitle: "Mô phỏng cấu trúc hạt nhân",
    concepts: ["proton Z", "neutron N", "nucleon A = Z + N", "kí hiệu hạt nhân", "đồng vị"],
  },
  {
    code: "B22",
    number: 22,
    title: "Bài 22. Phản ứng hạt nhân và năng lượng liên kết",
    order: 2,
    activityKey: "binding_energy",
    activityTitle: "Mô phỏng năng lượng liên kết hạt nhân",
    concepts: ["thành phần proton/neutron", "độ hụt khối", "năng lượng liên kết", "năng lượng liên kết riêng", "năng lượng trong phản ứng hạt nhân"],
  },
  {
    code: "B23",
    number: 23,
    title: "Bài 23. Hiện tượng phóng xạ",
    order: 3,
    activityKey: "radioactive_decay",
    activityTitle: "Mô phỏng hiện tượng phóng xạ",
    concepts: ["phân rã phóng xạ ngẫu nhiên", "số hạt nhân còn lại", "chu kì bán rã", "đường cong phân rã"],
  },
  {
    code: "B24",
    number: 24,
    title: "Bài 24. Công nghiệp hạt nhân",
    order: 4,
    activityKey: "nuclear_industry",
    activityTitle: "Mô phỏng phản ứng dây chuyền có kiểm soát",
    concepts: ["phân hạch do neutron", "phản ứng dây chuyền", "thanh điều khiển và khái niệm kiểm soát", "phát điện", "an toàn khoa học"],
  },
  {
    code: "B25",
    number: 25,
    title: "Bài 25. Bài tập về vật lí hạt nhân",
    order: 5,
    activityKey: "nuclear_physics_practice",
    activityTitle: "Luyện tập tương tác Vật lí hạt nhân",
    concepts: ["ôn tập khái niệm", "vận dụng công thức", "phân tích dữ liệu", "giải quyết bài tập"],
  },
] as const satisfies readonly FixedCurriculumLesson[];

export function getCurriculumLesson(code: string | null | undefined) {
  return NUCLEAR_PHYSICS_CURRICULUM.find((lesson) => lesson.code === code);
}