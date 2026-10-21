import { useTranslations } from "next-intl";
import { GravityIntroduction } from "./GravityIntroduction";
import { GravityDiscovery } from "./discovery/GravityDiscovery";
import { GravityLab } from "./challenges/GravityLab";
import { GravityParametersProvider } from "../providers/GravityParametersProvider";
import { GravityFormulaAccess } from "./understanding/GravityFormulaAccess";
import { GravityJourney, GravityJourneyPanel } from "./GravityJourneyTabs";
import { gravityStageById } from "../../application/gravityJourney";
import { SpaceStarfield } from "@/components/layout/SpaceStarfield/SpaceStarfield";

export const GravityScreen = () => {
  const t = useTranslations("Gravity");

  return (
    <div
      className="relative isolate w-full overflow-hidden bg-[#020713] flex [flex:1] min-w-0 min-h-0"
    >
      <SpaceStarfield />

      <div className="page-enter relative z-10 lab-gravity-journey-screen [--gravity-stage-offset:1rem] flex [flex:1] flex-col w-full [max-width:80rem] min-h-0 [margin-inline:auto] [padding-block:clamp(.5rem,_1svh,_1rem)_max(.5rem,_env(safe-area-inset-bottom))] [padding-left:max(1rem,_env(safe-area-inset-left))] [padding-right:max(1rem,_env(safe-area-inset-right))] [@media(max-width:1023px)]:[flex:none] [@media_(min-width:_40rem)]:[&]:[padding-left:max(1.5rem,_env(safe-area-inset-left))] [@media_(min-width:_40rem)]:[&]:[padding-right:max(1.5rem,_env(safe-area-inset-right))] [@media_(min-width:_68.75rem)]:[&]:[padding-left:max(2rem,_env(safe-area-inset-left))] [@media_(min-width:_68.75rem)]:[&]:[padding-right:max(2rem,_env(safe-area-inset-right))] [@media_(max-height:_500px)]:[&&]:[padding-block:0.5rem]">
        <GravityParametersProvider>
          <GravityFormulaAccess>
            <GravityJourney
              introduction={
                <header className="shrink-0 [margin-block:auto] [padding-block:clamp(2rem,_6vh,_5rem)] [@media_(min-width:_64rem)]:[.lab-gravity-journey-workspace[data-introduction=true]_&]:[min-width:0] [@media_(min-width:_64rem)]:[.lab-gravity-journey-workspace[data-introduction=true]_&]:[margin-block:0]">
                  <p className="[margin:0_0_clamp(1.5rem,_4vh,_3rem)] [color:#b8b0d6] [font-size:clamp(.75rem,_1.7vw,_1.25rem)] font-bold [letter-spacing:.23em] uppercase [@media_(min-width:_64rem)]:[.lab-gravity-journey-workspace[data-introduction=true]_&]:[font-size:clamp(0.75rem,_1.1vw,_0.95rem)]">{t("heroEyebrow")}</p>
                  <h1 className="m-0 [color:#f8fafc] [font-size:clamp(3.25rem,_9vw,_8rem)] font-extrabold [line-height:1.05] [letter-spacing:-.065em] [&_span]:[display:block] [@media_(min-width:_64rem)]:[.lab-gravity-journey-workspace[data-introduction=true]_&]:[font-size:clamp(3.5rem,_6.5vw,_6rem)]">
                    <span>{t("heroLead")}</span> <span>{t("heroSubject")}</span>
                  </h1>
                  <p className="[max-width:65rem] [margin:clamp(1.5rem,_4vh,_3rem)_0_0] [color:#cbd5e1] [font-size:clamp(1rem,_2.4vw,_1.75rem)] [line-height:1.7] [@media_(min-width:_64rem)]:[.lab-gravity-journey-workspace[data-introduction=true]_&]:[font-size:clamp(1rem,_1.5vw,_1.25rem)]">
                    {t("heroDescription")}
                  </p>
                </header>
              }
            >
              <GravityJourneyPanel
                stage={gravityStageById["gravity-discovery"]}
                className="min-w-0 [padding-block:.25rem] [scroll-margin-top:var(--gravity-stage-offset)]"
              >
                <GravityDiscovery />
              </GravityJourneyPanel>

              <GravityJourneyPanel
                stage={gravityStageById["gravity-understanding"]}
              >
                <GravityIntroduction />
              </GravityJourneyPanel>

              <GravityLab />
            </GravityJourney>
          </GravityFormulaAccess>
        </GravityParametersProvider>
      </div>
    </div>
  );
};
