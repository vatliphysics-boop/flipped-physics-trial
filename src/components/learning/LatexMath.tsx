import React from "react";
import katex from "katex";

interface LatexMathProps {
  math: string;
  block?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Crisp, publication-grade LaTeX math renderer powered by KaTeX.
 */
export function LatexMath({
  math,
  block = false,
  className = "",
  style,
}: LatexMathProps) {
  const html = katex.renderToString(math, {
    throwOnError: false,
    displayMode: block,
    strict: false,
  });

  if (block) {
    return (
      <div
        className={`latex-math-block ${className}`}
        style={{
          overflowX: "auto",
          padding: "4px 0",
          ...style,
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`latex-math-inline ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
