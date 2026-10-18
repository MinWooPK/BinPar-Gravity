import { isWithinLaboratoryRange, laboratoryLimits } from "../domain/gravitation";
import type { GravityParameters, GravityParameterProposal } from "../types/gravity.types";

const keys = ["mass1", "mass2", "distance"] as const;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const sameGravityParameters = (a: GravityParameters, b: GravityParameters) =>
  keys.every((key) => a[key] === b[key]);

/** Null means unchanged. Only explicit changes must match the control's step. */
export const isGravityParameterProposal = (value: unknown): value is GravityParameterProposal => {
  if (!isRecord(value) || Object.keys(value).length !== 2 || value.action !== "set_gravity_parameters" || !isRecord(value.parameters)) return false;
  const parameters = value.parameters;
  if (Object.keys(parameters).length !== keys.length || !keys.every(key => key in parameters)) return false;
  return keys.some(key => parameters[key] !== null) && keys.every(key => {
    const value = parameters[key];
    if (value === null) return true;
    const { min, max, step } = laboratoryLimits[key];
    if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) return false;
    const steps = (value - min) / step;
    return Math.abs(steps - Math.round(steps)) < 1e-9;
  });
};

export const resolveGravityProposal = (current: GravityParameters, value: unknown): GravityParameters | null => {
  if (!isGravityParameterProposal(value)) return null;
  const parameters = {
    mass1: value.parameters.mass1 ?? current.mass1,
    mass2: value.parameters.mass2 ?? current.mass2,
    distance: value.parameters.distance ?? current.distance,
  };
  return isWithinLaboratoryRange(parameters) && !sameGravityParameters(current, parameters) ? parameters : null;
};
