import { useTranslations } from "next-intl";

import { GravityFormulaTutorButton } from "./understanding/GravityFormulaTutorButton";
import { GravityFormula } from "./understanding/GravityFormula";
import { gravityStageById } from "../../application/gravityJourney";
import { gravityJourneyStyles as journeyStyles } from "./GravityJourney.styles";
import { GravityStageLayout } from "./shared/GravityStageLayout";

const styles = {
  "introduction": "flex [flex:1] flex-col min-w-0 [min-height:min-content] text-lab-text",
} as const;

export const GravityIntroduction = () => {
  const t = useTranslations("Gravity");
  const stage = gravityStageById["gravity-understanding"];

  return (
    <section aria-label={t(stage.title)} className={`${styles.introduction} ${journeyStyles.stage}`}>
      <GravityStageLayout contentLabel="formula" compact={false}>
        <GravityFormula explanation={<div className="space-y-1"><GravityFormulaTutorButton /><details className="text-sm text-slate-300"><summary className="min-h-11 cursor-pointer py-3 focus-visible:outline-2 focus-visible:outline-violet-300">{t("siConversionsTitle")}</summary><p>{t("siConversionsText")}</p></details></div>} />
      </GravityStageLayout>
    </section>
  );
};
