import type { ThreeBodyStageId } from "../../../types/journey.types";

// Contrato original del componente de navegación educativa.
export type NavigationProps = {
  activeStage: ThreeBodyStageId | null;
  onSelectStage: (stage: ThreeBodyStageId, focusPanel?: boolean) => void;
  onReturnToJourney: () => void;
};
