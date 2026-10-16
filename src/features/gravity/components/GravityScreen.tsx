import { useTranslations } from "next-intl";
import { GravityIntroduction } from "./GravityIntroduction";
import { GravityLab } from "./GravityLab";
import { GravityParametersProvider } from "./GravityParametersProvider";
import { GravityJourneyNavigation } from "./GravityJourneyNavigation";

export const GravityScreen = () => {
  const t = useTranslations("Gravity");
  return (
    <div className="page-enter mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="sr-only">{t("title")}</h1>
      <GravityJourneyNavigation />
      <GravityParametersProvider>
        <GravityIntroduction />
        <GravityLab />
      </GravityParametersProvider>
    </div>
  );
};
