"use client";


import { useState } from 'react';
import { ChoiceCheck, Lab, Metrics, NuclearSymbol, Nucleus, Range, Sources } from './shared';

type AlphaPath = { b: number; angle: number };
const scatter = (b: number): AlphaPath => ({ b, angle: 2 * Math.atan2(1, Math.abs(b)) * (b < 0 ? -1 : 1) });

export function RutherfordActivity() {
  const [impact, setImpact] = useState(30);
  const [sampleSize, setSampleSize] = useState(100);
  const [paths, setPaths] = useState<AlphaPath[]>([]);
  const [totals, setTotals] = useState([0, 0, 0]);
  function fire(many: boolean) {
    const next = Array.from({ length: many ? sampleSize : 1 }, () => scatter(many ? (Math.random() * 200 - 100) : impact));
    const counts = [...totals];
    for (const path of next) counts[Math.abs(path.angle) < Math.PI / 18 ? 0 : Math.abs(path.angle) < Math.PI / 2 ? 1 : 2] += 1;
    setPaths(next); setTotals(counts);
  }
  return <Lab intro="Bắn hạt α qua lá kim loại mỏng. Thử một quỹ đạo gần tâm rồi tăng số hạt để so sánh các góc lệch." note="Mô hình định tính: hạt nhân được phóng đại; góc, kích thước và tỉ lệ số hạt không phải số liệu đo của thí nghiệm Rutherford. Chùm nhiều hạt lấy vị trí tới ngẫu nhiên; mẫu nhỏ có thể chưa xuất hiện tán xạ ngược.">
    <div className="physics-controls"><Range label="Độ lệch quỹ đạo tới so với tâm" value={impact} min={-100} max={100} onChange={setImpact} unit="(tương đối)" /><Range label="Số hạt mỗi chùm" value={sampleSize} min={50} max={500} step={50} onChange={setSampleSize} /></div>
    <div className="physics-actions"><button type="button" className="physics-button primary" onClick={() => fire(false)}>Bắn một hạt α</button><button type="button" className="physics-button" onClick={() => fire(true)}>Bắn chùm {sampleSize} hạt</button><button type="button" className="physics-button" onClick={() => { setPaths([]); setTotals([0, 0, 0]); }}>Đặt lại phép đếm</button></div>
    <svg viewBox="0 0 530 350" className="physics-svg" role="img" aria-label={`Lá kim loại và ${paths.length} đường đi alpha. Tổng đã bắn ${totals.reduce((s, n) => s + n, 0)} hạt.`}><title>Tán xạ alpha quanh hạt nhân dương</title><circle cx="278" cy="170" r="144" fill="none" stroke="#adc0d8" strokeDasharray="5 6" /><rect x="273" y="65" width="10" height="210" fill="#edcc75" opacity=".5" /><rect x="20" y="103" width="34" height="135" rx="8" fill="#23416d" /><text x="20" y="88">Nguồn α</text><text x="278" y="36" textAnchor="middle">Vùng ghi nhận</text><text x="278" y="331" textAnchor="middle">Lá kim loại mỏng</text>{paths.map((path, i) => { const yy = 170 + path.b * 0.65; const endX = 278 + 142 * Math.cos(path.angle); const endY = yy + 120 * Math.sin(path.angle); return <path key={i} d={`M54 ${yy} L230 ${yy} Q278 ${yy} ${endX} ${endY}`} fill="none" stroke={Math.abs(path.angle) >= Math.PI / 2 ? '#b84040' : '#2357a5'} opacity={paths.length > 1 ? .25 : 1} strokeWidth={paths.length > 1 ? 1.5 : 3} />; })}<circle cx="278" cy="170" r="9" fill="#b84040" /><text x="293" y="163" fill="#9a3030">+</text></svg>
    <Metrics items={[{ label: 'Gần thẳng (góc < 10°)', value: totals[0] }, { label: 'Lệch 10° đến dưới 90°', value: totals[1] }, { label: 'Lệch lớn / ngược ≥ 90°', value: totals[2] }]} />
    <ChoiceCheck question="Vì sao đa số hạt đi gần thẳng nhưng một số rất ít bật ngược?" options={['Điện tích dương phân bố đều khắp nguyên tử.', 'Nguyên tử phần lớn rỗng; điện tích dương và phần lớn khối lượng tập trung ở hạt nhân rất nhỏ.', 'Hạt α không mang điện.']} correctIndex={1} explanation="Đa số quỹ đạo ở xa hạt nhân nên lệch ít. Hạt α mang điện dương tiến gần hạt nhân dương chịu lực đẩy mạnh; kết quả phù hợp mô hình hạt nhân nhỏ, đậm đặc." />
    <Sources links={[{ label: 'CERN — Di sản thí nghiệm Rutherford', url: 'https://repository.cern/records/s55ms-hwm20' }]} />
  </Lab>;
}

const elements = ['—', 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca'];

export function NuclearBuilderActivity() {
  const [z, setZ] = useState(6);
  const [n, setN] = useState(6);
  return <Lab intro="Thay đổi số proton và neutron để tạo một cấu hình hạt nhân, rồi đọc kí hiệu tương ứng." note="Đây là bộ dựng thành phần: một cấu hình Z, N bất kì không nhất thiết tồn tại hoặc bền trong tự nhiên. Hình biểu diễn các nucleon, không phải các quỹ đạo.">
    <div className="physics-controls"><Range label="Số proton Z" value={z} min={1} max={20} onChange={setZ} /><Range label="Số neutron N" value={n} min={0} max={30} onChange={setN} /></div>
    <div className="physics-split"><Nucleus z={z} n={n} /><div className="physics-formula"><NuclearSymbol a={z + n} z={z} symbol={elements[z]} /><p>A = Z + N = {z} + {n} = {z + n}</p><p>Điện tích hạt nhân: +{z}e</p></div></div>
    <Metrics items={[{ label: 'Proton Z', value: z }, { label: 'Neutron N', value: n }, { label: 'Nucleon A', value: z + n }]} />
    <ChoiceCheck question="Nếu giữ Z và thêm một neutron, đại lượng nào thay đổi?" options={['Số khối A tăng 1, nguyên tố giữ nguyên.', 'Điện tích hạt nhân tăng thêm e.', 'Nguyên tố đổi vì Z tăng.']} correctIndex={0} explanation="Nguyên tố được xác định bởi Z. Thêm neutron chỉ làm N và A tăng 1; điện tích hạt nhân vẫn là +Ze." />
  </Lab>;
}

export function IsotopeActivity() {
  const [family, setFamily] = useState('carbon');
  const [mass, setMass] = useState(12);
  const isotopes = family === 'carbon' ? [12, 13, 14] : [1, 2, 3];
  const z = family === 'carbon' ? 6 : 1;
  const symbol = family === 'carbon' ? 'C' : 'H';
  const radius = 1.2 * Math.cbrt(mass);
  return <Lab intro="Đối chiếu các đồng vị: cùng Z, khác N. Kéo số khối để khảo sát quy luật bán kính hạt nhân.">
    <label className="physics-field"><span>Nhóm đồng vị</span><select value={family} onChange={(e) => setFamily(e.target.value)}><option value="carbon">Carbon: ¹²C, ¹³C, ¹⁴C</option><option value="hydrogen">Hydrogen: ¹H, ²H, ³H</option></select></label>
    <div className="physics-isotopes">{isotopes.map((a) => <div key={a}><NuclearSymbol a={a} z={z} symbol={symbol} /><p>Z = {z} · N = {a - z}</p></div>)}</div>
    <Range label="Số khối A trong mô hình bán kính" value={mass} min={1} max={240} onChange={setMass} />
    <svg className="physics-svg" viewBox="0 0 530 220" role="img" aria-label={`Bán kính tính theo A mũ một phần ba: A ${mass} có R xấp xỉ ${radius.toFixed(2)} femtomet.`}><title>So sánh bán kính theo cùng một tỉ lệ</title><circle cx="125" cy="100" r={Math.cbrt(12) * 12} fill="#c6d7f6" stroke="#2357a5" /><circle cx="377" cy="100" r={Math.cbrt(mass) * 12} fill="#2357a5" /><text x="125" y="194" textAnchor="middle">Mốc: A = 12</text><text x="377" y="194" textAnchor="middle">A = {mass}</text></svg>
    <div className="physics-formula">R ≈ r₀A<sup>1/3</sup> ≈ {radius.toFixed(2)} fm <small>r₀ ≈ 1,2 fm; 1 fm = 10⁻¹⁵ m. Quy luật gần đúng, đặc biệt thô với hạt nhân rất nhẹ.</small></div>
    <ChoiceCheck question="Khi số khối tăng 8 lần, bán kính gần đúng tăng mấy lần?" options={['8 lần', '4 lần', '2 lần']} correctIndex={2} explanation="R tỉ lệ với căn bậc ba của A, nên R mới / R cũ = ∛8 = 2. Thể tích gần tỉ lệ với A, còn bán kính không tăng tuyến tính." />
  </Lab>;
}
