"use client";

import { ExperimentSettings } from "./ExperimentSettings";
import { ExperimentViewport } from "./ExperimentViewport";
import { useExperimentSimulation } from "./useExperimentSimulation";

// Muestra la configuración y la simulación de los tres cuerpos.
export const ThreeBodyExperiment = ({
  active = true,
}: {
  active?: boolean;
}) => {
  const experiment = useExperimentSimulation(active);

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <ExperimentSettings experiment={experiment} />
      <ExperimentViewport experiment={experiment} />
    </div>
  );
};
