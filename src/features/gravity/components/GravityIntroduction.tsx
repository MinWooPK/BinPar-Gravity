import { useTranslations } from "next-intl";
import styles from "./GravityIntroduction.module.css";
import { GravityFormula } from "./GravityFormula";
import { GravityFormulaInteractionProvider } from "./GravityFormulaInteraction";
import { GravityPrinciplesChallenge } from "./GravityPrinciples";
import { GravityUnderstandingSimulation } from "./GravityUnderstandingSimulation";
import { GravityFormulaSession } from "./GravityParametersProvider";
import { gravityStageById } from "./gravityJourney";
import journeyStyles from "./GravityJourney.module.css";

export const GravityIntroduction = () => {
  const t = useTranslations("Gravity");
  const stage = gravityStageById["gravity-understanding"];

  return (
    <section aria-label={t(stage.title)} className={`${styles.introduction} ${journeyStyles.stage}`}>
      <GravityFormulaInteractionProvider>
        <div className={styles.layout}>
          <div className={styles.learningArea}>
            <GravityUnderstandingSimulation />
          </div>
          <div className={styles.formulaArea}>
            <GravityFormulaSession><GravityFormula action={<GravityPrinciplesChallenge />} /></GravityFormulaSession>
          </div>
        </div>
      </GravityFormulaInteractionProvider>
    </section>
  );
};
