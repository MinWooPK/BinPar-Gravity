"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";

import type { GravityStageId } from "../../../types/journey.types";
import { GravityJourneyNavigation } from "../GravityJourneyNavigation";
import { useGravityJourneyState } from "./useGravityJourneyState";

// Define la información de navegación compartida entre las etapas.
type JourneyContextValue = {
  activeStage: GravityStageId | null;
  selectStage: (stage: GravityStageId, focusPanel?: boolean) => void;
};

const JourneyContext = createContext<JourneyContextValue | null>(null);

// Permite acceder a la etapa activa y cambiar de etapa.
export const useGravityJourney = () => {
  const context = useContext(JourneyContext);

  if (!context) {
    throw new Error("Gravity journey components require GravityJourney");
  }

  return context;
};

// Devuelve únicamente el identificador de la etapa actual.
export const useActiveGravityStage = () => useGravityJourney().activeStage;

// Organiza el recorrido educativo y mantiene montados sus paneles.
export const GravityJourney = ({
  children,
  introduction,
}: {
  children: ReactNode;
  introduction: ReactNode;
}) => {
  const t = useTranslations("Gravity");

  const {
    activeStage,
    viewportRef,
    selectStage,
    returnToJourney,
  } = useGravityJourneyState();

  // Solo comparte los valores que necesitan los componentes consumidores.
  const value = useMemo(
    () => ({ activeStage, selectStage }),
    [activeStage, selectStage],
  );

  return (
    <JourneyContext.Provider value={value}>
      <div
        className="lab-gravity-journey-workspace flex [flex:1] flex-col min-w-0 min-h-0 [@media(max-width:1023px)]:[flex:none] [&[data-introduction=true]]:[overflow-y:auto] [&[data-introduction=true]]:[scrollbar-width:none] [&[data-introduction=true]::-webkit-scrollbar]:[display:none] [@media_(min-width:_64rem)]:[&[data-introduction=true]]:[display:grid] [@media_(min-width:_64rem)]:[&[data-introduction=true]]:[grid-template-columns:minmax(0,_1.6fr)_minmax(0,_1fr)] [@media_(min-width:_64rem)]:[&[data-introduction=true]]:[align-items:center] [@media_(min-width:_64rem)]:[&[data-introduction=true]]:[gap:clamp(2rem,_5vw,_5rem)]"
        data-introduction={activeStage === null}
        data-active-stage={activeStage ?? undefined}
      >
        {activeStage !== null && (
          <h1 className="sr-only">
            {t("heroLead")} {t("heroSubject")}
          </h1>
        )}

        {activeStage === null && introduction}

        <GravityJourneyNavigation
          activeStage={activeStage}
          onSelectStage={selectStage}
          onReturnToJourney={returnToJourney}
        />

        {/* Los paneles siguen montados para conservar su estado. */}
        <div
          ref={viewportRef}
          className="lab-gravity-journey-viewport flex flex-col [flex:1] min-w-0 min-h-0 overflow-x-auto overflow-y-auto [overscroll-behavior-y:contain] [scrollbar-width:none] [scroll-behavior:auto] [scroll-padding-block:1rem] [padding:4px_8px_8px] [@media(max-width:1023px)]:block [@media(max-width:1023px)]:[flex:none] [@media(max-width:1023px)]:[overflow:visible] [&[hidden]]:[display:none] [&::-webkit-scrollbar]:[display:none]"
          hidden={activeStage === null}
        >
          {children}
        </div>
      </div>
    </JourneyContext.Provider>
  );
};
