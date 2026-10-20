import type {
  Attempt,
  Concept,
  Difficulty,
} from "../../types/practice/practice.types";

import { PRACTICE_QUESTION_COUNT } from "../../types/practice/practice.types";

// Define los conceptos que se pueden evaluar en cada una de las cinco preguntas.
const itinerary: Concept[][] = [
  ["attraction"],
  ["mass"],
  ["distance", "square"],
  ["km", "cm"],
  ["force"],
];

// Determina los conceptos y la dificultad de la siguiente pregunta según el historial.
export const nextPlan = (history: Attempt[]) => {
  if (history.length >= PRACTICE_QUESTION_COUNT) throw new Error("complete");

  // Obtiene la última respuesta registrada.
  const last = history.at(-1);

  // Indica si es necesario reforzar el aprendizaje por una respuesta incorrecta.
  const reinforcement = !!last && !last.correct;

  // Calcula el nivel de dificultad de la siguiente pregunta.
  const difficulty: Difficulty = !last
    ? 1
    : reinforcement
      ? (Math.max(1, last.question.difficulty - 1) as Difficulty)
      : history.slice(-2).length === 2 &&
          history.slice(-2).every((a) => a.correct && !a.usedHint)
        ? (Math.min(3, last.question.difficulty + 1) as Difficulty)
        : last.question.difficulty;

  // Clasifica los conceptos como teoría, conversión de unidades o cálculo.
  const category = (concept: Concept) =>
    ["km", "cm", "tonnes"].includes(concept)
      ? "conversion"
      : ["square", "power", "force"].includes(concept)
        ? "calculation"
        : "theory";

  // Identifica las categorías que todavía no se han evaluado.
  const missing = ["theory", "conversion", "calculation"].filter(
    (type) => !history.some((a) => category(a.question.concept) === type),
  );

  // Selecciona los conceptos permitidos para la siguiente pregunta.
  let allowed = reinforcement
    ? [
        last.question.concept === "distance" ||
        last.question.concept === "reasoning"
          ? ("square" as const)
          : last.question.concept,
      ]
    : itinerary[history.length];

  if (PRACTICE_QUESTION_COUNT - history.length <= missing.length)
    allowed =
      missing[0] === "conversion"
        ? ["km", "tonnes"]
        : missing[0] === "calculation"
          ? ["force"]
          : ["mutual"];

  return {
    allowed,
    difficulty,
    reinforcement:
      (reinforcement &&
        category(allowed[0]) === category(last.question.concept)) ||
      (reinforcement && allowed[0] === "square"),
  };
};

// Resume los resultados del usuario para evaluar su aprendizaje.
export const learningEvidence = (history: Attempt[]) => ({
  // Número de respuestas correctas.
  score: history.filter((a) => a.correct).length,

  // Número de preguntas en las que se ha utilizado una pista.
  hints: history.filter((a) => a.usedHint).length,

  // Agrupa los intentos por concepto para identificar aciertos y dificultades.
  concepts: [...new Set(history.map((a) => a.question.concept))].map(
    (concept) => ({
      concept,
      attempts: history
        .filter((a) => a.question.concept === concept)
        .map((a) => ({
          correct: a.correct,
          usedHint: a.usedHint,
          error: a.error,
        })),
    }),
  ),
});
