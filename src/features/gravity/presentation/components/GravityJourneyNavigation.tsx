"use client";

import { useTranslations } from "next-intl";
import { gravityStageById, gravityStages } from "../../application/gravityJourney";
import type { GravityStageId } from "../../types/journey.types";
import { gravityJourneyStyles as styles } from "./GravityJourney.styles";
import { GravityStageHeading } from "./shared/GravityStageHeading";

const shortTitles = {
  "gravity-discovery": "stageTags.discover",
  "gravity-understanding": "stageTags.understand",
  "gravity-laboratory": "stageTags.experiment",
  "gravity-challenges": "stageTags.check",
} as const;

const compactButton = "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-3 text-sm text-slate-200 transition-colors hover:bg-violet-300/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 motion-reduce:transition-none";

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
      <nav aria-label={t("learningNavigationTitle")} className={`mb-3 grid shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 border-b border-slate-700 pb-3 ${isDiscovery ? "" : "lg:grid-cols-[auto_minmax(0,1fr)_auto]"}`}>
        <button type="button" onClick={onReturnToJourney} aria-label={t("backToJourney")} title={t("backToJourney")} className={compactButton}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-6">
            <path d="M19 12H5m7-7-7 7 7 7" />
          </svg>
        </button>
        <GravityStageHeading stage={stage} visuallyHidden={isDiscovery} />
        <div className={`grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4 ${isDiscovery ? "col-span-2 lg:col-span-1 lg:justify-self-end" : "col-span-2 lg:col-span-1"}`} data-gravity-stage-tags>
          {gravityStages.map(item => (
            <button key={item.id} type="button" data-stage-tag={item.id}
              aria-current={activeStage === item.id ? "step" : undefined}
              aria-controls={item.id}
              onClick={() => onSelectStage(item.id)}
              className={`min-h-11 min-w-0 rounded-xl border px-3 py-2 text-center text-sm font-semibold transition-colors hover:border-violet-300 hover:bg-violet-300/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 motion-reduce:transition-none ${activeStage === item.id ? "border-violet-300 bg-violet-300/15 text-cyan-100" : "border-slate-600 bg-slate-950/40 text-slate-300"}`}>
              <span className="text-violet-300">{item.number}</span> · {t(shortTitles[item.id])}
            </button>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav aria-labelledby="gravity-journey-title" className={styles.navigation}>
      <p id="gravity-journey-title" className={styles.navigationTitle}>{t("learningNavigationTitle")}</p>
      <div className={styles.tabList}>
        {gravityStages.map((stage) => (
          <button
            key={stage.id}
            id={`${stage.id}-entry`}
            type="button"
            aria-controls={stage.id}
            className={styles.tab}
            onClick={() => onSelectStage(stage.id, true)}
          >
            <span aria-hidden="true" className={styles.stageNumber}>{stage.number}</span>
            <span>{t(stage.title)}</span>
          </button>
        ))}
      </div>
      <p className={styles.freedomNote}>{t("learningFreedom")}</p>
    </nav>
  );
};
