import type { ReactNode } from "react";
import { GravityFormulaInteractionProvider } from "../understanding/GravityFormulaInteraction";
import { GravityUnderstandingSimulation } from "../understanding/GravityUnderstandingSimulation";
import { useTranslations } from "next-intl";
import { GravitySplitPanels } from "./GravitySplitPanels";

export const GravityStageLayout = ({ children, contentLabel, compact = true }: {
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
