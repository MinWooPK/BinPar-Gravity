"use client";

import { ArrowLeft } from "@/components/icons";
import { useTranslations } from "next-intl";

import { threeBodyStages } from "../../../application/journey";
import type { NavigationProps } from "./navigation.types";

type Props = NavigationProps & {
  activeStage: NonNullable<NavigationProps["activeStage"]>;
};

// Traducciones de los nombres cortos de las etapas.
const shortTitles = {
  discover: "stageTags.discover",
  understand: "stageTags.understand",
  gallery: "stageTags.gallery",
  experiment: "stageTags.experiment",
} as const;

// Muestra la navegación entre las cuatro etapas.
export const ThreeBodyStageNavigation = ({
  activeStage,
  onSelectStage,
  onReturnToJourney,
}: Props) => {
  const t = useTranslations("ThreeBody.journey");
  const stage = threeBodyStages.find(({ id }) => id === activeStage)!;

  return (
    <nav
      aria-label={t("navigationTitle")}
      className="relative z-20 mb-3 grid shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 border-b border-slate-700 
      pb-3 min-[1024px]:grid-cols-[auto_minmax(0,1fr)_auto]"
    >
      <button
        type="button"
        onClick={onReturnToJourney}
        aria-label={t("backToWelcome")}
        title={t("backToWelcome")}
        className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg bg-transparent p-2 text-slate-200
         hover:bg-[#aa97ff15] focus-visible:outline-[3px] focus-visible:outline-[#c0b3ff] focus-visible:outline-offset-[3px] [&_svg]:size-6"
      >
        <ArrowLeft />
      </button>

      <h2 className="m-0 flex min-w-0 items-baseline gap-4 text-[clamp(1.5rem,2vw,1.75rem)] leading-tight font-semibold tracking-tight text-lab-text wrap-anywhere max-[374px]:gap-2">
        <span
          aria-hidden="true"
          className="shrink-0 font-(family-name:--font-geist-mono) text-[0.9375rem] font-normal text-[#b9a8ff] tabular-nums"
        >
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
            className={`min-h-11 min-w-0 cursor-pointer rounded-xl border px-2 py-2 text-xs font-semibold transition-colors
               hover:border-violet-300 hover:bg-violet-300/10 focus-visible:outline-2 focus-visible:outline-offset-2
                focus-visible:outline-cyan-200 sm:text-sm ${
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
