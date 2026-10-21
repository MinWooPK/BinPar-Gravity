import {
  gravitationalForce,
  GRAVITATIONAL_CONSTANT,
  initialParameters,
  laboratoryLimits,
} from "../../../gravity/domain/gravitation";

import { gravityDiscovery } from "./gravityDiscovery";
import { buildHypotheticalChanges } from "./hypoteiticalChanges";

import type { TutorContext } from "../../types/tutor.types";

// Construye el contexto científico que recibe el Tutor IA.
export const buildTutorContext = (context: TutorContext) => {
  // Fuerza inicial y fuerza actual del laboratorio.
  const baselineForce = gravitationalForce(initialParameters);
  const currentForce = gravitationalForce(context.parameters);

  return {
    kind: context.kind,
    stage: context.stage,

    model:
      "Newtonian attraction between two spherical bodies; this is not an orbital simulation",

    units: {
      mass: "kg",
      distance: "metres between centres",
      force: "newtons",
    },

    gravitationalConstant: GRAVITATIONAL_CONSTANT,

    laboratory: {
      limits: laboratoryLimits,
      scale:
        "Everyday masses in kilograms and centre-to-centre distances in metres. Their gravitational forces are very small and are displayed in scientific notation, not rounded to zero.",
      illustration:
        "Sphere sizes and separation are illustrative, not to scale. The arrows show equal and opposite force directions, not force magnitudes.",
    },

    // Añade los contenidos educativos solo en Descubre.
    ...(context.stage === "gravity-discovery" && {
      discovery: gravityDiscovery,
    }),

    current: {
      ...context.parameters,
      forceNewtons: currentForce,
    },

    // Ejemplos numéricos para explicar los cambios de fuerza.
    hypotheticalChanges: buildHypotheticalChanges(
      context.parameters,
      currentForce,
    ),

    baseline: {
      ...initialParameters,
      forceNewtons: baselineForce,
    },
  };
};
