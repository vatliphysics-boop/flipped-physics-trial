/* ═══════════════════════════════════════════════════════════════════════════
   BÀI 21: CẤU TRÚC HẠT NHÂN (SGK Vật lí 12 Kết nối tri thức, trang 91–95)
   Bộ 6 Infographic Động (Animated Infographic Posters) theo từng mục SGK,
   mô phỏng trực tiếp phong cách 2 video Facebook Reels mẫu:
   - Phong cách "Stacked 3D Cards" (như video 5 Types of Chemical Bonds):
     5 thẻ ngang xếp chồng trên 1 poster dọc 9:16, mỗi thẻ có quả cầu 3D đổ bóng,
     chuyển động theo 3 pha (TIẾP CẬN → TƯƠNG TÁC → KẾT LUẬN ✓) + dòng chốt kiến thức.
   - Phong cách "Dark Cosmic Evolution Grid" (như video Evolution of the Atomic Model):
     Lưới 7 mốc lịch sử mô hình nguyên tử trên nền xanh vũ trụ kèm mô hình 3D động.
   ═══════════════════════════════════════════════════════════════════════════ */

export type PosterTheme = "parchment" | "cosmic" | "slate" | "amber" | "indigo" | "teal";

export interface AnimatedCardSpec {
  stepNumber: number;
  badgeColor: string;
  title: string;
  subtitle: string;
  /** Nhãn trạng thái ở góc phải trên theo 3 pha */
  phaseLabels: [string, string, string];
  /** Dòng kết luận in đậm hiện ra ở đáy thẻ (giống dòng chốt trong video mẫu) */
  takeaway: string;
  /** Công thức / kí hiệu ngắn nếu có */
  formula?: string;
  /** Mã cảnh đồ hoạ 3D SVG động */
  sceneKey: string;
}

export interface AtomicTimelinePanelSpec {
  year: string;
  ribbonColor: string;
  modelTitle: string;
  scientist: string;
  description: string;
  caption: string;
  sceneKey: string;
  fullWidth?: boolean;
}

export interface B21SectionInfographic {
  id: string;
  sectionCode: string;
  sectionOrder: number;
  sgkSectionTitle: string;
  posterTitle: string;
  posterSubtitle: string;
  sgkPages: string;
  sgkReference: string;
  layoutType: "stacked-cards" | "timeline-grid";
  theme: PosterTheme;
  accentColor: string;
  footerTagline: string;
  cards?: AnimatedCardSpec[];
  timelinePanels?: AtomicTimelinePanelSpec[];
}

export const B21_SECTION_INFOGRAPHICS: B21SectionInfographic[] = [
  /* ═════════════════════════════════════════════════════════════════════════
     INFOGRAPHIC 1 — MỤC I (Phần 1): THÍ NGHIỆM TÁN XẠ HẠT ALPHA (SGK tr. 91–92)
     ═════════════════════════════════════════════════════════════════════════ */
  {
    id: "b21-sec1-rutherford-scattering",
    sectionCode: "Mục I.1",
    sectionOrder: 1,
    sgkSectionTitle: "I. Thí nghiệm tán xạ hạt alpha (Hình 21.1 – 21.4)",
    posterTitle: "THÍ NGHIỆM TÁN XẠ HẠT ALPHA",
    posterSubtitle: "Từ bánh ngọt mận khô đến phát hiện hạt nhân nguyên tử · SGK tr. 91–92",
    sgkPages: "91–92",
    sgkReference: "Hình 21.1, 21.2, 21.3, 21.4 · Câu hỏi 1a, 1b, 1c tr. 92",
    layoutType: "stacked-cards",
    theme: "parchment",
    accentColor: "#7c5cfc",
    footerTagline: "LÁ VÀNG 4·10⁻⁷ m · CHÂN KHÔNG · PHÁT HIỆN HẠT NHÂN 1911",
    cards: [
      {
        stepNumber: 1,
        badgeColor: "#8b6cef",
        title: "MÔ HÌNH BÁNH NGỌT MẬN KHÔ",
        subtitle: "Giả thuyết trước năm 1911 (Hình 21.1)",
        phaseLabels: ["GIẢ THUYẾT...", "BẮN HẠT α...", "KHÔNG LỆCH MẠNH"],
        takeaway: "Điện tích (+) phân bố đều → Mô hình dự đoán lệch nhỏ, không giải thích được hạt bật ngược",
        sceneKey: "ruth_plum_pudding",
      },
      {
        stepNumber: 2,
        badgeColor: "#f08c2b",
        title: "BỐ TRÍ THÍ NGHIỆM RUTHERFORD",
        subtitle: "Nguồn R · Lá vàng D (4·10⁻⁷ m) · Màn huỳnh quang S (Hình 21.2)",
        phaseLabels: ["PHÁT HẠT α...", "QUA LÁ VÀNG D...", "ĐỐM SÁNG TRÊN S ✓"],
        takeaway: "Chùm α (hạt nhân ⁴₂He) bắn qua lá vàng D trong hộp chân không G",
        sceneKey: "ruth_apparatus",
      },
      {
        stepNumber: 3,
        badgeColor: "#16a34a",
        title: "VỊ TRÍ (1): ĐA SỐ HẠT α ĐI THẲNG",
        subtitle: "Tần suất đốm sáng lớn nhất đối diện nguồn (Hình 21.3)",
        phaseLabels: ["CHÙM α TỚI...", "XUYÊN KHOẢNG TRỐNG...", "PHẦN LỚN ĐI GẦN THẲNG"],
        takeaway: "Đa số hạt α đi thẳng → Phần lớn không gian nguyên tử là khoảng trống",
        sceneKey: "ruth_straight_beam",
      },
      {
        stepNumber: 4,
        badgeColor: "#0ea5e9",
        title: "TÁN XẠ GÓC LỆCH: LỰC ĐẨY TĨNH ĐIỆN",
        subtitle: "Hạt α (+2e) bay gần tâm hạt nhân vàng (+79e) (Hình 21.4)",
        phaseLabels: ["TIẾP CẬN TÂM (+)...", "LỰC ĐẨY COULOMB...", "ĐỔI HƯỚNG QUỸ ĐẠO ✓"],
        takeaway: "Cùng điện tích dương (+) → Lực đẩy tĩnh điện làm hạt α lệch hướng",
        sceneKey: "ruth_coulomb_deflect",
      },
      {
        stepNumber: 5,
        badgeColor: "#e11d48",
        title: "VỊ TRÍ (2): HẠT α BẬT NGƯỢC (~10⁻⁴)",
        subtitle: "Chỉ 1 trong 10 000 hạt bị lệch > 90° (Câu hỏi 1c tr. 92)",
        phaseLabels: ["VA CHẠM TRỰC DIỆN...", "BẬT NGƯỢC > 90°...", "HẠT NHÂN RẤT NHỎ ✓"],
        takeaway: "Tần suất 10⁻⁴ → Điện tích (+) & khối lượng tập trung ở hạt nhân cực nhỏ",
        sceneKey: "ruth_backscatter",
      },
    ],
  },

  /* ═════════════════════════════════════════════════════════════════════════
     INFOGRAPHIC 2 — MỤC I (Phần 2): SỰ PHÁT TRIỂN MÔ HÌNH NGUYÊN TỬ (SGK tr. 91–93)
     Mô phỏng trực tiếp bố cục Video 2: "EVOLUTION OF THE ATOMIC MODEL"
     ═════════════════════════════════════════════════════════════════════════ */
  {
    id: "b21-sec2-atomic-model-evolution",
    sectionCode: "Mục I.2",
    sectionOrder: 2,
    sgkSectionTitle: "I. Mô hình nguyên tử & Em có biết (Hình 21.5 tr. 92–93)",
    posterTitle: "SỰ PHÁT TRIỂN MÔ HÌNH NGUYÊN TỬ",
    posterSubtitle: "Từ ý tưởng cổ đại đến mô hình hành tinh nguyên tử và đám mây electron · SGK tr. 91–93",
    sgkPages: "91–93",
    sgkReference: "Hình 21.1, Hình 21.5a, 21.5b · Hoạt động 2 tr. 92 · Em có biết tr. 93",
    layoutType: "timeline-grid",
    theme: "cosmic",
    accentColor: "#f5b041",
    footerTagline: "HẠT VI MÔ NHỎ BÉ · KHÁM PHÁ VĨ ĐẠI · BỨC TRANH NGUYÊN TỬ RÕ RÀNG HƠN",
    timelinePanels: [
      {
        year: "400 TCN",
        ribbonColor: "#1abc9c",
        modelTitle: "Thuyết nguyên tử cổ đại",
        scientist: "Democritus",
        description: "Đề xuất mọi vật chất được tạo nên từ những hạt cực nhỏ, không thể phân chia gọi là atomos.",
        caption: "Atomos (hạt không phân chia)",
        sceneKey: "evo_democritus",
      },
      {
        year: "1803 / 1808",
        ribbonColor: "#27ae60",
        modelTitle: "Mô hình quả cầu đặc",
        scientist: "John Dalton",
        description: "Xây dựng thuyết nguyên tử khoa học đầu tiên: nguyên tử là những quả cầu đặc, đồng nhất và bất khả phân.",
        caption: "Quả cầu đặc đồng nhất",
        sceneKey: "evo_dalton",
      },
      {
        year: "1897",
        ribbonColor: "#9b59b6",
        modelTitle: "Mô hình bánh ngọt mận khô",
        scientist: "J.J. Thomson",
        description: "Phát hiện electron (−). Nguyên tử như chiếc bánh tích điện dương (+) chứa các mẩu mận khô electron (−) bên trong (Hình 21.1).",
        caption: "Bánh ngọt mận khô (Hình 21.1)",
        sceneKey: "evo_thomson",
      },
      {
        year: "1911",
        ribbonColor: "#e67e22",
        modelTitle: "Mô hình hành tinh nguyên tử",
        scientist: "Ernest Rutherford",
        description: "Từ thí nghiệm tán xạ hạt α qua lá vàng, chứng minh nguyên tử gần như rỗng với hạt nhân (+) rất nhỏ, nặng ở tâm (Hình 21.5a).",
        caption: "Hành tinh nguyên tử (Hình 21.5a)",
        sceneKey: "evo_rutherford",
      },
      {
        year: "1913",
        ribbonColor: "#e74c3c",
        modelTitle: "Mẫu nguyên tử lượng tử Bohr",
        scientist: "Niels Bohr",
        description: "Vận dụng thuyết lượng tử bổ sung tiên đề: electron chuyển động trên các quỹ đạo dừng có mức năng lượng xác định, giải thích quang phổ vạch H.",
        caption: "Quỹ đạo dừng năng lượng (SGK tr. 93)",
        sceneKey: "evo_bohr",
      },
      {
        year: "1926",
        ribbonColor: "#16a085",
        modelTitle: "Mô hình đám mây electron",
        scientist: "Erwin Schrödinger",
        description: "Electron không đi theo quỹ đạo cố định mà có thể xuất hiện ở mọi vị trí với mật độ xác suất biểu diễn bằng đám mây electron (Hình 21.5b).",
        caption: "Đám mây electron (Hình 21.5b)",
        sceneKey: "evo_schrodinger",
      },
      {
        year: "1932",
        ribbonColor: "#8e44ad",
        modelTitle: "Hoàn thiện cấu trúc hạt nhân (Nucleon)",
        scientist: "James Chadwick",
        description: "Tìm ra hạt neutron (0) không mang điện nằm cùng proton (+) trong hạt nhân, hoàn thiện cấu trúc nucleon của hạt nhân nguyên tử (Hình 21.6).",
        caption: "Hạt nhân gồm Proton (+) & Neutron (0)",
        sceneKey: "evo_chadwick",
        fullWidth: true,
      },
    ],
  },

  /* ═════════════════════════════════════════════════════════════════════════
     INFOGRAPHIC 3 — MỤC II.1 (Phần A): NUCLEON & ĐƠN VỊ AMU (SGK tr. 93)
     ═════════════════════════════════════════════════════════════════════════ */
  {
    id: "b21-sec3-nucleon-and-amu",
    sectionCode: "Mục II.1a",
    sectionOrder: 3,
    sgkSectionTitle: "II.1. Nucleon & Đơn vị khối lượng nguyên tử amu (tr. 93)",
    posterTitle: "CẤU TẠO HẠT NHÂN & NUCLEON",
    posterSubtitle: "Proton, Neutron, Số khối A và Đơn vị khối lượng amu · SGK tr. 93",
    sgkPages: "93",
    sgkReference: "Mục II.1 · Hình 21.6 (Hạt nhân ²⁸₁₄Si) · Câu hỏi tr. 93",
    layoutType: "stacked-cards",
    theme: "parchment",
    accentColor: "#dc2626",
    footerTagline: "PROTON (+e) · NEUTRON (0) · 1 amu ≈ 1,66054·10⁻²⁷ kg",
    cards: [
      {
        stepNumber: 1,
        badgeColor: "#ef4444",
        title: "HẠT PROTON (KÍ HIỆU p)",
        subtitle: "Hạt mang điện tích dương nguyên tố trong hạt nhân",
        phaseLabels: ["KHẢO SÁT HẠT p...", "ĐO ĐIỆN TÍCH & m...", "m_p ≈ 1,00728 amu ✓"],
        takeaway: "q = +e ≈ +1,6·10⁻¹⁹ C  |  m_p ≈ 1,67262·10⁻²⁷ kg ≈ 1,00728 amu",
        sceneKey: "nuc_proton",
      },
      {
        stepNumber: 2,
        badgeColor: "#3b82f6",
        title: "HẠT NEUTRON (KÍ HIỆU n)",
        subtitle: "Hạt trung hoà về điện, nặng xấp xỉ hạt proton",
        phaseLabels: ["KHẢO SÁT HẠT n...", "TRUNG HOÀ ĐIỆN...", "m_n ≈ 1,00866 amu ✓"],
        takeaway: "q = 0 (không mang điện)  |  m_n ≈ 1,67493·10⁻²⁷ kg ≈ 1,00866 amu",
        sceneKey: "nuc_neutron",
      },
      {
        stepNumber: 3,
        badgeColor: "#8b5cf6",
        title: "TÊN CHUNG: NUCLEON & SỐ KHỐI A",
        subtitle: "Hạt nhân tạo bởi Z proton và N neutron (Hình 21.6)",
        phaseLabels: ["Z PROTON + N NEUTRON...", "LIÊN KẾT HẠT NHÂN...", "SỐ KHỐI A = Z + N ✓"],
        takeaway: "Hình 21.6: Hạt nhân ²⁸₁₄Si gồm Z = 14 proton và N = 14 neutron (A = 28)",
        sceneKey: "nuc_silicon28",
      },
      {
        stepNumber: 4,
        badgeColor: "#d97706",
        title: "KHỐI LƯỢNG TẬP TRUNG Ở HẠT NHÂN",
        subtitle: "So sánh khối lượng nucleon với electron (m_p ≈ 1836 m_e)",
        phaseLabels: ["ĐẶT LÊN BÀN CÂN...", "m_e RẤT NHỎ...", "m_nguyên_tử ≈ m_hạt_nhân ✓"],
        takeaway: "Khối lượng hạt nhân rất lớn so với các electron → Tập trung gần hết ở tâm",
        sceneKey: "nuc_mass_concentration",
      },
      {
        stepNumber: 5,
        badgeColor: "#0d9488",
        title: "ĐƠN VỊ KHỐI LƯỢNG NGUYÊN TỬ (amu)",
        subtitle: "Bằng 1/12 khối lượng nguyên tử đồng vị Carbon-12",
        phaseLabels: ["NGUYÊN TỬ ¹²C...", "CHIA 12 PHẦN...", "1 amu ≈ 1,66054·10⁻²⁷ kg ✓"],
        takeaway: "1 amu = 1/12 m(¹²C) ≈ 1,66054·10⁻²⁷ kg → Mỗi nucleon nặng xấp xỉ 1 amu",
        sceneKey: "nuc_amu_unit",
      },
    ],
  },

  /* ═════════════════════════════════════════════════════════════════════════
     INFOGRAPHIC 4 — MỤC II.1 (Phần B): BÁN KÍNH HẠT NHÂN & HẠT QUARK (SGK tr. 94)
     ═════════════════════════════════════════════════════════════════════════ */
  {
    id: "b21-sec4-nuclear-radius-and-quark",
    sectionCode: "Mục II.1b",
    sectionOrder: 4,
    sgkSectionTitle: "II.1. Bán kính hạt nhân, Bảng 21.1 & Hạt Quark (tr. 94)",
    posterTitle: "KÍCH THƯỚC HẠT NHÂN & THANG VI MÔ",
    posterSubtitle: "Công thức bán kính R, Bảng 21.1 và Cấu trúc Quark bên trong nucleon · SGK tr. 94",
    sgkPages: "94",
    sgkReference: "Công thức (21.1) · Bảng 21.1 · Hình 21.7 (Em có biết tr. 94)",
    layoutType: "stacked-cards",
    theme: "parchment",
    accentColor: "#0284c7",
    footerTagline: "CÔNG THỨC ƯỚC LƯỢNG · BẢNG 21.1 · THANG KÍCH THƯỚC VI MÔ",
    cards: [
      {
        stepNumber: 1,
        badgeColor: "#0284c7",
        title: "CÔNG THỨC BÁN KÍNH HẠT NHÂN (21.1)",
        subtitle: "Coi hạt nhân là một quả cầu có thể tích gần tỉ lệ với số nucleon.",
        phaseLabels: ["XẾP SÁT NUCLEON...", "THỂ TÍCH V ∝ A...", "ƯỚC LƯỢNG BÁN KÍNH"],
        takeaway: "Công thức cho giá trị gần đúng. So sánh kết quả tính với Bảng 21.1, đặc biệt ở hạt nhân nhẹ.",
        formula: String.raw`R\approx 1{,}2\,A^{1/3}\,\mathrm{fm}`,
        sceneKey: "size_formula_sphere",
      },
      {
        stepNumber: 2,
        badgeColor: "#16a34a",
        title: "BẢNG 21.1: HẠT NHÂN NHẸ ĐẾN TRUNG BÌNH",
        subtitle: "Đối chiếu bán kính thực nghiệm (đơn vị 10⁻¹⁵ m = fm)",
        phaseLabels: ["ĐO H, He...", "ĐO O, Si...", "SO SÁNH VỚI GIÁ TRỊ ƯỚC TÍNH"],
        takeaway: "H (A=1: 0,9 fm) · He (A=4: 1,7 fm) · O (A=16: 2,7 fm) · Si (A=28: 3,1 fm)",
        sceneKey: "size_table_light",
      },
      {
        stepNumber: 3,
        badgeColor: "#d97706",
        title: "BẢNG 21.1: HẠT NHÂN TRUNG BÌNH ĐẾN NẶNG",
        subtitle: "Từ Sắt (Fe) đến Uranium (U) — Nghiệm lại công thức (21.1)",
        phaseLabels: ["ĐO Fe, Cd...", "ĐO Au, U...", "ĐỐI CHIẾU VỚI CÔNG THỨC 21.1"],
        takeaway: "Fe (A=56: 3,7 fm) · Cd (114: 4,6 fm) · Au (197: 5,4 fm) · U (238: 5,9 fm)",
        sceneKey: "size_table_heavy",
      },
      {
        stepNumber: 4,
        badgeColor: "#7c3aed",
        title: "SO SÁNH: NGUYÊN TỬ (10⁻¹⁰ m) vs HẠT NHÂN (10⁻¹⁵ m)",
        subtitle: "Bán kính nguyên tử lớn gấp ~10⁴ đến 10⁵ lần bán kính hạt nhân",
        phaseLabels: ["VỎ NGUYÊN TỬ 10⁻¹⁰ m...", "PHÓNG ĐẠI TÂM 10⁴×...", "HẠT NHÂN 10⁻¹⁵ m ✓"],
        takeaway: "Bảng 21.1: Bán kính nguyên tử ~1,2–2,1·10⁻¹⁰ m >> Bán kính hạt nhân ~0,9–5,9·10⁻¹⁵ m",
        sceneKey: "size_atom_vs_nucleus",
      },
      {
        stepNumber: 5,
        badgeColor: "#e11d48",
        title: "HÌNH 21.7: TỪ TINH THỂ ĐẾN HẠT QUARK",
        subtitle: "Em có biết: Nucleon được cấu tạo từ các hạt nhỏ hơn gọi là Quark",
        phaseLabels: ["TINH THỂ → NGUYÊN TỬ...", "HẠT NHÂN → PROTON...", "3 HẠT QUARK (10⁻¹⁸ m) ✓"],
        takeaway: "10⁻² m (Tinh thể) → 10⁻⁹ m (Phân tử) → 10⁻¹⁰ m (Nguyên tử) → 10⁻¹⁴ m (Hạt nhân) → 10⁻¹⁵ m (Proton) → 10⁻¹⁸ m (Quark, e⁻)",
        sceneKey: "size_quark_scale",
      },
    ],
  },

  /* ═════════════════════════════════════════════════════════════════════════
     INFOGRAPHIC 5 — MỤC II.2: KÍ HIỆU HẠT NHÂN (SGK tr. 94–95)
     ═════════════════════════════════════════════════════════════════════════ */
  {
    id: "b21-sec5-nuclear-notation",
    sectionCode: "Mục II.2",
    sectionOrder: 5,
    sgkSectionTitle: "II.2. Kí hiệu hạt nhân ᴬ_Z X (SGK tr. 94–95)",
    posterTitle: "KÍ HIỆU HẠT NHÂN & CÁCH ĐỌC Z, A, N",
    posterSubtitle: "Giải phẫu kí hiệu ᴬ_Z X và thực hành các hạt nhân trong SGK · tr. 94–95",
    sgkPages: "94–95",
    sgkReference: "Mục II.2 tr. 94 · Câu hỏi 1, 2, 3 tr. 95 (¹²₆C, ⁴₂He, ¹⁴₇N, ¹⁹⁷₇₉Au)",
    layoutType: "stacked-cards",
    theme: "parchment",
    accentColor: "#b45309",
    footerTagline: "KÍ HIỆU ᴬ_Z X · Z PROTON · A NUCLEON · N = A − Z NEUTRON",
    cards: [
      {
        stepNumber: 1,
        badgeColor: "#d97706",
        title: "QUY TẮC KÍ HIỆU HẠT NHÂN ᴬ_Z X",
        subtitle: "Dùng kí hiệu hoá học X kèm số khối A (trên) và số hiệu Z (dưới)",
        phaseLabels: ["XÁC ĐỊNH NGUYÊN TỐ X...", "GHI SỐ Z & SỐ KHỐI A...", "TÍNH N = A − Z ✓"],
        takeaway: "Z = số proton (tra bảng tuần hoàn)  |  A = tổng nucleon  |  N = A − Z = số neutron",
        sceneKey: "not_rule_azx",
      },
      {
        stepNumber: 2,
        badgeColor: "#16a34a",
        title: "VÍ DỤ CHUẨN SGK: HẠT NHÂN CARBON ¹²₆C",
        subtitle: "Có thể ghi gọn theo dạng ᴬX là ¹²C (SGK tr. 94)",
        phaseLabels: ["ĐỌC Z = 6, A = 12...", "ĐẾM 6 PROTON...", "N = 12 − 6 = 6 NEUTRON ✓"],
        takeaway: "¹²₆C (hay ¹²C): Z = 6 proton (+)  |  N = 6 neutron (0)  |  Tổng A = 12 nucleon",
        sceneKey: "not_carbon12",
      },
      {
        stepNumber: 3,
        badgeColor: "#ef4444",
        title: "THỰC HÀNH SGK: HẠT NHÂN HELIUM ⁴₂He",
        subtitle: "Chính là hạt alpha (α) dùng trong thí nghiệm Rutherford (Câu 3 tr. 95)",
        phaseLabels: ["TRA Z(He) = 2...", "SỐ NUCLEON A = 4...", "⁴₂He GỒM 2p + 2n ✓"],
        takeaway: "⁴₂He (hạt α): Z = 2 proton (+)  |  N = 4 − 2 = 2 neutron (0)  |  A = 4 nucleon",
        sceneKey: "not_helium4",
      },
      {
        stepNumber: 4,
        badgeColor: "#2563eb",
        title: "THỰC HÀNH SGK: HẠT NHÂN NITROGEN ¹⁴₇N",
        subtitle: "Biết số lượng nucleon A = 14, tra bảng tuần hoàn Z = 7 (Câu 3 tr. 95)",
        phaseLabels: ["TRA Z(N) = 7...", "SỐ NUCLEON A = 14...", "¹⁴₇N GỒM 7p + 7n ✓"],
        takeaway: "¹⁴₇N (hay ¹⁴N): Z = 7 proton (+)  |  N = 14 − 7 = 7 neutron (0)  |  A = 14 nucleon",
        sceneKey: "not_nitrogen14",
      },
      {
        stepNumber: 5,
        badgeColor: "#9333ea",
        title: "THỰC HÀNH SGK: HẠT NHÂN VÀNG ¹⁹⁷₇₉Au",
        subtitle: "Hạt nhân lá vàng trong thí nghiệm tán xạ alpha (Câu 3 tr. 95)",
        phaseLabels: ["TRA Z(Au) = 79...", "SỐ NUCLEON A = 197...", "¹⁹⁷₇₉Au: 79p + 118n ✓"],
        takeaway: "¹⁹⁷₇₉Au: Z = 79 proton (+79e)  |  N = 197 − 79 = 118 neutron  |  A = 197 nucleon",
        sceneKey: "not_gold197",
      },
    ],
  },

  /* ═════════════════════════════════════════════════════════════════════════
     INFOGRAPHIC 6 — MỤC II.3: ĐỒNG VỊ (SGK tr. 95)
     ═════════════════════════════════════════════════════════════════════════ */
  {
    id: "b21-sec6-isotopes",
    sectionCode: "Mục II.3",
    sectionOrder: 6,
    sgkSectionTitle: "II.3. Đồng vị — Cùng số Z, khác số A (SGK tr. 95)",
    posterTitle: "ĐỒNG VỊ HẠT NHÂN (ISOTOPES)",
    posterSubtitle: "Cùng số proton Z, khác số neutron N — Đồng vị Hydrogen & Carbon · SGK tr. 95",
    sgkPages: "95",
    sgkReference: "Mục II.3 tr. 95 · Đồng vị Hydrogen (¹H, ²D, ³T) & Carbon (¹²C, ¹³C, ¹⁴C) · Câu hỏi tr. 95",
    layoutType: "stacked-cards",
    theme: "parchment",
    accentColor: "#6d28d9",
    footerTagline: "CÙNG SỐ PROTON Z · KHÁC SỐ NEUTRON N · ĐỒNG VỊ BỀN & PHÓNG XẠ",
    cards: [
      {
        stepNumber: 1,
        badgeColor: "#7c3aed",
        title: "ĐỊNH NGHĨA ĐỒNG VỊ",
        subtitle: "Các hạt nhân có cùng số Z nhưng khác số A (khác số neutron N)",
        phaseLabels: ["GIỮ NGUYÊN Z PROTON...", "THÊM HẠT NEUTRON...", "CÙNG VỊ TRÍ BẢNG TH ✓"],
        takeaway: "Cùng Z → Cùng nguyên tố hoá học (cùng tính chất hoá học), khác khối lượng",
        sceneKey: "iso_definition",
      },
      {
        stepNumber: 2,
        badgeColor: "#0284c7",
        title: "BA ĐỒNG VỊ CỦA HYDROGEN (Z = 1)",
        subtitle: "Hydrogen thường, deuterium (D) và tritium (T).",
        phaseLabels: ["¹₁H (1p, 0n)...", "²₁D (1p, 1n)...", "³₁T (1p, 2n) ✓"],
        takeaway: "Cả ba có 1 proton, lần lượt có 0, 1 và 2 neutron.",
        formula: String.raw`{}^{1}_{1}\mathrm{H}\quad{}^{2}_{1}\mathrm{H}\quad{}^{3}_{1}\mathrm{H}`,
        sceneKey: "iso_hydrogen",
      },
      {
        stepNumber: 3,
        badgeColor: "#16a34a",
        title: "BA ĐỒNG VỊ CHÍNH CỦA CARBON (Z = 6)",
        subtitle: "¹²₆C (6p, 6n) · ¹³₆C (6p, 7n) · ¹⁴₆C (6p, 8n) (SGK tr. 95)",
        phaseLabels: ["¹²₆C (6p + 6n)...", "¹³₆C (6p + 7n)...", "¹⁴₆C (6p + 8n) ✓"],
        takeaway: "¹²₆C và ¹³₆C là đồng vị bền chiếm > 99% carbon tự nhiên; ¹⁴₆C có 8 neutron",
        sceneKey: "iso_carbon",
      },
      {
        stepNumber: 4,
        badgeColor: "#e11d48",
        title: "PHÂN LOẠI: ĐỒNG VỊ BỀN vs ĐỒNG VỊ PHÓNG XẠ",
        subtitle: "Hầu hết mẫu chất tự nhiên là hỗn hợp của nhiều đồng vị",
        phaseLabels: ["ĐỒNG VỊ BỀN (¹²C, ¹³C)...", "ĐỒNG VỊ KHÔNG BỀN (¹⁴C, ³T)...", "PHÂN RÃ PHÓNG XẠ ✓"],
        takeaway: "Đồng vị bền tồn tại lâu dài  |  Đồng vị phóng xạ (như ³₁T, ¹⁴₆C) tự biến đổi",
        sceneKey: "iso_stable_vs_radioactive",
      },
      {
        stepNumber: 5,
        badgeColor: "#d97706",
        title: "CÂU HỎI SGK: VÌ SAO KHỐI LƯỢNG RIÊNG KHÁC NHAU?",
        subtitle: "Cùng một nguyên tố nhưng số neutron N khác nhau (Câu hỏi tr. 95)",
        phaseLabels: ["CÙNG KÍCH THƯỚC NGUYÊN TỬ...", "KHÁC SỐ NEUTRON N...", "KHÁC KHỐI LƯỢNG RIÊNG ρ ✓"],
        takeaway: "Trong cùng điều kiện, các đồng vị khác khối lượng nguyên tử. Khối lượng riêng của mẫu còn phụ thuộc cấu trúc và thể tích mẫu, không suy ra từ hình hạt nhân quy ước.",
        formula: String.raw`\rho=\frac{m}{V}`,
        sceneKey: "iso_density_question",
      },
    ],
  },
];

export default B21_SECTION_INFOGRAPHICS;
