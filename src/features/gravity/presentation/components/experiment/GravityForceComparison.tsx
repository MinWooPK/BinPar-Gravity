import { useFormatter, useTranslations } from "next-intl";
import { getRelativeForceBars } from "../../gravityVisualization";

// Define los valores y opciones necesarios para comparar dos fuerzas gravitatorias.
type ForceComparisonProps = {
  currentForce: number;
  initialForce: number;
  idPrefix: string;
  variant?: "laboratory" | "challenge";
  scaleForce?: number;
};

// Muestra una comparación visual entre la fuerza gravitatoria
// inicial y la actual mediante barras proporcionales.
export const GravityForceComparison = ({
  currentForce,
  initialForce,
  idPrefix,
  variant = "laboratory",
  scaleForce,
}: ForceComparisonProps) => {
  // Obtiene las traducciones de la sección de gravedad.
  const t = useTranslations("Gravity");

  // Permite formatear números y porcentajes según el idioma.
  const format = useFormatter();

  // Calcula las proporciones de las barras y la relación entre ambas fuerzas.
  const bars = getRelativeForceBars(currentForce, initialForce, scaleForce);

  // Formatea la relación entre la fuerza actual y la inicial.
  const ratio = format.number(bars.ratio, { maximumSignificantDigits: 4 });

  if (variant === "challenge") {
    // Convierte un valor numérico en un porcentaje formateado.
    const percentage = (value: number) =>
      format.number(value, { style: "percent", maximumFractionDigits: 2 });

    // Define los datos de las barras comparativas para los desafíos.
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
        className="min-w-0 m-0 [color:#e2e8f0]"
        aria-labelledby={`${idPrefix}-title`}
        aria-describedby={`${idPrefix}-note`}
      >
        <h4 id={`${idPrefix}-title`} className="[margin:0_0_18px] [font-size:18px] font-semibold leading-normal">{t("challengeComparisonTitle")}</h4>

        {rows.map((row) => (
          <div key={row.key} className="min-w-0 mt-4">
            <div className="flex justify-between flex-wrap [gap:6px_12px] [font-size:16px] [line-height:1.5]">
              <span>{row.label}</span>
              <strong className="text-[#95efde] tabular-nums">{percentage(row.ratio)}</strong>
            </div>

            <svg
              viewBox="0 0 360 12"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="block w-full [height:12px] [margin-top:4px]"
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

            <p className="[margin:6px_0_0] [color:#b6bdd0] [font-size:14px] [line-height:1.5] [font-variant-numeric:tabular-nums] [overflow-wrap:anywhere]">
              {format.number(row.force, {
                notation: "scientific",
                maximumSignificantDigits: 4,
              })}{" "}
              N
            </p>
          </div>
        ))}

        <figcaption id={`${idPrefix}-note`} className="max-w-[70ch] mt-[18px] text-[#b6bdd0] text-[14px] leading-[1.6] [overflow-wrap:anywhere]">
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

  // Define los datos de las barras comparativas del laboratorio.
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
      className="min-w-0 m-0 [padding:6px_14px] [border-top:1px_solid_#ffffff10] [@media(max-width:600px)]:[padding-inline:14px]"
      aria-labelledby={`${idPrefix}-title`}
      aria-describedby={`${idPrefix}-description ${idPrefix}-note`}
    >
      <h4 id={`${idPrefix}-title`} className="[margin:0_0_4px] text-[#d0d4e3] [font-size:15px] font-medium leading-normal">{t("forceComparisonTitle")}</h4>

      <p id={`${idPrefix}-description`} className="sr-only">
        {t("forceComparisonDescription", { ratio })}
      </p>

      <div className="grid [grid-template-columns:repeat(2,_minmax(0,_1fr))] [gap:12px] [@media(max-width:600px)]:[grid-template-columns:minmax(0,_1fr)] [@media(max-width:600px)]:[gap:10px]">
        {rows.map((row) => (
          <div key={row.key} className="min-w-0 mt-0">
            <div className="flex justify-between flex-wrap [gap:6px_12px] [font-size:16px] [line-height:1.5]">
              <span>{row.label}</span>
              <strong className="text-[#95efde] tabular-nums">{row.value}</strong>
            </div>

            <svg
              viewBox="0 0 360 12"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="block w-full [height:12px] [margin-top:4px]"
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

      <figcaption id={`${idPrefix}-note`} className="max-w-[52ch] mt-1 text-[#a0a7be] text-[14px] leading-[1.4]">
        {t("forceComparisonScaleShort")}
      </figcaption>
    </figure>
  );
};
