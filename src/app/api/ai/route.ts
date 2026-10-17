import { routing } from "@/i18n/routing";
import { isTutorRequest } from "@/features/gravity/application/tutorRequest";
import { openaiTutor } from "@/features/gravity/infrastructure/openaiTutor";

export const GET = async () => Response.json({ status: "ok", message: "Gravity Lab API" });

const invalidRequest = (status: number) =>
  Response.json({ error: "invalid_request" }, { status });

export const POST = async (request: Request) => {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return invalidRequest(403);
  if (!request.headers.get("content-type")?.includes("application/json")) return invalidRequest(415);

  const raw = await request.text();
  if (raw.length > 4096) return invalidRequest(413);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return invalidRequest(400);
  }
  if (!isTutorRequest(body, routing.locales)) return invalidRequest(400);
  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  try {
    return Response.json(
      { text: await openaiTutor.explain(body) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "unavailable" }, { status: 502 });
  }
};
