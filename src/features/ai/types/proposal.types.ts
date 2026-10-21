import type { GravityParameters, GravityParameterProposal } from "../../gravity/types/gravity.types";

/** Local capabilities, never serialized or accepted from model output. */
export type GravityProposalPort = {
  revision: number;
  apply: (proposal: GravityParameterProposal, expectedRevision: number) => boolean;
  reveal: () => void;
};
export type TutorProposal = {
  kind: "gravity";
  action: GravityParameterProposal;
  baseline: GravityParameters;
  source: GravityProposalPort;
  contextSnapshot: string;
  status: "pending" | "applied" | "cancelled" | "stale";
};
