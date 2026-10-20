import "server-only";

import { getOrbit } from "../data/orbits";
import { integrateOrbit } from "../domain/orbit-integration";
import { prepareOrbitPlayback } from "../application/orbitPlayback";
import type { OrbitPlayback } from "../types/animation.types";

// Almacena las órbitas ya calculadas para evitar repetir
// la integración física cuando se solicita la misma órbita.
const playbackCache = new Map<string, OrbitPlayback>();

// Obtiene los datos de una órbita preparados para su animación,
// reutilizando el resultado almacenado cuando está disponible.
export const getOrbitPlayback = (slug: string): OrbitPlayback => {
  // Busca si la órbita ya está calculada y guardada en caché.
  const cached = playbackCache.get(slug);

  if (cached) return cached;

  // Obtiene la definición de la órbita mediante su identificador.
  const orbit = getOrbit(slug);

  if (!orbit) throw new RangeError(`Unknown orbit: ${slug}`);

  // Calcula la trayectoria física y la adapta para reproducirla visualmente.
  const playback = prepareOrbitPlayback(integrateOrbit(orbit));

  playbackCache.set(slug, playback);

  return playback;
};
