import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Seed B21 catalog content for "Bài 21. Cấu trúc hạt nhân".
 *
 * Idempotent: if any lesson_materials already exist for this lesson,
 * the function exits without creating duplicates. This prevents double-seeding
 * when the teacher clicks "Thiết lập bài học" on an existing lesson.
 *
 * Content authored in Vietnamese per teacher requirements.
 * Physics facts verified: Z = proton count, N = neutron count, A = Z + N.
 * Isotopes share the same Z. Example: ^235_92 U → N = 235 − 92 = 143.
 */
export async function seedB21Catalog(
  supabase: SupabaseClient,
  lessonId: string,
  teacherId: string,
) {
  // ── Idempotency guard ────────────────────────────────────────────────────
  const { count } = await supabase
    .from("lesson_materials")
    .select("id", { count: "exact", head: true })
    .eq("lesson_id", lessonId);
  if (count && count > 0) return; // already seeded; bail out

  // ── Phase 1: Trước giờ học ───────────────────────────────────────────────
  // NOTE: No real video exists yet. A video placeholder worksheet is created
  // so teachers see the slot and can upload a video later via the materials UI.
  const { data: videoPlaceholder, error: vpErr } = await supabase
    .from("lesson_materials")
    .insert({
      lesson_id: lessonId,
      teacher_id: teacherId,
      phase: "before_class",
      material_type: "video",
      title: "Video bài giảng: Cấu trúc hạt nhân (chưa có video)",
      description:
        "⚠️ Giáo viên cần tải video lên. Kịch bản đã soạn sẵn trong phần Hướng dẫn dưới đây.",
      instructions: `KỊCH BẢN VIDEO BÀI GIẢNG B21 – CẤU TRÚC HẠT NHÂN
(Giáo viên tự quay/ghi màn hình rồi tải lên — thời lượng khuyến nghị 10–12 phút)

[00:00 – 01:00] Mở đầu
• Giới thiệu chủ đề: "Hạt nhân nguyên tử là gì và có cấu tạo như thế nào?"
• Đặt câu hỏi khơi gợi: Điều gì giữ các nucleon lại với nhau?

[01:00 – 04:00] Cấu tạo hạt nhân
• Hạt nhân nằm ở tâm nguyên tử, kích thước cỡ 10⁻¹⁵ m (femtomét).
• Gồm hai loại nucleon:
  – Proton (p): mang điện tích +e, số proton = Z (số nguyên tử).
  – Neutron (n): không mang điện, số neutron = N.
• Số khối: A = Z + N (tổng số nucleon).
• Ví dụ: Hạt nhân Carbon-12 có Z = 6, N = 6, A = 12.

[04:00 – 07:00] Kí hiệu hạt nhân
• Chuẩn quốc tế: ^A_Z X, trong đó X là kí hiệu nguyên tố.
• Ví dụ: ^12_6 C, ^238_92 U, ^4_2 He.
• Luyện đọc: ^235_92 U → Z=92, A=235, N = 235−92 = 143.

[07:00 – 10:00] Đồng vị (Isotopes)
• Định nghĩa: Đồng vị là các hạt nhân cùng Z nhưng khác N (khác A).
• Tính chất hóa học như nhau (cùng Z = cùng số electron → cùng cấu hình e).
• Tính chất vật lí khác nhau (khối lượng, độ bền hạt nhân).
• Ví dụ: ^1_1 H, ^2_1 H (Deuterium), ^3_1 H (Tritium) — ba đồng vị của Hydro.

[10:00 – 12:00] Kết bài
• Tóm tắt: Z, N, A = Z+N, kí hiệu ^A_Z X, đồng vị cùng Z.
• Giao nhiệm vụ: Hoàn thành phiếu quan sát và hai câu hỏi chốt trước khi vào lớp.`,
      duration_minutes: 12,
      is_published: false, // draft until teacher uploads real video
      sort_order: 1,
    })
    .select("id")
    .single();

  if (vpErr) {
    console.error("[seedB21Catalog] video placeholder insert failed:", vpErr.message);
    return; // abort – don't create orphaned questions
  }

  // Two video checkpoints (created alongside video so UI structure is consistent)
  // Actual checkpoint data only works when video URL is real, but rows are pre-created.
  if (videoPlaceholder) {
    await supabase.from("video_checkpoints").insert([
      {
        material_id: videoPlaceholder.id,
        checkpoint_percent: 40,
        question: "Số khối A của một hạt nhân được tính theo công thức nào?",
        option_a: "A = Z × N",
        option_b: "A = Z + N",
        option_c: "A = Z − N",
        option_d: "A = N / Z",
        correct_option: "B",
        sort_order: 0,
      },
      {
        material_id: videoPlaceholder.id,
        checkpoint_percent: 80,
        question: "Đồng vị là các hạt nhân có cùng:",
        option_a: "Số khối A",
        option_b: "Số neutron N",
        option_c: "Số proton Z",
        option_d: "Số nucleon",
        correct_option: "C",
        sort_order: 1,
      },
    ]);
  }

  // Phase 1 study-guide worksheet (students read this while waiting for video)
  await supabase.from("lesson_materials").insert({
    lesson_id: lessonId,
    teacher_id: teacherId,
    phase: "before_class",
    material_type: "worksheet",
    title: "Phiếu hướng dẫn tự học – Cấu trúc hạt nhân",
    description:
      "Đọc kỹ nội dung, điền vào chỗ trống và trả lời câu hỏi tự kiểm tra trước khi vào lớp.",
    instructions: `PHIẾU HƯỚNG DẪN TỰ HỌC B21 – CẤU TRÚC HẠT NHÂN

MỤC TIÊU BÀI HỌC
Sau khi hoàn thành phần này, em có thể:
□ Nêu được cấu tạo hạt nhân gồm proton và neutron.
□ Viết và đọc kí hiệu hạt nhân ^A_Z X.
□ Tính Z, N, A từ kí hiệu hạt nhân và ngược lại.
□ Giải thích khái niệm đồng vị và cho ví dụ.

────────────────────────────────────────────────
PHẦN 1 – ĐỌC VÀ GHI CHÉP

Điền vào chỗ trống:
1. Hạt nhân gồm hai loại hạt: ____________ và ____________.
2. Proton mang điện tích ____________; neutron ____________ điện.
3. Z là số ____________; N là số ____________; A = ____________.
4. Hạt nhân ^56_26 Fe có Z = _____, N = _____, A = _____.
5. Đồng vị là các hạt nhân có cùng _____ nhưng khác _____.

────────────────────────────────────────────────
PHẦN 2 – TỰ KIỂM TRA (Xem đáp án sau khi làm xong)

Câu 1: Hạt nhân ^235_92 U có bao nhiêu neutron?
  □ A. 92      □ B. 143      □ C. 327      □ D. 235
  → Đáp án: B (N = 235 − 92 = 143)

Câu 2: Hai hạt nhân ^12_6 C và ^14_6 C là:
  □ A. Cùng nguyên tố, cùng số khối.
  □ B. Khác nguyên tố, cùng số khối.
  □ C. Đồng vị của nhau (cùng Z = 6, khác A).
  □ D. Không liên quan.
  → Đáp án: C

Câu 3: Trong kí hiệu ^A_Z X, chữ A biểu thị:
  □ A. Số proton      □ B. Số neutron      □ C. Số khối      □ D. Số electron
  → Đáp án: C

────────────────────────────────────────────────
PHẦN 3 – CHUẨN BỊ CHO LỚP HỌC

Ghi lại một câu hỏi hoặc điều em còn thắc mắc về cấu trúc hạt nhân:
_________________________________________________________________`,
    is_published: true,
    sort_order: 2,
  });

  // Phase 1 final questions (2 exactly, verified answers)
  await supabase.from("phase_final_questions").insert([
    {
      lesson_id: lessonId,
      phase: "before_class",
      question_text:
        "Hạt nhân nguyên tử ^235_92 U có bao nhiêu neutron (N)?",
      correct_answer: "143",
      sort_order: 1,
    },
    {
      lesson_id: lessonId,
      phase: "before_class",
      question_text:
        "Số khối A của hạt nhân được tính bằng công thức nào? (Viết đúng chính xác)",
      correct_answer: "A = Z + N",
      sort_order: 2,
    },
  ]);

  // ── Phase 2: Trong giờ học ───────────────────────────────────────────────
  await supabase.from("lesson_materials").insert({
    lesson_id: lessonId,
    teacher_id: teacherId,
    phase: "in_class",
    material_type: "worksheet",
    title: "Phiếu thực hành – Xây dựng hạt nhân và so sánh đồng vị",
    description:
      "Thực hành cùng mô phỏng, ghi kết quả vào bảng và thảo luận nhóm.",
    instructions: `PHIẾU THỰC HÀNH B21 – XÂY DỰNG HẠT NHÂN VÀ SO SÁNH ĐỒNG VỊ

HƯỚNG DẪN SỬ DỤNG MÔ PHỎNG
1. Nhấn nút "Mô phỏng Cấu trúc hạt nhân" bên dưới để mở tương tác.
2. Kéo-thả Proton (màu đỏ) và Neutron (màu xanh) vào vùng hạt nhân.
3. Màn hình hiển thị Z, N, A theo thời gian thực.

────────────────────────────────────────────────
NHIỆM VỤ 1 – XÂY DỰNG HẠT NHÂN (Cá nhân, 5 phút)

Tạo các hạt nhân sau và ghi kết quả vào bảng:

| Hạt nhân       | Z  | N  | A  | Kí hiệu      |
|---------------|----|----|----|-----------   |
| Helium-4      |    |    |    | ^4_2 He      |
| Carbon-12     |    |    |    |              |
| Carbon-14     |    |    |    |              |
| Oxy-16        |    |    |    |              |
| Uranium-235   |    |    |    |              |

────────────────────────────────────────────────
NHIỆM VỤ 2 – SO SÁNH ĐỒNG VỊ (Nhóm 2–3 người, 7 phút)

Quan sát Carbon-12, Carbon-13, Carbon-14 và điền vào:

| Đồng vị    | Z | N  | A  | Tính chất hóa học | Khối lượng |
|-----------|---|----|----|-------------------|------------|
| Carbon-12 | 6 | 6  | 12 |                   |            |
| Carbon-13 | 6 |    |    |                   |            |
| Carbon-14 | 6 |    |    |                   |            |

Kết luận: Ba hạt nhân trên có tính chất hóa học __________ nhau vì cùng Z = _____.
Chúng khác nhau về ____________ vì N khác nhau.

────────────────────────────────────────────────
NHIỆM VỤ 3 – THẢO LUẬN NHÓM (5 phút)

1. Tại sao các đồng vị của cùng một nguyên tố lại có tính chất hóa học giống nhau nhưng tính chất vật lí lại khác?
2. Carbon-14 được dùng trong phương pháp xác định niên đại. Tại sao Carbon-14 lại kém bền hơn Carbon-12?
3. Lực nào giữ các nucleon trong hạt nhân lại với nhau? Lực đó có phải lực điện từ không?`,
    is_published: true,
    sort_order: 1,
  });

  // Phase 2 final questions (2 exactly)
  await supabase.from("phase_final_questions").insert([
    {
      lesson_id: lessonId,
      phase: "in_class",
      question_text:
        "Đồng vị là các hạt nhân có cùng số hạt loại nào?",
      correct_answer: "Proton",
      sort_order: 1,
    },
    {
      lesson_id: lessonId,
      phase: "in_class",
      question_text:
        "Trong kí hiệu hạt nhân ^235_92 U, số neutron N bằng bao nhiêu?",
      correct_answer: "143",
      sort_order: 2,
    },
  ]);

  // ── Phase 3: Sau giờ học ─────────────────────────────────────────────────
  // Note: No PDF export available in current app. Worksheet is displayed in-browser.
  await supabase.from("lesson_materials").insert({
    lesson_id: lessonId,
    teacher_id: teacherId,
    phase: "after_class",
    material_type: "worksheet",
    title: "Phiếu bài tập B21 – Cấu trúc hạt nhân (xem/in trực tiếp)",
    description:
      "⚠️ Chức năng tải PDF chưa khả dụng. Em có thể đọc bài tập ngay tại đây hoặc in trang bằng Ctrl+P / Cmd+P.",
    instructions: `PHIẾU BÀI TẬP B21 – CẤU TRÚC HẠT NHÂN
Họ và tên: _________________________ Lớp: _______

────────────────────────────────────────────────
I. CÂU HỎI TRẮC NGHIỆM (làm trực tiếp trong hệ thống)
Xem các câu hỏi bên dưới phần này trong trang.

────────────────────────────────────────────────
II. BÀI TẬP TỰ LUẬN (nộp theo hướng dẫn của giáo viên)

Bài 1 (Nhận biết): Điền vào chỗ trống:
Hạt nhân ^27_13 Al có Z = ___, N = ___, A = ___.
Kí hiệu đầy đủ: _________________.

Bài 2 (Thông hiểu): Ba hạt nhân sau có phải là đồng vị không? Giải thích.
^14_6 C ,  ^14_7 N ,  ^12_6 C

Bài 3 (Vận dụng): Cho hạt nhân X có 17 proton và 18 neutron.
a) Viết kí hiệu hạt nhân X.
b) X là nguyên tố gì? (Tra bảng tuần hoàn)
c) Tính số khối A.

Bài 4 (Vận dụng cao): Phân tích phát biểu:
"Nếu ta thêm 1 neutron vào hạt nhân ^12_6 C, ta thu được đồng vị ^13_6 C.
Nhưng nếu ta thêm 1 proton, ta không còn có Carbon nữa mà tạo ra nguyên tố mới."
Hãy giải thích tại sao, và nguyên tố mới đó là gì?`,
    is_published: true,
    sort_order: 1,
  });

  // Phase 3 assessment questions – 4 levels, answers NEVER exposed to students via RPC
  await supabase.from("phase_assessment_questions").insert([
    {
      lesson_id: lessonId,
      question_type: "single_choice",
      difficulty: "nhan_biet",
      content: {
        prompt: "Hạt nhân nguyên tử được cấu tạo bởi:",
        options: [
          "chỉ có proton.",
          "chỉ có neutron.",
          "proton và neutron.",
          "proton, neutron và electron.",
        ],
        correctAnswer: "proton và neutron.",
      },
      sort_order: 1,
      is_published: true,
    },
    {
      lesson_id: lessonId,
      question_type: "single_choice",
      difficulty: "thong_hieu",
      content: {
        prompt: "Hạt nhân ^27_13 Al có cấu tạo gồm:",
        options: [
          "13 proton và 27 neutron.",
          "13 proton và 14 neutron.",
          "27 proton và 13 neutron.",
          "14 proton và 13 neutron.",
        ],
        correctAnswer: "13 proton và 14 neutron.",
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
          "Hai hạt nhân ^12_6 C và ^14_6 C là đồng vị của nhau vì chúng có:",
        options: [
          "cùng số khối A = 12.",
          "cùng số neutron N = 6.",
          "cùng số proton Z = 6.",
          "cùng số nucleon.",
        ],
        correctAnswer: "cùng số proton Z = 6.",
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
          "Hạt nhân X có 15 proton và số khối A = 31. Số neutron của X là bao nhiêu và X là nguyên tố nào?",
        options: [
          "N = 16, X là Lưu huỳnh (S).",
          "N = 16, X là Phốt pho (P).",
          "N = 46, X là Phốt pho (P).",
          "N = 15, X là Silic (Si).",
        ],
        correctAnswer: "N = 16, X là Phốt pho (P).",
      },
      sort_order: 4,
      is_published: true,
    },
  ]);
}
