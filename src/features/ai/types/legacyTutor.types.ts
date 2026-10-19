import type { GravityParameters } from "../../gravity/types/gravity.types";

export type TutorRequest = {
  locale: "es" | "en" | "fr";
  mode: "explain" | "simplify" | "example";
  parameters: GravityParameters;
};
