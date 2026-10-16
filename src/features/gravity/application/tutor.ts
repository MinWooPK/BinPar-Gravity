import type { GravityParameters, LearningAttempt } from "../domain/gravitation";

export type TutorRequest = {
  locale: "es" | "en" | "fr";
  mode: "explain" | "simplify" | "example";
  parameters: GravityParameters;
  attempt?: LearningAttempt;
};
export interface GravityTutor {
  explain(request: TutorRequest): Promise<string>;
}
