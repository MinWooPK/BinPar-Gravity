import "server-only";
import { TUTOR_TIMEOUT_MS } from "../application/tutor";
import type { Tutor } from "../types/tutor.types";
import { buildTutorPrompt } from "../application/tutorPrompt";
import { parseTutorReply } from "../application/tutorResponse";
import { tutorResponseFormat } from "./tutorResponseFormat";

type ModelResponse = {
  status?: string;
  output?: { type: string; content?: { type: string; text?: string }[] }[];
};

/** One server-only provider for the laboratory, gallery and all orbit details. */
export const openaiTutor: Tutor = {
  async explain(request, signal) {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(TUTOR_TIMEOUT_MS)])
        : AbortSignal.timeout(TUTOR_TIMEOUT_MS),
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL,
        store: false,
        max_output_tokens: 1200,
        ...(request.context.kind === "gravity" && { text: { format: tutorResponseFormat } }),
        ...buildTutorPrompt(request),
      }),
    });
    if (!response.ok) throw new Error("Tutor provider unavailable");
    const data = await response.json() as ModelResponse;
    const text = data.output?.filter((item) => item.type === "message")
      .flatMap((item) => item.content ?? [])
      .filter((item) => item.type === "output_text")
      .map((item) => item.text ?? "").join("\n").trim();
    if (!text || data.status !== "completed") throw new Error("Incomplete tutor response");
    return parseTutorReply(request.context.kind === "gravity" ? JSON.parse(text) : { text }, request.context, request.intent);
  },
};
