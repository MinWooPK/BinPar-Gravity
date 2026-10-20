import type { GravityStageId } from "../../gravity/types/journey.types";
import type {
  GravityParameters,
  GravityParameterProposal,
} from "../../gravity/types/gravity.types";

export type GravityTutorContext = {
  kind: "gravity";
  stage: GravityStageId | null;
  parameters: GravityParameters;
};
export type TutorContext =
  | GravityTutorContext
  | {
      kind: "home";
      stage: null;
    }
  | {
      kind: "three-body";
      stage:
        | "discover"
        | "understand"
        | "gallery"
        | "experiment"
        | "orbit"
        | null;
      slug?: string;
      configuration?: import("../../three-body/domain/experiment-simulation").ExperimentConfiguration;
      result?: import("../../three-body/domain/periodicity-detection").PeriodicityResult;
      status?:
        | "idle"
        | "calculating"
        | "complete"
        | "invalid"
        | "tooClose"
        | "calculationFailed";
    };
export type TutorMessage = { role: "user" | "assistant"; content: string };
export type TutorIntent =
  | "explain_formula"
  | "explain_experiment"
  | "explain_context";
export type TutorRequest = {
  intent?: TutorIntent;
  locale: "es" | "en" | "fr";
  mode: "explain" | "simplify" | "example";
  context: TutorContext;
  messages: TutorMessage[];
};
export type Tutor = {
  explain(request: TutorRequest, signal?: AbortSignal): Promise<TutorReply>;
};
export type TutorReply = {
  text: string;
  proposal?: GravityParameterProposal;
  proposalRejected?: true;
};
