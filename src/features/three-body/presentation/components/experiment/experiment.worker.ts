import {
  simulateExperiment,
  type ExperimentConfiguration,
} from "../../../domain/experiment-simulation";
import {
  detectPeriodicity,
  type AnalyzedExperimentTrajectory,
} from "../../../domain/periodicity-detection";

type RunRequest = {
  id: number;
  config: ExperimentConfiguration;
};

type RunResponse =
  | { id: number; ok: true; result: AnalyzedExperimentTrajectory }
  | { id: number; ok: false; error: "tooClose" | "calculationFailed" };

self.onmessage = (event: MessageEvent<RunRequest>) => {
  const { id, config } = event.data;
  try {
    const trajectory = simulateExperiment(config);
    const periodicity = detectPeriodicity(trajectory, {
      G: config.gravity,
      masses: [
        config.bodies[0].mass,
        config.bodies[1].mass,
        config.bodies[2].mass,
      ],
    });
    // Keep the potentially large RK4 checkpoint history off the main thread.
    const { duration, samples, bounds } = trajectory;
    const result: AnalyzedExperimentTrajectory = {
      duration,
      samples,
      bounds,
      periodicity,
    };
    self.postMessage({ id, ok: true, result } satisfies RunResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const reason = /cerca|cercado|acercan|singular/i.test(message)
      ? "tooClose"
      : "calculationFailed";
    self.postMessage({ id, ok: false, error: reason } satisfies RunResponse);
  }
};
