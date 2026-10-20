import { evaluateAnswer } from "../../domain/practice/evaluation";
import { PRACTICE_QUESTION_COUNT } from "../../types/practice/practice.types";

import type {
  Answer,
  Attempt,
  Locale,
  PracticeSession,
  Question,
  Report,
} from "../../types/practice/practice.types";
export type PracticeGenerator = {
  question: (
    history: Attempt[],
    locale: Locale,
    signal?: AbortSignal,
  ) => Promise<Question>;
  explanation: (
    attempt: Attempt,
    locale: Locale,
    signal?: AbortSignal,
  ) => Promise<{
    explanation: string;
    steps: string[];
  }>;
  report: (
    history: Attempt[],
    locale: Locale,
    signal?: AbortSignal,
  ) => Promise<Report>;
};
export const startPractice = async (
  locale: Locale,
  generator: PracticeGenerator,
  signal?: AbortSignal,
) =>
  ({
    locale,
    expires: Date.now() + 24 * 60 * 60 * 1000,
    history: [],
    question: await generator.question([], locale, signal),
    phase: "question",
  }) satisfies PracticeSession;
export const nextQuestion = async (
  session: PracticeSession,
  generator: PracticeGenerator,
  signal?: AbortSignal,
): Promise<PracticeSession> => {
  if (
    session.phase !== "checked" ||
    session.history.length >= PRACTICE_QUESTION_COUNT
  )
    throw new Error("invalid_phase");
  return {
    ...session,
    question: await generator.question(session.history, session.locale, signal),
    phase: "question",
  };
};
export const checkQuestion = async (
  session: PracticeSession,
  answer: Answer,
  usedHint: boolean,
  generator: PracticeGenerator,
  signal?: AbortSignal,
) => {
  if (
    session.phase !== "question" ||
    session.history.length >= PRACTICE_QUESTION_COUNT
  )
    throw new Error("invalid_phase");
  const attempt = evaluateAnswer(session.question, answer, usedHint);
  const history = [...session.history, attempt];
  const explanation = await generator.explanation(
    attempt,
    session.locale,
    signal,
  );
  const report =
    history.length === PRACTICE_QUESTION_COUNT
      ? await generator.report(history, session.locale, signal)
      : undefined;
  return {
    session: {
      ...session,
      history,
      phase: report ? "complete" : "checked",
    } as PracticeSession,
    feedback: {
      correct: attempt.correct,
      expected: attempt.expected,
      actual: attempt.actual,
      error: attempt.error,
      ...explanation,
    },
    ...(report && { report }),
  };
};
