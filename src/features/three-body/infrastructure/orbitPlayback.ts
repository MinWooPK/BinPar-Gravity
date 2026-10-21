import "server-only";

import { getOrbit } from "../data/orbits";
import { integrateOrbit } from "../domain/orbit-integration";
import { prepareOrbitPlayback } from "../application/orbitPlayback";
import type { OrbitPlayback } from "../types/animation.types";

// Guarda las órbitas calculadas para reutilizarlas.
const playbackCache = new Map<string, OrbitPlayback>();

// Obtiene una órbita preparada para su animación.
export const getOrbitPlayback = (slug: string): OrbitPlayback => {
  // Comprueba si la órbita está en caché.
  const cached = playbackCache.get(slug);

  if (cached) return cached;

  // Busca la órbita solicitada.
  const orbit = getOrbit(slug);

  if (!orbit) {
    throw new RangeError(`Órbita desconocida: ${slug}`);
  }

  // Calcula y prepara la trayectoria.
  const playback = prepareOrbitPlayback(integrateOrbit(orbit));

  playbackCache.set(slug, playback);

  return playback;
};
