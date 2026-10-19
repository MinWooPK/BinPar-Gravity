"use client";

import type { ExperimentTrajectory } from "../../../domain/experiment-simulation";

const colors = ["#aa97ff", "#5ee7d5", "#f4c778"] as const;

type Props = {
  trajectory: Pick<ExperimentTrajectory, "duration" | "samples" | "bounds">;
  elapsed: number;
  showTrails: boolean;
  label: string;
};

/**
 * Representación de una trayectoria LIBRE: el tiempo se limita a duration,
 * nunca usa un módulo ni supone que la órbita se repite.
 */
export const ExperimentAnimation = ({
  trajectory,
  elapsed,
  showTrails,
  label,
}: Props) => {
  const { samples, duration, bounds } = trajectory;
  const samplePosition = Math.max(
    0,
    Math.min(samples.length - 1, (elapsed / duration) * (samples.length - 1)),
  );
  const index = Math.min(Math.floor(samplePosition), samples.length - 2);
  const factor = samplePosition - index;

  const bodyCoordinates = samples[index].map(
    (value, component) =>
      value + (samples[index + 1][component] - value) * factor,
  );

  // Usamos la misma escala en ambos ejes para no deformar la trayectoria.
  const scale = 108 / Math.max(bounds.radius, 1e-9);
  const point = (x: number, y: number) => [
    200 + (x - bounds.cx) * scale,
    130 - (y - bounds.cy) * scale,
  ] as const;

  const trails = !showTrails ? [] : colors.map((_, body) => {
    const points = samples.slice(0, index + 1).map((sample) =>
      point(sample[body * 2], sample[body * 2 + 1]).join(","),
    );
    // La estela llega a la posición actual, interpolada entre muestras.
    points.push(
      point(bodyCoordinates[body * 2], bodyCoordinates[body * 2 + 1]).join(","),
    );
    return points.join(" ");
  });

  return (
    <svg
      viewBox="0 0 400 260"
      className="block h-auto w-full max-w-xl"
      role="img"
      aria-label={label}
    >
      <path
        d="M20 130H380 M200 15V245"
        fill="none"
        stroke="#526079"
        strokeWidth="1"
        strokeDasharray="4 6"
        opacity="0.45"
      />

      {trails.map((points, body) => (
        <polyline
          key={body}
          points={points}
          fill="none"
          stroke={colors[body]}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity="0.75"
        />
      ))}

      {colors.map((color, body) => {
        const [x, y] = point(
          bodyCoordinates[body * 2],
          bodyCoordinates[body * 2 + 1],
        );
        return (
          <g key={color} transform={`translate(${x} ${y})`}>
            <circle r="18" fill={color} fillOpacity="0.14" />
            <circle r="7" fill={color} stroke="#090e1c" strokeWidth="1.5" />
          </g>
        );
      })}
    </svg>
  );
};

