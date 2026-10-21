"use client";

import { useId, useMemo } from "react";
import { useTranslations } from "next-intl";
import type { ExperimentConfiguration } from "../../../../domain/experiment-simulation";
import { bodyColors } from "./experiment.constants";

// Muestra las posiciones y velocidades iniciales.
export const ExperimentPreview = ({
  parsed,
}: {
  parsed: ExperimentConfiguration;
}) => {
  const t = useTranslations("ThreeBody.experiment");
  const markerId = useId();

  // Calcula las posiciones y flechas de la vista previa.
  const preview = useMemo(() => {
    const valid = parsed.bodies.every((body) =>
      [body.x, body.y, body.vx, body.vy].every(Number.isFinite),
    );

    if (!valid) return null;

    const extent = Math.max(
      1,
      ...parsed.bodies.flatMap((body) => [Math.abs(body.x), Math.abs(body.y)]),
    );

    const scale = 98 / extent;

    return parsed.bodies.map((body, index) => {
      const speed = Math.hypot(body.vx, body.vy);
      const arrowLength =
        speed === 0 ? 0 : Math.min(46, Math.max(15, speed * 65));

      const x = 200 + body.x * scale;
      const y = 130 - body.y * scale;

      return {
        index,
        x,
        y,
        arrowX: x + (speed ? (body.vx / speed) * arrowLength : 0),
        arrowY: y - (speed ? (body.vy / speed) * arrowLength : 0),
        speed,
      };
    });
  }, [parsed]);

  if (!preview) {
    return (
      <p className="p-4 text-center text-sm text-slate-400">
        {t("previewUnavailable")}
      </p>
    );
  }

  return (
    <svg
      viewBox="0 0 400 260"
      className="block h-auto w-full"
      role="img"
      aria-label={t("previewDescription")}
    >
      <defs>
        <marker
          id={markerId}
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
        >
          <path
            d="M0 0L6 3L0 6"
            fill="none"
            stroke="#a7f3e5"
            strokeWidth="1.5"
          />
        </marker>
      </defs>

      {/* Ejes de referencia. */}
      <path
        d="M20 130H380 M200 15V245"
        stroke="#526079"
        strokeWidth="1"
        strokeDasharray="4 6"
        opacity="0.55"
      />

      {/* Velocidades y cuerpos. */}
      {preview.map((body) => (
        <g key={body.index}>
          {body.speed > 0 && (
            <line
              x1={body.x}
              y1={body.y}
              x2={body.arrowX}
              y2={body.arrowY}
              stroke="#a7f3e5"
              strokeWidth="2"
              markerEnd={`url(#${markerId})`}
            />
          )}

          <circle
            cx={body.x}
            cy={body.y}
            r="19"
            fill={bodyColors[body.index]}
            fillOpacity="0.17"
            stroke={bodyColors[body.index]}
            strokeWidth="1.5"
          />

          <circle cx={body.x} cy={body.y} r="8" fill={bodyColors[body.index]} />
        </g>
      ))}
    </svg>
  );
};
