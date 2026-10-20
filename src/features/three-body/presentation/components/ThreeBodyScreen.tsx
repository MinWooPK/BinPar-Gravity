import { ThreeBodyDiscovery } from "./discovery/ThreeBodyDiscovery";
import { ThreeBodyJourney } from "./ThreeBodyJourney";
import { orbits } from "../../data/orbits";
import { getOrbitPlayback } from "../../infrastructure/orbitPlayback";

export const ThreeBodyScreen = () => {
  const animationData = Object.fromEntries(
    orbits.map(({ slug }) => [slug, getOrbitPlayback(slug)]),
  );
  return (
    <ThreeBodyJourney
      discovery={<ThreeBodyDiscovery />}
      animationData={animationData}
    />
  );
};
