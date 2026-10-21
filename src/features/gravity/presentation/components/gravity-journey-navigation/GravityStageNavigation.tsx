"use client";

import { useTranslations } from "next-intl";

import { ArrowLeft } from "@/components/icons";

import {
  gravityStageById,
  gravityStages,
} from "../../../application/gravityJourney";

import type { GravityStageId } from "../../../types/journey.types";
import { GravityStageHeading } from "../shared/GravityStageHeading";

// Títulos cortos de las etapas.
const shortTitles = {
  "gravity-discovery": "stageTags.discover",
  "gravity-understanding": "stageTags.understand",
  "gravity-laboratory": "stageTags.experiment",
  "gravity-challenges": "stageTags.check",
} as const;

// Estilos del botón de regreso.
const compactButton =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-3 text-sm text-slate-200 transition-colors" +
  "hover:bg-violet-300/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 motion-reduce:transition-none";

type GravityStageNavigationProps = {
  activeStage: GravityStageId;
  onSelectStage: (stage: GravityStageId, focusPanel?: boolean) => void;
  onReturnToJourney: () => void;
};

// Muestra la navegación entre etapas.
export const GravityStageNavigation = ({
  activeStage,
  onSelectStage,
  onReturnToJourney,
}: GravityStageNavigationProps) => {
  const t = useTranslations("Gravity");

  const stage = gravityStageById[activeStage];
  const isDiscovery = activeStage === "gravity-discovery";

  return (
    <nav
      aria-label={t("learningNavigationTitle")}
      className={`mb-3 grid shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 border-b border-slate-700 pb-3 ${
        isDiscovery ? "" : "lg:grid-cols-[auto_minmax(0,1fr)_auto]"
      }`}
    >
      {/* Regresa al recorrido inicial. */}
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

      {/* Permite cambiar entre las cuatro etapas. */}
      <div
        className={`col-span-2 grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4 lg:col-span-1 ${
          isDiscovery ? "lg:justify-self-end" : ""
        }`}
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
            className={`min-h-11 min-w-0 rounded-xl border px-3 py-2 text-center text-sm font-semibold transition-colors
               hover:border-violet-300 hover:bg-violet-300/10 focus-visible:outline-2 focus-visible:outline-offset-2
                focus-visible:outline-cyan-200 motion-reduce:transition-none ${
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
