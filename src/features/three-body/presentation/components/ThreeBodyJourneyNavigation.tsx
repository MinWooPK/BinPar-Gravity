"use client";

import { ArrowLeft } from "@/components/icons";

import { useTranslations } from "next-intl";
import { threeBodyStages } from "../../application/journey";
import type { ThreeBodyStageId } from "../../types/journey.types";

type NavigationProps = {
  activeStage: ThreeBodyStageId | null;
  onSelectStage: (stage: ThreeBodyStageId, focusPanel?: boolean) => void;
  onReturnToJourney: () => void;
};

const shortTitles = {
  discover: "stageTags.discover",
  understand: "stageTags.understand",
  gallery: "stageTags.gallery",
  experiment: "stageTags.experiment",
} as const;

export const ThreeBodyJourneyNavigation = ({
  activeStage,
  onSelectStage,
  onReturnToJourney,
}: NavigationProps) => {
  const t = useTranslations("ThreeBody.journey");
  if (activeStage === null) {
    return (
      <nav
        aria-labelledby="three-body-journey-title"
        className="min-w-0 [margin-bottom:1rem] min-[1024px]:m-0"
      >
        <p id="three-body-journey-title" className="[margin:0_0_1.25rem] [color:#b8b0d6] [font-size:.875rem] font-semibold [letter-spacing:.1em] uppercase">
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
              <span className="shrink-0 [color:#b9a8ff] [font-family:var(--font-geist-mono),_monospace] [font-size:.9375rem] font-normal [font-variant-numeric:tabular-nums]" aria-hidden="true">
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
        <p className="[margin:1.25rem_0_0] [color:#b2bad0] [font-size:.9375rem] [line-height:1.6]">{t("freedomNote")}</p>
      </nav>
    );
  }

  const stage = threeBodyStages.find(({ id }) => id === activeStage)!;
  return (
    <nav aria-label={t("navigationTitle")} className="relative [z-index:20] grid shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 mb-3 border-b border-slate-700 pb-3 min-[1024px]:[grid-template-columns:auto_minmax(0,_1fr)_auto]">
      <button
        type="button"
        onClick={onReturnToJourney}
        aria-label={t("backToWelcome")}
        title={t("backToWelcome")}
        className="inline-flex [min-width:44px] [min-height:44px] items-center justify-center [padding:8px] [border:0] [border-radius:8px] [background:transparent] [color:#e2e8f0] cursor-pointer [&_svg]:[width:24px] [&_svg]:[height:24px] [&:hover]:[background:#aa97ff15] [&:focus-visible]:[outline:3px_solid_#c0b3ff] [&:focus-visible]:[outline-offset:3px]"
      >
        <ArrowLeft />
      </button>
      <h2 className="flex min-w-0 items-baseline [gap:1rem] m-0 text-lab-text [font-size:clamp(1.5rem,_2vw,_1.75rem)] font-semibold [line-height:1.25] [letter-spacing:-.025em] [overflow-wrap:anywhere] [@media(max-width:374px)]:[gap:.5rem]">
        <span aria-hidden="true" className="shrink-0 [color:#b9a8ff] [font-family:var(--font-geist-mono),_monospace] [font-size:.9375rem] font-normal [font-variant-numeric:tabular-nums]">
          {stage.number}
        </span>
        {t(stage.title)}
      </h2>

      <div className="col-span-2 grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4 min-[1024px]:col-span-1">
        {threeBodyStages.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-current={activeStage === item.id ? "step" : undefined}
            aria-controls={`three-body-${item.id}`}
            onClick={() => onSelectStage(item.id)}
            className={`min-h-11 min-w-0 rounded-xl border px-2 py-2 text-xs font-semibold transition-colors hover:border-violet-300 hover:bg-violet-300/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 sm:text-sm ${
              activeStage === item.id
                ? "border-violet-300 bg-violet-300/15 text-cyan-100"
                : "border-slate-600 bg-slate-950/40 text-slate-300"
            }`}
          >
            <span className="text-violet-300">{item.number}</span>
            {" · "}
            {t(shortTitles[item.id])}
          </button>
        ))}
      </div>
    </nav>
  );
};
