import { FISSION_CHANNEL } from "./fission-model";
import { remainingFraction } from "./physics";

/** Ground-state nuclide data. A, Z and N are counts, without units. */
export type Nuclide = Readonly<{
  name: string;
  symbol: string;
  A: number;
  Z: number;
  N: number;
  latex: string;
  stability: "stable" | "radioactive";
}>;

function nuclearSymbol(symbol: string, A: number, Z: number) {
  return `{}^{${A}}_{${Z}}\\mathrm{${symbol}}`;
}

function nuclide(symbol: string, name: string, A: number, Z: number, stability: Nuclide["stability"]): Nuclide {
  return { symbol, name, A, Z, N: A - Z, latex: nuclearSymbol(symbol, A, Z), stability };
}

// Evaluated ground-state data from IAEA LiveChart. The U-235 reaction below
// reuses the existing B22 channel, including its representative products.
const [yttrium, iodine] = FISSION_CHANNEL.fragments;
export const NUCLIDES = {
  H1: nuclide("H", "Hiđrô-1", 1, 1, "stable"),
  H2: nuclide("H", "Đơteri", 2, 1, "stable"),
  H3: nuclide("H", "Triti", 3, 1, "radioactive"),
  He3: nuclide("He", "Heli-3", 3, 2, "stable"),
  He4: nuclide("He", "Heli-4", 4, 2, "stable"),
  C12: nuclide("C", "Carbon-12", 12, 6, "stable"),
  C13: nuclide("C", "Carbon-13", 13, 6, "stable"),
  C14: nuclide("C", "Carbon-14", 14, 6, "radioactive"),
  N14: nuclide("N", "Nitơ-14", 14, 7, "stable"),
  O16: nuclide("O", "Oxi-16", 16, 8, "stable"),
  Fe56: nuclide("Fe", "Sắt-56", 56, 26, "stable"),
  Y95: nuclide(yttrium.symbol, "Ytri-95", yttrium.a, yttrium.z, "radioactive"),
  I138: nuclide(iodine.symbol, "Iốt-138", iodine.a, iodine.z, "radioactive"),
  Th234: nuclide("Th", "Thori-234", 234, 90, "radioactive"),
  U235: nuclide(FISSION_CHANNEL.target.symbol, "Urani-235", FISSION_CHANNEL.target.a, FISSION_CHANNEL.target.z, "radioactive"),
  U236: nuclide("U", "Urani-236", FISSION_CHANNEL.compound.a, FISSION_CHANNEL.compound.z, "radioactive"),
  U238: nuclide("U", "Urani-238", 238, 92, "radioactive"),
} as const;

export type NuclideId = keyof typeof NUCLIDES;

export const NUCLEUS_MODEL_NOTE = "Quả cầu, màu và vị trí là quy ước minh họa. Kích thước được phóng đại, không theo tỉ lệ và không biểu diễn vị trí xác định của nucleon.";
export const NUCLEUS_CUTAWAY_NOTE = "Cắt lớp chỉ ẩn phần phía trước để quan sát. Đây không phải lớp vỏ vật lí và không làm đổi A, Z hay N.";

type ReactionTerm = Readonly<{ symbol: string; A: number; Z: number; count: number; latex: string }>;

function term({ symbol, A, Z, latex }: Pick<Nuclide, "symbol" | "A" | "Z" | "latex">, count = 1): ReactionTerm {
  return { symbol, A, Z, latex, count };
}

const neutron = { symbol: "n", A: 1, Z: 0, latex: nuclearSymbol("n", 1, 0) };

function reaction(reactants: readonly ReactionTerm[], products: readonly ReactionTerm[], note: string) {
  const side = (terms: readonly ReactionTerm[]) =>
    terms.map(({ count, latex }) => `${count > 1 ? `${count}\\,` : ""}${latex}`).join(" + ");
  return { reactants, products, latex: `${side(reactants)} \\longrightarrow ${side(products)}`, note };
}

export const NUCLEAR_REACTIONS = {
  fission: reaction(
    [term(NUCLIDES.U235), term(neutron)],
    [term(NUCLIDES.Y95), term(NUCLIDES.I138), term(neutron, FISSION_CHANNEL.neutrons)],
    "Một kênh phân hạch minh họa sau khi U-235 hấp thụ neutron. Các kênh khác có thể cho sản phẩm khác. Kích thước và thời gian chuyển động đã được phóng đại.",
  ),
  fusion: reaction(
    [term(NUCLIDES.H2), term(NUCLIDES.H3)],
    [term(NUCLIDES.He4), term(neutron)],
    "Đơteri và triti tổng hợp thành hạt nhân heli-4 và một neutron, giải phóng năng lượng. Hình minh họa không theo tỉ lệ kích thước hoặc thời gian.",
  ),
  alpha: reaction(
    [term(NUCLIDES.U238)],
    [term(NUCLIDES.Th234), term(NUCLIDES.He4)],
    "Sơ đồ biểu diễn bước phân rã alpha của U-238. Hạt alpha là hạt nhân heli-4. Th-234 tiếp tục phóng xạ, và sơ đồ không biểu diễn toàn bộ chuỗi phân rã.",
  ),
} as const;

const initialCount = 64;
export const HALF_LIFE_EXAMPLE = {
  initialCount,
  points: [0, 1, 2, 3, 4].map(period => {
    const fraction = remainingFraction(period, 1);
    return { period, fraction, expectedCount: initialCount * fraction };
  }),
  note: "Số hạt nhân mẹ còn lại theo kì vọng. Trục thời gian tính theo số chu kì bán rã t/T₁/₂, không phải số giây hoặc số đo thực nghiệm.",
} as const;

export const NUCLEAR_SCIENCE_SOURCES = {
  nuclides: { title: "IAEA · LiveChart of Nuclides", url: "https://nucleus.iaea.org/Pages/livechart-of-nuclides-av.aspx" },
  carbon: { title: "NIST · Isotopic Compositions for Carbon", url: "https://physics.nist.gov/cgi-bin/Compositions/stand_alone.pl?ascii=ascii&ele=C" },
  fusion: { title: "U.S. DOE · Deuterium-Tritium Fusion Fuel", url: "https://www.energy.gov/science/doe-explainsdeuterium-tritium-fusion-fuel" },
  alpha: { title: "IAEA · Basic Nuclear Physics", url: "https://nucleus.iaea.org/sites/nuclear-instrumentation/Shared%20Documents/Basic%20Nuclear%20Physics/Basic%20Nuclear%20Physics%20Lecture.pdf" },
  halfLife: { title: "Lawrence Berkeley National Laboratory · Radioactivity", url: "https://www2.lbl.gov/nsd/education/ABC/wallchart/chapters/03/0.html" },
  reactor: { title: "U.S. DOE · How Does a Nuclear Reactor Work?", url: "https://www.energy.gov/ne/articles/nuclear-101-how-does-nuclear-reactor-work" },
  medicine: { title: "IAEA · Technetium-99m Radiopharmaceuticals", url: "https://www-pub.iaea.org/MTCD/Publications/PDF/Pub1405_web.pdf" },
  food: { title: "IAEA · Natural and Induced Radioactivity in Food", url: "https://www-pub.iaea.org/MTCD/publications/PDF/te_1287_prn.pdf" },
  constants: { title: "NIST · CODATA 2022", url: "https://physics.nist.gov/cgi-bin/cuu/Results?search_for=atomic+mass+constant+energy+equivalent+in+MeV" },
} as const;
