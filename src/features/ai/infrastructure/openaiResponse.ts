import "server-only";
import { TUTOR_TIMEOUT_MS } from "../application/tutor";
/** Shared server-only transport; callers own their prompts, schemas and validation. */
export const requestOpenAI = async (
  payload: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<string> => {
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
