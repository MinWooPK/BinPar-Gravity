import type {
  GravityParameters,
  GravityVariable,
  GravityValues,
} from "../types/gravity.types";
export const GRAVITATIONAL_CONSTANT = 6.6743e-11;

/** Interactive laboratory limits in SI; the physical law itself is unrestricted. */
export const laboratoryLimits = {
  mass1: { min: 10, max: 100, step: 1 },
  mass2: { min: 10, max: 100, step: 1 },
  distance: { min: 5, max: 20, step: 0.1 },
} as const;

export const isWithinLaboratoryRange = (parameters: GravityParameters) =>
  (Object.keys(laboratoryLimits) as (keyof GravityParameters)[]).every((key) => {
    const value = parameters[key];
    const { min, max } = laboratoryLimits[key];
    return Number.isFinite(value) && value >= min && value <= max;
  });

/** SI units: kilograms, metres and newtons. Distance is centre to centre. */
export const gravitationalForce = ({
  mass1,
  mass2,
  distance,
}: GravityParameters) => {
  if (
    ![mass1, mass2, distance].every(
      (value) => Number.isFinite(value) && value > 0,
    )
  ) {
    throw new RangeError("Masses and distance must be finite and positive.");
  }
  return (GRAVITATIONAL_CONSTANT * mass1 * mass2) / distance ** 2;
};

export const initialParameters: GravityParameters = {
  mass1: 40,
  mass2: 40,
  distance: 8,
};
export const challenges = [
  {
    id: "oneMass",
    parameters: { mass1: 80, mass2: 40, distance: 8 },
    answer: "double",
  },
  {
    id: "bothMasses",
    parameters: { mass1: 80, mass2: 80, distance: 8 },
    answer: "four",
  },
  {
    id: "distance",
    parameters: { mass1: 40, mass2: 40, distance: 16 },
    answer: "quarter",
  },
] as const;

/** Solve for one unknown using SI units. Known inputs must be positive and finite. */
export const solveGravity = (
  unknown: GravityVariable,
  known: Partial<GravityValues>,
): GravityValues => {
  for (const key of ["force", "mass1", "mass2", "distance"] as const) {
    if (key !== unknown && (!Number.isFinite(known[key]) || known[key]! <= 0)) {
      throw new RangeError("Three finite, positive known values are required.");
    }
  }
  const { force = 0, mass1 = 0, mass2 = 0, distance = 0 } = known;
  let result: number;
  switch (unknown) {
    case "force":
      result = gravitationalForce({ mass1, mass2, distance });
      break;
    case "mass1":
      result = (force * distance ** 2) / (GRAVITATIONAL_CONSTANT * mass2);
      break;
    case "mass2":
      result = (force * distance ** 2) / (GRAVITATIONAL_CONSTANT * mass1);
      break;
    case "distance":
      result = Math.sqrt((GRAVITATIONAL_CONSTANT * mass1 * mass2) / force);
      break;
  }
  if (!Number.isFinite(result) || result <= 0)
    throw new RangeError("Result is outside the numerical range.");
  return { force, mass1, mass2, distance, [unknown]: result };
};
