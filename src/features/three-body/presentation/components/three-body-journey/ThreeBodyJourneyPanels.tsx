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

// Renderiza todas las etapas y oculta las inactivas sin desmontarlas.
// Así se conserva el estado de la galería y de los controles entre etapas.
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
            className={`min-w-0 [&[hidden]]:hidden [&:not([hidden])]:flex [&:not([hidden])]:[flex:1] [&:not([hidden])]:flex-col [&:not([hidden])]:[animation:lab-three-body-journey-panel-enter_200ms_ease-out_both] [&:focus-visible]:[outline:2px_solid_#c0b3ff] [&:focus-visible]:[outline-offset:4px] [&:focus-visible]:[border-radius:8px] [@media_(prefers-reduced-motion:_reduce)]:[&:not([hidden])]:animate-none ${
              stage.id !== "discover"
                ? `lab-three-body-gallery-page [&&]:relative [&&]:[z-index:1] [&&]:[width:min(100%_-_2rem,_80rem)] [&&]:min-w-0 [&&]:[margin-inline:auto] [&&]:[padding-block:2.5rem_4rem] [&&]:[color:#f2f2fa] [&_:is(h1,_h2,_p)]:[overflow-wrap:anywhere] [&_:is(a,_button,_select,_input):focus-visible]:[outline:3px_solid_#c7baff] [&_:is(a,_button,_select,_input):focus-visible]:[outline-offset:4px] min-[640px]:[&&]:[width:min(100%_-_3rem,_80rem)] min-[640px]:[&&]:[padding-top:3.5rem] [&&&]:w-full [&&&]:m-0 [&&&]:p-0`
                : ""
            }`}
          >
            {stage.id === "discover" ? (
              discovery
            ) : stage.id === "understand" ? (
              <div className="lab-three-body-gallery-gallery min-w-0 [margin-top:0] [&_:is(h2,_p)]:[overflow-wrap:anywhere] [&_:is(a,_button,_select,_input):focus-visible]:[outline:3px_solid_#c7baff] [&_:is(a,_button,_select,_input):focus-visible]:[outline-offset:4px]">
                <GalleryIntroduction
                  onExplore={onExploreGallery}
                />
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
