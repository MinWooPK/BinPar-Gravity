import type { ExperimentConfiguration } from "../domain/experiment-simulation";
import type { ThreeBodyParameterProposal } from "../types/experiment-proposal.types";

import {
  experimentBodyFields,
  EXPERIMENT_VALUE_LIMIT,
  isExperimentConfiguration,
  sameExperimentConfiguration,
} from "./experimentConfiguration";

// Comprueba que un valor sea un objeto válido y no un array.
const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

// Comprueba que un objeto tenga exactamente las propiedades esperadas.
const exactKeys = (value: Record<string, unknown>, keys: readonly string[]) =>
  Object.keys(value).length === keys.length &&
  keys.every((key) => Object.hasOwn(value, key));

// Verifica que una propuesta del Tutor IA tenga la estructura
// y los valores permitidos para modificar el experimento.
export const isThreeBodyParameterProposal = (
  value: unknown,
): value is ThreeBodyParameterProposal => {
  if (
    !record(value) ||
    !exactKeys(value, ["action", "parameters"]) ||
    value.action !== "set_three_body_parameters" ||
    !record(value.parameters)
  )
    return false;

  // Obtiene los parámetros incluidos en la propuesta.
  const p = value.parameters;

  // Comprueba que los valores sean números válidos o null,
  // respetando los límites y las restricciones de positividad.
  const numeric = (
    v: unknown,
    positive = false,
    max = EXPERIMENT_VALUE_LIMIT,
  ) =>
    v === null ||
    (typeof v === "number" &&
      Number.isFinite(v) &&
      Math.abs(v) <= max &&
      (!positive || v > 0));

  return (
    exactKeys(p, ["gravity", "duration", "bodies"]) &&
    numeric(p.gravity, true) &&
    numeric(p.duration, true, 100) &&
    Array.isArray(p.bodies) &&
    p.bodies.length === 3 &&
    p.bodies.every(
      (body) =>
        record(body) &&
        exactKeys(body, experimentBodyFields) &&
        experimentBodyFields.every((key) => numeric(body[key], key === "mass")),
    )
  );
};

// Combina una propuesta válida del Tutor IA con los parámetros actuales,
// verificando que el resultado sea válido y contenga cambios reales.
export const resolveThreeBodyProposal = (
  current: ExperimentConfiguration,
  value: unknown,
): ExperimentConfiguration | null => {
  if (
    !isExperimentConfiguration(current) ||
    !isThreeBodyParameterProposal(value)
  )
    return null;

  // Obtiene los parámetros propuestos por el Tutor IA.
  const p = value.parameters;

  // Construye la nueva configuración, conservando los valores
  // actuales cuando la propuesta contiene null.
  const next: ExperimentConfiguration = {
    gravity: p.gravity ?? current.gravity,
    duration: p.duration ?? current.duration,
    bodies: current.bodies.map((body, i) => ({
      mass: p.bodies[i].mass ?? body.mass,
      x: p.bodies[i].x ?? body.x,
      y: p.bodies[i].y ?? body.y,
      vx: p.bodies[i].vx ?? body.vx,
      vy: p.bodies[i].vy ?? body.vy,
    })),
  };

  return isExperimentConfiguration(next) &&
    !sameExperimentConfiguration(current, next)
    ? next
    : null;
};
