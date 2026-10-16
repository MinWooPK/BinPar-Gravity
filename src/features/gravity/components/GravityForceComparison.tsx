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
        <figcaption>
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
        <desc id={`${idPrefix}-description`}>
          {t("forceComparisonDescription", { ratio })}
        </desc>
        <g aria-hidden="true">
          <text x="0" y="20" fill="#b8b0d6" fontSize="17">
            {t("forceComparisonInitial")}
          </text>
          <text x="360" y="20" textAnchor="end" fill="#b8b0d6" fontSize="17">
            1×
          </text>
          <rect x="0" y="29" width="360" height="12" rx="3" fill="#ffffff08" />
          <rect
            data-force-bar="initial"
            x="0"
            y="29"
            width={360 * bars.initialFraction}
            height="12"
            rx="3"
            fill="#a0a7be"
          />
          <text x="0" y="75" fill="#95efde" fontSize="17">
            {t("forceComparisonCurrent")}
          </text>
          <text x="360" y="75" textAnchor="end" fill="#95efde" fontSize="17">
            {ratio}×
          </text>
          <rect x="0" y="84" width="360" height="12" rx="3" fill="#ffffff08" />
          <rect
            data-force-bar="current"
            x="0"
            y="84"
            width={360 * bars.currentFraction}
            height="12"
            rx="3"
            fill="#5ee7d5"
          />
        </g>
      </svg>
      <figcaption id={`${idPrefix}-note`}>
        {t("forceComparisonScale")}
      </figcaption>
    </figure>
  );
};
