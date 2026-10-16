import type { GravityParameters } from "../domain/gravitation";

// Presentation units only. Arrow length encodes direction, never force.
export const getGravityDiagram = ({ mass1, mass2, distance }: GravityParameters) => {
  const separation = 160 + (distance / 1000 - 5) * 12;
  const x1 = 260 - separation / 2;
  const x2 = 260 + separation / 2;
  const radius1 = 15 + Math.cbrt(mass1 / 1e12) * 5;
  const radius2 = 15 + Math.cbrt(mass2 / 1e12) * 5;
  const arrowLength = 24;
  const arrowOffset = 12;

  return {
    separation, x1, x2, radius1, radius2,
    leftArrow: { start: x1 + radius1 + arrowOffset, end: x1 + radius1 + arrowOffset + arrowLength },
    rightArrow: { start: x2 - radius2 - arrowOffset, end: x2 - radius2 - arrowOffset - arrowLength },
  };
};

/** A shared linear scale preserves force ratios; an optional scale fixes it across views. */
export const getRelativeForceBars = (
  currentForce: number,
  initialForce: number,
  scaleForce = Math.max(currentForce, initialForce),
) => {
  if (![currentForce, initialForce].every((value) => Number.isFinite(value) && value > 0)) {
    throw new RangeError("Force comparison requires finite, positive forces.");
  }
  if (!Number.isFinite(scaleForce) || scaleForce < Math.max(currentForce, initialForce)) {
    throw new RangeError("The shared scale must contain both forces without clipping.");
  }
  return {
    currentFraction: currentForce / scaleForce,
    initialFraction: initialForce / scaleForce,
    ratio: currentForce / initialForce,
  };
};
