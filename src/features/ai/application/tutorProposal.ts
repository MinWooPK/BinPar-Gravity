import { resolveThreeBodyProposal } from "../../three-body/application/experimentProposal";
import { sameExperimentConfiguration } from "../../three-body/application/experimentConfiguration";
import {
  resolveGravityProposal,
  sameGravityParameters,
} from "../../gravity/application/gravityProposal";
import type {
  GravityProposalPort,
  ThreeBodyProposalPort,
  TutorProposal,
} from "../types/proposal.types";
import type { TutorContext } from "../types/tutor.types";

type ProposalTarget = {
  context: TutorContext;
  gravity?: GravityProposalPort;
  threeBody?: ThreeBodyProposalPort;
} | null;

/** All permissions and snapshots are local; none originate in model output. */
export const decideTutorProposal = (
  proposal: TutorProposal,
  decision: "apply" | "cancel",
  target: ProposalTarget,
): TutorProposal => {
  if (proposal.status !== "pending") return proposal;
  if (decision === "cancel") return { ...proposal, status: "cancelled" };
  if (proposal.kind === "three-body") {
    const current = target?.context.kind === "three-body" ? target.context.draftConfiguration : undefined;
    const port = target?.threeBody;
    const fresh = current && port && port.apply === proposal.source.apply &&
      port.revision === proposal.source.revision && JSON.stringify(target.context) === proposal.contextSnapshot &&
      sameExperimentConfiguration(current, proposal.baseline) && resolveThreeBodyProposal(current, proposal.action);
    return { ...proposal, status: fresh && port.apply(proposal.action, proposal.source.revision) ? "applied" : "stale" };
  }
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
  const applied =
    fresh && target.gravity?.apply(proposal.action, proposal.source.revision);
  return { ...proposal, status: applied ? "applied" : "stale" };
};
