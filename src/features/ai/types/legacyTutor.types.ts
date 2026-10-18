import type { GravityParameters, LearningAttempt } from "../../gravity/types/gravity.types";

export type TutorRequest = {
  locale: "es" | "en" | "fr";
  mode: "explain" | "simplify" | "example";
  parameters: GravityParameters;
  attempt?: LearningAttempt;
};
