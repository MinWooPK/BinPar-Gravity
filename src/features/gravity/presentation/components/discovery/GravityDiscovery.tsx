import { useTranslations } from "next-intl";

import { GravityEducationalCard } from "./gravity-educational-card/GravityEducationalCard";
import { GravityScienceCard } from "./GravityScienceCard";
import { GravitySplitPanels } from "../shared/GravitySplitPanels";

// Muestra los dos paneles de la etapa 01 · Descubre.
export const GravityDiscovery = () => {
  const t = useTranslations("Gravity.panels");

  return (
    <div className="flex min-w-0 flex-1 flex-col" data-gravity-discovery>
      <GravitySplitPanels
        leftLabel={t("education")}
        rightLabel={t("science")}
        left={<GravityEducationalCard />}
        right={<GravityScienceCard />}
      />
    </div>
  );
};
