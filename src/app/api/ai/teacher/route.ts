import { teacherGrounding, teacherSourceWarning, teacherReviewNotes, type TeacherTask } from "@/lib/local-ai";
import { aiErrorResponse, readAIJSON, runLocalAI, verifyAIRequest } from "@/lib/local-ai-server";
import { isAITeacher } from "@/lib/ai-teacher-auth";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    verifyAIRequest(request);
    if (!await isAITeacher()) return Response.json({ error: "Cần đăng nhập tài khoản giáo viên." }, { status: 401 });
    const { text, task, focus, context } = await readAIJSON(request, 250000);
    const grounding = teacherGrounding(text, task as TeacherTask, focus, context);
    const answer = await runLocalAI(grounding.messages, request.signal, undefined, grounding.maxTokens);
    return Response.json({ ...answer, sources: grounding.sources, partial: grounding.partial, sourceWarning: teacherSourceWarning(answer.reply, grounding.sources), reviewNotes: teacherReviewNotes(answer.reply) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return aiErrorResponse(error); }
}
