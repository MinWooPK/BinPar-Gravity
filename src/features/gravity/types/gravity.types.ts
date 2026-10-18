export type GravityParameters = { mass1: number; mass2: number; distance: number };
export type Prediction = "same" | "double" | "four" | "quarter";
export type LearningAttempt = { challenge: "oneMass" | "bothMasses" | "distance"; prediction: Prediction };
export type GravityVariable = keyof GravityParameters | "force";
export type GravityValues = GravityParameters & { force: number };

/** The only supported tutor proposal; null preserves an existing parameter. */
export type GravityParameterProposal = {
  action: "set_gravity_parameters";
  parameters: { mass1: number | null; mass2: number | null; distance: number | null };
};
