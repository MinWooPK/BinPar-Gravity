"use client";
import { useMemo } from "react";
import { TutorContextBridge } from "@/features/ai/presentation/providers/TutorProvider";
import type { TutorContext } from "@/features/ai/types/tutor.types";
import { GravityExperiment } from "../experiment/GravityExperiment";
import { GravityPractice } from "../practice/GravityPractice";
import { GravityJourneyPanel, useGravityJourney } from "../GravityJourneyTabs";
import { GravityStageLayout } from "../shared/GravityStageLayout";
import { gravityStageById } from "../../../application/gravityJourney";
import { gravityJourneyStyles as journeyStyles } from "../GravityJourney.styles";
import { useGravityParameters } from "../../providers/GravityParametersProvider";
/** Practice is independent from laboratory parameters; visiting it never resets them. */
export const GravityLab = () => {
    const { activeStage, selectStage } = useGravityJourney();
    const { parameters, setParameters, resetParameters, revision, applyProposal } = useGravityParameters();
    const proposalPort = useMemo(() => ({ revision, apply: applyProposal, reveal: () => selectStage("gravity-laboratory", true) }), [revision, applyProposal, selectStage]);
    const tutorContext = useMemo<TutorContext>(() => ({ kind: "gravity", stage: activeStage, parameters }), [activeStage, parameters]);
    return <>
    <GravityJourneyPanel stage={gravityStageById["gravity-laboratory"]} className={journeyStyles.stage}>
      <GravityStageLayout contentLabel="controls"><GravityExperiment parameters={parameters} onChange={setParameters} onReset={resetParameters}/></GravityStageLayout>
    </GravityJourneyPanel>
    <GravityJourneyPanel stage={gravityStageById["gravity-challenges"]} className={journeyStyles.stage}><GravityPractice /></GravityJourneyPanel>
    <TutorContextBridge context={tutorContext} gravity={proposalPort}/>
  </>;
};
