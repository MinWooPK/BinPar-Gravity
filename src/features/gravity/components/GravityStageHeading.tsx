import { useTranslations } from "next-intl";
import { gravityStages } from "./gravityJourney";
import styles from "./GravityJourney.module.css";

export const GravityStageHeading = ({ stage }: { stage: typeof gravityStages[number] }) => {
  const t = useTranslations("Gravity");
  return (
    <div className={styles.stageHeader}>
      <span aria-hidden="true" className={styles.stageNumber}>{stage.number}</span>
      <h2 id={`${stage.id}-heading`}>{t(stage.title)}</h2>
    </div>
  );
};
