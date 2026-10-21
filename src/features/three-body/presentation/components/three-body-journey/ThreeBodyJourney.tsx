"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { OrbitPlayback } from "../../../types/animation.types";
import { ThreeBodyJourneyNavigation } from "../ThreeBodyJourneyNavigation";
import { ThreeBodyJourneyWelcome } from "./ThreeBodyJourneyWelcome";
import { ThreeBodyJourneyPanels } from "./ThreeBodyJourneyPanels";
import { useThreeBodyJourney } from "./useThreeBodyJourney";

type Props = {
  discovery: ReactNode;
  animationData: Readonly<Record<string, OrbitPlayback>>;
};

// Compone la bienvenida, la navegación y los paneles sin mezclar los efectos.
export const ThreeBodyJourney = ({ discovery, animationData }: Props) => {
  const t = useTranslations("ThreeBody.journey");
  const { activeStage, leaving, selectStage, returnToJourney } =
    useThreeBodyJourney();

  return (
    <div
      className="lab-three-body-journey-screen relative [z-index:1] flex [flex:1] flex-col w-full [max-width:80rem] min-w-0 [min-height:calc(100dvh_-_var(--site-header-height,_64px)_-_84px)] [margin-inline:auto] [padding:clamp(.5rem,_1svh,_1rem)_1rem_1rem] min-[640px]:[padding-inline:1.5rem] min-[1100px]:[padding-inline:2rem]"
      data-three-body-journey
      data-active-stage={activeStage ?? "welcome"}
    >

      <div
        className="flex [flex:1] flex-col min-w-0 [&&]:[animation:lab-three-body-journey-enter_200ms_ease-out_both] [&[data-leaving=true]]:[animation:lab-three-body-journey-exit_100ms_ease-in_both] [&[data-leaving=true]]:pointer-events-none min-[1024px]:[&[data-introduction=true]]:grid min-[1024px]:[&[data-introduction=true]]:[grid-template-columns:minmax(0,_1.6fr)_minmax(0,_1fr)] min-[1024px]:[&[data-introduction=true]]:items-center min-[1024px]:[&[data-introduction=true]]:[gap:clamp(2rem,_5vw,_5rem)] [@media_(prefers-reduced-motion:_reduce)]:[&&]:animate-none [@media_(prefers-reduced-motion:_reduce)]:[&[data-leaving=true]]:animate-none"
        data-introduction={activeStage === null}
        data-leaving={leaving}
        aria-busy={leaving}
      >
        {activeStage === null ? (
          <ThreeBodyJourneyWelcome />
        ) : (
          <h1 className="sr-only">{t("title")}</h1>
        )}

        <ThreeBodyJourneyNavigation
          activeStage={activeStage}
          onSelectStage={selectStage}
          onReturnToJourney={returnToJourney}
        />

        <ThreeBodyJourneyPanels
          discovery={discovery}
          animationData={animationData}
          activeStage={activeStage}
          onExploreGallery={() => selectStage("gallery", true)}
        />
      </div>
    </div>
  );
};
