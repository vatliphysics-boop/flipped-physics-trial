"use client";

import { useState } from "react";
import styles from "./RadiationTypesExplorer.module.css";

type RayKey = "alpha" | "betaMinus" | "betaPlus" | "gamma";

interface RaySpec {
  key: RayKey;
  label: string;
  symbol: string;
  nature: string;
  charge: string;
  equation: string;
  equationNote: string;
  ionization: string;
  penetration: string;
  deflection: "negative" | "positive" | "none";
  deflectionLabel: string;
  color: string;
}

const RAYS: RaySpec[] = [
  {
    key: "alpha",
    label: "Tia alpha",
    symbol: "α",
    nature: "Hạt nhân heli ⁴₂He (2 proton + 2 neutron)",
    charge: "+2e",
    equation: "²³⁸₉₂U → ²³⁴₉₀Th + ⁴₂He",
    equationNote: "A giảm 4, Z giảm 2. Hạt nhân mẹ biến đổi thành hạt nhân con có số khối nhỏ hơn.",
    ionization: "Mạnh nhất (điện tích lớn, khối lượng lớn)",
    penetration: "Yếu nhất — vài cm trong không khí, bị tờ giấy chặn",
    deflection: "negative",
    deflectionLabel: "Lệch về bản âm (hạt mang điện dương)",
    color: "#c2410c",
  },
  {
    key: "betaMinus",
    label: "Tia beta trừ",
    symbol: "β⁻",
    nature: "Electron ⁰₋₁e và phản neutrino electron ν̄ₑ",
    charge: "−1e",
    equation: "¹⁴₆C → ¹⁴₇N + ⁰₋₁e + ν̄ₑ",
    equationNote: "A không đổi, Z tăng 1. Phản neutrino xuất hiện để bảo toàn năng lượng và động lượng.",
    ionization: "Trung bình",
    penetration: "Trung bình — vài mm nhôm",
    deflection: "positive",
    deflectionLabel: "Lệch về bản dương (hạt mang điện âm)",
    color: "#1d4ed8",
  },
  {
    key: "betaPlus",
    label: "Tia beta cộng",
    symbol: "β⁺",
    nature: "Positron ⁰₊₁e và neutrino electron νₑ",
    charge: "+1e",
    equation: "²²₁₁Na → ²²₁₀Ne + ⁰₊₁e + νₑ",
    equationNote: "A không đổi, Z giảm 1. Positron là phản hạt của electron.",
    ionization: "Trung bình",
    penetration: "Trung bình — vài mm nhôm",
    deflection: "negative",
    deflectionLabel: "Lệch về bản âm (hạt mang điện dương)",
    color: "#7c3aed",
  },
  {
    key: "gamma",
    label: "Tia gamma",
    symbol: "γ",
    nature: "Photon năng lượng cao (bức xạ điện từ)",
    charge: "0",
    equation: "⁶⁰₂₇Co* → ⁶⁰₂₇Co + γ",
    equationNote: "Hạt nhân chuyển từ trạng thái kích thích (*) xuống mức năng lượng thấp hơn. A và Z không đổi.",
    ionization: "Yếu nhất",
    penetration: "Mạnh nhất — cần lớp chì dày hàng cm",
    deflection: "none",
    deflectionLabel: "Không lệch (trung hòa điện)",
    color: "#15803d",
  },
];

export function RadiationTypesExplorer() {
  const [active, setActive] = useState<RayKey>("alpha");
  const [compared, setCompared] = useState(false);
  const ray = RAYS.find((r) => r.key === active)!;

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabs} role="tablist" aria-label="Chọn loại tia phóng xạ">
        {RAYS.map((r) => (
          <button
            key={r.key}
            type="button"
            role="tab"
            aria-selected={r.key === active}
            className={styles.tab}
            data-active={r.key === active}
            onClick={() => setActive(r.key)}
          >
            <span className={styles.tabSymbol} style={{ color: r.color }}>{r.symbol}</span>
            <span>{r.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.panel} role="tabpanel">
        <div className={styles.visual}>
          <svg viewBox="0 0 420 240" className={styles.svg} aria-label={`Minh họa ${ray.label} lệch trong điện trường`}>
            <rect x="20" y="18" width="380" height="7" fill="#1d4ed8" rx="2" />
            <text x="210" y="12" textAnchor="middle" fontSize="11" fill="#1d4ed8">Bản âm (−)</text>
            <rect x="20" y="215" width="380" height="7" fill="#b91c1c" rx="2" />
            <text x="210" y="238" textAnchor="middle" fontSize="11" fill="#b91c1c">Bản dương (+)</text>

            <circle cx="60" cy="120" r="11" fill="#334155" />
            <text x="60" y="152" textAnchor="middle" fontSize="11" fill="#475569">Nguồn</text>

            {(() => {
              const endY = ray.deflection === "negative" ? 52 : ray.deflection === "positive" ? 188 : 120;
              const midY = ray.deflection === "none" ? 120 : 120 + (endY - 120) * 0.18;
              const path = `M 72 120 C 160 ${midY}, 290 ${endY - (endY - 120) * 0.25}, 385 ${endY}`;
              return (
                <>
                  <path d={path} stroke={ray.color} strokeWidth="2.5" fill="none" strokeDasharray="6 5" opacity="0.45" />
                  <circle r="7" fill={ray.color}>
                    <animateMotion dur="3.2s" repeatCount="indefinite" path={path} rotate="auto" />
                  </circle>
                  <text x="385" y={endY - 16} textAnchor="end" fontSize="13" fontWeight="700" fill={ray.color}>
                    {ray.symbol}
                  </text>
                </>
              );
            })()}
          </svg>
        </div>

        <div className={styles.details}>
          <h3 className={styles.symbolTitle} style={{ color: ray.color }}>{ray.symbol}</h3>
          <dl className={styles.facts}>
            <div><dt>Bản chất</dt><dd>{ray.nature}</dd></div>
            <div><dt>Điện tích</dt><dd>{ray.charge}</dd></div>
            <div><dt>Khả năng ion hóa</dt><dd>{ray.ionization}</dd></div>
            <div><dt>Khả năng đâm xuyên</dt><dd>{ray.penetration}</dd></div>
            <div><dt>Trong điện trường</dt><dd>{ray.deflectionLabel}</dd></div>
          </dl>
        </div>
      </div>

      <div className={styles.equation}>
        <p className={styles.equationLabel}>Phương trình phân rã</p>
        <p className={styles.equationBody}>{ray.equation}</p>
        <p className={styles.equationNote}>{ray.equationNote}</p>
      </div>

      <button
        type="button"
        className={styles.compareButton}
        onClick={() => setCompared((v) => !v)}
        aria-expanded={compared}
      >
        {compared ? "Ẩn bảng so sánh" : "So sánh bốn loại tia"}
      </button>

      {compared && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption>So sánh tính chất các tia phóng xạ — đối chiếu Hình 23.3 và 23.4 SGK</caption>
            <thead>
              <tr>
                <th scope="col">Tính chất</th>
                {RAYS.map((r) => (
                  <th key={r.key} scope="col" style={{ color: r.color }}>{r.symbol}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr><th scope="row">Bản chất</th>{RAYS.map((r) => <td key={r.key}>{r.nature}</td>)}</tr>
              <tr><th scope="row">Điện tích</th>{RAYS.map((r) => <td key={r.key}>{r.charge}</td>)}</tr>
              <tr><th scope="row">Ion hóa</th>{RAYS.map((r) => <td key={r.key}>{r.ionization}</td>)}</tr>
              <tr><th scope="row">Đâm xuyên</th>{RAYS.map((r) => <td key={r.key}>{r.penetration}</td>)}</tr>
              <tr><th scope="row">Lệch điện trường</th>{RAYS.map((r) => <td key={r.key}>{r.deflectionLabel}</td>)}</tr>
            </tbody>
          </table>
          <p className={styles.tableNote}>
            Mô hình minh họa định tính. Độ lệch thực tế phụ thuộc động năng hạt, cường độ trường và môi trường.
          </p>
        </div>
      )}
    </div>
  );
}
