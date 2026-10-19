import type { ExperimentConfiguration } from "../domain/experiment-simulation";
import type { OrbitSearchCandidate } from "../types/orbit-search.types";

/** Explicit application only; stale proposals cannot replace fixed parameters. */
export function applyOrbitSearchCandidate(
  current: ExperimentConfiguration,
  candidate: OrbitSearchCandidate,
): ExperimentConfiguration | null {
  const proposed = candidate.configuration;
  if (
    !candidate.verified || !Number.isFinite(candidate.period) || candidate.period <= 0 || candidate.period > 100 ||
    proposed.gravity !== current.gravity || proposed.bodies.length !== 3 || current.bodies.length !== 3 ||
    proposed.bodies.some((body, i) =>
      !Number.isFinite(body.vx) || !Number.isFinite(body.vy) ||
      (["mass", "x", "y"] as const).some((key) => body[key] !== current.bodies[i][key]))
  ) return null;
  return {
    ...current,
    duration: candidate.period,
    bodies: current.bodies.map((body, i) => ({ ...body, vx: proposed.bodies[i].vx, vy: proposed.bodies[i].vy })),
  };
}
