import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Seed B24 catalog – "Bài 24. Công nghiệp hạt nhân"
 * SGK Vật lí 12 KNTT, trang 114–118.
 *
 * SGK evidence verified (rendered from scanned PDF):
 *  - Trang 114: Hình 24.1 – Sơ đồ nhà máy điện hạt nhân (lò phản ứng → chất tải nhiệt
 *    → bộ sinh hơi → tuabin → máy phát → lưới điện). Hai chu trình: sơ cấp và thứ cấp.
 *  - Trang 115: Hình 24.2 – Thiết bị lưu trữ nhiên liệu hạt nhân đã qua sử dụng.
 *    Hình 24.3 – Sơ đồ mặt cắt lò phản ứng neutron nhiệt (8 bộ phận: thanh nhiên liệu,
 *    chất làm chậm neutron, vỏ kim loại, lớp tán xạ neutron bằng than chì, ống làm lạnh,
 *    thanh điều khiển hấp thụ neutron, thành bảo vệ phóng xạ, ống thí nghiệm).
 *    SGK nêu rõ: Thanh điều khiển chứa Bo hay Cd để k = 1.
 *  - Trang 115 (Hoạt động SGK): "Tại sao nhà máy điện hạt nhân đặt cạnh sông/biển?"
 *    và "Liệt kê nguy cơ ảnh hưởng nếu sự cố lò phản ứng".
 *  - Trang 116: Hình 24.4 – Hệ thống PET tại bệnh viện 19-8, Hà Nội.
 *    Y học hạt nhân: chất đánh dấu phóng xạ (FDG/¹⁸F trong PET), SPECT.
 *    Điều trị: dược chất phóng xạ (Xofigo – ²²³Ra, Lutathe – ¹⁷⁷Lu) và máy xạ trị.
 *  - Trang 117: Hình 24.5 – Vải thiều chiếu xạ (a) và không chiếu xạ (b) sau 7 ngày.
 *    Ứng dụng ³²P (β) trong nghiên cứu phân bón, sinh học.
 *    Đột biến gene bằng chiếu xạ (cây trồng biến đổi gene).
 */
export async function seedB24Catalog(
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
      title: "Video bài giảng: Công nghiệp hạt nhân (chưa có video)",
      description:
        "⚠️ Giáo viên cần tải video lên. Kịch bản đã soạn sẵn trong phần Hướng dẫn dưới đây.",
      instructions: `KỊCH BẢN VIDEO BÀI GIẢNG B24 – CÔNG NGHIỆP HẠT NHÂN
(Thời lượng khuyến nghị: 10–12 phút)

[00:00 – 03:00] Nhà máy điện hạt nhân hoạt động thế nào?
• Trung tâm là lò phản ứng hạt nhân với nhiên liệu ²³⁵U.
• Phân hạch liên tục (k = 1) → nhiệt năng → đun nước → hơi nước áp suất cao.
• Hơi nước → tuabin → máy phát điện → lưới điện.
• Hai chu trình riêng biệt (Hình 24.1): Chu trình sơ cấp (nước/chất tải nhiệt nóng)
  và chu trình thứ cấp (nước → hơi → quay tuabin).
• Tại sao phải hai chu trình? → Để không để nước nhiễm xạ tiếp xúc với tuabin và môi trường.

[03:00 – 05:30] Kiểm soát lò phản ứng – Thanh điều khiển
• Thanh điều khiển chứa Bo (B) hoặc Cadimi (Cd) – các chất hấp thụ neutron nhiệt rất hiệu quả.
• Cắm sâu thanh → hấp thụ nhiều neutron → k giảm xuống dưới 1 → phản ứng tắt dần.
• Rút thanh ra → ít hấp thụ neutron hơn → k tăng lên → công suất tăng.
• Mục tiêu vận hành: Duy trì k = 1 (phản ứng dây chuyền ổn định, không bùng nổ, không tắt).

[05:30 – 08:30] Y học hạt nhân – Chẩn đoán và điều trị
• Chẩn đoán: Tiêm chất đánh dấu phóng xạ vào cơ thể. Thiết bị ghi nhận tia từ chất đánh dấu.
  - SPECT: Dùng đồng vị phát tia gamma (ví dụ: ⁹⁹ᵐTc).
  - PET: Dùng đồng vị phát positron, ví dụ ¹⁸F-FDG → đường glucose → vùng chuyển hóa mạnh (khối u).
  - Hình 24.4: Hệ thống PET tại bệnh viện 19-8, Hà Nội.
• Điều trị: Xofigo (²²³Ra), Lutathe (¹⁷⁷Lu) tập trung ở khối u → phát tia tiêu diệt tế bào ung thư.
• Máy xạ trị: Chiếu tia từ bên ngoài vào mô ung thư.

[08:30 – 10:30] Ứng dụng khác và Vấn đề chất thải
• Nông nghiệp (Hình 24.5): Chiếu xạ thực phẩm giúp bảo quản; vải thiều chiếu xạ giữ tươi lâu hơn.
• Sinh học: Đánh dấu đồng vị ³²P để theo dõi đường đi phân bón trong cây.
• Đột biến gene bằng chiếu xạ → tạo giống mới năng suất cao.
• THÁCH THỨC: Chất thải hạt nhân chứa đồng vị có T rất dài (ví dụ ⁹⁰Sr, ¹³⁷Cs ~ 30 năm).
  Cần lưu trữ hàng trăm năm. Chi phí và kỹ thuật cao.`,
      duration_minutes: 11,
      is_published: false,
      sort_order: 1,
    })
    .select("id")
    .single();

  if (vpErr) {
    console.error("[seedB24Catalog] video placeholder insert failed:", vpErr.message);
    return;
  }

  if (videoPlaceholder) {
    await supabase.from("video_checkpoints").insert([
      {
        material_id: videoPlaceholder.id,
        checkpoint_percent: 40,
        question: "Trong lò phản ứng hạt nhân (Hình 24.3 SGK), thanh điều khiển chứa chất gì để hấp thụ neutron?",
        option_a: "Uranium-235.",
        option_b: "Nước thường.",
        option_c: "Bo (B) hoặc Cadimi (Cd).",
        option_d: "Graphite (than chì).",
        correct_option: "C",
        sort_order: 0,
      },
      {
        material_id: videoPlaceholder.id,
        checkpoint_percent: 75,
        question: "Trong chụp ảnh PET, đồng vị ¹⁸F-FDG được tiêm vào cơ thể. Thiết bị PET ghi nhận dạng bức xạ nào?",
        option_a: "Tia alpha phát ra trực tiếp từ ¹⁸F.",
        option_b: "Hai tia gamma phát ra ngược chiều từ phản hủy e⁺–e⁻.",
        option_c: "Tia X phát ra khi ¹⁸F phân rã.",
        option_d: "Tia neutron từ phản ứng hạt nhân.",
        correct_option: "B",
        sort_order: 1,
      },
    ]);
  }

  // Phiếu tự học trước giờ học
  await supabase.from("lesson_materials").insert({
    lesson_id: lessonId,
    teacher_id: teacherId,
    phase: "before_class",
    material_type: "worksheet",
    title: "Phiếu tự học – Nhà máy điện hạt nhân và Y học hạt nhân",
    description:
      "Đọc SGK trang 114–118, quan sát Hình 24.1, 24.3 và 24.4 rồi hoàn thành phiếu.",
    instructions: `PHIẾU HƯỚNG DẪN TỰ HỌC B24 – CÔNG NGHIỆP HẠT NHÂN
(SGK trang 114–118)

MỤC TIÊU – Sau khi hoàn thành phần này em có thể:
□ Mô tả chuỗi chuyển hóa năng lượng trong nhà máy điện hạt nhân theo Hình 24.1.
□ Giải thích vai trò thanh điều khiển trong lò phản ứng (từ Hình 24.3 SGK).
□ Nêu nguyên tắc của PET và SPECT trong y học hạt nhân.
□ Liệt kê ít nhất 2 ứng dụng đồng vị phóng xạ ngoài sản xuất điện.
□ Trình bày ít nhất 1 thách thức về chất thải/an toàn của công nghiệp hạt nhân.

──────────────────────────────────────────────────
PHẦN 1 – SƠ ĐỒ NHÀ MÁY ĐIỆN HẠT NHÂN (Hình 24.1, trang 114)

Quan sát Hình 24.1, điền vào ô trống theo mũi tên chuyển hóa năng lượng:

Lò phản ứng (phân hạch) → [1] _______ năng → Bộ sinh hơi → [2] _______ → Tuabin → [3] _______ → Máy phát điện → [4] _______ năng

Câu 1: Hai chu trình tách biệt (sơ cấp và thứ cấp) có ý nghĩa gì về mặt an toàn?
→ _____________________________________________________________

Câu 2: (Từ Hoạt động SGK trang 115) Tại sao nhà máy điện hạt nhân thường được xây dựng cạnh hồ, sông hoặc bờ biển?
→ _____________________________________________________________

──────────────────────────────────────────────────
PHẦN 2 – LÒ PHẢN ỨNG HẠT NHÂN (Hình 24.3, trang 115)

Hình 24.3 SGK có 8 bộ phận được đánh số. Khớp số thứ tự với chức năng:
(1) Thanh nhiên liệu ²³⁵U   → Nhiên liệu phân hạch
(2) Chất làm chậm neutron  → _________________________________
(6) Thanh điều khiển       → _________________________________

Câu 3: Khi cắm sâu thanh điều khiển vào lõi lò, công suất lò thay đổi thế nào? Giải thích theo hệ số nhân k.
→ _____________________________________________________________

──────────────────────────────────────────────────
PHẦN 3 – Y HỌC HẠT NHÂN (trang 116, Hình 24.4)

Câu 4: PET và SPECT khác nhau ở chỗ nào về loại đồng vị sử dụng?
(Gợi ý: PET dùng đồng vị phát _____; SPECT dùng đồng vị phát _____)

Câu 5: Tại sao ¹⁸F-FDG (đường glucose chứa ¹⁸F) tụ lại ở vùng khối u?
(Gợi ý: Tế bào ung thư có tốc độ chuyển hóa đường ___ hơn tế bào bình thường)

Câu 6: Kể tên một loại thuốc điều trị ung thư có chứa đồng vị phóng xạ được nhắc đến trong SGK trang 117:
→ Tên thuốc: _______, đồng vị: _______

──────────────────────────────────────────────────
PHẦN 4 – ỨNG DỤNG VÀ THÁCH THỨC

Câu 7: Vải thiều chiếu xạ (Hình 24.5, trang 117) được bảo quản tốt hơn. Tại sao chiếu xạ giúp bảo quản thực phẩm?
→ _____________________________________________________________

Câu 8: Liệt kê 2 vấn đề lớn trong quản lí chất thải hạt nhân:
1. ___________________________________________________________
2. ___________________________________________________________`,
    is_published: true,
    sort_order: 2,
  });

  // Phase 1 final questions
  await supabase.from("phase_final_questions").insert([
    {
      lesson_id: lessonId,
      phase: "before_class",
      question_text:
        "Trong lò phản ứng hạt nhân, thành phần nào dùng để hấp thụ bớt neutron và duy trì hệ số nhân k = 1?",
      correct_answer: "Thanh điều khiển",
      sort_order: 1,
    },
    {
      lesson_id: lessonId,
      phase: "before_class",
      question_text:
        "Trong PET (Positron Emission Tomography), thiết bị ghi nhận bức xạ gì phát ra từ cơ thể?",
      correct_answer: "Tia gamma",
      sort_order: 2,
    },
  ]);

  // ── Phase 2: Trong giờ học ────────────────────────────────────────────────
  await supabase.from("lesson_materials").insert({
    lesson_id: lessonId,
    teacher_id: teacherId,
    phase: "in_class",
    material_type: "worksheet",
    title: "Phiếu thực hành – Sơ đồ nhà máy, đọc PET scan, tranh luận đa quan điểm",
    description:
      "Dùng sơ đồ tương tác và tình huống thực để phân tích lợi ích và thách thức của công nghiệp hạt nhân.",
    instructions: `PHIẾU THỰC HÀNH B24 – TRONG GIỜ HỌC

──────────────────────────────────────────────────
HOẠT ĐỘNG 1 – SƠ ĐỒ NĂNG LƯỢNG NHÀ MÁY ĐIỆN HẠT NHÂN (8 phút)

Quan sát mô phỏng dòng năng lượng và điều chỉnh mức thanh điều khiển (0–100%):

| Mức thanh điều khiển cắm vào | Hệ số k (ước tính) | Nhiệt độ lõi lò | Công suất phát điện |
|------------------------------|-------------------|-----------------|---------------------|
| 0% (hoàn toàn rút ra)        | k > 1             |                 |                     |
| 50% (bình thường)            | k = 1             |                 |                     |
| 100% (cắm sâu nhất)          | k < 1             |                 |                     |

Câu hỏi:
1. Tại sao k = 1 là điều kiện vận hành ổn định? _______________
2. Khi xảy ra sự cố mất điện, lò phản ứng tự động cắm sâu thanh điều khiển (vì lò dùng điện để rút thanh). Điều đó có ý nghĩa gì về an toàn? _______________

──────────────────────────────────────────────────
HOẠT ĐỘNG 2 – ĐỌC KẾT QUẢ PET SCAN (8 phút) [Ứng dụng y học hạt nhân – SGK trang 116]

Tình huống: Bệnh nhân A được tiêm ¹⁸F-FDG và chụp PET. Kết quả hiển thị vùng sáng tập trung ở thuỳ phải của gan.

Câu hỏi:
1. Vùng sáng trong ảnh PET đại diện cho điều gì? _______________
   (Gợi ý: FDG = glucose đánh dấu ¹⁸F; vùng nào tiêu thụ nhiều glucose thì sáng nhiều)
2. Vùng sáng bất thường ở gan gợi ý chẩn đoán gì? _______________
3. Ưu điểm của PET so với chụp X-quang thông thường trong phát hiện ung thư sớm?
   _______________________________________________________________
4. Tại sao không thể dùng ²³⁸U (T = 4,5 tỉ năm) thay ¹⁸F (T = 110 phút) trong PET?
   _______________________________________________________________

──────────────────────────────────────────────────
HOẠT ĐỘNG 3 – THẢO LUẬN ĐA QUAN ĐIỂM: "Có nên xây nhà máy điện hạt nhân tại Việt Nam?" (15 phút)

CÁC VAI DIỄN (mỗi nhóm 3–4 người đóng 1 vai):

VAI A – NHÀ KHOA HỌC VÀ KỸ SƯ HẠT NHÂN:
Lập luận ủng hộ bằng dữ liệu:
• Nhà máy điện hạt nhân phát thải CO₂ gần bằng 0 trong vận hành.
• Công suất ổn định 24/7, không phụ thuộc thời tiết như năng lượng tái tạo.
• Công nghệ lò thế hệ 3+ và 4 có các hệ thống an toàn thụ động (không cần điện).
Phản biện cần chuẩn bị: "Nếu xảy ra sự cố như Chernobyl, Fukushima?"

VAI B – ĐẠI DIỆN CƯ DÂN ĐỊA PHƯƠNG:
Câu hỏi và lo ngại hợp lý:
• "Nhà máy xây cạnh làng tôi, nếu rò rỉ thì sao?"
• "Chất thải phóng xạ lưu trữ ở đâu, trong bao lâu?"
• "Tôi có được thông báo khi có sự cố không?"
Yêu cầu cần nêu: Cần minh bạch, có kế hoạch sơ tán, bồi thường rõ ràng.

VAI C – NHÀ KINH TẾ VÀ HOẠCH ĐỊNH CHÍNH SÁCH:
Phân tích chi phí-lợi ích:
• Chi phí xây dựng nhà máy hạt nhân rất cao (~5–10 tỉ USD/GW).
• Nhưng chi phí vận hành thấp hơn, tuổi thọ 40–60 năm.
• So sánh với giá điện than, điện khí, điện mặt trời.
• Vấn đề phụ thuộc công nghệ nước ngoài (Nga, Pháp, Nhật).

VAI D – ĐẠI DIỆN MÔI TRƯỜNG:
• Lợi thế: Ít khí nhà kính, không gây biến đổi khí hậu.
• Thách thức: Chất thải phóng xạ có chu kì bán rã dài; tác động đến hệ sinh thái biển nếu xây ven biển.

SAU THẢO LUẬN (tổng hợp nhóm):
1. Mỗi vai nêu 1 lập luận quan trọng nhất: _______________________________
2. Nhóm đạt được điểm đồng thuận nào không? ___________________________
3. Điều gì cần làm trước khi quyết định xây hay không xây? ________________`,
    is_published: true,
    sort_order: 1,
  });

  // Phase 2 final questions
  await supabase.from("phase_final_questions").insert([
    {
      lesson_id: lessonId,
      phase: "in_class",
      question_text:
        "Kĩ thuật PET sử dụng đồng vị phóng xạ trong lĩnh vực nào và đồng vị đó cần có đặc điểm gì về chu kì bán rã để an toàn cho bệnh nhân?",
      correct_answer: "Y học; chu kì bán rã ngắn",
      sort_order: 1,
    },
    {
      lesson_id: lessonId,
      phase: "in_class",
      question_text:
        "Một thách thức môi trường lớn nhất của nhà máy điện hạt nhân trong dài hạn là gì?",
      correct_answer: "Xử lí và lưu trữ chất thải phóng xạ có chu kì bán rã dài",
      sort_order: 2,
    },
  ]);

  // ── Phase 3: Sau giờ học ──────────────────────────────────────────────────
  await supabase.from("lesson_materials").insert({
    lesson_id: lessonId,
    teacher_id: teacherId,
    phase: "after_class",
    material_type: "worksheet",
    title: "Phiếu bài tập B24 – Công nghiệp hạt nhân (xem/in trực tiếp)",
    description:
      "Bài tập tổng hợp về nhà máy điện hạt nhân và ứng dụng đồng vị.",
    instructions: `PHIẾU BÀI TẬP B24 – CÔNG NGHIỆP HẠT NHÂN
Họ và tên: _________________________ Lớp: _______

──────────────────────────────────────────────────
I. TÓM TẮT LÍ THUYẾT

Nhà máy điện hạt nhân:
• Chuỗi năng lượng: Phân hạch → Nhiệt năng → Hơi nước → Cơ năng tuabin → Điện năng
• Thanh điều khiển (Bo, Cd): Hấp thụ neutron → điều chỉnh k → duy trì k = 1

Y học hạt nhân:
• PET: ¹⁸F-FDG (positron) → hai tia γ ngược chiều → hình ảnh 3D chuyển hóa
• SPECT: Đồng vị phát γ (ví dụ ⁹⁹ᵐTc) → hình ảnh phân phối đồng vị

Yêu cầu đồng vị dùng trong chẩn đoán y học:
• T ngắn (vài phút đến vài ngày) → giảm thời gian phơi nhiễm bệnh nhân
• Phát tia dễ ghi nhận từ bên ngoài (γ hoặc e⁺) → không dùng α (không xuyên ra ngoài cơ thể)

──────────────────────────────────────────────────
II. BÀI TẬP TỰ LUẬN

Bài 1 (Nhận biết): Điền vào sơ đồ chuyển hóa năng lượng:
Phân hạch U-235 → [A] _______ → Bộ sinh hơi → [B] _______ (áp suất cao) → Tuabin
→ [C] _______ năng → Máy phát → [D] _______ năng → Lưới điện

Bài 2 (Thông hiểu): So sánh PET và X-quang thông thường trong chẩn đoán khối u:
| Tiêu chí         | PET                          | X-quang |
|------------------|------------------------------|---------|
| Nguyên tắc       |                              |         |
| Thông tin cung cấp |                            |         |
| Phát hiện sớm    |                              |         |

Bài 3 (Vận dụng): Một bệnh nhân được tiêm dung dịch ¹³¹I (T = 8 ngày) để điều trị tuyến giáp.
a) Sau 24 ngày (3T), lượng ¹³¹I còn lại trong cơ thể là bao nhiêu % so với ban đầu?
b) Tại sao ¹³¹I thích hợp để điều trị tuyến giáp? (Gợi ý: Tuyến giáp hấp thụ iốt)

Bài 4 (Vận dụng – Bài 4 SGK, trang 121):
Nhà máy điện hạt nhân dùng nhiên liệu ²³⁵U. Mỗi phân hạch tỏa ~200 MeV.
Hiệu suất phát điện 36%. Công suất phát điện 1400 MW.
a) Tính công suất nhiệt cần từ phân hạch:
   P_nhiệt = P_điện / hiệu suất = 1400 MW / 0,36 ≈ _____ MW
b) Tính số phân hạch mỗi giây.
c) Tính khối lượng ²³⁵U tiêu thụ trong 1 năm (365 ngày).
   (1 MeV = 1,6 × 10⁻¹³ J; N_A = 6,02 × 10²³; m(U-235) ≈ 235 g/mol)

Bài 5 (Vận dụng cao – Phân tích luận điểm):
Phân tích ưu và nhược điểm của nhà máy điện hạt nhân theo 3 tiêu chí:
| Tiêu chí       | Ưu điểm                  | Nhược điểm               |
|----------------|--------------------------|--------------------------|
| Môi trường     |                          |                          |
| Kinh tế        |                          |                          |
| An toàn        |                          |                          |

Kết luận của em: Dựa vào bằng chứng (không phải cảm xúc), em nghĩ đâu là thách thức quan trọng nhất cần giải quyết trước khi quyết định phát triển điện hạt nhân?`,
    is_published: true,
    sort_order: 1,
  });

  // Phase 3 assessment questions
  await supabase.from("phase_assessment_questions").insert([
    {
      lesson_id: lessonId,
      question_type: "single_choice",
      difficulty: "nhan_biet",
      content: {
        prompt:
          "Trong nhà máy điện hạt nhân, năng lượng phân hạch trước hết được chuyển hóa thành dạng nào?",
        options: ["Điện năng.", "Cơ năng.", "Nhiệt năng.", "Quang năng."],
        correctAnswer: "Nhiệt năng.",
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
          "Tại sao đồng vị dùng trong chụp ảnh PET cần có chu kì bán rã NGẮN (vài phút đến vài giờ)?",
        options: [
          "Để tăng độ phóng xạ và ghi hình rõ hơn.",
          "Để giảm thời gian bệnh nhân bị phơi nhiễm phóng xạ sau khi chụp.",
          "Vì đồng vị T dài quá tốn kém.",
          "Để đồng vị không bị phân rã trong lọ trước khi tiêm.",
        ],
        correctAnswer:
          "Để giảm thời gian bệnh nhân bị phơi nhiễm phóng xạ sau khi chụp.",
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
          "Một nhà máy điện hạt nhân có hiệu suất 36% và công suất điện 1400 MW. Năng lượng nhiệt từ phân hạch cần cung cấp mỗi giây là:",
        options: [
          "504 MJ",
          "2916 MJ",
          "3889 MJ",
          "1400 MJ",
        ],
        correctAnswer: "3889 MJ",
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
          "Khi đánh giá tác động môi trường dài hạn của nhà máy điện hạt nhân, vấn đề khó giải quyết nhất là:",
        options: [
          "Lượng CO₂ thải ra hằng ngày.",
          "Tiếng ồn của tuabin hơi nước.",
          "Lưu trữ an toàn chất thải phóng xạ có chu kì bán rã hàng chục đến hàng trăm năm.",
          "Nước làm mát xả vào sông làm ấm nước.",
        ],
        correctAnswer:
          "Lưu trữ an toàn chất thải phóng xạ có chu kì bán rã hàng chục đến hàng trăm năm.",
      },
      sort_order: 4,
      is_published: true,
    },
    {
      lesson_id: lessonId,
      question_type: "true_false",
      difficulty: "thong_hieu",
      content: {
        prompt:
          "Đánh dấu Đúng (Đ) hoặc Sai (S) về nhà máy điện hạt nhân và y học hạt nhân:",
        statements: [
          {
            text: "Nhà máy điện hạt nhân không thải khí CO₂ trong quá trình vận hành.",
            correctValue: true,
            explanation:
              "Đúng. Phản ứng phân hạch không đốt cháy nhiên liệu hữu cơ. Lượng CO₂ chỉ phát sinh gián tiếp (xây dựng, vận chuyển nguyên liệu) nhưng trên tổng vòng đời, điện hạt nhân có lượng phát thải CO₂/kWh thấp nhất.",
          },
          {
            text: "Trong PET, đồng vị ¹⁸F tự phát tia gamma ra khỏi cơ thể, và thiết bị ghi nhận tia gamma đó.",
            correctValue: false,
            explanation:
              "Sai (một phần). ¹⁸F phân rã β⁺, phát positron. Positron gặp electron trong cơ thể → phản hủy → hai tia GAMMA bay ngược chiều. Thiết bị PET ghi hai tia gamma này, KHÔNG phải tia gamma phát trực tiếp từ ¹⁸F.",
          },
          {
            text: "Chiếu xạ thực phẩm bằng tia gamma giúp tiêu diệt vi khuẩn mà không làm thực phẩm trở nên phóng xạ.",
            correctValue: true,
            explanation:
              "Đúng. Tia gamma làm phá vỡ DNA của vi khuẩn và nấm mốc, tiêu diệt chúng. Thực phẩm không giữ lại phóng xạ sau khi chiếu xạ, an toàn để ăn.",
          },
        ],
        correctAnswers: [true, false, true],
      },
      sort_order: 5,
      is_published: true,
    },
  ]);
}
