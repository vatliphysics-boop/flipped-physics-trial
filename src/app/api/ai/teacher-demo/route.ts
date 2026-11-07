import { teacherDemoGrounding, teacherSourceWarning, teacherReviewNotes, type TeacherTask } from "@/lib/local-ai";
import { aiErrorResponse, readAIJSON, runLocalAI, verifyAIRequest } from "@/lib/local-ai-server";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    verifyAIRequest(request);
    const input = await readAIJSON(request, 2000);
    // Public trials can only use built-in public theory; private text remains teacher-only.
    if (!input || typeof input !== "object" || Object.keys(input).some(key => !["lesson", "task", "minutes"].includes(key))) throw new Error("Bản thử chỉ dùng học liệu công khai B21–B25.");
    const grounding = teacherDemoGrounding(input.lesson, input.task as TeacherTask, input.minutes);
    const answer = await runLocalAI(grounding.messages, request.signal, undefined, grounding.maxTokens);
    return Response.json({ ...answer, sources: grounding.sources, partial: grounding.partial, sourceWarning: teacherSourceWarning(answer.reply, grounding.sources), reviewNotes: teacherReviewNotes(answer.reply) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return aiErrorResponse(error); }
}
