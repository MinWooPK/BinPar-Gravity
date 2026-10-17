import { ThreeBodyDiscovery } from "./ThreeBodyDiscovery";
import { ThreeBodyJourney } from "./ThreeBodyJourney";
import { orbits } from "../data/orbits";
import { getOrbitPlayback } from "../server/orbit-data";

export const ThreeBodyScreen = () => {
  const animationData = Object.fromEntries(
    orbits.map(({ slug }) => [slug, getOrbitPlayback(slug)]),
  );
  return <ThreeBodyJourney discovery={<ThreeBodyDiscovery />} animationData={animationData} />;
};
