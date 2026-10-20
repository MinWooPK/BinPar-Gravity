"use client";

import { ArrowLeft } from "@/components/icons";

import { useTranslations } from "next-intl";
import { threeBodyStages } from "../../application/journey";
import type { ThreeBodyStageId } from "../../types/journey.types";
import { threeBodyJourneyStyles as styles } from "./ThreeBodyJourney.styles";

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
        className={styles.navigation}
      >
        <p id="three-body-journey-title" className={styles.navigationTitle}>
          {t("navigationTitle")}
        </p>
        <div className={styles.stageList}>
          {threeBodyStages.map((stage) => (
            <button
              key={stage.id}
              id={`three-body-${stage.id}-entry`}
              type="button"
              aria-controls={`three-body-${stage.id}`}
              onClick={() => onSelectStage(stage.id, true)}
              className={styles.entry}
            >
              <span className={styles.number} aria-hidden="true">
                {stage.number}
              </span>
              <span className="min-w-0 flex-1">
                <span className={styles.titleRow}>
                  <strong>{t(stage.title)}</strong>
                </span>
                <span className={styles.entryDescription}>
                  {t(stage.description)}
                </span>
              </span>
            </button>
          ))}
        </div>
        <p className={styles.freedomNote}>{t("freedomNote")}</p>
      </nav>
    );
  }

  const stage = threeBodyStages.find(({ id }) => id === activeStage)!;
  return (
    <nav aria-label={t("navigationTitle")} className={styles.stageNavigation}>
      <button
        type="button"
        onClick={onReturnToJourney}
        aria-label={t("backToWelcome")}
        title={t("backToWelcome")}
        className={styles.backButton}
      >
        <ArrowLeft />
      </button>
      <h2 className={styles.stageHeading}>
        <span aria-hidden="true" className={styles.number}>
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
