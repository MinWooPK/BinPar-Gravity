import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { GravityFormulaInteractionProvider } from "../understanding/GravityFormulaInteraction";
import { GravityUnderstandingSimulation } from "../understanding/GravityUnderstandingSimulation";
import { GravitySplitPanels } from "./GravitySplitPanels";

// Organiza la simulación y el contenido en dos paneles.
export const GravityStageLayout = ({
  children,
  contentLabel,
  compact = true,
}: {
  children: ReactNode;
  contentLabel: "formula" | "controls" | "challenges";
  compact?: boolean;
}) => {
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
