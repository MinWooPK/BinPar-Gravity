import { useTranslations } from "next-intl";
import { GravityIntroduction } from "./GravityIntroduction";
import { GravityDiscovery } from "./discovery/GravityDiscovery";
import { GravityLab } from "./challenges/GravityLab";
import { GravityParametersProvider } from "../providers/GravityParametersProvider";
import { GravityFormulaAccess } from "./understanding/GravityFormulaAccess";
import { GravityJourney, GravityJourneyPanel } from "./GravityJourneyTabs";
import { gravityStageById } from "../../application/gravityJourney";
import { gravityJourneyStyles as styles } from "./GravityJourney.styles";
import { SpaceStarfield } from "@/components/layout/SpaceStarfield";

export const GravityScreen = () => {
  const t = useTranslations("Gravity");

  return (
    <div className={`relative isolate w-full overflow-hidden bg-[#020713] ${styles.page}`}>
      <SpaceStarfield />

      <div className={`page-enter relative z-10 ${styles.screen}`}>
        <GravityParametersProvider>
          <GravityFormulaAccess>
            <GravityJourney
              introduction={
                <header className={styles.hero}>
                  <p className={styles.heroEyebrow}>{t("heroEyebrow")}</p>
                  <h1 className={styles.heroTitle}>
                    <span>{t("heroLead")}</span> <span>{t("heroSubject")}</span>
                  </h1>
                  <p className={styles.heroDescription}>{t("heroDescription")}</p>
                </header>
              }
            >
              <GravityJourneyPanel stage={gravityStageById["gravity-discovery"]} className={styles.stage}>
                <GravityDiscovery />
              </GravityJourneyPanel>

              <GravityJourneyPanel stage={gravityStageById["gravity-understanding"]}>
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
