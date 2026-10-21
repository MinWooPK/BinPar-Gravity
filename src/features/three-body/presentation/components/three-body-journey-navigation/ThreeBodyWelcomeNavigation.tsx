"use client";

import { useTranslations } from "next-intl";
import { threeBodyStages } from "../../../application/journey";
import type { NavigationProps } from "./navigation.types";

type Props = Pick<NavigationProps, "onSelectStage">;

// Tarjetas de acceso a las cuatro etapas desde la pantalla de bienvenida.
// Sus identificadores -entry siguen sirviendo para restaurar el foco.
export const ThreeBodyWelcomeNavigation = ({ onSelectStage }: Props) => {
  const t = useTranslations("ThreeBody.journey");

  return (
    <nav
      aria-labelledby="three-body-journey-title"
      className="min-w-0 [margin-bottom:1rem] min-[1024px]:m-0"
    >
      <p
        id="three-body-journey-title"
        className="[margin:0_0_1.25rem] [color:#b8b0d6] [font-size:.875rem] font-semibold [letter-spacing:.1em] uppercase"
      >
        {t("navigationTitle")}
      </p>

      <div className="grid [grid-template-columns:minmax(0,_1fr)] [gap:12px]">
        {threeBodyStages.map((stage) => (
          <button
            key={stage.id}
            id={`three-body-${stage.id}-entry`}
            type="button"
            aria-controls={`three-body-${stage.id}`}
            onClick={() => onSelectStage(stage.id, true)}
            className="lab-three-body-journey-entry flex items-baseline [gap:12px] w-full min-w-0 [min-height:48px] [padding:14px_16px] [border:1px_solid_#30364b] [border-radius:10px] bg-lab-surface [color:#e4e8f2] [font-size:1rem] [line-height:1.5] text-left cursor-pointer [transition:background_180ms,_border-color_180ms] [@media(max-width:374px)]:[padding-inline:10px] [&:hover]:[border-color:#aa97ff80] [&:hover]:[background:#1b2032] [&_>_span:last-child]:min-w-0 [&_strong]:font-semibold [&:focus-visible]:[outline:3px_solid_#c0b3ff] [&:focus-visible]:[outline-offset:3px] [@media_(prefers-reduced-motion:_reduce)]:[&&]:[transition:none]"
          >
            <span
              className="shrink-0 [color:#b9a8ff] [font-family:var(--font-geist-mono),_monospace] [font-size:.9375rem] font-normal [font-variant-numeric:tabular-nums]"
              aria-hidden="true"
            >
              {stage.number}
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex w-full min-w-0 items-center gap-3 [&_>_strong]:min-w-0 [&_>_strong]:[overflow-wrap:anywhere] [&::after]:[content:''] [&::after]:[flex:0_0_8px] [&::after]:[height:8px] [&::after]:[margin-left:auto] [&::after]:[border-radius:50%] [&::after]:[background-color:#33483e] [&::after]:[opacity:0.4] [&::after]:[box-shadow:0_0_0_0_#4ade8000] [&::after]:[transition:background-color_250ms_ease,_opacity_250ms_ease,_box-shadow_250ms_ease] [.lab-three-body-journey-entry:is(:hover,_:focus-visible)_&::after]:[background-color:#4ade80] [.lab-three-body-journey-entry:is(:hover,_:focus-visible)_&::after]:[opacity:1] [.lab-three-body-journey-entry:is(:hover,_:focus-visible)_&::after]:[box-shadow:0_0_6px_2px_#4ade8059,_0_0_14px_3px_#4ade8026] [@media_(prefers-reduced-motion:_reduce)]:[&::after]:[transition:none]">
                <strong>{t(stage.title)}</strong>
              </span>
              <span className="block [margin-top:6px] [color:#b2bad0] [font-size:.875rem] [line-height:1.5]">
                {t(stage.description)}
              </span>
            </span>
          </button>
        ))}
      </div>

      <p className="[margin:1.25rem_0_0] [color:#b2bad0] [font-size:.9375rem] [line-height:1.6]">
        {t("freedomNote")}
      </p>
    </nav>
  );
};
