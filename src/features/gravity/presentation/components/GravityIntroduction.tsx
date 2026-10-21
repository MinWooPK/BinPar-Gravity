"use client";

import { useTranslations } from "next-intl";

import { gravityStageById } from "../../application/gravityJourney";

import { GravityFormula } from "./understanding/gravity-formula/GravityFormula";
import { GravityFormulaEducation } from "./understanding/gravity-formula/GravityFormulaEducation";
import { GravityContentTabs } from "./shared/GravityContentTabs";
import { GravityStageLayout } from "./shared/GravityStageLayout";

// Muestra la etapa 02 · Comprende.
export const GravityIntroduction = () => {
  const t = useTranslations("Gravity");
  const stage = gravityStageById["gravity-understanding"];

  return (
    <section
      aria-label={t(stage.title)}
      className="flex min-w-0 min-h-min flex-1 flex-col py-1 scroll-mt-(--gravity-stage-offset) text-lab-text"
    >
      <GravityStageLayout contentLabel="formula" compact={false}>
        <GravityContentTabs
          primary="formula"
          calculator={
            <GravityFormula
              variant="embedded"
              explanation={
                <details className="text-sm text-slate-300">
                  <summary className="min-h-11 cursor-pointer py-3 focus-visible:outline-2 focus-visible:outline-violet-300">
                    {t("siConversionsTitle")}
                  </summary>

                  <p>{t("siConversionsText")}</p>
                </details>
              }
            />
          }
        >
          <GravityFormulaEducation />
        </GravityContentTabs>
      </GravityStageLayout>
    </section>
  );
};
