"use client";

import { useTranslations } from "next-intl";
import { gravityStages } from "./gravityJourney";
import type { GravityStageId } from "./gravityJourney";
import styles from "./GravityJourney.module.css";
import { GravityStageHeading } from "./GravityStageHeading";
import { GravityStageSelector } from "./GravityStageSelector";

const compactButton = "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-3 text-sm text-slate-200 transition-colors hover:bg-violet-300/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 motion-reduce:transition-none";

export const GravityJourneyNavigation = ({
  activeStage,
  onSelectStage,
  onReturnToJourney,
  onOpenTutor,
}: {
  activeStage: GravityStageId | null;
  onSelectStage: (stage: GravityStageId, focusPanel?: boolean) => void;
  onReturnToJourney: () => void;
  onOpenTutor: () => void;
}) => {
  const t = useTranslations("Gravity");

  if (activeStage !== null) {
    const activeIndex = gravityStages.findIndex(({ id }) => id === activeStage);
    const stage = gravityStages[activeIndex];

    return (
      <nav aria-label={t("learningNavigationTitle")} className="mb-3 grid shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 border-b border-slate-700 pb-3 lg:grid-cols-[auto_minmax(0,1fr)_minmax(15rem,22rem)]">
        <button type="button" onClick={onReturnToJourney} aria-label={t("backToJourney")} title={t("backToJourney")} className={compactButton}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-6">
            <path d="M19 12H5m7-7-7 7 7 7" />
          </svg>
        </button>
        <GravityStageHeading stage={stage} />
        <div className="col-span-2 flex min-w-0 items-center gap-2 lg:col-span-1">
          <div className="min-w-0 flex-1">
            <GravityStageSelector activeStage={activeStage} onSelectStage={onSelectStage} />
          </div>
          <button
            id="gravity-tutor-trigger"
            type="button"
            aria-label={t("optionalHelp")}
            aria-haspopup="dialog"
            aria-controls="gravity-tutor-dialog"
            onClick={onOpenTutor}
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border border-cyan-300/30 bg-cyan-950/40 px-3 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-900/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-4">
              <path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6 4V6a2 2 0 0 1 2-2Z" strokeLinejoin="round" />
              <path d="M7 9h10M7 13h6" strokeLinecap="round" />
            </svg>
            {t("tutorShortLabel")}
          </button>
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
