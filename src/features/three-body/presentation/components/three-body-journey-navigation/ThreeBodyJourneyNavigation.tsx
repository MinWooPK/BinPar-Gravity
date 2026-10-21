"use client";

import type { NavigationProps } from "./navigation.types";
import { ThreeBodyWelcomeNavigation } from "./ThreeBodyWelcomeNavigation";
import { ThreeBodyStageNavigation } from "./ThreeBodyStageNavigation";

// Selecciona la navegación según estemos en la bienvenida o en una etapa.
// Mantiene la misma API que el componente original.
export const ThreeBodyJourneyNavigation = ({
  activeStage,
  onSelectStage,
  onReturnToJourney,
}: NavigationProps) => {
  if (activeStage === null) {
    return <ThreeBodyWelcomeNavigation onSelectStage={onSelectStage} />;
  }

  return (
    <ThreeBodyStageNavigation
      activeStage={activeStage}
      onSelectStage={onSelectStage}
      onReturnToJourney={onReturnToJourney}
    />
  );
};
