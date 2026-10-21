"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import type { GravityStage } from "../../../types/journey.types";
import { useGravityJourney } from "./GravityJourney";

// Muestra la etapa seleccionada sin desmontar las demás.
export const GravityJourneyPanel = ({
  stage,
  className,
  children,
}: {
  stage: GravityStage;
  className?: string;
  children: ReactNode;
}) => {
  const { activeStage } = useGravityJourney();
  const t = useTranslations("Gravity");

  const active = activeStage === stage.id;

  return (
    <section
      id={stage.id}
      aria-label={`${stage.number} — ${t(stage.title)}`}
      tabIndex={-1}
      hidden={!active}
      className={`lab-gravity-journey-panel min-w-0
        [[hidden]]:hidden
        focus-visible:rounded-lg
        focus-visible:outline-2
        focus-visible:outline-offset-[-3px]
        focus-visible:outline-[#c0b3ff]
        ${
          active
            ? "flex min-h-full flex-[1_0_auto] flex-col animate-[lab-gravity-panel-enter_220ms_ease-out_both] max-[1023px]:min-h-0 motion-reduce:animate-none"
            : ""
        }
        ${className ?? ""}`}
    >
      {children}
    </section>
  );
};
