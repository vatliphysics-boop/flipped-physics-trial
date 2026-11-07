import { FixedPhysicsActivityRenderer } from "@/components/physics/FixedPhysicsActivityRenderer";

export function HalfLifeDiscovery() {
  return <section className="student-paper half-life-discovery" style={{ marginBottom: 48 }} aria-label="Khám phá bán rã trước giờ học">
    <p className="student-kicker">B23 · Chuẩn bị trước giờ học</p>
    <h2>Dự đoán và khám phá chu kì bán rã</h2>
    <ol>
      <li>Trước khi thao tác, ghi dự đoán: với cùng N₀, khi T tăng từ 30 s lên 60 s, số hạt còn lại tại t = 30 s tăng hay giảm?</li>
      <li>Giữ N₀ = 1.000, so sánh hai giá trị T. Ghi số hạt tại t = T, 2T và 3T rồi đối chiếu với dự đoán.</li>
      <li>Giữ T cố định, tăng N₀ gấp đôi. Tỉ lệ N(t)/N₀ tại cùng thời điểm có thay đổi không? Ghi lời giải thích và một câu hỏi mang đến lớp.</li>
    </ol>
    <p>Số liệu được tính theo mô hình hàm mũ, không phải số đếm từ nguồn phóng xạ thật. Ghi kết quả vào phiếu; nếu giáo viên giao mô phỏng trong tiến trình, nộp kết quả ở bước học tương ứng.</p>
    <FixedPhysicsActivityRenderer activityKey="radioactive_decay_half_life" />
  </section>;
}
