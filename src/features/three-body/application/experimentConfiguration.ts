import {
  validateExperimentState,
  type ExperimentConfiguration,
} from "../domain/experiment-simulation";

import { validateGravityParameters } from "../domain/newtonian-physics";

// Define el valor máximo permitido para los datos del experimento.
export const EXPERIMENT_VALUE_LIMIT = 1e12;

// Define la separación mínima inicial entre los tres cuerpos.
export const EXPERIMENT_INITIAL_SEPARATION = 0.05;

// Define las propiedades físicas de cada cuerpo del experimento.
export const experimentBodyFields = ["mass", "x", "y", "vx", "vy"] as const;

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

// Comprueba que un valor sea un objeto válido y no un array.
const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

// Comprueba que un objeto tenga exactamente las propiedades esperadas.
const exactKeys = (value: Record<string, unknown>, keys: readonly string[]) =>
  Object.keys(value).length === keys.length &&
  keys.every((key) => Object.hasOwn(value, key));

// Verifica que unos datos externos tengan la estructura
// y los valores válidos de una configuración del experimento.
export const isExperimentConfiguration = (
  value: unknown,
): value is ExperimentConfiguration => {
  if (
    !record(value) ||
    !exactKeys(value, ["gravity", "duration", "bodies"]) ||
    !Array.isArray(value.bodies) ||
    value.bodies.length !== 3
  )
    return false;

  // Comprueba que un valor sea numérico, finito y esté dentro del límite.
  const numeric = (v: unknown): v is number =>
    typeof v === "number" &&
    Number.isFinite(v) &&
    Math.abs(v) <= EXPERIMENT_VALUE_LIMIT;

  if (
    !numeric(value.gravity) ||
    !numeric(value.duration) ||
    !value.bodies.every(
      (body) =>
        record(body) &&
        exactKeys(body, experimentBodyFields) &&
        experimentBodyFields.every((key) => numeric(body[key])),
    )
  )
    return false;

  return (
    experimentConfigurationError(value as ExperimentConfiguration) === null
  );
};

// Compara dos configuraciones del experimento para comprobar
// si tienen exactamente los mismos parámetros físicos.
export const sameExperimentConfiguration = (
  a: ExperimentConfiguration,
  b: ExperimentConfiguration,
) =>
  a.gravity === b.gravity &&
  a.duration === b.duration &&
  a.bodies.length === b.bodies.length &&
  a.bodies.every((body, index) =>
    experimentBodyFields.every((key) => body[key] === b.bodies[index][key]),
  );
