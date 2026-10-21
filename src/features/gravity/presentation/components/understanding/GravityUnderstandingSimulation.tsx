"use client";

import { useId } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { useGravityParameters } from "../../providers/GravityParametersProvider";
import { getGravityDiagram } from "../../gravityVisualization";
import { useGravityFormulaInteraction } from "./GravityFormulaInteraction";

// Representa visualmente dos cuerpos y su atracción gravitatoria,
// utilizando los mismos parámetros que el laboratorio y la calculadora.
export const GravityUnderstandingSimulation = ({
  compact = false,
}: {
  compact?: boolean;
}) => {
  // Obtiene las traducciones de la simulación gravitatoria.
  const t = useTranslations("Gravity");

  // Formatea los valores numéricos según el idioma.
  const format = useFormatter();

  // Genera identificadores únicos para los elementos del SVG.
  const id = useId();

  // Obtiene los parámetros actuales y la fuerza gravitatoria calculada.
  const { parameters, force } = useGravityParameters();

  // Obtiene la variable activa de la fórmula interactiva.
  const { active } = useGravityFormulaInteraction();

  // Comprueba si debe resaltarse el primer cuerpo.
  const firstActive = active === "mass1" || active === "masses";

  // Comprueba si debe resaltarse el segundo cuerpo.
  const secondActive = active === "mass2" || active === "masses";

  // Calcula el exponente de la fuerza en notación científica.
  const exponent = Math.floor(Math.log10(force));

  // Calcula y formatea el coeficiente de la fuerza gravitatoria.
  const mantissa = format.number(force / 10 ** exponent, {
    maximumFractionDigits: 2,
  });

  // Obtiene las posiciones, tamaños y flechas del diagrama gravitatorio.
  const { separation, x1, x2, radius1, radius2, leftArrow, rightArrow } =
    getGravityDiagram(parameters);

  return (
    <section
      data-understanding-simulation
      className={`flex flex-col min-w-0 border border-solid border-lab-line [border-radius:14px] [background:linear-gradient(145deg,_#131724,_#0e121d)]${compact ? ` lab-gravity-simulation-compact` : ""}`}
      aria-labelledby={`${id}-heading`}
    >
      <div className="flex flex-wrap items-center justify-between [gap:8px_12px] [padding:10px_18px] border-b border-solid border-lab-line [@media(max-width:600px)]:[padding-inline:14px] [&_h3]:[min-width:0] [&_h3]:[margin:0] [&_h3]:[color:#e4e8f2] [&_h3]:[font-size:1rem] [&_h3]:[font-weight:600] [&_h3]:[line-height:1.4] [.lab-gravity-simulation-compact_&]:[padding-inline:14px] [.lab-gravity-simulation-compact_&_h3]:[font-size:0.9375rem]">
        <h3 id={`${id}-heading`}>{t("visualTitle")}</h3>
        <span className="[color:#81d9c9] [font-size:.75rem] font-medium [line-height:1.5] [letter-spacing:.04em] [.lab-gravity-simulation-compact_&]:[font-size:0.6875rem]">
          {t(compact ? "liveResultShort" : "liveResult")}
        </span>
      </div>

      <div
        className="flex flex-wrap items-baseline justify-between [gap:6px_16px] min-w-0 [padding:12px_18px_0] [border:1px_solid_transparent] [border-radius:8px] [transition:background_140ms,_border-color_140ms] [@media(max-width:600px)]:[padding-inline:14px] [&_>_span]:[color:#b2bad0] [&_>_span]:[font-size:1rem] [&_>_span]:[line-height:1.5] [&_output]:[color:#e0d6ff] [&_output]:[font-size:clamp(1.5rem,_2.3vw,_1.875rem)] [&_output]:[line-height:1.3] [&_output]:[font-variant-numeric:tabular-nums] [&_output]:[overflow-wrap:anywhere] [&_sup]:[font-size:0.6em] [&_small]:[color:#b8b0d6] [&_small]:[font-size:0.65em] [.lab-gravity-simulation-compact_&]:[padding-inline:14px] [.lab-gravity-simulation-compact_&_>_span]:[font-size:0.875rem] [.lab-gravity-simulation-compact_&_output]:[font-size:1.5rem] [@media_(max-width:_600px)]:[.lab-gravity-simulation-compact_&]:[display:grid] [@media_(max-width:_600px)]:[.lab-gravity-simulation-compact_&]:[grid-template-columns:minmax(0,_1fr)_auto] [@media_(max-width:_600px)]:[.lab-gravity-simulation-compact_&]:[align-items:center] [@media_(max-width:_600px)]:[.lab-gravity-simulation-compact_&]:[gap:4px_8px] [@media_(max-width:_600px)]:[.lab-gravity-simulation-compact_&_output]:[font-size:1.375rem] [&[data-active=true]]:[border-color:#aa97ff70] [&[data-active=true]]:[background:#aa97ff10] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none]"
        data-simulation-variable="force"
        data-active={active === "force"}
      >
        <span>{t("force")}</span>
        <output
          aria-live="off"
          aria-label={`${format.number(force, { notation: "scientific", maximumSignificantDigits: 3 })} N`}
        >
          {mantissa} × 10<sup>{exponent}</sup> <small>N</small>
        </output>
      </div>

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
              m₁
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
              m₂
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

      <dl className="grid [grid-template-columns:repeat(3,_minmax(0,_1fr))] [gap:12px] m-0 [padding:12px_18px_16px] border-t border-solid border-lab-line [@media(max-width:600px)]:[padding-inline:14px] [@media(max-width:600px)]:[grid-template-columns:minmax(0,_1fr)] [@media(max-width:600px)]:[gap:8px] [&_>_div]:[min-width:0] [&_dt]:[margin:0_0_4px] [&_dt]:[color:#a7aec3] [&_dt]:[font-size:1rem] [&_dt]:[line-height:1.4] [&_dd]:[margin:0] [&_dd]:[color:#e4e8f2] [&_dd]:[font-size:1rem] [&_dd]:[line-height:1.5] [&_dd]:[font-variant-numeric:tabular-nums] [&_dd]:[overflow-wrap:anywhere] [&_>_div:first-child_dd]:[color:#c7b7ff] [&_>_div:nth-child(2)_dd]:[color:#95efde] [@media_(max-width:_600px)]:[&_>_div]:[display:flex] [@media_(max-width:_600px)]:[&_>_div]:[justify-content:space-between] [@media_(max-width:_600px)]:[&_>_div]:[gap:12px] [@media_(max-width:_600px)]:[&_dt]:[min-width:0] [@media_(max-width:_600px)]:[&_dt]:[margin:0] [@media_(max-width:_600px)]:[&_dd]:[flex-shrink:0] [@media_(max-width:_600px)]:[&_dd]:[text-align:right] [.lab-gravity-simulation-compact_&]:[padding-inline:14px] [.lab-gravity-simulation-compact_&]:[gap:8px] [.lab-gravity-simulation-compact_&]:[padding-block:10px] [.lab-gravity-simulation-compact_&_dt]:[font-size:0.875rem] [.lab-gravity-simulation-compact_&_dd]:[font-size:0.875rem] [@media_(max-width:_600px)]:[.lab-gravity-simulation-compact_&]:[gap:4px] [@media_(max-width:_600px)]:[.lab-gravity-simulation-compact_&_>_div]:[padding:0] [&_>_div]:[padding:4px] [&_>_div]:[border:1px_solid_transparent] [&_>_div]:[border-radius:7px] [&_>_div]:[transition:background_140ms,_border-color_140ms] [&_>_div[data-active=true]]:[border-color:#aa97ff70] [&_>_div[data-active=true]]:[background:#aa97ff12] [&_>_div:nth-child(2)[data-active=true]]:[border-color:#5ee7d570] [&_>_div:nth-child(2)[data-active=true]]:[background:#5ee7d510] [@media_(prefers-reduced-motion:_reduce)]:[&_>_div]:[transition:none]">
        <div data-active={firstActive}>
          <dt>{t("firstMass")}</dt>
          <dd>{format.number(parameters.mass1)} kg</dd>
        </div>

        <div data-active={secondActive}>
          <dt>{t("secondMass")}</dt>
          <dd>{format.number(parameters.mass2)} kg</dd>
        </div>

        <div data-active={active === "distance"}>
          <dt>{t("centreDistance")}</dt>
          <dd>{format.number(parameters.distance)} m</dd>
        </div>
      </dl>
    </section>
  );
};
