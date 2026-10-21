"use client";

import { useTranslations } from "next-intl";
import { getGravityDiagram } from "@/features/gravity/presentation/gravityVisualization";
import type { GravityParameters } from "@/features/gravity/types/gravity.types";
import type { FormulaTerm } from "@/features/gravity/types/formula.types";

type GravityAttractionDiagramProps = {
  id: string;
  parameters: GravityParameters;
  active: FormulaTerm | null;
};

// Representa las masas, la distancia y las flechas de atracción entre cuerpos.
export const GravityAttractionDiagram = ({
  id,
  parameters,
  active,
}: GravityAttractionDiagramProps) => {
  const t = useTranslations("Gravity");

  // Conserva los resaltados compartidos con la fórmula interactiva.
  const firstActive = active === "mass1" || active === "masses";
  const secondActive = active === "mass2" || active === "masses";

  // Calcula las posiciones visuales sin cambiar la física del laboratorio.
  const { separation, x1, x2, radius1, radius2, leftArrow, rightArrow } =
    getGravityDiagram(parameters);

  return (
    <figure className="flex [flex:1] flex-col min-w-0 m-0 [padding:0_18px_10px] [background-size:30px_30px] [background-position:center] [@media(max-width:600px)]:[padding-inline:14px] [&]:[background-image:linear-gradient(#7d81ab08_1px,_transparent_1px),_linear-gradient(90deg,_#7d81ab08_1px,_transparent_1px)] [&_svg]:[display:block] [&_svg]:[width:100%] [&_svg]:[flex:1] [&_svg]:[height:auto] [&_svg]:[min-height:160px] [&_figcaption]:[color:#b2bad0] [&_figcaption]:[font-size:1rem] [&_figcaption]:[line-height:1.5] [@media_(max-width:_600px)]:[&_svg]:[min-height:100px] [@media_(max-width:_600px)]:[&_svg]:[max-height:160px] [.lab-gravity-simulation-compact_&]:[padding-inline:14px] [.lab-gravity-simulation-compact_&_figcaption]:[font-size:0.875rem] [.lab-gravity-simulation-compact_&_figcaption]:[line-height:1.45] [@media_(max-width:_600px)]:[.lab-gravity-simulation-compact_&_svg]:[min-height:90px] [@media_(max-width:_600px)]:[.lab-gravity-simulation-compact_&_svg]:[max-height:100px]">
      <svg
        viewBox="0 40 520 150"
        role="img"
        aria-labelledby={`${id}-title ${id}-description`}
      >
        <title id={`${id}-title`}>{t("visualTitle")}</title>

        <desc id={`${id}-description`}>
          {t("stageNote")} · {t("directionOnlyNote")}
        </desc>

        <defs>
          <radialGradient id={`${id}-purple`} cx="30%" cy="25%">
            <stop stopColor="#d6cfff" />
            <stop offset=".5" stopColor="#9677ed" />
            <stop offset="1" stopColor="#392662" />
          </radialGradient>

          <radialGradient id={`${id}-mint`} cx="30%" cy="25%">
            <stop stopColor="#c9fff3" />
            <stop offset=".5" stopColor="#65d9c5" />
            <stop offset="1" stopColor="#184b4e" />
          </radialGradient>

          <marker
            id={`${id}-arrow`}
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerUnits="userSpaceOnUse"
            markerWidth="8"
            markerHeight="8"
            orient="auto"
          >
            <path d="M0 0 10 5 0 10Z" fill="#e2e8f0" />
          </marker>
        </defs>

        <path
          d="M40 100H480 M260 40V180"
          stroke="#94a3b8"
          strokeOpacity=".08"
          strokeDasharray="3 8"
        />

        <line
          x1={x1}
          y1="100"
          x2={x2}
          y2="100"
          stroke="#94a3b8"
          strokeOpacity=".4"
          strokeDasharray="3 6"
        />

        <g
          className="[&]:[transition:transform_140ms_linear] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none]"
          style={{ transform: `translateX(${x1}px)` }}
        >
          <circle
            className="[&]:[transition:r_140ms_linear,_stroke_140ms] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none]"
            cy="100"
            r={radius1 + 9}
            fill="#a997ff"
            opacity=".05"
          />

          <circle
            className="[stroke:transparent] [stroke-width:2.5] [transition:stroke_140ms] [&[data-active=true]]:[stroke:#c4b5fd] [&[data-simulation-variable=mass2][data-active=true]]:[stroke:#5ee7d5] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none] [&]:[transition:r_140ms_linear,_stroke_140ms] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none]"
            data-simulation-variable="mass1"
            data-active={firstActive}
            cy="100"
            r={radius1}
            fill={`url(#${id}-purple)`}
          />

          <text
            y="100"
            dominantBaseline="middle"
            textAnchor="middle"
            fill="#fff"
            className="[font-size:18px] font-medium [@media(max-width:600px)]:[font-size:24px]"
          >
            m
            <tspan baselineShift="sub" fontSize="65%">
              1
            </tspan>
          </text>

          <g
            className="[&]:[transition:transform_140ms_linear] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none]"
            style={{ transform: `translateX(${leftArrow.start - x1}px)` }}
          >
            <line
              x1="0"
              y1="100"
              x2={leftArrow.end - leftArrow.start}
              y2="100"
              stroke="#e2e8f0"
              strokeWidth="1.8"
              markerEnd={`url(#${id}-arrow)`}
            />
          </g>
        </g>

        <g
          className="[&]:[transition:transform_140ms_linear] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none]"
          style={{ transform: `translateX(${x2}px)` }}
        >
          <circle
            className="[&]:[transition:r_140ms_linear,_stroke_140ms] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none]"
            cy="100"
            r={radius2 + 9}
            fill="#5ee7d5"
            opacity=".05"
          />

          <circle
            className="[stroke:transparent] [stroke-width:2.5] [transition:stroke_140ms] [&[data-active=true]]:[stroke:#c4b5fd] [&[data-simulation-variable=mass2][data-active=true]]:[stroke:#5ee7d5] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none] [&]:[transition:r_140ms_linear,_stroke_140ms] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none]"
            data-simulation-variable="mass2"
            data-active={secondActive}
            cy="100"
            r={radius2}
            fill={`url(#${id}-mint)`}
          />

          <text
            y="100"
            dominantBaseline="middle"
            textAnchor="middle"
            fill="#fff"
            className="[font-size:18px] font-medium [@media(max-width:600px)]:[font-size:24px]"
          >
            m
            <tspan baselineShift="sub" fontSize="65%">
              2
            </tspan>
          </text>

          <g
            className="[&]:[transition:transform_140ms_linear] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none]"
            style={{ transform: `translateX(${rightArrow.start - x2}px)` }}
          >
            <line
              x1="0"
              y1="100"
              x2={rightArrow.end - rightArrow.start}
              y2="100"
              stroke="#e2e8f0"
              strokeWidth="1.8"
              markerEnd={`url(#${id}-arrow)`}
            />
          </g>
        </g>

        <g
          className="[transition:stroke_140ms,_stroke-width_140ms] [&[data-active=true]]:[stroke:#d8b4fe] [&[data-active=true]]:[stroke-width:2.5] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none] [&]:[transition:transform_140ms_linear] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none]"
          style={{ transform: `translateX(${x1}px)` }}
          data-simulation-variable="distance"
          data-active={active === "distance"}
          stroke="#94a3b8"
        >
          <path d="M0 158v12" />

          <path
            className="[&]:[transition:transform_140ms_linear] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none]"
            style={{ transform: `scaleX(${separation})` }}
            d="M0 164h1"
            vectorEffect="non-scaling-stroke"
          />

          <path
            className="[&]:[transition:transform_140ms_linear] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none]"
            style={{ transform: `translateX(${separation}px)` }}
            d="M0 158v12"
          />
        </g>

        <text
          x="260"
          y="185"
          textAnchor="middle"
          fill="#e2e8f0"
          className="[font-size:18px] font-medium [@media(max-width:600px)]:[font-size:24px]"
        >
          r
        </text>
      </svg>

      <figcaption>{t("directionOnlyNote")}</figcaption>
    </figure>
  );
};
