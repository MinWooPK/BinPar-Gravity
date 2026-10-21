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

// Organiza la bienvenida y las etapas educativas.
export const ThreeBodyJourney = ({ discovery, animationData }: Props) => {
  const t = useTranslations("ThreeBody.journey");
  const { activeStage, leaving, selectStage, returnToJourney } =
    useThreeBodyJourney();

  return (
    <div
      className="lab-three-body-journey-screen relative z-1 mx-auto flex min-h-[calc(100dvh-var(--site-header-height,64px)-84px)]
       w-full max-w-7xl min-w-0 flex-1 flex-col px-4 pt-[clamp(.5rem,1svh,1rem)] pb-4 min-[640px]:px-6 min-[1100px]:px-8"
      data-three-body-journey
      data-active-stage={activeStage ?? "welcome"}
    >
      <div
        className="flex min-w-0 flex-1 flex-col animate-[lab-three-body-journey-enter_200ms_ease-out_both]
         data-[leaving=true]:animate-[lab-three-body-journey-exit_100ms_ease-in_both] data-[leaving=true]:pointer-events-none
          min-[1024px]:data-[introduction=true]:grid min-[1024px]:data-[introduction=true]:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]
           min-[1024px]:data-[introduction=true]:items-center min-[1024px]:data-[introduction=true]:gap-[clamp(2rem,5vw,5rem)] 
           motion-reduce:animate-none"
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
