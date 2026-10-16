import type { OrbitData } from "../../../lib/physics/types";

/** Display coordinates only. The original physical samples remain untouched. */
export type OrbitPlayback = {
  slug: string;
  period: number;
  samples: number[][];
};

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
    throw new RangeError("An orbit needs a slug, a positive finite period and at least two samples.");
  }
};

const validateSample = (sample: readonly number[]) => {
  if (!Array.isArray(sample) || sample.length !== 6) {
    throw new RangeError("Each orbit sample must contain three finite x/y pairs.");
  }
  for (let coordinate = 0; coordinate < 6; coordinate++) {
    if (!Number.isFinite(sample[coordinate])) {
      throw new RangeError("Each orbit sample must contain three finite x/y pairs.");
    }
  }
};

/** Fit a physical orbit into a 320 × 200 SVG using one scale for both axes. */
export const prepareOrbitPlayback = (data: OrbitData): OrbitPlayback => {
  validatePlayback(data);
  if (
    !data.bounds ||
    !Number.isFinite(data.bounds.cx) ||
    !Number.isFinite(data.bounds.cy) ||
    !Number.isFinite(data.bounds.radius) ||
    data.bounds.radius <= 0
  ) {
    throw new RangeError("Orbit bounds must have a finite center and a positive finite radius.");
  }
  const { cx, cy, radius } = data.bounds;
  const samples = Array.from(data.samples, (sample) => {
    validateSample(sample);
    return sample.map((coordinate, index) => {
      const position = index % 2 === 0
        ? 160 + ((coordinate - cx) / radius) * 80
        : 100 - ((coordinate - cy) / radius) * 80;
      if (!Number.isFinite(position)) {
        throw new RangeError("Orbit coordinates cannot be represented within these bounds.");
      }
      // Rounding belongs to the drawing, never to the numerical integration.
      return Number(position.toFixed(3));
    });
  });
  return { slug: data.slug, period: data.period, samples };
};

/** Interpolate physical time uniformly, including the last sample at t = T. */
export const getOrbitFrame = (data: OrbitPlayback, time: number): readonly number[] => {
  validatePlayback(data);
  if (!Number.isFinite(time)) throw new RangeError("Playback time must be finite.");
  const remainder = time % data.period;
  const wrapped = remainder < 0 ? remainder + data.period : remainder;
  const position = (wrapped / data.period) * (data.samples.length - 1);
  const index = Math.min(Math.floor(position), data.samples.length - 2);
  const fraction = position - index;
  const before = data.samples[index];
  const after = data.samples[index + 1];
  // Validate only this interval: advancing a frame is constant work, not a scan.
  validateSample(before);
  validateSample(after);
  return before.map((coordinate, axis) => coordinate * (1 - fraction) + after[axis] * fraction);
};

/** SVG polyline points, one trail for each of the three bodies. */
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
