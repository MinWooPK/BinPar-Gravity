"use client";

import { useId } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { useGravityParameters } from "../../providers/GravityParametersProvider";
import { getGravityDiagram } from "../../gravityVisualization";
import css from "./GravityUnderstandingSimulation.module.css";
import { useGravityFormulaInteraction } from "./GravityFormulaInteraction";

const styles = {
  "card": "flex flex-col min-w-0 border border-solid border-lab-line [border-radius:14px] [background:linear-gradient(145deg,_#131724,_#0e121d)]",
  "heading": `${css["heading"]} flex flex-wrap items-center justify-between [gap:8px_12px] [padding:10px_18px] border-b border-solid border-lab-line [@media(max-width:600px)]:[padding-inline:14px]`,
  "live": `${css["live"]} [color:#81d9c9] [font-size:.75rem] font-medium [line-height:1.5] [letter-spacing:.04em]`,
  "force": `${css["force"]} flex flex-wrap items-baseline justify-between [gap:6px_16px] min-w-0 [padding:12px_18px_0] [border:1px_solid_transparent] [border-radius:8px] [transition:background_140ms,_border-color_140ms] [@media(max-width:600px)]:[padding-inline:14px]`,
  "diagram": `${css["diagram"]} flex [flex:1] flex-col min-w-0 m-0 [padding:0_18px_10px] [background-size:30px_30px] [background-position:center] [@media(max-width:600px)]:[padding-inline:14px]`,
  "bodyLabel": "[font-size:18px] font-medium [@media(max-width:600px)]:[font-size:24px]",
  "distanceLabel": "[font-size:18px] font-medium [@media(max-width:600px)]:[font-size:24px]",
  "values": `${css["values"]} grid [grid-template-columns:repeat(3,_minmax(0,_1fr))] [gap:12px] m-0 [padding:12px_18px_16px] border-t border-solid border-lab-line [@media(max-width:600px)]:[padding-inline:14px] [@media(max-width:600px)]:[grid-template-columns:minmax(0,_1fr)] [@media(max-width:600px)]:[gap:8px]`,
  "compact": `${css["compact"]} `,
  "sphere": `${css["sphere"]} [stroke:transparent] [stroke-width:2.5] [transition:stroke_140ms]`,
  "separation": `${css["separation"]} [transition:stroke_140ms,_stroke-width_140ms]`,
} as const;

/** Read-only view of the same laboratory state used by Experiment and the calculator. */
export const GravityUnderstandingSimulation = ({ compact = false }: { compact?: boolean }) => {
  const t = useTranslations("Gravity");
  const format = useFormatter();
  const id = useId();
  const { parameters, force } = useGravityParameters();
  const { active } = useGravityFormulaInteraction();
  const firstActive = active === "mass1" || active === "masses";
  const secondActive = active === "mass2" || active === "masses";
  const exponent = Math.floor(Math.log10(force));
  const mantissa = format.number(force / 10 ** exponent, { maximumFractionDigits: 2 });
  const { separation, x1, x2, radius1, radius2, leftArrow, rightArrow } = getGravityDiagram(parameters);

  return (
    <section data-understanding-simulation className={`${styles.card}${compact ? ` ${styles.compact}` : ""}`} aria-labelledby={`${id}-heading`}>
      <div className={styles.heading}>
        <h3 id={`${id}-heading`}>{t("visualTitle")}</h3>
        <span className={styles.live}>{t(compact ? "liveResultShort" : "liveResult")}</span>
      </div>
      <div className={styles.force} data-simulation-variable="force" data-active={active === "force"}>
        <span>{t("force")}</span>
        <output aria-live="off" aria-label={`${format.number(force, { notation: "scientific", maximumSignificantDigits: 3 })} N`}>
          {mantissa} × 10<sup>{exponent}</sup> <small>N</small>
        </output>
      </div>
      <figure className={styles.diagram}>
        <svg viewBox="0 40 520 150" role="img" aria-labelledby={`${id}-title ${id}-description`}>
          <title id={`${id}-title`}>{t("visualTitle")}</title>
          <desc id={`${id}-description`}>{t("stageNote")} · {t("directionOnlyNote")}</desc>
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
            <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="10" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto">
              <path d="M0 0 10 5 0 10Z" fill="#e2e8f0" />
            </marker>
          </defs>
          <path d="M40 100H480 M260 40V180" stroke="#94a3b8" strokeOpacity=".08" strokeDasharray="3 8" />
          <line x1={x1} y1="100" x2={x2} y2="100" stroke="#94a3b8" strokeOpacity=".4" strokeDasharray="3 6" />
          <g className={css.position} style={{ transform: `translateX(${x1}px)` }}>
            <circle className={css.radius} cy="100" r={radius1 + 9} fill="#a997ff" opacity=".05" />
            <circle className={`${styles.sphere} ${css.radius}`} data-simulation-variable="mass1" data-active={firstActive} cy="100" r={radius1} fill={`url(#${id}-purple)`} />
            <text y="100" dominantBaseline="middle" textAnchor="middle" fill="#fff" className={styles.bodyLabel}>m₁</text>
            <g className={css.position} style={{ transform: `translateX(${leftArrow.start - x1}px)` }}>
              <line x1="0" y1="100" x2={leftArrow.end - leftArrow.start} y2="100" stroke="#e2e8f0" strokeWidth="1.8" markerEnd={`url(#${id}-arrow)`} />
            </g>
          </g>
          <g className={css.position} style={{ transform: `translateX(${x2}px)` }}>
            <circle className={css.radius} cy="100" r={radius2 + 9} fill="#5ee7d5" opacity=".05" />
            <circle className={`${styles.sphere} ${css.radius}`} data-simulation-variable="mass2" data-active={secondActive} cy="100" r={radius2} fill={`url(#${id}-mint)`} />
            <text y="100" dominantBaseline="middle" textAnchor="middle" fill="#fff" className={styles.bodyLabel}>m₂</text>
            <g className={css.position} style={{ transform: `translateX(${rightArrow.start - x2}px)` }}>
              <line x1="0" y1="100" x2={rightArrow.end - rightArrow.start} y2="100" stroke="#e2e8f0" strokeWidth="1.8" markerEnd={`url(#${id}-arrow)`} />
            </g>
          </g>
          <g className={`${styles.separation} ${css.position}`} style={{ transform: `translateX(${x1}px)` }} data-simulation-variable="distance" data-active={active === "distance"} stroke="#94a3b8">
            <path d="M0 158v12" />
            <path className={css.position} style={{ transform: `scaleX(${separation})` }} d="M0 164h1" vectorEffect="non-scaling-stroke" />
            <path className={css.position} style={{ transform: `translateX(${separation}px)` }} d="M0 158v12" />
          </g>
          <text x="260" y="185" textAnchor="middle" fill="#e2e8f0" className={styles.distanceLabel}>r</text>
        </svg>
        <figcaption>{t("directionOnlyNote")}</figcaption>
      </figure>
      <dl className={styles.values}>
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
