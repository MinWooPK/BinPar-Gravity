import { useTranslations } from "next-intl";

import { SpaceStarfield } from "@/components/layout/SpaceStarfield/SpaceStarfield";

import { gravityStageById } from "../../application/gravityJourney";
import { GravityParametersProvider } from "../providers/GravityParametersProvider";

import { GravityIntroduction } from "./GravityIntroduction";
import { GravityDiscovery } from "./discovery/GravityDiscovery";
import { GravityLab } from "./challenges/GravityLab";
import { GravityFormulaAccess } from "./understanding/GravityFormulaAccess";
import { GravityJourney, GravityJourneyPanel } from "./GravityJourneyTabs";

// Muestra el recorrido educativo de Gravedad.
export const GravityScreen = () => {
  const t = useTranslations("Gravity");

  return (
    <div className="relative isolate flex min-h-0 min-w-0 w-full flex-1  bg-[#020713]">
      <SpaceStarfield />

      <div
        className="lab-gravity-journey-screen relative z-10 mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col
          [--gravity-stage-offset:1rem]
          animate-[lab-page-enter_450ms_ease-out_both]
          px-[max(1rem,env(safe-area-inset-left))]
          pt-[clamp(.5rem,1svh,1rem)]
          pb-[max(.5rem,env(safe-area-inset-bottom))]
          sm:pl-[max(1.5rem,env(safe-area-inset-left))]
          sm:pr-[max(1.5rem,env(safe-area-inset-right))]
          min-[68.75rem]:pl-[max(2rem,env(safe-area-inset-left))]
          min-[68.75rem]:pr-[max(2rem,env(safe-area-inset-right))]
          max-[1023px]:flex-none
          [@media(max-height:500px)]:py-2
          motion-reduce:animate-none"
      >
        <GravityParametersProvider>
          <GravityFormulaAccess>
            <GravityJourney
              introduction={
                <header className="my-auto shrink-0 py-[clamp(2rem,6vh,5rem)] lg:my-0 lg:min-w-0">
                  <p
                    className="mb-[clamp(1.5rem,4vh,3rem)] text-[clamp(.75rem,1.7vw,1.25rem)] font-bold tracking-[.23em] text-[#b8b0d6] 
                  uppercase lg:text-[clamp(.75rem,1.1vw,.95rem)]"
                  >
                    {t("heroEyebrow")}
                  </p>

                  <h1
                    className="text-[clamp(3.25rem,9vw,8rem)] leading-[1.05] font-extrabold tracking-[-.065em] text-[#f8fafc]
                   lg:text-[clamp(3.5rem,6.5vw,6rem)] [&_span]:block"
                  >
                    <span>{t("heroLead")}</span>
                    <span>{t("heroSubject")}</span>
                  </h1>

                  <p
                    className="mt-[clamp(1.5rem,4vh,3rem)] max-w-5xl text-[clamp(1rem,2.4vw,1.75rem)] leading-[1.7] text-[#cbd5e1] 
                  lg:text-[clamp(1rem,1.5vw,1.25rem)]"
                  >
                    {t("heroDescription")}
                  </p>
                </header>
              }
            >
              {/* Etapa 01 · Descubre. */}
              <GravityJourneyPanel
                stage={gravityStageById["gravity-discovery"]}
                className="min-w-0 py-1 scroll-mt-(--gravity-stage-offset)"
              >
                <GravityDiscovery />
              </GravityJourneyPanel>

              {/* Etapa 02 · Comprende. */}
              <GravityJourneyPanel
                stage={gravityStageById["gravity-understanding"]}
              >
                <GravityIntroduction />
              </GravityJourneyPanel>

              {/* Etapas 03 · Experimenta y 04 · Comprueba. */}
              <GravityLab />
            </GravityJourney>
          </GravityFormulaAccess>
        </GravityParametersProvider>
      </div>
    </div>
  );
};
