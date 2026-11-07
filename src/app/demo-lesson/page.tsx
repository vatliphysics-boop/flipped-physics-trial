"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublicShell } from "@/app/PublicShell";
import { LatexMath } from "@/components/learning/LatexMath";
import { HalfLifeDiscovery } from "@/components/learning/HalfLifeDiscovery";
import { InfographicGallery } from "@/components/learning/InfographicReels";
import { getSectionInfographicsByLesson } from "@/data/infographic-reels-all";
import { NuclearHistory } from "@/components/learning/NuclearHistory";
import { AIStudyHelp } from "@/components/learning/AIStudyHelp";
import { FixedPhysicsActivityRenderer } from "@/components/physics/FixedPhysicsActivityRenderer";
import type { CanonicalActivityKey } from "@/lib/curriculum";

const DIAGNOSTIC_QUESTIONS = [
  {
    id: "q1",
    question:
      "Câu 1: Khi đi qua vùng có từ trường đều vuông góc với phương truyền, tia phóng xạ nào hoàn toàn không bị lệch quỹ đạo?",
    latexHint: "\\vec{F}_{\\text{L}} = q(\\vec{v} \\times \\vec{B})",
    options: [
      "A. Tia alpha vì mang điện tích +2e.",
      "B. Tia beta âm vì là dòng electron mang điện tích -e.",
      "C. Tia gamma vì có bản chất là sóng điện từ (q = 0).",
      "D. Cả ba tia đều bị lệch như nhau.",
    ],
    correctIndex: 2,
    feedbackCorrect:
      "Chính xác. Tia gamma là bức xạ điện từ (photon không mang điện, q = 0), do đó lực từ Lorentz bằng 0 và tia truyền thẳng.",
    feedbackWrong:
      "Chưa chính xác. Theo biểu thức lực Lorentz, chỉ hạt không mang điện (q = 0) như photon tia gamma mới không bị lệch trong từ trường.",
  },
  {
    id: "q2",
    question:
      "Câu 2: Một mẫu đồng vị phóng xạ Iodine-131 có chu kì bán rã T = 8 ngày và số hạt ban đầu N₀ = 1600 hạt. Sau thời gian t = 24 ngày, số hạt nhân chưa bị phân rã còn lại là:",
    latexHint: "N(t) = N_0 \\cdot 2^{-\\frac{t}{T}}",
    options: ["A. 800 hạt", "B. 400 hạt", "C. 200 hạt", "D. 0 hạt"],
    correctIndex: 2,
    feedbackCorrect:
      "Chính xác. Sau t = 24 ngày = 3T, số hạt còn lại là N = 1600 / 2³ = 200 hạt.",
    feedbackWrong:
      "Chưa chính xác. Sau 3 chu kì bán rã (t = 3T), số hạt giảm đi 2³ = 8 lần (N = 1600 / 8 = 200 hạt).",
  },
  {
    id: "q3",
    question:
      "Câu 3: Ba nguyên tắc cơ bản trong an toàn bức xạ hạt nhân gồm những yếu tố nào?",
    latexHint: "I \\propto \\frac{1}{r^2}",
    options: [
      "A. Tăng nhiệt độ, tăng áp suất và dùng chất xúc tác hóa học.",
      "B. Giảm thời gian tiếp xúc, tăng khoảng cách tới nguồn và che chắn phù hợp.",
      "C. Chiếu tia hồng ngoại để triệt tiêu tia phóng xạ.",
      "D. Chỉ cần làm lạnh nguồn phóng xạ xuống dưới 0°C.",
    ],
    correctIndex: 1,
    feedbackCorrect:
      "Chính xác. Quá trình phóng xạ không phụ thuộc vào nhiệt độ hay áp suất. Ba nguyên tắc an toàn là: Thời gian – Khoảng cách – Che chắn.",
    feedbackWrong:
      "Chưa chính xác. Phóng xạ là quá trình biến đổi hạt nhân không phụ thuộc vào yếu tố ngoại cảnh; cần tuân thủ: Giảm thời gian, tăng khoảng cách và che chắn bằng chì/bê tông.",
  },
];

const ROLE_PLAY_PERSONAS = [
  {
    id: "scientist",
    role: "Nhà khoa học Vật lí Hạt nhân",
    stance: "Phân tích hiệu suất năng lượng liên kết và cơ chế tự ổn định của lò phản ứng nước áp lực (PWR)",
    latex: "\\Delta E = \\Delta m \\cdot c^2 \\quad (1\\text{ g }{}_{92}^{235}\\mathrm{U} \\approx 8{,}2 \\times 10^{10}\\text{ J})",
    arguments: [
      "Mật độ năng lượng hạt nhân vượt trội: Phân hạch hoàn toàn 1 kg Uranium-235 giải phóng năng lượng tương đương đốt khoảng 2,7 triệu kg than đá mà không phát thải khí CO₂.",
      "Lò phản ứng PWR sử dụng thanh điều khiển chứa Boron hoặc Cadmium để giữ hệ số nhân neutron k = 1 ổn định và có hệ số phản hồi nhiệt độ âm.",
      "Hệ thống che chắn nhiều lớp bằng bê tông cốt thép và chì ngăn chặn tia gamma và neutron thoát ra ngoài.",
    ],
    questionPrompt:
      "Vì sao nhiên liệu trong nhà máy điện hạt nhân (làm giàu U-235 ở mức 3–5%) không thể gây ra vụ nổ hạt nhân như vũ khí nguyên tử?",
  },
  {
    id: "resident",
    role: "Người dân địa phương",
    stance: "Đặt yêu cầu minh bạch về quan trắc độ phóng xạ và vùng đệm an toàn",
    latex: "H(t) = \\lambda N(t) = \\frac{\\ln 2}{T} N(t)",
    arguments: [
      "Yêu cầu giám sát chặt chẽ nguy cơ rò rỉ các đồng vị phóng xạ như Iodine-131 (T = 8 ngày) và Caesium-137 (T = 30,2 năm) đối với nguồn nước và nông sản.",
      "Đề nghị lắp đặt hệ thống trạm đo độ phóng xạ công khai theo thời gian thực tại các khu dân cư lân cận.",
      "Thiết lập bán kính vùng an toàn dựa trên quy luật giảm cường độ bức xạ theo bình phương khoảng cách.",
    ],
    questionPrompt:
      "Những chỉ số an toàn bức xạ nào cần được hiển thị công khai hàng ngày cho cộng đồng dân cư quanh nhà máy?",
  },
  {
    id: "economist",
    role: "Chuyên gia Kinh tế & Năng lượng",
    stance: "Đánh giá tính ổn định của nguồn điện nền (baseload) và chi phí nhiên liệu dài hạn",
    latex: "P = \\frac{N_{\\text{phân hạch}} \\cdot E_0}{t}",
    arguments: [
      "Điện hạt nhân cung cấp nguồn công suất nền liên tục 24/7 với hệ số khả dụng trên 90%, không phụ thuộc vào thời tiết như điện gió hay điện mặt trời.",
      "Dù vốn đầu tư ban đầu lớn do tiêu chuẩn an toàn nghiêm ngặt, chi phí nhiên liệu Uranium chiếm tỉ trọng nhỏ giúp giá thành điện ổn định trong chu kì vận hành 60 năm.",
      "Tạo động lực phát triển công nghệ đồng vị phóng xạ phục vụ y tế và chiếu xạ nông sản xuất khẩu.",
    ],
    questionPrompt:
      "Một nhà máy công suất điện 1000 MW (hiệu suất nhiệt điện 33%) cần phân hạch bao nhiêu kg Uranium-235 trong một năm?",
  },
  {
    id: "environmentalist",
    role: "Chuyên gia Môi trường",
    stance: "So sánh phát thải khí nhà kính và bài toán lưu trữ chất thải phóng xạ chu kì dài",
    latex: "N(t) = N_0 \\cdot 2^{-\\frac{t}{T}} \\quad (t = 10T \\Rightarrow N \\approx 0{,}001 N_0)",
    arguments: [
      "Điện hạt nhân có mức phát thải CO₂ toàn vòng đời rất thấp (~12 g/kWh), đóng vai trò quan trọng trong mục tiêu giảm phát thải ròng.",
      "Thách thức cốt lõi là quy trình đóng rắn và lưu trữ địa chất sâu đối với nhiên liệu đã qua sử dụng chứa các đồng vị có chu kì bán rã hàng nghìn năm.",
      "Cần kiểm soát chênh lệch nhiệt độ nước làm mát trước khi hoàn trả ra môi trường biển.",
    ],
    questionPrompt:
      "Vì sao chất thải phóng xạ cần được cô lập tối thiểu 10 chu kì bán rã để độ phóng xạ giảm xuống dưới 0,1% mức ban đầu?",
  },
];

const GAMIFICATION_CHALLENGES = [
  {
    title: "Bài toán 1 · Độ hụt khối của hạt nhân Helium",
    prompt: "Tính độ hụt khối của hạt nhân Helium-4 từ khối lượng các nucleon tạo thành:",
    latexQuestion:
      "m_p = 1{,}0073\\text{ u}; \\quad m_n = 1{,}0087\\text{ u}; \\quad m_{\\text{He}} = 4{,}0015\\text{ u}. \\quad \\Delta m = 2m_p + 2m_n - m_{\\text{He}} = ?",
    options: ["0,0305 u", "0,0503 u", "4,0320 u", "0,0152 u"],
    correct: 0,
    latexSolution: "\\Delta m = 2 \\times 1{,}0073 + 2 \\times 1{,}0087 - 4{,}0015 = 0{,}0305\\text{ u}",
  },
  {
    title: "Bài toán 2 · Năng lượng liên kết riêng",
    prompt: "Từ độ hụt khối vừa tìm được, xác định năng lượng liên kết riêng của hạt nhân Helium-4:",
    latexQuestion:
      "\\Delta m({}_{2}^{4}\\mathrm{He}) = 0{,}0305\\text{ u}, \\quad 1\\text{ u}c^2 = 931{,}5\\text{ MeV}. \\quad E_{\\text{lkr}} = \\frac{\\Delta m \\cdot c^2}{A} = ?",
    options: ["28,41 MeV/nucleon", "7,10 MeV/nucleon", "14,20 MeV/nucleon", "93,15 MeV/nucleon"],
    correct: 1,
    latexSolution:
      "E_{\\text{lk}} = 0{,}0305 \\times 931{,}5 \\approx 28{,}41\\text{ MeV} \\implies E_{\\text{lkr}} = \\frac{28{,}41}{4} \\approx 7{,}10\\text{ MeV/nucleon}",
  },
  {
    title: "Bài toán 3 · Định luật bảo toàn số nucleon trong phân hạch",
    prompt: "Xác định số neutron thứ cấp k sinh ra trong phương trình phân hạch sau:",
    latexQuestion:
      "{}_{0}^{1}\\mathrm{n} + {}_{92}^{235}\\mathrm{U} \\rightarrow {}_{56}^{141}\\mathrm{Ba} + {}_{36}^{92}\\mathrm{Kr} + k\\,{}_{0}^{1}\\mathrm{n}",
    options: ["k = 1", "k = 2", "k = 3", "k = 4"],
    correct: 2,
    latexSolution: "1 + 235 = 141 + 92 + k \\cdot 1 \\implies 236 = 233 + k \\implies k = 3",
  },
];

const MINDMAP_BRANCHES = [
  {
    id: "medicine",
    title: "Y học hạt nhân",
    latex: "{}_{53}^{131}\\mathrm{I} \\quad (T = 8\\text{ ngày}), \\qquad {}_{27}^{60}\\mathrm{Co} \\quad (T = 5{,}27\\text{ năm})",
    uses: [
      "Chẩn đoán hình ảnh chức năng bằng thiết bị chụp cắt lớp phát xạ Positron (PET/CT).",
      "Điều trị ung thư tuyến giáp bằng dược chất phóng xạ Iodine-131.",
      "Xạ trị khối u bằng chùm tia gamma từ nguồn Cobalt-60.",
    ],
  },
  {
    id: "agriculture",
    title: "Nông nghiệp & Bảo quản",
    latex: "{}_{15}^{32}\\mathrm{P} \\quad (T = 14{,}3\\text{ ngày}), \\qquad {}_{55}^{137}\\mathrm{Cs}",
    uses: [
      "Chiếu xạ tia gamma giúp diệt vi sinh vật và bảo quản nông sản xuất khẩu mà không để lại dư lượng phóng xạ.",
      "Tạo đột biến chọn giống cây trồng có năng suất cao, chống chịu sâu bệnh.",
      "Sử dụng đồng vị đánh dấu Phosphorus-32 để khảo sát sự hấp thụ phân bón của cây.",
    ],
  },
  {
    id: "industry",
    title: "Công nghiệp & Kiểm định",
    latex: "{}_{77}^{192}\\mathrm{Ir}, \\qquad I = I_0 \\cdot e^{-\\mu d}",
    uses: [
      "Kiểm tra khuyết tật mối hàn kim loại, đường ống dẫn dầu bằng phương pháp chụp ảnh bức xạ không phá hủy mẫu.",
      "Đo tự động độ dày vật liệu và mức chất lỏng trong bồn kín thông qua độ suy giảm cường độ chùm tia.",
    ],
  },
  {
    id: "archaeology",
    title: "Khảo cổ & Địa chất",
    latex: "{}_{6}^{14}\\mathrm{C} \\rightarrow {}_{7}^{14}\\mathrm{N} + {}_{-1}^{0}\\mathrm{e} + \\bar{\\nu}_e \\quad (T = 5730\\text{ năm})",
    uses: [
      "Xác định niên đại cổ vật có nguồn gốc sinh vật bằng phương pháp đồng vị phóng xạ Carbon-14.",
      "Xác định tuổi đá địa chất dựa trên chuỗi phân rã Uranium-238 thành Chì-206.",
    ],
  },
];

const SRL_CRITERIA = [
  {
    id: "srl1",
    component: "1. Xác định mục tiêu và lập kế hoạch",
    statement:
      "Chủ động đọc mục tiêu bài học và hoàn thành việc quan sát mô phỏng 3D trước khi đến lớp.",
  },
  {
    id: "srl2",
    component: "2. Tiếp nhận và xử lí thông tin",
    statement:
      "Phân biệt được bản chất các tia α, β, γ và vận dụng được định luật phóng xạ.",
  },
  {
    id: "srl3",
    component: "3. Hợp tác và giải quyết vấn đề",
    statement:
      "Sử dụng được các hệ thức năng lượng liên kết và nguyên tắc an toàn bức xạ để bảo vệ quan điểm nhóm.",
  },
  {
    id: "srl4",
    component: "4. Tự kiểm tra và sử dụng AI có trách nhiệm",
    statement:
      "Tự suy nghĩ giải bài trước, chỉ sử dụng AI để xem gợi mở từng bước và đối chiếu công thức.",
  },
  {
    id: "srl5",
    component: "5. Tự đánh giá và điều chỉnh",
    statement:
      "Nhận diện được các điểm còn nhầm lẫn (ví dụ: giữa số hạt còn lại N và số hạt đã phân rã ΔN) để ôn tập lại.",
  },
];

export default function DemoLessonPage() {
  const [activePhase, setActivePhase] = useState<1 | 2 | 3>(1);
  const [selectedLesson, setSelectedLesson] = useState<string>("B23");
  const [selected3DActivity, setSelected3DActivity] = useState<CanonicalActivityKey>("radiation_properties");
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [sampleHalfLife, setSampleHalfLife] = useState<number>(8);
  const [initialNuclei, setInitialNuclei] = useState<number>(1600);
  const [selectedBranch, setSelectedBranch] = useState<string>("medicine");
  const [selectedRole, setSelectedRole] = useState<string>("scientist");
  const [roleArgumentNote, setRoleArgumentNote] = useState<string>("");
  const [gameAnswers, setGameAnswers] = useState<Record<number, number>>({});
  const [srlRatings, setSrlRatings] = useState<Record<string, number>>({
    srl1: 4,
    srl2: 4,
    srl3: 4,
    srl4: 5,
    srl5: 4,
  });
  const [srlReflection, setSrlReflection] = useState<string>("");
  const [srlSaved, setSrlSaved] = useState<boolean>(false);

  const activePersona =
    ROLE_PLAY_PERSONAS.find((p) => p.id === selectedRole) || ROLE_PLAY_PERSONAS[0];
  const activeMindmap =
    MINDMAP_BRANCHES.find((b) => b.id === selectedBranch) || MINDMAP_BRANCHES[0];

  return (
    <PublicShell>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 24px 64px",
        }}
      >
        {/* Editorial Page Header */}
        <header
          style={{
            borderBottom: "1px solid var(--border-light)",
            paddingBottom: "28px",
            marginBottom: "32px",
          }}
        >
          <p
            className="mono-tag"
            style={{
              margin: "0 0 8px",
              fontSize: "11.5px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--text-muted)",
            }}
          >
            MÔ HÌNH LỚP HỌC ĐẢO NGƯỢC · CHỦ ĐỀ VẬT LÍ HẠT NHÂN 12
          </p>
          <h1
            style={{
              margin: "0 0 12px",
              fontSize: "clamp(26px, 3.2vw, 36px)",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Tiến trình Hoạt động Học tập 3 Giai đoạn
          </h1>
          <p
            style={{
              margin: "0 0 18px",
              fontSize: "15.5px",
              lineHeight: 1.65,
              color: "var(--text-secondary)",
              maxWidth: "820px",
            }}
          >
            Chọn từng giai đoạn bên dưới để thực hiện nhiệm vụ Trước giờ học, Trong giờ học và Sau giờ học. Giáo viên có thể mở Phòng thí nghiệm 3D &amp; Thiết kế bài dạy để tùy chỉnh kịch bản giảng dạy trên lớp.
          </p>

          <div
            className="editorial-surface"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              padding: "12px 16px",
              background: "var(--bg-surface)",
              marginBottom: "22px",
            }}
          >
            <div style={{ fontSize: "13.5px", color: "var(--text-primary)" }}>
              <strong>Dành cho Giáo viên:</strong> Tùy chỉnh thứ tự các khối mô phỏng 3D, công thức LaTeX, tư liệu nhà khoa học và xuất kế hoạch bài dạy theo Công văn 5512.
            </div>
            <Link
              href={`/hoc-lieu/truc-quan?bai=${selectedLesson}`}
              className="btn primary"
              style={{
                padding: "8px 14px",
                fontSize: "13px",
              }}
            >
              Mở Phòng thí nghiệm &amp; Thiết kế bài dạy →
            </Link>
          </div>

          {/* Architectural Phase Tabs */}
          <div
            role="tablist"
            aria-label="Ba giai đoạn học tập"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
              gap: "12px",
            }}
          >
            {[
              {
                id: 1 as const,
                step: "GIAI ĐOẠN 01 · TRƯỚC GIỜ HỌC",
                title: "Tự học & Khám phá tại nhà",
                desc: "Mô phỏng 3D, Infographic lịch sử và Trắc nghiệm chẩn đoán nhanh",
              },
              {
                id: 2 as const,
                step: "GIAI ĐOẠN 02 · TRONG GIỜ HỌC",
                title: "Xử lí dữ liệu & Thảo luận trên lớp",
                desc: "Bảng số liệu N(t), Bản đồ tư duy, Tình huống đóng vai và Luyện tập",
              },
              {
                id: 3 as const,
                step: "GIAI ĐOẠN 03 · SAU GIỜ HỌC",
                title: "Tự đánh giá & Điều chỉnh (SRL)",
                desc: "Đánh giá 5 thành tố năng lực tự học, Nhật kí học tập và Hỗ trợ AI",
              },
            ].map((tab) => {
              const active = activePhase === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActivePhase(tab.id)}
                  style={{
                    width: "100%",
                    height: "100%",
                    textAlign: "left",
                    padding: "16px 18px",
                    borderRadius: "8px",
                    border: active
                      ? "1.5px solid var(--color-primary)"
                      : "1px solid var(--border-light)",
                    background: active ? "var(--color-primary)" : "var(--bg-surface)",
                    color: active ? "#ffffff" : "var(--text-primary)",
                    cursor: "pointer",
                  }}
                >
                  <div
                    className="mono-tag"
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: active ? "#CBD5E1" : "var(--text-muted)",
                      letterSpacing: "0.04em",
                      marginBottom: "6px",
                    }}
                  >
                    {tab.step}
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>
                    {tab.title}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: active ? "#E2E8F0" : "var(--text-secondary)",
                      lineHeight: 1.45,
                    }}
                  >
                    {tab.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </header>

        {/* =============================================================== */}
        {/* GIAI ĐOẠN 1: TRƯỚC GIỜ HỌC                                       */}
        {/* =============================================================== */}
        {activePhase === 1 && (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "48px" }}>
            {/* 1.1: Mô phỏng tương tác 3D trực quan & Chu kì bán rã */}
            <section>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-muted)" }}>
                    Hoạt động 1.1 · Phòng thí nghiệm 3D Tương tác Trực tiếp (Raycasting + Tham số động)
                  </div>
                  <h2 style={{ margin: "4px 0 6px", fontSize: "22px", fontWeight: 700 }}>
                    Thao tác trực tiếp với vật thể 3D &amp; Quan sát công thức LaTeX thời gian thực
                  </h2>
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {[
                    { key: "radiation_properties" as const, label: "3 Tia α, β, γ trong từ trường" },
                    { key: "rutherford_alpha_scattering" as const, label: "Tán xạ alpha Rutherford" },
                    { key: "nuclear_fission" as const, label: "Phân hạch dây chuyền U-235" },
                    { key: "reactor_control_concept" as const, label: "Lò phản ứng & Thanh điều khiển" },
                    { key: "radioactive_decay_half_life" as const, label: "Lưới bán rã 3D" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSelected3DActivity(item.key)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        border:
                          selected3DActivity === item.key
                            ? "1.5px solid var(--color-primary)"
                            : "1px solid var(--border-dark)",
                        background: selected3DActivity === item.key ? "var(--color-primary)" : "var(--bg-surface)",
                        color: selected3DActivity === item.key ? "#ffffff" : "var(--text-primary)",
                        cursor: "pointer",
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "28px" }}>
                <FixedPhysicsActivityRenderer
                  key={selected3DActivity}
                  activityKey={selected3DActivity}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-muted)" }}>
                  Mô phỏng bổ trợ · Biểu đồ định lượng chu kì bán rã
                </div>
                <h3 style={{ margin: "4px 0 8px", fontSize: "19px", fontWeight: 700 }}>
                  Khảo sát chi tiết đường cong phân rã theo từng chu kì T
                </h3>
                <div style={{ marginBottom: "8px" }}>
                  <LatexMath math="N(t) = N_0 \cdot 2^{-\frac{t}{T}} = N_0 \cdot e^{-\lambda t}" />
                </div>
              </div>
              <HalfLifeDiscovery />
            </section>

            {/* 1.2: Infographic 3D theo từng bài */}
            <section style={{ borderTop: "1px solid var(--border-light)", paddingTop: "36px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-muted)" }}>
                    Hoạt động 1.2 · Infographic động 3D theo từng mục SGK
                  </div>
                  <h2 style={{ margin: "4px 0 0", fontSize: "22px", fontWeight: 700 }}>
                    Hệ thống hóa kiến thức trực quan ({selectedLesson})
                  </h2>
                </div>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {["B21", "B22", "B23", "B24", "B25"].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setSelectedLesson(code)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-dark)",
                        background: selectedLesson === code ? "var(--color-primary)" : "var(--bg-surface)",
                        color: selectedLesson === code ? "#ffffff" : "var(--text-primary)",
                        fontWeight: 600,
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
              <InfographicGallery reels={getSectionInfographicsByLesson(selectedLesson)} />
            </section>

            {/* 1.3: Sơ đồ lịch sử */}
            <section style={{ borderTop: "1px solid var(--border-light)", paddingTop: "36px" }}>
              <div style={{ marginBottom: "18px" }}>
                <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-muted)" }}>
                  Hoạt động 1.3 · Sơ đồ cấu trúc lịch sử vật lí hạt nhân
                </div>
                <h2 style={{ margin: "4px 0 0", fontSize: "22px", fontWeight: 700 }}>
                  Các nhà khoa học gắn với chương trình Vật lí 12 ({selectedLesson})
                </h2>
              </div>
              <NuclearHistory
                lessonCode={selectedLesson}
                onSelectLesson={(code) => setSelectedLesson(code)}
              />
            </section>

            {/* 1.4: Trắc nghiệm chẩn đoán nhanh */}
            <section style={{ borderTop: "1px solid var(--border-light)", paddingTop: "36px" }}>
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-muted)" }}>
                  Hoạt động 1.4 · Phiếu học tập số &amp; Trắc nghiệm chẩn đoán nhanh
                </div>
                <h2 style={{ margin: "4px 0 6px", fontSize: "22px", fontWeight: 700 }}>
                  Kiểm tra mức độ hiểu bài trước giờ học (Phản hồi tức thời)
                </h2>
                <p style={{ margin: 0, fontSize: "14.5px", color: "var(--text-secondary)" }}>
                  Chọn phương án trả lời để xem giải thích tự động ngay lập tức.
                </p>
              </div>

              <div style={{ display: "grid", gap: "20px" }}>
                {DIAGNOSTIC_QUESTIONS.map((q) => {
                  const chosen = quizAnswers[q.id];
                  const answered = chosen !== undefined;
                  const isCorrect = chosen === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      style={{
                        border: "1px solid var(--border-light)",
                        borderRadius: "12px",
                        padding: "22px",
                        background: "var(--bg-surface)",
                        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "16px",
                          flexWrap: "wrap",
                          marginBottom: "14px",
                        }}
                      >
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, lineHeight: 1.5 }}>
                          {q.question}
                        </h3>
                        <span
                          style={{
                            padding: "4px 10px",
                            background: "var(--bg-surface-elevated)",
                            border: "1px solid var(--border-light)",
                            borderRadius: "6px",
                            fontSize: "13.5px",
                          }}
                        >
                          <LatexMath math={q.latexHint} />
                        </span>
                      </div>

                      <div style={{ display: "grid", gap: "8px" }}>
                        {q.options.map((opt, idx) => {
                          const selectedThis = chosen === idx;
                          const isRightOption = idx === q.correctIndex;
                          let bg = "#f8fafc";
                          let border = "1px solid var(--border-light)";
                          if (answered) {
                            if (isRightOption) {
                              bg = "#f0fdf4";
                              border = "1px solid #16a34a";
                            } else if (selectedThis) {
                              bg = "#fef2f2";
                              border = "1px solid #dc2626";
                            }
                          }
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() =>
                                setQuizAnswers((prev) => ({ ...prev, [q.id]: idx }))
                              }
                              style={{
                                textAlign: "left",
                                padding: "11px 14px",
                                borderRadius: "8px",
                                background: bg,
                                border,
                                color: "var(--text-primary)",
                                fontSize: "14.5px",
                                fontWeight: selectedThis ? 600 : 400,
                                cursor: "pointer",
                              }}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {answered && (
                        <div
                          style={{
                            marginTop: "12px",
                            padding: "12px 14px",
                            borderRadius: "8px",
                            background: isCorrect ? "#f0fdf4" : "#fef2f2",
                            border: isCorrect ? "1px solid #bbf7d0" : "1px solid #fecaca",
                            color: isCorrect ? "#166534" : "#991b1b",
                            fontSize: "14px",
                            lineHeight: 1.55,
                          }}
                        >
                          {isCorrect ? q.feedbackCorrect : q.feedbackWrong}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => setActivePhase(2)}
                  className="btn primary"
                  style={{
                    maxWidth: "100%",
                    whiteSpace: "normal",
                    padding: "12px 22px",
                    borderRadius: "8px",
                    border: "none",
                    background: "var(--color-primary)",
                    color: "#ffffff",
                    fontSize: "14.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Tiếp tục sang Giai đoạn 2: Trong giờ học →
                </button>
              </div>
            </section>
          </div>
        )}

        {/* =============================================================== */}
        {/* GIAI ĐOẠN 2: TRONG GIỜ HỌC                                       */}
        {/* =============================================================== */}
        {activePhase === 2 && (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "48px" }}>
            {/* 2.1: Xử lí số liệu thực nghiệm */}
            <section>
              <div style={{ marginBottom: "18px" }}>
                <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-muted)" }}>
                  Hoạt động 2.1 · Bộ dữ liệu thí nghiệm ảo và Xử lí số liệu
                </div>
                <h2 style={{ margin: "4px 0 8px", fontSize: "22px", fontWeight: 700 }}>
                  Phân tích bảng số liệu và vẽ đồ thị hàm số mũ của định luật phóng xạ
                </h2>
                <LatexMath
                  block
                  math="N(t) = N_0 \cdot 2^{-\frac{t}{T}}, \qquad \Delta N(t) = N_0\left(1 - 2^{-\frac{t}{T}}\right)"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
                  gap: "16px",
                  marginBottom: "20px",
                  padding: "16px 20px",
                  background: "var(--bg-surface-elevated)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "10px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "6px",
                    }}
                  >
                    Số hạt ban đầu: {initialNuclei} hạt
                  </label>
                  <input
                    type="range"
                    min={400}
                    max={3200}
                    step={200}
                    value={initialNuclei}
                    onChange={(e) => setInitialNuclei(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "var(--color-primary)" }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "6px",
                    }}
                  >
                    Đồng vị khảo sát (T = {sampleHalfLife} ngày):
                  </label>
                  <select
                    value={sampleHalfLife}
                    onChange={(e) => setSampleHalfLife(Number(e.target.value))}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-dark)",
                      background: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                    }}
                  >
                    <option value={8}>Iodine-131 (T = 8 ngày)</option>
                    <option value={14}>Phosphorus-32 (T = 14 ngày)</option>
                    <option value={4}>Radon-222 (T = 4 ngày)</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
                  gap: "24px",
                  alignItems: "center",
                }}
              >
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "14px",
                      border: "1px solid var(--border-light)",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "var(--bg-surface-elevated)", borderBottom: "1px solid var(--border-dark)" }}>
                        <th style={{ padding: "10px 12px", textAlign: "left" }}>Thời điểm t</th>
                        <th style={{ padding: "10px 12px", textAlign: "right" }}>t / T</th>
                        <th style={{ padding: "10px 12px", textAlign: "right" }}>Số hạt còn lại N(t)</th>
                        <th style={{ padding: "10px 12px", textAlign: "right" }}>Số hạt đã phân rã ΔN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[0, 1, 2, 3, 4].map((k) => {
                        const tVal = k * sampleHalfLife;
                        const remaining = Math.round(initialNuclei / Math.pow(2, k));
                        const decayed = initialNuclei - remaining;
                        return (
                          <tr key={k} style={{ borderBottom: "1px solid var(--border-light)" }}>
                            <td style={{ padding: "10px 12px" }}>{tVal} ngày</td>
                            <td style={{ padding: "10px 12px", textAlign: "right" }}>{k}T</td>
                            <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>
                              {remaining}
                            </td>
                            <td style={{ padding: "10px 12px", textAlign: "right", color: "var(--text-secondary)" }}>
                              {decayed}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div
                  style={{
                    border: "1px solid var(--border-light)",
                    borderRadius: "10px",
                    padding: "16px",
                    background: "var(--bg-surface)",
                  }}
                >
                  <div style={{ marginBottom: "8px", textAlign: "center", fontSize: "13.5px" }}>
                    <LatexMath math={`N(t) = ${initialNuclei} \\cdot 2^{-\\frac{t}{${sampleHalfLife}}}`} />
                  </div>
                  <svg viewBox="0 0 380 205" style={{ width: "100%", height: "auto" }}>
                    <line x1="48" y1="18" x2="48" y2="175" stroke="#0f172a" strokeWidth="1.2" />
                    <line x1="48" y1="175" x2="355" y2="175" stroke="#0f172a" strokeWidth="1.2" />
                    {[0, 0.25, 0.5, 1].map((ratio) => {
                      const y = 175 - ratio * 145;
                      return (
                        <g key={ratio}>
                          <line
                            x1="48"
                            y1={y}
                            x2="350"
                            y2={y}
                            stroke="#e2e8f0"
                            strokeDasharray="4 4"
                          />
                          <text x="42" y={y + 4} textAnchor="end" fill="#475569" fontSize="10">
                            {Math.round(initialNuclei * ratio)}
                          </text>
                        </g>
                      );
                    })}
                    <path
                      d={Array.from({ length: 41 }, (_, i) => {
                        const k = (i / 40) * 4;
                        const x = 48 + (k / 4) * 295;
                        const y = 175 - Math.pow(2, -k) * 145;
                        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
                      }).join(" ")}
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="2.2"
                    />
                    {[0, 1, 2, 3, 4].map((k) => {
                      const x = 48 + (k / 4) * 295;
                      const y = 175 - Math.pow(2, -k) * 145;
                      return (
                        <g key={k}>
                          <circle cx={x} cy={y} r="4.5" fill="#0f172a" />
                          <text x={x} y="192" textAnchor="middle" fill="#475569" fontSize="10">
                            {k}T ({k * sampleHalfLife}d)
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </section>

            {/* 2.2: Bản đồ tư duy ứng dụng phóng xạ */}
            <section style={{ borderTop: "1px solid var(--border-light)", paddingTop: "36px" }}>
              <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-muted)" }}>
                Hoạt động 2.2 · Bản đồ tư duy cộng tác nhóm
              </div>
              <h2 style={{ margin: "4px 0 16px", fontSize: "22px", fontWeight: 700 }}>
                Ứng dụng của đồng vị phóng xạ trong thực tiễn
              </h2>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                {MINDMAP_BRANCHES.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBranch(b.id)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-dark)",
                      background: selectedBranch === b.id ? "var(--color-primary)" : "var(--bg-surface)",
                      color: selectedBranch === b.id ? "#ffffff" : "var(--text-primary)",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {b.title}
                  </button>
                ))}
              </div>

              <div
                style={{
                  border: "1px solid var(--border-light)",
                  borderRadius: "12px",
                  padding: "20px",
                  background: "var(--bg-surface-elevated)",
                }}
              >
                <div style={{ marginBottom: "12px" }}>
                  <LatexMath math={activeMindmap.latex} />
                </div>
                <ul style={{ margin: 0, paddingLeft: "20px", display: "grid", gap: "8px" }}>
                  {activeMindmap.uses.map((u) => (
                    <li key={u} style={{ fontSize: "14.5px", color: "var(--text-primary)", lineHeight: 1.6 }}>
                      {u}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 2.3: Tình huống đóng vai tranh biện */}
            <section style={{ borderTop: "1px solid var(--border-light)", paddingTop: "36px" }}>
              <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-muted)" }}>
                Hoạt động 2.3 · Mô hình trò chơi đóng vai / Tình huống giả định
              </div>
              <h2 style={{ margin: "4px 0 8px", fontSize: "22px", fontWeight: 700 }}>
                Tình huống tranh biện: Dự án xây dựng nhà máy điện hạt nhân
              </h2>
              <p style={{ margin: "0 0 16px", fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Chính quyền địa phương đang cân nhắc xây dựng một nhà máy điện hạt nhân. Hãy chọn vai đại diện của nhóm và bảo vệ quan điểm bằng kiến thức về năng lượng liên kết và an toàn bức xạ.
              </p>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                {ROLE_PLAY_PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedRole(p.id)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-dark)",
                      background: selectedRole === p.id ? "var(--color-primary)" : "var(--bg-surface)",
                      color: selectedRole === p.id ? "#ffffff" : "var(--text-primary)",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {p.role}
                  </button>
                ))}
              </div>

              <div
                style={{
                  border: "1px solid var(--border-light)",
                  borderRadius: "12px",
                  padding: "22px",
                  background: "var(--bg-surface)",
                  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                }}
              >
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "17px", fontWeight: 700, marginBottom: "4px" }}>
                    Vai đại diện: {activePersona.role}
                  </div>
                  <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "10px" }}>
                    Trọng tâm lập luận: {activePersona.stance}
                  </div>
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "var(--bg-surface-elevated)",
                      border: "1px solid var(--border-light)",
                      borderRadius: "8px",
                    }}
                  >
                    <LatexMath math={activePersona.latex} />
                  </div>
                </div>

                <ul style={{ margin: "0 0 16px", paddingLeft: "20px", display: "grid", gap: "8px" }}>
                  {activePersona.arguments.map((arg) => (
                    <li key={arg} style={{ fontSize: "14.5px", color: "var(--text-primary)", lineHeight: 1.6 }}>
                      {arg}
                    </li>
                  ))}
                </ul>

                <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "14px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>
                    Câu hỏi thảo luận nhóm: {activePersona.questionPrompt}
                  </div>
                  <textarea
                    rows={3}
                    value={roleArgumentNote}
                    onChange={(e) => setRoleArgumentNote(e.target.value)}
                    placeholder="Ghi tóm tắt lập luận của nhóm..."
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-dark)",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>
            </section>

            {/* 2.4: Bài toán tính nhanh củng cố công thức */}
            <section style={{ borderTop: "1px solid var(--border-light)", paddingTop: "36px" }}>
              <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-muted)" }}>
                Hoạt động 2.4 · Củng cố công thức định lượng
              </div>
              <h2 style={{ margin: "4px 0 16px", fontSize: "22px", fontWeight: 700 }}>
                Luyện tập nhanh: Độ hụt khối, năng lượng liên kết và phản ứng hạt nhân
              </h2>

              <div style={{ display: "grid", gap: "18px" }}>
                {GAMIFICATION_CHALLENGES.map((ch, idx) => {
                  const picked = gameAnswers[idx];
                  const answered = picked !== undefined;
                  return (
                    <div
                      key={ch.title}
                      style={{
                        border: "1px solid var(--border-light)",
                        borderRadius: "12px",
                        padding: "20px",
                        background: "var(--bg-surface)",
                        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                      }}
                    >
                      <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "6px" }}>
                        {ch.title}
                      </div>
                      <p style={{ margin: "0 0 10px", fontSize: "14.5px", color: "var(--text-secondary)" }}>
                        {ch.prompt}
                      </p>
                      <div
                        style={{
                          padding: "10px 14px",
                          background: "var(--bg-surface-elevated)",
                          border: "1px solid var(--border-light)",
                          borderRadius: "8px",
                          marginBottom: "14px",
                        }}
                      >
                        <LatexMath math={ch.latexQuestion} />
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
                          gap: "10px",
                        }}
                      >
                        {ch.options.map((opt, oIdx) => {
                          const isChosen = picked === oIdx;
                          let bg = "#f8fafc";
                          let border = "1px solid var(--border-light)";
                          if (answered) {
                            if (oIdx === ch.correct) {
                              bg = "#f0fdf4";
                              border = "1px solid #16a34a";
                            } else if (isChosen) {
                              bg = "#fef2f2";
                              border = "1px solid #dc2626";
                            }
                          }
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() =>
                                setGameAnswers((prev) => ({ ...prev, [idx]: oIdx }))
                              }
                              style={{
                                padding: "10px 12px",
                                borderRadius: "8px",
                                background: bg,
                                border,
                                color: "var(--text-primary)",
                                fontSize: "14px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {answered && (
                        <div
                          style={{
                            marginTop: "12px",
                            padding: "10px 14px",
                            background: "var(--bg-surface-elevated)",
                            borderRadius: "8px",
                            border: "1px solid var(--border-light)",
                          }}
                        >
                          <LatexMath math={ch.latexSolution} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => setActivePhase(3)}
                  className="btn primary"
                  style={{
                    maxWidth: "100%",
                    whiteSpace: "normal",
                    padding: "12px 22px",
                    borderRadius: "8px",
                    border: "none",
                    background: "var(--color-primary)",
                    color: "#ffffff",
                    fontSize: "14.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Tiếp tục sang Giai đoạn 3: Sau giờ học →
                </button>
              </div>
            </section>
          </div>
        )}

        {/* =============================================================== */}
        {/* GIAI ĐOẠN 3: SAU GIỜ HỌC (TỰ ĐÁNH GIÁ SRL)                       */}
        {/* =============================================================== */}
        {activePhase === 3 && (
          <section>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-muted)" }}>
                Giai đoạn 3 · Tự đánh giá năng lực tự học (Self-Regulated Learning)
              </div>
              <h2 style={{ margin: "4px 0 8px", fontSize: "22px", fontWeight: 700 }}>
                Bảng tự đánh giá 5 thành tố năng lực tự học và Nhật kí điều chỉnh
              </h2>
              <p style={{ margin: 0, fontSize: "14.5px", color: "var(--text-secondary)" }}>
                Đánh giá mức độ đạt được của bản thân theo thang điểm từ 1 (Chưa đạt) đến 5 (Thành thạo).
              </p>
            </div>

            <div style={{ borderTop: "1px solid var(--color-primary)", marginBottom: "24px" }}>
              {SRL_CRITERIA.map((item) => {
                const val = srlRatings[item.id] ?? 4;
                return (
                  <div
                    key={item.id}
                    style={{
                      padding: "18px 0",
                      borderBottom: "1px solid var(--border-light)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "16px",
                    }}
                  >
                    <div style={{ flex: "1 1 420px" }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                        {item.component}
                      </div>
                      <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "2px" }}>
                        {item.statement}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {[1, 2, 3, 4, 5].map((lv) => (
                        <button
                          key={lv}
                          type="button"
                          onClick={() =>
                            setSrlRatings((prev) => ({ ...prev, [item.id]: lv }))
                          }
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "6px",
                            border: "1px solid var(--border-dark)",
                            background: val === lv ? "var(--color-primary)" : "var(--bg-surface)",
                            color: val === lv ? "#ffffff" : "var(--text-primary)",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {lv}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: "8px",
                }}
              >
                Nhật kí tự điều chỉnh sau bài học:
              </label>
              <textarea
                rows={3}
                value={srlReflection}
                onChange={(e) => setSrlReflection(e.target.value)}
                placeholder="Ghi lại nội dung đã nắm vững và phần công thức cần ôn luyện thêm..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-dark)",
                  fontSize: "14px",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setSrlSaved(true)}
                style={{
                  padding: "11px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: "var(--color-primary)",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Lưu phiếu tự đánh giá
              </button>

              <Link
                href="/hoc-lieu/ai"
                style={{
                  padding: "11px 20px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-dark)",
                  background: "var(--bg-surface)",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Mở Trợ lí AI gợi mở từng bước →
              </Link>
            </div>

            {srlSaved && (
              <p style={{ marginTop: "14px", fontSize: "14px", color: "#166534", fontWeight: 500 }}>
                Đã lưu phiếu tự đánh giá năng lực tự học.
              </p>
            )}

            <div style={{ marginTop: "36px", borderTop: "1px solid var(--border-light)", paddingTop: "28px" }}>
              <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-muted)" }}>
                Hoạt động 3.2 · Chatbox Trợ lý Học tập Vật lí 12 Tích hợp
              </div>
              <h3 style={{ margin: "4px 0 12px", fontSize: "20px", fontWeight: 700 }}>
                Hỏi đáp trực tiếp &amp; Giải thích công thức LaTeX từng bước
              </h3>
              <AIStudyHelp code={selectedLesson} embedded />
            </div>
          </section>
        )}
      </div>
    </PublicShell>
  );
}
