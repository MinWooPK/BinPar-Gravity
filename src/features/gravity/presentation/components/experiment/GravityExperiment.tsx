"use client";

import { Reset } from "@/components/icons";

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

// Define los parámetros y las funciones de control que recibe el experimento.
type ExperimentProps = {
  parameters: GravityParameters;
  onChange: (parameters: GravityParameters) => void;
  onReset: () => void;
};

// Muestra la etapa 03 · Experimenta, permitiendo modificar
// las masas y la distancia y observar sus efectos sobre la gravedad.
export const GravityExperiment = ({
  parameters,
  onChange,
  onReset,
}: ExperimentProps) => {
  // Genera identificadores únicos para los elementos accesibles.
  const id = useId();

  // Obtiene las traducciones de la sección de gravedad.
  const t = useTranslations("Gravity");

  // Permite formatear los valores numéricos según el idioma.
  const format = useFormatter();

  // Compara la fuerza gravitatoria actual con la configuración inicial.
  const comparison = compareGravitation(parameters);

  // Genera una explicación educativa según los cambios realizados.
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
              <Reset variant="gravity" strokeWidth="1.7" />
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
