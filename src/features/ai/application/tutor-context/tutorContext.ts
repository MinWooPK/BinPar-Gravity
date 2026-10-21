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
  // Calcula la fuerza inicial y la fuerza actual del laboratorio.
  const baselineForce = gravitationalForce(initialParameters);
  const currentForce = gravitationalForce(context.parameters);

  return {
    kind: context.kind,
    stage: context.stage,

    model:
      "Atracción gravitatoria de Newton entre dos cuerpos esféricos. Este modelo no representa una simulación orbital.",

    units: {
      mass: "kilogramos",
      distance: "metros entre los centros de los cuerpos",
      force: "newtons",
    },

    gravitationalConstant: GRAVITATIONAL_CONSTANT,

    laboratory: {
      limits: laboratoryLimits,

      scale:
        "El laboratorio utiliza masas cotidianas expresadas en kilogramos y distancias entre los centros de los cuerpos expresadas en metros. Las fuerzas gravitatorias son muy pequeñas, por lo que se muestran en notación científica en lugar de redondearse a cero.",

      illustration:
        "Los tamaños de las esferas y su separación son ilustrativos y no están representados a escala. Las flechas indican fuerzas de igual magnitud y sentidos opuestos, pero su longitud no representa la magnitud de esas fuerzas.",
    },

    // Añade los contenidos educativos únicamente en la etapa Descubre.
    ...(context.stage === "gravity-discovery" && {
      discovery: gravityDiscovery,
    }),

    // Parámetros actuales y fuerza calculada.
    current: {
      ...context.parameters,
      forceNewtons: currentForce,
    },

    // Ejemplos numéricos de cómo cambia la fuerza gravitatoria.
    hypotheticalChanges: buildHypotheticalChanges(
      context.parameters,
      currentForce,
    ),

    // Parámetros y fuerza de referencia.
    baseline: {
      ...initialParameters,
      forceNewtons: baselineForce,
    },
  };
};
