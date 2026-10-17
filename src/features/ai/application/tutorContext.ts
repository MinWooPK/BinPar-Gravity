import {
  challenges,
  gravitationalForce,
  GRAVITATIONAL_CONSTANT,
  initialParameters,
} from "../../gravity/domain/gravitation";
import { getOrbit, orbits, publishedOrbits } from "../../three-body/data/orbits";
import type { TutorContext } from "./tutor";

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
