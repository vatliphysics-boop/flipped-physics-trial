import katex from "katex";
import { mathSegments } from "@/lib/unified-question-bank";

export function QuestionMathText({ text }: { text: string }) {
  let segments: {math:boolean;text:string;html?:string}[]|undefined;
  try {
    segments = mathSegments(text).map(s => ({ ...s, html: s.math ? katex.renderToString(s.text, { throwOnError: true, displayMode: !!s.display, trust: false }) : undefined }));
  } catch { /* Parsing errors are displayed without hiding the question. */ }
  if(!segments)return <span className="error-text">Công thức cần kiểm tra: {text}</span>;
  return <span className="question-latex-text">{segments.map((s, i) => s.math ? <span key={i} dangerouslySetInnerHTML={{ __html: s.html! }} /> : <span key={i}>{s.text}</span>)}</span>;
}
