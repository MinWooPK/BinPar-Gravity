"use client";

import { useTranslations } from "next-intl";

import { GravityFormula, GravityFormulaEducation } from "./understanding/GravityFormula";
import { gravityStageById } from "../../application/gravityJourney";
import { gravityJourneyStyles as journeyStyles } from "./GravityJourney.styles";
import { GravityContentTabs } from "./shared/GravityContentTabs";
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
        <GravityContentTabs primary="formula"
          calculator={<GravityFormula variant="embedded" explanation={
            <details className="text-sm text-slate-300">
              <summary className="min-h-11 cursor-pointer py-3 focus-visible:outline-2 focus-visible:outline-violet-300">{t("siConversionsTitle")}</summary>
              <p>{t("siConversionsText")}</p>
            </details>
          } />}>
          <GravityFormulaEducation />
        </GravityContentTabs>
      </GravityStageLayout>
    </section>
  );
};
