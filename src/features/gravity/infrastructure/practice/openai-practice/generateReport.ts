import "server-only";

import { learningEvidence } from "@/features/gravity/application/practice/adaptation";

import {
  onlyKeys,
  record,
} from "@/features/gravity/application/practice/validation";

import {
  PRACTICE_QUESTION_COUNT,
  type Attempt,
  type Locale,
  type Report,
} from "@/features/gravity/types/practice/practice.types";

import {
  array,
  boundedText,
  call,
  obj,
  str,
  texts,
} from "./openaiPracticeHelpers";

// Genera el informe final a partir de las cinco respuestas.
export const generateReport = async (
  history: Attempt[],
  locale: Locale,
  signal?: AbortSignal,
): Promise<Report> => {
  if (history.length !== PRACTICE_QUESTION_COUNT) {
    throw new Error("incomplete");
  }

  // Solicita las fortalezas, dificultades y recomendaciones.
  const raw = await call(
    "gravity_report",
    obj({
      summary: str,
      strengths: array(str),
      review: array(str),
      recommendations: array(
        obj({
          stage: {
            type: "string",
            enum: [
              "gravity-discovery",
              "gravity-understanding",
              "gravity-laboratory",
            ],
          },
          text: str,
        }),
      ),
    }),
    `Write a cautious learning report in ${locale}, 200 words maximum. Never mention AI, IA or OpenAI. Use ONLY supplied results and hint usage. No learner profile or claims about unevaluated skills. One isolated answer is limited evidence. strengths only for concepts with correct answers; review only evaluated concepts needing practice or hints. Recommendations must explain what to review and where: gravity-discovery for attraction/mutual/basic concepts; gravity-understanding for formula, units, conversions, square and scientific notation; gravity-laboratory for manipulating masses/distances. At most three recommendations, only these actual stages. Do not invent score or answers.`,
    learningEvidence(history),
    signal,
  );

  // Comprueba la estructura y el contenido del informe.
  if (
    !record(raw) ||
    !onlyKeys(raw, ["summary", "strengths", "review", "recommendations"]) ||
    !boundedText(raw.summary) ||
    !texts(raw.strengths) ||
    !texts(raw.review) ||
    !Array.isArray(raw.recommendations) ||
    raw.recommendations.length < 1 ||
    raw.recommendations.length > 3 ||
    !raw.recommendations.every(
      (recommendation) =>
        record(recommendation) &&
        onlyKeys(recommendation, ["stage", "text"]) &&
        [
          "gravity-discovery",
          "gravity-understanding",
          "gravity-laboratory",
        ].includes(String(recommendation.stage)) &&
        boundedText(recommendation.text),
    )
  ) {
    throw new Error("invalid_model_response");
  }

  return raw as Report;
};
