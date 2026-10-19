"use client";

import { useTutorActions } from "@/features/ai/presentation/providers/tutorEnvironment";
import { useId, useRef, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { compareGravitation } from "../../../domain/compareGravitation";
import type { GravityParameters } from "../../../types/gravity.types";
import { GravityExperimentTutor } from "./GravityExperimentTutor";
import { GravityForceComparison } from "./GravityForceComparison";
import { GravitySlider, gravityControls } from "./GravitySlider";
import { GravityFormula } from "../understanding/GravityFormula";
import { useGravityFormulaInteraction } from "../understanding/GravityFormulaInteraction";
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
  const [view, setView] = useState<"experiment" | "formula">("experiment");
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const interaction = useGravityFormulaInteraction();
  const selectView = (next: typeof view) => {
    setView(next);
    interaction.hover(null);
    interaction.focus(null);
    interaction.select(null);
  };
  const tutor = useTranslations("Tutor");
  const { openTutor } = useTutorActions();
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
    <section
      aria-label={t("experimentHeading")}
      className={`${styles["gravity-lab"]} ${styles.panel}`}
    >
      <div role="tablist" aria-label={t("experimentViews.label")} className={styles.viewTabs}>
        {(["experiment", "formula"] as const).map((tab, index) => (
          <button key={tab} ref={(element) => { tabs.current[index] = element; }}
            type="button" role="tab" id={`${id}-tab-${tab}`} data-experiment-view={tab}
            aria-selected={view === tab} aria-controls={`${id}-panel-${tab}`} tabIndex={view === tab ? 0 : -1}
            className={styles.viewTab} onClick={() => selectView(tab)}
            onKeyDown={(event) => {
              if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
              event.preventDefault();
              const next = event.key === "Home" ? 0 : event.key === "End" ? 1 : 1 - index;
              selectView(next === 0 ? "experiment" : "formula");
              tabs.current[next]?.focus();
            }}>
            {t(`experimentViews.${tab}`)}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${id}-panel-experiment`} aria-labelledby={`${id}-tab-experiment`}
        hidden={view !== "experiment"} inert={view !== "experiment"}
        className={view === "experiment" ? styles.viewPanel : "hidden"}>
        <div className={styles["lab-header"]}>
          <h3 id={`${id}-heading`} className={styles.heading}>
            {t("experimentHeading")}
          </h3>
          <div className={styles.headerActions}>
            <button type="button" onClick={onReset} aria-label={t("reset")} className={styles.resetButton}>
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
          <p id={`${id}-controls-hint`} className={styles.controlsHint}>
            {t("experimentControlsHint")}
          </p>
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
          <details className={styles.helperDetails}>
            <summary>{t("laboratoryDetails")}</summary>
            <p>{t("forceComparisonScale")}</p>
            <p>{t("stageNote")}</p>
            <p>{t("modelNote")}</p>
            <p>{t("tinyForce")}</p>
          </details>
        </div>
        <div className="flex flex-wrap gap-2 px-3.5 pt-1 pb-3">
          <button type="button" data-experiment-explain aria-controls="inline-tutor-gravity-laboratory"
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-violet-400/50 bg-violet-400/10 px-3 py-2 text-sm font-semibold text-violet-200 transition-colors hover:bg-violet-400/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 motion-reduce:transition-none"
            onClick={(event) => openTutor("explain_experiment", event.currentTarget)}>
            {tutor("explainExperiment")}
          </button>
          <button type="button" data-experiment-configure aria-controls="inline-tutor-gravity-laboratory"
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-cyan-300/40 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-300/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 motion-reduce:transition-none"
            onClick={(event) => openTutor("configure_experiment", event.currentTarget)}>
            {tutor("configureExperiment")}
          </button>
        </div>
      </div>
      <div role="tabpanel" id={`${id}-panel-formula`} aria-labelledby={`${id}-tab-formula`}
        hidden={view !== "formula"} inert={view !== "formula"}
        className={view === "formula" ? styles.viewPanel : "hidden"}>
        <GravityFormula variant="embedded" />
      </div>
      <div className="min-w-0 shrink-0 px-3.5 pb-3.5"><GravityExperimentTutor /></div>
    </section>
  );
};
