import questionImages from "@/data/question-images.json";
import { SUPPLEMENTARY_NUCLEAR_MATERIALS } from "./nuclear-learning-content";
import { EXTENDED_NUCLEAR_MATERIALS } from "./extended-nuclear-materials";
import { NUCLEAR_LAB_LESSONS, NUCLEAR_VIDEO_METADATA, nuclearLabUrl, nuclearVideoUrl } from "./nuclear-lab-lessons";
import type { SupabaseClient } from "@supabase/supabase-js";

export type MaterialType =
  | "image"
  | "animation"
  | "real_video"
  | "lecture_video"
  | "simulation"
  | "document"
  | "assessment"
  | "colab";

export type MaterialCategory =
  | "nuclear_physics"
  | "thermal_physics"
  | "ideal_gas"
  | "magnetic_field"
  | "general";

export type MaterialItem = {
  id: string;
  teacher_id?: string | null;
  title: string;
  description: string;
  material_type: MaterialType;
  category: MaterialCategory;
  lesson_tag?: string | null; // 'B21', 'B22', 'B23', 'B24', 'B25'
  content_url: string;        // Storage URL, direct web URL, or component key
  storage_path?: string | null;
  metadata?: {
    workspace?: "quiz" | "mindmap" | "roleplay" | "game" | "assessment" | "teaching-guide" | "remediation" | "rubric" | "infographic" | "nucleus";
    examId?: string;
    guideId?: string;
    recommendedPhase?: "before_class" | "in_class" | "after_class";
    language?: string;
    verifiedAt?: string;
    activityKey?: string;     // Key used in FixedPhysicsActivityRenderer
    durationMinutes?: number;
    fileSizeBytes?: number;
    mimeType?: string;
    checkpoints?: { id: string; percent: number; prompt: string; options: string[]; correctIndex: number }[];
    author?: string;
    sourceBook?: string;      // e.g. "SGK Vật lí 12 KNTT tr. 91-95"
  };
  is_published: boolean;
  is_system: boolean;
  created_at: string;
  updated_at?: string;
};

export type PathwayStep = {
  id: string;
  lesson_id: string;
  phase: "before_class" | "in_class" | "after_class";
  material_id?: string | null;
  title: string;
  instructions: string;
  step_order: number;
  is_required: boolean;
  is_published?: boolean;
  step_type: MaterialType | "checkpoint" | "exercise" | "reflection";
  config?: Record<string, unknown>;
  material?: MaterialItem | null;
};

// ============================================================
// CANONICAL SYSTEM MATERIALS (Học liệu chuẩn hóa SGK Vật lí 12 KNTT)
// ============================================================
export const CANONICAL_SYSTEM_MATERIALS: MaterialItem[] = [
  ...NUCLEAR_LAB_LESSONS.flatMap((lesson): MaterialItem[] => {
    const common = {
      category: "nuclear_physics" as const,
      lesson_tag: lesson.code,
      is_published: true,
      is_system: true,
      created_at: "2026-11-05T00:00:00Z",
    };
    return [{
      ...common,
      id: `system-nuclear-video-${lesson.code.toLowerCase()}`,
      title: `Video ${lesson.code} · ${lesson.title}`,
      description: lesson.videoTask,
      material_type: "lecture_video",
      content_url: nuclearVideoUrl(lesson.code),
      metadata: { language: "vi", recommendedPhase: "before_class", mimeType: "video/mp4", durationMinutes: Math.round(NUCLEAR_VIDEO_METADATA[lesson.code].durationSeconds / 60 * 100) / 100 },
    }, {
      ...common,
      id: `system-nucleus-model-${lesson.code.toLowerCase()}`,
      title: `Mô hình 3D ${lesson.code} · ${lesson.isotopeLabel}`,
      description: lesson.observation,
      material_type: "simulation",
      content_url: nuclearLabUrl(lesson.code, "mo-hinh"),
      metadata: { workspace: "nucleus", recommendedPhase: "in_class" },
    }];
  }),
  ...questionImages.map((image): MaterialItem => ({ id: `system-question-image-${image.id}`, title: `Hình câu hỏi: ${image.title}`, description: image.description, material_type: "image", category: "nuclear_physics", lesson_tag: image.lesson, content_url: image.url, metadata: { author: image.source, recommendedPhase: "in_class" }, is_published: true, is_system: true, created_at: "2026-10-05T00:00:00Z" })),
  ...EXTENDED_NUCLEAR_MATERIALS,
  ...SUPPLEMENTARY_NUCLEAR_MATERIALS,
  // --- B21: Cấu trúc hạt nhân ---
  {
    id: "system-sim-rutherford",
    title: "Mô phỏng: Thí nghiệm tán xạ hạt alpha Rutherford",
    description: "So sánh hai quỹ đạo alpha quanh một hạt nhân vàng. Đổi tham số va chạm hoặc động năng và giải thích sự thay đổi góc tán xạ.",
    material_type: "simulation",
    category: "nuclear_physics",
    lesson_tag: "B21",
    content_url: "activity:rutherford_alpha_scattering",
    metadata: {
      activityKey: "rutherford_alpha_scattering",
      sourceBook: "SGK Vật lí 12 KNTT tr. 91–92, Hình 21.2–21.3",
    },
    is_published: true,
    is_system: true,
    created_at: "2026-09-28T00:00:00Z",
  },
  {
    id: "system-sim-nuclear-builder",
    title: "Mô phỏng: Cấu tạo hạt nhân nguyên tử (Proton & Neutron)",
    description: "Điều chỉnh số proton và neutron để cấu tạo nên hạt nhân nguyên tử, xác định điện tích Z và số khối A.",
    material_type: "simulation",
    category: "nuclear_physics",
    lesson_tag: "B21",
    content_url: "activity:nuclear_structure_builder",
    metadata: {
      activityKey: "nuclear_structure_builder",
      sourceBook: "Mục I SGK KNTT tr. 92-93",
    },
    is_published: true,
    is_system: true,
    created_at: "2026-09-28T00:00:00Z",
  },
  {
    id: "system-sim-isotope-size",
    title: "Mô phỏng: Đồng vị và kích thước hạt nhân",
    description: "Khảo sát các đồng vị Cacbon (C-12, C-13, C-14) và Uranium (U-235, U-238). Tính bán kính gần đúng R = 1,2.10^-15 A^(1/3) m.",
    material_type: "simulation",
    category: "nuclear_physics",
    lesson_tag: "B21",
    content_url: "activity:isotope_and_nuclear_size",
    metadata: {
      activityKey: "isotope_and_nuclear_size",
      sourceBook: "Bảng 21.1 SGK KNTT tr. 94-95",
    },
    is_published: true,
    is_system: true,
    created_at: "2026-09-28T00:00:00Z",
  },
  {
    id: "system-img-rutherford-scheme",
    title: "Sơ đồ nguyên lí: Thiết bị thí nghiệm tán xạ Rutherford",
    description: "Ảnh tĩnh cấu tạo buồng chân không, nguồn phóng xạ alpha, lá vàng và kính hiển vi huỳnh quang phát hiện vết sáng.",
    material_type: "image",
    category: "nuclear_physics",
    lesson_tag: "B21",
    content_url: "/illustrations/rutherford_scheme.svg",
    metadata: {
      sourceBook: "Hình 21.2 SGK KNTT tr. 91",
    },
    is_published: true,
    is_system: true,
    created_at: "2026-09-28T00:00:00Z",
  },

  // --- B22: Phản ứng hạt nhân và năng lượng liên kết ---
  {
    id: "system-sim-reaction-balancer",
    title: "Mô phỏng: Cân bằng phản ứng hạt nhân & Buồng sương Blackett",
    description: "Quan sát dấu vết hạt trong buồng sương Wilson và cân bằng định luật bảo toàn số khối A và điện tích Z.",
    material_type: "simulation",
    category: "nuclear_physics",
    lesson_tag: "B22",
    content_url: "activity:nuclear_reaction_balancer",
    metadata: {
      activityKey: "nuclear_reaction_balancer",
      sourceBook: "Hình 22.2 SGK KNTT tr. 96-97",
    },
    is_published: true,
    is_system: true,
    created_at: "2026-09-28T00:00:00Z",
  },
  {
    id: "system-sim-binding-energy",
    title: "Mô phỏng: Độ hụt khối và năng lượng liên kết riêng (Elkr)",
    description: "Khảo sát sự phụ thuộc của năng lượng liên kết riêng theo số khối A. Xác định vùng các hạt nhân bền vững nhất (50 < A < 80).",
    material_type: "simulation",
    category: "nuclear_physics",
    lesson_tag: "B22",
    content_url: "activity:binding_energy_lab",
    metadata: {
      activityKey: "binding_energy_lab",
      sourceBook: "Hình 22.5 SGK KNTT tr. 100",
    },
    is_published: true,
    is_system: true,
    created_at: "2026-09-28T00:00:00Z",
  },
  {
    id: "system-sim-nuclear-fission",
    title: "Mô phỏng: Phản ứng phân hạch Uranium-235 và phản ứng dây chuyền",
    description: "Chạy từng bước U-235 → U-236* → Y-95 + I-138 + 3 neutron đúng ví dụ SGK. Xoay 3D, xem lại thời điểm, kiểm tra bảo toàn A/Z và so sánh dây chuyền theo k.",
    material_type: "simulation",
    category: "nuclear_physics",
    lesson_tag: "B22",
    content_url: "activity:nuclear_fission",
    metadata: {
      activityKey: "nuclear_fission",
      sourceBook: "Hình 22.6 SGK KNTT tr. 101-102",
    },
    is_published: true,
    is_system: true,
    created_at: "2026-09-28T00:00:00Z",
  },
  {
    id: "system-sim-nuclear-fusion",
    title: "Mô phỏng: Phản ứng tổng hợp hạt nhân D–T (Nhiệt hạch)",
    description: "So sánh điều kiện hợp nhất deuterium và tritium tạo helium-4 và neutron. Ví dụ D–T khác chuỗi proton–proton chủ yếu trong Mặt trời.",
    material_type: "simulation",
    category: "nuclear_physics",
    lesson_tag: "B22",
    content_url: "activity:nuclear_fusion",
    metadata: {
      activityKey: "nuclear_fusion",
      sourceBook: "Hình 22.7 SGK KNTT tr. 103-104",
    },
    is_published: true,
    is_system: true,
    created_at: "2026-09-28T00:00:00Z",
  },

  // --- B23: Hiện tượng phóng xạ ---
  {
    id: "system-sim-geiger-decay",
    title: "Mô phỏng: Ống đếm Geiger và tính ngẫu nhiên của phân rã phóng xạ",
    description: "Tạo số đếm ngẫu nhiên theo mô hình, lặp quan sát để so sánh sự dao động. Đây là dữ liệu mô phỏng, không phải phép đo nguồn thật.",
    material_type: "simulation",
    category: "nuclear_physics",
    lesson_tag: "B23",
    content_url: "activity:geiger_random_decay",
    metadata: {
      activityKey: "geiger_random_decay",
      sourceBook: "Bảng 23.1 và Hình 23.2 SGK KNTT tr. 105",
    },
    is_published: true,
    is_system: true,
    created_at: "2026-09-28T00:00:00Z",
  },
  {
    id: "system-sim-radiation-properties",
    title: "Mô phỏng: Bản chất và độ đâm xuyên của tia phóng xạ (Alpha, Beta, Gamma)",
    description: "Kiểm tra khả năng đâm xuyên qua giấy, nhôm, chì và sự lệch hướng trong điện trường / từ trường của 3 loại tia.",
    material_type: "simulation",
    category: "nuclear_physics",
    lesson_tag: "B23",
    content_url: "activity:radiation_properties",
    metadata: {
      activityKey: "radiation_properties",
      sourceBook: "Hình 23.3 & 23.4 SGK KNTT tr. 105-106",
    },
    is_published: true,
    is_system: true,
    created_at: "2026-09-28T00:00:00Z",
  },
  {
    id: "system-sim-half-life",
    title: "Mô phỏng: Khảo sát đồ thị định luật phóng xạ và chu kì bán rã T",
    description: "Theo dõi từng hạt phân rã, số ghi nhận trong khoảng đo và số hạt còn lại. Thay số hạt ban đầu hoặc chu kì để đối chiếu lượt ngẫu nhiên với đường kì vọng.",
    material_type: "simulation",
    category: "nuclear_physics",
    lesson_tag: "B23",
    content_url: "activity:radioactive_decay_half_life",
    metadata: {
      activityKey: "radioactive_decay_half_life",
      sourceBook: "Hình 23.5 SGK KNTT tr. 107-108",
    },
    is_published: true,
    is_system: true,
    created_at: "2026-09-28T00:00:00Z",
  },
  {
    id: "system-sim-carbon14-dating",
    title: "Mô phỏng: Vận dụng đồng vị Carbon-14 định tuổi cổ vật",
    description: "Phân tích tỉ lệ C-14/C-12 trong mẫu gỗ cổ khảo cổ học để tính niên đại lịch sử dựa trên chu kì T = 5730 năm.",
    material_type: "simulation",
    category: "nuclear_physics",
    lesson_tag: "B23",
    content_url: "activity:carbon14_dating",
    metadata: {
      activityKey: "carbon14_dating",
      sourceBook: "Hình 23.6 SGK KNTT tr. 109",
    },
    is_published: true,
    is_system: true,
    created_at: "2026-09-28T00:00:00Z",
  },
  {
    id: "system-sim-radiation-safety",
    title: "Mô phỏng & Bài tập tình huống: An toàn phóng xạ (Khoảng cách, Thời gian, Che chắn)",
    description: "Mô phỏng thực hành các nguyên tắc ALARA: Giảm thời gian tiếp xúc, Tăng khoảng cách, Tăng độ dày lớp chắn bảo vệ.",
    material_type: "simulation",
    category: "nuclear_physics",
    lesson_tag: "B23",
    content_url: "activity:radiation_safety",
    metadata: {
      activityKey: "radiation_safety",
      sourceBook: "Hình 23.7 - 23.13 SGK KNTT tr. 110-113",
    },
    is_published: true,
    is_system: true,
    created_at: "2026-09-28T00:00:00Z",
  },

  // --- B24: Công nghiệp hạt nhân ---
  {
    id: "system-sim-nuclear-power",
    title: "Mô phỏng: Sơ đồ chu chuyển năng lượng nhà máy điện hạt nhân",
    description: "Khám phá vòng tuần hoàn nhiệt sơ cấp và thứ cấp: từ năng lượng phản ứng hạt nhân sang cơ năng tuabin và điện năng.",
    material_type: "simulation",
    category: "nuclear_physics",
    lesson_tag: "B24",
    content_url: "activity:nuclear_power_energy_flow",
    metadata: {
      activityKey: "nuclear_power_energy_flow",
      sourceBook: "Hình 24.1 SGK KNTT tr. 114",
    },
    is_published: true,
    is_system: true,
    created_at: "2026-09-28T00:00:00Z",
  },
  {
    id: "system-sim-reactor-control",
    title: "Mô phỏng: Điều khiển thanh hấp thụ neutron trong lò phản ứng",
    description: "So sánh ba mức cắm thanh hấp thụ neutron trong mô hình định tính. Theo dõi xu hướng qua các thế hệ và phân biệt với quá trình truyền nhiệt của lò nước áp lực; không dùng để dự báo vận hành thực tế.",
    material_type: "simulation",
    category: "nuclear_physics",
    lesson_tag: "B24",
    content_url: "activity:reactor_control_concept",
    metadata: {
      activityKey: "reactor_control_concept",
      sourceBook: "Hình 24.3 SGK KNTT tr. 115",
    },
    is_published: true,
    is_system: true,
    created_at: "2026-09-28T00:00:00Z",
  },
  {
    id: "system-sim-nuclear-medicine",
    title: "Mô phỏng: Ứng dụng đồng vị phóng xạ trong Y học (Chẩn đoán & Xạ trị)",
    description: "Phân biệt PET dùng chất đánh dấu phát positron (ví dụ F-18), SPECT ghi photon gamma (ví dụ Tc-99m) và điều trị bằng dược chất phóng xạ.",
    material_type: "simulation",
    category: "nuclear_physics",
    lesson_tag: "B24",
    content_url: "activity:nuclear_medicine",
    metadata: {
      activityKey: "nuclear_medicine",
      sourceBook: "Hình 24.4 SGK KNTT tr. 116-117",
    },
    is_published: true,
    is_system: true,
    created_at: "2026-09-28T00:00:00Z",
  },
  {
    id: "system-sim-radiation-applications",
    title: "Mô phỏng: Chiếu xạ bảo quản thực phẩm & Ứng dụng công nghiệp",
    description: "Khảo sát liều chiếu xạ diệt vi sinh vật gây hại, ức chế nảy mầm nông sản và dò khuyết tật mối hàn đường ống.",
    material_type: "simulation",
    category: "nuclear_physics",
    lesson_tag: "B24",
    content_url: "activity:radiation_applications",
    metadata: {
      activityKey: "radiation_applications",
      sourceBook: "Hình 24.5 SGK KNTT tr. 117-118",
    },
    is_published: true,
    is_system: true,
    created_at: "2026-09-28T00:00:00Z",
  },

  // --- B25: Bài tập về vật lí hạt nhân ---
  {
    id: "system-sim-practice-lab",
    title: "Mô phỏng: Thực hành phân tích dữ liệu phân rã phóng xạ H(t)",
    description: "Đọc độ phóng xạ ban đầu trong Bảng 25.1 SGK, ước lượng chu kì bán rã từ mốc nửa ban đầu rồi so sánh với đường lí thuyết.",
    material_type: "simulation",
    category: "nuclear_physics",
    lesson_tag: "B25",
    content_url: "activity:nuclear_physics_practice_lab",
    metadata: {
      activityKey: "nuclear_physics_practice_lab",
      sourceBook: "Bảng 25.1 SGK KNTT tr. 121",
    },
    is_published: true,
    is_system: true,
    created_at: "2026-09-28T00:00:00Z",
  },

  // --- Tài liệu PDF & Phiếu học tập SGK ---
  {
    id: "system-doc-sgk-chapter4",
    title: "Tài liệu học tập: SGK Vật lí 12 KNTT — Chương IV Vật lí hạt nhân",
    description: "Bản trích trang in 90–122 từ tệp SGK người dùng cung cấp; gồm B21–B25, lí thuyết, câu hỏi và bảng số liệu.",
    material_type: "document",
    category: "nuclear_physics",
    lesson_tag: "general",
    content_url: "/learning/SGK-chuong-IV.pdf",
    metadata: {

      sourceBook: "SGK Vật lí 12 Kết nối tri thức với cuộc sống (tr. 90-122)",
    },
    is_published: true,
    is_system: true,
    created_at: "2026-09-28T00:00:00Z",
  },
  {
    id: "system-doc-b21-worksheet",
    title: "Phiếu hướng dẫn tự học: Bài 21 — Cấu trúc hạt nhân",
    description: "Phiếu học tập tự học tại nhà gồm mục tiêu, nhiệm vụ ba giai đoạn và 3 câu hỏi tự chẩn đoán có phản hồi tức thì.",
    material_type: "document",
    category: "nuclear_physics",
    lesson_tag: "B21",
    content_url: "/learning/B21-worksheet.pdf",
    metadata: {
      sourceBook: "Thiết kế chuẩn hóa theo tiến trình đảo ngược B21",
    },
    is_published: true,
    is_system: true,
    created_at: "2026-09-28T00:00:00Z",
  },
];

// Helper to query materials from both DB (custom materials) and canonical catalog
export async function getCombinedMaterialBank(
  supabase: SupabaseClient,
  teacherId?: string,
  filterType?: MaterialType | "all",
  searchQuery?: string
): Promise<MaterialItem[]> {
  let dbItems: MaterialItem[] = [];

  try {
    let query = supabase.from("material_bank").select("*");
    if (teacherId) {
      query = query.or(`is_system.eq.true,teacher_id.eq.${teacherId}`);
    } else {
      query = query.eq("is_published", true);
    }
    const { data, error } = await query.order("created_at", { ascending: false });
    if (!error && data) {
      dbItems = data as MaterialItem[];
    }
  } catch (err) {
    // If material_bank table does not exist on remote yet, catch gracefully
    console.warn("material_bank table lookup fallback to canonical items", err);
  }

  // Also query existing lesson_materials of this teacher to bring into the bank seamlessly
  if (teacherId) {
    try {
      const { data: legacyMaterials } = await supabase
        .from("lesson_materials")
        .select("id, title, description, material_type, content_url, is_published, created_at")
        .eq("teacher_id", teacherId);

      if (legacyMaterials) {
        const legacyMapped: MaterialItem[] = legacyMaterials.map((m) => {
          let mappedType: MaterialType = "document";
          if (m.material_type === "video") mappedType = "lecture_video";
          else if (m.material_type === "simulation") mappedType = "simulation";
          else if (m.material_type === "colab") mappedType = "colab";
          else mappedType = "document";

          return {
            id: `legacy-${m.id}`,
            teacher_id: teacherId,
            title: m.title,
            description: m.description || "",
            material_type: mappedType,
            category: "nuclear_physics",
            content_url: m.content_url || "",
            is_published: m.is_published,
            is_system: false,
            created_at: m.created_at,
          };
        });
        dbItems = [...dbItems, ...legacyMapped];
      }
    } catch {
      // ignore
    }
  }

  // Combine system canonical items with db custom items (de-duplicating by id)
  const combinedMap = new Map<string, MaterialItem>();
  for (const item of CANONICAL_SYSTEM_MATERIALS) {
    combinedMap.set(item.id, item);
  }
  for (const item of dbItems) {
    combinedMap.set(item.id, item);
  }

  let list = Array.from(combinedMap.values());

  // Filter by material_type
  if (filterType && filterType !== "all") {
    list = list.filter((item) => item.material_type === filterType);
  }

  // Filter by search query
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.lesson_tag?.toLowerCase().includes(q)
    );
  }

  return list;
}

export function resolvePathwayStepMaterial(s: {
  id: string;
  material_id?: string | null;
  title: string;
  instructions?: string | null;
  step_type: PathwayStep["step_type"];
  is_published?: boolean | null;
  config?: Record<string, unknown> | null;
  material_bank?: MaterialItem | MaterialItem[] | null;
  created_at?: string | null;
}): MaterialItem {
  const rawBank = Array.isArray(s.material_bank) ? s.material_bank[0] : s.material_bank;
  const cfg = (s.config && typeof s.config === "object" ? s.config : {}) as Record<string, unknown>;
  const canonicalId = typeof cfg.canonical_material_id === "string" ? cfg.canonical_material_id : null;
  const cfgUrl = typeof cfg.content_url === "string" ? cfg.content_url : "";

  const canonical =
    (canonicalId ? CANONICAL_SYSTEM_MATERIALS.find((m) => m.id === canonicalId) : undefined) ??
    (s.material_id ? CANONICAL_SYSTEM_MATERIALS.find((m) => m.id === s.material_id) : undefined) ??
    (cfgUrl ? CANONICAL_SYSTEM_MATERIALS.find((m) => m.content_url === cfgUrl) : undefined);

  const tagSource = `${canonical?.lesson_tag ?? ""} ${canonicalId ?? ""} ${cfgUrl} ${s.title ?? ""}`;
  const tagMatch = tagSource.match(/\b(B2[1-5])\b/i);
  const inferredTag = canonical?.lesson_tag ?? (tagMatch ? tagMatch[1].toUpperCase() : undefined);

  const validTypes: MaterialType[] = [
    "image",
    "animation",
    "real_video",
    "lecture_video",
    "simulation",
    "document",
    "assessment",
    "colab",
  ];
  const mappedType: MaterialType = validTypes.includes(s.step_type as MaterialType)
    ? (s.step_type as MaterialType)
    : canonical?.material_type ?? "document";

  if (rawBank) {
    return {
      ...rawBank,
      lesson_tag: rawBank.lesson_tag || inferredTag,
      metadata: {
        ...(canonical?.metadata ?? {}),
        ...(rawBank.metadata ?? {}),
      },
    };
  }

  if (canonical) {
    return {
      ...canonical,
      lesson_tag: canonical.lesson_tag || inferredTag,
    };
  }

  return {
    id: canonicalId || s.material_id || s.id,
    title: s.title,
    description: s.instructions || "",
    material_type: mappedType,
    category: "nuclear_physics",
    lesson_tag: inferredTag,
    content_url: cfgUrl,
    is_published: Boolean(s.is_published),
    is_system: Boolean(canonicalId),
    created_at: s.created_at || "2026-10-01T00:00:00Z",
  };
}

export async function getLessonPathway(
  supabase: SupabaseClient,
  lessonId: string,
  phase: "before_class" | "in_class" | "after_class"
): Promise<PathwayStep[]> {
  try {
    const { data: steps, error } = await supabase
      .from("lesson_pathway_steps")
      .select("*, material_bank(*)")
      .eq("lesson_id", lessonId)
      .eq("phase", phase)
      .order("step_order", { ascending: true });

    if (!error && steps) {
      return steps.map((s) => ({
        id: s.id,
        lesson_id: s.lesson_id,
        phase: s.phase,
        material_id: s.material_id,
        title: s.title,
        instructions: s.instructions || "",
        step_order: s.step_order,
        is_required: s.is_required,
        is_published: s.is_published,
        step_type: s.step_type,
        config: s.config,
        material: resolvePathwayStepMaterial(s),
      }));
    }
  } catch {
    // ignore
  }

  // Fallback: derive from existing lesson_materials
  try {
    const { data: materials } = await supabase
      .from("lesson_materials")
      .select("*")
      .eq("lesson_id", lessonId)
      .eq("phase", phase)
      .order("created_at");

    if (materials && materials.length > 0) {
      return materials.map((m, idx) => ({
        id: m.id,
        lesson_id: m.lesson_id,
        phase: m.phase,
        material_id: null,
        title: m.title,
        instructions: m.instructions || m.description || "",
        step_order: idx + 1,
        is_required: true,
        step_type: m.material_type === "video" ? "lecture_video" : "document",
        material: {
          id: m.id,
          title: m.title,
          description: m.description || "",
          material_type: m.material_type === "video" ? "lecture_video" : "document",
          category: "nuclear_physics",
          content_url: m.content_url || "",
          is_published: m.is_published,
          is_system: false,
          created_at: m.created_at,
        },
      }));
    }
  } catch {
    // ignore
  }

  return [];
}
