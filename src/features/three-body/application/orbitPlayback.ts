import type { OrbitPlayback } from "../types/animation.types";
import type { OrbitData } from "../types/orbit.types";

// Comprueba que una órbita tenga un identificador, un período válido
// y suficientes muestras para reproducir su animación.
const validatePlayback = (data: OrbitPlayback) => {
  if (
    !data ||
    typeof data.slug !== "string" ||
    data.slug.trim() === "" ||
    !Number.isFinite(data.period) ||
    data.period <= 0 ||
    !Array.isArray(data.samples) ||
    data.samples.length < 2
  ) {
    throw new RangeError(
      "An orbit needs a slug, a positive finite period and at least two samples.",
    );
  }
};

// Comprueba que cada muestra contenga las seis coordenadas
// correspondientes a las posiciones de los tres cuerpos.
const validateSample = (sample: readonly number[]) => {
  if (!Array.isArray(sample) || sample.length !== 6) {
    throw new RangeError(
      "Each orbit sample must contain three finite x/y pairs.",
    );
  }

  for (let coordinate = 0; coordinate < 6; coordinate++) {
    if (!Number.isFinite(sample[coordinate])) {
      throw new RangeError(
        "Each orbit sample must contain three finite x/y pairs.",
      );
    }
  }
};

// Convierte las coordenadas físicas de una órbita en posiciones
// adaptadas a un SVG de 320 × 200, sin modificar los datos originales.
export const prepareOrbitPlayback = (data: OrbitData): OrbitPlayback => {
  validatePlayback(data);

  if (
    !data.bounds ||
    !Number.isFinite(data.bounds.cx) ||
    !Number.isFinite(data.bounds.cy) ||
    !Number.isFinite(data.bounds.radius) ||
    data.bounds.radius <= 0
  ) {
    throw new RangeError(
      "Orbit bounds must have a finite center and a positive finite radius.",
    );
  }

  // Obtiene el centro y el radio utilizados para escalar la órbita.
  const { cx, cy, radius } = data.bounds;

  // Transforma todas las muestras físicas en coordenadas visuales.
  const samples = Array.from(data.samples, (sample) => {
    validateSample(sample);

    return sample.map((coordinate, index) => {
      // Calcula la posición visual de cada coordenada X o Y.
      const position =
        index % 2 === 0
          ? 160 + ((coordinate - cx) / radius) * 80
          : 100 - ((coordinate - cy) / radius) * 80;

      if (!Number.isFinite(position)) {
        throw new RangeError(
          "Orbit coordinates cannot be represented within these bounds.",
        );
      }

      // Redondea únicamente las coordenadas utilizadas para dibujar.
      return Number(position.toFixed(3));
    });
  });

  return { slug: data.slug, period: data.period, samples };
};

// Calcula las posiciones de los tres cuerpos en un instante
// de la animación mediante interpolación entre muestras.
export const getOrbitFrame = (
  data: OrbitPlayback,
  time: number,
): readonly number[] => {
  validatePlayback(data);

  if (!Number.isFinite(time))
    throw new RangeError("Playback time must be finite.");

  // Obtiene el tiempo dentro del período actual de la órbita.
  const remainder = time % data.period;

  // Ajusta el tiempo para que siempre sea positivo.
  const wrapped = remainder < 0 ? remainder + data.period : remainder;

  // Calcula la posición correspondiente dentro de las muestras.
  const position = (wrapped / data.period) * (data.samples.length - 1);

  // Identifica la muestra anterior al instante solicitado.
  const index = Math.min(Math.floor(position), data.samples.length - 2);

  // Calcula la proporción entre las dos muestras.
  const fraction = position - index;

  // Obtiene las posiciones de la muestra anterior.
  const before = data.samples[index];

  // Obtiene las posiciones de la muestra siguiente.
  const after = data.samples[index + 1];

  // Valida únicamente las muestras necesarias para este fotograma.
  validateSample(before);
  validateSample(after);

  return before.map(
    (coordinate, axis) => coordinate * (1 - fraction) + after[axis] * fraction,
  );
};

// Genera las trayectorias visuales de los tres cuerpos
// en formato de puntos para dibujarlas mediante SVG.
export const getOrbitTrails = (data: OrbitPlayback): readonly string[] => {
  validatePlayback(data);

  // Prepara una lista independiente de puntos para cada cuerpo.
  const trails: string[][] = [[], [], []];

  for (const sample of data.samples) {
    validateSample(sample);

    for (let body = 0; body < 3; body++) {
      trails[body].push(`${sample[body * 2]},${sample[body * 2 + 1]}`);
    }
  }

  return trails.map((points) => points.join(" "));
};
