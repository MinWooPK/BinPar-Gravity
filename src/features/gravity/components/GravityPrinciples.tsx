import { useTranslations } from "next-intl";
import { GravityStageLink } from "./GravityJourneyTabs";
import styles from "./GravityPrinciples.module.css";

export const GravityPrinciples = () => {
  const t = useTranslations("Gravity");
  return (
    <section aria-labelledby="gravity-principles-title" className={styles.section}>
      <h3 id="gravity-principles-title" className={styles.heading}>
        {t("principlesTitle")}
      </h3>
      <div className={styles.principles}>
        {(["mass", "distance", "mutual"] as const).map((key) => (
          <article key={key} aria-labelledby={`gravity-principle-${key}`} className={styles.principle}>
            <span aria-hidden="true" className={styles.marker} data-tone={key} />
            <h4 id={`gravity-principle-${key}`}>{t(`principle_${key}_title`)}</h4>
            <p>{t(`principle_${key}_description`)}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export const GravityPrinciplesChallenge = () => {
  const t = useTranslations("Gravity");
  return (
    <GravityStageLink
      stageId="gravity-laboratory"
      className={styles.compactLink}
      title={t("tryChallengeTitle")}
    >
      {t("learningExperiment")} <span aria-hidden="true">→</span>
    </GravityStageLink>
  );
};
