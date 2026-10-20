import "server-only";

import { TUTOR_TIMEOUT_MS } from "../application/tutor";

// Realiza una petición a la API de OpenAI desde el servidor
// y devuelve el texto generado por el modelo.
export const requestOpenAI = async (
  payload: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<string> => {
  // Envía la petición a OpenAI con el modelo, la API Key
  // y los límites de tiempo y tokens configurados.
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    signal: signal
      ? AbortSignal.any([signal, AbortSignal.timeout(TUTOR_TIMEOUT_MS)])
      : AbortSignal.timeout(TUTOR_TIMEOUT_MS),
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL,
      store: false,
      max_output_tokens: 2200,
      ...payload,
    }),
  });

  if (!response.ok) throw new Error("Provider unavailable");

  // Convierte la respuesta de OpenAI en un objeto
  // que contiene el estado y los mensajes generados.
  const data = (await response.json()) as {
    status?: string;
    output?: {
      type: string;
      content?: {
        type: string;
        text?: string;
      }[];
    }[];
  };

  // Extrae y combina los fragmentos de texto generados por el modelo.
  const text = data.output
    ?.filter((item) => item.type === "message")
    .flatMap((item) => item.content ?? [])
    .filter((item) => item.type === "output_text")
    .map((item) => item.text ?? "")
    .join("\n")
    .trim();

  if (!text || data.status !== "completed")
    throw new Error("Incomplete provider response");

  return text;
};
