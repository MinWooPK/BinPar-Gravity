import {
  isGravityParameterProposal,
  resolveGravityProposal,
} from "../../gravity/application/gravityProposal";

import type {
  TutorContext,
  TutorReply,
  TutorIntent,
} from "../types/tutor.types";

// Valida las respuestas generadas por el Tutor IA y comprueba
// que las propuestas de modificación sean válidas y estén permitidas.
export const parseTutorReply = (
  value: unknown,
  context: TutorContext,
  intent?: TutorIntent,
): TutorReply => {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error("Invalid tutor response");

  // Convierte la respuesta recibida en un objeto para validar sus propiedades.
  const reply = value as Record<string, unknown>;

  if (
    Object.keys(reply).some((key) => key !== "text" && key !== "proposal") ||
    typeof reply.text !== "string" ||
    !reply.text.trim()
  )
    throw new Error("Invalid tutor response");

  // Impide las propuestas de modificación en acciones y etapas educativas.
  if (
    intent === "explain_context" ||
    context.stage === "gravity-challenges" ||
    context.stage === "gravity-understanding" ||
    intent === "explain_formula" ||
    intent === "explain_experiment"
  )
    return { text: reply.text.trim() };

  // Devuelve únicamente la explicación cuando no existe ninguna propuesta.
  if (reply.proposal === null || reply.proposal === undefined)
    return { text: reply.text.trim() };

  // Rechaza las propuestas de gravedad si el contexto,
  // la estructura o los parámetros solicitados no son válidos.
  if (
    context.kind !== "gravity" ||
    !isGravityParameterProposal(reply.proposal) ||
    !resolveGravityProposal(context.parameters, reply.proposal)
  )
    return { text: "", proposalRejected: true };

  return { text: reply.text.trim(), proposal: reply.proposal };
};
