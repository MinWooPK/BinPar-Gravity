import { useTranslations } from "next-intl";
import styles from "./GravityIntroduction.module.css";
import { GravityFormula } from "./GravityFormula";
import { GravityPrinciples } from "./GravityPrinciples";
import { GravityStageHeading } from "./GravityStageHeading";
import { gravityStages } from "./gravityJourney";
import journeyStyles from "./GravityJourney.module.css";

export const GravityIntroduction = () => {
  const t = useTranslations("Gravity");
  const stage = gravityStages[0];

  return (
    <section id={stage.id} tabIndex={-1} aria-labelledby={`${stage.id}-heading`} className={`${styles.introduction} ${journeyStyles.stage}`}>
      <GravityStageHeading stage={stage} />
      <div className={styles.layout}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{t("introEyebrow")}</p>
          <h3 id="gravity-intro-title">{t("introTitle")}</h3>
          <p>{t("introParagraph")}</p>
          <p>{t("introNewton")}</p>
          <a href="#gravity-laboratory" className={styles.link}>
            {t("tryLaboratory")}
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 12h16m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        </div>
        <GravityFormula />
      </div>
      <GravityPrinciples />
    </section>
  );
};
