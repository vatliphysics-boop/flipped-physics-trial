import { localAIStatus } from "@/lib/local-ai-server";
export const runtime = "nodejs";
export async function GET() {
  const localReady = await localAIStatus();
  return Response.json(
    { ready: true, localModelReady: localReady, engine: "physics-socratic-hybrid" },
    { headers: { "Cache-Control": "no-store" } }
  );
}
