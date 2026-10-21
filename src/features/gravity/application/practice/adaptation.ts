import type {
  Attempt,
  Concept,
  Difficulty,
} from "../../types/practice/practice.types";

import { PRACTICE_QUESTION_COUNT } from "../../types/practice/practice.types";

// Conceptos de las cinco preguntas.
const itinerary: Concept[][] = [
  ["attraction"],
  ["mass"],
  ["distance", "square"],
  ["km", "cm"],
  ["force"],
];

// Prepara la siguiente pregunta según las respuestas anteriores.
export const nextPlan = (history: Attempt[]) => {
  if (history.length >= PRACTICE_QUESTION_COUNT) throw new Error("complete");

  const last = history.at(-1);
  const reinforcement = !!last && !last.correct;

  // Ajusta la dificultad según los aciertos.
  const recent = history.slice(-2);

  const difficulty: Difficulty = !last
    ? 1
    : reinforcement
      ? (Math.max(1, last.question.difficulty - 1) as Difficulty)
      : recent.length === 2 && recent.every((a) => a.correct && !a.usedHint)
        ? (Math.min(3, last.question.difficulty + 1) as Difficulty)
        : last.question.difficulty;

  // Clasifica los conceptos por categoría.
  const category = (concept: Concept) =>
    ["km", "cm", "tonnes"].includes(concept)
      ? "conversion"
      : ["square", "power", "force"].includes(concept)
        ? "calculation"
        : "theory";

  // Busca categorías que todavía no se han evaluado.
  const missing = ["theory", "conversion", "calculation"].filter(
    (type) => !history.some((a) => category(a.question.concept) === type),
  );

  // Elige los conceptos de la siguiente pregunta.
  let allowed = reinforcement
    ? [
        last.question.concept === "distance" ||
        last.question.concept === "reasoning"
          ? ("square" as const)
          : last.question.concept,
      ]
    : itinerary[history.length];

  // Asegura que se evalúen todas las categorías.
  if (PRACTICE_QUESTION_COUNT - history.length <= missing.length) {
    allowed =
      missing[0] === "conversion"
        ? ["km", "tonnes"]
        : missing[0] === "calculation"
          ? ["force"]
          : ["mutual"];
  }

  return {
    allowed,
    difficulty,
    reinforcement:
      (reinforcement &&
        category(allowed[0]) === category(last.question.concept)) ||
      (reinforcement && allowed[0] === "square"),
  };
};

// Resume los resultados del usuario.
export const learningEvidence = (history: Attempt[]) => ({
  // Respuestas correctas.
  score: history.filter((a) => a.correct).length,

  // Pistas utilizadas.
  hints: history.filter((a) => a.usedHint).length,

  // Resultados de cada concepto.
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
