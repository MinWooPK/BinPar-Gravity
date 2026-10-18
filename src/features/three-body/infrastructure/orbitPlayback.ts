import "server-only";

import { getOrbit } from "../data/orbits";
import { integrateOrbit } from "../domain/orbit-integration";
import { prepareOrbitPlayback } from "../application/orbitPlayback";
import type { OrbitPlayback } from "../types/animation.types";

// Only the six documented definitions enter this cache. Integration is never
// performed inside the browser's animation loop or repeated for each frame.
const playbackCache = new Map<string, OrbitPlayback>();

export const getOrbitPlayback = (slug: string): OrbitPlayback => {
  const cached = playbackCache.get(slug);
  if (cached) return cached;

  const orbit = getOrbit(slug);
  if (!orbit) throw new RangeError(`Unknown orbit: ${slug}`);

  const playback = prepareOrbitPlayback(integrateOrbit(orbit));
  playbackCache.set(slug, playback);
  return playback;
};
