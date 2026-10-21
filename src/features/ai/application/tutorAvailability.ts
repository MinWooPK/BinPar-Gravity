import type { TutorContext } from "../types/tutor.types";

// Identificador de la conversación.
export type TutorSessionId = "global";

// Devuelve la sesión del Tutor IA.
export const getTutorSessionKey = (): TutorSessionId => "global";

// Reutiliza la misma función.
export const getTutorConversationKey = getTutorSessionKey;

// Identifica la sección y etapa actual.
export const tutorContextId = (contexto: TutorContext) =>
  `${contexto.kind}:${contexto.stage ?? "welcome"}`;
