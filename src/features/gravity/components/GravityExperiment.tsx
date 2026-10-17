"use client";

import { useId } from "react";
import styles from "./GravityExperiment.module.css";
import { useFormatter, useTranslations } from "next-intl";
import { compareGravitation } from "../domain/compareGravitation";
import type { GravityParameters } from "../domain/gravitation";
import { getGravityDiagram } from "./gravityVisualization";
import { GravityForceComparison } from "./GravityForceComparison";
import { GravitySlider, gravityControls } from "./GravitySlider";

type ExperimentProps = {
  parameters: GravityParameters;
  onChange: (parameters: GravityParameters) => void;
  onReset: () => void;
};

export const GravityExperiment = ({
  parameters,
  onChange,
  onReset,
}: ExperimentProps) => {
  const id = useId();
  const t = useTranslations("Gravity");
  const format = useFormatter();
  const comparison = compareGravitation(parameters);
  const force = comparison.currentForce;
  const forceExplanation = t(`forceExplanation.${comparison.explanation}`, {
    percentage: format.number(comparison.forceRatio, {
      style: "percent",
      maximumFractionDigits: 2,
    }),
  });
  const exponent = Math.floor(Math.log10(force));
  const mantissa = format.number(force / 10 ** exponent, {
    maximumFractionDigits: 2,
  });
  const distanceKm = parameters.distance / 1000;
  const { separation, x1, x2, radius1, radius2, leftArrow, rightArrow } =
    getGravityDiagram(parameters);

  return (
    <section
      aria-labelledby={`${id}-heading`}
      className={`${styles["gravity-lab"]} ${styles.panel}`}
    >
      <div className={styles["lab-header"]}>
        <h3 id={`${id}-heading`} className={styles.eyebrow}>
          <span aria-hidden="true" className={styles["status-dot"]} />
          {t("interactiveLab")}
        </h3>
        <button
          type="button"
          onClick={onReset}
          className={styles.resetButton}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="size-4"
          >
            <path
              d="M4 10a8 8 0 1 1 1 7M4 4v6h6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{t("reset")}</span>
        </button>
      </div>
      <div className={styles.experimentLayout}>
        <div className={styles["force-result"]}>
          <div>
            <span>{t("force")}</span>
            <output
              aria-live="off"
              aria-label={`${format.number(force, { maximumSignificantDigits: 3 })} N`}
              aria-describedby={`${id}-force-explanation ${id}-intensity-description`}
            >
              {mantissa} × 10<sup>{exponent}</sup> <small>N</small>
            </output>
          </div>
          <span className={styles["live-pill"]}>{t("liveResult")}</span>
          <p
            id={`${id}-force-explanation`}
            className={styles.forceExplanation}
          >
            {forceExplanation}
          </p>
        </div>
        <figure
          className={`${styles["gravity-stage"]} ${styles["space-grid"]}`}
        >
          <svg
            viewBox="0 40 520 180"
            role="img"
            aria-labelledby={`${id}-title ${id}-desc`}
          >
            <title id={`${id}-title`}>{t("visualTitle")}</title>
            <desc id={`${id}-desc`}>{t("visualDescription")}</desc>
            <defs>
              <radialGradient id={`${id}-blue`} cx="30%" cy="25%">
                <stop stopColor="#d6cfff" />
                <stop offset=".5" stopColor="#9677ed" />
                <stop offset="1" stopColor="#392662" />
              </radialGradient>
              <radialGradient id={`${id}-gold`} cx="30%" cy="25%">
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
              d="M40 100H480 M260 25V205"
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
            <circle
              cx={x1}
              cy="100"
              r={radius1 + 9}
              fill="#a997ff"
              opacity=".05"
            />
            <circle
              cx={x2}
              cy="100"
              r={radius2 + 9}
              fill="#5ee7d5"
              opacity=".05"
            />
            <circle cx={x1} cy="100" r={radius1} fill={`url(#${id}-blue)`} />
            <circle cx={x2} cy="100" r={radius2} fill={`url(#${id}-gold)`} />
            <text
              x={x1}
              y="100"
              dominantBaseline="middle"
              className={styles.sphereLabel}
              textAnchor="middle"
              fill="#fff"
              fontSize="13"
              fontWeight="500"
            >
              m₁
            </text>
            <text
              x={x2}
              y="100"
              dominantBaseline="middle"
              className={styles.sphereLabel}
              textAnchor="middle"
              fill="#fff"
              fontSize="13"
              fontWeight="500"
            >
              m₂
            </text>
            <line
              data-force-arrow="left"
              x1={leftArrow.start}
              y1="100"
              x2={leftArrow.end}
              y2="100"
              stroke="#e2e8f0"
              strokeWidth="1.8"
              markerEnd={`url(#${id}-arrow)`}
            />
            <line
              data-force-arrow="right"
              x1={rightArrow.start}
              y1="100"
              x2={rightArrow.end}
              y2="100"
              stroke="#e2e8f0"
              strokeWidth="1.8"
              markerEnd={`url(#${id}-arrow)`}
            />
            <path
              d={`M${x1} 164v12m0-6h${separation}m0-6v12`}
              stroke="#94a3b8"
            />
            <text
              x="260"
              y="202"
              className={styles.distanceLabel}
              textAnchor="middle"
              fill="#e2e8f0"
              fontSize="15"
            >
              r = {format.number(distanceKm)} km · {t("betweenCentres")}
            </text>
          </svg>
          <figcaption className={styles["stage-note"]}>
            {t("stageNote")}
            <span className={styles.directionNote}>
              {t("directionOnlyNote")}
            </span>
            <details className={styles.helperDetails}>
              <summary>{t("laboratoryModelDetails")}</summary>
              <p>{t("modelNote")}</p>
            </details>
          </figcaption>
        </figure>
        <div className={styles.controlPanel}>
          <div className={styles["lab-sliders"]}>
            <p id={`${id}-controls-hint`} className={styles.controlsHint}>
              {t("experimentControlsHint")}
            </p>
            {gravityControls.map((control) => (
              <GravitySlider
                key={control.key}
                control={control}
                value={parameters[control.key] / control.scale}
                descriptionId={`${id}-controls-hint ${id}-force-explanation ${id}-intensity-description`}
                onChange={(value) =>
                  onChange({
                    ...parameters,
                    [control.key]: value * control.scale,
                  })
                }
              />
            ))}
            <GravityForceComparison
              currentForce={force}
              initialForce={comparison.referenceForce}
              idPrefix={`${id}-intensity`}
            />
            <details className={styles.helperDetails}>
              <summary>{t("laboratoryUnitsDetails")}</summary>
              <p>{t("tinyForce")}</p>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
};
