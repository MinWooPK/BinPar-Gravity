"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { threeBodyStages } from "../../../application/journey";
import type { OrbitPlayback } from "../../../types/animation.types";
import type { ThreeBodyStageId } from "../../../types/journey.types";

import { GalleryIntroduction } from "../gallery/GalleryIntroduction";
import { OrbitGallery } from "../gallery/OrbitGallery";
import { ThreeBodyExperiment } from "../experiment/ThreeBodyExperiment";

type Props = {
  discovery: ReactNode;
  animationData: Readonly<Record<string, OrbitPlayback>>;
  activeStage: ThreeBodyStageId | null;
  onExploreGallery: () => void;
};

// Mantiene las etapas montadas para conservar su estado.
export const ThreeBodyJourneyPanels = ({
  discovery,
  animationData,
  activeStage,
  onExploreGallery,
}: Props) => {
  const t = useTranslations("ThreeBody.journey");

  return (
    <>
      {threeBodyStages.map((stage) => (
        <section
          key={stage.id}
          id={`three-body-${stage.id}`}
          tabIndex={-1}
          aria-label={`${stage.number} — ${t(stage.title)}`}
          hidden={activeStage !== stage.id}
          className={`min-w-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c0b3ff] 
            [[hidden]]:hidden [&:not([hidden])]:flex
             [&:not([hidden])]:flex-1 [&:not([hidden])]:flex-col [&:not([hidden])]:animate-[lab-three-body-journey-panel-enter_200ms_ease-out_both]
              motion-reduce:[&:not([hidden])]:animate-none ${
                stage.id !== "discover"
                  ? "lab-three-body-gallery-page relative z-1 m-0 w-full p-0 text-[#f2f2fa] [&_:is(h1,h2,p)]:wrap-anywhere [&_:is(a,button,select,input):focus-visible]:outline-[3px] [&_:is(a,button,select,input):focus-visible]:outline-[#c7baff] [&_:is(a,button,select,input):focus-visible]:outline-offset-4"
                  : ""
              }`}
        >
          {stage.id === "discover" ? (
            discovery
          ) : stage.id === "understand" ? (
            <div
              className="lab-three-body-gallery-gallery min-w-0 [&_:is(h2,p)]:wrap-anywhere [&_:is(a,button,select,input):focus-visible]:outline-[3px]
             [&_:is(a,button,select,input):focus-visible]:outline-[#c7baff] [&_:is(a,button,select,input):focus-visible]:outline-offset-4"
            >
              <GalleryIntroduction onExplore={onExploreGallery} />
            </div>
          ) : stage.id === "gallery" ? (
            <OrbitGallery
              animationData={animationData}
              active={activeStage === "gallery"}
            />
          ) : (
            <ThreeBodyExperiment active={activeStage === "experiment"} />
          )}
        </section>
      ))}
    </>
  );
};
