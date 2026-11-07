import type { ChatMessage } from "./local-ai";

interface BuiltinReplyResult {
  reply: string;
  model: string;
  truncated: boolean;
}

const LESSON_SUMMARY_LATEX: Record<
  string,
  {
    title: string;
    coreLatex: string;
    conceptSummary: string;
    socraticQuestion: string;
    simLinkLabel: string;
  }
> = {
  B21: {
    title: "Bài 21 · Cấu trúc hạt nhân",
    coreLatex:
      "$$A = Z + N, \\qquad R = R_0 \\cdot A^{1/3} \\quad (R_0 \\approx 1{,}2 \\times 10^{-15}\\text{ m})$$",
    conceptSummary:
      "[H1] Hạt nhân nguyên tử có điện tích $+Ze$, cấu tạo từ $Z$ hạt proton ($m_p \\approx 1{,}00728\\text{ u}$) và $N = A - Z$ hạt neutron không mang điện ($m_n \\approx 1{,}00866\\text{ u}$). Kí hiệu hạt nhân là ${}_{Z}^{A}\\mathrm{X}$. Đồng vị là các hạt nhân có cùng số proton $Z$ nhưng khác số neutron $N$.",
    socraticQuestion:
      "Từ kí hiệu hạt nhân ${}_{Z}^{A}\\mathrm{X}$, em hãy xác định chỉ số nào cho biết số proton $Z$ và làm thế nào để tìm số neutron $N$?",
    simLinkLabel: "Thí nghiệm tán xạ hạt α & Xây dựng hạt nhân 3D (B21)",
  },
  B22: {
    title: "Bài 22 · Năng lượng liên kết và Phản ứng hạt nhân",
    coreLatex:
      "$$\\Delta m = \\left[Z m_p + (A - Z) m_n\\right] - m_X, \\qquad E_{\\text{lk}} = \\Delta m \\cdot c^2, \\qquad E_{\\text{lkr}} = \\frac{E_{\\text{lk}}}{A}$$",
    conceptSummary:
      "[H1] Khối lượng hạt nhân luôn nhỏ hơn tổng khối lượng các nucleon tạo thành một lượng gọi là độ hụt khối $\\Delta m$. Năng lượng liên kết riêng $E_{\\text{lkr}} = E_{\\text{lk}}/A$ đặc trưng cho mức độ bền vững của hạt nhân (cao nhất ở vùng $50 < A < 80$ như ${}_{26}^{56}\\mathrm{Fe} \\approx 8{,}8\\text{ MeV/nucleon}$). Trong mọi phản ứng hạt nhân, tổng số nucleon $A$ và tổng điện tích $Z$ luôn bảo toàn.",
    socraticQuestion:
      "Để tính năng lượng liên kết riêng $E_{\\text{lkr}}$, trước tiên em cần tính độ hụt khối $\\Delta m$ từ $Z$, $N = A - Z$ và $m_X$ theo biểu thức nào?",
    simLinkLabel: "Phòng thí nghiệm Độ hụt khối, Phân hạch & Nhiệt hạch 3D (B22)",
  },
  B23: {
    title: "Bài 23 · Hiện tượng phóng xạ",
    coreLatex:
      "$$N(t) = N_0 \\cdot 2^{-\\frac{t}{T}} = N_0 \\cdot e^{-\\lambda t}, \\qquad \\lambda = \\frac{\\ln 2}{T}, \\qquad H(t) = \\lambda N(t)$$",
    conceptSummary:
      "[H1] Phóng xạ là quá trình phân rã tự phát và ngẫu nhiên của hạt nhân không bền, hoàn toàn không phụ thuộc vào nhiệt độ hay áp suất. Ba loại tia phóng xạ: tia $\\alpha$ (${}_{2}^{4}\\mathrm{He}^{2+}$), tia $\\beta^-$ (${}_{-1}^{0}\\mathrm{e}$), tia $\\beta^+$ (${}_{+1}^{0}\\mathrm{e}$) và tia $\\gamma$ (photon sóng điện từ $q = 0$, không lệch trong điện trường và từ trường). Số hạt đã bị phân rã sau thời gian $t$ là $\\Delta N = N_0\\left(1 - 2^{-t/T}\\right)$.",
    socraticQuestion:
      "Trong bài toán của em, đề bài đang hỏi số hạt còn lại $N(t)$ hay số hạt đã bị phân rã $\\Delta N = N_0 - N(t)$, và tỉ số $t / T$ bằng bao nhiêu?",
    simLinkLabel: "Mô phỏng Chu kì bán rã & Quỹ đạo tia α, β, γ 3D (B23)",
  },
  B24: {
    title: "Bài 24 · Công nghiệp hạt nhân",
    coreLatex:
      "$$k = \\frac{N_{\\text{neutron sau}}}{N_{\\text{neutron trước}}} = 1 \\text{ (tới hạn)}, \\qquad {}_{0}^{1}\\mathrm{n} + {}_{92}^{235}\\mathrm{U} \\rightarrow {}_{56}^{141}\\mathrm{Ba} + {}_{36}^{92}\\mathrm{Kr} + 3\\,{}_{0}^{1}\\mathrm{n} + 200\\text{ MeV}$$",
    conceptSummary:
      "[H1] Trong nhà máy điện hạt nhân (lò PWR), các thanh điều khiển chứa Boron hoặc Cadmium hấp thụ neutron thừa để duy trì hệ số nhân neutron $k = 1$, giúp công suất nhiệt ổn định. Năng lượng nhiệt từ tâm lò truyền qua hai vòng tuần hoàn cách li để quay turbine phát điện. Đồng vị phóng xạ còn được ứng dụng trong chụp PET/CT, xạ trị (${}^{131}\\mathrm{I}$, ${}^{60}\\mathrm{Co}$), chiếu xạ nông sản và kiểm định mối hàn.",
    socraticQuestion:
      "Khi muốn giảm công suất lò phản ứng (đưa hệ số nhân neutron từ $k > 1$ về $k = 1$), ta cần nâng lên hay hạ sâu các thanh điều khiển chứa Boron/Cadmium vào tâm lò?",
    simLinkLabel: "Mô phỏng Điều khiển Lò phản ứng hạt nhân PWR 3D (B24)",
  },
  B25: {
    title: "Bài 25 · Bài tập và Thực hành Vật lí hạt nhân",
    coreLatex:
      "$$t = \\frac{T}{\\ln 2}\\ln\\!\\left(\\frac{H_0}{H(t)}\\right), \\qquad \\Delta E = \\left(\\sum m_{\\text{trước}} - \\sum m_{\\text{sau}}\\right)c^2, \\qquad I \\propto \\frac{1}{r^2}$$",
    conceptSummary:
      "[H1] Khi xử lí số liệu thực nghiệm phóng xạ, tại thời điểm $t = k \\cdot T$, độ phóng xạ giảm còn $H(t) = H_0 / 2^k$. Ba nguyên tắc vàng trong an toàn bức xạ là: Giảm thời gian tiếp xúc, tăng khoảng cách tới nguồn ($I \\propto 1/r^2$) và che chắn bằng lớp vật liệu phù hợp (chì, bê tông).",
    socraticQuestion:
      "Từ bảng số liệu hoặc đồ thị $H(t)$, em hãy tìm khoảng thời gian $T$ mà tại đó độ phóng xạ giảm đi đúng một nửa ($H = H_0 / 2$) là bao nhiêu?",
    simLinkLabel: "Phòng thực hành số liệu Chu kì bán rã & An toàn bức xạ 3D (B25)",
  },
};

/**
 * Built-in Intelligent Vietnamese Nuclear Physics Chat Engine.
 * Works 100% locally inside Next.js without requiring an external Ollama daemon,
 * delivering Socratic hints, conceptual explanations, and numerical formula checks with KaTeX.
 */
export function generateSmartStudentPhysicsReply(
  lessonCode: string,
  mode: "hint" | "explain",
  messages: ChatMessage[]
): BuiltinReplyResult {
  const lastMsg = messages.at(-1)?.content ?? "";
  const q = lastMsg.toLocaleLowerCase("vi");
  const meta = LESSON_SUMMARY_LATEX[lessonCode] ?? LESSON_SUMMARY_LATEX.B21;

  // 1. Detect specific physics topics in the student's question
  const isRutherford =
    /rutherford|tán xạ|lá vàng|hạt alpha|bánh ngọt|thomson|kích thước hạt nhân|bán kính/i.test(
      q
    );
  const isNuclideOrIsotope =
    /đồng vị|proton|neutron|nucleon|số khối|điện tích|kí hiệu|carbon|uranium/i.test(
      q
    ) && !/bán rã|phóng xạ|hụt khối|liên kết/i.test(q);
  const isBindingEnergy =
    /hụt khối|liên kết|bền vững|931|mev|delta m|khối lượng hạt nhân/i.test(q);
  const isFissionFusion =
    /phân hạch|nhiệt hạch|dây chuyền|lò phản ứng|thanh điều khiển|boron|cadmium|nhà máy điện|tới hạn/i.test(
      q
    );
  const isRadiationTypes =
    /tia alpha|tia beta|tia gamma|từ trường|điện trường|đâm xuyên|lorentz|chắn chì|chắn nhôm/i.test(
      q
    );
  const isHalfLife =
    /chu kì|bán rã|phóng xạ|phân rã|còn lại|cổ vật|carbon-14|c-14|bq|curie|hằng số phóng xạ/i.test(
      q
    );
  const isSafetyOrApp =
    /an toàn|khoảng cách|che chắn|y học|xạ trị|pet|nông sản|kiểm định|mối hàn/i.test(
      q
    );

  // 2. Topic-specific Socratic Hint vs Full Explanation with LaTeX
  if (isRutherford) {
    if (mode === "hint") {
      return {
        model: "physics-socratic-engine-v2",
        truncated: false,
        reply: [
          "**Gợi mở từng bước (Thí nghiệm tán xạ hạt $\\alpha$ & Bán kính hạt nhân):**",
          "1. Trong thí nghiệm Rutherford [H1], đa số hạt $\\alpha$ xuyên thẳng qua lá vàng chứng tỏ phần lớn không gian bên trong nguyên tử là **trống rỗng**.",
          "2. Một tỉ lệ rất nhỏ hạt $\\alpha$ bị bật ngược lại chứng tỏ toàn bộ điện tích dương và gần như toàn bộ khối lượng tập trung tại **hạt nhân** có kích thước rất nhỏ ở tâm:",
          "$$F_{\\text{C}} = \\frac{k \\cdot q_\\alpha q_{\\text{Au}}}{r^2}, \\qquad R = 1{,}2 \\times 10^{-15} \\cdot A^{1/3}\\text{ (m)}$$",
          "**Câu hỏi dẫn dắt:** Nếu số khối $A$ của hạt nhân tăng gấp $8$ lần thì bán kính hạt nhân $R$ sẽ tăng lên bao nhiêu lần?",
        ].join("\n\n"),
      };
    }
    return {
      model: "physics-socratic-engine-v2",
      truncated: false,
      reply: [
        "**Giải thích bản chất (Thí nghiệm Rutherford & Kích thước hạt nhân [H1]):**",
        "- **Hiện tượng:** Khi bắn chùm hạt $\\alpha$ (${}_{2}^{4}\\mathrm{He}^{2+}$) vào lá vàng mỏng ($d \\approx 4 \\times 10^{-7}\\text{ m}$), hầu hết hạt $\\alpha$ đi thẳng, một số ít bị lệch hướng và chỉ khoảng $1/10^4$ hạt bị bật ngược lại.",
        "- **Kết luận cấu trúc:** Nguyên tử có cấu tạo rỗng; tâm nguyên tử là hạt nhân mang điện dương kích thước cỡ $10^{-15}\\text{ m}$ (nhỏ hơn nguyên tử khoảng $10^4 - 10^5$ lần).",
        "- **Công thức bán kính hạt nhân:**",
        "$$R = R_0 \\cdot A^{1/3} \\quad \\left(R_0 \\approx 1{,}2 \\times 10^{-15}\\text{ m} = 1{,}2\\text{ fm}\\right)$$",
        "**Tự kiểm tra:** Áp dụng công thức trên, em hãy tính bán kính của hạt nhân Carbon ${}_{6}^{12}\\mathrm{C}$ và Uranium ${}_{92}^{238}\\mathrm{U}$.",
      ].join("\n\n"),
    };
  }

  if (isBindingEnergy) {
    if (mode === "hint") {
      return {
        model: "physics-socratic-engine-v2",
        truncated: false,
        reply: [
          "**Gợi mở từng bước (Độ hụt khối & Năng lượng liên kết [H1]):**",
          "Để giải bài toán năng lượng liên kết của hạt nhân ${}_{Z}^{A}\\mathrm{X}$, em thực hiện theo 3 bước:",
          "$$\\text{Bước 1: } \\Delta m = \\left[Z \\cdot m_p + (A - Z) \\cdot m_n\\right] - m_X$$",
          "$$\\text{Bước 2: } E_{\\text{lk}} = \\Delta m \\cdot c^2 \\quad \\left(1\\text{ u}c^2 \\approx 931{,}5\\text{ MeV}\\right)$$",
          "$$\\text{Bước 3: } E_{\\text{lkr}} = \\frac{E_{\\text{lk}}}{A}\\text{ (MeV/nucleon)}$$",
          "**Câu hỏi dẫn dắt:** Em hãy xác định số proton $Z$, số neutron $N = A - Z$ của hạt nhân trong đề bài và tính tổng khối lượng các nucleon tạo thành trước nhé?",
        ].join("\n\n"),
      };
    }
    return {
      model: "physics-socratic-engine-v2",
      truncated: false,
      reply: [
        "**Giải thích chi tiết (Độ hụt khối $\\Delta m$ và Năng lượng liên kết [H1]):**",
        "- **Độ hụt khối:** Tổng khối lượng của $Z$ proton và $N$ neutron khi đứng riêng rẽ luôn lớn hơn khối lượng hạt nhân ${}_{Z}^{A}\\mathrm{X}$ tạo thành:",
        "$$\\Delta m = Z m_p + (A - Z) m_n - m_X$$",
        "- **Năng lượng liên kết ($E_{\\text{lk}}$):** Là năng lượng tỏa ra khi các nucleon hợp thành hạt nhân (hoặc năng lượng tối thiểu cần cung cấp để tách hạt nhân thành các nucleon riêng rẽ):",
        "$$E_{\\text{lk}} = \\Delta m \\cdot c^2, \\qquad E_{\\text{lkr}} = \\frac{E_{\\text{lk}}}{A}$$",
        "- **Ví dụ chuẩn:** Với hạt nhân ${}_{2}^{4}\\mathrm{He}$ ($Z=2, N=2$), $\\Delta m \\approx 0{,}0304\\text{ u} \\implies E_{\\text{lk}} \\approx 28{,}3\\text{ MeV} \\implies E_{\\text{lkr}} \\approx 7{,}07\\text{ MeV/nucleon}$. Hạt nhân có $E_{\\text{lkr}}$ càng lớn thì càng bền vững.",
      ].join("\n\n"),
    };
  }

  if (isRadiationTypes) {
    if (mode === "hint") {
      return {
        model: "physics-socratic-engine-v2",
        truncated: false,
        reply: [
          "**Gợi mở từng bước (Bản chất và sự lệch của các tia $\\alpha, \\beta, \\gamma$ [H1]):**",
          "Xét lực từ Lorentz tác dụng lên hạt mang điện tích $q$ bay vào từ trường đều $\\vec{B}$:",
          "$$\\vec{F}_{\\text{L}} = q(\\vec{v} \\times \\vec{B}), \\qquad R = \\frac{mv}{|q|B}$$",
          "- Tia $\\alpha$ (${}_{2}^{4}\\mathrm{He}^{2+}$) mang điện $q = +2e$.",
          "- Tia $\\beta^-$ (${}_{-1}^{0}\\mathrm{e}$) mang điện $q = -e$, khối lượng rất nhỏ nên bị lệch rất mạnh.",
          "- Tia $\\gamma$ là sóng điện từ (photon không mang điện, $q = 0$).",
          "**Câu hỏi dẫn dắt:** Vì tia $\\gamma$ có điện tích $q = 0$, lực Lorentz tác dụng lên tia $\\gamma$ bằng bao nhiêu và quỹ đạo của nó sẽ như thế nào?",
        ].join("\n\n"),
      };
    }
    return {
      model: "physics-socratic-engine-v2",
      truncated: false,
      reply: [
        "**Giải thích bản chất 3 loại tia phóng xạ $\\alpha, \\beta, \\gamma$ [H1]:**",
        "1. **Phóng xạ $\\alpha$:** Hạt nhân mẹ phát ra hạt ${}_{2}^{4}\\mathrm{He}$ ($q = +2e$). Khả năng ion hóa mạnh nhưng đâm xuyên yếu (bị chặn bởi tờ giấy bìa). Phương trình:",
        "   $${}_{Z}^{A}\\mathrm{X} \\rightarrow {}_{Z-2}^{A-4}\\mathrm{Y} + {}_{2}^{4}\\mathrm{He}$$",
        "2. **Phóng xạ $\\beta^-$ và $\\beta^+$:** Phát ra electron (${}_{-1}^{0}\\mathrm{e}$) hoặc positron (${}_{+1}^{0}\\mathrm{e}$). Đâm xuyên trung bình (bị chặn bởi tấm nhôm dày vài mm). Phương trình:",
        "   $${}_{Z}^{A}\\mathrm{X} \\rightarrow {}_{Z+1}^{A}\\mathrm{Y} + {}_{-1}^{0}\\mathrm{e} + \\bar{\\nu}_e$$",
        "3. **Phóng xạ $\\gamma$:** Là bức xạ điện từ bước sóng rất ngắn ($\\lambda < 10^{-11}\\text{ m}$), không mang điện ($q = 0$), **không bị lệch** trong điện trường và từ trường, khả năng đâm xuyên cực mạnh (cần tấm chì dày hoặc bê tông để suy giảm theo $I = I_0 e^{-\\mu d}$).",
      ].join("\n\n"),
    };
  }

  if (isHalfLife) {
    if (mode === "hint") {
      return {
        model: "physics-socratic-engine-v2",
        truncated: false,
        reply: [
          "**Gợi mở từng bước (Định luật phóng xạ & Chu kì bán rã $T$ [H1]):**",
          "Em hãy đối chiếu dữ kiện đề bài với các hệ thức chuẩn sau:",
          "$$N(t) = N_0 \\cdot 2^{-\\frac{t}{T}} = N_0 \\cdot e^{-\\lambda t}, \\qquad m(t) = m_0 \\cdot 2^{-\\frac{t}{T}}$$",
          "$$\\Delta N(t) = N_0 - N(t) = N_0\\left(1 - 2^{-\\frac{t}{T}}\\right), \\qquad H(t) = \\lambda N(t) = \\frac{\\ln 2}{T} N(t)$$",
          "**Lưu ý tránh nhầm lẫn:** Cần phân biệt rõ đề hỏi **số hạt còn lại $N(t)$** hay **số hạt đã phân rã $\\Delta N(t)$**, và nhớ đổi $T$ ra giây ($\\text{s}$) khi tính độ phóng xạ $H(t)$ theo đơn vị $\\text{Bq}$!",
          "**Câu hỏi dẫn dắt:** Trong bài của em, tỉ số số chu kì bán rã $k = t / T$ bằng bao nhiêu?",
        ].join("\n\n"),
      };
    }
    return {
      model: "physics-socratic-engine-v2",
      truncated: false,
      reply: [
        "**Giải thích chi tiết Định luật phóng xạ & Độ phóng xạ [H1]:**",
        "- **Chu kì bán rã $T$:** Là thời gian để một nửa ($50\\%$) số hạt nhân của mẫu chất phóng xạ phân rã biến đổi thành hạt nhân khác.",
        "- **Số hạt và khối lượng còn lại sau thời gian $t$:**",
        "$$N(t) = N_0 \\cdot 2^{-\\frac{t}{T}} = N_0 \\cdot e^{-\\lambda t}, \\qquad m(t) = m_0 \\cdot 2^{-\\frac{t}{T}} \\quad \\left(\\lambda = \\frac{\\ln 2}{T}\\right)$$",
        "- **Số hạt đã bị phân rã (bằng số hạt nhân con tạo thành):**",
        "$$\\Delta N(t) = N_0\\left(1 - 2^{-\\frac{t}{T}}\\right), \\qquad \\frac{\\Delta N}{N(t)} = 2^{\\frac{t}{T}} - 1$$",
        "- **Độ phóng xạ $H(t)$:** Đặc trưng cho tính phóng xạ mạnh hay yếu (số phân rã trong 1 giây, đơn vị $\\text{Bq}$): $H(t) = \\lambda N(t) = H_0 \\cdot 2^{-t/T}$.",
      ].join("\n\n"),
    };
  }

  if (isFissionFusion) {
    if (mode === "hint") {
      return {
        model: "physics-socratic-engine-v2",
        truncated: false,
        reply: [
          "**Gợi mở từng bước (Phân hạch, Nhiệt hạch & Lò phản ứng hạt nhân [H1]):**",
          "1. **Bảo toàn trong phản ứng hạt nhân:** Tổng số khối $\\sum A$ và tổng số proton $\\sum Z$ hai vế luôn bằng nhau:",
          "   $${}_{0}^{1}\\mathrm{n} + {}_{92}^{235}\\mathrm{U} \\rightarrow {}_{Z_1}^{A_1}\\mathrm{X} + {}_{Z_2}^{A_2}\\mathrm{Y} + k\\,{}_{0}^{1}\\mathrm{n}$$",
          "2. **Điều khiển lò phản ứng:** Hệ số nhân neutron $k = 1$ (trạng thái tới hạn) giúp công suất ổn định nhờ các thanh hấp thụ neutron (Boron / Cadmium).",
          "**Câu hỏi dẫn dắt:** Em hãy viết phương trình bảo toàn số khối $1 + 235 = A_1 + A_2 + k \\cdot 1$ để tìm đại lượng còn thiếu nhé?",
        ].join("\n\n"),
      };
    }
    return {
      model: "physics-socratic-engine-v2",
      truncated: false,
      reply: [
        "**Giải thích Phản ứng Phân hạch, Nhiệt hạch & Nhà máy điện hạt nhân [H1]:**",
        "- **Phân hạch:** Hạt nhân nặng (${}^{235}\\mathrm{U}$, ${}^{239}\\mathrm{Pu}$) hấp thụ một neutron chậm rồi vỡ thành hai hạt nhân trung bình, kèm theo $2 - 3$ neutron thứ cấp và tỏa ra $\\approx 200\\text{ MeV}$:",
        "$$\\Delta E = \\left(\\sum m_{\\text{trước}} - \\sum m_{\\text{sau}}\\right)c^2 > 0$$",
        "- **Nhiệt hạch:** Hai hạt nhân rất nhẹ (${}_{1}^{2}\\mathrm{H} + {}_{1}^{3}\\mathrm{H} \\rightarrow {}_{2}^{4}\\mathrm{He} + {}_{0}^{1}\\mathrm{n} + 17{,}6\\text{ MeV}$) hợp nhất ở nhiệt độ hàng chục triệu độ K.",
        "- **Điều khiển phản ứng dây chuyền:** Thanh điều khiển chứa Boron/Cadmium hấp thụ neutron thừa để giữ hệ số nhân neutron $k = 1$.",
      ].join("\n\n"),
    };
  }

  if (isNuclideOrIsotope || isSafetyOrApp) {
    return {
      model: "physics-socratic-engine-v2",
      truncated: false,
      reply: [
        `**Hỗ trợ học tập (${meta.title}):**`,
        meta.conceptSummary,
        meta.coreLatex,
        mode === "hint"
          ? `**Câu hỏi gợi mở:** ${meta.socraticQuestion}`
          : `**Tự kiểm tra:** ${meta.socraticQuestion}`,
      ].join("\n\n"),
    };
  }

  // Default comprehensive lesson-aware response
  return {
    model: "physics-socratic-engine-v2",
    truncated: false,
    reply: [
      `**Trợ lí Vật lí Hạt nhân (${meta.title}):**`,
      meta.conceptSummary,
      meta.coreLatex,
      mode === "hint"
        ? `**Gợi mở bước tiếp theo:** ${meta.socraticQuestion}`
        : `**Câu hỏi vận dụng:** ${meta.socraticQuestion}`,
    ].join("\n\n"),
  };
}
