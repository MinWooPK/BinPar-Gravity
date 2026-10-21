"use client";

import { useFormatter, useTranslations } from "next-intl";
import type { GravityParameters } from "@/features/gravity/types/gravity.types";
import type { FormulaTerm } from "@/features/gravity/types/formula.types";

type GravitySimulationValuesProps = {
  parameters: GravityParameters;
  active: FormulaTerm | null;
};

// Muestra masas y distancia con los mismos valores que el laboratorio.
export const GravitySimulationValues = ({
  parameters,
  active,
}: GravitySimulationValuesProps) => {
  const t = useTranslations("Gravity");
  const format = useFormatter();

  const firstActive = active === "mass1" || active === "masses";
  const secondActive = active === "mass2" || active === "masses";

  return (
    <dl className="grid [grid-template-columns:repeat(3,_minmax(0,_1fr))] [gap:12px] m-0 [padding:12px_18px_16px] border-t border-solid border-lab-line [@media(max-width:600px)]:[padding-inline:14px] [@media(max-width:600px)]:[grid-template-columns:minmax(0,_1fr)] [@media(max-width:600px)]:[gap:8px] [&_>_div]:[min-width:0] [&_dt]:[margin:0_0_4px] [&_dt]:[color:#a7aec3] [&_dt]:[font-size:1rem] [&_dt]:[line-height:1.4] [&_dd]:[margin:0] [&_dd]:[color:#e4e8f2] [&_dd]:[font-size:1rem] [&_dd]:[line-height:1.5] [&_dd]:[font-variant-numeric:tabular-nums] [&_dd]:[overflow-wrap:anywhere] [&_>_div:first-child_dd]:[color:#c7b7ff] [&_>_div:nth-child(2)_dd]:[color:#95efde] [@media_(max-width:_600px)]:[&_>_div]:[display:flex] [@media_(max-width:_600px)]:[&_>_div]:[justify-content:space-between] [@media_(max-width:_600px)]:[&_>_div]:[gap:12px] [@media_(max-width:_600px)]:[&_dt]:[min-width:0] [@media_(max-width:_600px)]:[&_dt]:[margin:0] [@media_(max-width:_600px)]:[&_dd]:[flex-shrink:0] [@media_(max-width:_600px)]:[&_dd]:[text-align:right] [.lab-gravity-simulation-compact_&]:[padding-inline:14px] [.lab-gravity-simulation-compact_&]:[gap:8px] [.lab-gravity-simulation-compact_&]:[padding-block:10px] [.lab-gravity-simulation-compact_&_dt]:[font-size:0.875rem] [.lab-gravity-simulation-compact_&_dd]:[font-size:0.875rem] [@media_(max-width:_600px)]:[.lab-gravity-simulation-compact_&]:[gap:4px] [@media_(max-width:_600px)]:[.lab-gravity-simulation-compact_&_>_div]:[padding:0] [&_>_div]:[padding:4px] [&_>_div]:[border:1px_solid_transparent] [&_>_div]:[border-radius:7px] [&_>_div]:[transition:background_140ms,_border-color_140ms] [&_>_div[data-active=true]]:[border-color:#aa97ff70] [&_>_div[data-active=true]]:[background:#aa97ff12] [&_>_div:nth-child(2)[data-active=true]]:[border-color:#5ee7d570] [&_>_div:nth-child(2)[data-active=true]]:[background:#5ee7d510] [@media_(prefers-reduced-motion:_reduce)]:[&_>_div]:[transition:none]">
      <div data-active={firstActive}>
        <dt>{t("firstMass")}</dt>
        <dd>{format.number(parameters.mass1)} kg</dd>
      </div>

      <div data-active={secondActive}>
        <dt>{t("secondMass")}</dt>
        <dd>{format.number(parameters.mass2)} kg</dd>
      </div>

      <div data-active={active === "distance"}>
        <dt>{t("centreDistance")}</dt>
        <dd>{format.number(parameters.distance)} m</dd>
      </div>
    </dl>
  );
};
