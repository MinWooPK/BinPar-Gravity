"use client";

import { useTranslations } from "next-intl";
import { gravityStageById, gravityStages } from "../../application/gravityJourney";
import type { GravityStageId } from "../../types/journey.types";
import { gravityJourneyStyles as styles } from "./GravityJourney.styles";
import { GravityStageHeading } from "./shared/GravityStageHeading";
import { GravityStageSelector } from "./GravityStageSelector";

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
      <nav aria-label={t("learningNavigationTitle")} className={`mb-3 grid shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 border-b border-slate-700 pb-3 ${isDiscovery ? "" : "lg:grid-cols-[auto_minmax(0,1fr)_minmax(15rem,22rem)]"}`}>
        <button type="button" onClick={onReturnToJourney} aria-label={t("backToJourney")} title={t("backToJourney")} className={compactButton}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-6">
            <path d="M19 12H5m7-7-7 7 7 7" />
          </svg>
        </button>
        <GravityStageHeading stage={stage} visuallyHidden={isDiscovery} />
        <div className={isDiscovery ? "ml-auto w-full min-w-0 max-w-[22rem]" : "col-span-2 min-w-0 lg:col-span-1"}>
          <GravityStageSelector activeStage={activeStage} onSelectStage={onSelectStage} />
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
