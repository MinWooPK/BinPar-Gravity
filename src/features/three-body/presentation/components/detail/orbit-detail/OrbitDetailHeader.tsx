import { getTranslations } from "next-intl/server";
import type { OrbitDefinition } from "../../../../types/orbit.types";

const categoryLabels = {
  Clásica: "categoryClassical",
  Coreografía: "categoryChoreography",
  Periódica: "categoryPeriodic",
} as const;

// Muestra la información principal de la órbita.
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
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[#b6bdd0] max-[374px]:gap-x-2">
        <span>
          {t("detail.orbitIndex", {
            number: String(index + 1).padStart(2, "0"),
            total: String(total).padStart(2, "0"),
          })}
        </span>

        <span className="rounded-[5px] border border-[#aa97ff40] bg-[#aa97ff12] px-2 py-0.75 text-[#d0c1ff]">
          {t(categoryLabels[orbit.category])}
        </span>

        <span>{orbit.year}</span>
      </div>

      <div className="my-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2
          id="orbit-solution-title"
          className="m-0 min-w-0 text-[clamp(1.625rem,2.4vw,2rem)] leading-[1.2] font-semibold tracking-[-0.035em]"
        >
          {orbit.name}
        </h2>

        <dl className="period-stat m-0 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <dt className="text-[0.8125rem] text-[#b6bdd0]">
            {t("detail.period")}
          </dt>

          <dd className="m-0 text-[1.375rem] leading-[1.3] font-semibold text-[#b7f3e7] tabular-nums">
            <data value={orbit.period} title={String(orbit.period)}>
              {orbit.period.toFixed(4)}
            </data>{" "}
            <abbr
              title={t("detail.periodUnitLabel")}
              className="text-[0.8125rem] font-normal no-underline"
            >
              {t("detail.periodUnit")}
            </abbr>
          </dd>
        </dl>
      </div>

      <p
        className="m-0 text-[0.9375rem] leading-normal text-[#b6bdd0]"
        lang="es"
      >
        {orbit.description}
      </p>
    </header>
  );
};
