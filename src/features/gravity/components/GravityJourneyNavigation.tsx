"use client";

import { useRef } from "react";
import type { KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { gravityStages } from "./gravityJourney";
import type { GravityStageId } from "./gravityJourney";
import styles from "./GravityJourney.module.css";

export const GravityJourneyNavigation = ({
  activeStage,
  onSelectStage,
}: {
  activeStage: GravityStageId | null;
  onSelectStage: (stage: GravityStageId) => void;
}) => {
  const t = useTranslations("Gravity");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number;
    switch (event.key) {
      case "ArrowRight": nextIndex = (index + 1) % gravityStages.length; break;
      case "ArrowLeft": nextIndex = (index - 1 + gravityStages.length) % gravityStages.length; break;
      case "Home": nextIndex = 0; break;
      case "End": nextIndex = gravityStages.length - 1; break;
      default: return;
    }
    event.preventDefault();
    onSelectStage(gravityStages[nextIndex].id);
    tabs.current[nextIndex]?.focus({ preventScroll: true });
  };
  return (
    <nav aria-labelledby="gravity-journey-title" className={styles.navigation}>
      <p id="gravity-journey-title" className={styles.navigationTitle}>{t("learningNavigationTitle")}</p>
      <div role="tablist" aria-labelledby="gravity-journey-title" aria-orientation="horizontal" className={styles.tabList}>
        {gravityStages.map((stage, index) => (
          <button
            key={stage.id}
            ref={(element) => { tabs.current[index] = element; }}
            id={`${stage.id}-tab`}
            type="button"
            role="tab"
            aria-selected={activeStage === stage.id}
            aria-controls={stage.id}
            tabIndex={activeStage === stage.id || (activeStage === null && index === 0) ? 0 : -1}
            className={styles.tab}
            onClick={() => onSelectStage(stage.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
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
