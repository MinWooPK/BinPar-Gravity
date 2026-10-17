import { useTranslations } from "next-intl";
import styles from "./GravityIntroduction.module.css";
import { GravityFormula } from "./GravityFormula";
import { GravityPrinciplesChallenge } from "./GravityPrinciples";
import { GravityEducationalCard } from "./GravityEducationalCard";
import { GravityUnderstandingSimulation } from "./GravityUnderstandingSimulation";
import { GravityFormulaSession } from "./GravityParametersProvider";
import { gravityStages } from "./gravityJourney";
import journeyStyles from "./GravityJourney.module.css";

export const GravityIntroduction = () => {
  const t = useTranslations("Gravity");
  const stage = gravityStages[0];

  return (
    <section aria-label={t(stage.title)} className={`${styles.introduction} ${journeyStyles.stage}`}>
      <div className={styles.layout}>
        <div className={styles.learningArea}>
          <GravityUnderstandingSimulation />
          <GravityEducationalCard />
        </div>
        <div className={styles.formulaArea}>
          <GravityFormulaSession><GravityFormula /></GravityFormulaSession>
          <GravityPrinciplesChallenge />
        </div>
      </div>
    </section>
  );
};
