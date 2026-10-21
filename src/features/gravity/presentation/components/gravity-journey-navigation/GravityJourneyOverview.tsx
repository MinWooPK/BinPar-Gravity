"use client";

import { useTranslations } from "next-intl";

import { gravityStages } from "../../../application/gravityJourney";

import type { GravityStageId } from "../../../types/journey.types";

type GravityJourneyOverviewProps = {
  onSelectStage: (stage: GravityStageId, focusPanel?: boolean) => void;
};

// Muestra las cuatro tarjetas del recorrido de aprendizaje.
export const GravityJourneyOverview = ({
  onSelectStage,
}: GravityJourneyOverviewProps) => {
  const t = useTranslations("Gravity");

  return (
    <nav
      aria-labelledby="gravity-journey-title"
      className="shrink-0 [margin:0_0_.5rem] [@media_(min-width:_64rem)]:[.lab-gravity-journey-workspace[data-introduction=true]_&]:[min-width:0] [@media_(min-width:_64rem)]:[.lab-gravity-journey-workspace[data-introduction=true]_&]:[margin:0]"
    >
      {/* Título del recorrido educativo. */}
      <p
        id="gravity-journey-title"
        className="[margin:0_0_10px] [color:#b8b0d6] [font-size:14px] font-semibold [letter-spacing:.1em] uppercase [@media(max-width:600px)]:[font-size:12px] [@media_(min-width:_64rem)]:[.lab-gravity-journey-workspace[data-introduction=true]_&]:[margin-bottom:1.25rem] [@media_(max-height:_500px)]:[&&]:[display:none]"
      >
        {t("learningNavigationTitle")}
      </p>

      {/* Tarjetas para seleccionar la etapa educativa. */}
      <div className="grid [grid-template-columns:repeat(2,_minmax(0,_1fr))] [gap:12px] [@media(max-width:600px)]:[gap:6px] [@media_(min-width:_64rem)]:[.lab-gravity-journey-workspace[data-introduction=true]_&]:[grid-template-columns:minmax(0,_1fr)]">
        {gravityStages.map((stage) => (
          <button
            key={stage.id}
            id={`${stage.id}-entry`}
            type="button"
            aria-controls={stage.id}
            className="flex items-baseline [gap:12px] w-full min-w-0 [min-height:48px] [padding:14px_16px] [border:1px_solid_#30364b] [border-radius:10px] bg-lab-surface [color:#e4e8f2] [font-size:16px] [line-height:1.5] text-left [overflow-wrap:anywhere] cursor-pointer [transition:background_180ms,_border-color_180ms,_color_180ms] [@media(max-width:600px)]:flex-col [@media(max-width:600px)]:[align-items:flex-start] [@media(max-width:600px)]:[gap:4px] [@media(max-width:600px)]:[padding:10px_8px] [@media(max-width:600px)]:[font-size:13px] [&:hover]:[border-color:#aa97ff80] [&:hover]:[background:#1b2032] [&:is(:hover,_:focus-visible)_.lab-gravity-journey-title-row::after]:[background-color:#4ade80] [&:is(:hover,_:focus-visible)_.lab-gravity-journey-title-row::after]:[opacity:1] [&:is(:hover,_:focus-visible)_.lab-gravity-journey-title-row::after]:[box-shadow:0_0_6px_2px_#4ade8059,_0_0_14px_3px_#4ade8026] [&:focus-visible]:[outline:3px_solid_#c0b3ff] [&:focus-visible]:[outline-offset:3px] [@media_(max-height:_500px)]:[&&]:[min-height:44px] [@media_(max-height:_500px)]:[&&]:[padding:8px] [@media_(max-height:_500px)]:[&&]:[gap:6px] [@media_(max-height:_500px)]:[&&]:[font-size:13px] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none]"
            onClick={() => onSelectStage(stage.id, true)}
          >
            {/* Número de la etapa. */}
            <span
              aria-hidden="true"
              className="shrink-0 [color:#b9a8ff] [font-family:var(--font-geist-mono),_monospace] [font-size:15px] [font-variant-numeric:tabular-nums] [@media(max-width:600px)]:[font-size:12px]"
            >
              {stage.number}
            </span>

            <span className="w-full min-w-0 flex-1">
              {/* Nombre de la etapa e indicador verde animado. */}
              <span className="lab-gravity-journey-title-row flex w-full min-w-0 items-center gap-3 [&_>_span]:[min-width:0] [&_>_span]:[overflow-wrap:anywhere] [&::after]:[content:''] [&::after]:[flex:0_0_8px] [&::after]:[height:8px] [&::after]:[margin-left:auto] [&::after]:[border-radius:50%] [&::after]:[background-color:#33483e] [&::after]:[opacity:0.4] [&::after]:[box-shadow:0_0_0_0_#4ade8000] [&::after]:[transition:background-color_250ms_ease,_opacity_250ms_ease,_box-shadow_250ms_ease] [@media_(prefers-reduced-motion:_reduce)]:[&::after]:[transition:none]">
                <span>{t(stage.title)}</span>
              </span>

              {/* Breve descripción de la etapa. */}
              <span className="block [margin-top:6px] [color:#b2bad0] [font-size:.875rem] [line-height:1.5]">
                {t(stage.description)}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Información sobre la libertad de navegación. */}
      <p className="[margin:10px_0_0] [color:#b2bad0] [font-size:15px] [line-height:1.6] [@media(max-width:600px)]:[font-size:13px] [@media_(min-width:_64rem)]:[.lab-gravity-journey-workspace[data-introduction=true]_&]:[margin-top:1.25rem] [@media_(max-height:_500px)]:[&&]:[display:none]">
        {t("learningFreedom")}
      </p>
    </nav>
  );
};
