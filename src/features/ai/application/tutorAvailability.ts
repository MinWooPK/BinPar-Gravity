import type { TutorContext } from "../types/tutor.types";

// Define el identificador de la conversación global del Tutor IA.
export type TutorSessionId = "global";

// Devuelve la clave de la sesión del Tutor IA.
export const getTutorSessionKey = (): TutorSessionId => "global";

// Devuelve la clave utilizada para identificar la conversación.
export const getTutorConversationKey = (): TutorSessionId => "global";

// Genera un identificador según la página y la etapa actual.
export const tutorContextId = (context: TutorContext) =>
  `${context.kind}:${context.stage ?? "welcome"}`;
