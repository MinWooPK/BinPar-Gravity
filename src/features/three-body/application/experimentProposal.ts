import type { ExperimentConfiguration } from "../domain/experiment-simulation";
import type { ThreeBodyParameterProposal } from "../types/experiment-proposal.types";
import { experimentBodyFields, EXPERIMENT_VALUE_LIMIT, isExperimentConfiguration, sameExperimentConfiguration } from "./experimentConfiguration";

const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const exactKeys = (value: Record<string, unknown>, keys: readonly string[]) => Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
export const isThreeBodyParameterProposal = (value: unknown): value is ThreeBodyParameterProposal => {
  if (!record(value) || !exactKeys(value, ["action", "parameters"]) || value.action !== "set_three_body_parameters" || !record(value.parameters)) return false;
  const p = value.parameters;
  const numeric = (v: unknown, positive = false, max = EXPERIMENT_VALUE_LIMIT) => v === null || (typeof v === "number" && Number.isFinite(v) && Math.abs(v) <= max && (!positive || v > 0));
  return exactKeys(p, ["gravity", "duration", "bodies"]) && numeric(p.gravity, true) && numeric(p.duration, true, 100) &&
    Array.isArray(p.bodies) && p.bodies.length === 3 && p.bodies.every(body => record(body) && exactKeys(body, experimentBodyFields) && experimentBodyFields.every(key => numeric(body[key], key === "mass")));
};

/** Validate the whole merged system: individually valid positions can still overlap. */
export const resolveThreeBodyProposal = (current: ExperimentConfiguration, value: unknown): ExperimentConfiguration | null => {
  if (!isExperimentConfiguration(current) || !isThreeBodyParameterProposal(value)) return null;
  const p = value.parameters;
  const next: ExperimentConfiguration = {
    gravity: p.gravity ?? current.gravity,
    duration: p.duration ?? current.duration,
    bodies: current.bodies.map((body, i) => ({
      mass: p.bodies[i].mass ?? body.mass, x: p.bodies[i].x ?? body.x, y: p.bodies[i].y ?? body.y,
      vx: p.bodies[i].vx ?? body.vx, vy: p.bodies[i].vy ?? body.vy,
    })),
  };
  return isExperimentConfiguration(next) && !sameExperimentConfiguration(current, next) ? next : null;
};
