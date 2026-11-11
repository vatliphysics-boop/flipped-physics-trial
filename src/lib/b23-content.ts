/**
 * B23 content manifest and structure
 * SGK Vật lí 12 KNTT, Bài 23 "Hiện tượng phóng xạ", tr. 104–113
 */

export const B23_HERO = {
  eyebrow: "Bài 23 · Chương IV · Vật lí 12",
  title: "Hiện tượng phóng xạ",
  pages: "SGK trang 104–113",
  lead: "Paris, 1896. Henri Becquerel phát hiện uranium phát ra tia vô hình xuyên qua vải đen và làm đen kính ảnh. Hiện tượng này mở đầu kỉ nguyên vật lí hạt nhân.",
  scientist: {
    name: "Henri Becquerel",
    years: "1852 – 1908",
    nobel: "Giải Nobel Vật lí 1903",
    photoUrl: "/scientists/becquerel.jpg",
    photoCredit: "Chân dung nhiếp ảnh bởi Paul Nadar (Bibliothèque nationale de France)",
    unit: "Becquerel (Bq) = 1 phân rã/giây",
  },
  story: {
    context: "Trong một thí nghiệm ngẫu nhiên, Becquerel bọc tấm kính ảnh trong vải đen (không ánh sáng xuyên qua), đặt cạnh muối kali uranyl sulfat có miếng kim loại hình chữ thập, và để trong ngăn kéo tối nhiều ngày.",
    observation: "Khi tháo ra, tấm kính ảnh bị làm đen và in rõ hình chữ thập — dù không hề có ánh sáng chiếu vào.",
    question: "Điều gì đã xuyên qua vải đen và làm đen kính ảnh?",
    conclusion: "Uranium tự phát ra tia vô hình không phụ thuộc ánh sáng hay nhiệt độ. Đó là tia phóng xạ.",
  },
} as const;

export const B23_SECTIONS = [
  {
    id: "khoi-dong",
    order: 0,
    badge: "Khởi động",
    title: "Thí nghiệm Becquerel 1896",
    pages: "104",
    sgkFigures: ["Hình 23.1 – Buồng sương uranium"],
    activities: [] as const,
    learningPhase: "before_class" as const,
  },
  {
    id: "I",
    order: 1,
    badge: "Mục I",
    title: "Hiện tượng phóng xạ",
    pages: "104–106",
    sgkFigures: [
      "Bảng 23.1 – Số tia phóng xạ mỗi 5 giây",
      "Hình 23.2 – Máy đếm Geiger-Müller",
      "Hình 23.3 – Tách tia alpha, beta, gamma trong điện trường và từ trường",
      "Hình 23.4 – Khả năng đâm xuyên (giấy, nhôm, chì)",
    ],
    activities: ["geiger_random_decay", "radiation_properties"] as const,
    learningPhase: "before_class" as const,
  },
  {
    id: "II",
    order: 2,
    badge: "Mục II",
    title: "Định luật phóng xạ. Độ phóng xạ",
    pages: "107–109",
    sgkFigures: [
      "Hình 23.5 – Đồ thị N(t) = N₀·2^(-t/T)",
      "Bảng 23.2 – Chu kì bán rã",
    ],
    activities: ["radioactive_decay_half_life"] as const,
    learningPhase: "in_class" as const,
  },
  {
    id: "III",
    order: 3,
    badge: "Mục III",
    title: "Ảnh hưởng của tia phóng xạ. Biển cảnh báo",
    pages: "110",
    sgkFigures: ["Biển cảnh báo phóng xạ (hình tam giác vàng)"],
    activities: ["radiation_safety"] as const,
    learningPhase: "in_class" as const,
  },
  {
    id: "IV",
    order: 4,
    badge: "Mục IV",
    title: "Nguyên tắc an toàn phóng xạ",
    pages: "110–111",
    sgkFigures: [],
    activities: [] as const,
    learningPhase: "after_class" as const,
  },
  {
    id: "applications",
    order: 5,
    badge: "Vận dụng",
    title: "Định tuổi C-14 và ứng dụng đồng vị",
    pages: "111–113",
    sgkFigures: [],
    activities: ["carbon14_dating"] as const,
    learningPhase: "after_class" as const,
  },
] as const;

export type B23ActivityKey = (typeof B23_SECTIONS)[number]["activities"][number];
export type B23SectionId = (typeof B23_SECTIONS)[number]["id"];
