import {
  isGravityParameterProposal,
  resolveGravityProposal,
} from "../../gravity/application/gravityProposal";

import type {
  TutorContext,
  TutorReply,
  TutorIntent,
} from "../types/tutor.types";

// Comprueba la respuesta recibida de la IA.
export const parseTutorReply = (
  valor: unknown,
  contexto: TutorContext,
  intencion?: TutorIntent,
): TutorReply => {
  // Comprueba que sea un objeto.
  if (typeof valor !== "object" || valor === null || Array.isArray(valor))
    throw new Error("Respuesta del tutor no válida");

  const respuesta = valor as Record<string, unknown>;

  // Comprueba que la respuesta tenga el formato correcto.
  if (
    Object.keys(respuesta).some(
      (clave) => clave !== "text" && clave !== "proposal",
    ) ||
    typeof respuesta.text !== "string" ||
    !respuesta.text.trim()
  )
    throw new Error("Respuesta del tutor no válida");

  const texto = respuesta.text.trim();

  // En estas etapas la IA solo puede explicar.
  if (
    intencion === "explain_context" ||
    contexto.stage === "gravity-challenges" ||
    contexto.stage === "gravity-understanding" ||
    intencion === "explain_formula" ||
    intencion === "explain_experiment"
  )
    return { text: texto };

  // Devuelve la explicación si no hay cambios propuestos.
  if (respuesta.proposal === null || respuesta.proposal === undefined)
    return { text: texto };

  // Comprueba que los cambios propuestos sean válidos.
  if (
    contexto.kind !== "gravity" ||
    !isGravityParameterProposal(respuesta.proposal) ||
    !resolveGravityProposal(contexto.parameters, respuesta.proposal)
  )
    return { text: "", proposalRejected: true };

  return { text: texto, proposal: respuesta.proposal };
};
