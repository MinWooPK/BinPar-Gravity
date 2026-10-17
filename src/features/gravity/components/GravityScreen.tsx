import { useTranslations } from "next-intl";
import { GravityIntroduction } from "./GravityIntroduction";
import { GravityDiscovery } from "./GravityDiscovery";
import { GravityLab } from "./GravityLab";
import { GravityParametersProvider } from "./GravityParametersProvider";
import { GravityFormulaAccess } from "./GravityFormulaAccess";
import { GravityJourney, GravityJourneyPanel } from "./GravityJourneyTabs";
import { gravityStageById } from "./gravityJourney";
import styles from "./GravityJourney.module.css";
import GravityStarfield from "@/features/gravity/components/GravityStarfield";

export const GravityScreen = () => {
  const t = useTranslations("Gravity");

  return (
    <div className={`relative isolate w-full overflow-hidden bg-[#020713] ${styles.page}`}>
      <GravityStarfield />

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
