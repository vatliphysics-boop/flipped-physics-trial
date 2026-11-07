import {
  studentGrounding,
  studentHintFormat,
  studentHintReply,
  validateStudentChat,
} from "@/lib/local-ai";
import {
  aiErrorResponse,
  localAIStatus,
  readAIJSON,
  runLocalAI,
  verifyAIRequest,
} from "@/lib/local-ai-server";
import { generateSmartStudentPhysicsReply } from "@/lib/student-physics-chat-engine";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    verifyAIRequest(request);
    const chat = validateStudentChat(await readAIJSON(request, 40000));
    const grounding = studentGrounding(chat);

    const hasLocalOllama = await localAIStatus();
    if (hasLocalOllama) {
      try {
        const answer = await runLocalAI(
          grounding.messages,
          request.signal,
          chat.mode === "hint" ? studentHintFormat(grounding.sources) : undefined
        );
        if (chat.mode === "hint") {
          answer.reply = studentHintReply(answer.reply, grounding.sources);
        }
        return Response.json(
          {
            ...answer,
            sources: grounding.sources,
            title: grounding.title,
            href: grounding.href,
          },
          { headers: { "Cache-Control": "no-store" } }
        );
      } catch {
        // Fallback below
      }
    }

    const smartAnswer = generateSmartStudentPhysicsReply(
      chat.lesson,
      chat.mode,
      chat.messages
    );
    return Response.json(
      {
        ...smartAnswer,
        sources: grounding.sources,
        title: grounding.title,
        href: grounding.href,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return aiErrorResponse(error);
  }
}
