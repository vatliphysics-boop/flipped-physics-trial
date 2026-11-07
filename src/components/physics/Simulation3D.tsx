"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { remainingFraction, CARBON14_HALF_LIFE_YEARS } from "@/lib/physics";
import type { CanonicalActivityKey } from "@/lib/curriculum";
import { LatexMath } from "@/components/learning/LatexMath";
import { RichPhysicsText } from "@/components/learning/RichPhysicsText";
import { buildNucleusLayout } from "@/lib/nucleus-layout";
import { NUCLIDES, NUCLEUS_MODEL_NOTE, NUCLEAR_REACTIONS } from "@/lib/nuclear-science";
import styles from "./Simulation3D.module.css";

export type BasicActivityKey = CanonicalActivityKey;

type Parameters = {
  amount: number;
  secondary: number;
  speed: number;
  mode: number;
  pulseCount: number;
};

interface Activity3DConfig {
  title: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  initial: number;
  unit?: string;
  secondaryLabel?: string;
  secondaryMin?: number;
  secondaryMax?: number;
  secondaryStep?: number;
  secondaryInitial?: number;
  secondaryUnit?: string;
  modes?: string[];
  actionButtonLabel: string;
  caption: string;
  buildLatex: (p: Parameters, elapsed: number) => string;
  buildMetrics: (p: Parameters, elapsed: number) => { label: string; value: string }[];
}

const CHEMICAL_SYMBOLS: Record<number, string> = {
  1: "H",
  2: "He",
  3: "Li",
  4: "Be",
  5: "B",
  6: "C",
  7: "N",
  8: "O",
  9: "F",
  10: "Ne",
  11: "Na",
  12: "Mg",
  13: "Al",
  14: "Si",
  15: "P",
  16: "S",
  17: "Cl",
  18: "Ar",
  19: "K",
  20: "Ca",
};

const TARGETS = [
  { symbol: "Au", name: "vàng", A: 197, Z: 79 },
  { symbol: "Ag", name: "bạc", A: 107, Z: 47 },
  { symbol: "Al", name: "nhôm", A: 27, Z: 13 },
] as const;
const FISSION_FRAGMENTS = [
  [{ ...NUCLIDES.Y95, name: "Y-95" }, { ...NUCLIDES.I138, name: "I-138" }],
  [{ A: 141, Z: 56, name: "Ba-141" }, { A: 92, Z: 36, name: "Kr-92" }],
] as const;
const FISSION_NEUTRONS = 3;
const rutherfordAngle = (Z: number, b: number, energy: number) =>
  2 * Math.atan((1.44 * Z) / (energy * b));

const SETTINGS: Record<BasicActivityKey, Activity3DConfig> = {
  rutherford_alpha_scattering: {
    title: "Thí nghiệm tán xạ hạt alpha của Rutherford (3D)",
    label: "Thông số va chạm b (đường tới so với tâm bia)",
    min: 2,
    max: 100,
    initial: 28,
    unit: "fm",
    secondaryLabel: "Động năng hạt α tới (Kα)",
    secondaryMin: 3,
    secondaryMax: 10,
    secondaryInitial: 5,
    secondaryUnit: "MeV",
    modes: TARGETS.map(({ symbol, name, A }) => `Lá ${name} · ${symbol}-${A}`),
    actionButtonLabel: "Bắn chùm hạt α mới",
    caption:
      "Góc hiển thị tính cho hạt α khảo sát theo mô hình tán xạ Coulomb với bia nặng. Quỹ đạo và hạt nhân được phóng đại để dễ quan sát, không biểu diễn tần suất thực nghiệm.",
    buildLatex: (p) => {
      const Z = TARGETS[p.mode]?.Z ?? TARGETS[0].Z;
      const b = Math.max(2, p.amount);
      const E = Math.max(3, p.secondary);
      const thetaRad = rutherfordAngle(Z, b, E);
      const thetaDeg = ((thetaRad * 180) / Math.PI).toFixed(1);
      return `F_{\\text{C}} = \\frac{k \\cdot (2e)(Ze)}{r^2}, \\qquad \\tan\\frac{\\theta}{2} = \\frac{k q_\\alpha q_X}{2 K_\\alpha b} \\implies \\theta \\approx ${thetaDeg}^\\circ`;
    },
    buildMetrics: (p) => {
      const Z = TARGETS[p.mode]?.Z ?? TARGETS[0].Z;
      const b = Math.max(2, p.amount);
      const E = Math.max(3, p.secondary);
      const thetaDeg = ((rutherfordAngle(Z, b, E) * 180) / Math.PI).toFixed(1);
      return [
        { label: "Điện tích hạt nhân bia", value: `+${Z}e` },
        { label: "Thông số va chạm b", value: `${b} fm` },
        { label: "Góc tán xạ θ", value: `${thetaDeg}°` },
        {
          label: "Hiện tượng",
          value: Number(thetaDeg) > 90 ? "Tán xạ ngược (> 90°)" : Number(thetaDeg) > 20 ? "Lệch hướng rõ rệt" : "Hầu như truyền thẳng",
        },
      ];
    },
  },
  nuclear_structure_builder: {
    title: "Xây dựng cấu trúc hạt nhân 3D (Proton & Neutron)",
    label: "Số proton Z (điện tích hạt nhân)",
    min: 1,
    max: 20,
    initial: 6,
    unit: "hạt",
    secondaryLabel: "Số neutron N",
    secondaryMin: 0,
    secondaryMax: 24,
    secondaryInitial: 6,
    secondaryUnit: "hạt",
    modes: ["Chế độ tự do (Z, N)", "Thử N bằng Z", "Giàu neutron (N > Z)"],
    actionButtonLabel: "Quan sát lại cấu trúc",
    caption:
      `Thay đổi số proton (đỏ) và neutron (xanh). Tổ hợp tự chọn dùng để tập đọc kí hiệu, không xác nhận đồng vị có thật hoặc bền. ${NUCLEUS_MODEL_NOTE}`,
    buildLatex: (p) => {
      const Z = p.amount;
      const N = p.mode === 1 ? Z : p.mode === 2 ? Z + 2 : p.secondary;
      const A = Z + N;
      const sym = CHEMICAL_SYMBOLS[Z] ?? "X";
      const R = (1.2 * Math.cbrt(Math.max(1, A))).toFixed(2);
      return `{}_{${Z}}^{${A}}\\mathrm{${sym}}: \\quad A = Z + N = ${Z} + ${N} = ${A}, \\qquad R = 1{,}2 \\cdot A^{1/3} \\approx ${R}\\text{ fm}`;
    },
    buildMetrics: (p) => {
      const Z = p.amount;
      const N = p.mode === 1 ? Z : p.mode === 2 ? Z + 2 : p.secondary;
      const A = Z + N;
      const sym = CHEMICAL_SYMBOLS[Z] ?? "X";
      const ratio = Z > 0 ? (N / Z).toFixed(2) : "0";
      return [
        { label: "Kí hiệu hạt nhân", value: `${sym}-${A} (Z=${Z})` },
        { label: "Tổng số nucleon A", value: `${A} nucleon` },
        { label: "Tỉ số N / Z", value: ratio },
        { label: "Bán kính R", value: `${(1.2 * Math.cbrt(Math.max(1, A))).toFixed(2)} fm` },
      ];
    },
  },
  isotope_and_nuclear_size: {
    title: "So sánh các đồng vị và bán kính hạt nhân 3D",
    label: "Số khối A của đồng vị Carbon (Z = 6)",
    min: 12,
    max: 14,
    initial: 12,
    unit: "nucleon",
    secondaryLabel: "Số khối hạt nhân đối chiếu A₂",
    secondaryMin: 1,
    secondaryMax: 238,
    secondaryInitial: 56,
    secondaryUnit: "nucleon",
    modes: ["Hiển thị mặt cầu bán kính R", "Ẩn mặt cầu bao"],
    actionButtonLabel: "Quan sát lại bán kính",
    caption:
      "Các đồng vị carbon có cùng số proton và khác số neutron. Vòng lưới quanh carbon chỉ đánh dấu bán kính quy ước. Các giá trị bán kính được ước tính từ số khối.",
    buildLatex: (p) => {
      const A = p.amount;
      const N = A - 6;
      const R1 = (1.2 * Math.cbrt(A)).toFixed(2);
      const R2 = (1.2 * Math.cbrt(p.secondary)).toFixed(2);
      return `{}_{6}^{${A}}\\mathrm{C},\\quad N=${N}\\qquad R_1\\approx${R1.replace(".", "{,}")}\\,\\mathrm{fm}\\qquad R_2\\approx${R2.replace(".", "{,}")}\\,\\mathrm{fm}`;
    },
    buildMetrics: (p) => {
      const A = p.amount;
      return [
        { label: "Đồng vị khảo sát", value: `Carbon-${A} (Z=6, N=${A - 6})` },
        { label: "Bán kính R₁", value: `${(1.2 * Math.cbrt(A)).toFixed(2)} fm` },
        { label: "Bán kính đối chiếu R₂", value: `${(1.2 * Math.cbrt(p.secondary)).toFixed(2)} fm` },
        { label: "Tỉ số thể tích V₂/V₁", value: `${(p.secondary / A).toFixed(1)} lần` },
      ];
    },
  },
  nuclear_reaction_balancer: {
    title: "Định luật bảo toàn số nucleon và điện tích trong phản ứng hạt nhân",
    label: "Tốc độ hạt đạn bắn tới",
    min: 1,
    max: 5,
    initial: 2,
    secondaryLabel: "Góc quan sát quỹ đạo sau va chạm",
    secondaryMin: 15,
    secondaryMax: 60,
    secondaryInitial: 32,
    secondaryUnit: "°",
    modes: [
      "Rutherford: ⁴₂He + ¹⁴₇N → ¹⁷₈O + ¹₁p",
      "Chadwick: ⁴₂He + ⁹₄Be → ¹²₆C + ¹₀n",
      "Cockcroft-Walton: ¹₁p + ⁷₃Li → 2 ⁴₂He",
    ],
    actionButtonLabel: "Kích hoạt va chạm hạt nhân",
    caption:
      "Quan sát hạt đạn va chạm vào hạt nhân bia trong không gian 3D. Tổng số khối A và tổng điện tích Z trước và sau phản ứng luôn được bảo toàn.",
    buildLatex: (p) => {
      if (p.mode === 1) {
        return `{}_{2}^{4}\\mathrm{He} + {}_{4}^{9}\\mathrm{Be} \\rightarrow {}_{6}^{12}\\mathrm{C} + {}_{0}^{1}\\mathrm{n} \\qquad (\\sum A = 13,\\; \\sum Z = 6)`;
      }
      if (p.mode === 2) {
        return `{}_{1}^{1}\\mathrm{p} + {}_{3}^{7}\\mathrm{Li} \\rightarrow {}_{2}^{4}\\mathrm{He} + {}_{2}^{4}\\mathrm{He} \\qquad (\\sum A = 8,\\; \\sum Z = 4)`;
      }
      return `{}_{2}^{4}\\mathrm{He} + {}_{7}^{14}\\mathrm{N} \\rightarrow {}_{8}^{17}\\mathrm{O} + {}_{1}^{1}\\mathrm{p} \\qquad (\\sum A = 18,\\; \\sum Z = 9)`;
    },
    buildMetrics: (p) => {
      if (p.mode === 1) {
        return [
          { label: "Tổng số khối ∑A", value: "4 + 9 = 12 + 1 = 13" },
          { label: "Tổng điện tích ∑Z", value: "2 + 4 = 6 + 0 = 6" },
          { label: "Hạt phát hiện", value: "Neutron (¹₀n)" },
          { label: "Trạng thái", value: "Bảo toàn A và Z" },
        ];
      }
      if (p.mode === 2) {
        return [
          { label: "Tổng số khối ∑A", value: "1 + 7 = 4 + 4 = 8" },
          { label: "Tổng điện tích ∑Z", value: "1 + 3 = 2 + 2 = 4" },
          { label: "Sản phẩm", value: "2 hạt α (⁴₂He)" },
          { label: "Năng lượng tỏa ra", value: "17,3 MeV" },
        ];
      }
      return [
        { label: "Tổng số khối ∑A", value: "4 + 14 = 17 + 1 = 18" },
        { label: "Tổng điện tích ∑Z", value: "2 + 7 = 8 + 1 = 9" },
        { label: "Sản phẩm", value: "¹⁷₈O + ¹₁p" },
        { label: "Năng lượng", value: "Thu năng lượng (ΔE < 0)" },
      ];
    },
  },
  binding_energy_lab: {
    title: "Độ hụt khối Δm và Năng lượng liên kết hạt nhân 3D",
    label: "Độ tách rời các nucleon (cung cấp năng lượng)",
    min: 0,
    max: 100,
    initial: 20,
    unit: "%",
    modes: ["⁴₂He (Helium-4)", "¹²₆C (Carbon-12)", "Sắt-56"],
    actionButtonLabel: "Tách / Hợp nhất các nucleon",
    caption:
      "Kéo thanh trượt độ tách nucleon từ 0% (hạt nhân liên kết chặt) lên 100% (các nucleon rời nhau hoàn toàn) để so sánh tổng khối lượng các nucleon tự do với khối lượng hạt nhân.",
    buildLatex: (p) => {
      if (p.mode === 1) {
        return `\\Delta m({}_{6}^{12}\\mathrm{C}) = 6m_p + 6m_n - m_{\\mathrm{C}} = 0{,}0989\\text{ u} \\implies E_{\\text{lk}} \\approx 92{,}16\\text{ MeV} \\; (7{,}68\\text{ MeV/nucleon})`;
      }
      if (p.mode === 2) {
        return `\\Delta m({}_{26}^{56}\\mathrm{Fe}) = 26m_p + 30m_n - m_{\\mathrm{Fe}} = 0{,}5285\\text{ u} \\implies E_{\\text{lkr}} = \\frac{E_{\\text{lk}}}{56} \\approx 8{,}79\\text{ MeV/nucleon}`;
      }
      return `\\Delta m({}_{2}^{4}\\mathrm{He}) = 2m_p + 2m_n - m_{\\mathrm{He}} = 0{,}0304\\text{ u} \\implies E_{\\text{lk}} = \\Delta m \\cdot c^2 \\approx 28{,}3\\text{ MeV}`;
    },
    buildMetrics: (p) => {
      const split = p.amount > 50;
      if (p.mode === 1) {
        return [
          { label: "Hạt nhân", value: "¹²₆C (6p + 6n)" },
          { label: "Độ hụt khối Δm", value: "0,0989 u" },
          { label: "Năng lượng liên kết", value: "92,16 MeV" },
          { label: "Trạng thái 3D", value: split ? "Nucleon tự do (m lớn hơn)" : "Hạt nhân liên kết (hụt khối Δm)" },
        ];
      }
      if (p.mode === 2) {
        return [
          { label: "Hạt nhân", value: "Sắt-56" },
          { label: "Độ hụt khối Δm", value: "0,5285 u" },
          { label: "Năng lượng liên kết riêng", value: "8,79 MeV/nucleon" },
          { label: "Trạng thái 3D", value: split ? "Nucleon tự do" : "Liên kết cực kỳ bền vững" },
        ];
      }
      return [
        { label: "Hạt nhân", value: "⁴₂He (2p + 2n)" },
        { label: "Độ hụt khối Δm", value: "0,0304 u" },
        { label: "Năng lượng liên kết", value: "28,30 MeV (7,07 MeV/nu)" },
        { label: "Trạng thái 3D", value: split ? "Các nucleon rời nhau" : "Liên kết thành hạt nhân He-4" },
      ];
    },
  },
  nuclear_fission: {
    title: "Phản ứng phân hạch Uranium-235 & Phản ứng dây chuyền 3D",
    label: "Hệ số nhân neutron hiệu dụng k",
    min: 0.6,
    max: 1.6,
    step: 0.2,
    initial: 1.0,
    modes: [
      "Kênh SGK · Ytri-95 và Iốt-138",
      "Kênh đối chiếu · Bari-141 và Krypton-92",
    ],
    actionButtonLabel: "Bắn neutron nhiệt vào hạt nhân U-235",
    caption:
      "Hai kênh minh họa đều có ba neutron tự do. Hệ số nhân hiệu dụng chỉ mô tả xu hướng qua các thế hệ và không thay đổi phương trình một phân hạch. Kích thước và thời gian được phóng đại.",
    buildLatex: (p) => p.mode === 0
      ? NUCLEAR_REACTIONS.fission.latex
      : `{}_{0}^{1}\\mathrm{n} + {}_{92}^{235}\\mathrm{U} \\longrightarrow {}_{56}^{141}\\mathrm{Ba} + {}_{36}^{92}\\mathrm{Kr} + 3\\,{}_{0}^{1}\\mathrm{n}`,
    buildMetrics: (p) => {
      const kState =
        p.amount < 1
          ? "Dưới tới hạn (Tắt dần)"
          : Math.abs(p.amount - 1) < 0.05
          ? "Tới hạn (Ổn định k=1)"
          : "Vượt tới hạn (Tăng vọt)";
      return [
        { label: "Bảo toàn số khối ∑A", value: p.mode === 0 ? "235 + 1 = 95 + 138 + 3" : "235 + 1 = 141 + 92 + 3" },
        { label: "Bảo toàn điện tích ∑Z", value: p.mode === 0 ? "92 + 0 = 39 + 53" : "92 + 0 = 56 + 36" },
        { label: "Hệ số nhân k", value: `k = ${p.amount.toFixed(1)} (${kState})` },
        { label: "Năng lượng tỏa ra", value: "≈ 200 MeV / phân hạch" },
      ];
    },
  },
  nuclear_fusion: {
    title: "Phản ứng nhiệt hạch Deuterium – Tritium (D–T) 3D",
    label: "Tốc độ trình diễn va chạm",
    min: 1,
    max: 3,
    initial: 2,
    modes: ["Minh họa có phản ứng", "Minh họa chỉ tán xạ"],
    actionButtonLabel: "Phóng hai hạt nhân đơteri và triti",
    caption:
      "Hai hạt nhân đẩy nhau do cùng điện tích dương. Nhiệt độ cao làm tăng khả năng xảy ra nhiệt hạch. Hai chế độ mô tả hai kết quả có thể gặp, không tính xác suất hay ngưỡng nhiệt độ.",
    buildLatex: (p) => p.mode === 0
      ? `${NUCLEAR_REACTIONS.fusion.latex} \\qquad Q \\approx 17{,}6\\,\\mathrm{MeV}`
      : String.raw`{}^{2}_{1}\mathrm{H} + {}^{3}_{1}\mathrm{H} \longrightarrow {}^{2}_{1}\mathrm{H} + {}^{3}_{1}\mathrm{H}`,
    buildMetrics: (p) => [
      { label: "Tổng A trước và sau", value: "5" },
      { label: "Tổng Z trước và sau", value: "2" },
      { label: "Kết quả minh họa", value: p.mode === 0 ? "Tạo heli-4 và một neutron" : "Hai hạt đổi hướng" },
    ],
  },
  geiger_random_decay: {
    title: "Ống đếm Geiger–Müller và bản chất ngẫu nhiên của phóng xạ",
    label: "Hoạt độ giả định của nguồn",
    min: 1,
    max: 10,
    initial: 4,
    unit: "Bq",
    secondaryLabel: "Khoảng cách từ nguồn tới cửa sổ ống đếm",
    secondaryMin: 2,
    secondaryMax: 10,
    secondaryInitial: 4,
    secondaryUnit: "cm",
    modes: ["Nguồn hoạt độ chuẩn", "Tăng gấp đôi lượng chất phóng xạ"],
    actionButtonLabel: "Ghi nhận xung phóng xạ mới",
    caption:
      "Mỗi tia phóng xạ đi vào ống đếm Geiger–Müller làm ion hóa khí trơ tạo ra một xung điện. Quá trình phân rã của từng hạt nhân là hoàn toàn ngẫu nhiên.",
    buildLatex: (p) => {
      const mult = p.mode === 1 ? 2 : 1;
      const H = p.amount * mult;
      return `H(t) = -\\frac{\\mathrm{d}N}{\\mathrm{d}t} = \\lambda N(t), \\qquad I \\propto \\frac{H}{4\\pi r^2} \\quad (H \\approx ${H}\\text{ Bq quy ước})`;
    },
    buildMetrics: (p, elapsed) => {
      const mult = p.mode === 1 ? 2 : 1;
      const rate = ((p.amount * mult * 16) / (p.secondary * p.secondary)).toFixed(1);
      return [
        { label: "Tốc độ đếm trung bình", value: `${rate} xung/s` },
        { label: "Khoảng cách r", value: `${p.secondary} cm` },
        { label: "Thời gian đo", value: `${elapsed.toFixed(1)} s` },
        { label: "Số xung kì vọng (làm tròn)", value: `${Math.round(elapsed * Number(rate))} xung` },
      ];
    },
  },
  radiation_properties: {
    title: "Khả năng đâm xuyên và lệch trong từ trường của tia α, β, γ",
    label: "Bề dày tấm vật liệu che chắn",
    min: 1,
    max: 10,
    initial: 4,
    unit: "mm",
    secondaryLabel: "Cảm ứng từ B vuông góc quỹ đạo",
    secondaryMin: 0,
    secondaryMax: 10,
    secondaryInitial: 6,
    secondaryUnit: "0,1 T",
    modes: [
      "Phát đồng thời cả 3 tia α, β⁻, γ",
      "Tia α (⁴₂He²⁺) · Chắn bằng tờ giấy",
      "Tia β⁻ (e⁻) · Chắn bằng tấm nhôm",
      "Tia γ (photon) · Suy giảm qua tấm chì dày",
    ],
    actionButtonLabel: "Phóng chùm tia qua vùng từ trường",
    caption:
      "Điều chỉnh cảm ứng từ B để quan sát lực Lorentz làm lệch tia α (+2e) và β⁻ (-e) về hai phía ngược nhau, trong khi tia γ (q = 0) luôn truyền thẳng.",
    buildLatex: (p) => {
      return `\\vec{F}_{\\text{L}} = q(\\vec{v} \\times \\vec{B}), \\qquad R = \\frac{mv}{|q|B}, \\qquad I(d) = I_0 \\cdot e^{-\\mu d} \\quad (B = ${(p.secondary * 0.1).toFixed(1)}\\text{ T})`;
    },
    buildMetrics: (p) => {
      return [
        { label: "Tia α (+2e)", value: "Lệch ít (m lớn) · Dừng bởi giấy" },
        { label: "Tia β⁻ (-e)", value: "Lệch mạnh ngược chiều α · Dừng bởi Al" },
        { label: "Tia γ (q = 0)", value: `Không lệch · Xuyên qua ${p.amount} mm` },
        { label: "Từ trường B", value: `${(p.secondary * 0.1).toFixed(1)} T` },
      ];
    },
  },
  radioactive_decay_half_life: {
    title: "Định luật phóng xạ và Chu kì bán rã 3D (64 hạt nhân)",
    label: "Chu kì bán rã T",
    min: 2,
    max: 12,
    initial: 4,
    unit: "s",
    secondaryLabel: "Số hạt khảo sát N₀",
    secondaryMin: 64,
    secondaryMax: 64,
    secondaryInitial: 64,
    modes: ["Hiển thị hạt còn lại N(t) & hạt con ΔN", "Chỉ làm nổi bật hạt chưa phân rã N(t)"],
    actionButtonLabel: "Đặt lại mẫu N₀ = 64 hạt (t = 0)",
    caption:
      "Quan sát mạng tinh thể 64 hạt nhân phóng xạ trong không gian 3D. Sau mỗi chu kì bán rã T, một nửa số hạt nhân mẹ (màu xanh dương) phân rã thành hạt nhân con (màu xám bạc).",
    buildLatex: (p, elapsed) => {
      const T = p.amount;
      const frac = remainingFraction(elapsed, T);
      const N = Math.round(64 * frac);
      const dN = 64 - N;
      return `N(t) = N_0 \\cdot 2^{-\\frac{t}{T}} = 64 \\cdot 2^{-\\frac{${elapsed.toFixed(1)}}{${T}}} \\approx ${N}\\text{ hạt}, \\qquad \\Delta N = N_0 - N(t) = ${dN}\\text{ hạt}`;
    },
    buildMetrics: (p, elapsed) => {
      const T = p.amount;
      const frac = remainingFraction(elapsed, T);
      const N = Math.round(64 * frac);
      return [
        { label: "Thời gian t / T", value: `${(elapsed / T).toFixed(2)} T` },
        { label: "Hạt chưa phân rã N(t)", value: `${N} / 64 (${(frac * 100).toFixed(1)}%)` },
        { label: "Hạt đã phân rã ΔN", value: `${64 - N} hạt` },
        { label: "Hằng số phóng xạ λ", value: `${(Math.LN2 / T).toFixed(3)} s⁻¹` },
      ];
    },
  },
  carbon14_dating: {
    title: "Định tuổi cổ vật bằng đồng vị phóng xạ Carbon-14 (T = 5730 năm)",
    label: "Tuổi của mẫu cổ vật t",
    min: 0,
    max: 22920,
    step: 200,
    initial: 5730,
    unit: "năm",
    secondaryLabel: "Chu kì bán rã T(¹⁴C)",
    secondaryMin: 5730,
    secondaryMax: 5730,
    secondaryInitial: 5730,
    secondaryUnit: "năm",
    modes: ["Mẫu gỗ cổ đại", "Mẫu xương hóa thạch"],
    actionButtonLabel: "Đo tỉ lệ ¹⁴C / ¹²C trong mẫu",
    caption:
      "Khi sinh vật còn sống, tỉ lệ ¹⁴C/¹²C không đổi. Khi sinh vật chết, ¹⁴C phân rã β⁻ với chu kì bán rã T = 5730 năm. Đo độ phóng xạ H(t) giúp xác định niên đại cổ vật.",
    buildLatex: (p) => {
      const t = p.amount;
      const pct = (remainingFraction(t, CARBON14_HALF_LIFE_YEARS) * 100).toFixed(1);
      return `{}_{6}^{14}\\mathrm{C} \\rightarrow {}_{7}^{14}\\mathrm{N} + {}_{-1}^{0}\\mathrm{e} + \\bar{\\nu}_e, \\qquad \\frac{H(t)}{H_0} = 2^{-\\frac{${t}}{5730}} \\approx ${pct}\\%`;
    },
    buildMetrics: (p) => {
      const t = p.amount;
      const frac = remainingFraction(t, CARBON14_HALF_LIFE_YEARS);
      return [
        { label: "Tuổi mẫu cổ vật t", value: `${t.toLocaleString("vi-VN")} năm` },
        { label: "Số chu kì t / T", value: `${(t / 5730).toFixed(2)} T` },
        { label: "Tỉ lệ ¹⁴C còn lại", value: `${(frac * 100).toFixed(1)}%` },
        { label: "Số hạt mô hình", value: `${Math.round(64 * frac)} / 64 hạt` },
      ];
    },
  },
  radiation_safety: {
    title: "Ba nguyên tắc An toàn bức xạ: Thời gian – Khoảng cách – Che chắn",
    label: "Khoảng cách từ nhân viên tới nguồn r",
    min: 2,
    max: 10,
    initial: 5,
    unit: "m",
    secondaryLabel: "Bề dày tường chì che chắn",
    secondaryMin: 0,
    secondaryMax: 10,
    secondaryInitial: 5,
    secondaryUnit: "cm",
    modes: ["Có tấm chắn chì bảo vệ", "Không có tấm chắn"],
    actionButtonLabel: "So sánh cường độ tương đối",
    caption:
      "Mô hình nguồn điểm dùng để so sánh khoảng cách và che chắn. Cường độ tương đối không đủ để suy ra liều hay đánh giá an toàn thực tế.",
    buildLatex: (p) => {
      const r = p.amount;
      const d = p.mode === 0 ? p.secondary : 0;
      const rel = ((1 / (r * r)) * Math.exp(-0.35 * d) * 100).toFixed(2);
      return `\\frac{I(r,d)}{I(1\\,\\mathrm{m},0)} = \\left(\\frac{1\\,\\mathrm{m}}{r}\\right)^2 e^{-\\mu d} \\implies I_{\\text{tương đối}} \\approx ${rel}\\% \\quad (r = ${r}\\text{ m},\\; d = ${d}\\text{ cm})`;
    },
    buildMetrics: (p) => {
      const r = p.amount;
      const d = p.mode === 0 ? p.secondary : 0;
      const rel = ((1 / (r * r)) * Math.exp(-0.35 * d) * 100).toFixed(2);
      return [
        { label: "Khoảng cách r", value: `${r} m (giảm ${r * r} lần)` },
        { label: "Bề dày tấm chắn d", value: `${d} cm chì` },
        { label: "Cường độ bức xạ", value: `${rel}% so với mốc 1 m, không che chắn` },
      ];
    },
  },
  nuclear_power_energy_flow: {
    title: "Sơ đồ 2 vòng tuần hoàn nhiệt trong Nhà máy Điện hạt nhân PWR (3D)",
    label: "Công suất phản ứng tại tâm lò",
    min: 1,
    max: 5,
    initial: 3,
    unit: "GW nhiệt",
    secondaryLabel: "Hiệu suất chu trình hơi nước – turbine",
    secondaryMin: 30,
    secondaryMax: 38,
    secondaryInitial: 33,
    secondaryUnit: "%",
    modes: ["Vận hành bình thường (2 vòng cách li)", "Hiển thị chi tiết bình sinh hơi"],
    actionButtonLabel: "Tăng / Điều tiết lưu lượng tuần hoàn",
    caption:
      "Vòng sơ cấp (màu đỏ) dẫn nước áp suất cao nhận nhiệt từ tâm lò sang bình sinh hơi và được giữ kín hoàn toàn. Vòng thứ cấp (màu xanh) nhận nhiệt hóa hơi quay turbine phát điện.",
    buildLatex: (p) => {
      const Pth = p.amount * 1000;
      const eta = p.secondary / 100;
      const Pel = Math.round(Pth * eta);
      return `P_{\\text{điện}} = \\eta \\cdot P_{\\text{nhiệt}} = \\eta \\cdot \\frac{N_{\\text{phân hạch}} \\cdot 200\\text{ MeV}}{t} \\approx ${Pel}\\text{ MW}_{\\text{e}}`;
    },
    buildMetrics: (p) => {
      const Pth = p.amount * 1000;
      const Pel = Math.round((Pth * p.secondary) / 100);
      return [
        { label: "Công suất nhiệt P_th", value: `${Pth} MW` },
        { label: "Hiệu suất nhiệt điện η", value: `${p.secondary}%` },
        { label: "Công suất phát điện P_e", value: `${Pel} MW` },
        { label: "An toàn cách li", value: "2 vòng tuần hoàn tách biệt" },
      ];
    },
  },
  reactor_control_concept: {
    title: "Điều khiển hệ số nhân neutron k bằng thanh hấp thụ Boron / Cadmium (3D)",
    label: "Độ ngập thanh điều khiển trong tâm lò",
    min: 0,
    max: 100,
    initial: 50,
    unit: "%",
    secondaryLabel: "Mật độ dòng neutron nhiệt",
    secondaryMin: 1,
    secondaryMax: 10,
    secondaryInitial: 5,
    modes: ["Vận hành điều chỉnh k", "Hạ khẩn cấp toàn bộ thanh điều khiển (SCRAM)"],
    actionButtonLabel: "Quan sát lại hệ số nhân",
    caption:
      "Thanh điều khiển hấp thụ neutron. Quan hệ giữa độ ngập và hệ số nhân trong hình do mô hình quy ước, không phải thông số vận hành lò thực tế.",
    buildLatex: (p) => {
      const depth = p.mode === 1 ? 100 : p.amount;
      const k = Math.max(0.2, 1.5 - depth * 0.01).toFixed(2);
      const stateText =
        Number(k) > 1.02 ? "\\text{Vượt tới hạn}" : Number(k) < 0.98 ? "\\text{Dưới tới hạn}" : "\\text{Tới hạn ổn định}";
      return `k = \\frac{N_{\\text{neutron thế hệ sau}}}{N_{\\text{neutron thế hệ trước}}} \\approx ${k} \\quad (${stateText})`;
    },
    buildMetrics: (p) => {
      const depth = p.mode === 1 ? 100 : p.amount;
      const k = Math.max(0.2, 1.5 - depth * 0.01).toFixed(2);
      return [
        { label: "Độ ngập thanh hấp thụ", value: `${depth}%` },
        { label: "Hệ số nhân neutron k", value: `k = ${k}` },
        {
          label: "Trạng thái tâm lò",
          value: Number(k) > 1.02 ? "k > 1 (Công suất tăng)" : Number(k) < 0.98 ? "k < 1 (Công suất giảm)" : "k = 1 (Ổn định)",
        },
      ];
    },
  },
  nuclear_medicine: {
    title: "Chẩn đoán hình ảnh PET/CT và Xạ trị ung thư bằng tia phóng xạ (3D)",
    label: "Cường độ hoạt độ dược chất phóng xạ",
    min: 1,
    max: 5,
    initial: 3,
    secondaryLabel: "Góc hội tụ chùm tia điều trị",
    secondaryMin: 0,
    secondaryMax: 90,
    secondaryInitial: 45,
    secondaryUnit: "°",
    modes: ["Chụp PET · Hủy cặp e⁺ + e⁻ → 2γ (180°)", "Xạ trị ngoài · Hội tụ chùm tia γ Cobalt-60"],
    actionButtonLabel: "Phát xung chẩn đoán / xạ trị",
    caption:
      "Trong chụp PET, đồng vị phát positron (e⁺) hủy cặp với electron tạo ra hai photon gamma (0,511 MeV) bay ngược chiều nhau 180° tới vòng đầu thu.",
    buildLatex: (p) => {
      return p.mode === 0
        ? `{}_{+1}^{0}\\mathrm{e} + {}_{-1}^{0}\\mathrm{e} \\rightarrow 2\\gamma \\quad (E_\\gamma = 0{,}511\\text{ MeV},\\; \\Delta\\varphi = 180^\\circ)`
        : `{}_{27}^{60}\\mathrm{Co} \\rightarrow {}_{28}^{60}\\mathrm{Ni}^* + {}_{-1}^{0}\\mathrm{e} + \\bar{\\nu}_e \\rightarrow {}_{28}^{60}\\mathrm{Ni} + 2\\gamma`;
    },
    buildMetrics: (p) => {
      return [
        { label: "Kĩ thuật y học", value: p.mode === 0 ? "Chụp cắt lớp PET" : "Xạ trị hội tụ tia γ" },
        { label: "Đồng vị sử dụng", value: p.mode === 0 ? "¹⁸F-FDG (phát β⁺)" : "⁶⁰Co / ¹³¹I" },
        { label: "Góc lệch photon", value: p.mode === 0 ? "180° (trùng phùng)" : `Góc chiếu ${p.secondary}°` },
        { label: "Mục đích", value: p.mode === 0 ? "Định vị chính xác khối u" : "Tiêu diệt tế bào ác tính" },
      ];
    },
  },
  radiation_applications: {
    title: "Ứng dụng bức xạ trong Công nghiệp (Kiểm định mối hàn) & Nông nghiệp",
    label: "Tốc độ dây chuyền kiểm định",
    min: 1,
    max: 5,
    initial: 2,
    secondaryLabel: "Hệ số hấp thụ vật liệu μ",
    secondaryMin: 1,
    secondaryMax: 10,
    secondaryInitial: 4,
    modes: ["Chiếu xạ bảo quản nông sản xuất khẩu", "Chụp ảnh bức xạ kiểm tra bọt khí mối hàn"],
    actionButtonLabel: "Quét kiểm tra mẫu mới",
    caption:
      "Chùm tia gamma đi qua vật liệu bị suy giảm theo định luật hàm mũ. Nếu mối hàn có lỗ rỗng khuyết tật, đầu thu phía dưới sẽ ghi nhận cường độ tia truyền qua cao bất thường.",
    buildLatex: (p) => {
      return `I = I_0 \\cdot e^{-\\mu d}, \\qquad \\Delta I = I_{\\text{khuyết tật}} - I_{\\text{đặc}} > 0 \\quad (\\mu_{\\text{quy ước}} = ${p.secondary})`;
    },
    buildMetrics: (p) => {
      return [
        { label: "Lĩnh vực ứng dụng", value: p.mode === 0 ? "Nông nghiệp & Thực phẩm" : "Kiểm định không phá hủy (NDT)" },
        { label: "Nguồn bức xạ", value: p.mode === 0 ? "⁶⁰Co / ¹³⁷Cs" : "¹⁹²Ir / ⁶⁰Co" },
        { label: "Tác dụng", value: p.mode === 0 ? "Diệt khuẩn, ức chế nảy mầm" : "Phát hiện vết nứt ngầm" },
        { label: "An toàn sản phẩm", value: "Không gây nhiễm phóng xạ thứ cấp" },
      ];
    },
  },
  nuclear_physics_practice_lab: {
    title: "Thực hành xác định Chu kì bán rã T từ số liệu đếm xung 3D",
    label: "Chu kì bán rã đặt cho mô hình",
    min: 2,
    max: 12,
    initial: 4,
    unit: "s",
    secondaryLabel: "Khoảng thời gian lấy mẫu Δt",
    secondaryMin: 1,
    secondaryMax: 4,
    secondaryInitial: 2,
    secondaryUnit: "s",
    modes: ["Đo đồng thời N(t) và độ phóng xạ H(t)", "Đối chiếu đường cong lí thuyết"],
    actionButtonLabel: "Chạy lại phép đo từ t = 0",
    caption:
      "Đọc số hạt còn lại theo kì vọng và đối chiếu với hoạt độ tỉ lệ với số hạt. Mô phỏng dùng thời gian và dữ liệu quy ước, không phải phép đo trên thiết bị.",
    buildLatex: (p, elapsed) => {
      const T = p.amount;
      const frac = remainingFraction(elapsed, T);
      return `H(t) = H_0 \\cdot 2^{-\\frac{t}{T}} \\implies T = \\frac{t}{\\log_2\\!\\left(\\frac{H_0}{H(t)}\\right)} = ${T}\\text{ s}, \\qquad \\frac{H(t)}{H_0} \\approx ${(frac * 100).toFixed(1)}\\%`;
    },
    buildMetrics: (p, elapsed) => {
      const T = p.amount;
      const frac = remainingFraction(elapsed, T);
      return [
        { label: "Chu kì bán rã T", value: `${T} s` },
        { label: "Thời điểm đo t", value: `${elapsed.toFixed(1)} s (${(elapsed / T).toFixed(2)} T)` },
        { label: "Tỉ số H(t) / H₀", value: `${(frac * 100).toFixed(1)}%` },
        { label: "Số hạt còn lại", value: `${Math.round(64 * frac)} / 64 hạt` },
      ];
    },
  },
};

function makeExperiment(
  scene: THREE.Scene,
  key: BasicActivityKey,
  parameters: Parameters
) {
  const root = new THREE.Group();
  scene.add(root);
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const legend: string[] = [];
  const markers: THREE.Sprite[] = [];
  const interactiveMeshes: { mesh: THREE.Object3D; info: string }[] = [];

  function label(text: string, x: number, y: number, z = 0) {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext("2d");
    if (!context) return;
    legend.push(text);
    context.fillStyle = "#0f172a";
    context.beginPath();
    context.arc(32, 32, 28, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#38bdf8";
    context.lineWidth = 3.5;
    context.stroke();
    context.font = "bold 34px Inter, system-ui, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#ffffff";
    context.fillText(String(legend.length), 32, 33);
    const texture = new THREE.CanvasTexture(canvas);
    textures.add(texture);
    const m = new THREE.SpriteMaterial({
      map: texture,
      depthTest: false,
      sizeAttenuation: false,
    });
    materials.add(m);
    const sprite = new THREE.Sprite(m);
    markers.push(sprite);
    sprite.position.set(x, y, z);
    root.add(sprite);
  }

  const sphereGeometry = new THREE.SphereGeometry(1, 32, 24);
  geometries.add(sphereGeometry);
  const materialCache = new Map<number, THREE.MeshPhysicalMaterial>();

  function material(color: number, opacity = 1) {
    const cacheKey = color * 100 + Math.round(opacity * 100);
    let m = materialCache.get(cacheKey);
    if (!m) {
      m = new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.16,
        metalness: 0.12,
        clearcoat: 0.85,
        clearcoatRoughness: 0.12,
        transparent: opacity < 1,
        opacity,
      });
      materialCache.set(cacheKey, m);
      materials.add(m);
    }
    return m;
  }

  function ball(
    color: number,
    size = 0.24,
    parent: THREE.Group = root,
    info?: string
  ) {
    const mesh = new THREE.Mesh(sphereGeometry, material(color));
    mesh.scale.setScalar(size);
    parent.add(mesh);
    if (info) interactiveMeshes.push({ mesh, info });
    return mesh;
  }

  function box(
    color: number,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    info?: string,
    opacity = 1
  ) {
    const g = new THREE.BoxGeometry(w, h, d);
    geometries.add(g);
    const mesh = new THREE.Mesh(g, material(color, opacity));
    mesh.position.set(x, y, z);
    root.add(mesh);
    if (info) interactiveMeshes.push({ mesh, info });
    return mesh;
  }

  function line(points: THREE.Vector3[], color: number) {
    const g = new THREE.BufferGeometry().setFromPoints(points);
    geometries.add(g);
    const m = new THREE.LineBasicMaterial({ color });
    materials.add(m);
    const l = new THREE.Line(g, m);
    root.add(l);
    return l;
  }

  function ring(x: number, radius: number, color: number, info?: string) {
    const g = new THREE.TorusGeometry(radius, 0.06, 12, 72);
    geometries.add(g);
    const mesh = new THREE.Mesh(g, material(color));
    mesh.rotation.y = Math.PI / 2;
    mesh.position.x = x;
    root.add(mesh);
    if (info) interactiveMeshes.push({ mesh, info });
    return mesh;
  }

  function nucleus(z: number, n: number, size = 0.25, infoPrefix = "") {
    const group = new THREE.Group();
    root.add(group);
    const layout = buildNucleusLayout({ A: z + n, Z: z, N: n });
    const scale = 0.78 / layout.radius;
    for (const particle of layout.particles) {
      const isProton = particle.kind === "proton";
      const b = ball(
        isProton ? 0xe11d48 : 0x0284c7,
        Math.min(size, 0.66 * scale),
        group,
        isProton
          ? `${infoPrefix}Proton (điện tích +e, khối lượng xấp xỉ 1,0073 u)`
          : `${infoPrefix}Neutron (điện tích bằng 0, khối lượng xấp xỉ 1,0087 u)`
      );
      b.position.set(particle.x * scale, particle.y * scale, particle.z * scale);
    }
    return group;
  }

  const updates: ((time: number) => void)[] = [];
  const amber = 0xf59e0b;
  const blue = 0x0ea5e9;
  const crimson = 0xe11d48;
  const emerald = 0x10b981;

  if (key === "rutherford_alpha_scattering") {
    box(0x334155, -5.2, 0, 0, 0.9, 0.9, 0.9, "Nguồn phát hạt α (Radium/Polonium trong buồng chì)");
    const foilColor = parameters.mode === 0 ? 0xf59e0b : parameters.mode === 1 ? 0x94a3b8 : 0x60a5fa;
    box(foilColor, 0, 0, 0, 0.04, 3.6, 3.6, "Lá kim loại mỏng (tán xạ hạt α)", 0.45);
    ring(0, 4.2, 0x10b981, "Màn huỳnh quang ZnS thu nhận đốm sáng khi hạt α đập vào");
    const target = TARGETS[parameters.mode] ?? TARGETS[0];
    const core = nucleus(target.Z, target.A - target.Z, 0.16, `Hạt nhân bia ${target.symbol}-${target.A}: `);
    core.position.set(0, 0, 0);

    const E = Math.max(3, parameters.secondary);
    const beamOffsets = [parameters.amount, -80, -30, 55, 90];
    const alphaParticles = beamOffsets.map((impact, idx) => {
      const b = impact / 50;
      const theta = Math.sign(impact) * rutherfordAngle(target.Z, Math.abs(impact), E);
      const path: THREE.Vector3[] = [];
      for (let i = 0; i <= 100; i++) {
        const u = i / 100;
        path.push(
          u < 0.5
            ? new THREE.Vector3(-5 + 10 * u, b, (idx - 2) * 0.25)
            : new THREE.Vector3(
                10 * (u - 0.5) * Math.cos(theta),
                b + 10 * (u - 0.5) * Math.sin(theta),
                (idx - 2) * 0.25
              )
        );
      }
      line(path, idx === 0 ? amber : 0x38bdf8);
      const particle = ball(
        idx === 0 ? amber : 0x38bdf8,
        idx === 0 ? 0.19 : 0.13,
        root,
        idx === 0 ? "Hạt α chính đang khảo sát thông số va chạm b" : "Chùm hạt α đối chiếu"
      );
      return { particle, path, offset: idx * 0.65 };
    });

    updates.push((t) => {
      alphaParticles.forEach(({ particle, path, offset }) => {
        const idx = Math.floor((((t + offset) % 4) / 4) * 100);
        particle.position.copy(path[idx]);
      });
    });
  } else if (
    key === "nuclear_structure_builder" ||
    key === "isotope_and_nuclear_size" ||
    key === "binding_energy_lab"
  ) {
    const z =
      key === "nuclear_structure_builder"
        ? parameters.amount
        : key === "isotope_and_nuclear_size"
        ? 6
        : parameters.mode === 1
        ? 6
        : parameters.mode === 2
        ? 26
        : 2;
    const n =
      key === "nuclear_structure_builder"
        ? parameters.mode === 1
          ? z
          : parameters.mode === 2
          ? z + 2
          : parameters.secondary
        : key === "isotope_and_nuclear_size"
        ? parameters.amount - 6
        : parameters.mode === 1
        ? 6
        : parameters.mode === 2
        ? 30
        : 2;

    const group = nucleus(z, n, 0.26);
    if (key === "isotope_and_nuclear_size" && parameters.mode === 0) {
      const boundary = ring(
        0,
        (1.2 * Math.cbrt(parameters.amount)) / 2.6,
        emerald,
        `Mặt cầu bán kính hạt nhân R ≈ ${(1.2 * Math.cbrt(parameters.amount)).toFixed(2)} fm`
      );
      boundary.rotation.y = 0;
    }
    if (key === "binding_energy_lab") {
      const spread = 1 + parameters.amount / 36;
      group.children.forEach((b) => b.position.multiplyScalar(spread));
    }
  } else if (key === "nuclear_reaction_balancer" || key === "nuclear_fusion") {
    const fusion = key === "nuclear_fusion";
    const target = nucleus(
      fusion ? 1 : parameters.mode === 1 ? 4 : parameters.mode === 2 ? 3 : 7,
      fusion ? 2 : parameters.mode === 1 ? 5 : parameters.mode === 2 ? 4 : 7,
      0.22,
      "Hạt nhân bia: "
    );
    target.position.x = 0.3;
    const projectile = nucleus(
      fusion ? 1 : parameters.mode === 2 ? 1 : 2,
      fusion ? 1 : parameters.mode === 2 ? 0 : 2,
      0.22,
      "Hạt đạn tới: "
    );
    const product = nucleus(
      fusion ? 2 : parameters.mode === 1 ? 6 : parameters.mode === 2 ? 2 : 8,
      fusion ? 2 : parameters.mode === 1 ? 6 : parameters.mode === 2 ? 2 : 9,
      0.22,
      "Hạt nhân tạo thành: "
    );
    let outgoing: THREE.Object3D;
    if (!fusion && parameters.mode === 2) {
      outgoing = nucleus(2, 2, 0.22, "Hạt alpha thứ hai: ");
    } else {
      outgoing = ball(fusion || parameters.mode === 1 ? blue : crimson, 0.21, root,
        fusion || parameters.mode === 1 ? "Neutron phát ra" : "Proton phát ra");
    }
    const angleRad = THREE.MathUtils.degToRad(parameters.secondary || 30);

    updates.push((t) => {
      const u = (t * Math.max(1, parameters.amount * 0.6)) % 5.5;
      const canReact = !fusion || parameters.mode === 0;
      const reacted = u >= 2 && canReact;
      target.visible = !reacted;
      projectile.visible = !reacted;
      if (!reacted) {
        const xPos = u < 2 ? -5 + 2.6 * u : 0.2 - (u - 2) * 2.2;
        const yPos = u < 2 ? 0 : (u - 2) * 0.8;
        projectile.position.set(xPos, yPos, 0);
      }
      product.visible = reacted;
      outgoing.visible = reacted;
      const v = Math.max(0, u - 2);
      product.position.set(v * 0.65, v * 0.25, 0);
      outgoing.position.set(
        v * 1.5 * Math.cos(angleRad),
        -v * 1.5 * Math.sin(angleRad),
        0
      );
    });
  } else if (key === "nuclear_fission") {
    const fragments = FISSION_FRAGMENTS[parameters.mode] ?? FISSION_FRAGMENTS[0];
    const u235 = nucleus(NUCLIDES.U235.Z, NUCLIDES.U235.N, 0.22, "Hạt nhân urani-235: ");
    const u236 = nucleus(NUCLIDES.U236.Z, NUCLIDES.U236.N, 0.22, "Hạt nhân urani-236 kích thích: ");
    const [frag1, frag2] = fragments.map(({ Z, A, name }) => nucleus(Z, A - Z, 0.19, `Mảnh ${name}: `));
    const incomingN = ball(blue, 0.2, root, "Neutron tới");
    const secNeutrons = Array.from({ length: FISSION_NEUTRONS }, (_, idx) =>
      ball(blue, 0.17, root, `Neutron tự do số ${idx + 1}`)
    );
    updates.push((t) => {
      const u = (t * 1.25) % 6;
      const split = u >= 2.2;
      u235.visible = u < 2;
      u236.visible = u >= 2 && !split;
      incomingN.visible = u < 2.0;
      if (u < 2.0) {
        incomingN.position.set(-4.8 + u * 2.4, 0, 0);

      } else if (!split) {
        const stretch = 1 + (u - 2.0) * 1.8;
        u236.scale.set(stretch, 1 / Math.sqrt(stretch), 1 / Math.sqrt(stretch));
      }
      frag1.visible = split;
      frag2.visible = split;
      const v = Math.max(0, u - 2.2);
      frag1.position.set(v * 0.9, v * 0.65, 0);
      frag2.position.set(v * 0.9, -v * 0.65, 0);
      secNeutrons.forEach((sn, idx) => {
        sn.visible = split;
        const angle = (idx - (FISSION_NEUTRONS - 1) / 2) * 0.42;
        sn.position.set(v * 1.75 * Math.cos(angle), v * 1.75 * Math.sin(angle), (idx - 1) * 0.25 * v);
      });
    });
  } else if (
    [
      "radioactive_decay_half_life",
      "carbon14_dating",
      "nuclear_physics_practice_lab",
    ].includes(key)
  ) {
    const beads = Array.from({ length: 64 }, (_, i) => {
      const b = ball(blue, 0.19, root, `Hạt nhân #${i + 1} trong mẫu 64 hạt`);
      b.position.set(
        ((i % 4) - 1.5) * 0.64,
        (Math.floor(i / 16) - 1.5) * 0.64,
        ((Math.floor(i / 4) % 4) - 1.5) * 0.64
      );
      return b;
    });
    box(0x334155, 3.2, 0, 0, 0.45, 2.2, 2.2, "Đầu thu xung phóng xạ H(t)");
    const pulse = ball(amber, 0.16, root, "Hạt phóng xạ phát ra từ mẫu");
    updates.push((t) => {
      const fraction = remainingFraction(
        key === "carbon14_dating"
          ? parameters.amount
          : Math.min(t, 4 * parameters.amount),
        key === "carbon14_dating" ? CARBON14_HALF_LIFE_YEARS : parameters.amount
      );
      const remainingCount = Math.round(64 * fraction);
      beads.forEach((b, i) => {
        const isUndecayed = i < remainingCount;
        b.material = material(isUndecayed ? blue : 0x64748b, isUndecayed ? 1 : 0.45);
      });
      pulse.position.set(3.2 * ((t * 1.5) % 1), Math.sin(t * 6) * 0.25, 0);
    });
  } else if (key === "geiger_random_decay") {
    box(amber, 0, 0, 0, 0.85, 0.85, 0.85, "Nguồn phóng xạ chuẩn");
    const dist = Math.max(2, Math.min(6, parameters.secondary * 0.65));
    box(0x334155, dist, 0, 0, 0.8, 1.4, 1.4, "Ống đếm Geiger–Müller");
    const mult = parameters.mode === 1 ? 2 : 1;
    const hits = Array.from({ length: 24 }, (_, idx) => ({
      b: ball(idx % 2 === 0 ? amber : blue, 0.11, root, "Tia phóng xạ đi vào ống đếm"),
      start: (idx * 0.37) % 6,
      angleY: ((idx % 5) - 2) * 0.08,
      angleZ: ((idx % 3) - 1) * 0.08,
    }));
    updates.push((t) =>
      hits.forEach(({ b, start, angleY, angleZ }) => {
        const u = ((t * parameters.amount * mult) / 3.5 + start) % 4;
        b.visible = u < 1;
        b.position.set(u * dist, u * dist * angleY, u * dist * angleZ);
      })
    );
  } else if (key === "radiation_properties" || key === "radiation_safety") {
    box(amber, -3.5, 0, 0, 0.85, 0.9, 0.9, "Nguồn phát tia phóng xạ");
    const safety = key === "radiation_safety";
    const shieldX = -0.5;
    const shieldColor = safety
      ? 0x475569
      : [0x94a3b8, 0xfef3c7, 0x93c5fd, 0x475569][parameters.mode] ?? 0x94a3b8;
    const shield = box(
      shieldColor,
      shieldX,
      0,
      0,
      safety ? Math.max(0.15, parameters.secondary * 0.08) : Math.max(0.12, parameters.amount * 0.06),
      3.4,
      3.4,
      "Tấm vật liệu che chắn bức xạ",
      0.72
    );
    shield.visible = !safety || parameters.mode === 0;
    const detectorX = safety ? Math.min(5.5, parameters.amount * 0.6) : 3.5;
    box(emerald, detectorX, 0, 0, 0.25, 2.2, 2.2, "Đầu thu đo cường độ bức xạ truyền qua");

    const bField = (parameters.secondary || 0) * 0.08;
    const alphaBeads = Array.from({ length: 6 }, () =>
      ball(crimson, 0.16, root, "Hạt α (⁴₂He²⁺): mang điện +2e, lệch về cực âm")
    );
    const betaBeads = Array.from({ length: 8 }, () =>
      ball(blue, 0.1, root, "Hạt β⁻ (e⁻): mang điện -e, lệch mạnh ngược chiều α")
    );
    const gammaBeads = Array.from({ length: 8 }, () =>
      ball(amber, 0.11, root, "Photon tia γ (q = 0): truyền thẳng, đâm xuyên mạnh")
    );

    updates.push((t) => {
      const showAlpha = safety || parameters.mode === 0 || parameters.mode === 1;
      const showBeta = safety || parameters.mode === 0 || parameters.mode === 2;
      const showGamma = safety || parameters.mode === 0 || parameters.mode === 3;

      alphaBeads.forEach((b, i) => {
        if (!showAlpha) {
          b.visible = false;
          return;
        }
        const u = (t * 0.38 + i / 6) % 1;
        const x = -3.2 + u * (detectorX + 3.2);
        const stopped = shield.visible && x > shieldX;
        b.visible = !stopped;
        const deflect = x > -2.5 ? Math.pow(Math.max(0, x + 2.5) * 0.35, 1.8) * bField : 0;
        b.position.set(x, 0.35 + deflect, 0);
      });

      betaBeads.forEach((b, i) => {
        if (!showBeta) {
          b.visible = false;
          return;
        }
        const u = (t * 0.55 + i / 8) % 1;
        const x = -3.2 + u * (detectorX + 3.2);
        const stopped = shield.visible && parameters.amount >= 4 && x > shieldX;
        b.visible = !stopped;
        const deflect = x > -2.5 ? -Math.pow(Math.max(0, x + 2.5) * 0.48, 1.85) * bField : 0;
        b.position.set(x, -0.25 + deflect, 0.25);
      });

      gammaBeads.forEach((b, i) => {
        if (!showGamma) {
          b.visible = false;
          return;
        }
        const u = (t * 0.75 + i / 8) % 1;
        const x = -3.2 + u * (detectorX + 3.2);
        const attenuated = shield.visible && x > shieldX && i % 2 === 1 && parameters.amount >= 6;
        b.visible = !attenuated;
        b.position.set(x, Math.sin(x * 4 - t * 12) * 0.12, -0.25);
      });
    });
  } else if (key === "nuclear_power_energy_flow") {
    box(0x1e293b, -4, 0, 0, 1.35, 2.2, 1.35, "Lò phản ứng hạt nhân (Vùng tâm lò)");
    box(0x475569, 0, 0, 0, 1.3, 2.2, 1.3, "Bình sinh hơi (Trao đổi nhiệt sơ cấp – thứ cấp)");
    box(emerald, 4, 0, 0, 1.1, 1.4, 1.4, "Máy phát điện đồng bộ");
    const loop1 = [
      new THREE.Vector3(-4, 0.85, 0),
      new THREE.Vector3(0, 0.85, 0),
      new THREE.Vector3(0, -0.85, 0),
      new THREE.Vector3(-4, -0.85, 0),
      new THREE.Vector3(-4, 0.85, 0),
    ];
    const loop2 = [
      new THREE.Vector3(0, 0.85, 0.9),
      new THREE.Vector3(3, 0.85, 0.9),
      new THREE.Vector3(3, -0.85, 0.9),
      new THREE.Vector3(0, -0.85, 0.9),
      new THREE.Vector3(0, 0.85, 0.9),
    ];
    line(loop1, crimson);
    line(loop2, blue);
    const turbine = new THREE.Group();
    root.add(turbine);
    turbine.position.set(3, 0, 0.9);
    for (let i = 0; i < 6; i++) {
      const b = ball(amber, 0.21, turbine, "Cánh turbine hơi nước");
      b.position.set(
        0,
        0.65 * Math.cos((i * Math.PI) / 3),
        0.65 * Math.sin((i * Math.PI) / 3)
      );
    }
    [loop1, loop2].forEach((path, j) => {
      const curve = new THREE.CurvePath<THREE.Vector3>();
      for (let i = 1; i < path.length; i++)
        curve.add(new THREE.LineCurve3(path[i - 1], path[i]));
      for (let k = 0; k < 4; k++) {
        const p = ball(
          j ? blue : crimson,
          0.14,
          root,
          j ? "Hơi nước vòng thứ cấp (không phóng xạ)" : "Nước áp suất cao vòng sơ cấp"
        );
        updates.push((t) =>
          p.position.copy(
            curve.getPoint(((t * parameters.amount) / 8 + k * 0.25) % 1)
          )
        );
      }
    });
    updates.push((t) => (turbine.rotation.x = t * parameters.amount * 1.4));
  } else if (key === "reactor_control_concept") {
    const depthVal = parameters.mode === 1 ? 100 : parameters.amount;
    const rods = Array.from({ length: 3 }, (_, i) =>
      box(
        0x10b981,
        (i - 1) * 1.15,
        2,
        0,
        0.24,
        3.1,
        0.24,
        "Thanh điều khiển Boron/Cadmium hấp thụ neutron nhiệt"
      )
    );
    const fuel = Array.from({ length: 6 }, (_, i) => {
      const g = nucleus(4, 5, 0.16, "Thanh nhiên liệu Uranium-235: ");
      g.position.set(((i % 3) - 1) * 1.15, Math.floor(i / 3) * 1.4 - 0.7, 0.55);
      return g;
    });
    const neutrons = Array.from({ length: 18 }, () =>
      ball(amber, 0.11, root, "Neutron nhiệt duy trì phản ứng dây chuyền")
    );
    updates.push((t) => {
      rods.forEach((b) => (b.position.y = 3.5 - depthVal / 48));
      const activeCount = Math.max(1, Math.round(18 * (1 - depthVal / 108)));
      neutrons.forEach((b, i) => {
        b.visible = i < activeCount;
        b.position.set(
          2.1 * Math.sin(t * 1.6 + i),
          Math.cos(t * 1.1 + i * 1.3),
          Math.sin(t * 1.3 + i)
        );
      });
      fuel.forEach((g, i) => g.scale.setScalar(1 + 0.04 * Math.sin(t * 3 + i)));
    });
  } else if (key === "nuclear_medicine") {
    box(0x64748b, 0, -0.3, 0, 1.3, 2.8, 0.5, "Mô hình cơ thể bệnh nhân", 0.55);
    ball(crimson, 0.22, root, "Khối u tập trung dược chất phóng xạ").position.set(
      0,
      0.4,
      0.4
    );
    const detector = ring(0, 2.6, emerald, "Vòng đầu thu tia gamma của máy PET/CT");
    detector.rotation.y = 0;
    const a = ball(amber, 0.13, root, "Photon γ thứ nhất (0,511 MeV)"),
      b = ball(amber, 0.13, root, "Photon γ thứ hai bay ngược chiều 180°");
    line(
      [new THREE.Vector3(-2.6, 0.4, 0.4), new THREE.Vector3(2.6, 0.4, 0.4)],
      amber
    );
    updates.push((t) => {
      const u = ((t * parameters.amount) / 3.2) % 1;
      if (parameters.mode === 0) {
        a.position.set(u * 2.6, 0.4, 0.4);
        b.position.set(-u * 2.6, 0.4, 0.4);
        b.visible = true;
      } else {
        a.position.set(-2.6 + u * 2.6, 0.4, 0.4);
        b.visible = false;
      }
    });
  } else if (key === "radiation_applications") {
    box(0x475569, 0, -1, 0, 9, 0.22, 2, "Băng chuyền công nghiệp");
    box(amber, 0, 1.2, 0, 0.85, 0.95, 0.85, "Nguồn phát tia γ kiểm định / chiếu xạ");
    box(emerald, 0, -0.75, 0, 1.2, 0.16, 1.2, "Cảm biến đo cường độ tia truyền qua");
    const products = Array.from({ length: 3 }, (_, i) =>
      box(
        parameters.mode ? 0x94a3b8 : 0xf59e0b,
        i * 3 - 3,
        0,
        0,
        1.05,
        0.62,
        0.75,
        parameters.mode ? "Chi tiết kim loại có mối hàn cần kiểm tra" : "Kiện nông sản chiếu xạ"
      )
    );
    const ray = ball(blue, 0.12, root, "Chùm tia γ xuyên qua mẫu");
    updates.push((t) => {
      products.forEach(
        (p, i) =>
          (p.position.x = (((t * parameters.amount) / 2 + i * 3) % 9) - 4.5)
      );
      ray.position.set(0, 1.1 - ((t * 2.4) % 1) * 1.8, 0);
    });
  }

  const labels: Partial<
    Record<BasicActivityKey, [string, number, number, number?][]>
  > = {
    rutherford_alpha_scattering: [
      ["Nguồn phát hạt α", -5.2, 1.1],
      ["Lá kim loại & Hạt nhân bia", 0, 2.1],
      ["Màn huỳnh quang ZnS", 0, -2.2],
    ],
    nuclear_structure_builder: [
      [
        `Hạt nhân Z = ${parameters.amount}, N = ${
          parameters.mode === 1
            ? parameters.amount
            : parameters.mode === 2
            ? parameters.amount + 2
            : parameters.secondary
        }`,
        0,
        1.6,
      ],
    ],
    isotope_and_nuclear_size: [
      [
        `Đồng vị Carbon-${parameters.amount} (Z = 6, N = ${parameters.amount - 6})`,
        0,
        1.6,
      ],
    ],
    binding_energy_lab: [["Hệ nucleon liên kết hoặc tách rời", 0, 2.2]],
    nuclear_reaction_balancer: [
      ["Hạt đạn tới", -4, 1.5],
      ["Hạt nhân bia", 0.3, 2],
      ["Sản phẩm sau va chạm", 3, 1.5],
    ],
    nuclear_fusion: [
      ["Hạt nhân đơteri tới", -4, 1.5],
      ["Hạt nhân triti ở vị trí bia ban đầu", 0.3, 2],
    ],
    nuclear_fission: [["Neutron tới", -4.6, 1.2], ["Vị trí hạt nhân urani-235 ban đầu", 0, 1.2]],
    geiger_random_decay: [
      ["Nguồn phóng xạ", 0, 1.5],
      ["Ống đếm Geiger–Müller", Math.max(2, Math.min(6, parameters.secondary * 0.65)), 1.5],
    ],
    radioactive_decay_half_life: [
      ["Mẫu 64 hạt nhân N(t)", 0, 2],
      ["Đầu thu xung H(t)", 3.2, 1.7],
    ],
    carbon14_dating: [["Mẫu cổ vật chứa ¹⁴C", 0, 2]],
    nuclear_physics_practice_lab: [
      ["Mẫu phóng xạ N(t)", 0, 2],
      ["Đầu thu xung thực hành", 3.2, 1.7],
    ],
    radiation_properties: [
      ["Nguồn phát α, β, γ", -3.5, 1.8],
      ["Tấm chắn & Vùng từ trường B", -0.5, 2.3],
      ["Đầu thu bức xạ", 3.5, 1.8],
    ],
    radiation_safety: [
      ["Nguồn bức xạ", -3.5, 1.8],
      ["Tường chì che chắn", -0.5, 2.3],
      ["Vị trí nhân viên quan sát", Math.min(5.5, parameters.amount * 0.6), 1.8],
    ],
    nuclear_power_energy_flow: [
      ["Lò phản ứng (Tâm lò)", -4, 2],
      ["Bình sinh hơi", 0, 2],
      ["Turbine hơi nước", 3, 2, 0.9],
      ["Máy phát điện", 4, -1.5],
    ],
    reactor_control_concept: [
      ["Thanh hấp thụ neutron", 0, 4],
      ["Thanh nhiên liệu U-235", 0, -2],
    ],
    nuclear_medicine: [
      ["Khối u đánh dấu phóng xạ", 0, -2],
      [parameters.mode ? "Chùm tia xạ trị" : "Vòng đầu thu PET 360°", 0, 3],
    ],
    radiation_applications: [
      ["Nguồn chiếu tia γ", 0, 2.1],
      [parameters.mode ? "Mối hàn kiểm định" : "Nông sản chiếu xạ", -3, 1],
      ["Đầu thu cảm biến", 2, -1.8],
    ],
  };

  labels[key]?.forEach(([text, x, y, z]) => label(text, x, y, z));
  markers.forEach((marker) => marker.scale.setScalar(0.01));
  const bounds = new THREE.Box3().setFromObject(root);
  // Include the path endpoints and product separation in the camera fit.
  if (["nuclear_fission", "nuclear_reaction_balancer", "nuclear_fusion"].includes(key)) {
    bounds.expandByPoint(new THREE.Vector3(-5.6, -3.4, -2));
    bounds.expandByPoint(new THREE.Vector3(6.9, 3.4, 2));
  }

  return {
    root,
    legend,
    bounds,
    interactiveMeshes,
    resizeMarkers: (height: number, fov: number) => {
      const size =
        (28 / Math.max(height, 1)) * 2 * Math.tan(THREE.MathUtils.degToRad(fov / 2));
      markers.forEach((marker) => marker.scale.set(size, size, 1));
    },
    update: (t: number) => updates.forEach((fn) => fn(t)),
    dispose: () => {
      scene.remove(root);
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
    },
  };
}

export default function Simulation3D({
  activityKey,
  onObserved,
  initialAmount,
  initialMode,
  customPrompt,
}: {
  activityKey: BasicActivityKey;
  onObserved?: (done: boolean) => void;
  initialAmount?: number;
  initialMode?: number;
  customPrompt?: string;
}) {
  const config = SETTINGS[activityKey];
  const [legend, setLegend] = useState<string[]>([]);
  const fitRef = useRef<((preset: string) => void) | null>(null);

  const [amount, setAmount] = useState(initialAmount ?? config.initial);
  const [secondary, setSecondary] = useState(config.secondaryInitial ?? 5);
  const [mode, setMode] = useState(initialMode ?? 0);
  const [speed, setSpeed] = useState(1);
  const [pulseCount, setPulseCount] = useState(0);
  const [inspectedObject, setInspectedObject] = useState<string>(
    "Nhấn trực tiếp vào bất kỳ vật thể 3D nào trong mô hình để xem giải thích vật lí và kích hoạt tương tác."
  );

  const [running, setRunning] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [error, setError] = useState("");
  const [view, setView] = useState("perspective");
  const [elapsed, setElapsed] = useState(0);

  const host = useRef<HTMLDivElement>(null);
  const time = useRef(0);
  const runningRef = useRef(running);
  const viewRef = useRef(view);
  const speedRef = useRef(1);
  const observed = useRef(false);
  const callback = useRef(onObserved);

  useEffect(() => {
    callback.current = onObserved;
  }, [onObserved]);

  useEffect(() => {
    runningRef.current = running;
    speedRef.current = speed;
  }, [running, speed]);

  useEffect(() => {
    viewRef.current = view;
    fitRef.current?.(view);
  }, [view]);

  useEffect(() => {
    if (!host.current) return;
    const element = host.current;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      const failureFrame = requestAnimationFrame(() =>
        setError(
          "Thiết bị chưa mở được WebGL 3D. Em vẫn có thể dùng bảng thao tác và câu hỏi bên dưới."
        )
      );
      return () => cancelAnimationFrame(failureFrame);
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x0b1120);
    element.appendChild(renderer.domElement);
    renderer.domElement.setAttribute(
      "aria-label",
      "Không gian thí nghiệm 3D trực quan. Nhấn trực tiếp vào vật thể 3D để tương tác, kéo để xoay 360°, cuộn để phóng to."
    );
    renderer.domElement.setAttribute("role", "img");

    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x334155, 2.6));
    const light = new THREE.DirectionalLight(0xffffff, 3.2);
    light.position.set(6, 9, 7);
    scene.add(light);

    const grid = new THREE.GridHelper(18, 18, 0x334155, 0x1e293b);
    grid.position.y = -2.6;
    scene.add(grid);

    const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 100);
    const positions: Record<string, [number, number, number]> = {
      perspective: [8, 5.5, 10],
      front: [0, 0, 13],
      top: [0, 13, 0.01],
      side: [13, 0, 0],
    };
    camera.position.set(...positions[viewRef.current]);

    const controls = new OrbitControls(camera, renderer.domElement);
    renderer.domElement.style.touchAction = "pan-y";
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.dampingFactor = 0.08;
    controls.minDistance = 3.5;
    controls.maxDistance = 28;

    const experiment = makeExperiment(scene, activityKey, {
      amount,
      secondary,
      speed,
      mode,
      pulseCount,
    });

    // Raycaster for direct 3D object click inspection & tactile pulse
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const targets = experiment.interactiveMeshes.map((item) => item.mesh);
      const hits = raycaster.intersectObjects(targets, true).filter(({ object }) => {
        for (let mesh: THREE.Object3D | null = object; mesh; mesh = mesh.parent) {
          if (!mesh.visible) return false;
        }
        return true;
      });
      if (hits.length > 0) {
        const hitObj = hits[0].object;
        const found = experiment.interactiveMeshes.find(
          (item) => item.mesh === hitObj || item.mesh === hitObj.parent
        );
        if (found) {
          setInspectedObject(`Đang chọn 3D: ${found.info}`);
          if (!observed.current) {
            observed.current = true;
            callback.current?.(true);
          }
        }
      }
    };

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);

    const fit = (preset: string) => {
      const center = experiment.bounds.getCenter(new THREE.Vector3());
      const radius = Math.max(
        experiment.bounds.getSize(new THREE.Vector3()).length() / 2,
        2.2
      );
      const vertical = THREE.MathUtils.degToRad(camera.fov / 2);
      const horizontal = Math.atan(Math.tan(vertical) * camera.aspect);
      const distance =
        (radius / Math.sin(Math.min(vertical, horizontal))) * 1.18;
      controls.target.copy(center);
      camera.position
        .copy(center)
        .addScaledVector(
          new THREE.Vector3(...(positions[preset] ?? positions.perspective)).normalize(),
          distance
        );
      camera.far = Math.max(100, distance + radius * 4);
      controls.maxDistance = Math.max(28, distance * 2);
      camera.updateProjectionMatrix();
      controls.update();
    };
    fitRef.current = fit;

    const legendFrame = requestAnimationFrame(() =>
      setLegend(experiment.legend)
    );

    const resize = () => {
      const w = element.clientWidth;
      const h = element.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      experiment.resizeMarkers(h, camera.fov);
      fit(viewRef.current);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();

    let frame = 0;
    let last = performance.now();
    let lastText = 0;
    let visible = false;
    let contextLost = false;

    const render = (now: number) => {
      if (!visible || document.hidden || contextLost) return;
      const dt = Math.max(0, Math.min((now - last) / 1000, 0.1));
      last = now;
      if (runningRef.current) {
        time.current += dt * speedRef.current;
        if (
          [
            "radioactive_decay_half_life",
            "nuclear_physics_practice_lab",
          ].includes(activityKey) &&
          time.current >= 4 * amount
        ) {
          time.current = 4 * amount;
          runningRef.current = false;
          setRunning(false);
        }
        if (time.current >= 1.5 && !observed.current) {
          observed.current = true;
          callback.current?.(true);
        }
      }
      experiment.update(time.current);
      controls.update();
      renderer.render(scene, camera);
      if (now - lastText > 220) {
        setElapsed(time.current);
        lastText = now;
      }
      frame = requestAnimationFrame(render);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      if (visible && !document.hidden && !contextLost) {
        last = performance.now();
        frame = requestAnimationFrame(render);
      }
    };
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    visibility.observe(element);
    document.addEventListener("visibilitychange", sync);

    const lost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      setRunning(false);
      setError(
        "Không gian 3D đã mất kết nối đồ họa. Hãy tải lại thí nghiệm."
      );
    };
    renderer.domElement.addEventListener("webglcontextlost", lost);

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(legendFrame);
      fitRef.current = null;
      observer.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", sync);
      controls.dispose();
      experiment.dispose();
      grid.geometry.dispose();
      (grid.material as THREE.Material).dispose();
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [activityKey, amount, secondary, mode, speed, pulseCount]);

  function triggerActionPulse() {
    time.current = 0;
    setElapsed(0);
    setRunning(true);
    setPulseCount((c) => c + 1);
    if (!observed.current) {
      observed.current = true;
      callback.current?.(true);
    }
  }

  const currentParams: Parameters = {
    amount,
    secondary,
    speed,
    mode,
    pulseCount,
  };
  const liveLatex = config.buildLatex(currentParams, elapsed);
  const liveMetrics = config.buildMetrics(currentParams, elapsed);

  return (
    <div className={`simulation-shell ${styles.shell}`}>
      {/* Top Header: Title + Camera Presets + Action Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "14px",
        }}
      >
        <div>
          <span
            style={{
              display: "inline-block",
              fontSize: "12px",
              fontWeight: 600,
              color: "#475569",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              padding: "3px 10px",
              borderRadius: "6px",
              marginBottom: "6px",
            }}
          >
            Phòng thí nghiệm 3D trực quan · Tương tác trực tiếp trên vật thể
          </span>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
            {config.title}
          </h3>
          {customPrompt && (
            <div
              style={{
                margin: "8px 0 0",
                fontSize: "13.5px",
                color: "#0f172a",
                background: "#f8fafc",
                padding: "8px 12px",
                borderRadius: "6px",
                borderLeft: "3px solid #0f172a",
              }}
            >
              <strong style={{ display: "block", marginBottom: "4px" }}>Nhiệm vụ giáo viên giao:</strong>
              <RichPhysicsText content={customPrompt} compact />
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {(
            [
              ["perspective", "Góc 3D"],
              ["front", "Mặt trước"],
              ["top", "Từ trên"],
              ["side", "Mặt bên"],
            ] as const
          ).map(([id, text]) => (
            <button
              key={id}
              type="button"
              className="btn small"
              onClick={() => setView(id)}
              style={{
                background: view === id ? "#0f172a" : "#ffffff",
                color: view === id ? "#ffffff" : "#0f172a",
                border: "1px solid #cbd5e1",
                fontSize: "12.5px",
              }}
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      <div ref={host} className={`simulation-canvas ${styles.canvas}`} />
      <p className={styles.inspection} role="status">{inspectedObject}</p>

      {error && (
        <p className="physics-note" role="status" style={{ marginTop: "10px" }}>
          {error}
        </p>
      )}

      <div className={styles.metrics}>
        {liveMetrics.map((m) => (
          <div
            key={m.label}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>
              {m.label}
            </div>
            <div style={{ fontSize: "14.5px", color: "#0f172a", fontWeight: 700, marginTop: "2px" }}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.formula}>
        <div>
          <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600 }}>Hệ thức trong mô hình</div>
          {liveLatex.split(/\\qquad\s*/).map((line, index) => (
            <LatexMath key={index} math={line} block />
          ))}
        </div>
        <div className={styles.formulaActions}>
          <button
            type="button"
            className="btn small"
            onClick={triggerActionPulse}
            style={{
              background: "#0f172a",
              color: "#ffffff",
              border: "none",
              fontWeight: 600,
            }}
          >
            {config.actionButtonLabel}
          </button>
          <button
            type="button"
            className="btn small"
            onClick={() => setRunning((r) => !r)}
            style={{
              background: "#ffffff",
              color: "#0f172a",
              border: "1px solid #cbd5e1",
            }}
          >
            {running ? "Tạm dừng" : "Tiếp tục"}
          </button>
        </div>
      </div>

      <div className={styles.controls}>
        <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontWeight: 600 }}>
          <span>
            {config.label}: <strong>{amount}</strong> {config.unit ?? ""}
          </span>
          <input
            type="range"
            min={config.min}
            max={config.max}
            step={config.step ?? 1}
            value={amount}
            onChange={(e) => {
              time.current = 0;
              setElapsed(0);
              setRunning(true);
              setAmount(Number(e.target.value));
            }}
            style={{ accentColor: "#0f172a" }}
          />
        </label>

        {config.secondaryLabel && (
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontWeight: 600 }}>
            <span>
              {config.secondaryLabel}: <strong>{secondary}</strong> {config.secondaryUnit ?? ""}
            </span>
            <input
              type="range"
              min={config.secondaryMin ?? 1}
              max={config.secondaryMax ?? 10}
              step={config.secondaryStep ?? 1}
              value={secondary}
              onChange={(e) => {
                setSecondary(Number(e.target.value));
              }}
              style={{ accentColor: "#0f172a" }}
            />
          </label>
        )}

        {config.modes && (
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontWeight: 600 }}>
            <span>Chế độ khảo sát 3D</span>
            <select
              value={mode}
              onChange={(e) => {
                time.current = 0;
                setElapsed(0);
                setRunning(true);
                setMode(Number(e.target.value));
              }}
              style={{
                padding: "7px 10px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#0f172a",
                fontWeight: 500,
              }}
            >
              {config.modes.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>
          </label>
        )}

        <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontWeight: 600 }}>
          <span>Tốc độ thời gian ({speed}×)</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{
              padding: "7px 10px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#0f172a",
              fontWeight: 500,
            }}
          >
            <option value={0.5}>Chậm 0,5×</option>
            <option value={1}>Chuẩn 1×</option>
            <option value={2}>Nhanh 2×</option>
          </select>
        </label>
      </div>

      {/* Numbered 3D Markers Legend */}
      {legend.length > 0 && (
        <ol
          className="simulation-legend"
          aria-label="Chú thích các thành phần đánh số trong mô hình 3D"
          style={{ marginTop: "12px", marginBottom: "6px" }}
        >
          {legend.map((item, i) => (
            <li key={item}>
              <span>{i + 1}</span>
              {item}
            </li>
          ))}
        </ol>
      )}
      <p className="physics-note" style={{ margin: "6px 0 0" }}>
        {config.caption}
      </p>
    </div>
  );
}
