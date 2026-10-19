"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";

type Props = {
  onExplore: () => void;
};

const parameters = [
  "mass",
  "position",
  "velocity",
  "distance",
  "period",
  "integration",
] as const;

export const GalleryIntroduction = ({ onExplore }: Props) => {
  const t = useTranslations("ThreeBody.galleryGuide");
  const id = useId();
  const arrowId = `${id}-velocity-arrow`;

  return (
    <section className="flex min-w-0 flex-col gap-5">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b9a8ff]">
          {t("eyebrow")}
        </p>

        <h2 className="text-2xl font-semibold text-slate-50 sm:text-3xl">
          {t("title")}
        </h2>

        <p className="max-w-4xl text-sm leading-7 text-slate-300 sm:text-base">
          {t("intro")}
        </p>
      </header>

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        {/* Explicación gráfica */}
        <figure className="flex min-w-0 flex-col gap-3 rounded-2xl border border-[#303b59] bg-[#0b1120] p-4">
          <h3 className="text-lg font-semibold text-slate-100">
            {t("diagramTitle")}
          </h3>

          <svg
            viewBox="0 0 400 225"
            className="block h-auto w-full"
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

            {/* Distancias entre cuerpos */}
            <path
              d="M200 43L92 175L308 175Z"
              fill="none"
              stroke="#76829c"
              strokeDasharray="5 5"
              strokeWidth="1.5"
            />

            {/* Vectores de velocidad */}
            <g
              stroke="#5ee7d5"
              strokeWidth="2.5"
              markerEnd={`url(#${arrowId})`}
            >
              <path d="M215 37L260 21" />
              <path d="M106 186L145 208" />
              <path d="M292 186L254 208" />
            </g>

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
                  strokeWidth="1.5"
                />
                <circle cx={body.x} cy={body.y} r="7" fill={body.color} />
                <text
                  x={body.x}
                  y={body.y - 30}
                  fontSize="14"
                  fill="#e9edf6"
                  textAnchor="middle"
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

          <figcaption className="text-xs leading-5 text-slate-400">
            {t("diagramCaption")}
          </figcaption>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "masses", value: "1 · 1 · 1" },
              { label: "gravity", value: "G = 1" },
              { label: "dimensions", value: "2D" },
            ].map((item) => (
              <div
                key={item.label}
                className="min-w-0 rounded-lg bg-[#1b2335] p-2 text-center"
              >
                <p className="text-xs text-slate-400">
                  {t(item.label as "masses" | "gravity" | "dimensions")}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#d2c5ff]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </figure>

        {/* Definición del modelo */}
        <div className="flex flex-col gap-4 rounded-2xl border border-[#303b59] bg-[#131724] p-4">
          <h3 className="text-lg font-semibold text-slate-100">
            {t("modelTitle")}
          </h3>

          <p className="text-sm leading-6 text-slate-300">
            {t("modelDescription")}
          </p>

          <div className="rounded-xl border border-[#514477] bg-[#211d32] p-4 text-center">
            <p className="mb-2 text-xs text-slate-300">{t("equationTitle")}</p>

            <div
              className="text-xl text-[#e4dfff] sm:text-2xl"
              aria-label={t("equationDescription")}
            >
              Fᵢⱼ = G · mᵢ · mⱼ / rᵢⱼ²
            </div>
          </div>

          <h4 className="font-semibold text-slate-100">
            {t("parametersTitle")}
          </h4>

          <dl className="grid gap-3 sm:grid-cols-2">
            {parameters.map((parameter) => (
              <div
                key={parameter}
                className="rounded-xl border border-[#30364b] bg-[#0d1320] p-3"
              >
                <dt className="text-sm font-semibold text-[#c9baff]">
                  {t(`${parameter}Title`)}
                </dt>
                <dd className="mt-1 text-sm leading-6 text-slate-300">
                  {t(`${parameter}Description`)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Aclaración científica */}
      <aside className="rounded-xl border border-[#315c5b] bg-[#10242a] p-4">
        <h3 className="font-semibold text-[#a7f3e5]">{t("importantTitle")}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {t("importantDescription")}
        </p>
      </aside>

      <div className="flex justify-center py-2">
        <button
          type="button"
          onClick={onExplore}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#aa97ff] px-6 py-3 font-semibold text-[#101122] transition-colors hover:bg-[#c4b5fd] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c4b5fd]"
        >
          {t("explore")}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
};
