"use client";

import { useTranslations } from "next-intl";
import { StageSelector } from "@/components/ui/StageSelector";
import { gravityStages } from "../../application/gravityJourney";
import type { GravityStageId } from "../../types/journey.types";

export const GravityStageSelector = ({ activeStage, onSelectStage }: {
  activeStage: GravityStageId;
  onSelectStage: (stage: GravityStageId) => void;
}) => {
  const t = useTranslations("Gravity");
  return (
    <StageSelector
      id="gravity-stage-selector"
      label={t("chooseStage")}
      value={activeStage}
      options={gravityStages.map((stage) => ({ ...stage, label: t(stage.title) }))}
      onChange={onSelectStage}
      selectedIndicatorClassName="shrink-0 text-violet-300"
    />
  );
};
