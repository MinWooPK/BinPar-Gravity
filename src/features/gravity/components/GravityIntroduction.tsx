import { useTranslations } from "next-intl";
import styles from "./GravityIntroduction.module.css";
import { GravityFormula } from "./GravityFormula";
import { GravityEveryday } from "./GravityEveryday";
import { GravityPrinciples, GravityPrinciplesChallenge } from "./GravityPrinciples";
import { gravityStages } from "./gravityJourney";
import journeyStyles from "./GravityJourney.module.css";

export const GravityIntroduction = () => {
  const t = useTranslations("Gravity");
  const stage = gravityStages[0];

  return (
    <section aria-label={t(stage.title)} className={`${styles.introduction} ${journeyStyles.stage}`}>
      <div className={styles.layout}>
        <div className={styles.learningArea}>
          <div className={styles.copy}>
            <h3 id="gravity-intro-title">{t("introTitle")}</h3>
            <p>{t("introParagraph")}</p>
            <p>{t("introNewton")}</p>
          </div>
          <GravityPrinciples />
          <GravityEveryday />
        </div>
        <div className={styles.formulaArea}>
          <GravityFormula />
          <GravityPrinciplesChallenge />
        </div>
      </div>
    </section>
  );
};
