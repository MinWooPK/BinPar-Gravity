/** Body state: x, y, vx, vy. Normalized units: G = m1 = m2 = m3 = 1. */
export type Body = readonly [number, number, number, number];
export type State = readonly [Body, Body, Body];
export type OrbitDefinition = {
  slug: string;
  name: string;
  category: "Clásica" | "Coreografía" | "Periódica";
  year: string;
  description: string;
  insight: string;
  period: number;
  initial: State;
  source: string;
  sourceLabel: string;
  convention: string;
};
type Diagnostics = {
  closure: number;
  positionClosure: number;
  maxEnergyDrift: number;
  maxMomentum: number;
  maxAngularDrift: number;
  maxCenterOfMass: number;
  minSeparation: number;
  acceptedSteps: number;
  rejectedSteps: number;
};
export type OrbitData = {
  slug: string;
  period: number;
  /** Equally spaced physical times, including both t=0 and t=T. */
  samples: number[][];
  bounds: { cx: number; cy: number; radius: number };
  diagnostics: Diagnostics;
};
