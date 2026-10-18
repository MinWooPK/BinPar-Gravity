import {
  challenges,
  gravitationalForce,
  GRAVITATIONAL_CONSTANT,
  initialParameters,
  laboratoryLimits,
} from "../../gravity/domain/gravitation";
import { getOrbit, orbits, publishedOrbits } from "../../three-body/data/orbits";
import type { TutorContext } from "../types/tutor.types";

// Aligned with the discovery panel; these facts are owned by the server, not dialogue.
const gravityDiscovery = {
  definition: "Every body with mass attracts other bodies with mass. Gravity acts at a distance; the forces on two bodies have equal magnitude and opposite directions.",
  effects: ["falling objects", "the motion of the Moon and planets", "tides"],
  illustration: "The Earth–Moon diagram is conceptual: sizes and distances are not to scale, and it is not an orbital simulation.",
  history: [
    { name: "Galileo Galilei", contribution: "Studied motion and free fall through experiments and mathematical descriptions." },
    { name: "Johannes Kepler", contribution: "Formulated laws describing planetary orbits from astronomical observations." },
    { name: "Isaac Newton", year: 1687, contribution: "Published the law of universal gravitation in the Principia, building on earlier work and relating falling bodies to the motion of the Moon and planets. He was not the first person to observe gravity." },
    { name: "Henry Cavendish", year: 1798, contribution: "Measured the Earth's mean density using attraction between masses. This was a fundamental precursor to experimental determinations of G; he did not originally report the result as a value of G." },
  ],
  gravitationalConstant: "G is a fixed physical constant determined by experiments, not an adjustable laboratory parameter.",
  siUnits: {
    kg: "kilogram: unit of mass",
    m: "metre: unit of distance; r is measured between the centres of the two bodies",
    N: "newton: unit of force; 1 N = 1 kg·m/s²",
    G: "N·m²/kg²",
  },
} as const;

/** Numerical facts and orbit metadata come exclusively from the project on the server. */
export const buildTutorContext = (context: TutorContext) => {
  if (context.kind === "gravity") {
    const challenge = challenges.find(({ id }) => id === (context.challenge ?? context.attempt?.challenge));
    const baselineForce = gravitationalForce(initialParameters);
    return {
      kind: context.kind,
      stage: context.stage,
      model: "Newtonian attraction between two spherical bodies; this is not an orbital simulation",
      units: { mass: "kg", distance: "metres between centres", force: "newtons" },
      gravitationalConstant: GRAVITATIONAL_CONSTANT,
      laboratory: {
        limits: laboratoryLimits,
        scale: "Everyday masses in kilograms and centre-to-centre distances in metres. Their gravitational forces are very small and are displayed in scientific notation, not rounded to zero.",
        illustration: "Sphere sizes and separation are illustrative, not to scale. The arrows show equal and opposite force directions, not force magnitudes.",
      },
      ...(context.stage === "gravity-discovery" && { discovery: gravityDiscovery }),
      current: { ...context.parameters, forceNewtons: gravitationalForce(context.parameters) },
      baseline: { ...initialParameters, forceNewtons: baselineForce },
      challenge: challenge && {
        id: challenge.id,
        parameters: challenge.parameters,
        forceNewtons: gravitationalForce(challenge.parameters),
        forceRatioToBaseline: gravitationalForce(challenge.parameters) / baselineForce,
        expectedPrediction: challenge.answer,
      },
      prediction: context.prediction,
      attempt: context.attempt && challenge && {
        prediction: context.attempt.prediction,
        correct: context.attempt.prediction === challenge.answer,
      },
    };
  }

  const selected = context.slug ? getOrbit(context.slug) : undefined;
  // Validation rejects unknown slugs; keep this boundary safe for other callers too.
  if (context.slug && !selected) throw new RangeError("Unknown orbit");
  const published = publishedOrbits.find(({ slug }) => slug === selected?.slug);
  const refined = selected && published && JSON.stringify(selected.initial) !== JSON.stringify(published.initial);
  return {
    kind: context.kind,
    view: selected ? "orbit-detail" : "gallery",
    model: {
      gravity: "Newtonian planar three-body problem with point masses",
      gravitationalConstant: 1,
      masses: [1, 1, 1],
      units: "dimensionless",
      integration: "adaptive RK4 step doubling with Richardson correction; uniformly sampled physical time",
    },
    catalogue: orbits.map(({ slug, name, description, insight, period, source, sourceLabel }) => ({
      slug, name, description, insight, period, source, sourceLabel,
    })),
    selectedOrbit: selected && {
      slug: selected.slug,
      name: selected.name,
      description: selected.description,
      insight: selected.insight,
      initialStateLayout: ["x", "y", "vx", "vy"],
      initial: selected.initial,
      period: selected.period,
      convention: selected.convention,
      source: selected.source,
      sourceLabel: selected.sourceLabel,
      ...(refined && published && {
        refinement: "The simulation uses a reproducible local shooting correction of the published seed; do not confuse it with the original published values.",
        publishedInitial: published.initial,
        publishedPeriod: published.period,
      }),
    },
  };
};
