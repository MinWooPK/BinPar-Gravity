import { buildThreeBodyTutorContext } from "./threeBodyTutorContext";
import {
  gravitationalForce,
  GRAVITATIONAL_CONSTANT,
  initialParameters,
  isWithinLaboratoryRange,
  laboratoryLimits,
} from "../../gravity/domain/gravitation";
import type { TutorContext } from "../types/tutor.types";

// Aligned with the discovery panel; these facts are owned by the server, not dialogue.
const gravityDiscovery = {
  definition:
    "Every body with mass attracts other bodies with mass. Gravity acts at a distance; the forces on two bodies have equal magnitude and opposite directions.",
  effects: ["falling objects", "the motion of the Moon and planets", "tides"],
  illustration:
    "The Earth–Moon diagram is conceptual: sizes and distances are not to scale, and it is not an orbital simulation.",
  history: [
    {
      name: "Galileo Galilei",
      contribution:
        "Studied motion and free fall through experiments and mathematical descriptions.",
    },
    {
      name: "Johannes Kepler",
      contribution:
        "Formulated laws describing planetary orbits from astronomical observations.",
    },
    {
      name: "Isaac Newton",
      year: 1687,
      contribution:
        "Published the law of universal gravitation in the Principia, building on earlier work and relating falling bodies to the motion of the Moon and planets. He was not the first person to observe gravity.",
    },
    {
      name: "Henry Cavendish",
      year: 1798,
      contribution:
        "Measured the Earth's mean density using attraction between masses. This was a fundamental precursor to experimental determinations of G; he did not originally report the result as a value of G.",
    },
  ],
  gravitationalConstant:
    "G is a fixed physical constant determined by experiments, not an adjustable laboratory parameter.",
  siUnits: {
    kg: "kilogram: unit of mass",
    m: "metre: unit of distance; r is measured between the centres of the two bodies",
    N: "newton: unit of force; 1 N = 1 kg·m/s²",
    G: "N·m²/kg²",
  },
} as const;

/** Gravity facts come exclusively from the project on the server. */
export const buildTutorContext = (context: TutorContext) => {
  if (context.kind === "home")
    return {
      kind: "home",
      stage: null,
      available: [
        "Newtonian gravity laboratory",
        "Three-body discovery, gallery and manual experiment",
      ],
      current: null,
    };
  if (context.kind === "three-body") return buildThreeBodyTutorContext(context);
  const baselineForce = gravitationalForce(initialParameters);
  const currentForce = gravitationalForce(context.parameters);
  // Educational what-ifs, relative to the current snapshot, never applied to the lab.
  const hypotheticalChanges = [
    { variable: "mass1", factor: 2 },
    { variable: "mass2", factor: 2 },
    { variable: "distance", factor: 2 },
    { variable: "distance", factor: 0.5 },
  ] as const;
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
    ...(context.stage === "gravity-discovery" && {
      discovery: gravityDiscovery,
    }),
    current: { ...context.parameters, forceNewtons: currentForce },
    hypotheticalChanges: hypotheticalChanges.map(({ variable, factor }) => {
      const parameters = {
        ...context.parameters,
        [variable]: context.parameters[variable] * factor,
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
    }),
    baseline: { ...initialParameters, forceNewtons: baselineForce },
  };
};
