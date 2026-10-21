import {
  resolveGravityProposal,
  sameGravityParameters,
} from "../../gravity/application/gravityProposal";

import type {
  GravityProposalPort,
  TutorProposal,
} from "../types/proposal.types";

import type { TutorContext } from "../types/tutor.types";

// Datos necesarios para aplicar una propuesta.
type DestinoPropuesta = {
  context: TutorContext;
  gravity?: GravityProposalPort;
} | null;

// Confirma o cancela los cambios propuestos por la IA.
export const decideTutorProposal = (
  propuesta: TutorProposal,
  decision: "apply" | "cancel",
  destino: DestinoPropuesta,
): TutorProposal => {
  // Solo permite propuestas pendientes.
  if (propuesta.status !== "pending") return propuesta;

  // Cancela la propuesta.
  if (decision === "cancel") return { ...propuesta, status: "cancelled" };

  // Comprueba que los datos siguen siendo válidos.
  const valida =
    destino?.context.kind === "gravity" &&
    destino.context.stage !== "gravity-understanding" &&
    destino.context.stage !== "gravity-challenges" &&
    destino.gravity &&
    destino.gravity.apply === propuesta.source.apply &&
    destino.gravity.revision === propuesta.source.revision &&
    JSON.stringify(destino.context) === propuesta.contextSnapshot &&
    sameGravityParameters(destino.context.parameters, propuesta.baseline) &&
    resolveGravityProposal(destino.context.parameters, propuesta.action);

  // Aplica los cambios si están permitidos.
  const aplicada =
    valida &&
    destino.gravity?.apply(propuesta.action, propuesta.source.revision);

  return { ...propuesta, status: aplicada ? "applied" : "stale" };
};
