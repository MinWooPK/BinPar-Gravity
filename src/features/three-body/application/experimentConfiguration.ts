import {
  validateExperimentState,
  type ExperimentConfiguration,
} from "../domain/experiment-simulation";

import { validateGravityParameters } from "../domain/newtonian-physics";

// Distancia mínima inicial entre cuerpos.
const EXPERIMENT_INITIAL_SEPARATION = 0.05;

// Propiedades físicas de cada cuerpo.
const experimentBodyFields = ["mass", "x", "y", "vx", "vy"] as const;

// Valida la configuración antes de simular.
export const experimentConfigurationError = (
  config: ExperimentConfiguration,
) => {
  const { gravity, duration, bodies } = config;

  // Comprueba que haya tres cuerpos y números válidos.
  if (
    bodies.length !== 3 ||
    ![
      gravity,
      duration,
      ...bodies.flatMap((body) => experimentBodyFields.map((key) => body[key])),
    ].every(Number.isFinite)
  ) {
    return "invalidNumber";
  }

  // Comprueba la gravedad, duración y masas.
  if (gravity <= 0) return "invalidGravity";
  if (duration <= 0 || duration > 100) return "invalidDurationLimit";
  if (bodies.some((body) => body.mass <= 0)) return "invalidMass";

  // Comprueba que los cuerpos no estén demasiado cerca.
  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) {
      if (
        Math.hypot(bodies[i].x - bodies[j].x, bodies[i].y - bodies[j].y) <
        EXPERIMENT_INITIAL_SEPARATION
      ) {
        return "tooClose";
      }
    }
  }

  // Valida los parámetros del motor físico.
  validateGravityParameters({
    G: gravity,
    masses: [bodies[0].mass, bodies[1].mass, bodies[2].mass],
  });

  validateExperimentState(bodies.flatMap(({ x, y, vx, vy }) => [x, y, vx, vy]));

  return null;
};
