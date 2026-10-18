"use client";

import { useTranslations } from "next-intl";
import { isInLaboratoryRange } from "../../../application/formulaInput";
import type { GravityValues } from "../../../types/gravity.types";
import { useGravityFormulaApplication } from "../../providers/GravityParametersProvider";
import css from "./GravityFormulaApplication.module.css";

const styles = {
  "application": "flex flex-wrap items-center justify-end [gap:10px_16px] [margin-block:8px_0]",
  "notice": "[flex:1_1_180px] min-w-0 m-0 [color:#b9b2cb] [font-size:.875rem] [line-height:1.5] [overflow-wrap:anywhere]",
  "applyButton": `${css["applyButton"]} [min-height:44px] max-w-full [padding:10px_14px] [border:1px_solid_#aa97ff70] [border-radius:9px] [background:#aa97ff20] [color:#e4dfff] [font-size:.875rem] font-semibold cursor-pointer [transition:background_180ms,_border-color_180ms]`,
} as const;

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
