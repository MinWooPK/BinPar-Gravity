import {
  simulateExperiment,
  type ExperimentConfiguration,
  type ExperimentTrajectory,
} from "../../../domain/experiment-simulation";

// Datos necesarios para la animación.
type SimulationResult = Pick<
  ExperimentTrajectory,
  "duration" | "samples" | "bounds"
>;

type RunRequest = {
  id: number;
  config: ExperimentConfiguration;
};

type RunResponse =
  | { id: number; ok: true; result: SimulationResult }
  | { id: number; ok: false; error: "tooClose" | "calculationFailed" };

// Recibe los parámetros y calcula la simulación.
self.onmessage = (event: MessageEvent<RunRequest>) => {
  const { id, config } = event.data;

  try {
    const { duration, samples, bounds } = simulateExperiment(config);

    // Envía solo los datos necesarios.
    self.postMessage({
      id,
      ok: true,
      result: { duration, samples, bounds },
    } satisfies RunResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    const reason = /cerca|cercado|acercan|singular/i.test(message)
      ? "tooClose"
      : "calculationFailed";

    self.postMessage({
      id,
      ok: false,
      error: reason,
    } satisfies RunResponse);
  }
};
