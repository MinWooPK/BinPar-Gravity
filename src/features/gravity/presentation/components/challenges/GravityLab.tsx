"use client";

import { useMemo } from "react";
import { TutorContextBridge } from "@/features/ai/presentation/providers/TutorProvider";
import type { TutorContext } from "@/features/ai/types/tutor.types";
import { GravityExperiment } from "../experiment/GravityExperiment";
import { GravityPractice } from "../practice/GravityPractice";
import { GravityJourneyPanel, useGravityJourney } from "../GravityJourneyTabs";
import { GravityStageLayout } from "../shared/GravityStageLayout";
import { gravityStageById } from "../../../application/gravityJourney";
import { useGravityParameters } from "../../providers/GravityParametersProvider";

// Coordina las etapas de experimentación y práctica,
// conectando el laboratorio con el Tutor IA.
export const GravityLab = () => {
  // Obtiene la etapa activa y la función para cambiar de etapa.
  const { activeStage, selectStage } = useGravityJourney();

  // Obtiene los parámetros y las funciones de control del laboratorio.
  const {
    parameters,
    setParameters,
    resetParameters,
    revision,
    applyProposal,
  } = useGravityParameters();

  // Configura las acciones que permiten al Tutor IA
  // aplicar propuestas y mostrar el laboratorio.
  const proposalPort = useMemo(
    () => ({
      revision,
      apply: applyProposal,
      reveal: () => selectStage("gravity-laboratory", true),
    }),
    [revision, applyProposal, selectStage],
  );

  // Prepara el contexto que recibe el Tutor IA
  // con la etapa activa y los parámetros gravitatorios.
  const tutorContext = useMemo<TutorContext>(
    () => ({ kind: "gravity", stage: activeStage, parameters }),
    [activeStage, parameters],
  );

  return (
    <>
      <GravityJourneyPanel
        stage={gravityStageById["gravity-laboratory"]}
        className="min-w-0 [padding-block:.25rem] [scroll-margin-top:var(--gravity-stage-offset)]"
      >
        <GravityStageLayout contentLabel="controls">
          <GravityExperiment
            parameters={parameters}
            onChange={setParameters}
            onReset={resetParameters}
          />
        </GravityStageLayout>
      </GravityJourneyPanel>

      <GravityJourneyPanel
        stage={gravityStageById["gravity-challenges"]}
        className="min-w-0 [padding-block:.25rem] [scroll-margin-top:var(--gravity-stage-offset)]"
      >
        <GravityPractice />
      </GravityJourneyPanel>

      <TutorContextBridge context={tutorContext} gravity={proposalPort} />
    </>
  );
};
