"use client";

import { useId } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { GRAVITATIONAL_CONSTANT } from "../domain/gravitation";
import styles from "./GravityScienceCard.module.css";

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
