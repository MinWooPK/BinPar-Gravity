import "server-only";
import type { GravityTutor } from "../application/tutor";
import { challenges, gravitationalForce, initialParameters } from "../domain/gravitation";

type ModelResponse = {
  status?: string;
  output?: { type: string; content?: { type: string; text?: string }[] }[];
};

export const openaiTutor: GravityTutor = {
  async explain({ locale, mode, parameters, attempt }) {
    const challenge = attempt && challenges.find((item) => item.id === attempt.challenge);
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL,
        store: false,
        max_output_tokens: 1200,
        instructions: `You teach Newtonian gravitation to adults without physics knowledge. Respond in ${locale}. Use plain text, at most 150 words. Explain only the supplied experiment; never claim to control the app. Masses are kg, distance is metres between centres, force is newtons. Use the supplied deterministic results as numerical truth. If a prediction is present, address it kindly and compare the challenge with the baseline, separately from any current manual changes. Mode simplify means simpler vocabulary; example means a concrete analogy; explain means explain current values and any prediction. Clarify this is a simplified spherical-body model, not orbital motion.`,
        input: JSON.stringify({ mode, parameters, forceNewtons: gravitationalForce(parameters), baseline: initialParameters, baselineForceNewtons: gravitationalForce(initialParameters), attempt, challenge: challenge && { ...challenge, forceNewtons: gravitationalForce(challenge.parameters) } }),
      }),
    });
    if (!response.ok) throw new Error("Tutor provider unavailable");
    const data = await response.json() as ModelResponse;
    const text = data.output?.filter((item) => item.type === "message").flatMap((item) => item.content ?? []).filter((item) => item.type === "output_text").map((item) => item.text ?? "").join("\n").trim();
    if (!text || data.status !== "completed") throw new Error("Incomplete tutor response");
    return text;
  },
};
