"use client";

import type { AnchorHTMLAttributes } from "react";

import type { GravityStageId } from "../../../types/journey.types";
import { useGravityJourney } from "./GravityJourney";

// Conserva las propiedades de un enlace, salvo el destino.
type StageLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  stageId: GravityStageId;
};

// Navega a una etapa y conserva la interacción nativa del enlace.
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
        // Respeta los clics cancelados y las teclas modificadoras.
        onClick?.(event);

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
