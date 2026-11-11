export const PUBLIC_PRIMARY_LINKS = [
  { href: "/hoc-lieu", label: "Kho học liệu" },
  { href: "/hoc-lieu/phong-hat-nhan", label: "Mô hình và video" },
  { href: "/hoc-lieu/truc-quan", label: "Phòng trực quan" },
];

export type PublicToolGroup = {
  label: string;
  description: string;
  links: { href: string; label: string }[];
};

export const PUBLIC_TOOL_GROUPS: PublicToolGroup[] = [
  {
    label: "Dành cho học sinh",
    description: "Tự học theo ba giai đoạn",
    links: [
      { href: "/hoc-lieu/lop-hoc-dao-nguoc", label: "Hướng dẫn ba pha" },
      { href: "/demo-lesson", label: "Trải nghiệm bài học mẫu" },
      { href: "/hoc-lieu/ai", label: "Trợ lí học tập" },
    ],
  },
  {
    label: "Dành cho giáo viên",
    description: "Soạn kế hoạch, đề và phiếu",
    links: [
      { href: "/hoc-lieu/chuong-trinh", label: "Chương trình Vật lí 12" },
      { href: "/hoc-lieu/soan-ke-hoach", label: "Soạn kế hoạch dạy học" },
      { href: "/hoc-lieu/ai-giao-vien", label: "Công cụ giáo viên" },
    ],
  },
  {
    label: "Về dự án",
    description: "Thông tin học liệu và nghiên cứu",
    links: [{ href: "/gioi-thieu", label: "Giới thiệu học liệu" }],
  },
];

export const PUBLIC_TOOL_LINKS = PUBLIC_TOOL_GROUPS.flatMap(group => group.links);
