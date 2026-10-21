import type { ExperimentTrajectory } from "../../../../domain/experiment-simulation";

// El hilo principal solo necesita los datos para visualizar el experimento.
export type SimulationResult = Pick<
  ExperimentTrajectory,
  "duration" | "samples" | "bounds"
>;

export type SimulationError = "tooClose" | "calculationFailed";

export type ExperimentWorkerResponse =
  | { id: number; ok: true; result: SimulationResult }
  | { id: number; ok: false; error: SimulationError };
