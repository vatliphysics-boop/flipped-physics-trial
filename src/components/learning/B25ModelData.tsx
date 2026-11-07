import { SGK_TABLE_25_1 } from "@/lib/sgk-b25-decay";
import { LatexMath } from "./LatexMath";

export function B25ModelData() {
  return (
    <div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBlock: 16 }}>
        <caption style={{ textAlign: "left", marginBottom: 12 }}>Bảng 25.1, SGK trang 121</caption>
        <thead><tr><th scope="col" style={{ textAlign: "left", padding: 8 }}>Thời gian (s)</th><th scope="col" style={{ textAlign: "left", padding: 8 }}>Hoạt độ (Bq)</th></tr></thead>
        <tbody>{SGK_TABLE_25_1.map(({ t, h }) => (
          <tr key={t}><th scope="row" style={{ textAlign: "left", padding: 8, borderTop: "1px solid var(--border-light)" }}>{t}</th><td style={{ padding: 8, borderTop: "1px solid var(--border-light)" }}>{h}</td></tr>
        ))}</tbody>
      </table>
      <LatexMath block math={String.raw`H(T)=\frac{H_0}{2}=75{,}5\,\mathrm{Bq}`} />
      <p>Tại 30 giây, hoạt độ còn trên 75,5 Bq. Tại 60 giây, hoạt độ đã dưới mức này. Nội suy thẳng giữa hai điểm cho khoảng 39,5 giây.</p>
      <LatexMath block math={String.raw`H(t)=H_0\,2^{-\frac{t}{T}}`} />
      <LatexMath block math={String.raw`\lambda=\frac{\ln 2}{T}`} />
      <LatexMath block math={String.raw`H(t)=\lambda N(t)`} />
      <p>Thời gian và chu kì bán rã dùng cùng đơn vị. Nếu chu kì tính bằng giây, hằng số phóng xạ có đơn vị nghịch đảo giây và hoạt độ có đơn vị becquerel. Công thức mô tả giá trị kì vọng của mô hình phân rã.</p>
    </div>
  );
}
