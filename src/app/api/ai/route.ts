import { parseTutorRequest } from "@/features/ai/application/tutorRequest";
import { openaiTutor } from "@/features/ai/infrastructure/openaiTutor";
import {
  createTutorLimiter,
  readTutorBody,
  TutorBodyTooLargeError,
} from "@/features/ai/infrastructure/requestGuard";

export const GET = async () => Response.json({ status: "ok", message: "Gravity Lab API" });

const invalidRequest = (status: number) =>
  Response.json({ error: "invalid_request" }, { status, headers: { "Cache-Control": "no-store" } });
const limiter = createTutorLimiter();

export const POST = async (request: Request) => {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return invalidRequest(403);
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return invalidRequest(415);

  let body: unknown;
  try {
    body = JSON.parse(await readTutorBody(request));
  } catch (error) {
    return invalidRequest(error instanceof TutorBodyTooLargeError ? 413 : 400);
  }
  const tutorRequest = parseTutorRequest(body);
  if (!tutorRequest) return invalidRequest(400);
  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL) {
    return Response.json({ error: "not_configured" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  // The global cap also applies when proxy IP headers are unavailable or spoofed.
  const client = request.headers.get("x-forwarded-for")?.split(",")[0].trim().slice(0, 64) || "unknown";
  const permit = limiter.acquire(client);
  if (!permit.allowed) {
    return Response.json({ error: "rate_limited" }, {
      status: 429,
      headers: { "Cache-Control": "no-store", "Retry-After": String(permit.retryAfterSeconds) },
    });
  }

  try {
    return Response.json(
      { text: await openaiTutor.explain(tutorRequest, request.signal) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "unavailable" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  } finally {
    permit.release();
  }
};
