"use client";

import type { GravityStageId } from "../../../types/journey.types";

import { GravityStageNavigation } from "./GravityStageNavigation";
import { GravityJourneyOverview } from "./GravityJourneyOverview";

type GravityJourneyNavigationProps = {
  activeStage: GravityStageId | null;
  onSelectStage: (stage: GravityStageId, focusPanel?: boolean) => void;
  onReturnToJourney: () => void;
};

// Coordina la navegación del recorrido educativo.
// Muestra las tarjetas iniciales o la navegación de una etapa.
export const GravityJourneyNavigation = ({
  activeStage,
  onSelectStage,
  onReturnToJourney,
}: GravityJourneyNavigationProps) => {
  // Sin una etapa activa, muestra el recorrido de aprendizaje.
  if (activeStage === null) {
    return <GravityJourneyOverview onSelectStage={onSelectStage} />;
  }

  // Con una etapa activa, muestra los tags y el regreso.
  return (
    <GravityStageNavigation
      activeStage={activeStage}
      onSelectStage={onSelectStage}
      onReturnToJourney={onReturnToJourney}
    />
  );
};
