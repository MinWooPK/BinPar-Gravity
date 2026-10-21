import {
  readTutorBody,
  TutorBodyTooLargeError,
} from "@/features/ai/infrastructure/requestGuard";

import { parsePracticeRequest } from "@/features/gravity/application/practice/validation";

import type { PracticeRequest } from "@/features/gravity/types/practice/practice.types";

type RequestResult =
  | { ok: true; body: PracticeRequest }
  | { ok: false; status: 400 | 403 | 413 | 415 };

// Valida el origen, el formato y los datos de la petición.
export const readPracticeRequest = async (
  request: Request,
): Promise<RequestResult> => {
  const origin = request.headers.get("origin");

  if (origin && origin !== new URL(request.url).origin)
    return { ok: false, status: 403 };

  if (
    request.headers.get("content-type")?.split(";")[0].trim() !==
    "application/json"
  )
    return { ok: false, status: 415 };

  let data: unknown;

  try {
    data = JSON.parse(await readTutorBody(request));
  } catch (error) {
    return {
      ok: false,
      status: error instanceof TutorBodyTooLargeError ? 413 : 400,
    };
  }

  const body = parsePracticeRequest(data);

  if (!body) return { ok: false, status: 400 };

  return { ok: true, body };
};
