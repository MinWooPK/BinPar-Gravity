import type { GravityParameters, GravityParameterProposal } from "../../gravity/types/gravity.types";

/** Local capability, never serialized to the model or accepted from its response. */
export type GravityProposalPort = {
  revision: number;
  apply: (proposal: GravityParameterProposal, expectedRevision: number) => boolean;
};
export type TutorProposal = {
  action: GravityParameterProposal;
  baseline: GravityParameters;
  source: GravityProposalPort;
  contextSnapshot: string;
  status: "pending" | "applied" | "cancelled" | "stale";
};
