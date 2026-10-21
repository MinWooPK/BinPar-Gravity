import {
  simulateExperiment,
  type ExperimentConfiguration,
  type ExperimentTrajectory,
} from "../../../domain/experiment-simulation";

// Solo enviamos los datos que necesita la animación.
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
  | {
      id: number;
      ok: false;
      error: "tooClose" | "calculationFailed";
    };

self.onmessage = (event: MessageEvent<RunRequest>) => {
  const { id, config } = event.data;

  try {
    // Calcula únicamente la trayectoria gravitatoria.
    const trajectory = simulateExperiment(config);

    // Evita enviar el historial completo de pasos RK4.
    const { duration, samples, bounds } = trajectory;

    const result: SimulationResult = {
      duration,
      samples,
      bounds,
    };

    self.postMessage({
      id,
      ok: true,
      result,
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
