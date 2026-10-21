"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useTranslations } from "next-intl";

import type { GravityStageId } from "../../../types/journey.types";
import { GravityJourneyNavigation } from "../GravityJourneyNavigation";
import { useGravityJourneyState } from "./useGravityJourneyState";

// Datos compartidos entre las etapas.
type JourneyContextValue = {
  activeStage: GravityStageId | null;
  selectStage: (stage: GravityStageId, focusPanel?: boolean) => void;
};

const JourneyContext = createContext<JourneyContextValue | null>(null);

// Permite acceder a la etapa activa.
export const useGravityJourney = () => {
  const context = useContext(JourneyContext);

  if (!context) {
    throw new Error("Gravity journey components require GravityJourney");
  }

  return context;
};

// Devuelve la etapa seleccionada.
export const useActiveGravityStage = () => useGravityJourney().activeStage;

// Muestra la navegación y las etapas de Gravedad.
export const GravityJourney = ({
  children,
  introduction,
}: {
  children: ReactNode;
  introduction: ReactNode;
}) => {
  const t = useTranslations("Gravity");

  const { activeStage, viewportRef, selectStage, returnToJourney } =
    useGravityJourneyState();

  // Comparte la etapa activa y la navegación.
  const value = useMemo(
    () => ({ activeStage, selectStage }),
    [activeStage, selectStage],
  );

  return (
    <JourneyContext.Provider value={value}>
      <div
        className="lab-gravity-journey-workspace flex min-h-0 min-w-0 flex-1 flex-col
          max-[1023px]:flex-none
          data-[introduction=true]:overflow-y-auto
          data-[introduction=true]:scrollbar-none
          data-[introduction=true]:[&::-webkit-scrollbar]:hidden
          lg:data-[introduction=true]:grid
          lg:data-[introduction=true]:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]
          lg:data-[introduction=true]:items-center
          lg:data-[introduction=true]:gap-[clamp(2rem,5vw,5rem)]"
        data-introduction={activeStage === null}
        data-active-stage={activeStage ?? undefined}
      >
        {/* Título accesible de la página. */}
        {activeStage !== null && (
          <h1 className="sr-only">
            {t("heroLead")} {t("heroSubject")}
          </h1>
        )}

        {/* Introducción de Gravedad. */}
        {activeStage === null && introduction}

        {/* Navegación entre etapas. */}
        <GravityJourneyNavigation
          activeStage={activeStage}
          onSelectStage={selectStage}
          onReturnToJourney={returnToJourney}
        />

        {/* Conserva los paneles al cambiar de etapa. */}
        <div
          ref={viewportRef}
          hidden={activeStage === null}
          className="lab-gravity-journey-viewport flex min-h-0 min-w-0 flex-1 flex-col
            overflow-auto overscroll-y-contain
            scrollbar-none scroll-auto scroll-py-4
            px-2 pt-1 pb-2
            [&::-webkit-scrollbar]:hidden
            [[hidden]]:hidden
            max-[1023px]:block
            max-[1023px]:flex-none
            max-[1023px]:overflow-visible"
        >
          {children}
        </div>
      </div>
    </JourneyContext.Provider>
  );
};
