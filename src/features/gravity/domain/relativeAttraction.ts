/** Force relative to the force at the reference distance, for unchanged masses. */
export const relativeAttraction = (distance: number, referenceDistance = 100) => {
  if (!Number.isFinite(distance) || distance <= 0 || !Number.isFinite(referenceDistance) || referenceDistance <= 0) {
    throw new RangeError("Distances must be finite and positive.");
  }
  return (referenceDistance / distance) ** 2;
};
