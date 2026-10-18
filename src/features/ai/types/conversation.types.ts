import type { TutorMessage, TutorRequest } from "./tutor.types";

export type ChatMessage = TutorMessage & { id: number };
export type TutorSession = {
  messages: ChatMessage[];
  draft: string;
  pending: boolean;
  error: "error" | "notConfigured" | "rateLimited" | "contextUnavailable" | "";
  request?: TutorRequest;
  snapshot?: string;
};
