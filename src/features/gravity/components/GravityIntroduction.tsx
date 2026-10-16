import { useTranslations } from "next-intl";
import styles from "./GravityIntroduction.module.css";
import { GravityFormula } from "./GravityFormula";
import { GravityPrinciples, GravityPrinciplesChallenge } from "./GravityPrinciples";
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
          <h3 id="gravity-intro-title">{t("introTitle")}</h3>
          <p>{t("introParagraph")}</p>
          <p>{t("introNewton")}</p>
        </div>
        <div className={styles.formulaArea}><GravityFormula /></div>
        <div className={styles.principlesArea}><GravityPrinciples /></div>
        <div className={styles.challengeArea}><GravityPrinciplesChallenge /></div>
      </div>
    </section>
  );
};
