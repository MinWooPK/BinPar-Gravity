"use client";

import { useTranslations } from "next-intl";
import { isInLaboratoryRange } from "../application/formulaInput";
import type { GravityValues } from "../domain/gravitation";
import { useGravityFormulaApplication } from "./GravityParametersProvider";
import styles from "./GravityFormulaApplication.module.css";

export const GravityFormulaApplication = ({
  result,
  valid,
  hasInputs,
}: {
  result: GravityValues | null;
  valid: boolean;
  hasInputs: boolean;
}) => {
  const t = useTranslations("Gravity");
  const { parameters, applyParameters } = useGravityFormulaApplication();
  const matchesLaboratory =
    result !== null &&
    result.mass1 === parameters.mass1 &&
    result.mass2 === parameters.mass2 &&
    result.distance === parameters.distance;
  const canApply = valid && result !== null && isInLaboratoryRange(result);
  const pending = hasInputs && !matchesLaboratory;

  return (
    <div className={styles.application}>
      <p className={styles.notice} role="status" aria-live="polite">
        {pending ? t("formulaNotApplied") : ""}
      </p>
      <button
        type="button"
        className={styles.applyButton}
        disabled={!canApply}
        onClick={() => {
          if (canApply && result) {
            const { mass1, mass2, distance } = result;
            applyParameters({ mass1, mass2, distance });
          }
        }}
      >
        {t("applyFormulaToLab")}
      </button>
    </div>
  );
};
