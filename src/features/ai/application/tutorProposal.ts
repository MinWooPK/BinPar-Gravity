import {
  resolveGravityProposal,
  sameGravityParameters,
} from "../../gravity/application/gravityProposal";

import type {
  GravityProposalPort,
  TutorProposal,
} from "../types/proposal.types";

import type { TutorContext } from "../types/tutor.types";

// Define el contexto y las funciones disponibles para aplicar
// propuestas del Tutor IA en Gravedad.
type ProposalTarget = {
  context: TutorContext;
  gravity?: GravityProposalPort;
} | null;

// Gestiona la confirmación o cancelación de las propuestas del Tutor IA,
// comprobando que los parámetros y permisos sigan siendo válidos.
export const decideTutorProposal = (
  proposal: TutorProposal,
  decision: "apply" | "cancel",
  target: ProposalTarget,
): TutorProposal => {
  if (proposal.status !== "pending") return proposal;

  if (decision === "cancel") return { ...proposal, status: "cancelled" };

  // Comprueba que la propuesta de gravedad siga siendo válida,
  // esté autorizada en la etapa actual y no utilice datos antiguos.
  const fresh =
    target?.context.kind === "gravity" &&
    target.context.stage !== "gravity-understanding" &&
    target.context.stage !== "gravity-challenges" &&
    target.gravity &&
    target.gravity.apply === proposal.source.apply &&
    target.gravity.revision === proposal.source.revision &&
    JSON.stringify(target.context) === proposal.contextSnapshot &&
    sameGravityParameters(target.context.parameters, proposal.baseline) &&
    resolveGravityProposal(target.context.parameters, proposal.action);

  // Intenta aplicar los parámetros de gravedad si la propuesta es válida.
  const applied =
    fresh && target.gravity?.apply(proposal.action, proposal.source.revision);

  return { ...proposal, status: applied ? "applied" : "stale" };
};
