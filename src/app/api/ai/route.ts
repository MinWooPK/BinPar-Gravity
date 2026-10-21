import { parseTutorRequest } from "@/features/ai/application/tutor-request/tutorRequest";
import { openaiTutor } from "@/features/ai/infrastructure/openaiTutor";
import { getTranslations } from "next-intl/server";
import {
  createTutorLimiter,
  readTutorBody,
  TutorBodyTooLargeError,
} from "@/features/ai/infrastructure/requestGuard";

// Comprueba que la API está funcionando.
export const GET = async () =>
  Response.json({ status: "ok", message: "Gravity Lab API" });

// Devuelve un error HTTP sin almacenar la respuesta en caché.
const invalidRequest = (status: number) =>
  Response.json(
    { error: "invalid_request" },
    { status, headers: { "Cache-Control": "no-store" } },
  );

// Controla cuántas solicitudes puede realizar un cliente.
const limiter = createTutorLimiter();

export const POST = async (request: Request) => {
  // SEGURIDAD: comprueba el origen de la petición.
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return invalidRequest(403);

  // Solo acepta peticiones con contenido JSON.
  if (
    request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  )
    return invalidRequest(415);

  // Lee el body y comprueba que sea un JSON válido
  // y que no supere el tamaño permitido.
  let body: unknown;
  try {
    body = JSON.parse(await readTutorBody(request));
  } catch (error) {
    return invalidRequest(error instanceof TutorBodyTooLargeError ? 413 : 400);
  }

  // Valida los datos enviados al Tutor IA.
  const tutorRequest = parseTutorRequest(body);
  if (!tutorRequest) return invalidRequest(400);

  // Comprueba que la API Key y el modelo estén configurados.
  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL) {
    return Response.json(
      { error: "not_configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  // LIMITACIÓN: identifica al cliente por IP para controlar solicitudes.
  // También existe un límite global como protección adicional.
  const client =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim().slice(0, 64) ||
    "unknown";

  const permit = limiter.acquire(client);

  // Si supera el límite, devuelve 429 y el tiempo de espera.
  if (!permit.allowed) {
    return Response.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(permit.retryAfterSeconds),
        },
      },
    );
  }

  try {
    // IA: envía la petición validada a OpenAI y obtiene la respuesta.
    const reply = await openaiTutor.explain(tutorRequest, request.signal);

    // Si la IA rechaza una propuesta, devuelve un mensaje traducido.
    const t = reply.proposalRejected
      ? await getTranslations({
          locale: tutorRequest.locale,
          namespace: "Tutor",
        })
      : null;

    // Devuelve al frontend la respuesta generada.
    return Response.json(t ? { text: t("proposalRejected") } : reply, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    // Error de comunicación o procesamiento del Tutor IA.
    return Response.json(
      { error: "unavailable" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  } finally {
    // Libera el permiso adquirido, incluso si ocurre un error.
    permit.release();
  }
};
