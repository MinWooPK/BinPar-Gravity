"use client";

import type { AnchorHTMLAttributes } from "react";

import type { GravityStageId } from "../../../types/journey.types";
import { useGravityJourney } from "./GravityJourney";

type StageLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  stageId: GravityStageId;
};

// Enlace para navegar entre etapas.
export const GravityStageLink = ({
  stageId,
  onClick,
  ...props
}: StageLinkProps) => {
  const { selectStage } = useGravityJourney();

  return (
    <a
      {...props}
      href={`#${stageId}`}
      onClick={(event) => {
        onClick?.(event);

        // Respeta los clics especiales del navegador.
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        event.preventDefault();
        selectStage(stageId, true);
      }}
    />
  );
};
