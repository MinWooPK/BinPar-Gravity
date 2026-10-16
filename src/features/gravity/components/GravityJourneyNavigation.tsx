import { useTranslations } from "next-intl";
import { gravityStages } from "./gravityJourney";
import styles from "./GravityJourney.module.css";

export const GravityJourneyNavigation = () => {
  const t = useTranslations("Gravity");
  return (
    <nav aria-labelledby="gravity-journey-title" className={styles.navigation}>
      <p id="gravity-journey-title" className={styles.navigationTitle}>{t("learningNavigationTitle")}</p>
      <ol>
        {gravityStages.map((stage) => (
          <li key={stage.id}>
            <a href={`#${stage.id}`}>
              <span aria-hidden="true" className={styles.stageNumber}>{stage.number}</span>
              <span>{t(stage.title)}</span>
            </a>
          </li>
        ))}
      </ol>
      <p className={styles.freedomNote}>{t("learningFreedom")}</p>
    </nav>
  );
};
