import {
  isGravityParameterProposal,
  resolveGravityProposal,
} from "../../gravity/application/gravityProposal";
import type {
  TutorContext,
  TutorReply,
  TutorIntent,
} from "../types/tutor.types";

/** Validate model output on the server and the API response again in the browser. */
export const parseTutorReply = (
  value: unknown,
  context: TutorContext,
  intent?: TutorIntent,
): TutorReply => {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error("Invalid tutor response");
  const reply = value as Record<string, unknown>;
  if (
    Object.keys(reply).some((key) => key !== "text" && key !== "proposal") ||
    typeof reply.text !== "string" ||
    !reply.text.trim()
  )
    throw new Error("Invalid tutor response");
  // Educational launches are read-only even if the model returns an action.
  if (
    intent === "explain_context" ||
    context.stage === "gravity-challenges" ||
    context.stage === "gravity-understanding" ||
    intent === "explain_formula" ||
    intent === "explain_experiment"
  )
    return { text: reply.text.trim() };
  if (reply.proposal === null || reply.proposal === undefined)
    return { text: reply.text.trim() };
  // Invalid actions never reach confirmation. The presentation supplies a localized
  // explanation instead of repeating potentially misleading model text.
  if (
    context.kind !== "gravity" ||
    !isGravityParameterProposal(reply.proposal) ||
    !resolveGravityProposal(context.parameters, reply.proposal)
  )
    return { text: "", proposalRejected: true };
  return { text: reply.text.trim(), proposal: reply.proposal };
};
