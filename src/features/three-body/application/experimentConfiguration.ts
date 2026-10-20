import {
  validateExperimentState,
  type ExperimentConfiguration,
} from "../domain/experiment-simulation";

import { validateGravityParameters } from "../domain/newtonian-physics";

// Define la separación mínima inicial entre los tres cuerpos.
const EXPERIMENT_INITIAL_SEPARATION = 0.05;

// Define las propiedades físicas de cada cuerpo del experimento.
const experimentBodyFields = ["mass", "x", "y", "vx", "vy"] as const;

// Comprueba que la configuración del experimento sea válida
// antes de ejecutar la simulación de los tres cuerpos.
export const experimentConfigurationError = (
  config: ExperimentConfiguration,
) => {
  // Obtiene la gravedad, duración y cuerpos de la configuración.
  const { gravity, duration, bodies } = config;

  if (
    bodies.length !== 3 ||
    ![
      gravity,
      duration,
      ...bodies.flatMap((body) => experimentBodyFields.map((key) => body[key])),
    ].every(Number.isFinite)
  )
    return "invalidNumber";

  if (gravity <= 0) return "invalidGravity";

  if (duration <= 0 || duration > 100) return "invalidDurationLimit";

  if (bodies.some((body) => body.mass <= 0)) return "invalidMass";

  for (let i = 0; i < 3; i++)
    for (let j = i + 1; j < 3; j++) {
      if (
        Math.hypot(bodies[i].x - bodies[j].x, bodies[i].y - bodies[j].y) <
        EXPERIMENT_INITIAL_SEPARATION
      )
        return "tooClose";
    }

  // Reutiliza las validaciones del motor físico sin ejecutar la simulación.
  validateGravityParameters({
    G: gravity,
    masses: [bodies[0].mass, bodies[1].mass, bodies[2].mass],
  });

  validateExperimentState(bodies.flatMap(({ x, y, vx, vy }) => [x, y, vx, vy]));

  return null;
};
