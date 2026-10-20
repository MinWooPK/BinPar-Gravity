import type { GravityParameters, GravityParameterProposal } from "../../gravity/types/gravity.types";
import type { ExperimentConfiguration } from "../../three-body/domain/experiment-simulation";
import type { ThreeBodyParameterProposal } from "../../three-body/types/experiment-proposal.types";

/** Local capabilities, never serialized or accepted from model output. */
export type GravityProposalPort = {
  revision: number;
  apply: (proposal: GravityParameterProposal, expectedRevision: number) => boolean;
  reveal: () => void;
};
export type ThreeBodyProposalPort = {
  revision: number;
  configuration: ExperimentConfiguration | null;
  apply: (proposal: ThreeBodyParameterProposal, expectedRevision: number) => boolean;
  reveal: () => void;
};
type ProposalState = { contextSnapshot: string; status: "pending" | "applied" | "cancelled" | "stale" };
export type TutorProposal = ProposalState & (
  | { kind: "gravity"; action: GravityParameterProposal; baseline: GravityParameters; source: GravityProposalPort }
  | { kind: "three-body"; action: ThreeBodyParameterProposal; baseline: ExperimentConfiguration; source: ThreeBodyProposalPort }
);
