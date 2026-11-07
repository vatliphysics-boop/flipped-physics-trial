"use client";
import Link from "next/link";
import { useState } from "react";
import { FLIPPED_FORMS, FLIPPED_ROLE_GUIDES, FLIPPED_SOURCE, HD_LEARNING_TYPES, OTHER_FLIPPED_FORMS, type FlippedFormId } from "@/lib/flipped-classroom";
import { PHASE_NAMES, PLAN_PHASES } from "@/lib/teaching-plan";
export function FlippedClassroomGuide() {
  const [selected, setSelected] = useState<FlippedFormId>("standard");
  const [code, setCode] = useState("B23");
  const form = FLIPPED_FORMS.find(f => f.id === selected)!;
  return <div className="flipped-guide">
    <p>Chọn một cách tổ chức phù hợp mục tiêu bài học và điều kiện lớp. Cả bốn cách dưới đây có mẫu kế hoạch và học liệu; giáo viên chỉnh nhiệm vụ, thời lượng và tiêu chí trước khi giao.</p>
    <div className="flipped-form-options" role="group" aria-label="Các hình thức lớp học đảo ngược">{FLIPPED_FORMS.map(f => <button key={f.id} aria-pressed={selected === f.id} onClick={() => { setSelected(f.id); setCode(f.example); }}><strong>{f.title}</strong><span>{f.description}</span><small>Có mẫu và học liệu · Ví dụ {f.example}</small></button>)}</div>
    <section className="flipped-selected"><h2>{form.title}</h2><label>Bài dùng cho kế hoạch<select value={code} onChange={e => setCode(e.target.value)}>{["B21", "B22", "B23", "B24", "B25"].map(c => <option key={c}>{c}</option>)}</select></label><div className="planning-actions"><Link className="btn primary" href={`/hoc-lieu/soan-ke-hoach?template=${code}&form=${selected}`}>Soạn kế hoạch {code} theo hình thức này</Link><Link className="btn" href={`/hoc-lieu?bai=${code}`}>Mở học liệu {code}</Link></div>
      <h3>Việc của giáo viên và học sinh</h3>{PLAN_PHASES.map(phase => { const row = FLIPPED_ROLE_GUIDES[selected][phase]; return <article key={phase}><h3>{PHASE_NAMES[phase]}</h3><div className="role-pair"><div><h4>Giáo viên</h4><p>{row.teacher}</p></div><div><h4>Học sinh</h4><p>{row.student}</p></div></div><p><strong>Sản phẩm cần có:</strong> {row.evidence}</p></article>; })}
      <p className="physics-note">Kho mở và bản xem trước dùng để chuẩn bị, tự luyện. Bài giao chính thức, bài nộp và kết quả của lớp nằm trong tài khoản giáo viên/học sinh. Luồng này cần được kiểm tra với dữ liệu và tài khoản thật trước khi dùng cho nghiên cứu.</p>
    </section>
    <details className="flipped-other"><summary>Hai hình thức tham khảo chưa triển khai đầy đủ</summary>{OTHER_FLIPPED_FORMS.map(f => <div key={f.title}><h3>{f.title}</h3><p>{f.description}</p><p>{f.status}</p></div>)}</details>
    <section><h2>Các loại học liệu và hoạt động học tập</h2><p>Hình thức tổ chức lớp học và loại học liệu là hai phần khác nhau. Video, mô phỏng, phiếu, thảo luận và trò chơi có thể phối hợp trong cùng một hình thức.</p><div className="hd-learning-types">{HD_LEARNING_TYPES.map((item, i) => <article key={item.title}><span className="visual-eyebrow">{item.phase}</span><h3>{i + 1}. {item.title}</h3><div className="role-pair"><div><h4>Giáo viên</h4><p>{item.teacher}</p></div><div><h4>Học sinh</h4><p>{item.student}</p></div></div><p><strong>Hiện có:</strong> {item.status}</p><Link className="btn small" href={`/hoc-lieu?bai=${item.code}&resource=${item.resource}#resource-${item.resource}`}>Mở học liệu này</Link></article>)}</div></section>
    <details className="visual-sources"><summary>Căn cứ thiết kế</summary><p>Học liệu được tổ chức theo ba giai đoạn trước, trong và sau giờ học. Mỗi hoạt động có mục tiêu, nhiệm vụ, sản phẩm và tiêu chí nhận xét; học sinh ghi kết quả và điều cần điều chỉnh.</p><p>Danh sách hình thức tham khảo từ <a href={FLIPPED_SOURCE} target="_blank" rel="noreferrer">University of Texas at El Paso: Flipped Classroom Models ↗</a>. Đây là một cách phân loại để tham khảo; không phải danh sách bắt buộc của Bộ GDĐT. Lựa chọn bốn hình thức là quyết định thiết kế của dự án.</p></details>
  </div>;
}
