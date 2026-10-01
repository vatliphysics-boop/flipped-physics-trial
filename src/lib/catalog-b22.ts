import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Seed B22 catalog – "Bài 22. Phản ứng hạt nhân và năng lượng liên kết"
 * SGK Vật lí 12 KNTT, trang 96–103.
 *
 * SGK evidence verified (rendered from scanned PDF):
 *  - Trang 96: Hình 22.1 (sơ đồ thí nghiệm Rutherford bắn phá N-14), Hình 22.2 (ảnh buồng sương Blackett)
 *  - Trang 97: Phương trình ⁴He + ¹⁴N → ¹⁷O + ¹H; bảo toàn A và Z
 *  - Trang 98: Hình 22.3 – đồ thị năng lượng liên kết riêng theo số khối A
 *  - Trang 99: Độ hụt khối Δm = [Zmp + (A−Z)mn] − mx; E = mc²; Elk = Δmc²
 *  - Trang 100–101: Phân hạch U-235; phương trình ¹n + ²³⁵U → ²³⁶U* → ⁹⁵Y + ¹³⁸I + 3¹n
 *  - Trang 102–103: Phản ứng dây chuyền; tổng hợp hạt nhân; bài tập
 */
export async function seedB22Catalog(
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
  const { data: videoPlaceholder, error: vpErr } = await supabase
    .from("lesson_materials")
    .insert({
      lesson_id: lessonId,
      teacher_id: teacherId,
      phase: "before_class",
      material_type: "video",
      title: "Video bài giảng: Phản ứng hạt nhân và Năng lượng liên kết (chưa có video)",
      description:
        "⚠️ Giáo viên cần tải video lên. Kịch bản đã soạn sẵn trong phần Hướng dẫn dưới đây.",
      instructions: `KỊCH BẢN VIDEO BÀI GIẢNG B22 – PHẢN ỨNG HẠT NHÂN VÀ NĂNG LƯỢNG LIÊN KẾT
(Thời lượng khuyến nghị: 12–15 phút)

[00:00 – 01:30] Mở đầu – Câu chuyện của Rutherford năm 1919
• Hỏi học sinh: "Liệu ta có thể biến đổi nguyên tố này thành nguyên tố khác không?"
• Kể câu chuyện: Rutherford dùng nguồn phóng xạ ²¹⁰Po phát hạt alpha, bắn vào không khí chứa nitrogen.
• Ông phát hiện sản phẩm có hạt nhân ¹H trong đó – dấu hiệu có biến đổi hạt nhân.
• Đặt câu hỏi: Làm sao biết nitrogen đã biến thành oxygen? → Blackett dùng buồng sương.

[01:30 – 04:00] Thí nghiệm Blackett – Bằng chứng ảnh buồng sương
• Buồng sương: Hơi nước siêu bão hoà → các hạt mang điện làm ngưng tụ thành vết trắng.
• Ảnh Hình 22.2 (SGK tr.96): vết alpha đang đi thẳng, bất ngờ tại một điểm rẽ nhánh.
  - Nhánh dài, mảnh → proton ¹H (nhẹ, tốc độ cao, ion hóa ít)
  - Nhánh ngắn, đậm → hạt nhân ¹⁷O (nặng hơn, ion hóa mạnh hơn)
• Từ dấu vết đọc được phương trình: ⁴He + ¹⁴N → ¹⁷O + ¹H

[04:00 – 07:00] Định luật bảo toàn trong phản ứng hạt nhân
• Bảo toàn số khối A: 4 + 14 = 17 + 1 ✓
• Bảo toàn điện tích Z: 2 + 7 = 8 + 1 ✓
• Hai định luật này cho phép xác định hạt nhân chưa biết.
• Phân biệt phản ứng kích thích (như trên) với phản ứng tự phát (phóng xạ).

[07:00 – 10:00] Năng lượng liên kết và độ hụt khối
• Khối lượng hạt nhân LUÔN nhỏ hơn tổng khối lượng nucleon tạo thành nó.
• Ví dụ ²He: 2mp + 2mn = 4,03188 u > m(He) = 4,00150 u → Δm = 0,03038 u
• Δm = [Z·mp + (A−Z)·mn] − mx (công thức SGK 22.2)
• Einstein E = mc²: Năng lượng liên kết Elk = Δm·c²
• Năng lượng liên kết riêng Elkr = Elk/A → Đặc trưng độ bền.
• Đỉnh đồ thị (Hình 22.3) ở vùng A ≈ 50–90 (Fe, Ni) → bền nhất.

[10:00 – 12:00] Phân hạch và nhiệt hạch
• Phân hạch: ¹n + ²³⁵U → ²³⁶U* → ⁹⁵Y + ¹³⁸I + 3¹n + ~200 MeV
• Dây chuyền: neutron sinh ra lại kích hoạt U khác.
• Nhiệt hạch: ²H + ³H → ⁴He + ¹n + 17,6 MeV (cần T ≥ 10⁷ K)

[12:00 – 14:00] Kết bài
• Tóm tắt: Δm→Elk→Elkr→bền/kém bền→phân hạch/nhiệt hạch
• Giao nhiệm vụ: Phiếu tự học và hai câu hỏi chốt pha 1.`,
      duration_minutes: 14,
      is_published: false,
      sort_order: 1,
    })
    .select("id")
    .single();

  if (vpErr) {
    console.error("[seedB22Catalog] video placeholder insert failed:", vpErr.message);
    return;
  }

  if (videoPlaceholder) {
    await supabase.from("video_checkpoints").insert([
      {
        material_id: videoPlaceholder.id,
        checkpoint_percent: 45,
        question: "Ảnh buồng sương Blackett (Hình 22.2 SGK) cung cấp bằng chứng gì về phản ứng hạt nhân?",
        option_a: "Hạt alpha bị tán xạ ngược lại lá vàng.",
        option_b: "Vết rẽ nhánh tại điểm va chạm chứng tỏ xuất hiện hai hạt mới (proton và hạt nhân oxy).",
        option_c: "Nitrogen phát ra tia gamma khi hấp thụ alpha.",
        option_d: "Phản ứng phân hạch xảy ra tự phát.",
        correct_option: "B",
        sort_order: 0,
      },
      {
        material_id: videoPlaceholder.id,
        checkpoint_percent: 80,
        question: "Hạt nhân nào có năng lượng liên kết riêng lớn nhất theo đồ thị Hình 22.3 SGK?",
        option_a: "Hydrogen-2 (²H)",
        option_b: "Helium-4 (⁴He)",
        option_c: "Uranium-235 (²³⁵U)",
        option_d: "Các hạt nhân vùng A ≈ 50–90 (Fe, Ni).",
        correct_option: "D",
        sort_order: 1,
      },
    ]);
  }

  // Phiếu tự học chi tiết – Trước giờ học
  await supabase.from("lesson_materials").insert({
    lesson_id: lessonId,
    teacher_id: teacherId,
    phase: "before_class",
    material_type: "worksheet",
    title: "Phiếu tự học – Phản ứng hạt nhân và Năng lượng liên kết",
    description:
      "Đọc kỹ SGK trang 96–103, quan sát hình minh họa và hoàn thành phiếu trước buổi học.",
    instructions: `PHIẾU HƯỚNG DẪN TỰ HỌC B22 – PHẢN ỨNG HẠT NHÂN VÀ NĂNG LƯỢNG LIÊN KẾT
(SGK trang 96–103, Kết nối tri thức với cuộc sống)

MỤC TIÊU BÀI HỌC – Sau khi hoàn thành phần này em có thể:
□ Mô tả thí nghiệm Rutherford (1919) bắn phá nitrogen bằng alpha và nêu ý nghĩa của ảnh buồng sương Blackett.
□ Viết và cân bằng phương trình phản ứng hạt nhân theo bảo toàn A và Z.
□ Tính độ hụt khối Δm và năng lượng liên kết Elk = Δmc².
□ Đọc và giải thích đồ thị năng lượng liên kết riêng (Hình 22.3 SGK).
□ Nhận biết phản ứng phân hạch và nhiệt hạch; điều kiện xảy ra.

──────────────────────────────────────────────────
PHẦN 1 – ĐỌC HÌNH VÀ GHI NHẬN (SGK trang 96–97)

Mở SGK, xem Hình 22.2 – Ảnh kết quả thí nghiệm của Blackett:

Câu 1: Tại điểm va chạm trong ảnh buồng sương, em thấy bao nhiêu vết đi ra?
□ 1 vết   □ 2 vết   □ 3 vết

Câu 2: So sánh hai vết đi ra từ điểm va chạm:
a) Vết dài, mảnh hơn ứng với hạt: ____________ (nhẹ hơn / ion hóa ít)
b) Vết ngắn, đậm hơn ứng với hạt: ____________ (nặng hơn / ion hóa mạnh)

Câu 3: Ghi phương trình phản ứng và kiểm tra cân bằng:
   ⁴He + ¹⁴N → ___ O + ___ H
   Kiểm tra A: 4 + 14 = ___ + ___ = ___  (Bảo toàn? □ Có □ Không)
   Kiểm tra Z: 2 + 7 = ___ + ___ = ___   (Bảo toàn? □ Có □ Không)

──────────────────────────────────────────────────
PHẦN 2 – ĐỌC ĐỒ THỊ NĂNG LƯỢNG LIÊN KẾT RIÊNG (SGK tr.98, Hình 22.3)

Đồ thị trục X: Số khối A (0 → 240)
Đồ thị trục Y: Năng lượng liên kết riêng Elkr (MeV/nucleon)

Câu 4: Vùng nào của đồ thị có Elkr cao nhất? A ≈ ____________ (điền số)
Câu 5: Hạt nhân ²H (deuterium) có Elkr ≈ ___ MeV/nu (đọc từ đồ thị)
Câu 6: Hạt nhân ²³⁵U có Elkr ≈ ___ MeV/nu. So với hạt nhân vùng A ≈ 50–90 thì bền hơn hay kém hơn?
Câu 7: Nếu ²³⁵U vỡ thành hai mảnh có A trung bình (mảnh bền hơn), phản ứng đó tỏa hay thu năng lượng? Giải thích dựa vào đồ thị.

──────────────────────────────────────────────────
PHẦN 3 – CÔNG THỨC CẦN GHI NHỚ

□ Độ hụt khối: Δm = [Z·mp + (A−Z)·mn] − mx
  (mp ≈ 1,00728 u; mn ≈ 1,00866 u; 1u = 931,5 MeV/c²)
□ Năng lượng liên kết: Elk = Δm·c² (đơn vị MeV nếu Δm tính bằng u, nhân 931,5)
□ Năng lượng liên kết riêng: Elkr = Elk / A (MeV/nucleon)

Bài tập nhanh: Tính Δm của ⁴He (m_He = 4,00150 u; mp = 1,00728 u; mn = 1,00866 u):
Δm = [2×1,00728 + 2×1,00866] − 4,00150 = 4,03188 − 4,00150 = ______ u

──────────────────────────────────────────────────
PHẦN 4 – CÂU HỎI CHUẨN BỊ CHO LỚP

1. Phân biệt phản ứng hạt nhân tự phát (phóng xạ) và phản ứng kích thích bằng ví dụ.
2. Tại sao nhiệt hạch cần nhiệt độ rất cao (hàng chục triệu độ) mới xảy ra được?
3. Ghi một câu hỏi em còn chưa hiểu để hỏi trong giờ học:
   _______________________________________________________________`,
    is_published: true,
    sort_order: 2,
  });

  // Phase 1 final questions (2 chốt cuối pha)
  await supabase.from("phase_final_questions").insert([
    {
      lesson_id: lessonId,
      phase: "before_class",
      question_text:
        "Trong phản ứng hạt nhân ⁴He + ¹⁴N → ? + ¹H, hạt nhân ẩn là hạt nhân nào? (Viết kí hiệu gọn dạng AX)",
      correct_answer: "17O",
      sort_order: 1,
    },
    {
      lesson_id: lessonId,
      phase: "before_class",
      question_text:
        "Hạt nhân có năng lượng liên kết riêng (Elkr) càng lớn thì càng bền hay càng kém bền?",
      correct_answer: "Càng bền",
      sort_order: 2,
    },
  ]);

  // ── Phase 2: Trong giờ học ────────────────────────────────────────────────
  await supabase.from("lesson_materials").insert({
    lesson_id: lessonId,
    teacher_id: teacherId,
    phase: "in_class",
    material_type: "worksheet",
    title: "Phiếu thực hành – Bằng chứng buồng sương, đồ thị liên kết, phân hạch/nhiệt hạch",
    description:
      "Dùng mô phỏng và đồ thị để tự rút ra kết luận về phản ứng hạt nhân và năng lượng liên kết.",
    instructions: `PHIẾU THỰC HÀNH B22 – TRONG GIỜ HỌC
(Làm cùng mô phỏng trên màn hình)

──────────────────────────────────────────────────
HOẠT ĐỘNG 1 – ĐỌC ẢNH BUỒNG SƯƠNG BLACKETT (10 phút) [Trích thí nghiệm SGK, Hình 22.2 tr.96]

Câu hỏi ban đầu: Làm sao biết phản ứng ⁴He + ¹⁴N → ¹⁷O + ¹H thực sự xảy ra?
Dự đoán của em: _______________________________________

Quan sát sơ đồ mô phỏng ảnh buồng sương:
1. Mô tả đường đi của hạt alpha TRƯỚC va chạm: _________________
2. Sau điểm va chạm có bao nhiêu vết? Mô tả đặc điểm từng vết:
   Vết 1: độ đậm _____, độ dài _____  → hạt này là: _________
   Vết 2: độ đậm _____, độ dài _____  → hạt này là: _________
3. Cân bằng phương trình (điền vào ô trống trong mô phỏng): ⁴₂He + ¹⁴₇N → ___O + ___H
   Kiểm tra: Tổng A trước = ___, sau = ___   | Tổng Z trước = ___, sau = ___
4. KẾT LUẬN: Bằng chứng từ buồng sương cho phép kết luận gì về khả năng biến đổi nguyên tố?
   _______________________________________________________

──────────────────────────────────────────────────
HOẠT ĐỘNG 2 – PHÂN TÍCH ĐỒ THỊ NĂNG LƯỢNG LIÊN KẾT RIÊNG (10 phút)

Dùng mô phỏng đồ thị Elkr (MeV/nu) theo số khối A. Click vào các điểm để đọc giá trị.

| Hạt nhân      | A   | Elkr (MeV/nu) | Vị trí so với đỉnh |
|---------------|-----|---------------|---------------------|
| ²H            | 2   |               |                     |
| ⁴He           | 4   |               |                     |
| ¹²C           | 12  |               |                     |
| ⁵⁶Fe          | 56  |               |                     |
| ¹³⁸I          | 138 |               |                     |
| ²³⁵U          | 235 |               |                     |

Câu hỏi phân tích:
a) Hạt nhân ⁵⁶Fe và ²³⁵U: hạt nào bền hơn? Dựa vào đâu?
b) Khi ²³⁵U phân hạch tạo các mảnh trung bình (A ≈ 100–140), hệ chuyển từ Elkr thấp sang cao.
   Điều đó có nghĩa là phản ứng _____ (tỏa / thu) năng lượng.
c) Khi ²H và ³H kết hợp thành ⁴He (nhiệt hạch), Elkr thay đổi thế nào? Phản ứng _____ năng lượng.

──────────────────────────────────────────────────
HOẠT ĐỘNG 3 – MÔ PHỎNG PHÂN HẠCH DÂY CHUYỀN (7 phút)

Nhấn "Bắn 1 neutron" trong mô phỏng phân hạch và theo dõi:

| Thế hệ | Số neutron kích thích | Số U-235 đã phân hạch |
|--------|----------------------|------------------------|
| 1      |                      |                        |
| 2      |                      |                        |
| 3      |                      |                        |

Câu hỏi:
1. Mỗi phân hạch sinh ra khoảng bao nhiêu neutron mới? ___
2. Nếu không có cơ chế kiểm soát, số neutron tăng theo dãy số nào? ___
3. Điều gì xảy ra nếu hệ số nhân neutron k > 1 (không kiểm soát) và k = 1 (kiểm soát)?

──────────────────────────────────────────────────
HOẠT ĐỘNG 4 – TÍNH TOÁN NĂNG LƯỢNG (5 phút, cá nhân)

Cho phản ứng nhiệt hạch: ²H + ³H → ⁴He + ¹n
Biết: Δm(²H) = 0,00239 u; Δm(³H) = 0,00909 u; Δm(⁴He) = 0,03038 u; Δm(¹n) ≈ 0
1u = 931,5 MeV/c²

a) Tính Elk của ⁴He: Elk = 0,03038 × 931,5 ≈ _____ MeV
b) Năng lượng tỏa ra Q = (Δm_sản_phẩm − Δm_đầu_vào) × 931,5
   Q = (0,03038 + 0 − 0,00239 − 0,00909) × 931,5 ≈ _____ MeV
c) So sánh với phân hạch U-235 (~200 MeV/phản ứng) và bình luận về mật độ năng lượng của nhiệt hạch trên mỗi nucleon.`,
    is_published: true,
    sort_order: 1,
  });

  // Phase 2 final questions (2 chốt cuối pha 2)
  await supabase.from("phase_final_questions").insert([
    {
      lesson_id: lessonId,
      phase: "in_class",
      question_text:
        "Phản ứng nhiệt hạch là sự kết hợp của các hạt nhân nhẹ (A nhỏ) hay nặng (A lớn) thành hạt nhân nặng hơn?",
      correct_answer: "Nhẹ",
      sort_order: 1,
    },
    {
      lesson_id: lessonId,
      phase: "in_class",
      question_text:
        "Phản ứng hạt nhân trong đó một hạt nhân rất nặng vỡ ra thành các mảnh trung bình và giải phóng neutron gọi là phản ứng gì?",
      correct_answer: "Phân hạch",
      sort_order: 2,
    },
  ]);

  // ── Phase 3: Sau giờ học ──────────────────────────────────────────────────
  await supabase.from("lesson_materials").insert({
    lesson_id: lessonId,
    teacher_id: teacherId,
    phase: "after_class",
    material_type: "worksheet",
    title: "Phiếu bài tập B22 – Phản ứng hạt nhân và Năng lượng liên kết",
    description:
      "Ôn tập định tính, định lượng và thực tiễn về phản ứng hạt nhân và năng lượng liên kết. Em có thể in trang bằng Ctrl+P / Cmd+P.",
    instructions: `PHIẾU BÀI TẬP B22 – SAU GIỜ HỌC
Họ và tên: _________________________ Lớp: _______

──────────────────────────────────────────────────
I. TÓM TẮT LÍ THUYẾT CẦN GHI NHỚ

1. Định luật bảo toàn trong phản ứng hạt nhân:
   • Bảo toàn số khối A: Σ A_trước = Σ A_sau
   • Bảo toàn điện tích Z: Σ Z_trước = Σ Z_sau
   (Lưu ý: Khối lượng KHÔNG bảo toàn vì một phần chuyển thành năng lượng)

2. Độ hụt khối và năng lượng liên kết:
   Δm = [Z·mp + (A−Z)·mn] − mx
   Elk = Δm · c² = Δm [u] × 931,5 MeV/u
   Elkr = Elk / A  (MeV/nucleon) → Đặc trưng độ bền vững

3. Năng lượng phản ứng:
   Q = (Σm_trước − Σm_sau) · c²
   Q > 0: phản ứng tỏa năng lượng; Q < 0: thu năng lượng.

4. Phân hạch và nhiệt hạch (tổng hợp):
   • Phân hạch: Hạt nặng vỡ thành 2 mảnh trung bình + vài neutron; Q ~ 200 MeV
   • Nhiệt hạch: Các hạt nhẹ kết hợp → hạt nặng hơn; điều kiện T ≥ 10⁷ K; Q ~ 17,6 MeV/phản ứng (nhưng cao hơn/nucleon)

──────────────────────────────────────────────────
II. BÀI TẬP TỰ LUẬN

Bài 1 (Nhận biết – Cân bằng phương trình):
Điền vào ô trống và kiểm tra cân bằng:
a) ²³⁵U + ¹n → ¹⁴⁰Xe + ___ Sr + ___ ¹n
b) ²³⁸U → ___ Th + ⁴He
c) ¹H + ³H → ⁴He + ___

Bài 2 (Thông hiểu – Đọc đồ thị):
Dựa vào đồ thị Hình 22.3 (Elkr theo A), hãy giải thích tại sao:
a) Phản ứng phân hạch tỏa năng lượng (gợi ý: so sánh Elkr của U-235 và sản phẩm).
b) Phản ứng nhiệt hạch của D-T cũng tỏa năng lượng (gợi ý: Elkr của ⁴He > ²H và ³H).

Bài 3 (Vận dụng – Tính độ hụt khối và năng lượng liên kết):
Cho hạt nhân ¹⁶O có khối lượng 15,9949 u; mp = 1,00728 u; mn = 1,00866 u.
a) Tính độ hụt khối Δm.
b) Tính năng lượng liên kết Elk (đơn vị MeV).
c) Tính năng lượng liên kết riêng Elkr (đơn vị MeV/nucleon).
d) Nhận xét: ¹⁶O có bền hơn ⁴He (Elkr ≈ 7,1 MeV/nu) không?

Bài 4 (Vận dụng – Viết phương trình phân hạch từ SGK, trang 101):
Khi ²³⁵U hấp thụ 1 neutron, tạo thành ²³⁶U* (kích thích), sau đó phân hạch thành
¹³⁸I, ⁹⁵Y và k neutron.
a) Viết phương trình đầy đủ.
b) Tính k bằng định luật bảo toàn A và Z.
c) Tính năng lượng tỏa ra nếu mỗi phân hạch toả ~200 MeV và có 1 mol U-235 phản ứng hoàn toàn.

Bài 5 (Vận dụng cao – Phân hạch dây chuyền):
Giải thích tại sao lò phản ứng hạt nhân dùng thanh điều khiển (chứa Bo hoặc Cadimi) để hấp thụ neutron. Thanh điều khiển giúp duy trì k = 1 nghĩa là gì trong thực tiễn vận hành lò?`,
    is_published: true,
    sort_order: 1,
  });

  // Phase 3 assessment – 4 mức độ + 1 câu đúng/sai + 1 câu trả lời ngắn
  await supabase.from("phase_assessment_questions").insert([
    {
      lesson_id: lessonId,
      question_type: "single_choice",
      difficulty: "nhan_biet",
      content: {
        prompt: "Trong phản ứng hạt nhân ⁴He + ¹⁴N → X + ¹H, hạt nhân X là:",
        options: [
          "¹⁶O (Oxygen-16).",
          "¹⁷O (Oxygen-17).",
          "¹⁸O (Oxygen-18).",
          "¹⁵N (Nitrogen-15).",
        ],
        correctAnswer: "¹⁷O (Oxygen-17).",
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
          "Theo đồ thị Hình 22.3, năng lượng liên kết riêng của các hạt nhân có số khối trung bình (A ≈ 50–90) so với hạt nhân rất nặng (A > 200):",
        options: [
          "Nhỏ hơn, vì chúng nhẹ hơn.",
          "Lớn hơn, nên chúng bền vững hơn.",
          "Bằng nhau, vì phụ thuộc vào điện tích Z.",
          "Không thể so sánh vì đơn vị khác nhau.",
        ],
        correctAnswer: "Lớn hơn, nên chúng bền vững hơn.",
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
          "Tính độ hụt khối của ⁴He (mp = 1,00728 u; mn = 1,00866 u; m(He) = 4,00150 u). Kết quả Δm bằng:",
        options: [
          "Δm = 0,03038 u",
          "Δm = 0,02870 u",
          "Δm = 0,04010 u",
          "Δm = 0,01500 u",
        ],
        correctAnswer: "Δm = 0,03038 u",
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
          "Cho phản ứng ²H + ³H → ⁴He + ¹n. Biết khối lượng các hạt: m(²H) = 2,01410 u; m(³H) = 3,01605 u; m(⁴He) = 4,00260 u; m(n) = 1,00866 u. Năng lượng tỏa ra của phản ứng là (1u = 931,5 MeV/c²):",
        options: [
          "Q ≈ 17,6 MeV",
          "Q ≈ 7,0 MeV",
          "Q ≈ 200 MeV",
          "Q ≈ −17,6 MeV (thu năng lượng)",
        ],
        correctAnswer: "Q ≈ 17,6 MeV",
      },
      sort_order: 4,
      is_published: true,
    },
    {
      lesson_id: lessonId,
      question_type: "true_false",
      difficulty: "thong_hieu",
      content: {
        prompt: "Đánh dấu Đúng (Đ) hoặc Sai (S) cho mỗi phát biểu về phản ứng hạt nhân:",
        statements: [
          {
            text: "Trong phản ứng hạt nhân, tổng khối lượng các hạt trước và sau phản ứng bằng nhau.",
            correctValue: false,
            explanation:
              "Sai. Khối lượng KHÔNG bảo toàn. Một phần khối lượng chuyển thành năng lượng (theo E = mc²). Tổng số khối A và tổng điện tích Z mới bảo toàn.",
          },
          {
            text: "Phản ứng phân hạch U-235 tỏa ra năng lượng vì các sản phẩm bền hơn U-235.",
            correctValue: true,
            explanation:
              "Đúng. Các mảnh phân hạch có Elkr lớn hơn (bền hơn) nên tổng năng lượng liên kết tăng; năng lượng tỏa ra = chênh lệch năng lượng liên kết.",
          },
          {
            text: "Nhiệt hạch cần điều kiện nhiệt độ thấp vì các hạt nhẹ dễ kết hợp hơn.",
            correctValue: false,
            explanation:
              "Sai. Nhiệt hạch cần nhiệt độ cực cao (≥ 10⁷ K) để các hạt nhân có đủ động năng vượt qua lực đẩy Coulomb (điện dương đẩy điện dương).",
          },
        ],
        correctAnswers: [false, true, false],
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
          "Ảnh buồng sương Blackett (Hình 22.2, SGK trang 96) cung cấp bằng chứng gì cho phản ứng ⁴He + ¹⁴N → ¹⁷O + ¹H? Mô tả đặc điểm hai vết xuất hiện sau điểm va chạm và giải thích tại sao chúng ứng với proton và hạt nhân oxy.",
        sampleAnswer:
          "Tại điểm va chạm, vết alpha bị gián đoạn và tách thành hai vết: (1) Vết dài, mảnh (ion hóa ít) → proton ¹H nhẹ và nhanh; (2) Vết ngắn, đậm (ion hóa mạnh) → hạt nhân ¹⁷O nặng hơn và chậm hơn. Hai vết này xác nhận sự xuất hiện của hai hạt mới, tức là phản ứng hạt nhân đã xảy ra.",
        keywords: ["vết dài", "vết ngắn", "proton", "oxygen", "va chạm"],
      },
      sort_order: 6,
      is_published: true,
    },
  ]);
}
