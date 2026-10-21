import { isTutorRequest as isLegacyTutorRequest } from "./legacyTutorRequest";

import { isRecord, isTutorRequest, locales } from "./validation";

import type { TutorRequest } from "../../types/tutor.types";

// Permite reutilizar las validaciones desde este archivo.
export { isTutorContext, isTutorRequest } from "./validation";

// Procesa las peticiones actuales y las del antiguo Tutor IA.
export const parseTutorRequest = (value: unknown): TutorRequest | null => {
  if (isTutorRequest(value)) return value;

  if (
    !isRecord(value) ||
    "context" in value ||
    "messages" in value ||
    !isLegacyTutorRequest(value, locales)
  )
    return null;

  // Preguntas predeterminadas para el formato antiguo.
  const legacyQuestions = {
    es: "Explica el experimento actual y mi predicción, si existe.",
    en: "Explain the current experiment and my prediction, if any.",
    fr: "Explique l’expérience actuelle et ma prédiction, le cas échéant.",
  };

  return {
    locale: value.locale,
    mode: String(value.mode) as TutorRequest["mode"],
    context: {
      kind: "gravity",
      stage: null,
      parameters: {
        mass1: value.parameters.mass1,
        mass2: value.parameters.mass2,
        distance: value.parameters.distance,
      },
    },
    messages: [
      {
        role: "user",
        content: legacyQuestions[value.locale],
      },
    ],
  };
};
