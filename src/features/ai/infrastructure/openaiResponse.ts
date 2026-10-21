import "server-only";

import { TUTOR_TIMEOUT_MS } from "../application/tutor";

// Envía una petición a OpenAI desde el servidor.
export const requestOpenAI = async (
  peticion: Record<string, unknown>,
  senal?: AbortSignal,
): Promise<string> => {
  // Envía los datos al modelo.
  const respuesta = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    signal: senal
      ? AbortSignal.any([senal, AbortSignal.timeout(TUTOR_TIMEOUT_MS)])
      : AbortSignal.timeout(TUTOR_TIMEOUT_MS),
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL,
      store: false,
      max_output_tokens: 2200,
      ...peticion,
    }),
  });

  if (!respuesta.ok) throw new Error("Provider unavailable");

  // Obtiene la respuesta de OpenAI.
  const datos = (await respuesta.json()) as {
    status?: string;
    output?: {
      type: string;
      content?: {
        type: string;
        text?: string;
      }[];
    }[];
  };

  // Extrae el texto generado.
  const texto = datos.output
    ?.filter((elemento) => elemento.type === "message")
    .flatMap((elemento) => elemento.content ?? [])
    .filter((elemento) => elemento.type === "output_text")
    .map((elemento) => elemento.text ?? "")
    .join("\n")
    .trim();

  if (!texto || datos.status !== "completed")
    throw new Error("Incomplete provider response");

  return texto;
};
