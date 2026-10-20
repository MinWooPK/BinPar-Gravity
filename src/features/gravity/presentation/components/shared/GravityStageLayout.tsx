import type { ReactNode } from "react";
import { GravityFormulaInteractionProvider } from "../understanding/GravityFormulaInteraction";
import { GravityUnderstandingSimulation } from "../understanding/GravityUnderstandingSimulation";
import { useTranslations } from "next-intl";
import { GravitySplitPanels } from "./GravitySplitPanels";

// Organiza la simulación gravitatoria y el contenido educativo
// en dos paneles, compartiendo las interacciones de la fórmula.
export const GravityStageLayout = ({
  children,
  contentLabel,
  compact = true,
}: {
  children: ReactNode;
  contentLabel: "formula" | "controls" | "challenges";
  compact?: boolean;
}) => {
  // Obtiene las traducciones de los títulos de los paneles.
  const t = useTranslations("Gravity.panels");

  return (
    <GravityFormulaInteractionProvider>
      <GravitySplitPanels
        leftLabel={t("simulation")}
        rightLabel={t(contentLabel)}
        left={<GravityUnderstandingSimulation compact={compact} />}
        right={children}
      />
    </GravityFormulaInteractionProvider>
  );
};
