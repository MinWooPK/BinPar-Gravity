"use client";

import { useId } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { GRAVITATIONAL_CONSTANT } from "../../../domain/gravitation";
import css from "./GravityScienceCard.module.css";

const styles = {
  "card": `${css["card"]} grid min-w-0 [align-content:space-between] [gap:8px] [padding:16px] border border-solid border-lab-line [border-radius:14px] [background:linear-gradient(145deg,_#131724,_#0e121d)] [color:#b2bad0] [font-size:.875rem] [line-height:1.45] [overflow-wrap:anywhere] [@media(max-width:520px)]:[padding:14px]`,
  "law": "grid min-w-0 items-center gap-2 min-[1024px]:grid-cols-[auto_minmax(0,1fr)]",
  "equation": "flex justify-center [padding-block:1px_7px] [color:#e4dfff] [font-family:Georgia,_serif] [font-size:2rem] [line-height:1.1]",
  "expression": "inline-flex items-center [gap:9px]",
  "operator": "[color:#a99bbf] [font-size:.7em]",
  "fraction": `${css["fraction"]} inline-flex flex-col min-w-0 text-center`,
  "constant": "min-w-0 [padding-top:8px] [border-top:1px_solid_#30364b]",
  "constantHeading": "flex items-baseline justify-between flex-wrap [gap:3px_12px] [margin-bottom:5px] [@media(max-width:520px)]:[gap:3px_8px]",
  "constantValue": `${css["constantValue"]} [color:#d8c9ff] [font-size:1rem] font-medium [line-height:1.7]`,
  "unit": `${css["unit"]} whitespace-nowrap [overflow-wrap:normal]`,
  "variables": `${css["variables"]} w-full border-collapse [font-size:.875rem] [line-height:1.4]`,
  "units": `${css["units"]} [padding-top:8px] [border-top:1px_solid_#30364b]`,
  "identity": `${css["identity"]} `,
  "srOnly": "absolute [width:1px] [height:1px] p-0 [margin:-1px] overflow-hidden [clip:rect(0,_0,_0,_0)] whitespace-nowrap [border:0]",
} as const;

const variables = [
  { symbol: "F", meaning: "formulaForceLabel", unit: "N" },
  { symbol: "G", meaning: "scienceConstantLabel", unit: "N·m²/kg²" },
  { symbol: "m₁", meaning: "scienceFirstMassMeaning", unit: "kg" },
  { symbol: "m₂", meaning: "scienceSecondMassMeaning", unit: "kg" },
  { symbol: "r", meaning: "scienceDistanceMeaning", unit: "m" },
] as const;

/** Informational reference; the editable calculator remains in Understand. */
export const GravityScienceCard = () => {
  const t = useTranslations("Gravity");
  const format = useFormatter();
  const id = useId();
  const [coefficient, exponent] = GRAVITATIONAL_CONSTANT.toExponential(5).split("e");
  const constantValue = format.number(Number(coefficient), {
    minimumFractionDigits: 5,
    maximumFractionDigits: 5,
    useGrouping: false,
  });

  return (
    <section className={styles.card} aria-labelledby={`${id}-heading`} data-discovery-science>
      <h3 id={`${id}-heading`}>{t("title")}</h3>

      <div className={styles.law}>
        <div className={styles.equation} role="img" aria-label={t("formulaSpoken")}>
          <span aria-hidden="true" className={styles.expression}>
            <span>F</span><span className={styles.operator}>=</span><span>G</span>
            <span className={styles.operator}>·</span>
            <span className={styles.fraction}>
              <span>m₁ <span className={styles.operator}>×</span> m₂</span>
              <span>r<sup>2</sup></span>
            </span>
          </span>
        </div>
        <p>{t("scienceLawDescription")}</p>
      </div>

      <div className={styles.constant}>
        <div className={styles.constantHeading}>
          <h4>{t("scienceConstantLabel")}</h4>
          <p className={styles.constantValue}>
            <span className={styles.srOnly}>{t("scienceConstantSpoken", { value: constantValue, exponent: Number(exponent) })}</span>
            <span aria-hidden="true">
              {t.rich("formulaConstantValue", {
                value: constantValue,
                exponent: Number(exponent),
                power: (chunks) => <sup>{chunks}</sup>,
                unit: (chunks) => <span className={styles.unit}>{chunks}</span>,
              })}
            </span>
          </p>
        </div>
        <p>{t("scienceConstantDescription")}</p>
      </div>

      <table className={styles.variables}>
        <caption className={styles.srOnly}>{t("scienceVariablesCaption")}</caption>
        <thead>
          <tr>
            <th scope="col">{t("scienceSymbolColumn")}</th>
            <th scope="col">{t("scienceMeaningColumn")}</th>
            <th scope="col">{t("scienceUnitColumn")}</th>
          </tr>
        </thead>
        <tbody>
          {variables.map((variable) => (
            <tr key={variable.symbol}>
              <th scope="row">{variable.symbol}</th>
              <td>{t(variable.meaning)}</td>
              <td className={styles.unit}>{variable.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.units}>
        <p>{t.rich("scienceUnitsExplanation", { highlight: (chunks) => <strong>{chunks}</strong> })}</p>
        <p className={styles.identity}>
          <span className={styles.srOnly}>{t("scienceNewtonIdentity")}</span>
          <span aria-hidden="true">1 N = 1 kg·m/s²</span>
        </p>
      </div>
    </section>
  );
};
