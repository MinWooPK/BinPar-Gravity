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

// Define las funciones necesarias para generar preguntas,
// explicaciones e informes mediante el proveedor de IA.
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

// Inicia una nueva práctica con el historial vacío,
// genera la primera pregunta y establece una sesión de 24 horas.
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

// Genera la siguiente pregunta manteniendo el historial
// y comprobando que la sesión puede continuar.
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

// Corrige la respuesta, actualiza el historial y obtiene
// la explicación o el informe final cuando termina la práctica.
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

  // Evalúa la respuesta y registra el resultado del intento.
  const attempt = evaluateAnswer(session.question, answer, usedHint);

  // Añade el nuevo intento al historial de la práctica.
  const history = [...session.history, attempt];

  // Obtiene la explicación de la respuesta evaluada.
  const explanation = await generator.explanation(
    attempt,
    session.locale,
    signal,
  );

  // Genera el informe final cuando se completan las cinco preguntas.
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
