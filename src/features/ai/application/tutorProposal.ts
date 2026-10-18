import {
  resolveGravityProposal,
  sameGravityParameters,
} from "../../gravity/application/gravityProposal";
import type {
  GravityProposalPort,
  TutorProposal,
} from "../types/proposal.types";
import type { TutorContext } from "../types/tutor.types";

type ProposalTarget = {
  context: TutorContext;
  gravity?: GravityProposalPort;
} | null;

/** All permissions and snapshots are local; none originate in model output. */
export const decideTutorProposal = (
  proposal: TutorProposal,
  decision: "apply" | "cancel",
  target: ProposalTarget,
): TutorProposal => {
  if (proposal.status !== "pending") return proposal;
  if (decision === "cancel") return { ...proposal, status: "cancelled" };
  const fresh =
    target?.context.kind === "gravity" &&
    target.gravity &&
    target.gravity.apply === proposal.source.apply &&
    target.gravity.revision === proposal.source.revision &&
    JSON.stringify(target.context) === proposal.contextSnapshot &&
    sameGravityParameters(target.context.parameters, proposal.baseline) &&
    resolveGravityProposal(target.context.parameters, proposal.action);
  const applied =
    fresh && target.gravity?.apply(proposal.action, proposal.source.revision);
  return { ...proposal, status: applied ? "applied" : "stale" };
};
