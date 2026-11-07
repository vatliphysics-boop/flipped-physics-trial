"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  FixedPhysicsActivityRenderer,
  type ActivityKey,
} from "@/components/physics/FixedPhysicsActivityRenderer";
import { ThreeUIHeroStage } from "@/components/threeui/ThreeUIHeroStage";
import { LatexMath } from "./LatexMath";
import { InfographicGallery } from "./InfographicReels";
import { VisualVectorReference } from "./InteractiveInfographic";
import { getSectionInfographicsByLesson } from "@/data/infographic-reels-all";
import { NuclearHistory } from "./NuclearHistory";
import { NuclearLessonVideo } from "./NuclearLessonVideo";
import { NUCLEAR_LAB_LESSONS } from "@/lib/nuclear-lab-lessons";
import { NUCLEAR_REACTIONS } from "@/lib/nuclear-science";
import styles from "./VisualLearningStudio.module.css";
import { ObservationNotebook } from "./ObservationNotebook";
import { StudentPhysicsChatboxPanel } from "./AIStudyHelp";
import { getVisualLesson } from "@/lib/visual-learning";

export type LessonPhaseTag = "before" | "in_class" | "after";

export type ModularBlockType =
  | "simulation3d"
  | "threeui_stage"
  | "latex_concept"
  | "infographic_3d"
  | "scientist_history"
  | "quiz_check"
  | "ai_chat_notebook"
  | "video_media";

export interface ModularLessonBlock {
  id: string;
  type: ModularBlockType;
  phase: LessonPhaseTag;
  title: string;
  subtitle?: string;
  visible: boolean;
  /** For simulation3d */
  activityKey?: ActivityKey;
  customPrompt?: string;
  /** For latex_concept */
  content?: string;
  latex?: string;
  /** For infographic_3d or scientist_history or video_media */
  lessonCodeRef?: string;
  /** For quiz_check */
  question?: string;
  latexHint?: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
}

export interface CustomTeacherLesson {
  id: string;
  code: string;
  title: string;
  goal: string;
  updatedAt: string;
  blocks: ModularLessonBlock[];
}

export const ALL_3D_ACTIVITIES: {
  key: ActivityKey;
  lesson: string;
  label: string;
}[] = [
  {
    key: "rutherford_alpha_scattering",
    lesson: "B21",
    label: "B21 · Tán xạ alpha Rutherford trên mặt phẳng",
  },
  {
    key: "nuclear_structure_builder",
    lesson: "B21",
    label: "B21 · Xây dựng cấu trúc hạt nhân 3D (Proton Z & Neutron N)",
  },
  {
    key: "isotope_and_nuclear_size",
    lesson: "B21",
    label: "B21 · So sánh đồng vị và bán kính hạt nhân",
  },
  {
    key: "binding_energy_lab",
    lesson: "B22",
    label: "B22 · Độ hụt khối Δm và Năng lượng liên kết 3D",
  },
  {
    key: "nuclear_reaction_balancer",
    lesson: "B22",
    label: "B22 · Bảo toàn số khối A và điện tích Z trong phản ứng 3D",
  },
  {
    key: "nuclear_fission",
    lesson: "B22",
    label: "B22 · Phản ứng phân hạch dây chuyền Uranium-235 3D",
  },
  {
    key: "nuclear_fusion",
    lesson: "B22",
    label: "B22 · Phản ứng nhiệt hạch Deuterium – Tritium 3D",
  },
  {
    key: "radiation_properties",
    lesson: "B23",
    label: "B23 · Sự lệch của tia α, β, γ trong từ trường & Che chắn 3D",
  },
  {
    key: "radioactive_decay_half_life",
    lesson: "B23",
    label: "B23 · Định luật phóng xạ & Chu kì bán rã 64 hạt 3D",
  },
  {
    key: "geiger_random_decay",
    lesson: "B23",
    label: "B23 · Ống đếm Geiger–Müller và phân rã ngẫu nhiên 3D",
  },
  {
    key: "carbon14_dating",
    lesson: "B23",
    label: "B23 · Định tuổi cổ vật bằng đồng vị Carbon-14 3D",
  },
  {
    key: "radiation_safety",
    lesson: "B23",
    label: "B23 · Ba nguyên tắc An toàn bức xạ (Thời gian – Khoảng cách – Che chắn)",
  },
  {
    key: "reactor_control_concept",
    lesson: "B24",
    label: "B24 · Điều khiển hệ số nhân neutron k bằng thanh Boron/Cadmium 3D",
  },
  {
    key: "nuclear_power_energy_flow",
    lesson: "B24",
    label: "B24 · Hai vòng tuần hoàn nhiệt trong Nhà máy điện hạt nhân PWR 3D",
  },
  {
    key: "nuclear_medicine",
    lesson: "B24",
    label: "B24 · Chẩn đoán hình ảnh PET/CT và Xạ trị ung thư 3D",
  },
  {
    key: "radiation_applications",
    lesson: "B24",
    label: "B24 · Chiếu xạ nông sản & Kiểm định mối hàn bằng tia γ 3D",
  },
  {
    key: "nuclear_physics_practice_lab",
    lesson: "B25",
    label: "B25 · Thực hành đo độ phóng xạ H(t) và xác định chu kì bán rã T",
  },
];

const LATEX_SNIPPETS: { label: string; latex: string }[] = [
  {
    label: "Kí hiệu hạt nhân AZX",
    latex: "{}_{Z}^{A}\\mathrm{X}, \\quad A = Z + N",
  },
  {
    label: "Bán kính hạt nhân R",
    latex: "R = R_0 \\cdot A^{1/3} \\quad (R_0 \\approx 1{,}2 \\times 10^{-15}\\text{ m})",
  },
  {
    label: "Độ hụt khối & ELK",
    latex:
      "\\Delta m = Z m_p + (A - Z) m_n - m_X, \\qquad E_{\\text{lk}} = \\Delta m \\cdot c^2",
  },
  {
    label: "Định luật phóng xạ N(t)",
    latex:
      "N(t) = N_0 \\cdot 2^{-\\frac{t}{T}} = N_0 \\cdot e^{-\\lambda t}, \\qquad H(t) = \\lambda N(t)",
  },
  {
    label: "Phân hạch U-235",
    latex: NUCLEAR_REACTIONS.fission.latex,
  },
  {
    label: "Nhiệt hạch D-T",
    latex:
      "{}_{1}^{2}\\mathrm{H} + {}_{1}^{3}\\mathrm{H} \\rightarrow {}_{2}^{4}\\mathrm{He} + {}_{0}^{1}\\mathrm{n} + 17{,}6\\text{ MeV}",
  },
];

const PHASE_LABELS: Record<LessonPhaseTag, string> = {
  before: "Giai đoạn 1 · Trước giờ học",
  in_class: "Giai đoạn 2 · Trong giờ học",
  after: "Giai đoạn 3 · Sau giờ học",
};

const BLOCK_TYPE_LABELS: Record<ModularBlockType, string> = {
  simulation3d: "Mô phỏng Thí nghiệm 3D",
  threeui_stage: "Bàn xoay Hạt nhân 3D 360°",
  latex_concept: "Kiến thức & Công thức LaTeX",
  infographic_3d: "Poster Infographic Động 3D",
  scientist_history: "Hồ sơ Nhà khoa học",
  quiz_check: "Câu hỏi Trắc nghiệm Tương tác",
  ai_chat_notebook: "Chatbox AI & Ghi chép Học sinh",
  video_media: "Video Thí nghiệm Minh họa",
};

export function buildDefaultLessonTemplate(code: string): CustomTeacherLesson {
  const vLesson = getVisualLesson(code);
  const lines = (formulas: string[]) => String.raw`\begin{gathered}${formulas.join("\\\\")}\end{gathered}`;
  const defaultLatexMap: Record<string, string> = {
    B21: lines(["A=Z+N", String.raw`R\approx R_0A^{1/3}`, String.raw`R_0\approx 1{,}2\times10^{-15}\,\mathrm{m}`]),
    B22: lines([String.raw`\Delta m=Zm_p+Nm_n-m_{\mathrm{hn}}`, String.raw`E_{\mathrm{lk}}=\Delta m\,c^2`, String.raw`E_{\mathrm{lkr}}=\frac{E_{\mathrm{lk}}}{A}`]),
    B23: lines([String.raw`N(t)=N_0\,2^{-\frac{t}{T}}`, String.raw`\lambda=\frac{\ln 2}{T}`, String.raw`H(t)=\lambda N(t)`]),
    B24: NUCLEAR_REACTIONS.fission.latex,
    B25: lines([String.raw`H(T)=\frac{H_0}{2}`, String.raw`H(t)=H_0\,2^{-\frac{t}{T}}`]),
  };

  return {
    id: `default-${vLesson.code}`,
    code: vLesson.code,
    title: vLesson.title,
    goal: vLesson.goal,
    updatedAt: "2026-10-05T00:00:00.000Z",
    blocks: [
      {
        id: `${vLesson.code}-sim-main`,
        type: "simulation3d",
        phase: "before",
        title: `Thí nghiệm 3D trực quan: ${vLesson.shortTitle}`,
        subtitle: "Xoay 360°, nhấn trực tiếp vào vật thể 3D và điều chỉnh các thanh trượt để kiểm chứng hệ thức",
        visible: true,
        activityKey: vLesson.activity as ActivityKey,
        customPrompt: vLesson.before,
      },
      {
        id: `${vLesson.code}-latex-core`,
        type: "latex_concept",
        phase: "before",
        title: `Hệ thức Toán – Lý trọng tâm (${vLesson.code})`,
        subtitle: "Tóm tắt định lượng và lưu ý tránh nhầm lẫn",
        visible: true,
        content: `${vLesson.spots.map((s) => `• ${s.title}: ${s.explain}`).join("\n")}\n\nLưu ý quan trọng: ${vLesson.misconception}`,
        latex: defaultLatexMap[vLesson.code] ?? defaultLatexMap.B21,
      },
      {
        id: `${vLesson.code}-infographic`,
        type: "infographic_3d",
        phase: "in_class",
        title: `Hệ thống Poster Mô phỏng 3D theo từng mục SGK (${vLesson.code})`,
        subtitle: "Dùng để thảo luận nhóm hoặc trình chiếu trực quan trên lớp",
        visible: true,
        lessonCodeRef: vLesson.code,
      },
      {
        id: `${vLesson.code}-quiz`,
        type: "quiz_check",
        phase: "in_class",
        title: `Câu hỏi kiểm tra nhanh (${vLesson.code})`,
        subtitle: "Phản hồi tự động ngay sau khi học sinh chọn phương án",
        visible: true,
        question: vLesson.question.prompt,
        latexHint: defaultLatexMap[vLesson.code] ?? "",
        options: [...vLesson.question.options],
        correctIndex: vLesson.question.answer,
        explanation: vLesson.question.explanation,
      },
      {
        id: `${vLesson.code}-ai-notes`,
        type: "ai_chat_notebook",
        phase: "after",
        title: `Hỏi đáp với Chatbox AI & Ghi chép tự học (${vLesson.code})`,
        subtitle: "Học sinh trao đổi với trợ lí AI Vật lí 12 và hoàn thiện nhật kí quan sát",
        visible: true,
        lessonCodeRef: vLesson.code,
      },
    ],
  };
}

function QuizBlockCard({ block }: { block: ModularLessonBlock }) {
  const [picked, setPicked] = useState<number | null>(null);
  const options = block.options ?? [];
  const correctIdx = block.correctIndex ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: "15.5px", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.55 }}>
          {block.question}
        </div>
        {block.latexHint && (
          <div
            style={{
              padding: "4px 10px",
              background: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-light)",
              borderRadius: "6px",
            }}
          >
            <LatexMath math={block.latexHint} />
          </div>
        )}
      </div>

      <div style={{ display: "grid", gap: "8px" }}>
        {options.map((opt, idx) => {
          const isSelected = picked === idx;
          const isRight = idx === correctIdx;
          let bg = "var(--bg-surface-elevated)";
          let border = "1px solid var(--border-light)";
          if (picked !== null) {
            if (isRight) {
              bg = "#f0fdf4";
              border = "1px solid #16a34a";
            } else if (isSelected) {
              bg = "#fef2f2";
              border = "1px solid #dc2626";
            }
          }
          return (
            <button
              key={`${idx}-${opt}`}
              type="button"
              onClick={() => setPicked(idx)}
              style={{
                textAlign: "left",
                padding: "10px 14px",
                borderRadius: "8px",
                background: bg,
                border,
                color: "var(--text-primary)",
                fontSize: "14px",
                fontWeight: isSelected ? 600 : 400,
                cursor: "pointer",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            background: picked === correctIdx ? "#f0fdf4" : "#fef2f2",
            border: picked === correctIdx ? "1px solid #bbf7d0" : "1px solid #fecaca",
            color: picked === correctIdx ? "#166534" : "#991b1b",
            fontSize: "13.5px",
            lineHeight: 1.55,
          }}
        >
          <strong>{picked === correctIdx ? "Chính xác: " : "Cần lưu ý: "}</strong>
          {block.explanation}
        </div>
      )}
    </div>
  );
}

const CUSTOM_LESSONS_STORAGE_KEY = "flipped-physics-custom-lessons-v2";
const REUSABLE_BLOCKS_STORAGE_KEY = "flipped-physics-reusable-blocks-v2";

export function ModularLessonBuilder({ code = "B21" }: { code?: string }) {
  const seqRef = useRef<number>(1);
  const [savedLessons, setSavedLessons] = useState<CustomTeacherLesson[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const rawLessons = localStorage.getItem(CUSTOM_LESSONS_STORAGE_KEY);
      return rawLessons ? (JSON.parse(rawLessons) as CustomTeacherLesson[]) : [];
    } catch {
      return [];
    }
  });
  const [reusableBlocks, setReusableBlocks] = useState<ModularLessonBlock[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const rawBlocks = localStorage.getItem(REUSABLE_BLOCKS_STORAGE_KEY);
      return rawBlocks ? (JSON.parse(rawBlocks) as ModularLessonBlock[]) : [];
    } catch {
      return [];
    }
  });
  const [lesson, setLesson] = useState<CustomTeacherLesson>(() => {
    const matchForCode = savedLessons.find((item) => item.code === code);
    return matchForCode ?? buildDefaultLessonTemplate(code);
  });
  const [prevCode, setPrevCode] = useState<string>(code);
  const [builderMode, setBuilderMode] = useState<boolean>(false);
  const [phaseFilter, setPhaseFilter] = useState<"all" | LessonPhaseTag>("all");
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string>("");

  if (code !== prevCode) {
    setPrevCode(code);
    const matchForCode = savedLessons.find((item) => item.code === code);
    setLesson(matchForCode ?? buildDefaultLessonTemplate(code));
  }

  function nextUniqueId(prefix: string) {
    seqRef.current += 1;
    return `${prefix}-${lesson.code}-${lesson.blocks.length + seqRef.current}`;
  }

  function persistLesson(next: CustomTeacherLesson, msg = "Đã lưu cấu trúc bài dạy.") {
    const updated = { ...next };
    setLesson(updated);
    try {
      const others = savedLessons.filter((item) => item.id !== updated.id);
      const nextList = [updated, ...others].slice(0, 30);
      setSavedLessons(nextList);
      localStorage.setItem(CUSTOM_LESSONS_STORAGE_KEY, JSON.stringify(nextList));
      setNotice(msg);
    } catch {
      setNotice("Đã cập nhật trên phiên hiện tại.");
    }
  }

  function saveBlockToReusableBank(block: ModularLessonBlock) {
    const copy: ModularLessonBlock = {
      ...block,
      id: nextUniqueId("reusable"),
      title: `${block.title} (${lesson.code})`,
    };
    const nextBank = [copy, ...reusableBlocks].slice(0, 40);
    setReusableBlocks(nextBank);
    try {
      localStorage.setItem(REUSABLE_BLOCKS_STORAGE_KEY, JSON.stringify(nextBank));
      setNotice(`Đã lưu "${block.title}" vào Kho khối học liệu tái sử dụng.`);
    } catch {
      setNotice("Đã thêm vào kho khối tạm thời.");
    }
  }

  function addNewBlock(type: ModularBlockType, targetPhase: LessonPhaseTag = "in_class") {
    const id = nextUniqueId("block");
    let newBlock: ModularLessonBlock = {
      id,
      type,
      phase: targetPhase,
      title: BLOCK_TYPE_LABELS[type],
      subtitle: "Giáo viên tùy chỉnh nội dung và nhiệm vụ cho học sinh",
      visible: true,
    };

    if (type === "simulation3d") {
      const defaultAct =
        ALL_3D_ACTIVITIES.find((a) => a.lesson === lesson.code)?.key ??
        "rutherford_alpha_scattering";
      newBlock = {
        ...newBlock,
        title: "Thí nghiệm 3D tương tác bổ sung",
        activityKey: defaultAct,
        customPrompt:
          "Quan sát mô hình 3D, thay đổi thanh trượt và rút ra nhận xét về mối liên hệ giữa các đại lượng.",
      };
    } else if (type === "latex_concept") {
      newBlock = {
        ...newBlock,
        title: "Khối Công thức LaTeX & Ghi chú lý thuyết",
        content: "Nhập định nghĩa, kết luận hoặc hướng dẫn thảo luận nhóm tại đây.",
        latex: "E_{\\text{lk}} = \\Delta m \\cdot c^2, \\qquad N(t) = N_0 \\cdot 2^{-\\frac{t}{T}}",
      };
    } else if (type === "infographic_3d") {
      newBlock = {
        ...newBlock,
        title: `Poster Infographic 3D (${lesson.code})`,
        lessonCodeRef: lesson.code,
      };
    } else if (type === "scientist_history") {
      newBlock = {
        ...newBlock,
        title: `Tư liệu Lịch sử Nhà khoa học (${lesson.code})`,
        lessonCodeRef: lesson.code,
      };
    } else if (type === "quiz_check") {
      newBlock = {
        ...newBlock,
        title: "Câu hỏi trắc nghiệm kiểm tra nhanh",
        question: "Trong phản ứng hạt nhân, hai đại lượng nào sau đây luôn được bảo toàn?",
        latexHint: "{}_{Z_1}^{A_1}\\mathrm{X}_1 + {}_{Z_2}^{A_2}\\mathrm{X}_2 \\rightarrow {}_{Z_3}^{A_3}\\mathrm{X}_3 + {}_{Z_4}^{A_4}\\mathrm{X}_4",
        options: [
          "A. Số nucleon (số khối A) và điện tích (Z).",
          "B. Khối lượng nghỉ và số neutron.",
          "C. Thể tích hạt nhân và nhiệt độ.",
          "D. Chỉ số proton Z.",
        ],
        correctIndex: 0,
        explanation:
          "Theo định luật bảo toàn trong phản ứng hạt nhân, tổng số nucleon A và tổng điện tích Z luôn bảo toàn.",
      };
    } else if (type === "ai_chat_notebook") {
      newBlock = {
        ...newBlock,
        title: "Trợ lí Chatbox AI & Phiếu ghi chép học sinh",
        lessonCodeRef: lesson.code,
      };
    } else if (type === "video_media") {
      newBlock = {
        ...newBlock,
        title: "Video minh họa thí nghiệm",
        lessonCodeRef: lesson.code,
      };
    }

    const nextLesson = {
      ...lesson,
      blocks: [...lesson.blocks, newBlock],
    };
    persistLesson(nextLesson, `Đã thêm khối "${newBlock.title}".`);
    setEditingBlockId(id);
  }

  function updateBlock(blockId: string, patch: Partial<ModularLessonBlock>) {
    const nextBlocks = lesson.blocks.map((b) =>
      b.id === blockId ? { ...b, ...patch } : b
    );
    persistLesson({ ...lesson, blocks: nextBlocks });
  }

  function moveBlock(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= lesson.blocks.length) return;
    const copy = [...lesson.blocks];
    const [item] = copy.splice(index, 1);
    copy.splice(target, 0, item);
    persistLesson({ ...lesson, blocks: copy }, "Đã đổi thứ tự mục trong bài dạy.");
  }

  function duplicateBlock(block: ModularLessonBlock, index: number) {
    const clone: ModularLessonBlock = {
      ...block,
      id: nextUniqueId("copy"),
      title: `${block.title} (Bản sao)`,
    };
    const copy = [...lesson.blocks];
    copy.splice(index + 1, 0, clone);
    persistLesson({ ...lesson, blocks: copy }, "Đã nhân bản khối học liệu.");
  }

  function removeBlock(blockId: string) {
    persistLesson(
      {
        ...lesson,
        blocks: lesson.blocks.filter((b) => b.id !== blockId),
      },
      "Đã gỡ mục khỏi bài dạy."
    );
  }

  function resetToDefaultTemplate() {
    const fresh = buildDefaultLessonTemplate(code);
    persistLesson(fresh, `Đã khôi phục cấu trúc chuẩn của bài ${code}.`);
    setEditingBlockId(null);
  }

  function exportLessonJson() {
    const blob = new Blob([JSON.stringify(lesson, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${lesson.code}-bai-day-tu-tao.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  const displayedBlocks = lesson.blocks.filter((b) => {
    if (!builderMode && !b.visible) return false;
    if (phaseFilter !== "all" && b.phase !== phaseFilter) return false;
    return true;
  });

  const vLesson = getVisualLesson(lesson.code);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* ================================================================= */}
      {/* TOP CREATIVE STUDIO CONTROL BAR (MODE SWITCH + REUSE TOOLS)       */}
      {/* ================================================================= */}
      <div
        className="editorial-surface"
        style={{
          background: "var(--bg-surface)",
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div>
          <div
            className="mono-tag"
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            CẤU TRÚC HỌC LIỆU MÔ-ĐUN · {lesson.code}
          </div>
          <div style={{ fontSize: "15.5px", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
            {builderMode
              ? "Chế độ Biên tập Giáo viên: Sắp xếp khối mô phỏng 3D, công thức & câu hỏi"
              : "Chế độ Học tập & Thực nghiệm trực quan"}
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            className="btn"
            onClick={() => setBuilderMode((v) => !v)}
            style={{
              background: builderMode ? "var(--color-primary)" : "var(--bg-surface)",
              color: builderMode ? "#ffffff" : "var(--text-primary)",
              border: "1px solid var(--color-primary)",
              fontWeight: 600,
              fontSize: "13px",
            }}
          >
            {builderMode
              ? "Hoàn tất & Xem như Học sinh"
              : "Tùy chỉnh cấu trúc bài dạy (Giáo viên)"}
          </button>

          <Link
            href={`/hoc-lieu/soan-ke-hoach?template=${lesson.code}`}
            className="btn small"
            style={{
              background: "var(--bg-surface)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-dark)",
            }}
          >
            Xuất sang Kế hoạch Phụ lục IV →
          </Link>
        </div>
      </div>

      {notice && (
        <div
          role="status"
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#166534",
            fontSize: "13.5px",
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            style={{ background: "transparent", border: "none", color: "#166534", fontWeight: 700 }}
          >
            ×
          </button>
        </div>
      )}

      {/* ================================================================= */}
      {/* TEACHER CREATIVE TOOLBOX PALETTE (WHEN BUILDER MODE IS ON)        */}
      {/* ================================================================= */}
      {builderMode && (
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1.5px solid var(--color-primary)",
            borderRadius: "12px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "12px",
              borderBottom: "1px solid var(--border-light)",
              paddingBottom: "14px",
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 4px", fontSize: "17px", fontWeight: 700, color: "var(--text-primary)" }}>
                Bàn Sáng tạo &amp; Tái sử dụng Học liệu của Giáo viên
              </h3>
              <p style={{ margin: 0, fontSize: "13.5px", color: "var(--text-secondary)" }}>
                Bài học không cố định mục: Thầy/Cô có thể tự đặt tên bài dạy, thêm bất kỳ thí nghiệm 3D nào, tự gõ công thức LaTeX, lưu khối vào kho tái sử dụng hoặc tạo phiên bản mới cho từng lớp.
              </p>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn small"
                onClick={() => {
                  const copy: CustomTeacherLesson = {
                    ...lesson,
                    id: nextUniqueId("custom"),
                    title: `${lesson.title} (Phiên bản sáng tạo)`,
                  };
                  persistLesson(copy, "Đã tạo bản sao bài dạy mới để tùy biến riêng.");
                }}
              >
                Nhân bản bài dạy này
              </button>
              <button type="button" className="btn small" onClick={exportLessonJson}>
                Tải file JSON bài dạy
              </button>
              <label
                className="btn small"
                style={{ cursor: "pointer", display: "inline-flex", alignItems: "center" }}
              >
                Nhập JSON bài dạy
                <input
                  type="file"
                  accept=".json,application/json"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const parsed = JSON.parse(await file.text()) as CustomTeacherLesson;
                      if (parsed && Array.isArray(parsed.blocks)) {
                        persistLesson(parsed, "Đã nhập thành công cấu trúc bài dạy từ file JSON.");
                      }
                    } catch {
                      setNotice("File JSON không hợp lệ.");
                    }
                    e.target.value = "";
                  }}
                />
              </label>
              <button type="button" className="btn small" onClick={resetToDefaultTemplate}>
                Khôi phục mặc định ({code})
              </button>
            </div>
          </div>

          {/* Editable Lesson Title & Learning Goal */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "12px",
            }}
          >
            <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
              Tên bài dạy / Chuyên đề của Giáo viên
              <input
                type="text"
                value={lesson.title}
                onChange={(e) => persistLesson({ ...lesson, title: e.target.value })}
                style={{
                  width: "100%",
                  marginTop: "4px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-dark)",
                  fontSize: "14px",
                }}
              />
            </label>

            <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
              Mục tiêu / Yêu cầu cần đạt của bài dạy
              <input
                type="text"
                value={lesson.goal}
                onChange={(e) => persistLesson({ ...lesson, goal: e.target.value })}
                style={{
                  width: "100%",
                  marginTop: "4px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-dark)",
                  fontSize: "14px",
                }}
              />
            </label>

            {savedLessons.length > 0 && (
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                Chuyển nhanh giữa các bài dạy đã lưu ({savedLessons.length})
                <select
                  value={lesson.id}
                  onChange={(e) => {
                    const found = savedLessons.find((s) => s.id === e.target.value);
                    if (found) setLesson(found);
                  }}
                  style={{
                    width: "100%",
                    marginTop: "4px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-dark)",
                    background: "var(--bg-surface)",
                    fontSize: "14px",
                  }}
                >
                  {savedLessons.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.code}] {s.title} ({s.blocks.length} mục)
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {/* Add New Modular Block Buttons */}
          <div>
            <div style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>
              + Thêm mục mới vào bài dạy (Nhấn để chèn ngay):
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {(
                [
                  ["simulation3d", "+ Thí nghiệm 3D tùy chọn (16 mô hình)"],
                  ["latex_concept", "+ Công thức LaTeX & Lý thuyết"],
                  ["quiz_check", "+ Câu hỏi Trắc nghiệm tương tác"],
                  ["threeui_stage", "+ Bàn xoay Hạt nhân 3D 360°"],
                  ["infographic_3d", "+ Poster Infographic 3D"],
                  ["scientist_history", "+ Hồ sơ Nhà khoa học"],
                  ["video_media", "+ Video thí nghiệm"],
                  ["ai_chat_notebook", "+ Chatbox AI & Phiếu ghi chép"],
                ] as const
              ).map(([bType, label]) => (
                <button
                  key={bType}
                  type="button"
                  className="btn small"
                  onClick={() =>
                    addNewBlock(bType, phaseFilter === "all" ? "in_class" : phaseFilter)
                  }
                  style={{
                    background: "var(--bg-surface-elevated)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-dark)",
                    fontWeight: 600,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Reusable Block Bank */}
          {reusableBlocks.length > 0 && (
            <div
              style={{
                padding: "12px 14px",
                background: "var(--bg-surface-elevated)",
                borderRadius: "10px",
                border: "1px solid var(--border-light)",
              }}
            >
              <div style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                Kho khối học liệu tái sử dụng của Thầy/Cô ({reusableBlocks.length} khối đã lưu — Nhấn để chèn vào bài này):
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {reusableBlocks.map((rb) => (
                  <div
                    key={rb.id}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-dark)",
                      borderRadius: "8px",
                      padding: "4px 10px",
                      fontSize: "12.5px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        const inserted: ModularLessonBlock = {
                          ...rb,
                          id: nextUniqueId("inserted"),
                        };
                        persistLesson(
                          { ...lesson, blocks: [...lesson.blocks, inserted] },
                          `Đã chèn khối tái sử dụng "${rb.title}" vào bài dạy.`
                        );
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-primary)",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      + {rb.title}
                    </button>
                    <button
                      type="button"
                      aria-label="Xóa khỏi kho tái sử dụng"
                      onClick={() => {
                        const filtered = reusableBlocks.filter((item) => item.id !== rb.id);
                        setReusableBlocks(filtered);
                        localStorage.setItem(
                          REUSABLE_BLOCKS_STORAGE_KEY,
                          JSON.stringify(filtered)
                        );
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* PHASE FILTER TABS (ALL / BEFORE / IN-CLASS / AFTER)               */}
      {/* ================================================================= */}
      <div
        role="tablist"
        aria-label="Lọc theo giai đoạn Lớp học đảo ngược"
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          borderBottom: "1px solid var(--border-light)",
          paddingBottom: "12px",
        }}
      >
        {(
          [
            ["all", `Toàn bộ bài dạy (${lesson.blocks.filter((b) => builderMode || b.visible).length} mục)`],
            ["before", "1. Trước giờ học (Tự học ở nhà)"],
            ["in_class", "2. Trong giờ học (Thảo luận & 3D trên lớp)"],
            ["after", "3. Sau giờ học (Vận dụng & Hỏi AI)"],
          ] as const
        ).map(([ph, label]) => {
          const active = phaseFilter === ph;
          return (
            <button
              key={ph}
              type="button"
              role="tab"
              className="btn small"
              aria-selected={active}
              onClick={() => setPhaseFilter(ph)}
              style={{
                padding: "8px 14px",
                borderRadius: "9px",
                background: active ? "var(--color-primary)" : "var(--bg-surface)",
                color: active ? "#ffffff" : "var(--text-secondary)",
                border: active ? "1px solid var(--color-primary)" : "1px solid var(--border-light)",
                fontSize: "13px",
                fontWeight: active ? 600 : 500,
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ================================================================= */}
      {/* RENDER MODULAR BLOCKS                                             */}
      {/* ================================================================= */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {displayedBlocks.map((block) => {
          const realIndex = lesson.blocks.findIndex((b) => b.id === block.id);
          const isEditing = builderMode && editingBlockId === block.id;

          return (
            <div
              key={block.id}
              className={styles.module}
              style={{
                background: "var(--bg-surface)",
                border: builderMode ? "1.5px dashed var(--border-dark)" : "1px solid var(--border-light)",
                borderRadius: "12px",
                opacity: block.visible ? 1 : 0.55,
                boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
              }}
            >
              {/* Block Header + Teacher Action Toolbar */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--border-light)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span
                      style={{
                        padding: "3px 9px",
                        borderRadius: "6px",
                        background: "var(--bg-surface-elevated)",
                        border: "1px solid var(--border-dark)",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {PHASE_LABELS[block.phase]}
                    </span>
                    <span
                      style={{
                        padding: "3px 9px",
                        borderRadius: "6px",
                        background: "var(--color-primary)",
                        color: "#ffffff",
                        fontSize: "11.5px",
                        fontWeight: 600,
                      }}
                    >
                      {BLOCK_TYPE_LABELS[block.type]}
                    </span>
                    {!block.visible && (
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background: "#fef2f2",
                          color: "#991b1b",
                          fontSize: "11.5px",
                          fontWeight: 600,
                        }}
                      >
                        Đang ẩn với học sinh
                      </span>
                    )}
                  </div>
                  <h3 style={{ margin: 0, fontSize: "19px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {block.title}
                  </h3>
                  {block.subtitle && (
                    <p style={{ margin: "3px 0 0", fontSize: "13.5px", color: "var(--text-muted)" }}>
                      {block.subtitle}
                    </p>
                  )}
                </div>

                {builderMode && (
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => setEditingBlockId(isEditing ? null : block.id)}
                      style={{
                        background: isEditing ? "var(--color-primary)" : "var(--bg-surface)",
                        color: isEditing ? "#ffffff" : "var(--text-primary)",
                        border: "1px solid var(--border-dark)",
                      }}
                    >
                      {isEditing ? "Đóng chỉnh sửa" : "Sửa mục này"}
                    </button>
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => moveBlock(realIndex, -1)}
                      disabled={realIndex <= 0}
                    >
                      ↑ Lên
                    </button>
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => moveBlock(realIndex, 1)}
                      disabled={realIndex >= lesson.blocks.length - 1}
                    >
                      ↓ Xuống
                    </button>
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => saveBlockToReusableBank(block)}
                      title="Lưu khối này vào Kho tái sử dụng để chèn sang bài dạy khác"
                    >
                      Lưu tái sử dụng
                    </button>
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => duplicateBlock(block, realIndex)}
                    >
                      Nhân bản
                    </button>
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => updateBlock(block.id, { visible: !block.visible })}
                    >
                      {block.visible ? "Ẩn" : "Hiện"}
                    </button>
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => removeBlock(block.id)}
                      style={{ color: "#dc2626", borderColor: "#fecaca" }}
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>

              {/* Inline Block Configuration Panel when Teacher clicks "Sửa mục này" */}
              {isEditing && (
                <div
                  style={{
                    marginBottom: "18px",
                    padding: "16px",
                    borderRadius: "12px",
                    background: "var(--bg-surface-elevated)",
                    border: "1px solid var(--border-dark)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "12px",
                    }}
                  >
                    <label style={{ fontSize: "12.5px", fontWeight: 600 }}>
                      Tiêu đề mục
                      <input
                        type="text"
                        value={block.title}
                        onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                        style={{
                          width: "100%",
                          marginTop: "4px",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-dark)",
                          background: "var(--bg-surface)",
                        }}
                      />
                    </label>

                    <label style={{ fontSize: "12.5px", fontWeight: 600 }}>
                      Giai đoạn Lớp học đảo ngược
                      <select
                        value={block.phase}
                        onChange={(e) =>
                          updateBlock(block.id, { phase: e.target.value as LessonPhaseTag })
                        }
                        style={{
                          width: "100%",
                          marginTop: "4px",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-dark)",
                          background: "var(--bg-surface)",
                        }}
                      >
                        <option value="before">Giai đoạn 1 · Trước giờ học</option>
                        <option value="in_class">Giai đoạn 2 · Trong giờ học</option>
                        <option value="after">Giai đoạn 3 · Sau giờ học</option>
                      </select>
                    </label>
                  </div>

                  {block.type === "simulation3d" && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                        gap: "12px",
                      }}
                    >
                      <label style={{ fontSize: "12.5px", fontWeight: 600 }}>
                        Chọn mô hình Thí nghiệm 3D (có thể ghép bất kỳ bài nào)
                        <select
                          value={block.activityKey ?? "rutherford_alpha_scattering"}
                          onChange={(e) =>
                            updateBlock(block.id, {
                              activityKey: e.target.value as ActivityKey,
                            })
                          }
                          style={{
                            width: "100%",
                            marginTop: "4px",
                            padding: "7px 10px",
                            borderRadius: "6px",
                            border: "1px solid var(--border-dark)",
                            background: "var(--bg-surface)",
                          }}
                        >
                          {ALL_3D_ACTIVITIES.map((act) => (
                            <option key={act.key} value={act.key}>
                              {act.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label style={{ fontSize: "12.5px", fontWeight: 600 }}>
                        Nhiệm vụ / Câu hỏi dẫn dắt của Giáo viên cho thí nghiệm 3D này
                        <input
                          type="text"
                          value={block.customPrompt ?? ""}
                          onChange={(e) =>
                            updateBlock(block.id, { customPrompt: e.target.value })
                          }
                          placeholder="Ví dụ: Hãy tăng Z lên 12 và nhận xét sự thay đổi bán kính R..."
                          style={{
                            width: "100%",
                            marginTop: "4px",
                            padding: "7px 10px",
                            borderRadius: "6px",
                            border: "1px solid var(--border-dark)",
                            background: "var(--bg-surface)",
                          }}
                        />
                      </label>
                    </div>
                  )}

                  {block.type === "latex_concept" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <label style={{ fontSize: "12.5px", fontWeight: 600 }}>
                        Nội dung kiến thức / Ghi chú của Giáo viên
                        <textarea
                          rows={3}
                          value={block.content ?? ""}
                          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                          style={{
                            width: "100%",
                            marginTop: "4px",
                            padding: "8px 10px",
                            borderRadius: "6px",
                            border: "1px solid var(--border-dark)",
                            background: "var(--bg-surface)",
                          }}
                        />
                      </label>

                      <div>
                        <div style={{ fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>
                          Chèn nhanh mẫu công thức chuẩn LaTeX:
                        </div>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                          {LATEX_SNIPPETS.map((sn) => (
                            <button
                              key={sn.label}
                              type="button"
                              className="btn small"
                              onClick={() =>
                                updateBlock(block.id, {
                                  latex: block.latex
                                    ? `${block.latex}, \\qquad ${sn.latex}`
                                    : sn.latex,
                                })
                              }
                              style={{ fontSize: "11.5px", padding: "4px 8px" }}
                            >
                              + {sn.label}
                            </button>
                          ))}
                        </div>
                        <label style={{ fontSize: "12.5px", fontWeight: 600 }}>
                          Biểu thức toán học LaTeX (tự động hiển thị rõ nét bên dưới)
                          <input
                            type="text"
                            value={block.latex ?? ""}
                            onChange={(e) => updateBlock(block.id, { latex: e.target.value })}
                            style={{
                              width: "100%",
                              marginTop: "4px",
                              padding: "7px 10px",
                              borderRadius: "6px",
                              border: "1px solid var(--border-dark)",
                              background: "var(--bg-surface)",
                              fontFamily: "monospace",
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {(block.type === "infographic_3d" ||
                    block.type === "scientist_history" ||
                    block.type === "video_media") && (
                    <label style={{ fontSize: "12.5px", fontWeight: 600 }}>
                      Chọn mã bài học nguồn (B21 – B25)
                      <select
                        value={block.lessonCodeRef ?? lesson.code}
                        onChange={(e) =>
                          updateBlock(block.id, { lessonCodeRef: e.target.value })
                        }
                        style={{
                          width: "100%",
                          marginTop: "4px",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-dark)",
                          background: "var(--bg-surface)",
                        }}
                      >
                        {["B21", "B22", "B23", "B24", "B25"].map((c) => (
                          <option key={c} value={c}>
                            Bài {c}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {block.type === "quiz_check" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <label style={{ fontSize: "12.5px", fontWeight: 600 }}>
                        Nội dung câu hỏi
                        <input
                          type="text"
                          value={block.question ?? ""}
                          onChange={(e) => updateBlock(block.id, { question: e.target.value })}
                          style={{
                            width: "100%",
                            marginTop: "4px",
                            padding: "7px 10px",
                            borderRadius: "6px",
                            border: "1px solid var(--border-dark)",
                            background: "var(--bg-surface)",
                          }}
                        />
                      </label>
                      <label style={{ fontSize: "12.5px", fontWeight: 600 }}>
                        Công thức gợi ý LaTeX
                        <input
                          type="text"
                          value={block.latexHint ?? ""}
                          onChange={(e) => updateBlock(block.id, { latexHint: e.target.value })}
                          style={{
                            width: "100%",
                            marginTop: "4px",
                            padding: "7px 10px",
                            borderRadius: "6px",
                            border: "1px solid var(--border-dark)",
                            background: "var(--bg-surface)",
                            fontFamily: "monospace",
                          }}
                        />
                      </label>
                      <label style={{ fontSize: "12.5px", fontWeight: 600 }}>
                        Các lựa chọn trả lời (mỗi dòng 1 đáp án)
                        <textarea
                          rows={4}
                          value={(block.options ?? []).join("\n")}
                          onChange={(e) =>
                            updateBlock(block.id, {
                              options: e.target.value.split("\n"),
                            })
                          }
                          style={{
                            width: "100%",
                            marginTop: "4px",
                            padding: "7px 10px",
                            borderRadius: "6px",
                            border: "1px solid var(--border-dark)",
                            background: "var(--bg-surface)",
                          }}
                        />
                      </label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "10px" }}>
                        <label style={{ fontSize: "12.5px", fontWeight: 600 }}>
                          Đáp án đúng (Thứ tự từ 0)
                          <input
                            type="number"
                            min={0}
                            max={5}
                            value={block.correctIndex ?? 0}
                            onChange={(e) =>
                              updateBlock(block.id, { correctIndex: Number(e.target.value) })
                            }
                            style={{
                              width: "100%",
                              marginTop: "4px",
                              padding: "7px 10px",
                              borderRadius: "6px",
                              border: "1px solid var(--border-dark)",
                              background: "var(--bg-surface)",
                            }}
                          />
                        </label>
                        <label style={{ fontSize: "12.5px", fontWeight: 600 }}>
                          Giải thích sau khi học sinh chọn
                          <input
                            type="text"
                            value={block.explanation ?? ""}
                            onChange={(e) =>
                              updateBlock(block.id, { explanation: e.target.value })
                            }
                            style={{
                              width: "100%",
                              marginTop: "4px",
                              padding: "7px 10px",
                              borderRadius: "6px",
                              border: "1px solid var(--border-dark)",
                              background: "var(--bg-surface)",
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Block Body Renderer */}
              {block.type === "simulation3d" && (
                <FixedPhysicsActivityRenderer
                  key={`${block.id}-${block.activityKey}`}
                  activityKey={
                    (block.activityKey ?? "rutherford_alpha_scattering") as ActivityKey
                  }
                  customPrompt={block.customPrompt}
                />
              )}

              {block.type === "threeui_stage" && <ThreeUIHeroStage />}

              {block.type === "latex_concept" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {block.latex && (
                    <div className={styles.formulaPanel}>
                      <LatexMath block math={block.latex} />
                    </div>
                  )}
                  {block.content && (
                    <div
                      style={{
                        whiteSpace: "pre-line",
                        fontSize: "14.5px",
                        lineHeight: 1.7,
                        color: "#334155",
                      }}
                    >
                      {block.content}
                    </div>
                  )}
                </div>
              )}

              {block.type === "infographic_3d" && (
                <>
                  <InfographicGallery reels={getSectionInfographicsByLesson(block.lessonCodeRef ?? lesson.code)} />
                  <VisualVectorReference code={block.lessonCodeRef ?? lesson.code} />
                </>
              )}

              {block.type === "scientist_history" && (
                <NuclearHistory lessonCode={block.lessonCodeRef ?? lesson.code} />
              )}

              {block.type === "quiz_check" && <QuizBlockCard block={block} />}

              {block.type === "video_media" && (
                <NuclearLessonVideo lesson={
                  NUCLEAR_LAB_LESSONS.find(item => item.code === (block.lessonCodeRef ?? lesson.code)) ?? NUCLEAR_LAB_LESSONS[0]
                } />
              )}

              {block.type === "ai_chat_notebook" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
                    gap: "20px",
                    alignItems: "start",
                  }}
                >
                  <div>
                    <StudentPhysicsChatboxPanel
                      defaultLessonCode={block.lessonCodeRef ?? lesson.code}
                      embedded
                    />
                  </div>
                  <div>
                    <ObservationNotebook code={block.lessonCodeRef ?? lesson.code} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Footer link to Worksheets & Curriculum */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          padding: "16px 20px",
          background: "var(--bg-surface-elevated)",
          border: "1px solid var(--border-light)",
          borderRadius: "12px",
          fontSize: "13.5px",
          color: "var(--text-secondary)",
        }}
      >
        <span>
          Tài liệu in kèm bài <strong>{lesson.code}</strong>: Phiếu học tập PDF &amp; SGK trang{" "}
          {vLesson.bookPage}
        </span>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <a
            className="btn small"
            href={`/learning/${lesson.code}-worksheet.pdf`}
            target="_blank"
            rel="noreferrer"
          >
            In phiếu học tập {lesson.code} ↗
          </a>
          <a
            className="btn small"
            href={`/learning/SGK-chuong-IV.pdf#page=${vLesson.pdfPage}`}
            target="_blank"
            rel="noreferrer"
          >
            Mở SGK trang {vLesson.bookPage} ↗
          </a>
        </div>
      </div>
    </div>
  );
}
