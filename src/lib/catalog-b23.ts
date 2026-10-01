import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Seed B23 catalog – "Bài 23. Hiện tượng phóng xạ"
 * SGK Vật lí 12 KNTT, trang 104–113.
 *
 * SGK evidence verified (rendered from scanned PDF):
 *  - Trang 104: Thí nghiệm Becquerel (tấm phim + dấu chữ thập), ảnh buồng sương uranium (Hình 23.1)
 *  - Trang 105: Bảng 23.1 (số tia phóng xạ trong 5s intervals: 1, 3, 2, 0, 3, 1), Hình 23.2 (Geiger-Müller)
 *  - Trang 105–106: Hình 23.3 (tia α, β⁻, β⁺, γ trong điện trường và từ trường)
 *  - Trang 106: Hình 23.4 (khả năng đâm xuyên: giấy, nhôm, chì)
 *  - Trang 107: Đồ thị Hình 23.5 (định luật phóng xạ N_t = N₀·2^(-t/T)); Bảng 23.2 (chu kì bán rã)
 *  - Trang 108: Độ phóng xạ H_t = λN_t; 1 Bq = 1 phân rã/giây; 1 Ci = 3,7·10¹⁰ Bq
 *  - Trang 110–111: An toàn bức xạ, biển cảnh báo, khoảng cách–che chắn–thời gian
 *  - Trang 111–113: Ứng dụng định tuổi C-14; ứng dụng đồng vị trong y học, nông nghiệp
 *
 * Bảng 23.1 gốc SGK (số tia phóng xạ mỗi 5 giây):
 * Khoảng: 0–5 | 5–10 | 10–15 | 15–20 | 20–25 | 25–30
 * Số tia:   1  |   3  |   2   |   0   |   3   |   1
 *
 * Bảng 23.2 gốc SGK (chu kì bán rã):
 * ¹⁴C: 5,7·10³ năm | ¹³¹I: 8,0 ngày | ¹⁵O: 1,2·10² giây
 * ²¹⁰Po: 1,4·10² ngày | ²²⁶Ra: 1,6·10³ năm | ²¹⁹Rn: 4,0 giây | ²³⁵U: 7,0·10⁸ năm
 */
export async function seedB23Catalog(
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
      title: "Video bài giảng: Hiện tượng phóng xạ (chưa có video)",
      description:
        "⚠️ Giáo viên cần tải video lên. Kịch bản đã soạn sẵn trong phần Hướng dẫn dưới đây.",
      instructions: `KỊCH BẢN VIDEO BÀI GIẢNG B23 – HIỆN TƯỢNG PHÓNG XẠ
(Thời lượng khuyến nghị: 12–15 phút)

[00:00 – 02:00] Câu chuyện Becquerel (1896)
• Becquerel bọc tấm kính ảnh trong vải đen (không ánh sáng thấu qua được), đặt cạnh quặng uranium.
• Sau vài ngày, tháo ra, tấm kính ảnh bị làm đen in hình dấu chữ thập.
• Câu hỏi: Điều gì có thể xuyên qua vải đen và làm đen phim? → Đó là tia phóng xạ.
• Phóng xạ: Hiện tượng hạt nhân không bền tự phát phóng ra tia và biến đổi.

[02:00 – 05:00] Tính tự phát và ngẫu nhiên
• Thí nghiệm Geiger-Müller: Đặt nguồn phóng xạ ²²⁰Rn → đếm tia trong 5 giây (lặp nhiều lần).
• Bảng số liệu SGK Bảng 23.1 (trang 105):
  Khoảng 0–5s: 1 tia; 5–10s: 3 tia; 10–15s: 2 tia; 15–20s: 0 tia; 20–25s: 3 tia; 25–30s: 1 tia
• Kết luận: Số tia trong cùng khoảng thời gian KHÔNG bằng nhau → mỗi hạt phân rã NGẪU NHIÊN.
• Nhưng số lượng lớn tuân theo quy luật thống kê → Định luật phóng xạ.

[05:00 – 09:00] Ba loại tia phóng xạ
• Tia alpha (α): Hạt nhân ⁴He; điện tích +2e; đi được vài cm trong không khí; bị giấy chặn.
  Phương trình: ᴬZX → ᴬ⁻⁴Z₋₂Y + ⁴He
• Tia beta trừ (β⁻): Electron ⁰₋₁e; hạt neutrino ν̄; đi được vài mm nhôm.
  Phương trình: ᴬZX → ᴬZ₊₁Y + ⁰₋₁e + ν̄
• Tia beta cộng (β⁺): Positron ⁰₊₁e; hạt neutrino ν; đi được vài mm nhôm.
  Phương trình: ᴬZX → ᴬZ₋₁Y + ⁰₊₁e + ν
• Tia gamma (γ): Bức xạ điện từ; không làm thay đổi Z, A; xuyên qua chì hàng cm.
  Phương trình: ᴬZX* → ᴬZX + γ

[09:00 – 12:00] Định luật phóng xạ và chu kì bán rã
• N_t = N₀ · 2^(-t/T) = N₀ · e^(-λt)   với T = chu kì bán rã, λ = hằng số phóng xạ = ln2/T
• Đồ thị Hình 23.5: Đường cong hàm mũ giảm; sau mỗi T, số hạt còn lại = N₀/2.
• Độ phóng xạ: H_t = λ·N_t   (đơn vị: Bq = 1 phân rã/s; 1 Ci = 3,7·10¹⁰ Bq)
• Bảng 23.2 (trang 108): ¹⁴C: 5730 năm; ²³⁵U: 7·10⁸ năm; ¹³¹I: 8 ngày; ²¹⁰Po: 140 ngày

[12:00 – 14:00] An toàn và ứng dụng
• Ba nguyên tắc: Khoảng cách – Che chắn – Thời gian phơi nhiễm tối thiểu.
• Biển cảnh báo phóng xạ quốc tế (trefoil màu vàng-đen).
• Ứng dụng định tuổi C-14: Sinh vật sống có tỉ lệ ¹⁴C/¹²C không đổi; sau khi chết, ¹⁴C giảm dần.`,
      duration_minutes: 14,
      is_published: false,
      sort_order: 1,
    })
    .select("id")
    .single();

  if (vpErr) {
    console.error("[seedB23Catalog] video placeholder insert failed:", vpErr.message);
    return;
  }

  if (videoPlaceholder) {
    await supabase.from("video_checkpoints").insert([
      {
        material_id: videoPlaceholder.id,
        checkpoint_percent: 40,
        question: "Theo Bảng 23.1 (SGK trang 105), tổng số tia được đếm trong 6 khoảng 5s liên tiếp là bao nhiêu?",
        option_a: "6",
        option_b: "10",
        option_c: "12",
        option_d: "18",
        correct_option: "B",
        sort_order: 0,
      },
      {
        material_id: videoPlaceholder.id,
        checkpoint_percent: 80,
        question: "Trong điện trường, tia nào KHÔNG bị lệch khỏi đường thẳng?",
        option_a: "Tia alpha (α)",
        option_b: "Tia beta trừ (β⁻)",
        option_c: "Tia gamma (γ)",
        option_d: "Tia beta cộng (β⁺)",
        correct_option: "C",
        sort_order: 1,
      },
    ]);
  }

  // Phiếu tự học chi tiết với bảng số liệu Geiger từ SGK
  await supabase.from("lesson_materials").insert({
    lesson_id: lessonId,
    teacher_id: teacherId,
    phase: "before_class",
    material_type: "worksheet",
    title: "Phiếu tự học – Hiện tượng phóng xạ (đọc bằng chứng Becquerel và Geiger)",
    description:
      "Đọc SGK trang 104–111 và hoàn thành phiếu. Đặc biệt chú ý Bảng 23.1 và Hình 23.3, 23.4.",
    instructions: `PHIẾU HƯỚNG DẪN TỰ HỌC B23 – HIỆN TƯỢNG PHÓNG XẠ
(SGK trang 104–113, Kết nối tri thức với cuộc sống)

MỤC TIÊU – Sau khi hoàn thành phiếu này em có thể:
□ Giải thích thí nghiệm Becquerel 1896 và nêu ý nghĩa.
□ Mô tả thí nghiệm Geiger-Müller và dùng bảng số liệu nhận ra tính ngẫu nhiên.
□ So sánh tia α, β⁻, β⁺, γ về bản chất, điện tích, khả năng đâm xuyên.
□ Nêu công thức định luật phóng xạ và giải thích chu kì bán rã.
□ Giải thích ba nguyên tắc an toàn phóng xạ.

──────────────────────────────────────────────────
PHẦN 1 – BẰNG CHỨNG BECQUEREL (trang 104, Hình 23.1)

Câu 1: Becquerel bọc tấm kính ảnh trong vải đen rồi đặt cạnh quặng uranium trong nhiều ngày. Kết quả: Tấm kính ảnh bị làm _____ (sáng lên / tối lại) dưới hình dấu chữ thập.

Câu 2: Điều gì đã xuyên qua vải đen đến làm đen tấm kính ảnh? (Tick vào đáp án)
□ Ánh sáng nhìn thấy □ Tia X □ Tia phóng xạ từ uranium □ Hơi nước

Câu 3: Phóng xạ có phụ thuộc vào điều kiện bên ngoài không (nhiệt độ, áp suất, trạng thái hóa học)?
□ Có, vì là phản ứng hóa học.  □ Không, vì là quá trình hạt nhân tự phát.
Giải thích: _____________________________________________

──────────────────────────────────────────────────
PHẦN 2 – BẢO ĐẢM SỐ LIỆU TỪ SGK (trang 105, Bảng 23.1)

Bảng 23.1 – Kết quả thí nghiệm Geiger-Müller đếm tia phóng xạ trong các khoảng 5s:

| Khoảng thời gian (s) | 0–5 | 5–10 | 10–15 | 15–20 | 20–25 | 25–30 |
|----------------------|-----|------|-------|-------|-------|-------|
| Số tia phóng xạ      |  1  |   3  |   2   |   0   |   3   |   1   |

Câu 4: Tính tổng số tia đếm được trong 30 giây: _________
Câu 5: Số tia trung bình mỗi 5 giây: _________ tia/5s
Câu 6: Số tia trong khoảng 15–20s là bao nhiêu? ___ Điều này có nghĩa là gì?
Câu 7: Dựa vào Bảng 23.1, các số đếm khác nhau giữa các khoảng bằng nhau chứng tỏ điều gì về bản chất của quá trình phóng xạ?
→ Kết luận: _____________________________________________

──────────────────────────────────────────────────
PHẦN 3 – SO SÁNH CÁC TIA PHÓNG XẠ (trang 105–106, Hình 23.3, 23.4)

Hoàn thành bảng so sánh (dựa vào Hình 23.3 và 23.4 trong SGK):

| Tia   | Bản chất       | Điện tích | Trong điện trường | Xuyên qua | Bị chặn bởi |
|-------|----------------|-----------|-------------------|-----------|-------------|
| α     | Hạt nhân ⁴He   | +2e       |                   |           | Giấy        |
| β⁻    |                | −e        | Lệch về phía +    |           |             |
| β⁺    |                | +e        |                   |           |             |
| γ     |                | 0         | Không lệch        | Qua giấy, nhôm | Chì (vài cm)|

Câu 8: Trong điện trường (tấm + ở trên, − ở dưới), tia α lệch về phía nào? Tại sao?
Câu 9: Tia γ không bị lệch trong điện trường vì _____________

──────────────────────────────────────────────────
PHẦN 4 – ĐỊNH LUẬT PHÓNG XẠ (trang 107, Hình 23.5)

Công thức: N_t = N₀ · 2^(−t/T)   hay   N_t = N₀ · e^(−λt)
với: T = chu kì bán rã; λ = hằng số phóng xạ = ln2/T ≈ 0,693/T

Câu 10: Sau thời gian t = 3T, số hạt nhân còn lại là:
N = N₀ · 2^(−3T/T) = N₀ · 2^(−3) = N₀ / ___

Câu 11: Chu kì bán rã của ¹⁴C là 5730 năm. Sau 11460 năm, tỉ lệ ¹⁴C còn lại:
t = 11460 = 2 × 5730 = 2T → N = N₀/2² = N₀/4 → tỉ lệ còn lại = ___ %

Câu 12: Từ Bảng 23.2 SGK (trang 108), ghi chu kì bán rã của 3 đồng vị:
| Đồng vị | Chu kì bán rã | Ứng dụng phù hợp |
|---------|---------------|------------------|
| ¹⁴C     | 5730 năm      | Định tuổi cổ vật |
| ¹³¹I    |               |                  |
| ²³⁵U    |               |                  |

──────────────────────────────────────────────────
PHẦN 5 – AN TOÀN BỨC XẠ (trang 110–111)

Câu 13: Ba nguyên tắc an toàn khi làm việc gần nguồn phóng xạ là:
1. __________ (tránh đứng gần nguồn)
2. __________ (dùng tấm chì, bê tông)
3. __________ (hạn chế thời gian tiếp xúc)

Câu 14: Biển cảnh báo phóng xạ quốc tế có màu ____ và ____. 
Em sẽ làm gì nếu thấy biển này ở cổng một cơ sở?`,
    is_published: true,
    sort_order: 2,
  });

  // Phase 1 final questions
  await supabase.from("phase_final_questions").insert([
    {
      lesson_id: lessonId,
      phase: "before_class",
      question_text:
        "Theo Bảng 23.1 SGK trang 105, trong khoảng thời gian 15–20s, số tia phóng xạ đếm được là bao nhiêu? Điều này nói lên điều gì về tính chất phóng xạ?",
      correct_answer: "0 tia; điều này cho thấy quá trình phóng xạ là ngẫu nhiên",
      sort_order: 1,
    },
    {
      lesson_id: lessonId,
      phase: "before_class",
      question_text:
        "Tia nào trong số α, β, γ có khả năng đâm xuyên mạnh nhất và KHÔNG bị lệch trong điện trường?",
      correct_answer: "Gamma",
      sort_order: 2,
    },
  ]);

  // ── Phase 2: Trong giờ học ────────────────────────────────────────────────
  await supabase.from("lesson_materials").insert({
    lesson_id: lessonId,
    teacher_id: teacherId,
    phase: "in_class",
    material_type: "worksheet",
    title: "Phiếu thực hành – Đếm Geiger, vẽ đồ thị phân rã, định tuổi C-14",
    description:
      "Dùng mô phỏng Geiger, công cụ đồ thị và máy tính để tự rút ra định luật phóng xạ và ứng dụng.",
    instructions: `PHIẾU THỰC HÀNH B23 – TRONG GIỜ HỌC

──────────────────────────────────────────────────
HOẠT ĐỘNG 1 – MÔ PHỎNG MÁY ĐẾM GEIGER (10 phút)

Câu hỏi ban đầu: Nếu ta đếm số tia phóng xạ trong nhiều khoảng thời gian bằng nhau, kết quả có luôn như nhau không?
Dự đoán: □ Có, vì tốc độ phóng xạ không đổi.  □ Không, vì mỗi hạt nhân phân rã ngẫu nhiên.

Thao tác: Nhấn "Bắt đầu đếm (10s)" nhiều lần và ghi vào bảng:

| Lần đếm | Số tia đếm được |
|---------|----------------|
| 1       |                |
| 2       |                |
| 3       |                |
| 4       |                |
| 5       |                |
| TB      |                |

Câu hỏi phân tích:
1. Các giá trị trong bảng có như nhau không? ___
2. Kết quả có dao động quanh một giá trị trung bình không? ___
3. KẾT LUẬN về tính ngẫu nhiên: ___________________________________________

So sánh với Bảng 23.1 SGK (0–5s: 1; 5–10s: 3; 10–15s: 2; 15–20s: 0; 20–25s: 3; 25–30s: 1):
Bảng SGK có dữ liệu tương tự không? ___  Điểm giống: _______  Điểm khác: _______

──────────────────────────────────────────────────
HOẠT ĐỘNG 2 – VẼ ĐỒ THỊ PHÂN RÃ VÀ XÁC ĐỊNH CHU KÌ BÁN RÃ (12 phút)

Dùng công cụ đồ thị, điền dữ liệu bên dưới và vẽ N(t) theo t:

Giả sử ban đầu N₀ = 1000 hạt nhân, T = 2 giờ:

| t (giờ) | t/T | N_t = 1000 × 2^(-t/T) | H_t = λ × N_t (λ = 0,693/T) |
|---------|-----|-----------------------|-----------------------------|
| 0       | 0   | 1000                  |                             |
| 2       | 1   | 500                   |                             |
| 4       | 2   |                       |                             |
| 6       | 3   |                       |                             |
| 8       | 4   |                       |                             |
| 10      | 5   |                       |                             |

Câu hỏi:
a) Vẽ đường cong N(t) theo t. Hình dạng đường cong là gì? _______________
b) Từ đồ thị, xác định T bằng cách đọc: Tại t = ___h, N giảm còn ___
c) Nếu T = 8 ngày, sau 24 ngày còn lại bao nhiêu % số hạt ban đầu? ___

──────────────────────────────────────────────────
HOẠT ĐỘNG 3 – INFOGRAPHIC TIA PHÓNG XẠ (8 phút)

Quan sát mô phỏng tia α, β, γ trong điện trường và qua vật cản:

Kết quả quan sát (điền vào bảng):
| Tia | Lệch về phía cực (+) | Lệch về phía cực (−) | Không lệch | Xuyên giấy | Xuyên nhôm 1mm | Xuyên chì 10cm |
|-----|----------------------|----------------------|------------|------------|----------------|----------------|
| α   |                      |                      |            |            |                |                |
| β⁻  |                      |                      |            |            |                |                |
| γ   |                      |                      |            |            |                |                |

Câu hỏi ứng dụng:
1. Để bảo vệ khỏi tia alpha, em dùng vật liệu gì? ___
2. Để bảo vệ khỏi tia gamma, em cần vật liệu gì và bề dày khoảng bao nhiêu? ___
3. Viết phương trình phân rã alpha của ²³⁵U: ²³⁵₉₂U → ___

──────────────────────────────────────────────────
HOẠT ĐỘNG 4 – ĐỊNH TUỔI BẰNG CARBON-14 (10 phút)

Nguyên tắc: Sinh vật sống luôn hấp thụ C-14 từ không khí nên tỉ lệ ¹⁴C/¹²C không đổi.
Sau khi chết, không hấp thụ C-14 mới, nên ¹⁴C giảm theo T = 5730 năm.

Bài toán: Mẫu gỗ cổ có độ phóng xạ C-14 bằng 1/4 mẫu gỗ tươi cùng khối lượng.
H_t = H₀ · 2^(-t/T) = H₀/4 → 2^(-t/T) = 1/4 = 2^(-2) → t/T = 2 → t = 2T = 2 × 5730 = _____ năm

Trong mô phỏng: Điều chỉnh thanh "Tỉ lệ còn lại" và đọc tuổi ước tính. Ghi kết quả:
Tỉ lệ ¹⁴C còn lại | Tuổi ước tính
25%              | _______________
12,5%            | _______________
6,25%            | _______________

Giới hạn của phương pháp C-14: Với mẫu vật hơn _____ năm tuổi, phương pháp này kém chính xác.`,
    is_published: true,
    sort_order: 1,
  });

  // Phase 2 final questions
  await supabase.from("phase_final_questions").insert([
    {
      lesson_id: lessonId,
      phase: "in_class",
      question_text:
        "Chất phóng xạ ²²⁶Ra có chu kì bán rã T = 1600 năm và độ phóng xạ ban đầu H₀. Sau 3200 năm, độ phóng xạ còn lại là bao nhiêu H₀?",
      correct_answer: "H₀/4",
      sort_order: 1,
    },
    {
      lesson_id: lessonId,
      phase: "in_class",
      question_text:
        "Theo nguyên tắc an toàn phóng xạ, nếu không có vật che chắn, biện pháp đơn giản nhất để giảm phơi nhiễm là tăng đại lượng vật lí nào giữa cơ thể và nguồn?",
      correct_answer: "Khoảng cách",
      sort_order: 2,
    },
  ]);

  // ── Phase 3: Sau giờ học ──────────────────────────────────────────────────
  await supabase.from("lesson_materials").insert({
    lesson_id: lessonId,
    teacher_id: teacherId,
    phase: "after_class",
    material_type: "worksheet",
    title: "Phiếu bài tập B23 – Hiện tượng phóng xạ (xem/in trực tiếp)",
    description:
      "Bài tập ôn tập và vận dụng kiến thức phóng xạ. Em có thể in trang bằng Ctrl+P / Cmd+P.",
    instructions: `PHIẾU BÀI TẬP B23 – HIỆN TƯỢNG PHÓNG XẠ
Họ và tên: _________________________ Lớp: _______

──────────────────────────────────────────────────
I. HƯỚNG DẪN CHUNG

Bài tập Nhận biết–Thông hiểu: Áp dụng trực tiếp định nghĩa, công thức.
Bài tập Vận dụng: Kết hợp nhiều công thức, phân tích và lập luận.
Bài tập Vận dụng cao: Tình huống thực tiễn, nhiều bước tính, cần phê bình nhận định.

Công thức cần nhớ:
• N_t = N₀ · 2^(−t/T) = N₀ · e^(−λt)   (T = chu kì bán rã)
• H_t = λ · N_t   với λ = ln2/T ≈ 0,693/T
• 1 Bq = 1 phân rã/giây; 1 Ci = 3,7 × 10¹⁰ Bq

──────────────────────────────────────────────────
II. BÀI TẬP TỰ LUẬN (theo SGK Bài 25, tr.119–122)

Bài 1 (Nhận biết): Hoàn thành bảng so sánh các tia phóng xạ:
| Tia | Bản chất  | Điện tích | Đâm xuyên | Bị chặn bởi |
|-----|-----------|-----------|-----------|-------------|
| α   |           |           |           |             |
| β⁻  |           |           |           |             |
| β⁺  |           |           |           |             |
| γ   |           |           |           |             |

Bài 2 (Thông hiểu): Viết phương trình phân rã cho:
a) Phân rã α của ²³⁸₉₂U
b) Phân rã β⁻ của ¹⁴₆C (Carbon-14)
c) Phân rã β⁺ của ¹⁸₉F (Fluorine-18, dùng trong PET)

Bài 3 (Vận dụng – Định tuổi C-14):
Mẫu xương cổ có độ phóng xạ ¹⁴C bằng 1/8 độ phóng xạ của xương người sống cùng khối lượng.
Biết T(¹⁴C) = 5730 năm. Tính tuổi mẫu xương.
(Gợi ý: H_t/H₀ = 1/8 = 2^(-3) → t = 3T)

Bài 4 (Vận dụng – Máy xạ trị, bài ví dụ 3 SGK trang 120):
Máy xạ trị dùng nguồn ⁶⁰₂₇Co có T = 5,3 năm. Máy cần bảo dưỡng khi độ phóng xạ giảm 7% và thay nguồn khi giảm 50%.
a) Tính chu kì bảo dưỡng (khi H_t = 0,93 H₀).
b) Tính thời gian hoạt động đến lần thay nguồn đầu tiên (khi H_t = 0,5 H₀ = H₀/2).
Lưu ý: Dùng công thức t = T · log₂(H₀/H_t)

Bài 5 (Vận dụng cao – Phân tích an toàn bức xạ):
Thảo luận: "Tia gamma nguy hiểm hơn tia alpha vì nó có thể đâm xuyên cơ thể. Tuy nhiên, tia alpha lại nguy hiểm hơn khi nguồn phát ở bên TRONG cơ thể."
a) Hãy giải thích tại sao mỗi nhận định trên đúng.
b) Khi nuốt phải một nguồn alpha yếu (ví dụ poloni-210), nguồn này nguy hiểm ở mức độ nào?
   Gợi ý: Trong cơ thể, không có lớp giấy/da bảo vệ; tia alpha ion hóa mô sống rất mạnh.

──────────────────────────────────────────────────
III. CÂU HỎI TỰ KIỂM TRA (xem đáp án sau khi hoàn thành)

1. Phóng xạ có phụ thuộc vào nhiệt độ không? → Không – đây là quá trình hạt nhân.
2. Sau 2T, N còn lại bao nhiêu % N₀? → 25%
3. Chu kì bán rã ¹⁴C là bao nhiêu? → 5730 năm (từ Bảng 23.2 SGK)
4. Tia nào KHÔNG mang điện? → Tia gamma`,
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
        prompt: "Theo Bảng 23.1 (SGK trang 105), tổng số tia phóng xạ đếm được trong 30 giây là:",
        options: ["5", "8", "10", "12"],
        correctAnswer: "10",
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
          "Định luật phóng xạ N_t = N₀ · 2^(−t/T) cho biết điều gì khi t = T?",
        options: [
          "Số hạt nhân còn lại bằng N₀.",
          "Số hạt nhân còn lại bằng N₀/2 (giảm một nửa).",
          "Tất cả hạt nhân đã phân rã.",
          "Chu kì bán rã tăng gấp đôi.",
        ],
        correctAnswer: "Số hạt nhân còn lại bằng N₀/2 (giảm một nửa).",
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
          "Chất phóng xạ có chu kì bán rã T = 8 ngày. Sau 24 ngày, tỉ lệ phần trăm số hạt nhân CHƯA phân rã so với ban đầu là:",
        options: ["12,5%", "25%", "33,3%", "87,5%"],
        correctAnswer: "12,5%",
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
          "Mẫu gỗ cổ có độ phóng xạ ¹⁴C bằng 1/4 độ phóng xạ của mẫu gỗ tươi cùng khối lượng. Biết T(¹⁴C) = 5730 năm. Tuổi của mẫu gỗ cổ là:",
        options: ["2865 năm.", "5730 năm.", "11460 năm.", "17190 năm."],
        correctAnswer: "11460 năm.",
      },
      sort_order: 4,
      is_published: true,
    },
    {
      lesson_id: lessonId,
      question_type: "true_false",
      difficulty: "thong_hieu",
      content: {
        prompt: "Đánh dấu Đúng (Đ) hoặc Sai (S) về đặc điểm các tia phóng xạ:",
        statements: [
          {
            text: "Tia alpha là hạt nhân ⁴He mang điện tích +2e.",
            correctValue: true,
            explanation:
              "Đúng. Tia α = hạt nhân Helium-4 (2p + 2n), điện tích +2e.",
          },
          {
            text: "Tia gamma bị lệch về phía cực dương trong điện trường.",
            correctValue: false,
            explanation:
              "Sai. Tia γ là sóng điện từ, không mang điện nên KHÔNG bị lệch trong điện trường hoặc từ trường.",
          },
          {
            text: "Phóng xạ là quá trình ngẫu nhiên: không thể dự đoán chính xác thời điểm một hạt nhân cụ thể sẽ phân rã.",
            correctValue: true,
            explanation:
              "Đúng. Đây là tính ngẫu nhiên của phóng xạ – đặc trưng cơ bản đã được xác nhận qua thí nghiệm Geiger-Müller (Bảng 23.1 SGK).",
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
          "Thí nghiệm Becquerel năm 1896 cung cấp bằng chứng gì về tính tự phát của phóng xạ? Tại sao thí nghiệm này chứng minh phóng xạ KHÔNG phụ thuộc vào các điều kiện bên ngoài như ánh sáng hay nhiệt độ?",
        sampleAnswer:
          "Becquerel bọc tấm kính ảnh trong vải đen (không ánh sáng) và để trong tối. Kính ảnh vẫn bị làm đen do tia từ uranium → tia phóng xạ xuất phát không cần ánh sáng kích thích. Phóng xạ xảy ra liên tục ở điều kiện phòng bình thường → không phụ thuộc nhiệt độ, áp suất hay trạng thái hóa học của vật chứa uranium.",
        keywords: ["vải đen", "tự phát", "không ánh sáng", "không phụ thuộc", "hạt nhân"],
      },
      sort_order: 6,
      is_published: true,
    },
  ]);
}
