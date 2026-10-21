"use client";

import { useTranslations } from "next-intl";

import { gravityStages } from "../../../application/gravityJourney";
import type { GravityStageId } from "../../../types/journey.types";

type GravityJourneyOverviewProps = {
  onSelectStage: (stage: GravityStageId, focusPanel?: boolean) => void;
};

// Muestra las cuatro etapas del recorrido.
export const GravityJourneyOverview = ({
  onSelectStage,
}: GravityJourneyOverviewProps) => {
  const t = useTranslations("Gravity");

  return (
    <nav
      aria-labelledby="gravity-journey-title"
      className="mb-2 shrink-0 lg:mb-0 lg:min-w-0"
    >
      <p
        id="gravity-journey-title"
        className="mb-2.5 text-sm font-semibold tracking-widest text-[#b8b0d6] uppercase max-[600px]:text-xs lg:mb-5 [@media(max-height:500px)]:hidden"
      >
        {t("learningNavigationTitle")}
      </p>

      {/* Tarjetas de las etapas. */}
      <div className="grid grid-cols-2 gap-3 max-[600px]:gap-1.5 lg:grid-cols-1">
        {gravityStages.map((stage) => (
          <button
            key={stage.id}
            id={`${stage.id}-entry`}
            type="button"
            aria-controls={stage.id}
            className="group flex min-h-12 w-full min-w-0 cursor-pointer items-baseline gap-3 rounded-[10px] border 
            border-[#30364b] bg-lab-surface px-4 py-3.5 text-left text-base leading-normal text-[#e4e8f2] 
            wrap-anywhere transition-colors duration-180 hover:border-[#aa97ff80] hover:bg-[#1b2032] focus-visible:outline-3 
            focus-visible:outline-offset-[3px] focus-visible:outline-[#c0b3ff] max-[600px]:flex-col max-[600px]:items-start 
            max-[600px]:gap-1 max-[600px]:px-2 max-[600px]:py-2.5 max-[600px]:text-[13px] [@media(max-height:500px)]:min-h-11 
            [@media(max-height:500px)]:gap-1.5 [@media(max-height:500px)]:p-2 [@media(max-height:500px)]:text-[13px] motion-reduce:transition-none"
            onClick={() => onSelectStage(stage.id, true)}
          >
            {/* Número de etapa. */}
            <span
              aria-hidden="true"
              className="shrink-0 text-[15px] text-[#b9a8ff] tabular-nums [font-family:var(--font-geist-mono),monospace] max-[600px]:text-xs"
            >
              {stage.number}
            </span>

            <span className="w-full min-w-0 flex-1">
              {/* Título e indicador verde. */}
              <span className="lab-gravity-journey-title-row flex w-full min-w-0 items-center gap-3">
                <span className="min-w-0 wrap-anywhere">{t(stage.title)}</span>

                <span
                  aria-hidden="true"
                  className="ml-auto size-2 shrink-0 rounded-full bg-[#33483e]
                   opacity-40 shadow-[0_0_0_0_#4ade8000] transition-[background-color,opacity,box-shadow]
                    duration-250 ease-in group-hover:bg-[#4ade80] group-hover:opacity-100 group-hover:shadow-[0_0_6px_2px_#4ade8059,0_0_14px_3px_#4ade8026] 
                    group-focus-visible:bg-[#4ade80] group-focus-visible:opacity-100 group-focus-visible:shadow-[0_0_6px_2px_#4ade8059,0_0_14px_3px_#4ade8026]
                     motion-reduce:transition-none"
                />
              </span>

              {/* Descripción de la etapa. */}
              <span className="mt-1.5 block text-sm leading-normal text-[#b2bad0]">
                {t(stage.description)}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Información del recorrido. */}
      <p className="mt-2.5 text-[15px] leading-[1.6] text-[#b2bad0] max-[600px]:text-[13px] lg:mt-5 [@media(max-height:500px)]:hidden">
        {t("learningFreedom")}
      </p>
    </nav>
  );
};
