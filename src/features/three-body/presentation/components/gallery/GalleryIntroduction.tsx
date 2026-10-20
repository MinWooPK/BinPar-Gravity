"use client";

import { useId, type ReactNode } from "react";
import { useTranslations } from "next-intl";

type Props = {
  onExplore: () => void;
};

// Resaltar las palabras más importantes.
const Highlight = ({ children }: { children: ReactNode }) => (
  <strong className="font-semibold text-[#d3c5ff]">{children}</strong>
);

const commonConditions = [
  { key: "masses", value: "1 · 1 · 1" },
  { key: "gravity", value: "G = 1" },
  { key: "dimensions", value: "2D" },
] as const;

export const GalleryIntroduction = ({ onExplore }: Props) => {
  const t = useTranslations("ThreeBody.galleryGuide");
  const id = useId();
  const arrowId = `${id}-velocity-arrow`;

  return (
    <section className="flex min-w-0 flex-col gap-5">
      {/* INTRODUCCIÓN */}
      <header className="space-y-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b9a8ff]">
          {/* {t("eyebrow")} */}
          {t("title")}
        </p>
        <div className="flex gap-5 items-center justify-between">
          {/* <h2 className="text-2xl font-semibold text-slate-50 sm:text-3xl">
          {t("title")}
        </h2> */}

          <p className=" text-sm leading-7 text-slate-300 sm:text-base">
            {t.rich("intro", {
              highlight: (children) => <Highlight>{children}</Highlight>,
            })}
          </p>
          {/* BOTÓN GALERÍA */}
          <div className="flex justify-center py-2">
            <button
              type="button"
              onClick={onExplore}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#aa97ff] px-4 py-0 text-center font-semibold text-[#101122] transition-colors hover:bg-[#c4b5fd] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c4b5fd]"
            >
              {t("explore")}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </header>

      {/* DOS TARJETAS */}
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        {/* TARJETA 1: GRÁFICO */}
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

              {/* Distancias */}
              <path
                d="M200 43L92 175L308 175Z"
                fill="none"
                stroke="#76829c"
                strokeDasharray="5 5"
                strokeWidth="1.5"
              />

              {/* Velocidades */}
              <g
                stroke="#5ee7d5"
                strokeWidth="2.5"
                markerEnd={`url(#${arrowId})`}
              >
                <path d="M215 37L260 21" />
                <path d="M106 186L145 208" />
                <path d="M292 186L254 208" />
              </g>

              {/* Tres cuerpos */}
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
          {/* CONCLUSIÓN */}
          <div className="rounded-xl border border-[#60517f] bg-[#19172d] p-4">
            <h3 className="font-semibold text-[#d3c5ff]">
              {t("takeawayTitle")}
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-200">
              {t.rich("takeaway", {
                highlight: (children) => <Highlight>{children}</Highlight>,
              })}
            </p>
          </div>
        </figure>

        {/* TARJETA 2: CONDICIONES */}
        <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-[#303b59] bg-[#131724] p-4">
          <h3 className="text-lg font-semibold text-slate-100">
            2. {t("parametersTitle")}
          </h3>

          {/* CONDICIONES COMUNES */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[#b9a8ff]">
              {t("sharedConditions")}
            </h4>

            <div className="grid grid-cols-3 gap-2">
              {commonConditions.map((condition) => (
                <div
                  key={condition.key}
                  className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg border border-[#48516b] bg-[#1b2335] p-3 text-center"
                >
                  <span className="text-xs text-slate-400">
                    {t(condition.key)}
                  </span>
                  <span className="text-sm font-bold text-[#d3c5ff]">
                    {condition.value}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs leading-5 text-slate-400">{t("modelNote")}</p>
          </div>

          <div className="border-t border-[#30364b]" />

          {/* CONDICIONES ESPECÍFICAS */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[#a7f3e5]">
              {t("specificConditions")}
            </h4>

            <div className="rounded-xl border border-[#315c5b] bg-[#102126] p-4">
              <h5 className="text-sm font-semibold text-[#a7f3e5]">
                {t("positionTitle")}
              </h5>
              <p className="mt-1 text-sm leading-6 text-slate-200">
                {t("positionDescription")}
              </p>
            </div>

            <div className="rounded-xl border border-[#315c5b] bg-[#102126] p-4">
              <h5 className="text-sm font-semibold text-[#a7f3e5]">
                {t("velocityTitle")}
              </h5>
              <p className="mt-1 text-sm leading-6 text-slate-200">
                {t("velocityDescription")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
