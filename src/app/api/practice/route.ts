import { createTutorLimiter } from "@/features/ai/infrastructure/requestGuard";

import { readPracticeRequest } from "./_lib/readPracticeRequest";
import { handlePracticeAction } from "./_lib/handlePracticeAction";

export const runtime = "nodejs";

// Limita las peticiones a la API.
const limiter = createTutorLimiter();

// Devuelve JSON sin almacenarlo en caché.
const json = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });

export const POST = async (request: Request) => {
  // Valida la petición recibida.
  const result = await readPracticeRequest(request);

  if (!result.ok) return json({ error: "invalid_request" }, result.status);

  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL)
    return json({ error: "not_configured" }, 503);

  // Controla el número de peticiones por cliente.
  const permit = limiter.acquire(
    request.headers.get("x-forwarded-for")?.split(",")[0].trim().slice(0, 64) ||
      "unknown",
  );

  if (!permit.allowed) {
    return json({ error: "rate_limited" }, 429);
  }

  try {
    // Ejecuta la acción solicitada.
    const response = await handlePracticeAction(result.body, request.signal);

    return json(response);
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
    // Libera el permiso de petición.
    permit.release();
  }
};
