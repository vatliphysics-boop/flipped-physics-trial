import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

const formulaMarkup = new Map();

export function MathLine({ tex, className = "" }) {
  if (!tex) return null;
  if (!formulaMarkup.has(tex)) formulaMarkup.set(tex, katex.renderToString(tex, { throwOnError: true, output: "html", strict: "error" }));
  return <div className={`math-line ${className}`} dangerouslySetInnerHTML={{ __html: formulaMarkup.get(tex) }} />;
}
