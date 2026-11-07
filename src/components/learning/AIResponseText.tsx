"use client";
import { RichPhysicsText } from "./RichPhysicsText";

// Render KaTeX math (\(…\), \[…\], $…$, $$…$$), formatting, and structured paragraphs cleanly.
export function AIResponseText({ text }: { text: string }) {
  return <RichPhysicsText content={text} compact />;
}
