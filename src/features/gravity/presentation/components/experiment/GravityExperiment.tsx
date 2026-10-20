"use client";

import { useId } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { compareGravitation } from "../../../domain/compareGravitation";
import type { GravityParameters } from "../../../types/gravity.types";
import { ExplainWithAI } from "@/features/ai/presentation/components/ExplainWithAI";
import { GravityForceComparison } from "./GravityForceComparison";
import { GravitySlider, gravityControls } from "./GravitySlider";
import { GravityFormula } from "../understanding/GravityFormula";
import { GravityContentTabs } from "../shared/GravityContentTabs";
import { gravityExperimentStyles as styles } from "./GravityExperiment.styles";

type ExperimentProps = {
  parameters: GravityParameters;
  onChange: (parameters: GravityParameters) => void;
  onReset: () => void;
};

/** Controls for the shared laboratory; the stage layout owns its simulation. */
export const GravityExperiment = ({
  parameters,
  onChange,
  onReset,
}: ExperimentProps) => {
  const id = useId();
  const t = useTranslations("Gravity");
  const format = useFormatter();
  const comparison = compareGravitation(parameters);
  const forceExplanation = t(`forceExplanation.${comparison.explanation}`, {
    percentage: format.number(comparison.forceRatio, {
      style: "percent",
      maximumFractionDigits: 2,
    }),
  });

  return (
    <GravityContentTabs
      primary="experiment"
      calculator={<GravityFormula variant="embedded" />}
    >
      <section
        aria-label={t("experimentHeading")}
        className={`${styles["gravity-lab"]} flex flex-col gap-3 pb-3`}
      >
        <div className={styles["lab-header"]}>
          <h3 id={`${id}-heading`} className={styles.heading}>
            {t("experimentHeading")} <ExplainWithAI topic="simulation" />
          </h3>
          <div className={styles.headerActions}>
            <button
              type="button"
              onClick={onReset}
              aria-label={t("reset")}
              className={styles.resetButton}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path
                  d="M4 10a8 8 0 1 1 1 7M4 4v6h6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{t("resetShort")}</span>
            </button>
          </div>
        </div>
        <div className={styles["lab-sliders"]}>
          {gravityControls.map((control) => (
            <GravitySlider
              key={control.key}
              control={control}
              value={parameters[control.key]}
              descriptionId={`${id}-controls-hint ${id}-force-explanation ${id}-intensity-description`}
              onChange={(value) =>
                onChange({
                  ...parameters,
                  [control.key]: value,
                })
              }
            />
          ))}
        </div>
        <GravityForceComparison
          currentForce={comparison.currentForce}
          initialForce={comparison.referenceForce}
          idPrefix={`${id}-intensity`}
        />
        <div className={styles.explanationPanel}>
          <p id={`${id}-force-explanation`} className={styles.forceExplanation}>
            {forceExplanation}
          </p>
          {/* <details className={styles.helperDetails}>
            <summary>{t("laboratoryDetails")}</summary>
            <p>{t("forceComparisonScale")}</p>
            <p>{t("stageNote")}</p>
            <p>{t("modelNote")}</p>
            <p>{t("tinyForce")}</p>
          </details> */}
        </div>
      </section>
    </GravityContentTabs>
  );
};
