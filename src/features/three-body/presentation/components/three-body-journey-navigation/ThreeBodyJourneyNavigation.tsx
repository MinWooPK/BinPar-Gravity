"use client";

import type { NavigationProps } from "./navigation.types";
import { ThreeBodyWelcomeNavigation } from "./ThreeBodyWelcomeNavigation";
import { ThreeBodyStageNavigation } from "./ThreeBodyStageNavigation";

// Muestra la navegación de bienvenida o de una etapa.
export const ThreeBodyJourneyNavigation = ({
  activeStage,
  onSelectStage,
  onReturnToJourney,
}: NavigationProps) =>
  activeStage === null ? (
    <ThreeBodyWelcomeNavigation onSelectStage={onSelectStage} />
  ) : (
    <ThreeBodyStageNavigation
      activeStage={activeStage}
      onSelectStage={onSelectStage}
      onReturnToJourney={onReturnToJourney}
    />
  );
