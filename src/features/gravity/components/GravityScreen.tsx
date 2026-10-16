import { useTranslations } from "next-intl";
import { GravityIntroduction } from "./GravityIntroduction";
import { GravityLab } from "./GravityLab";
import { GravityParametersProvider } from "./GravityParametersProvider";
import { GravityJourneyNavigation } from "./GravityJourneyNavigation";
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
      <GravityJourneyNavigation />
      <GravityEveryday />
      <GravityParametersProvider>
        <GravityIntroduction />
        <GravityLab />
      </GravityParametersProvider>
    </div>
  );
};
