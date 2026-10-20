export type ExperimentBodyField = "mass" | "x" | "y" | "vx" | "vy";
export type ExperimentBodyChanges = Record<ExperimentBodyField, number | null>;

/** Null preserves the user's current value; body order is always 1, 2, 3. */
export type ThreeBodyParameterProposal = {
  action: "set_three_body_parameters";
  parameters: {
    gravity: number | null;
    duration: number | null;
    bodies: readonly ExperimentBodyChanges[];
  };
};
