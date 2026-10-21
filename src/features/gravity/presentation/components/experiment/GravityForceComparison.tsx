import { useFormatter, useTranslations } from "next-intl";
import { getRelativeForceBars } from "../../gravityVisualization";

type ForceComparisonProps = {
  currentForce: number;
  initialForce: number;
  idPrefix: string;
  variant?: "laboratory" | "challenge";
  scaleForce?: number;
};

// Compara la fuerza inicial y actual con barras.
export const GravityForceComparison = ({
  currentForce,
  initialForce,
  idPrefix,
  variant = "laboratory",
  scaleForce,
}: ForceComparisonProps) => {
  const t = useTranslations("Gravity");
  const format = useFormatter();

  // Calcula el tamaño de las barras.
  const bars = getRelativeForceBars(currentForce, initialForce, scaleForce);

  const ratio = format.number(bars.ratio, {
    maximumSignificantDigits: 4,
  });

  // Comparación para los desafíos.
  if (variant === "challenge") {
    const percentage = (value: number) =>
      format.number(value, {
        style: "percent",
        maximumFractionDigits: 2,
      });

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
        className="min-w-0 text-[#e2e8f0]"
        aria-labelledby={`${idPrefix}-title`}
        aria-describedby={`${idPrefix}-note`}
      >
        <h4
          id={`${idPrefix}-title`}
          className="mb-4.5 text-lg leading-normal font-semibold"
        >
          {t("challengeComparisonTitle")}
        </h4>

        {/* Barras de fuerza de los desafíos. */}
        {rows.map((row) => (
          <div key={row.key} className="mt-4 min-w-0">
            <div className="flex flex-wrap justify-between gap-x-3 gap-y-1.5 text-base leading-normal">
              <span>{row.label}</span>

              <strong className="text-[#95efde] tabular-nums">
                {percentage(row.ratio)}
              </strong>
            </div>

            <svg
              viewBox="0 0 360 12"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="mt-1 block h-3 w-full"
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

            <p className="mt-1.5 text-sm leading-normal text-[#b6bdd0] tabular-nums wrap-anywhere">
              {format.number(row.force, {
                notation: "scientific",
                maximumSignificantDigits: 4,
              })}{" "}
              N
            </p>
          </div>
        ))}

        <figcaption
          id={`${idPrefix}-note`}
          className="mt-4.5 max-w-[70ch] text-sm leading-[1.6] text-[#b6bdd0] wrap-anywhere"
        >
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

  // Comparación para el laboratorio.
  const rows = [
    {
      key: "initial",
      label: t("forceComparisonInitial"),
      fraction: bars.initialFraction,
      value: "1×",
      color: "#a0a7be",
    },
    {
      key: "current",
      label: t("forceComparisonCurrent"),
      fraction: bars.currentFraction,
      value: `${ratio}×`,
      color: "#5ee7d5",
    },
  ];

  return (
    <figure
      className="min-w-0 border-t border-[#ffffff10] px-3.5 py-1.5"
      aria-labelledby={`${idPrefix}-title`}
      aria-describedby={`${idPrefix}-description ${idPrefix}-note`}
    >
      <h4
        id={`${idPrefix}-title`}
        className="mb-1 text-[15px] leading-normal font-medium text-[#d0d4e3]"
      >
        {t("forceComparisonTitle")}
      </h4>

      <p id={`${idPrefix}-description`} className="sr-only">
        {t("forceComparisonDescription", { ratio })}
      </p>

      {/* Barras de fuerza del laboratorio. */}
      <div className="grid grid-cols-2 gap-3 max-[600px]:grid-cols-1 max-[600px]:gap-2.5">
        {rows.map((row) => (
          <div key={row.key} className="min-w-0">
            <div className="flex flex-wrap justify-between gap-x-3 gap-y-1.5 text-base leading-normal">
              <span>{row.label}</span>

              <strong className="text-[#95efde] tabular-nums">
                {row.value}
              </strong>
            </div>

            <svg
              viewBox="0 0 360 12"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="mt-1 block h-3 w-full"
            >
              <rect width="360" height="12" rx="3" fill="#ffffff08" />

              <rect
                data-force-bar={row.key}
                width={360 * row.fraction}
                height="12"
                rx="3"
                fill={row.color}
              />
            </svg>
          </div>
        ))}
      </div>

      <figcaption
        id={`${idPrefix}-note`}
        className="mt-1 max-w-[52ch] text-sm leading-[1.4] text-[#a0a7be]"
      >
        {t("forceComparisonScaleShort")}
      </figcaption>
    </figure>
  );
};
