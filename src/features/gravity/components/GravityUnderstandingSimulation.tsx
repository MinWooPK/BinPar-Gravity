"use client";

import { useId } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { gravitationalForce } from "../domain/gravitation";
import { useGravityParameters } from "./GravityParametersProvider";
import { getGravityDiagram } from "./gravityVisualization";
import styles from "./GravityUnderstandingSimulation.module.css";
import { useGravityFormulaInteraction } from "./GravityFormulaInteraction";

/** Read-only view of the same laboratory state used by Experiment and the calculator. */
export const GravityUnderstandingSimulation = ({ compact = false }: { compact?: boolean }) => {
  const t = useTranslations("Gravity");
  const format = useFormatter();
  const id = useId();
  const { parameters } = useGravityParameters();
  const { active } = useGravityFormulaInteraction();
  const firstActive = active === "mass1" || active === "masses";
  const secondActive = active === "mass2" || active === "masses";
  const force = gravitationalForce(parameters);
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
        <output aria-live="off" aria-label={`${format.number(force, { maximumSignificantDigits: 3 })} N`}>
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
          <circle cx={x1} cy="100" r={radius1 + 9} fill="#a997ff" opacity=".05" />
          <circle cx={x2} cy="100" r={radius2 + 9} fill="#5ee7d5" opacity=".05" />
          <circle className={styles.sphere} data-simulation-variable="mass1" data-active={firstActive} cx={x1} cy="100" r={radius1} fill={`url(#${id}-purple)`} />
          <circle className={styles.sphere} data-simulation-variable="mass2" data-active={secondActive} cx={x2} cy="100" r={radius2} fill={`url(#${id}-mint)`} />
          <text x={x1} y="100" dominantBaseline="middle" textAnchor="middle" fill="#fff" className={styles.bodyLabel}>m₁</text>
          <text x={x2} y="100" dominantBaseline="middle" textAnchor="middle" fill="#fff" className={styles.bodyLabel}>m₂</text>
          <line x1={leftArrow.start} y1="100" x2={leftArrow.end} y2="100" stroke="#e2e8f0" strokeWidth="1.8" markerEnd={`url(#${id}-arrow)`} />
          <line x1={rightArrow.start} y1="100" x2={rightArrow.end} y2="100" stroke="#e2e8f0" strokeWidth="1.8" markerEnd={`url(#${id}-arrow)`} />
          <path className={styles.separation} data-simulation-variable="distance" data-active={active === "distance"} d={`M${x1} 158v12m0-6h${separation}m0-6v12`} stroke="#94a3b8" />
          <text x="260" y="185" textAnchor="middle" fill="#e2e8f0" className={styles.distanceLabel}>r</text>
        </svg>
        <figcaption>{t("directionOnlyNote")}</figcaption>
      </figure>
      <dl className={styles.values}>
        <div data-active={firstActive}>
          <dt>{t("firstMass")}</dt>
          <dd>{format.number(parameters.mass1 / 1e12)} × 10¹² kg</dd>
        </div>
        <div data-active={secondActive}>
          <dt>{t("secondMass")}</dt>
          <dd>{format.number(parameters.mass2 / 1e12)} × 10¹² kg</dd>
        </div>
        <div data-active={active === "distance"}>
          <dt>{t("centreDistance")}</dt>
          <dd>{format.number(parameters.distance / 1000)} km</dd>
        </div>
      </dl>
    </section>
  );
};
