import {
  createTutorLimiter,
  readTutorBody,
  TutorBodyTooLargeError,
} from "@/features/ai/infrastructure/requestGuard";
import { parsePracticeRequest } from "@/features/gravity/application/practice/validation";
import {
  checkQuestion,
  nextQuestion,
  startPractice,
} from "@/features/gravity/application/practice/session";
import {
  generateQuestion,
  explainAttempt,
  generateReport,
} from "@/features/gravity/infrastructure/practice/openaiPractice";
import {
  openSession,
  sealSession,
} from "@/features/gravity/infrastructure/practice/sessionToken";
import type { PracticeSession } from "@/features/gravity/types/practice/practice.types";
export const runtime = "nodejs";
const limiter = createTutorLimiter();
const generator = {
  question: generateQuestion,
  explanation: explainAttempt,
  report: generateReport,
};
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
export const POST = async (request: Request) => {
  if (
    request.headers.get("origin") &&
    request.headers.get("origin") !== new URL(request.url).origin
  )
    return json({ error: "invalid_request" }, 403);
  if (
    request.headers.get("content-type")?.split(";")[0].trim() !==
    "application/json"
  )
    return json({ error: "invalid_request" }, 415);
  let data: unknown;
  try {
    data = JSON.parse(await readTutorBody(request));
  } catch (error) {
    return json(
      { error: "invalid_request" },
      error instanceof TutorBodyTooLargeError ? 413 : 400,
    );
  }
  const body = parsePracticeRequest(data);
  if (!body) return json({ error: "invalid_request" }, 400);
  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL)
    return json({ error: "not_configured" }, 503);
  const permit = limiter.acquire(
    request.headers.get("x-forwarded-for")?.split(",")[0].trim().slice(0, 64) ||
      "unknown",
  );
  if (!permit.allowed) return json({ error: "rate_limited" }, 429);
  try {
    let session: PracticeSession;
    let extra = {};
    if (body.action === "start")
      session = await startPractice(body.locale, generator, request.signal);
    else {
      session = openSession(body.token);
      if (body.action === "next")
        session = await nextQuestion(session, generator, request.signal);
      else {
        const result = await checkQuestion(
          session,
          body.answer,
          body.usedHint,
          generator,
          request.signal,
        );
        session = result.session;
        extra = {
          feedback: result.feedback,
          ...(result.report && { report: result.report }),
        };
      }
    }
    return json({
      token: sealSession(session),
      question: session.question,
      count: session.history.length,
      score: session.history.filter((a) => a.correct).length,
      hints: session.history.filter((a) => a.usedHint).length,
      history: session.history.map((a) => ({
        concept: a.question.concept,
        correct: a.correct,
        usedHint: a.usedHint,
      })),
      ...extra,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unavailable";
    console.warn("Practice request failed:", message);
    const invalid = [
      "invalid_session",
      "invalid_phase",
      "invalid_answer",
    ].includes(message);
    return json(
      { error: invalid ? message : "unavailable" },
      invalid ? 400 : 502,
    );
  } finally {
    permit.release();
  }
};
