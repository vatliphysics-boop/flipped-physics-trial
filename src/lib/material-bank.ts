import type { SupabaseClient } from "@supabase/supabase-js";

export type MaterialType =
  | "image"
  | "animation"
  | "real_video"
  | "lecture_video"
  | "simulation"
  | "document"
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
  step_type: MaterialType | "checkpoint" | "exercise" | "reflection";
  config?: Record<string, unknown>;
  material?: MaterialItem | null;
};

// ============================================================
// CANONICAL SYSTEM MATERIALS (Học liệu chuẩn hóa SGK Vật lí 12 KNTT)
// ============================================================
export const CANONICAL_SYSTEM_MATERIALS: MaterialItem[] = [
  // --- B21: Cấu trúc hạt nhân ---
  {
    id: "system-sim-rutherford",
    title: "Mô phỏng: Thí nghiệm tán xạ hạt alpha Rutherford",
    description: "Khảo sát chùm hạt alpha bắn qua lá vàng siêu mỏng. Rút ra sự tồn tại của hạt nhân mang điện dương và kích thước nguyên tử rỗng.",
    material_type: "simulation",
    category: "nuclear_physics",
    lesson_tag: "B21",
    content_url: "activity:rutherford_alpha_scattering",
    metadata: {
      activityKey: "rutherford_alpha_scattering",
      sourceBook: "Hình 21.3 SGK KNTT tr. 91-92",
    },
    is_published: true,
    is_system: true,
    created_at: "2026-09-28T00:00:00Z",
  },
  {
    id: "system-sim-nuclear-builder",
    title: "Mô phỏng: Cấu tạo hạt nhân nguyên tử (Proton & Neutron)",
    description: "Tương tác kéo thả bổ sung proton và neutron để cấu tạo nên hạt nhân nguyên tử, xác định điện tích Z và số khối A.",
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
    description: "Kích hoạt neutron chậm bắn phá U-235 sinh 2-3 neutron thứ cấp. Khảo sát điều kiện duy trì phản ứng dây chuyền với hệ số k.",
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
    title: "Mô phỏng: Phản ứng tổng hợp hạt nhân (Nhiệt hạch) trong Mặt Trời",
    description: "Khảo sát điều kiện nhiệt độ hàng chục triệu độ và áp suất cực lớn để kết hợp hai hạt nhân nhẹ H-2 và H-3 thành Heli.",
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
    description: "Đo xung đếm ngẫu nhiên của mẫu phóng xạ theo thời gian. Minh chứng tính tự phát, không phụ thuộc vào tác nhân bên ngoài.",
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
    description: "Mô phỏng số hạt còn lại N(t) = N0.2^(-t/T). Vẽ đồ thị suy giảm hàm mũ và xác định chu kì bán rã.",
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
    description: "Thao tác nâng hạ thanh điều khiển (Cadmium/Boron) để duy trì hệ số nhân neutron k = 1 ổn định công suất lò phát điện.",
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
    description: "Khảo sát nguyên lí ghi hình SPECT/PET bằng chất đánh dấu phóng xạ I-131, Tc-99m và xạ trị tiêu diệt khối u.",
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
    description: "Lập bảng số liệu, vẽ đường cong lý thuyết khớp thực nghiệm theo Bảng 25.1 SGK để tìm độ phóng xạ H0 và chu kì bán rã T.",
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
    description: "Toàn văn nội dung chuẩn hóa Chương IV (Bài 21 đến Bài 25) gồm lí thuyết, câu hỏi thảo luận, bài tập và bảng số liệu.",
    material_type: "document",
    category: "nuclear_physics",
    lesson_tag: "general",
    content_url: "/SGK VẬT LÍ 12 KNTT.pdf",
    metadata: {
      fileSizeBytes: 75373179,
      sourceBook: "SGK Vật lí 12 Kết nối tri thức với cuộc sống (tr. 90-122)",
    },
    is_published: true,
    is_system: true,
    created_at: "2026-09-28T00:00:00Z",
  },
  {
    id: "system-doc-b21-worksheet",
    title: "Phiếu hướng dẫn tự học: Bài 21 — Cấu trúc hạt nhân",
    description: "Phiếu học tập tự học tại nhà gồm mục tiêu, 5 câu hỏi tự lực điền khuyết và 3 câu hỏi tự chẩn đoán có phản hồi tức thì.",
    material_type: "document",
    category: "nuclear_physics",
    lesson_tag: "B21",
    content_url: "worksheet:b21_self_study",
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

    if (!error && steps && steps.length > 0) {
      return steps.map((s) => ({
        id: s.id,
        lesson_id: s.lesson_id,
        phase: s.phase,
        material_id: s.material_id,
        title: s.title,
        instructions: s.instructions || "",
        step_order: s.step_order,
        is_required: s.is_required,
        step_type: s.step_type,
        config: s.config,
        material: s.material_bank || null,
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
