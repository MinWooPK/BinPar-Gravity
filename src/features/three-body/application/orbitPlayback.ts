import type { OrbitPlayback } from "../types/animation.types";
import type { OrbitData } from "../types/orbit.types";

// Valida los datos necesarios para reproducir una órbita.
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
      "La órbita necesita un identificador, un período positivo y al menos dos muestras.",
    );
  }
};

// Comprueba las seis coordenadas de una muestra.
const validateSample = (sample: readonly number[]) => {
  if (
    !Array.isArray(sample) ||
    sample.length !== 6 ||
    !sample.every(Number.isFinite)
  ) {
    throw new RangeError(
      "Cada muestra debe contener tres pares de coordenadas X/Y válidas.",
    );
  }
};

// Adapta las órbitas al SVG de 320 × 200.
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
      "Los límites de la órbita necesitan un centro válido y un radio positivo.",
    );
  }

  const { cx, cy, radius } = data.bounds;

  // Convierte las coordenadas físicas en visuales.
  const samples = Array.from(data.samples, (sample) => {
    validateSample(sample);

    return sample.map((coordinate, index) => {
      const position =
        index % 2 === 0
          ? 160 + ((coordinate - cx) / radius) * 80
          : 100 - ((coordinate - cy) / radius) * 80;

      if (!Number.isFinite(position)) {
        throw new RangeError(
          "Las coordenadas de la órbita no se pueden representar con estos límites.",
        );
      }

      // Redondea solo los valores del dibujo.
      return Number(position.toFixed(3));
    });
  });

  return { slug: data.slug, period: data.period, samples };
};

// Calcula las posiciones de los cuerpos en un instante.
export const getOrbitFrame = (
  data: OrbitPlayback,
  time: number,
): readonly number[] => {
  validatePlayback(data);

  if (!Number.isFinite(time)) {
    throw new RangeError(
      "El tiempo de reproducción debe ser un número finito.",
    );
  }

  // Ajusta el tiempo al período de la órbita.
  const remainder = time % data.period;
  const wrapped = remainder < 0 ? remainder + data.period : remainder;

  // Localiza las dos muestras entre las que interpolar.
  const position = (wrapped / data.period) * (data.samples.length - 1);
  const index = Math.min(Math.floor(position), data.samples.length - 2);
  const fraction = position - index;

  const before = data.samples[index];
  const after = data.samples[index + 1];

  validateSample(before);
  validateSample(after);

  // Interpola las posiciones de los tres cuerpos.
  return before.map(
    (coordinate, axis) => coordinate * (1 - fraction) + after[axis] * fraction,
  );
};

// Genera las trayectorias SVG de los tres cuerpos.
export const getOrbitTrails = (data: OrbitPlayback): readonly string[] => {
  validatePlayback(data);

  const trails: string[][] = [[], [], []];

  for (const sample of data.samples) {
    validateSample(sample);

    for (let body = 0; body < 3; body++) {
      trails[body].push(`${sample[body * 2]},${sample[body * 2 + 1]}`);
    }
  }

  return trails.map((points) => points.join(" "));
};
