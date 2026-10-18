import { useTranslations } from "next-intl";

import { GravityFormula } from "./understanding/GravityFormula";
import { GravityFormulaInteractionProvider } from "./understanding/GravityFormulaInteraction";
import { GravityPrinciplesChallenge } from "./discovery/GravityPrinciples";
import { GravityUnderstandingSimulation } from "./understanding/GravityUnderstandingSimulation";
import { gravityStageById } from "../../application/gravityJourney";
import { gravityJourneyStyles as journeyStyles } from "./GravityJourney.styles";
import { gravityStageLayoutStyles as layoutStyles } from "./shared/GravityStageLayout.styles";

const styles = {
  "introduction": "flex [flex:1] flex-col min-w-0 [min-height:min-content] text-lab-text",
} as const;

export const GravityIntroduction = () => {
  const t = useTranslations("Gravity");
  const stage = gravityStageById["gravity-understanding"];

  return (
    <section aria-label={t(stage.title)} className={`${styles.introduction} ${journeyStyles.stage}`}>
      <GravityFormulaInteractionProvider>
        <div className={layoutStyles.layout}>
          <div className={layoutStyles.simulation}>
            <GravityUnderstandingSimulation />
          </div>
          <div className={layoutStyles.content}>
            <GravityFormula action={<GravityPrinciplesChallenge />} />
          </div>
        </div>
      </GravityFormulaInteractionProvider>
    </section>
  );
};
