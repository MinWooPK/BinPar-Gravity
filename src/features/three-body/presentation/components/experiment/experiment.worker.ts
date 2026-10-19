import {
  simulateExperiment,
  type ExperimentConfiguration,
  type ExperimentTrajectory,
} from "../../../domain/experiment-simulation";

type RunRequest = {
  id: number;
  config: ExperimentConfiguration;
};

type RunResponse =
  | { id: number; ok: true; result: ExperimentTrajectory }
  | { id: number; ok: false; error: "tooClose" | "calculationFailed" };

self.onmessage = (event: MessageEvent<RunRequest>) => {
  const { id, config } = event.data;
  try {
    const result = simulateExperiment(config);
    self.postMessage({ id, ok: true, result } satisfies RunResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const reason = /cerca|cercado|acercan|singular/i.test(message)
      ? "tooClose"
      : "calculationFailed";
    self.postMessage({ id, ok: false, error: reason } satisfies RunResponse);
  }
};
