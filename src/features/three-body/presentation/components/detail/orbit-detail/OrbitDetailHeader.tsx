import { getTranslations } from "next-intl/server";
import type { OrbitDefinition } from "../../../../types/orbit.types";

const categoryLabels = {
  Clásica: "categoryClassical",
  Coreografía: "categoryChoreography",
  Periódica: "categoryPeriodic",
} as const;

// Presenta la categoría, nombre, descripción y período de la órbita.
export const OrbitDetailHeader = async ({
  orbit,
  index,
  total,
}: {
  orbit: OrbitDefinition;
  index: number;
  total: number;
}) => {
  const t = await getTranslations("ThreeBody");

  return (
    <header className="min-w-0">
      <div className="flex flex-wrap items-center [gap:6px_12px] [color:#b6bdd0] [font-size:.75rem] [@media(max-width:374px)]:[gap:6px_8px]">
        <span>
          {t("detail.orbitIndex", {
            number: String(index + 1).padStart(2, "0"),
            total: String(total).padStart(2, "0"),
          })}
        </span>
        <span className="[padding:3px_8px] [border:1px_solid_#aa97ff40] [border-radius:5px] [background:#aa97ff12] [color:#d0c1ff]">
          {t(categoryLabels[orbit.category])}
        </span>
        <span>{orbit.year}</span>
      </div>
      <div className="flex flex-wrap justify-between items-center [gap:8px_16px] [margin-block:8px]">
        <h2
          id="orbit-solution-title"
          className="min-w-0 m-0 [font-size:clamp(1.625rem,_2.4vw,_2rem)] font-semibold [line-height:1.2] [letter-spacing:-.035em]"
        >
          {orbit.name}
        </h2>
        <dl className="flex items-baseline flex-wrap [gap:4px_8px] m-0 [&_dt]:[color:#b6bdd0] [&_dt]:[font-size:0.8125rem] [&_dd]:m-0 [&_dd]:[color:#b7f3e7] [&_dd]:[font-size:1.375rem] [&_dd]:font-semibold [&_dd]:tabular-nums [&_dd]:[line-height:1.3] [&_abbr]:[font-size:0.8125rem] [&_abbr]:font-normal [&_abbr]:no-underline period-stat">
          <dt>{t("detail.period")}</dt>
          <dd>
            <data value={orbit.period} title={String(orbit.period)}>
              {orbit.period.toFixed(4)}
            </data>{" "}
            <abbr title={t("detail.periodUnitLabel")}>
              {t("detail.periodUnit")}
            </abbr>
          </dd>
        </dl>
      </div>
      <p
        className="m-0 [color:#b6bdd0] [font-size:.9375rem] [line-height:1.5]"
        lang="es"
      >
        {orbit.description}
      </p>
    </header>
  );
};
