import { useFormatter, useTranslations } from "next-intl";
import { getRelativeForceBars } from "./gravityVisualization";
import styles from "./GravityExperiment.module.css";

type ForceComparisonProps = {
  currentForce: number;
  initialForce: number;
  idPrefix: string;
};

export const GravityForceComparison = ({ currentForce, initialForce, idPrefix }: ForceComparisonProps) => {
  const t = useTranslations("Gravity");
  const format = useFormatter();
  const bars = getRelativeForceBars(currentForce, initialForce);
  const ratio = format.number(bars.ratio, { maximumSignificantDigits: 4 });

  return (
    <figure className={styles.forceComparison}>
      <h3 id={`${idPrefix}-title`}>{t("forceComparisonTitle")}</h3>
      <svg
        viewBox="0 0 360 110"
        role="img"
        aria-labelledby={`${idPrefix}-title ${idPrefix}-description`}
        aria-describedby={`${idPrefix}-note`}
        className={styles.comparisonSvg}
      >
        <desc id={`${idPrefix}-description`}>{t("forceComparisonDescription", { ratio })}</desc>
        <g aria-hidden="true">
          <text x="0" y="20" fill="#b8b0d6" fontSize="17">{t("forceComparisonInitial")}</text>
          <text x="360" y="20" textAnchor="end" fill="#b8b0d6" fontSize="17">1×</text>
          <rect x="0" y="29" width="360" height="12" rx="3" fill="#ffffff08" />
          <rect data-force-bar="initial" x="0" y="29" width={360 * bars.initialFraction} height="12" rx="3" fill="#a0a7be" />
          <text x="0" y="75" fill="#95efde" fontSize="17">{t("forceComparisonCurrent")}</text>
          <text x="360" y="75" textAnchor="end" fill="#95efde" fontSize="17">{ratio}×</text>
          <rect x="0" y="84" width="360" height="12" rx="3" fill="#ffffff08" />
          <rect data-force-bar="current" x="0" y="84" width={360 * bars.currentFraction} height="12" rx="3" fill="#5ee7d5" />
        </g>
      </svg>
      <figcaption id={`${idPrefix}-note`}>{t("forceComparisonScale")}</figcaption>
    </figure>
  );
};
