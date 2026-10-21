import { useId } from "react";
import { useTranslations } from "next-intl";

import { Highlight } from "./Highlight";

// Representa las posiciones, velocidades y distancias de tres cuerpos.
export const GalleryIntroductionDiagram = () => {
  const t = useTranslations("ThreeBody.galleryGuide");
  const id = useId();
  const arrowId = `${id}-velocity-arrow`;

  return (
    <figure className="flex min-w-0 flex-col gap-3 rounded-2xl border border-[#303b59] bg-[#0b1120] p-4">
      <h3 className="text-lg font-semibold text-slate-100">
        1. {t("diagramTitle")}
      </h3>

      <div className="flex flex-1 items-center justify-center">
        <svg
          viewBox="0 0 400 225"
          className="block h-auto w-full max-w-lg"
          role="img"
          aria-labelledby={`${id}-title`}
          aria-describedby={`${id}-description`}
        >
          <title id={`${id}-title`}>{t("diagramTitle")}</title>
          <desc id={`${id}-description`}>{t("diagramDescription")}</desc>

          <defs>
            <marker
              id={arrowId}
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path
                d="M0 0L6 3L0 6"
                fill="none"
                stroke="#5ee7d5"
                strokeWidth="1.5"
              />
            </marker>
          </defs>

          {/* Distancias entre los cuerpos. */}
          <path
            d="M200 43L92 175L308 175Z"
            fill="none"
            stroke="#76829c"
            strokeDasharray="5 5"
            strokeWidth="1.5"
          />

          {/* Vectores de velocidad inicial. */}
          <g stroke="#5ee7d5" strokeWidth="2.5" markerEnd={`url(#${arrowId})`}>
            <path d="M215 37L260 21" />
            <path d="M106 186L145 208" />
            <path d="M292 186L254 208" />
          </g>

          {/* Los tres cuerpos conservan las posiciones y colores originales. */}
          {[
            { x: 200, y: 43, color: "#aa97ff" },
            { x: 92, y: 175, color: "#5ee7d5" },
            { x: 308, y: 175, color: "#f4c778" },
          ].map((body, index) => (
            <g key={index}>
              <circle
                cx={body.x}
                cy={body.y}
                r="21"
                fill={body.color}
                fillOpacity="0.15"
                stroke={body.color}
              />
              <circle cx={body.x} cy={body.y} r="7" fill={body.color} />
              <text
                x={body.x}
                y={body.y - 30}
                textAnchor="middle"
                fill="#e9edf6"
                fontSize="14"
              >
                {`m${index + 1}`}
              </text>
            </g>
          ))}

          <g fontSize="13" fill="#acbad0">
            <text x="125" y="106">
              r₁₂
            </text>
            <text x="265" y="106">
              r₁₃
            </text>
            <text x="192" y="193">
              r₂₃
            </text>
          </g>

          <g fontSize="12" fill="#5ee7d5">
            <text x="268" y="19">
              v₁
            </text>
            <text x="148" y="216">
              v₂
            </text>
            <text x="229" y="216">
              v₃
            </text>
          </g>
        </svg>
      </div>

      <figcaption className="text-sm leading-6 text-slate-400">
        {t("diagramCaption")}
      </figcaption>

      {/* Conclusión de la explicación visual. */}
      <div className="rounded-xl border border-[#60517f] bg-[#19172d] p-4">
        <h3 className="font-semibold text-[#d3c5ff]">{t("takeawayTitle")}</h3>
        <p className="mt-2 text-sm leading-7 text-slate-200">
          {t.rich("takeaway", {
            highlight: (children) => <Highlight>{children}</Highlight>,
          })}
        </p>
      </div>
    </figure>
  );
};
