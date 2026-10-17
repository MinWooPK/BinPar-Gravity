import { useTranslations } from "next-intl";
import { GravityIntroduction } from "./GravityIntroduction";
import { GravityLab } from "./GravityLab";
import { GravityParametersProvider } from "./GravityParametersProvider";
import { GravityJourney, GravityJourneyPanel } from "./GravityJourneyTabs";
import { gravityStages } from "./gravityJourney";
import { GravityEveryday } from "./GravityEveryday";
import styles from "./GravityJourney.module.css";

export const GravityScreen = () => {
  const t = useTranslations("Gravity");
  return (
    <div className={`page-enter ${styles.screen}`}>
      <header className={styles.pageHeader}>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">{t("title")}</h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">{t("description")}</p>
      </header>
      <GravityParametersProvider>
        <GravityJourney>
          <GravityJourneyPanel stage={gravityStages[0]}>
            <GravityEveryday />
            <GravityIntroduction />
          </GravityJourneyPanel>
          <GravityLab />
        </GravityJourney>
      </GravityParametersProvider>
    </div>
  );
};
