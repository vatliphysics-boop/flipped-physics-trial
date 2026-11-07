"use client";

import React from "react";
import katex from "katex";

export const STEP_TYPE_LABELS_VI: Record<string, string> = {
  lecture_video: "Video bài giảng",
  real_video: "Video thực tế",
  video: "Video học tập",
  simulation: "Mô phỏng tương tác",
  document: "Phiếu học tập & Tài liệu",
  worksheet: "Phiếu học tập",
  pdf: "Tài liệu PDF",
  colab: "Câu hỏi & Hoạt động",
  quiz: "Câu hỏi chẩn đoán",
  assessment: "Bài đánh giá",
  image: "Hình ảnh & Sơ đồ",
  animation: "Mô hình động",
  checkpoint: "Câu hỏi kiểm tra",
  exercise: "Bài tập tự luyện",
  reflection: "Phản hồi cuối bài",
};

export function getVietnameseStepTypeLabel(type?: string | null): string {
  if (!type) return "Học liệu";
  const key = type.trim().toLowerCase();
  return STEP_TYPE_LABELS_VI[key] ?? "Học liệu";
}

export interface PhysicsFormulaPreset {
  id: string;
  label: string;
  description: string;
  latex: string;
  defaultDisplay: "inline" | "block";
}

export const PHYSICS_FORMULA_PRESETS: PhysicsFormulaPreset[] = [
  {
    id: "decay-law",
    label: "Định luật phóng xạ N(t)",
    description: "Số hạt nhân còn lại theo chu kì bán rã T",
    latex: "N(t)=N_0\\,2^{-t/T}",
    defaultDisplay: "inline",
  },
  {
    id: "lambda-activity",
    label: "Hằng số phóng xạ & Độ phóng xạ",
    description: "Liên hệ giữa λ, chu kì T và độ phóng xạ H",
    latex: "\\lambda=\\frac{\\ln 2}{T},\\qquad H=\\lambda N",
    defaultDisplay: "block",
  },
  {
    id: "nuclide-u238",
    label: "Kí hiệu hạt nhân (U-238, C-14...)",
    description: "Chỉ số khối A phía trên, nguyên tử số Z phía dưới",
    latex: "{}^{238}_{92}\\mathrm{U}",
    defaultDisplay: "inline",
  },
  {
    id: "radiation-rays",
    label: "Các tia phóng xạ α, β⁻, γ",
    description: "Kí hiệu ba loại tia phóng xạ thường gặp",
    latex: "\\alpha,\\ \\beta^{-},\\ \\gamma",
    defaultDisplay: "inline",
  },
  {
    id: "alpha-decay-eq",
    label: "Phương trình phân rã α",
    description: "Phân rã Uranium-238 tạo Thorium-234 và hạt α",
    latex: "{}^{238}_{92}\\mathrm{U}\\rightarrow{}^{234}_{90}\\mathrm{Th}+{}^{4}_{2}\\mathrm{He}",
    defaultDisplay: "block",
  },
  {
    id: "mass-defect-binding",
    label: "Độ hụt khối & Năng lượng liên kết",
    description: "Công thức độ hụt khối Δm và năng lượng liên kết",
    latex: "\\Delta m = Z m_p + (A - Z) m_n - m_X,\\qquad E_{\\text{lk}} = \\Delta m \\cdot c^2",
    defaultDisplay: "block",
  },
  {
    id: "fraction-sqrt",
    label: "Phân số & Căn bậc hai",
    description: "Mẫu phân số, căn thức và lũy thừa cơ bản",
    latex: "\\frac{N}{N_0} = 2^{-\\frac{t}{T}} = \\frac{1}{\\sqrt{2^n}}",
    defaultDisplay: "inline",
  },
];

export function formatFriendlyKatexError(err: unknown, rawLatex: string): string {
  const rawMsg = err instanceof Error ? err.message : String(err ?? "");
  if (/Expected 'EOF', got '}'/i.test(rawMsg) || /Extra \}/i.test(rawMsg)) {
    return "Dư dấu đóng ngoặc nhọn '}' trong công thức.";
  }
  if (
    /Expected '\}', got 'EOF'/i.test(rawMsg) ||
    /Missing \}/i.test(rawMsg) ||
    /expected '\}'/i.test(rawMsg) ||
    /Unexpected end of input in a macro argument/i.test(rawMsg)
  ) {
    return "Thiếu dấu đóng ngoặc nhọn '}' hoặc thiếu đối số cho phân số, chỉ số, nhóm lệnh (VD: \\frac{tử}{mẫu}).";
  }
  if (/Expected '\\right'/i.test(rawMsg)) {
    return "Có \\left nhưng thiếu \\right tương ứng để đóng ngoặc.";
  }
  if (/Undefined control sequence/i.test(rawMsg)) {
    const cmdMatch = rawMsg.match(/Undefined control sequence:\s*(\\[a-zA-Z]+)/i);
    return cmdMatch
      ? `Lệnh LaTeX "${cmdMatch[1]}" không tồn tại hoặc viết sai chính tả.`
      : "Có lệnh LaTeX không hợp lệ (kiểm tra lại dấu gạch chéo \\ và tên lệnh).";
  }
  if (/Double superscript/i.test(rawMsg)) {
    return "Có hai dấu mũ (^) liên tiếp không bọc trong ngoặc nhọn { }.";
  }
  if (/Double subscript/i.test(rawMsg)) {
    return "Có hai dấu chỉ số dưới (_) liên tiếp không bọc trong ngoặc nhọn { }.";
  }
  if (/Expected group after/i.test(rawMsg)) {
    return `Thiếu nội dung trong ngoặc nhọn { } sau lệnh hoặc dấu ^, _ (gốc: ${rawLatex.slice(0, 40)}).`;
  }
  return "Cú pháp công thức chưa hợp lệ. Hãy kiểm tra lại dấu ngoặc { }, dấu ^, _ và tên lệnh LaTeX.";
}

export function renderKatexSafe(
  latex: string,
  displayMode: boolean
): { html: string | null; error: string | null } {
  const trimmed = latex.trim();
  if (!trimmed) {
    return { html: null, error: "Công thức đang để trống." };
  }
  if (trimmed.length > 2000) {
    return { html: null, error: "Công thức quá dài (tối đa 2000 kí tự)." };
  }
  try {
    const html = katex.renderToString(trimmed, {
      displayMode,
      throwOnError: true,
      trust: false,
      strict: "ignore",
      output: "htmlAndMathml",
      maxExpand: 500,
    });
    return { html, error: null };
  } catch (err) {
    return { html: null, error: formatFriendlyKatexError(err, trimmed) };
  }
}

export type MathToken =
  | { kind: "text"; value: string }
  | { kind: "math"; latex: string; raw: string; display: boolean }
  | { kind: "math_error"; raw: string; message: string; display: boolean };

/**
 * Tokenizes a string into plain text, valid math tokens, or unclosed-delimiter error tokens.
 * Supports:
 *   - Block math: \[...\] and $$...$$
 *   - Inline math: \(...\) and $...$ (single line)
 */
export function tokenizeMathSegments(input: string): MathToken[] {
  const tokens: MathToken[] = [];
  let i = 0;
  let textStart = 0;

  function flushText(end: number) {
    if (end > textStart) {
      tokens.push({ kind: "text", value: input.slice(textStart, end) });
    }
  }

  while (i < input.length) {
    // Escaped dollar \$
    if (input[i] === "\\" && input[i + 1] === "$") {
      i += 2;
      continue;
    }

    // Block math: \[ ... \]
    if (input[i] === "\\" && input[i + 1] === "[") {
      flushText(i);
      const closeIdx = input.indexOf("\\]", i + 2);
      if (closeIdx === -1) {
        const raw = input.slice(i);
        tokens.push({
          kind: "math_error",
          raw,
          message: "Thiếu dấu đóng công thức riêng dòng \\].",
          display: true,
        });
        textStart = input.length;
        break;
      }
      const raw = input.slice(i, closeIdx + 2);
      const latex = input.slice(i + 2, closeIdx);
      tokens.push({ kind: "math", latex, raw, display: true });
      i = closeIdx + 2;
      textStart = i;
      continue;
    }

    // Inline math: \( ... \)
    if (input[i] === "\\" && input[i + 1] === "(") {
      flushText(i);
      const closeIdx = input.indexOf("\\)", i + 2);
      if (closeIdx === -1) {
        const lineEnd = input.indexOf("\n", i + 2);
        const endPos = lineEnd === -1 ? input.length : lineEnd;
        const raw = input.slice(i, endPos);
        tokens.push({
          kind: "math_error",
          raw,
          message: "Thiếu dấu đóng công thức trong dòng \\).",
          display: false,
        });
        i = endPos;
        textStart = i;
        continue;
      }
      const raw = input.slice(i, closeIdx + 2);
      const latex = input.slice(i + 2, closeIdx);
      tokens.push({ kind: "math", latex, raw, display: false });
      i = closeIdx + 2;
      textStart = i;
      continue;
    }

    // Block math: $$ ... $$
    if (input[i] === "$" && input[i + 1] === "$") {
      flushText(i);
      const closeIdx = input.indexOf("$$", i + 2);
      if (closeIdx === -1) {
        const raw = input.slice(i);
        tokens.push({
          kind: "math_error",
          raw,
          message: "Thiếu cặp dấu đóng công thức $$.",
          display: true,
        });
        textStart = input.length;
        break;
      }
      const raw = input.slice(i, closeIdx + 2);
      const latex = input.slice(i + 2, closeIdx);
      tokens.push({ kind: "math", latex, raw, display: true });
      i = closeIdx + 2;
      textStart = i;
      continue;
    }

    // Inline math: $ ... $ (within a single line)
    if (input[i] === "$") {
      const lineEnd = input.indexOf("\n", i + 1);
      const searchLimit = lineEnd === -1 ? input.length : lineEnd;
      let closeIdx = -1;
      for (let k = i + 1; k < searchLimit; k++) {
        if (input[k] === "$" && input[k - 1] !== "\\") {
          closeIdx = k;
          break;
        }
      }
      if (closeIdx !== -1) {
        flushText(i);
        const raw = input.slice(i, closeIdx + 1);
        const latex = input.slice(i + 1, closeIdx);
        tokens.push({ kind: "math", latex, raw, display: false });
        i = closeIdx + 1;
        textStart = i;
        continue;
      }
    }

    i += 1;
  }

  flushText(input.length);
  return tokens;
}

export function validatePhysicsContentMath(content: string): {
  valid: boolean;
  errors: { raw: string; message: string }[];
} {
  if (!content || !content.trim()) {
    return { valid: true, errors: [] };
  }
  const tokens = tokenizeMathSegments(content);
  const errors: { raw: string; message: string }[] = [];

  for (const token of tokens) {
    if (token.kind === "math_error") {
      errors.push({ raw: token.raw, message: token.message });
    } else if (token.kind === "math") {
      const res = renderKatexSafe(token.latex, token.display);
      if (res.error) {
        errors.push({ raw: token.raw, message: res.error });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

function sanitizeHref(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Render inline formatting (bold **...**, italic *...*, links [label](url)) on plain text segments.
 * Never uses dangerouslySetInnerHTML; returns safe React nodes.
 */
function renderFormattedPlainText(text: string, keyPrefix: string): React.ReactNode[] {
  const cleaned = text.replace(/\\$/g, "$");
  const pattern = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[[^\]\n]+\]\([^)\s]+\))/g;
  const parts = cleaned.split(pattern);

  return parts.map((part, idx) => {
    const key = `${keyPrefix}-p-${idx}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("[")) {
      const linkMatch = part.match(/^\[([^\]\n]+)\]\(([^)\s]+)\)$/);
      if (linkMatch) {
        const safeUrl = sanitizeHref(linkMatch[2]);
        if (safeUrl) {
          return (
            <a
              key={key}
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rich-physics-link"
            >
              {linkMatch[1]} ↗
            </a>
          );
        }
      }
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

function renderInlineNodes(line: string, keyPrefix: string): React.ReactNode[] {
  const tokens = tokenizeMathSegments(line);
  const nodes: React.ReactNode[] = [];

  tokens.forEach((tok, idx) => {
    const key = `${keyPrefix}-t-${idx}`;
    if (tok.kind === "text") {
      nodes.push(...renderFormattedPlainText(tok.value, key));
      return;
    }
    if (tok.kind === "math_error") {
      nodes.push(
        <span key={key} className="math-syntax-error" role="alert">
          ⚠️ {tok.message} (<code>{tok.raw}</code>)
        </span>
      );
      return;
    }
    const rendered = renderKatexSafe(tok.latex, tok.display);
    if (rendered.error || !rendered.html) {
      nodes.push(
        <span key={key} className="math-syntax-error" role="alert">
          ⚠️ {rendered.error} (<code>{tok.raw}</code>)
        </span>
      );
      return;
    }
    nodes.push(
      <span
        key={key}
        className={tok.display ? "physics-math-block" : "physics-math-inline"}
        dangerouslySetInnerHTML={{ __html: rendered.html }}
      />
    );
  });

  return nodes;
}

const PEDAGOGICAL_LABEL_RE =
  /^(Mục tiêu|Nhiệm vụ(?:\s*\([^)]+\))?|Hướng dẫn|Sản phẩm(?:\s*cần\s*nộp)?|Tiêu chí(?:\s*đạt)?|Hỗ trợ|Bảng mô hình|Câu hỏi|Lưu ý|Yêu cầu)\s*:\s*(.*)$/i;

function renderTextBlockLines(textChunk: string, chunkKey: string): React.ReactNode[] {
  const rawLines = textChunk.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let bulletItems: { key: string; content: string }[] = [];
  let orderedItems: { key: string; content: string }[] = [];

  function flushLists() {
    if (bulletItems.length > 0) {
      const items = bulletItems;
      bulletItems = [];
      elements.push(
        <ul key={`${chunkKey}-ul-${elements.length}`} className="rich-physics-list">
          {items.map((item) => (
            <li key={item.key}>{renderInlineNodes(item.content, item.key)}</li>
          ))}
        </ul>
      );
    }
    if (orderedItems.length > 0) {
      const items = orderedItems;
      orderedItems = [];
      elements.push(
        <ol key={`${chunkKey}-ol-${elements.length}`} className="rich-physics-list">
          {items.map((item) => (
            <li key={item.key}>{renderInlineNodes(item.content, item.key)}</li>
          ))}
        </ol>
      );
    }
  }

  rawLines.forEach((rawLine, lineIdx) => {
    const trimmed = rawLine.trim();
    const lineKey = `${chunkKey}-l-${lineIdx}`;

    if (!trimmed) {
      flushLists();
      return;
    }

    // Heading: ### or ##
    const headingMatch = trimmed.match(/^#{1,3}\s+(.+)$/);
    if (headingMatch) {
      flushLists();
      elements.push(
        <h4 key={lineKey} className="rich-physics-heading">
          {renderInlineNodes(headingMatch[1], lineKey)}
        </h4>
      );
      return;
    }

    // Bullet list: - or * or •
    const bulletMatch = trimmed.match(/^(?:[-•]|\*(?!\*))\s+(.+)$/);
    if (bulletMatch) {
      if (orderedItems.length > 0) flushLists();
      bulletItems.push({ key: lineKey, content: bulletMatch[1] });
      return;
    }

    // Ordered list: 1. or 1)
    const orderedMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (orderedMatch) {
      if (bulletItems.length > 0) flushLists();
      orderedItems.push({ key: lineKey, content: orderedMatch[1] });
      return;
    }

    flushLists();

    // Pedagogical label prefix (e.g., "Mục tiêu: ...", "Nhiệm vụ (20 phút): ...")
    const labelMatch = trimmed.match(PEDAGOGICAL_LABEL_RE);
    if (labelMatch) {
      elements.push(
        <p key={lineKey} className="rich-physics-paragraph rich-physics-labeled">
          <strong className="rich-physics-label">{labelMatch[1]}:</strong>{" "}
          {renderInlineNodes(labelMatch[2], lineKey)}
        </p>
      );
      return;
    }

    elements.push(
      <p key={lineKey} className="rich-physics-paragraph">
        {renderInlineNodes(trimmed, lineKey)}
      </p>
    );
  });

  flushLists();
  return elements;
}

export function RichPhysicsText({
  content,
  className = "",
  compact = false,
}: {
  content?: string | null;
  className?: string;
  compact?: boolean;
}) {
  if (!content || !content.trim()) {
    return null;
  }

  // First split top-level display math blocks (\[...\] and $$...$$) so multi-line display equations stay intact
  const topTokens = tokenizeMathSegments(content);
  const renderedBlocks: React.ReactNode[] = [];
  let inlineBuffer = "";

  function flushInlineBuffer(idx: number) {
    if (!inlineBuffer.trim()) {
      inlineBuffer = "";
      return;
    }
    renderedBlocks.push(...renderTextBlockLines(inlineBuffer, `b-${idx}`));
    inlineBuffer = "";
  }

  topTokens.forEach((tok, idx) => {
    if (tok.kind === "math" && tok.display) {
      flushInlineBuffer(idx);
      const rendered = renderKatexSafe(tok.latex, true);
      if (rendered.error || !rendered.html) {
        renderedBlocks.push(
          <div key={`disp-err-${idx}`} className="math-syntax-error math-syntax-error-block" role="alert">
            ⚠️ {rendered.error} — Công thức gốc: <code>{tok.raw}</code>
          </div>
        );
      } else {
        renderedBlocks.push(
          <div
            key={`disp-${idx}`}
            className="physics-math-block"
            dangerouslySetInnerHTML={{ __html: rendered.html }}
          />
        );
      }
    } else if (tok.kind === "math_error" && tok.display) {
      flushInlineBuffer(idx);
      renderedBlocks.push(
        <div key={`disp-unclosed-${idx}`} className="math-syntax-error math-syntax-error-block" role="alert">
          ⚠️ {tok.message} — Công thức gốc: <code>{tok.raw}</code>
        </div>
      );
    } else if (tok.kind === "text") {
      inlineBuffer += tok.value;
    } else {
      inlineBuffer += tok.raw;
    }
  });

  flushInlineBuffer(topTokens.length);

  return (
    <div className={`rich-physics-text ${compact ? "is-compact" : ""} ${className}`.trim()}>
      {renderedBlocks}
    </div>
  );
}
