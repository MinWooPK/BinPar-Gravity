"use client";

import { ArrowLeft } from "@/components/icons";
import { useTranslations } from "next-intl";
import { threeBodyStages } from "../../../application/journey";
import type { NavigationProps } from "./navigation.types";

type Props = NavigationProps & { activeStage: NonNullable<NavigationProps["activeStage"]> };

// Claves de traducción cortas usadas por los botones tipo tag.
const shortTitles = {
  discover: "stageTags.discover",
  understand: "stageTags.understand",
  gallery: "stageTags.gallery",
  experiment: "stageTags.experiment",
} as const;

// Barra superior visible al entrar en cualquiera de las etapas.
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
      className="relative [z-index:20] grid shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 mb-3 border-b border-slate-700 pb-3 min-[1024px]:[grid-template-columns:auto_minmax(0,_1fr)_auto]"
    >
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
        <span
          aria-hidden="true"
          className="shrink-0 [color:#b9a8ff] [font-family:var(--font-geist-mono),_monospace] [font-size:.9375rem] font-normal [font-variant-numeric:tabular-nums]"
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
