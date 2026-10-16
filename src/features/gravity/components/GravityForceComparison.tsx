import { useFormatter, useTranslations } from "next-intl";
import { getRelativeForceBars } from "./gravityVisualization";
import styles from "./GravityExperiment.module.css";

type ForceComparisonProps = {
  currentForce: number;
  initialForce: number;
  idPrefix: string;
  variant?: "laboratory" | "challenge";
  scaleForce?: number;
};

export const GravityForceComparison = ({
  currentForce,
  initialForce,
  idPrefix,
  variant = "laboratory",
  scaleForce,
}: ForceComparisonProps) => {
  const t = useTranslations("Gravity");
  const format = useFormatter();
  const bars = getRelativeForceBars(currentForce, initialForce, scaleForce);
  const ratio = format.number(bars.ratio, { maximumSignificantDigits: 4 });

  if (variant === "challenge") {
    const percentage = (value: number) =>
      format.number(value, { style: "percent", maximumFractionDigits: 2 });
    const rows = [
      {
        key: "initial",
        label: t("challengeBefore"),
        fraction: bars.initialFraction,
        force: initialForce,
        ratio: 1,
        color: "#a0a7be",
      },
      {
        key: "current",
        label: t("challengeAfter"),
        fraction: bars.currentFraction,
        force: currentForce,
        ratio: bars.ratio,
        color: "#5ee7d5",
      },
    ];
    return (
      <figure
        className={styles.challengeComparison}
        aria-labelledby={`${idPrefix}-title`}
        aria-describedby={`${idPrefix}-note`}
      >
        <h4 id={`${idPrefix}-title`}>{t("challengeComparisonTitle")}</h4>
        {rows.map((row) => (
          <div key={row.key} className={styles.comparisonRow}>
            <div className={styles.comparisonLabel}>
              <span>{row.label}</span>
              <strong>{percentage(row.ratio)}</strong>
            </div>
            <svg
              viewBox="0 0 360 12"
              preserveAspectRatio="none"
              aria-hidden="true"
              className={styles.challengeBar}
            >
              <rect width="360" height="12" rx="3" fill="#ffffff0c" />
              <rect
                data-force-bar={row.key}
                width={360 * row.fraction}
                height="12"
                rx="3"
                fill={row.color}
              />
            </svg>
            <p className={styles.comparisonForce}>
              {format.number(row.force, {
                notation: "scientific",
                maximumSignificantDigits: 4,
              })}{" "}
              N
            </p>
          </div>
        ))}
        <figcaption id={`${idPrefix}-note`}>
          {t("challengeComparisonScale", {
            percentage: percentage(
              (scaleForce ?? Math.max(currentForce, initialForce)) /
                initialForce,
            ),
          })}
        </figcaption>
      </figure>
    );
  }

  const rows = [
    { key: "initial", label: t("forceComparisonInitial"), fraction: bars.initialFraction, value: "1×", color: "#a0a7be" },
    { key: "current", label: t("forceComparisonCurrent"), fraction: bars.currentFraction, value: `${ratio}×`, color: "#5ee7d5" },
  ];
  return (
    <figure
      className={styles.forceComparison}
      aria-labelledby={`${idPrefix}-title`}
      aria-describedby={`${idPrefix}-description ${idPrefix}-note`}
    >
      <h4 id={`${idPrefix}-title`}>{t("forceComparisonTitle")}</h4>
      <p id={`${idPrefix}-description`} className="sr-only">
        {t("forceComparisonDescription", { ratio })}
      </p>
      <div className={styles.labComparisonRows}>
        {rows.map((row) => (
          <div key={row.key} className={styles.comparisonRow}>
            <div className={styles.comparisonLabel}>
              <span>{row.label}</span><strong>{row.value}</strong>
            </div>
            <svg viewBox="0 0 360 12" preserveAspectRatio="none" aria-hidden="true" className={styles.challengeBar}>
              <rect width="360" height="12" rx="3" fill="#ffffff08" />
              <rect data-force-bar={row.key} width={360 * row.fraction} height="12" rx="3" fill={row.color} />
            </svg>
          </div>
        ))}
      </div>
      <figcaption id={`${idPrefix}-note`}>
        {t("forceComparisonScale")}
      </figcaption>
    </figure>
  );
};
