"use client";

import type { GravityStageId } from "../../../types/journey.types";

import { GravityStageNavigation } from "./GravityStageNavigation";
import { GravityJourneyOverview } from "./GravityJourneyOverview";

type GravityJourneyNavigationProps = {
  activeStage: GravityStageId | null;
  onSelectStage: (stage: GravityStageId, focusPanel?: boolean) => void;
  onReturnToJourney: () => void;
};

// Muestra el recorrido inicial o la navegación entre etapas.
export const GravityJourneyNavigation = ({
  activeStage,
  onSelectStage,
  onReturnToJourney,
}: GravityJourneyNavigationProps) => {
  if (activeStage === null) {
    return <GravityJourneyOverview onSelectStage={onSelectStage} />;
  }

  return (
    <GravityStageNavigation
      activeStage={activeStage}
      onSelectStage={onSelectStage}
      onReturnToJourney={onReturnToJourney}
    />
  );
};
