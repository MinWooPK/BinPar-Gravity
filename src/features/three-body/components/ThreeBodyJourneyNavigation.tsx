"use client";

import { useTranslations } from "next-intl";
import { StageSelector } from "@/components/ui/StageSelector";
import { threeBodyStages } from "./threeBodyStages";
import type { ThreeBodyStageId } from "./threeBodyStages";
import styles from "./ThreeBodyJourney.module.css";

type NavigationProps = {
  activeStage: ThreeBodyStageId | null;
  onSelectStage: (stage: ThreeBodyStageId, focusPanel?: boolean) => void;
  onReturnToJourney: () => void;
};

export const ThreeBodyJourneyNavigation = ({ activeStage, onSelectStage, onReturnToJourney }: NavigationProps) => {
  const t = useTranslations("ThreeBody.journey");
  if (activeStage === null) {
    return (
      <nav aria-labelledby="three-body-journey-title" className={styles.navigation}>
        <p id="three-body-journey-title" className={styles.navigationTitle}>{t("navigationTitle")}</p>
        <div className={styles.stageList}>
          {threeBodyStages.map((stage) => (
            <button key={stage.id} id={`three-body-${stage.id}-entry`} type="button" aria-controls={`three-body-${stage.id}`} onClick={() => onSelectStage(stage.id, true)} className={styles.entry}>
              <span className={styles.number} aria-hidden="true">{stage.number}</span>
              <span><strong>{t(stage.title)}</strong><span className={styles.entryDescription}>{t(stage.description)}</span></span>
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
      <button type="button" onClick={onReturnToJourney} aria-label={t("backToWelcome")} title={t("backToWelcome")} className={styles.backButton}>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m7-7-7 7 7 7" /></svg>
      </button>
      <h2 className={styles.stageHeading}><span aria-hidden="true" className={styles.number}>{stage.number}</span>{t(stage.title)}</h2>
      <div className={styles.selector}>
        <StageSelector id="three-body-stage-selector" label={t("chooseStage")} value={activeStage} options={threeBodyStages.map((item) => ({ ...item, label: t(item.title) }))} onChange={onSelectStage} />
      </div>
    </nav>
  );
};
