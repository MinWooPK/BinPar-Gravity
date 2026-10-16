import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { challenges } from "@/features/gravity/domain/gravitation";
import type { TutorRequest } from "@/features/gravity/application/tutor";
import { openaiTutor } from "@/features/gravity/infrastructure/openaiTutor";

export const GET = async () => Response.json({ status: "ok", message: "Gravity Lab API" });

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;
const validNumber = (value: unknown, min: number, max: number) => typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
const validRequest = (value: unknown): value is TutorRequest => {
  if (!isRecord(value) || typeof value.locale !== "string" || !hasLocale(routing.locales, value.locale) || !["explain", "simplify", "example"].includes(String(value.mode)) || !isRecord(value.parameters)) return false;
  const { mass1, mass2, distance } = value.parameters;
  if (!validNumber(mass1, 1e13, 1e14) || !validNumber(mass2, 1e13, 1e14) || !validNumber(distance, 5000, 20000)) return false;
  const attempt = value.attempt;
  if (attempt !== undefined && (!isRecord(attempt) || !challenges.some((item) => item.id === attempt.challenge) || !["same", "double", "four", "quarter"].includes(String(attempt.prediction)))) return false;
  return true;
};

export const POST = async (request: Request) => {
  if (request.headers.get("origin") && request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ error: "invalid_request" }, { status: 403 });
  if (!request.headers.get("content-type")?.includes("application/json")) return Response.json({ error: "invalid_request" }, { status: 415 });
  const raw = await request.text();
  if (raw.length > 4096) return Response.json({ error: "invalid_request" }, { status: 413 });
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return Response.json({ error: "invalid_request" }, { status: 400 }); }
  if (!validRequest(body)) return Response.json({ error: "invalid_request" }, { status: 400 });
  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL) return Response.json({ error: "not_configured" }, { status: 503 });
  try {
    return Response.json({ text: await openaiTutor.explain(body) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "unavailable" }, { status: 502 });
  }
};
