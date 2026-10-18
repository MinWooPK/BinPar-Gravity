import type { GravityStageId } from "../../gravity/types/journey.types";
import type { GravityParameters, LearningAttempt, Prediction } from "../../gravity/types/gravity.types";

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
export type Tutor = {
  explain(request: TutorRequest, signal?: AbortSignal): Promise<string>;
};
