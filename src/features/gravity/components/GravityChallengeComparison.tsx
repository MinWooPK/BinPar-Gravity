import { useId } from "react";
import { compareGravitation } from "../domain/compareGravitation";
import { challenges, gravitationalForce, initialParameters } from "../domain/gravitation";
import type { GravityParameters } from "../domain/gravitation";
import { GravityForceComparison } from "./GravityForceComparison";

// Keep the same physical scale across all three challenges, independent of sliders.
const scaleForce = Math.max(
  gravitationalForce(initialParameters),
  ...challenges.map((challenge) => gravitationalForce(challenge.parameters)),
);

export const GravityChallengeComparison = ({ parameters }: { parameters: GravityParameters }) => {
  const id = useId();
  const { currentForce, referenceForce } = compareGravitation(parameters);
  return (
    <GravityForceComparison
      currentForce={currentForce}
      initialForce={referenceForce}
      scaleForce={scaleForce}
      variant="challenge"
      idPrefix={`${id}-challenge-comparison`}
    />
  );
};
