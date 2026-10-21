"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import type { GravityStage } from "../../../types/journey.types";
import { useGravityJourney } from "./GravityJourney";

// Muestra una etapa solo cuando está seleccionada y conserva su montaje.
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

  return (
    <section
      id={stage.id}
      aria-label={`${stage.number} — ${t(stage.title)}`}
      tabIndex={-1}
      hidden={activeStage !== stage.id}
      className={`lab-gravity-journey-panel min-w-0 [&[hidden]]:[display:none] [&:not([hidden])]:[display:flex] [&:not([hidden])]:[flex:1_0_auto] [&:not([hidden])]:[flex-direction:column] [&:not([hidden])]:[min-height:100%] [&:not([hidden])]:[animation:lab-gravity-panel-enter_220ms_ease-out_both] [&:focus-visible]:[outline:2px_solid_#c0b3ff] [&:focus-visible]:[outline-offset:-3px] [&:focus-visible]:[border-radius:8px] [@media_(max-width:_1023px)]:[&:not([hidden])]:[min-height:0] [@media_(prefers-reduced-motion:_reduce)]:[&:not([hidden])]:[animation:none] ${className ?? ""}`}
    >
      {children}
    </section>
  );
};
