import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Seed B25 catalog – "Bài 25. Bài tập về vật lí hạt nhân"
 * SGK Vật lí 12 KNTT, trang 119–122.
 *
 * SGK evidence verified (rendered from scanned PDF):
 *  - Trang 119: Hình 25.1 – Thí nghiệm tĩnh điện kế (nguồn phóng xạ (1), đầu thu (2), kim (3)).
 *    Bài ví dụ 1: Kim tĩnh điện kế giảm nhanh khi đưa mẫu phóng xạ lại gần.
 *    Bài ví dụ 2: Phương trình phân hạch ²³⁵U + n → ¹⁴⁰Ce + ⁹⁴Zr + x·n + y·e⁻
 *    → Bảo toàn A, Z: x = 2, y = 6.
 *  - Trang 120: Hình 25.2 – Máy xạ trị trong bệnh viện.
 *    Bài ví dụ 3: Máy xạ trị ⁶⁰Co (T = 5,3 năm). Bảo dưỡng khi H giảm 7%; thay nguồn khi H giảm 50%.
 *    t_bd = T·log₂(100/93) ≈ 6,65 tháng; t_th = T = 5,3 năm.
 *  - Trang 121: Bảng 25.1 – Độ phóng xạ H(Bq) theo thời gian t(s):
 *    t = 0: 151; t=30: 85; t=60: 55; t=120: 31; t=180: 22; t=240: 15; t=300: 11; t=360: 9.
 *    Bài 1: Lực nào làm lệch hạt alpha trong lá vàng? → Lực đẩy tĩnh điện từ hạt nhân vàng.
 *    Bài 2: Vẽ đồ thị H(t), ước lượng chu kì bán rã.
 *    Bài 3: Mẫu gỗ cổ: 240 phân rã/phút, T(¹⁴C) = 5730 năm, 25 g carbon gồm ¹²C và ¹⁴C.
 *    Tỉ lệ số nguyên tử ¹²C : ¹⁴C khi sinh vật còn sống là 10¹² : 1.
 *    Bài 4: Nhà máy 1400 MW, hiệu suất 36%, mỗi phân hạch 200 MeV.
 *  - Trang 122: Hình 25.3 – Khu nạp nguyên liệu Trung tâm chiếu xạ Hà Nội.
 *    Hình 25.4 – Máy gia tốc tại Trung tâm chiếu xạ Hà Nội.
 *    Bài 5: Thời gian chờ chiếu xạ: ⁶⁰Co (T=5,3 năm); tháng 1/2022: 150 phút; tính thời gian tháng 6/2024.
 *    Bài 6: FDG/PET: ¹⁸F (T=110 phút); Hai bệnh nhân cùng cân nặng, tiêm cách nhau 60 phút;
 *    liều cần 0,1 mCi/kg không đổi. Ai cần FDG nhiều hơn?
 */
export async function seedB25Catalog(
  supabase: SupabaseClient,
  lessonId: string,
  teacherId: string,
) {
  // ── Idempotency guard ────────────────────────────────────────────────────
  const { count } = await supabase
    .from("lesson_materials")
    .select("id", { count: "exact", head: true })
    .eq("lesson_id", lessonId);
  if (count && count > 0) return;

  // ── Phase 1: Trước giờ học ────────────────────────────────────────────────
  await supabase.from("lesson_materials").insert({
    lesson_id: lessonId,
    teacher_id: teacherId,
    phase: "before_class",
    material_type: "worksheet",
    title: "Phiếu ôn tập – Hệ thống hóa công thức Chương IV",
    description:
      "Ôn lại các công thức và khái niệm cốt lõi của toàn chương trước khi làm bài tập tổng hợp.",
    instructions: `PHIẾU ÔN TẬP B25 – BÀI TẬP VỀ VẬT LÍ HẠT NHÂN
(Trước giờ học, ôn lại kiến thức B21–B24)

──────────────────────────────────────────────────
PHẦN 1 – HỆ THỐNG HÓA CÔNG THỨC

Điền vào bảng tổng hợp (nhớ không tra sách):

| Đại lượng/Công thức              | Kí hiệu | Đơn vị | Ý nghĩa |
|----------------------------------|---------|--------|---------|
| Kí hiệu hạt nhân                | ᴬZX     |        | Z = số proton; A = số khối |
| Số neutron                       |         |        | N = A − Z |
| Đơn vị khối lượng nguyên tử      | u       | kg     | 1u ≈ 1,66×10⁻²⁷ kg; 1u = 931,5 MeV/c² |
| Độ hụt khối                      | Δm      | u      | Δm = [Zmp + (A−Z)mn] − mx |
| Năng lượng liên kết              | Elk     | MeV    | Elk = Δm × 931,5 |
| Năng lượng liên kết riêng        | Elkr    | MeV/nu | Elkr = Elk / A |
| Định luật phóng xạ (số hạt)      |         |        | Nt = N₀ × 2^(−t/T) |
| Định luật phóng xạ (độ phóng xạ) |         |        | Ht = H₀ × 2^(−t/T) |
| Hằng số phóng xạ                 | λ       | s⁻¹    | λ = ln2 / T ≈ 0,693 / T |
| Độ phóng xạ                      | H       | Bq     | H = λ × N |
| 1 Ci (Curie) bằng                |         | Bq     | 1 Ci = 3,7 × 10¹⁰ Bq |

──────────────────────────────────────────────────
PHẦN 2 – ÔN TẬP ĐỊNH TÍNH

Câu 1: Nêu 2 điểm khác nhau cơ bản giữa phản ứng hóa học và phản ứng hạt nhân.
Câu 2: Giải thích tại sao phân hạch ²³⁵U tỏa năng lượng (dùng khái niệm Elkr).
Câu 3: Kể tên 3 ứng dụng thực tiễn quan trọng nhất của đồng vị phóng xạ.
Câu 4: Nêu 3 biện pháp an toàn khi làm việc với nguồn phóng xạ.

──────────────────────────────────────────────────
PHẦN 3 – BÀI TẬP NHANH

1. Tính N của hạt nhân ²³⁸U: N = ___
2. Hạt nhân nào có năng lượng liên kết trên mỗi nucleon lớn hơn: ⁵⁶Fe (khoảng 8,8 MeV mỗi nucleon) hay ²³⁵U (khoảng 7,6 MeV mỗi nucleon)? ___
3. Sau 2 chu kì bán rã, số hạt nhân còn lại là N₀/___
4. Đơn vị Bq là gì? ___ phân rã/___
5. Phân rã β⁻ làm Z thay đổi như thế nào? Z → Z + ___

──────────────────────────────────────────────────
PHẦN 4 – LỖI SAI ĐIỂN HÌNH CẦN TRÁNH

❌ Trộn khối lượng hạt nhân và khối lượng nguyên tử trung hòa
   → Với khối lượng hạt nhân, dùng khối lượng proton tự do và neutron.
   → Với khối lượng nguyên tử, thay khối lượng proton bằng khối lượng nguyên tử hydrogen, bỏ qua hiệu chỉnh năng lượng liên kết electron ở mức bài tập.

❌ Nhầm "bảo toàn khối lượng" với "bảo toàn số khối"
   → Tổng số nucleon và tổng điện tích được bảo toàn. Tổng khối lượng nghỉ có thể thay đổi, còn năng lượng toàn phần được bảo toàn trong hệ kín.

❌ Quên đơn vị khi tính năng lượng
   → Δm [u] × 931,5 = E [MeV]; Δm [kg] × c² = E [J]; 1 MeV = 1,6 × 10⁻¹³ J

❌ Nhầm độ phóng xạ H với số hạt nhân N
   → H = λ × N; H và N đều giảm theo hàm mũ với cùng chu kì T`,
    is_published: true,
    sort_order: 1,
  });

  // Phase 1 final questions
  await supabase.from("phase_final_questions").insert([
    {
      lesson_id: lessonId,
      phase: "before_class",
      question_text:
        "Công thức tính hằng số phóng xạ λ theo chu kì bán rã T là gì? (Viết chính xác)",
      correct_answer: "λ = ln2/T",
      sort_order: 1,
    },
    {
      lesson_id: lessonId,
      phase: "before_class",
      question_text:
        "Trong công thức E = mc², c là gì và có giá trị xấp xỉ bao nhiêu m/s?",
      correct_answer: "c là tốc độ ánh sáng trong chân không, c ≈ 3×10⁸ m/s",
      sort_order: 2,
    },
  ]);

  // ── Phase 2: Trong giờ học ────────────────────────────────────────────────
  await supabase.from("lesson_materials").insert({
    lesson_id: lessonId,
    teacher_id: teacherId,
    phase: "in_class",
    material_type: "worksheet",
    title: "Phiếu thực hành – Vẽ đồ thị H(t) từ Bảng 25.1 và giải bài tập SGK",
    description:
      "Phân tích dữ liệu thực nghiệm từ Bảng 25.1 SGK, vẽ đồ thị và giải các bài tập ví dụ theo nhóm.",
    instructions: `PHIẾU THỰC HÀNH B25 – TRONG GIỜ HỌC

──────────────────────────────────────────────────
HOẠT ĐỘNG 1 – XỬ LÍ DỮ LIỆU VÀ VẼ ĐỒ THỊ H(t) (15 phút)
[Dựa trên Bài 2, Bảng 25.1 – SGK trang 121]

Bảng 25.1 – Độ phóng xạ H đo được theo thời gian:
| t (s)  | 0   | 30 | 60 | 120 | 180 | 240 | 300 | 360 |
|--------|-----|----|----|-----|-----|-----|-----|-----|
| H (Bq) | 151 | 85 | 55 | 31  | 22  | 15  | 11  | 9   |

Bước 1: Vẽ đồ thị H theo t (sử dụng công cụ đồ thị trên màn hình).
  • Trục X: t (giây), từ 0 đến 360s
  • Trục Y: H (Bq), từ 0 đến 160 Bq

Bước 2: Từ đồ thị, ước lượng chu kì bán rã T:
  • H₀ = 151 Bq → H₀/2 = ___ Bq
  • Tại t = ___ s, H ≈ H₀/2 (đọc từ đồ thị hoặc bảng)
  • T ≈ ___ s

Bước 3: Kiểm tra bằng tính toán:
  Giả sử hàm mũ đi qua H(0) = 151 Bq và H(30 s) = 85 Bq:
  \\[T=\\frac{30\\,\\mathrm{s}}{\\log_2(151/85)}\\approx36{,}2\\,\\mathrm{s}\\]
  So sánh với giá trị đọc đồ thị (nội suy tuyến tính khoảng 39,5 s). Hai phương pháp có giả định khác nhau và bảng không khớp một hàm mũ chính xác ở mọi điểm.

Bước 4: Nêu giới hạn của kết quả:
  T ≈ ___ s ≈ ___ phút theo phương pháp em chọn. Chỉ một ước lượng chu kì bán rã không đủ để xác định đồng vị.

Câu hỏi phân tích:
1. Tại sao H(t) ở các thời điểm t = 300 và t = 360 vẫn còn giảm (không về 0)?
2. Vì sao đường cong H(t) có dạng hàm mũ giảm, không phải đường thẳng?

──────────────────────────────────────────────────
HOẠT ĐỘNG 2 – GIẢI BÀI TẬP VÍ DỤ CÓ HƯỚNG DẪN (15 phút)
[Theo các bài ví dụ trong SGK B25, trang 119–120]

BÀI VÍ DỤ 1 – Tĩnh điện kế (SGK trang 119):
Tình huống: Đưa mẫu phóng xạ (1) lại gần đầu thu điện (2) của tĩnh điện kế (3).
Kim (3) giảm nhanh.

Phân tích:
• Tia phóng xạ làm ion hoá không khí → không khí dẫn điện tốt hơn.
• Điện tích trên tĩnh điện kế bị trung hòa → kim giảm.
Câu hỏi: Loại tia nào (α, β, γ) có hiệu quả ion hoá không khí cao nhất? ___
Ứng dụng thực tiễn: Máy phát hiện khói trong nhà dùng nguyên lý tương tự với đồng vị ²⁴¹Am.

BÀI VÍ DỤ 2 – Cân bằng phương trình (SGK trang 120):
Phương trình: ²³⁵U + ¹n → ¹⁴⁰Ce + ⁹⁴Zr + x·¹n + y·⁰e⁻

Bước 1: Bảo toàn số khối A:
  235 + 1 = 140 + 94 + x × 1 + y × 0
  → x = 236 − 234 = ___

Bước 2: Bảo toàn điện tích Z:
  92 + 0 = 58 + 40 + x × 0 + y × (−1)
  → 92 = 98 − y → y = ___

Phương trình đầy đủ: ²³⁵U + ¹n → ¹⁴⁰Ce + ⁹⁴Zr + ___ ¹n + ___ ⁰e⁻

Kiểm tra: Điện tích vế trái = ___; vế phải = ___ (Cân bằng? □ Có □ Không)

BÀI VÍ DỤ 3 – Máy xạ trị (SGK trang 120, Hình 25.2):
Máy xạ trị dùng ⁶⁰Co: T = 5,3 năm.
Bảo dưỡng khi H giảm 7%; thay nguồn khi H giảm 50%.

Bước 1: Tính t_bảo_dưỡng (khi H_t = 93% H₀):
  (H₀ − H_t)/H₀ = 7% → H_t = 0,93 H₀
  t_bd = T × log₂(H₀/H_t) = T × log₂(1/0,93) = T × log₂(100/93)
  log₂(100/93) = log(100/93)/log(2) ≈ log(1,075)/0,301 ≈ ___ / ___ ≈ ___
  t_bd ≈ 5,3 năm × ___ ≈ ___ tháng ≈ 6,65 tháng (theo SGK)

Bước 2: Tính t_thay_nguồn (khi H giảm 50%):
  H_t = 0,5 H₀ = H₀/2 = H₀/2¹ → t = T = ___ năm

──────────────────────────────────────────────────
HOẠT ĐỘNG 3 – BÀI TẬP FDG/PET (Bài 6 SGK trang 122) (10 phút)

Bối cảnh: ¹⁸F-FDG dùng trong PET, T = 110 phút. Hai bệnh nhân cùng cân nặng W (kg).
Cần liều 0,1 mCi/kg, không đổi tại thời điểm tiêm vào cơ thể.
Bệnh nhân A và B được tiêm cách nhau 60 phút (A tiêm trước, B tiêm sau 60 phút).

Câu hỏi: Ai cần FDG chuẩn bị nhiều hơn?

Lý luận:
• Khi chuẩn bị thuốc, người ta tính H cần thiết tại thời điểm tiêm.
• FDG của bệnh nhân A: Chuẩn bị và tiêm ngay (hoặc tiêm tại thời điểm gốc).
• FDG của bệnh nhân B: Chuẩn bị trong cùng mẻ sản xuất, nhưng phải đợi 60 phút rồi mới tiêm.
  → Sau 60 phút, H_B = H_B₀ × 2^(-60/110) → Để H_B(tại thời điểm tiêm) = 0,1W mCi,
  cần H_B₀ (lúc sản xuất) = 0,1W × 2^(60/110) = 0,1W × 2^(6/11) ≈ 0,1W × ___ (mCi)
• So sánh: Bệnh nhân ___ cần FDG nhiều hơn.
• Tỉ lệ FDG_B / FDG_A = 2^(60/110) ≈ ___`,
    is_published: true,
    sort_order: 1,
  });

  // Phase 2 final questions
  await supabase.from("phase_final_questions").insert([
    {
      lesson_id: lessonId,
      phase: "in_class",
      question_text:
        "Từ Bảng 25.1 SGK, H(0) = 151 Bq, H(30 s) = 85 Bq và H(60 s) = 55 Bq. Nội suy tuyến tính giữa 30 s và 60 s tại mức H₀/2, rồi làm tròn đến chục giây. Ghi đáp án theo dạng số kèm đơn vị giây.",
      correct_answer: "40 giây",
      sort_order: 1,
    },
    {
      lesson_id: lessonId,
      phase: "in_class",
      question_text:
        "Trong bài ví dụ 2 SGK (²³⁵U + n → ¹⁴⁰Ce + ⁹⁴Zr + x·n + y·e⁻), giá trị x (số neutron sinh ra) và y (số electron beta) lần lượt là bao nhiêu?",
      correct_answer: "x = 2, y = 6",
      sort_order: 2,
    },
  ]);

  // ── Phase 3: Sau giờ học ──────────────────────────────────────────────────
  await supabase.from("lesson_materials").insert({
    lesson_id: lessonId,
    teacher_id: teacherId,
    phase: "after_class",
    material_type: "worksheet",
    title: "Phiếu kiểm tra tổng hợp B25 – Vật lí hạt nhân (xem/in trực tiếp)",
    description:
      "Bài tập tổng hợp toàn chương, bốn mức độ, có hướng dẫn giải và lỗi sai điển hình. In bằng Ctrl+P / Cmd+P.",
    instructions: `PHIẾU BÀI TẬP TỔNG HỢP B25 – VẬT LÍ HẠT NHÂN
Họ và tên: _________________________ Lớp: _______

──────────────────────────────────────────────────
I. BÀI TẬP CÓ HƯỚNG DẪN (các bài trong SGK trang 121–122)

Bài 1 (SGK B25, Bài 1, trang 121):
"Lực nào đã thay đổi phương chuyển động của hạt alpha (⁴He) khi được bắn vào lá vàng mỏng?"

Hướng dẫn phân tích:
• Lực hấp dẫn: Quá nhỏ, bỏ qua.
• Lực từ trường: Không có nam châm trong thí nghiệm.
• Lực hạt nhân: Chỉ tác dụng trong phạm vi ~10⁻¹⁵ m; hạt α bay qua ở khoảng cách xa hơn.
• Lực đẩy tĩnh điện Coulomb: Hạt α (+2e) bị đẩy bởi hạt nhân vàng (+79e).
Đáp án: _____ (chọn C trong đáp án gốc: Lực đẩy tĩnh điện giữa hạt nhân ¹⁹⁷Au và ⁴He)

Bài 2 (SGK B25, Bài 2, trang 121) – Phân tích đồ thị:
Cho Bảng 25.1 – Đo độ phóng xạ theo thời gian:
| t (s)  | 0   | 30 | 60 | 120 | 180 | 240 | 300 | 360 |
|--------|-----|----|----|-----|-----|-----|-----|-----|
| H (Bq) | 151 | 85 | 55 | 31  | 22  | 15  | 11  | 9   |

a) Vẽ đồ thị H(t) (trục X: t (s), trục Y: H (Bq)).
b) Ước lượng T: Mức 75,5 Bq nằm giữa H(30 s) và H(60 s). Nội suy tuyến tính được khoảng 39,5 s.
   Ghi phương pháp và đơn vị. Giá trị đọc đồ thị phụ thuộc cách nối hoặc khớp các điểm.
c) Dùng T ≈ 39,5 s, hằng số phóng xạ ước lượng khoảng 0,0175 s⁻¹.

Bài 3 (SGK B25, Bài 3, trang 121) – Định tuổi C-14:
Mẫu gỗ cổ: 240 phân rã/phút; T(¹⁴C) = 5730 năm.
Mẫu có 25 g carbon gồm ¹²C và ¹⁴C. Tỉ lệ số nguyên tử ¹²C : ¹⁴C khi sinh vật còn sống là 10¹² : 1. Vì ¹⁴C rất ít, lấy gần đúng khối lượng ¹²C là 25 g.

a) Tính số nguyên tử ¹⁴C trong mẫu gỗ cổ:
   Trong bài tập, giả sử số đếm đã được hiệu chỉnh và biểu thị số phân rã. Độ phóng xạ mẫu là 4 Bq.
   Đổi 5.730 năm thành giây, dùng 365 ngày mỗi năm.
   \\[T_{\\mathrm{s}}=5730\\cdot365\\cdot24\\cdot3600\\,\\mathrm{s},\\qquad
   \\lambda=\\frac{\\ln2}{T_{\\mathrm{s}}},\\qquad N_{\\mathrm{cổ}}=\\frac{H_{\\mathrm{cổ}}}{\\lambda}\\approx1{,}04\\times10^{12}\\]

b) Tính số nguyên tử ¹⁴C trong 25 g ¹²C khi còn sống:
   N(¹²C) = 25/12 × 6,02×10²³ ≈ 1,254×10²⁴
   N₀(¹⁴C) = N(¹²C) / 10¹² = ___

c) Tính tuổi mẫu gỗ:
   t = T × log₂(N₀/N_cổ) = 5730 × log₂(N₀/N_cổ) ≈ ___ năm

Bài 5 (SGK B25, Bài 5, trang 122) – Chiếu xạ tại Trung tâm chiếu xạ Hà Nội:
⁶⁰Co, T = 5,3 năm. Tháng 1/2022: thời gian chiếu xạ = 150 phút.
Hỏi: Tháng 6/2024 (sau khoảng 29 tháng), thời gian chiếu xạ cần là bao nhiêu?

Hướng dẫn: Với cùng liều, hình học và điều kiện thiết bị, giả sử tốc độ chiếu tỉ lệ với độ phóng xạ.
\\[t_{\\mathrm{mới}}=t_{\\mathrm{cũ}}\\cdot\\frac{H_0}{H_{\\mathrm{mới}}}
=150\\cdot2^{\\frac{29}{12\\cdot5{,}3}}\\,\\mathrm{phút}\\approx206\\,\\mathrm{phút}\\]
Đây là ước lượng theo tháng trong điều kiện của đề bài.

──────────────────────────────────────────────────
II. BÀI TẬP TỰ LUYỆN (tương đương mức vận dụng cao)

Bài 6 (Tự biên soạn – tương đương bài FDG/PET B25):
Phân xưởng ¹⁸F-FDG (T = 110 phút) sản xuất một mẻ lúc 7:00 sáng với H₀ = 100 GBq.
Bệnh viện cần tiêm đúng lúc 10:30 sáng (3 giờ 30 phút = 210 phút sau sản xuất).
a) Tính độ phóng xạ còn lại của mẻ thuốc lúc 10:30.
b) Bệnh nhân nặng 60 kg, cần liều 0,1 mCi/kg. Tính tổng liều cần (mCi) và kiểm tra đủ không.
   (1 GBq = 27,03 mCi)`,
    is_published: true,
    sort_order: 1,
  });

  // Phase 3 assessment questions – 4 mức + đúng/sai + trả lời ngắn
  await supabase.from("phase_assessment_questions").insert([
    {
      lesson_id: lessonId,
      question_type: "single_choice",
      difficulty: "nhan_biet",
      content: {
        prompt:
          "Khi nói về sự phân hạch hạt nhân, phát biểu nào sau đây ĐÚNG?",
        options: [
          "Phân hạch là hiện tượng một hạt nhân nặng vỡ thành hai mảnh nhẹ hơn và giải phóng neutron.",
          "Phân hạch là sự kết hợp hai hạt nhân nhẹ thành hạt nhân nặng hơn.",
          "Phân hạch chỉ xảy ra ở nhiệt độ hàng chục triệu độ Kelvin.",
          "Phân hạch luôn hấp thụ năng lượng từ môi trường.",
        ],
        correctAnswer:
          "Phân hạch là hiện tượng một hạt nhân nặng vỡ thành hai mảnh nhẹ hơn và giải phóng neutron.",
      },
      sort_order: 1,
      is_published: true,
    },
    {
      lesson_id: lessonId,
      question_type: "single_choice",
      difficulty: "thong_hieu",
      content: {
        prompt:
          "Trong phản ứng phóng xạ beta trừ (β⁻), so với hạt nhân mẹ, hạt nhân con có:",
        options: [
          "số khối bằng, số proton tăng 1.",
          "số khối bằng, số proton giảm 1.",
          "số khối giảm 4, số proton giảm 2.",
          "số khối bằng, số proton không đổi.",
        ],
        correctAnswer: "số khối bằng, số proton tăng 1.",
      },
      sort_order: 2,
      is_published: true,
    },
    {
      lesson_id: lessonId,
      question_type: "single_choice",
      difficulty: "van_dung",
      content: {
        prompt:
          "Khối lượng nguyên tử trung hòa ¹²C bằng 12 u. Cho khối lượng nguyên tử hydrogen bằng 1,007825 u, khối lượng neutron bằng 1,008665 u và 1 u tương đương 931,5 MeV/c². Bỏ qua hiệu chỉnh năng lượng liên kết electron. Năng lượng liên kết của hạt nhân ¹²C gần nhất với giá trị nào?",
        options: [
          "89,1 MeV.",
          "92,16 MeV.",
          "7,68 MeV.",
          "0,09894 MeV.",
        ],
        correctAnswer: "92,16 MeV.",
      },
      sort_order: 3,
      is_published: true,
    },
    {
      lesson_id: lessonId,
      question_type: "single_choice",
      difficulty: "van_dung_cao",
      content: {
        prompt:
          "Máy xạ trị dùng ⁶⁰Co (T = 5,3 năm). Thời gian chiếu xạ ban đầu là 150 phút. Sau 2,5 năm, thời gian chiếu xạ cần thiết cho cùng liều bức xạ là xấp xỉ:",
        options: [
          "≈ 200 phút.",
          "≈ 170 phút.",
          "≈ 112 phút.",
          "≈ 300 phút.",
        ],
        correctAnswer: "≈ 200 phút.",
      },
      sort_order: 4,
      is_published: true,
    },
    {
      lesson_id: lessonId,
      question_type: "true_false",
      difficulty: "thong_hieu",
      content: {
        prompt: "Đánh dấu Đúng (Đ) hoặc Sai (S) về phản ứng hạt nhân và công thức tính:",
        statements: [
          {
            text: "Trong phản ứng hạt nhân bất kỳ, tổng số khối A trước và sau phản ứng bằng nhau.",
            correctValue: true,
            explanation:
              "Đúng. Bảo toàn số khối A là một trong hai định luật bảo toàn trong phản ứng hạt nhân (cùng với bảo toàn điện tích Z).",
          },
          {
            text: "Độ hụt khối Δm = 0 có nghĩa là hạt nhân rất bền vững.",
            correctValue: false,
            explanation:
              "Sai. Độ hụt khối bằng 0 tương ứng năng lượng liên kết bằng 0 so với các nucleon tự do. Độ bền đối với một kênh phân rã cần xét điều kiện riêng, không suy ra chỉ từ năng lượng liên kết.",
          },
          {
            text: "Theo bài tập 5 SGK (tr.122), thời gian chiếu xạ cần tăng lên sau khi nguồn ⁶⁰Co suy giảm, vì cần bù lại độ phóng xạ giảm.",
            correctValue: true,
            explanation:
              "Đúng. H = H₀ × 2^(-t/T) giảm theo thời gian, nên để đảm bảo cùng liều bức xạ (= H × t_chiếu), phải tăng t_chiếu khi H giảm.",
          },
        ],
        correctAnswers: [true, false, true],
      },
      sort_order: 5,
      is_published: true,
    },
    {
      lesson_id: lessonId,
      question_type: "short_answer",
      difficulty: "van_dung",
      content: {
        prompt:
          "Dựa vào Bảng 25.1 (SGK trang 121), tại 0 s, 30 s, 60 s, 120 s và 180 s, độ phóng xạ lần lượt là 151, 85, 55, 31 và 22 Bq. Ước lượng chu kì bán rã. Giải thích cách em đọc T từ bảng hoặc đồ thị.",
        sampleAnswer:
          "Một nửa độ phóng xạ ban đầu là 75,5 Bq, nằm giữa 85 Bq tại 30 s và 55 Bq tại 60 s. Nội suy tuyến tính cho khoảng 39,5 s. Nếu giả sử đường hàm mũ đi qua điểm đầu và điểm ở 30 s, ước lượng là 36,2 s. Cần ghi phương pháp và xem xét độ lệch giữa mô hình và bảng.",
        keywords: ["75,5 Bq", "nội suy", "39,5", "36,2"],
      },
      sort_order: 6,
      is_published: true,
    },
  ]);
}
