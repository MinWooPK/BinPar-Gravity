"use client";

import { useMemo } from "react";

import { TutorContextBridge } from "@/features/ai/presentation/providers/TutorProvider";
import type { TutorContext } from "@/features/ai/types/tutor.types";

import { GravityExperiment } from "../experiment/GravityExperiment";
import { GravityPractice } from "../practice/gravity-practice/GravityPractice";
import { GravityJourneyPanel, useGravityJourney } from "../GravityJourneyTabs";
import { GravityStageLayout } from "../shared/GravityStageLayout";

import { gravityStageById } from "../../../application/gravityJourney";
import { useGravityParameters } from "../../providers/GravityParametersProvider";

// Muestra las etapas 03 y 04 y las conecta con el Tutor IA.
export const GravityLab = () => {
  const { activeStage, selectStage } = useGravityJourney();

  const {
    parameters,
    setParameters,
    resetParameters,
    revision,
    applyProposal,
  } = useGravityParameters();

  // Permite aplicar cambios de la IA en el laboratorio.
  const proposalPort = useMemo(
    () => ({
      revision,
      apply: applyProposal,
      reveal: () => selectStage("gravity-laboratory", true),
    }),
    [revision, applyProposal, selectStage],
  );

  // Comparte la etapa y los parámetros con la IA.
  const tutorContext = useMemo<TutorContext>(
    () => ({ kind: "gravity", stage: activeStage, parameters }),
    [activeStage, parameters],
  );

  return (
    <>
      {/* Etapa 03: Experimenta. */}
      <GravityJourneyPanel
        stage={gravityStageById["gravity-laboratory"]}
        className="min-w-0 py-1 scroll-mt-(--gravity-stage-offset)"
      >
        <GravityStageLayout contentLabel="controls">
          <GravityExperiment
            parameters={parameters}
            onChange={setParameters}
            onReset={resetParameters}
          />
        </GravityStageLayout>
      </GravityJourneyPanel>

      {/* Etapa 04: Comprueba. */}
      <GravityJourneyPanel
        stage={gravityStageById["gravity-challenges"]}
        className="min-w-0 py-1 scroll-mt-(--gravity-stage-offset)"
      >
        <GravityPractice />
      </GravityJourneyPanel>

      {/* Conecta el laboratorio con el Tutor IA. */}
      <TutorContextBridge context={tutorContext} gravity={proposalPort} />
    </>
  );
};
