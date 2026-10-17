import { useTranslations } from "next-intl";
import type { GravityStage } from "./gravityJourney";
import styles from "./GravityJourney.module.css";

export const GravityStageHeading = ({ stage, visuallyHidden = false }: { stage: GravityStage; visuallyHidden?: boolean }) => {
  const t = useTranslations("Gravity");
  return (
    <div className={visuallyHidden ? "sr-only" : styles.stageHeader}>
      <span aria-hidden="true" className={styles.stageNumber}>{stage.number}</span>
      <h2 id={`${stage.id}-heading`}>{t(stage.title)}</h2>
    </div>
  );
};
