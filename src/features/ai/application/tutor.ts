import type { GravityStageId } from "../../gravity/components/gravityJourney";
import type { GravityParameters, LearningAttempt, Prediction } from "../../gravity/domain/gravitation";

export const TUTOR_MAX_MESSAGES = 12;
export const TUTOR_MAX_MESSAGE_LENGTH = 1200;
export const TUTOR_MAX_TOTAL_MESSAGE_LENGTH = 6000;
export const TUTOR_MAX_BODY_BYTES = 32_768;
export const TUTOR_TIMEOUT_MS = 25_000;

export type ChallengeId = LearningAttempt["challenge"];
export type TutorContext =
  | {
      kind: "gravity";
      stage: GravityStageId | null;
      parameters: GravityParameters;
      challenge?: ChallengeId;
      prediction?: Prediction;
      attempt?: LearningAttempt;
    }
  | { kind: "three-body"; slug?: string };

export type TutorMessage = { role: "user" | "assistant"; content: string };
export type TutorRequest = {
  locale: "es" | "en" | "fr";
  mode: "explain" | "simplify" | "example";
  context: TutorContext;
  messages: TutorMessage[];
};

export interface Tutor {
  explain(request: TutorRequest, signal?: AbortSignal): Promise<string>;
}
