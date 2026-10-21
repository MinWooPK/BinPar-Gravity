import {
  checkQuestion,
  nextQuestion,
  startPractice,
  type PracticeGenerator,
} from "@/features/gravity/application/practice/session";

import {
  generateQuestion,
  explainAttempt,
  generateReport,
} from "@/features/gravity/infrastructure/practice/openai-practice/openaiPractice";

import {
  openSession,
  sealSession,
} from "@/features/gravity/infrastructure/practice/sessionToken";

import type {
  PracticeRequest,
  PracticeSession,
  PracticeView,
} from "@/features/gravity/types/practice/practice.types";

// Funciones de IA utilizadas durante la evaluación.
const generator: PracticeGenerator = {
  question: generateQuestion,
  explanation: explainAttempt,
  report: generateReport,
};

// Gestiona las acciones de la evaluación.
export const handlePracticeAction = async (
  body: PracticeRequest,
  signal: AbortSignal,
): Promise<PracticeView> => {
  let session: PracticeSession;

  let extra: Partial<Pick<PracticeView, "feedback" | "report">> = {};

  if (body.action === "start") {
    session = await startPractice(body.locale, generator, signal);
  } else {
    // Recupera la sesión protegida.
    session = openSession(body.token);

    if (body.action === "next") {
      session = await nextQuestion(session, generator, signal);
    } else {
      // Corrige la respuesta y actualiza el historial.
      const result = await checkQuestion(
        session,
        body.answer,
        body.usedHint,
        generator,
        signal,
      );

      session = result.session;

      extra = {
        feedback: result.feedback,
        ...(result.report && { report: result.report }),
      };
    }
  }

  // Devuelve el token actualizado y el progreso.
  return {
    token: sealSession(session),
    question: session.question,
    count: session.history.length,
    score: session.history.filter((a) => a.correct).length,
    hints: session.history.filter((a) => a.usedHint).length,
    history: session.history.map((a) => ({
      concept: a.question.concept,
      correct: a.correct,
      usedHint: a.usedHint,
    })),
    ...extra,
  };
};
