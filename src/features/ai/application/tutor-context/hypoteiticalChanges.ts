import {
  gravitationalForce,
  isWithinLaboratoryRange,
} from "../../../gravity/domain/gravitation";

import type { GravityParameters } from "../../../gravity/types/gravity.types";

// Cambios utilizados para explicar la ley de Newton.
const changes = [
  { variable: "mass1", factor: 2 },
  { variable: "mass2", factor: 2 },
  { variable: "distance", factor: 2 },
  { variable: "distance", factor: 0.5 },
] as const;

// Calcula cómo cambiaría la fuerza sin modificar el laboratorio.
export const buildHypotheticalChanges = (
  current: GravityParameters,
  currentForce: number,
) =>
  changes.map(({ variable, factor }) => {
    const parameters = {
      ...current,
      [variable]: current[variable] * factor,
    };

    const forceNewtons = gravitationalForce(parameters);

    return {
      variable,
      factor,
      parameters,
      forceNewtons,
      forceRatioToCurrent: forceNewtons / currentForce,
      withinLaboratoryRange: isWithinLaboratoryRange(parameters),
    };
  });
