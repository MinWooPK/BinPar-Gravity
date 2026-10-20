import type { TutorMessage, TutorRequest } from "./tutor.types";
import type { TutorProposal } from "./proposal.types";

export type ChatMessage = TutorMessage & { id: number; contextId?: string; proposal?: TutorProposal };
export type TutorSession = {
  messages: ChatMessage[];
  draft: string;
  pending: boolean;
  error: "error" | "notConfigured" | "rateLimited" | "contextUnavailable" | "";
  request?: TutorRequest;
  snapshot?: string;
};
