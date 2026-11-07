import { NUCLEAR_REACTIONS } from "@/lib/nuclear-science";
import B21_SECTION_INFOGRAPHICS, { type B21SectionInfographic } from "./infographic-reels-b21";

/* ═══════════════════════════════════════════════════════════════════════════
   BÀI 22: PHẢN ỨNG HẠT NHÂN VÀ NĂNG LƯỢNG LIÊN KẾT (SGK tr. 96–103)
   Phân chia chi tiết theo 3 Mục SGK:
   - Mục I: Phản ứng hạt nhân & Hai định luật bảo toàn (SGK tr. 96–98)
   - Mục II: Năng lượng liên kết hạt nhân & Độ hụt khối (SGK tr. 98–100)
   - Mục III: Phản ứng phân hạch & Phản ứng nhiệt hạch (SGK tr. 100–103)
   ═══════════════════════════════════════════════════════════════════════════ */
export const B22_SECTION_INFOGRAPHICS: B21SectionInfographic[] = [
  {
    id: "b22-sec1-reactions-conservation",
    sectionCode: "Mục I",
    sectionOrder: 1,
    sgkSectionTitle: "I. Phản ứng hạt nhân & Hai định luật bảo toàn (SGK tr. 96–98)",
    posterTitle: "PHẢN ỨNG HẠT NHÂN & HAI ĐỊNH LUẬT BẢO TOÀN",
    posterSubtitle: "Thí nghiệm Rutherford (1919), Buồng sương Blackett (1925), Bảo toàn số nucleon (A) & Bảo toàn điện tích (Z)",
    sgkPages: "96–98",
    sgkReference: "Hình 22.1, 22.2 · Công thức (22.1), (22.2) · Câu hỏi tr. 97–98",
    layoutType: "stacked-cards",
    theme: "parchment",
    accentColor: "#0284c7",
    footerTagline: "⁴₂He + ¹⁴₇N → ¹⁷₈O + ¹₁H · BẢO TOÀN SỐ NUCLEON A · BẢO TOÀN ĐIỆN TÍCH Z",
    cards: [
      {
        stepNumber: 1,
        badgeColor: "#0284c7",
        title: "THÍ NGHIỆM RUTHERFORD (1919) & BUỒNG SƯƠNG BLACKETT (1925)",
        subtitle: "Phản ứng hạt nhân nhân tạo đầu tiên: bắn hạt α vào khí Nitrogen (Hình 22.1 & 22.2)",
        phaseLabels: ["BẮN CHÙM HẠT α...", "VA CHẠM HẠT NHÂN ¹⁴₇N...", "RẼ NHÁNH ¹⁷₈O + ¹₁H ✓"],
        takeaway: "⁴₂He + ¹⁴₇N → ¹⁷₈O + ¹₁H — Vết hạt α rẽ nhánh thành vết mảnh Proton và vết đậm Oxygen-17",
        sceneKey: "b22_blackett_reaction",
      },
      {
        stepNumber: 2,
        badgeColor: "#16a34a",
        title: "ĐỊNH LUẬT BẢO TOÀN SỐ NUCLEON (SỐ KHỐI A)",
        subtitle: "Công thức (22.1): Tổng số nucleon của các hạt trước phản ứng bằng tổng số nucleon sau phản ứng",
        phaseLabels: ["KIỂM TRA TRƯỚC: A₁ + A₂...", "TƯƠNG TÁC BIẾN ĐỔI...", "BẢO TOÀN: A₁ + A₂ = A₃ + A₄ ✓"],
        takeaway: "A₁ + A₂ = A₃ + A₄ (Ví dụ: 4 + 14 = 17 + 1 = 18 nucleon bảo toàn)",
        sceneKey: "b22_conservation_laws",
      },
      {
        stepNumber: 3,
        badgeColor: "#2563eb",
        title: "ĐỊNH LUẬT BẢO TOÀN ĐIỆN TÍCH (NGUYÊN TỬ SỐ Z)",
        subtitle: "Công thức (22.2): Tổng đại số điện tích các hạt trước phản ứng bằng sau phản ứng",
        phaseLabels: ["TÍNH TỔNG ĐIỆN TÍCH Z...", "CHUYỂN HOÁ HẠT NHÂN...", "Z₁ + Z₂ = Z₃ + Z₄ ✓"],
        takeaway: "Z₁ + Z₂ = Z₃ + Z₄ (Ví dụ: 2 + 7 = 8 + 1 = 9e bảo toàn điện tích tuyệt đối)",
        sceneKey: "b22_conservation_laws",
      },
    ],
  },
  {
    id: "b22-sec2-binding-energy",
    sectionCode: "Mục II",
    sectionOrder: 2,
    sgkSectionTitle: "II. Năng lượng liên kết hạt nhân & Độ hụt khối (SGK tr. 98–100)",
    posterTitle: "HỆ THỨC EINSTEIN & NĂNG LƯỢNG LIÊN KẾT",
    posterSubtitle: "Đọc công thức ở từng thẻ rồi so sánh năng lượng liên kết của các hạt nhân.",
    sgkPages: "98–100",
    sgkReference: "Công thức (22.3), (22.4), (22.5) · Hình 22.3, trang 98",
    layoutType: "stacked-cards",
    theme: "parchment",
    accentColor: "#d97706",
    footerTagline: "Khối lượng nghỉ, độ hụt khối và năng lượng liên kết riêng.",
    cards: [
      {
        stepNumber: 1,
        badgeColor: "#2563eb",
        title: "HỆ THỨC EINSTEIN VÀ ĐƠN VỊ KHỐI LƯỢNG NGUYÊN TỬ",
        subtitle: "Công thức (22.3) liên hệ năng lượng nghỉ với khối lượng.",
        phaseLabels: ["XÁC ĐỊNH KHỐI LƯỢNG m...", "NHÂN VỚI VẬN TỐC c²...", "ĐỔI ĐƠN VỊ NĂNG LƯỢNG"],
        takeaway: "Một đơn vị khối lượng nguyên tử nhân với bình phương tốc độ ánh sáng tương ứng khoảng 931,5 MeV.",
        formula: String.raw`E=mc^2,\quad (1\,\mathrm{u})c^2\approx931{,}5\,\mathrm{MeV}`,
        sceneKey: "b22_binding_energy",
      },
      {
        stepNumber: 2,
        badgeColor: "#d97706",
        title: "ĐỘ HỤT KHỐI CỦA HẠT NHÂN",
        subtitle: "Mục II.2 (tr. 99): Khối lượng hạt nhân liên kết luôn nhỏ hơn tổng khối lượng các nucleon tạo thành",
        phaseLabels: ["CÂN Z PROTON + N NEUTRON...", "GHÉP THÀNH HẠT NHÂN X...", "SO SÁNH HAI KHỐI LƯỢNG"],
        takeaway: "Tổng khối lượng nucleon tự do lớn hơn khối lượng hạt nhân liên kết.",
        formula: String.raw`\Delta m=Zm_p+Nm_n-m_{\mathrm{hn}}`,
        sceneKey: "b22_mass_defect",
      },
      {
        stepNumber: 3,
        badgeColor: "#7c3aed",
        title: "NĂNG LƯỢNG LIÊN KẾT RIÊNG",
        subtitle: "Công thức (22.5) và Hình 22.3, trang 98: Đại lượng đặc trưng cho mức độ bền vững của hạt nhân",
        phaseLabels: ["TÍNH NĂNG LƯỢNG LIÊN KẾT", "CHIA CHO SỐ KHỐI A...", "SO SÁNH THEO SỐ KHỐI"],
        takeaway: "Các hạt nhân ở vùng sắt có năng lượng liên kết riêng lớn. Hạt nhân sắt-56 là một ví dụ, không phải đồng vị có giá trị lớn nhất.",
        formula: String.raw`E_{\mathrm{lk,r}}=\frac{E_{\mathrm{lk}}}{A}`,
        sceneKey: "b22_binding_energy",
      },
    ],
  },
  {
    id: "b22-sec3-fission-fusion",
    sectionCode: "Mục III",
    sectionOrder: 3,
    sgkSectionTitle: "III. Phản ứng phân hạch & Phản ứng nhiệt hạch (SGK tr. 100–103)",
    posterTitle: "PHÂN HẠCH DÂY CHUYỀN & NHIỆT HẠCH MẶT TRỜI",
    posterSubtitle: "Phân hạch ²³⁵U tỏa ~200 MeV, Hệ số nhân neutron k và Nhiệt hạch D-T tỏa 17,6 MeV",
    sgkPages: "100–103",
    sgkReference: "Hình 22.6, 22.7 · trang 101–102",
    layoutType: "stacked-cards",
    theme: "parchment",
    accentColor: "#dc2626",
    footerTagline: "²³⁵U + n → 2 MẢNH + 3n (~200 MeV) · ²H + ³H → ⁴He + n (17,6 MeV) · HỆ SỐ k",
    cards: [
      {
        stepNumber: 1,
        badgeColor: "#dc2626",
        title: "PHẢN ỨNG PHÂN HẠCH HẠT NHÂN NẶNG (URANIUM-235)",
        subtitle: "Hình 22.6 (tr. 101): Hấp thụ 1 neutron chậm, vỡ thành 2 mảnh trung bình và tỏa ~200 MeV",
        phaseLabels: ["NEUTRON CHẬM TỚI...", "KÍCH THÍCH ²³⁶U* VỠ ĐÔI...", "TÁCH MẢNH VÀ PHÁT NEUTRON"],
        takeaway: "Một kênh phân hạch của urani-235. Phần lớn năng lượng tỏa ra dưới dạng động năng sản phẩm.",
        formula: NUCLEAR_REACTIONS.fission.latex,
        sceneKey: "b22_fission_fusion",
      },
      {
        stepNumber: 2,
        badgeColor: "#b45309",
        title: "PHẢN ỨNG DÂY CHUYỀN & HỆ SỐ NHÂN NEUTRON k",
        subtitle: "Mục III.1 (tr. 101–102): Điều kiện số phản ứng giảm, duy trì hoặc tăng qua các thế hệ tùy hệ số nhân",
        phaseLabels: ["NEUTRON THẾ HỆ 1...", "NHÂN HỆ SỐ k...", "DUY TRÌ k = 1 TRONG LÒ PHẢN ỨNG ✓"],
        takeaway: "Với hệ số nhân không đổi, số phản ứng tăng khi hệ số lớn hơn 1. Riêng điều kiện đó chưa đủ để kết luận có vụ nổ.",
        sceneKey: "b22_fission_fusion",
      },
      {
        stepNumber: 3,
        badgeColor: "#16a34a",
        title: "PHẢN ỨNG NHIỆT HẠCH (TỔNG HỢP HẠT NHÂN NHẸ)",
        subtitle: "Trang 102–103. Tổng hợp đơteri và triti tạo heli-4 và neutron, giải phóng năng lượng.",
        phaseLabels: ["NHIỆT ĐỘ T ~ 10⁸ K...", "THẮNG ĐẨY COULOMB...", "²H + ³H → ⁴He + n + 17,6 MeV ✓"],
        takeaway: "Phản ứng D–T tỏa khoảng 17,6 MeV. Đây là một ví dụ nhiệt hạch. Mặt Trời chủ yếu chuyển hiđrô thành heli qua chuỗi proton–proton.",
        formula: NUCLEAR_REACTIONS.fusion.latex,
        sceneKey: "b22_fission_fusion",
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   BÀI 23: HIỆN TƯỢNG PHÓNG XẠ (SGK tr. 104–112)
   Phân chia chi tiết theo 2 Mục SGK:
   - Mục I: Hiện tượng phóng xạ & Bản chất các tia α, β, γ (SGK tr. 104–107)
   - Mục II: Định luật phóng xạ & Chu kì bán rã T (SGK tr. 107–112)
   ═══════════════════════════════════════════════════════════════════════════ */
export const B23_SECTION_INFOGRAPHICS: B21SectionInfographic[] = [
  {
    id: "b23-sec1-rays-properties",
    sectionCode: "Mục I",
    sectionOrder: 1,
    sgkSectionTitle: "I. Hiện tượng phóng xạ & Bản chất các tia α, β, γ (SGK tr. 104–107)",
    posterTitle: "HIỆN TƯỢNG PHÓNG XẠ & BẢN CHẤT CÁC TIA",
    posterSubtitle: "Khám phá Becquerel – Curie, bản chất 3 tia phóng xạ, khả năng đâm xuyên và sự lệch trong điện từ trường",
    sgkPages: "104–107",
    sgkReference: "Hình 23.1–23.4 · Bảng 23.1 · Khả năng ion hoá và đâm xuyên",
    layoutType: "stacked-cards",
    theme: "parchment",
    accentColor: "#be123c",
    footerTagline: "TIA α (⁴₂He, +2e) · TIA β⁻ (e⁻, -e), β⁺ (e⁺, +e) · TIA γ (PHOTON) · CHE CHẮN",
    cards: [
      {
        stepNumber: 1,
        badgeColor: "#be123c",
        title: "KHÁM PHÁ HIỆN TƯỢNG PHÓNG XẠ TỰ NHIÊN (1896 – 1898)",
        subtitle: "Becquerel phát hiện muối Uranium tự bức xạ (1896); Ông bà Curie tìm ra Polonium và Radium (1898)",
        phaseLabels: ["MUỐI URANIUM BỌC KÍN...", "LÀM ĐEN KÍNH ẢNH TRONG TỐI...", "PHÁT HIỆN TÍNH PHÓNG XẠ ✓"],
        takeaway: "Phóng xạ là quá trình phân rã tự phát của hạt nhân không bền, hoàn toàn không phụ thuộc yếu tố bên ngoài",
        sceneKey: "b23_activity_geiger",
      },
      {
        stepNumber: 2,
        badgeColor: "#d97706",
        title: "BẢN CHẤT & ĐỘ ĐÂM XUYÊN CỦA 3 TIA α, β, γ",
        subtitle: "Mục I.2 (Hình 23.3 tr. 106): So sánh khả năng ion hoá và khả năng xuyên qua giấy, nhôm, chì",
        phaseLabels: ["PHÁT 3 TIA α, β, γ...", "GẶP GIẤY & TẤM NHÔM...", "CHỈ TIA γ XUYÊN TỚI TẤM CHÌ ✓"],
        takeaway: "Tia α (⁴₂He) bị tờ giấy chặn  |  Tia β (e⁻/e⁺) bị tấm nhôm vài mm chặn  |  Tia γ (photon) cần tấm chì dày",
        sceneKey: "b23_three_rays_penetration",
      },
      {
        stepNumber: 3,
        badgeColor: "#2563eb",
        title: "SỰ LỆCH CỦA TIA α, β, γ TRONG ĐIỆN TRƯỜNG & TỪ TRƯỜNG",
        subtitle: "Hình 23.4 (tr. 107): Lực điện F = qE và lực Lorentz F_L = q(v x B) xác định dấu điện tích",
        phaseLabels: ["ĐI VÀO ĐIỆN TRƯỜNG...", "LỰC ĐIỆN F = qE TÁC DỤNG...", "α LỆCH VỀ (−), β⁻ VỀ (+), γ ĐI THẲNG ✓"],
        takeaway: "α (+2e) lệch về cực âm  |  β⁻ (−e) lệch mạnh về cực dương  |  γ (q = 0) không mang điện nên truyền thẳng",
        sceneKey: "b23_deflection_field",
      },
    ],
  },
  {
    id: "b23-sec2-decay-law",
    sectionCode: "Mục II",
    sectionOrder: 2,
    sgkSectionTitle: "II. Định luật phóng xạ & Độ phóng xạ (SGK tr. 107–112)",
    posterTitle: "ĐỊNH LUẬT PHÓNG XẠ & CHU KÌ BÁN RÃ T",
    posterSubtitle: "Quy luật suy giảm hàm mũ, độ phóng xạ và phép đếm bằng ống Geiger.",
    sgkPages: "107–112",
    sgkReference: "Hình 23.5, trang 107 · Bảng 23.2, trang 108",
    layoutType: "stacked-cards",
    theme: "parchment",
    accentColor: "#9333ea",
    footerTagline: "Một becquerel tương ứng một phân rã mỗi giây.",
    cards: [
      {
        stepNumber: 1,
        badgeColor: "#16a34a",
        title: "CHU KÌ BÁN RÃ T & ĐỊNH LUẬT SUY GIẢM HÀM SỐ MŨ",
        subtitle: "Mục II.1 (Hình 23.5, Bảng 23.2 tr. 107–108): Cứ sau thời gian T, số hạt nhân giảm một nửa",
        phaseLabels: ["BAN ĐẦU N₀ HẠT...", "SAU MỘT CHU KÌ", "ĐỌC SỐ HẠT KÌ VỌNG"],
        takeaway: "Sau hai chu kì còn một phần tư, sau ba chu kì còn một phần tám số hạt nhân mẹ theo kì vọng.",
        formula: String.raw`N(t)=N_0\,2^{-\frac{t}{T}}\qquad N(t)=N_0e^{-\lambda t}\qquad\lambda=\frac{\ln2}{T}`,
        sceneKey: "b23_half_life_curve",
      },
      {
        stepNumber: 2,
        badgeColor: "#9333ea",
        title: "ĐỘ PHÓNG XẠ H (ĐƠN VỊ BECQUEREL & CURIE)",
        subtitle: "Mục II.2 (tr. 108–109): Số phân rã trong một giây của mẫu phóng xạ: H(t) = λ·N(t)",
        phaseLabels: ["TÍNH H = λ·N...", "GIẢM CÙNG TỈ LỆ VỚI N...", "ĐỌC HOẠT ĐỘ"],
        takeaway: "Hoạt độ là số phân rã mỗi giây, khác số xung thiết bị phát hiện.",
        formula: String.raw`H(t)=\lambda N(t)\qquad H(t)=H_0\,2^{-\frac{t}{T}}`,
        sceneKey: "b23_activity_geiger",
      },
      {
        stepNumber: 3,
        badgeColor: "#2563eb",
        title: "NGUYÊN LÝ HOẠT ĐỘNG ỐNG ĐẾM GEIGER–MÜLLER",
        subtitle: "Hình 23.2 (tr. 105). Bức xạ đến ống đếm có thể ion hóa khí và tạo xung.",
        phaseLabels: ["TIA PHÓNG XẠ ĐI VÀO ỐNG...", "ION HOÁ KHÍ TRONG ỐNG...", "MÁY ĐẾM XUNG GHI NHẬN TÍN HIỆU ✓"],
        takeaway: "Mỗi hạt bức xạ ion hoá khí tạo thác electron kích hoạt 1 xung điện tín hiệu trên máy đo",
        sceneKey: "b23_activity_geiger",
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   BÀI 24: CÔNG NGHỆ HẠT NHÂN VÀ NGUYÊN TẮC AN TOÀN (SGK tr. 113–119)
   Phân chia chi tiết theo 2 Mục SGK:
   - Mục I: Nhà máy điện hạt nhân & Lò phản ứng PWR (SGK tr. 114–115)
   - Mục II: Ứng dụng bức xạ hạt nhân trong đời sống (SGK tr. 116–118)
   ═══════════════════════════════════════════════════════════════════════════ */
export const B24_SECTION_INFOGRAPHICS: B21SectionInfographic[] = [
  {
    id: "b24-sec1-nuclear-power",
    sectionCode: "Mục I",
    sectionOrder: 1,
    sgkSectionTitle: "I. Nhà máy điện hạt nhân & Lò phản ứng PWR (SGK tr. 114–115)",
    posterTitle: "NHÀ MÁY ĐIỆN HẠT NHÂN & LÒ PHẢN ỨNG",
    posterSubtitle: "Cấu tạo lò phản ứng, thanh điều khiển Bo/Cd duy trì k = 1 và hai vòng tuần hoàn kín an toàn",
    sgkPages: "114–115",
    sgkReference: "Hình 24.1, 24.2, 24.3 · Lò phản ứng nước áp lực PWR tr. 114–115",
    layoutType: "stacked-cards",
    theme: "parchment",
    accentColor: "#0d9488",
    footerTagline: "Mô hình lò nước áp lực dùng hai vòng tách biệt để trao đổi nhiệt.",
    cards: [
      {
        stepNumber: 1,
        badgeColor: "#b45309",
        title: "LÒ PHẢN ỨNG HẠT NHÂN & THANH ĐIỀU KHIỂN (k = 1)",
        subtitle: "Hình 24.1–24.3 (tr. 114–115): Kiểm soát phản ứng phân hạch dây chuyền của ²³⁵U",
        phaseLabels: ["PHÂN HẠCH ²³⁵U...", "ĐIỀU CHỈNH THANH BO / Cd...", "DUY TRÌ PHẢN ỨNG DÂY CHUYỀN"],
        takeaway: "Thanh điều khiển chứa Boron hoặc Cadmium hấp thụ neutron thừa để giữ hệ số nhân neutron k = 1 ổn định",
        sceneKey: "b24_reactor_core",
      },
      {
        stepNumber: 2,
        badgeColor: "#0284c7",
        title: "CHUỖI CHUYỂN HOÁ NĂNG LƯỢNG TRONG NHÀ MÁY ĐIỆN HẠT NHÂN",
        subtitle: "Hình 24.1 (tr. 114). Theo dõi nước ở hai vòng và vị trí trao đổi nhiệt.",
        phaseLabels: ["NĂNG LƯỢNG HẠT NHÂN...", "NHIỆT NĂNG → CƠ NĂNG TURBINE...", "ĐIỆN NĂNG LƯỚI ĐIỆN QUỐC GIA ✓"],
        takeaway: "Năng lượng phân hạch → Nhiệt nước sơ cấp (vòng kín 1) → Hơi nước thứ cấp (vòng 2) → Turbine → Máy phát điện",
        sceneKey: "b24_pwr_plant",
      },
      {
        stepNumber: 3,
        badgeColor: "#16a34a",
        title: "HỆ THỐNG AN TOÀN & BẢO VỆ ĐA TẦNG",
        subtitle: "Vỏ thùng áp lực thép dày, nhà lò bê tông cốt thép dự ứng lực chịu áp suất và động đất",
        phaseLabels: ["VỎ THÙNG ÁP LỰC...", "TÒA NHÀ BẢO VỆ CHÌ & BÊ TÔNG...", "GIẢM NGUY CƠ PHÁT TÁN"],
        takeaway: "Làm mát và các hàng rào bảo vệ có nhiệm vụ khác nhau.",
        sceneKey: "b24_reactor_core",
      },
    ],
  },
  {
    id: "b24-sec2-applications",
    sectionCode: "Mục II",
    sectionOrder: 2,
    sgkSectionTitle: "II. Ứng dụng bức xạ hạt nhân trong đời sống (SGK tr. 116–118)",
    posterTitle: "ỨNG DỤNG BỨC XẠ",
    posterSubtitle: "Y học, công nghiệp và nông nghiệp.",
    sgkPages: "116–118",
    sgkReference: "Hình 24.4, 24.5 · trang 116–117",
    layoutType: "stacked-cards",
    theme: "parchment",
    accentColor: "#6d28d9",
    footerTagline: "PET/CT · XẠ TRỊ ⁶⁰Co · ĐỒNG VỊ ĐÁNH DẤU · CHIẾU XẠ NÔNG SẢN",
    cards: [
      {
        stepNumber: 1,
        badgeColor: "#be185d",
        title: "Y HỌC HẠT NHÂN: CHẨN ĐOÁN PET & XẠ TRỊ UNG THƯ",
        subtitle: "Hình 24.4 (tr. 116): Dược chất phóng xạ ¹⁸F chẩn đoán PET/CT và chùm tia gamma ⁶⁰Co diệt khối u ác tính",
        phaseLabels: ["TIÊM DƯỢC CHẤT PHÓNG XẠ...", "CHỤP CẮT LỚP PET/CT...", "PHÂN BIỆT CHẨN ĐOÁN VÀ ĐIỀU TRỊ"],
        takeaway: "Chẩn đoán sớm khối u bằng máy PET/CT · Điều trị ung thư tuyến giáp bằng ¹³¹I và xạ trị u bằng nguồn ⁶⁰Co",
        sceneKey: "b24_nuclear_medicine",
      },
      {
        stepNumber: 2,
        badgeColor: "#16a34a",
        title: "NÔNG NGHIỆP & CÔNG NGHIỆP: CHIẾU XẠ & KIỂM ĐỊNH",
        subtitle: "Hình 24.5 (tr. 117–118): Diệt khuẩn bảo quản nông sản xuất khẩu và chụp ảnh khuyết tật mối hàn kim loại",
        phaseLabels: ["CHIẾU TIA GAMMA...", "GIẢM VI SINH VẬT TRONG ĐIỀU KIỆN PHÙ HỢP", "KIỂM TRA ĐỘ DÀY & MỐI HÀN ✓"],
        takeaway: "Chiếu xạ có thể hỗ trợ bảo quản nông sản. Ảnh bức xạ có thể giúp phát hiện khuyết tật bên trong mối hàn.",
        sceneKey: "b24_agri_industry",
      },
    ],
  },
];

// B25: lưu ý, bài tập ví dụ và bài tập vận dụng (SGK trang 119–122).
export const B25_SECTION_INFOGRAPHICS: B21SectionInfographic[] = [
  {
    id: "b25-sec1-practice-data",
    sectionCode: "Đọc dữ liệu",
    sectionOrder: 1,
    sgkSectionTitle: "III. Bài tập vận dụng",
    posterTitle: "ƯỚC LƯỢNG CHU KÌ BÁN RÃ",
    posterSubtitle: "Dùng các mốc đo trong Bảng 25.1 để tìm khoảng thời gian tại mức nửa hoạt độ ban đầu.",
    sgkPages: "121",
    sgkReference: "Bảng 25.1, trang 121",
    layoutType: "stacked-cards",
    theme: "parchment",
    accentColor: "#4f46e5",
    footerTagline: "Các điểm là số liệu SGK. Giá trị nội suy là ước lượng, không phải phép đo mới.",
    cards: [
      {
        stepNumber: 1, badgeColor: "#4f46e5", title: "ĐỌC CÁC CẶP THỜI GIAN VÀ HOẠT ĐỘ",
        subtitle: "Các mốc đầu là 0, 30, 60 và 120 giây.",
        phaseLabels: ["CHỌN ĐẠI LƯỢNG", "ĐỌC ĐIỂM TRÊN ĐỒ THỊ", "SO SÁNH CÁC MỐC"],
        takeaway: "Bảng ghi 151 Bq ở 0 giây, 85 Bq ở 30 giây, 55 Bq ở 60 giây và 31 Bq ở 120 giây.",
        sceneKey: "b25_decay_data",
      },
      {
        stepNumber: 2, badgeColor: "#059669", title: "TÌM MỐC NỬA HOẠT ĐỘ",
        subtitle: "Dóng từ mức 75,5 Bq tới trục thời gian.",
        phaseLabels: ["TÌM MỨC NỬA BAN ĐẦU", "KHOANH KHOẢNG", "NÊU CÁCH ƯỚC LƯỢNG"],
        formula: String.raw`H(T)=\frac{H_0}{2}=75{,}5\,\mathrm{Bq}`,
        takeaway: "Chu kì nằm trong khoảng 30–60 giây. Nội suy thẳng giữa hai điểm cho khoảng 39,5 giây.",
        sceneKey: "b25_decay_data",
      },
    ],
  },
  {
    id: "b25-sec2-example-exercises",
    sectionCode: "Giải bài tập",
    sectionOrder: 2,
    sgkSectionTitle: "I. Một số lưu ý và II. Bài tập ví dụ",
    posterTitle: "KIỂM TRA KÍ HIỆU, PHƯƠNG TRÌNH VÀ ĐƠN VỊ",
    posterSubtitle: "Ôn cách đọc kí hiệu hạt nhân, kiểm tra bảo toàn và đổi đơn vị năng lượng.",
    sgkPages: "119–120",
    sgkReference: "Mục I và II, trang 119–120",
    layoutType: "stacked-cards",
    theme: "parchment",
    accentColor: "#15803d",
    footerTagline: "Trình bày rõ đại lượng, dữ kiện, phương trình và kết quả có đơn vị.",
    cards: [
      {
        stepNumber: 1, badgeColor: "#4f46e5", title: "CỘNG SỐ NUCLEON VÀ ĐIỆN TÍCH",
        subtitle: "Tính tổng mỗi vế trước khi điền hạt còn thiếu.",
        phaseLabels: ["ĐỌC SỐ KHỐI", "CỘNG ĐIỆN TÍCH", "ĐỐI CHIẾU HAI VẾ"],
        formula: String.raw`{}^{4}_{2}\mathrm{He}+{}^{14}_{7}\mathrm{N}\longrightarrow{}^{17}_{8}\mathrm{O}+{}^{1}_{1}\mathrm{p}`,
        takeaway: "Ở ví dụ này tổng số nucleon là 18 và tổng điện tích là 9e ở cả hai vế.",
        sceneKey: "b22_conservation_laws",
      },
      {
        stepNumber: 2, badgeColor: "#b45309", title: "ĐỔI ĐỘ HỤT KHỐI THÀNH NĂNG LƯỢNG",
        subtitle: "Dùng nhất quán khối lượng hạt nhân hoặc khối lượng nguyên tử đã hiệu chỉnh.",
        phaseLabels: ["CHỌN DỮ KIỆN", "TÍNH ĐỘ HỤT KHỐI", "KIỂM TRA ĐƠN VỊ"],
        formula: String.raw`E_{\mathrm{lk}}=\Delta m\,c^2\qquad (1\,\mathrm{u})c^2\approx 931{,}5\,\mathrm{MeV}`,
        takeaway: "Năng lượng liên kết riêng là năng lượng liên kết tính trên một nucleon.",
        sceneKey: "b22_binding_energy",
      },
    ],
  },
];

export function getSectionInfographicsByLesson(code: string): B21SectionInfographic[] {
  switch (code.toUpperCase()) {
    case "B21":
      return B21_SECTION_INFOGRAPHICS;
    case "B22":
      return B22_SECTION_INFOGRAPHICS;
    case "B23":
      return B23_SECTION_INFOGRAPHICS;
    case "B24":
      return B24_SECTION_INFOGRAPHICS;
    case "B25":
      return B25_SECTION_INFOGRAPHICS;
    default:
      return B21_SECTION_INFOGRAPHICS;
  }
}
