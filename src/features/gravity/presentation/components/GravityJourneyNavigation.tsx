"use client";

import { ArrowLeft } from "@/components/icons";

import { useTranslations } from "next-intl";
import {
  gravityStageById,
  gravityStages,
} from "../../application/gravityJourney";
import type { GravityStageId } from "../../types/journey.types";
import { GravityStageHeading } from "./shared/GravityStageHeading";

const shortTitles = {
  "gravity-discovery": "stageTags.discover",
  "gravity-understanding": "stageTags.understand",
  "gravity-laboratory": "stageTags.experiment",
  "gravity-challenges": "stageTags.check",
} as const;

const compactButton =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-3 text-sm text-slate-200 transition-colors hover:bg-violet-300/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 motion-reduce:transition-none";

export const GravityJourneyNavigation = ({
  activeStage,
  onSelectStage,
  onReturnToJourney,
}: {
  activeStage: GravityStageId | null;
  onSelectStage: (stage: GravityStageId, focusPanel?: boolean) => void;
  onReturnToJourney: () => void;
}) => {
  const t = useTranslations("Gravity");

  if (activeStage !== null) {
    const stage = gravityStageById[activeStage];
    const isDiscovery = activeStage === "gravity-discovery";

    return (
      <nav
        aria-label={t("learningNavigationTitle")}
        className={`mb-3 grid shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 border-b border-slate-700 pb-3 ${isDiscovery ? "" : "lg:grid-cols-[auto_minmax(0,1fr)_auto]"}`}
      >
        <button
          type="button"
          onClick={onReturnToJourney}
          aria-label={t("backToJourney")}
          title={t("backToJourney")}
          className={compactButton}
        >
          <ArrowLeft className="size-6" />
        </button>
        <GravityStageHeading stage={stage} visuallyHidden={isDiscovery} />
        <div
          className={`grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4 ${isDiscovery ? "col-span-2 lg:col-span-1 lg:justify-self-end" : "col-span-2 lg:col-span-1"}`}
          data-gravity-stage-tags
        >
          {gravityStages.map((item) => (
            <button
              key={item.id}
              type="button"
              data-stage-tag={item.id}
              aria-current={activeStage === item.id ? "step" : undefined}
              aria-controls={item.id}
              onClick={() => onSelectStage(item.id)}
              className={`min-h-11 min-w-0 rounded-xl border px-3 py-2 text-center text-sm font-semibold transition-colors hover:border-violet-300 hover:bg-violet-300/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 motion-reduce:transition-none ${activeStage === item.id ? "border-violet-300 bg-violet-300/15 text-cyan-100" : "border-slate-600 bg-slate-950/40 text-slate-300"}`}
            >
              <span className="text-violet-300">{item.number}</span> ·{" "}
              {t(shortTitles[item.id])}
            </button>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav aria-labelledby="gravity-journey-title" className="shrink-0 [margin:0_0_.5rem] [@media_(min-width:_64rem)]:[.lab-gravity-journey-workspace[data-introduction=true]_&]:[min-width:0] [@media_(min-width:_64rem)]:[.lab-gravity-journey-workspace[data-introduction=true]_&]:[margin:0]">
      <p id="gravity-journey-title" className="[margin:0_0_10px] [color:#b8b0d6] [font-size:14px] font-semibold [letter-spacing:.1em] uppercase [@media(max-width:600px)]:[font-size:12px] [@media_(min-width:_64rem)]:[.lab-gravity-journey-workspace[data-introduction=true]_&]:[margin-bottom:1.25rem] [@media_(max-height:_500px)]:[&&]:[display:none]">
        {t("learningNavigationTitle")}
      </p>
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
            <span aria-hidden="true" className="shrink-0 [color:#b9a8ff] [font-family:var(--font-geist-mono),_monospace] [font-size:15px] [font-variant-numeric:tabular-nums] [@media(max-width:600px)]:[font-size:12px]">
              {stage.number}
            </span>
            <span className="w-full min-w-0 flex-1">
              <span className="lab-gravity-journey-title-row flex w-full min-w-0 items-center gap-3 [&_>_span]:[min-width:0] [&_>_span]:[overflow-wrap:anywhere] [&::after]:[content:''] [&::after]:[flex:0_0_8px] [&::after]:[height:8px] [&::after]:[margin-left:auto] [&::after]:[border-radius:50%] [&::after]:[background-color:#33483e] [&::after]:[opacity:0.4] [&::after]:[box-shadow:0_0_0_0_#4ade8000] [&::after]:[transition:background-color_250ms_ease,_opacity_250ms_ease,_box-shadow_250ms_ease] [@media_(prefers-reduced-motion:_reduce)]:[&::after]:[transition:none]">
                <span>{t(stage.title)}</span>
              </span>
              <span className="block [margin-top:6px] [color:#b2bad0] [font-size:.875rem] [line-height:1.5]">
                {t(stage.description)}
              </span>
            </span>
          </button>
        ))}
      </div>
      <p className="[margin:10px_0_0] [color:#b2bad0] [font-size:15px] [line-height:1.6] [@media(max-width:600px)]:[font-size:13px] [@media_(min-width:_64rem)]:[.lab-gravity-journey-workspace[data-introduction=true]_&]:[margin-top:1.25rem] [@media_(max-height:_500px)]:[&&]:[display:none]">{t("learningFreedom")}</p>
    </nav>
  );
};
