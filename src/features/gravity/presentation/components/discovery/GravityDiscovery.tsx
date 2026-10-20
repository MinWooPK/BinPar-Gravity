import { useTranslations } from "next-intl";
import { GravityEducationalCard } from "./GravityEducationalCard";
import { GravityScienceCard } from "./GravityScienceCard";
import { GravitySplitPanels } from "../shared/GravitySplitPanels";

// Muestra la etapa 01 · Descubre, organizando el contenido
// educativo y científico en dos paneles.
export const GravityDiscovery = () => {
  // Obtiene las traducciones de los títulos de los paneles.
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
