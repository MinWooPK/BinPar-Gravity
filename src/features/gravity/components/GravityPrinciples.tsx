import { useTranslations } from "next-intl";
import { gravityStages } from "./gravityJourney";
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
    <div className={styles.challenge}>
        <span aria-hidden="true" className={styles.question}>
          ?
        </span>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{t("tryChallengeLabel")}</p>
          <h4>{t("tryChallengeTitle")}</h4>
          <p>{t("tryChallengeDescription")}</p>
        </div>
        <a href={`#${gravityStages[1].id}`} className={styles.button}>
          {t("checkInLab")}
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              d="M4 12h16m-6-6 6 6-6 6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
    </div>
  );
};
