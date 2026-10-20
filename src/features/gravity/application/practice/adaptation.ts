import type {
  Attempt,
  Concept,
  Difficulty,
} from "../../types/practice/practice.types";

import { PRACTICE_QUESTION_COUNT } from "../../types/practice/practice.types";

const itinerary: Concept[][] = [
  ["attraction"],
  ["mass"],
  ["distance", "square"],
  ["km", "cm"],
  ["force"],
];

export const nextPlan = (history: Attempt[]) => {
  if (history.length >= PRACTICE_QUESTION_COUNT) throw new Error("complete");
  const last = history.at(-1);
  const reinforcement = !!last && !last.correct;
  const difficulty: Difficulty = !last
    ? 1
    : reinforcement
      ? (Math.max(1, last.question.difficulty - 1) as Difficulty)
      : history.slice(-2).length === 2 &&
          history.slice(-2).every((a) => a.correct && !a.usedHint)
        ? (Math.min(3, last.question.difficulty + 1) as Difficulty)
        : last.question.difficulty;
  // Even a repeated difficulty must not crowd all numerical/theory practice out.
  const category = (concept: Concept) =>
    ["km", "cm", "tonnes"].includes(concept)
      ? "conversion"
      : ["square", "power", "force"].includes(concept)
        ? "calculation"
        : "theory";
  const missing = ["theory", "conversion", "calculation"].filter(
    (type) => !history.some((a) => category(a.question.concept) === type),
  );
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
export const learningEvidence = (history: Attempt[]) => ({
  score: history.filter((a) => a.correct).length,
  hints: history.filter((a) => a.usedHint).length,
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
