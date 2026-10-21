"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { gravityStages } from "../../../application/gravityJourney";
import type { GravityStageId } from "../../../types/journey.types";

type ScrollPosition = {
  viewport: number;
  document: number;
};

// Gestiona la etapa activa, la URL, el desplazamiento y el foco.
export const useGravityJourneyState = () => {
  // Guarda la etapa que está seleccionada.
  const [activeStage, setActiveStage] = useState<GravityStageId | null>(null);

  // Mantiene la etapa actual accesible desde las funciones de navegación.
  const activeStageRef = useRef<GravityStageId | null>(null);

  // Recuerda la última etapa para restaurar el foco al volver al recorrido.
  const lastStage = useRef<GravityStageId>("gravity-discovery");

  // Guarda el contenedor y las posiciones de desplazamiento de cada etapa.
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollPositions = useRef<Partial<Record<GravityStageId, ScrollPosition>>>({});

  // Indica si el próximo cambio de etapa debe mover el foco.
  const focusOnChange = useRef(false);

  // Cambia de etapa y conserva la posición de la anterior.
  const activateStage = useCallback(
    (stage: GravityStageId | null, moveFocus: boolean) => {
      const previous = activeStageRef.current;
      if (stage === previous) return;

      if (previous) {
        scrollPositions.current[previous] = {
          viewport: viewportRef.current?.scrollTop ?? 0,
          document: window.scrollY,
        };
        lastStage.current = previous;
      }

      activeStageRef.current = stage;
      focusOnChange.current = moveFocus;
      setActiveStage(stage);
    },
    [],
  );

  // Selecciona una etapa y actualiza el fragmento de la URL.
  const selectStage = useCallback(
    (stage: GravityStageId, focusPanel = false) => {
      if (stage === activeStageRef.current) {
        if (focusPanel) {
          document.getElementById(stage)?.focus({ preventScroll: true });
        }
        return;
      }

      window.history.pushState(null, "", `#${stage}`);
      activateStage(stage, focusPanel || activeStageRef.current === null);
    },
    [activateStage],
  );

  // Regresa al recorrido inicial sin perder los parámetros de la URL.
  const returnToJourney = useCallback(() => {
    window.history.pushState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    activateStage(null, true);
  }, [activateStage]);

  // Sincroniza la selección con la URL y los botones atrás/adelante.
  useEffect(() => {
    const syncHash = (moveFocus: boolean) => {
      const stage = gravityStages.find(
        ({ id }) => id === window.location.hash.slice(1),
      );
      activateStage(stage?.id ?? null, moveFocus);
    };

    const onHistoryChange = () => syncHash(true);
    const frame = requestAnimationFrame(() => syncHash(false));

    window.addEventListener("hashchange", onHistoryChange);
    window.addEventListener("popstate", onHistoryChange);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", onHistoryChange);
      window.removeEventListener("popstate", onHistoryChange);
    };
  }, [activateStage]);

  // Restaura el scroll y el foco después de mostrar la nueva etapa.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const position = activeStage
      ? scrollPositions.current[activeStage]
      : undefined;

    if (viewport) {
      viewport.scrollTop = position?.viewport ?? 0;

      if (getComputedStyle(viewport).overflowY === "visible") {
        window.scrollTo({
          top: position?.document ?? 0,
          behavior: "instant",
        });
      }
    }

    if (focusOnChange.current) {
      const target = activeStage ?? `${lastStage.current}-entry`;
      document.getElementById(target)?.focus({ preventScroll: true });
      focusOnChange.current = false;
    }
  }, [activeStage]);

  return {
    activeStage,
    viewportRef,
    selectStage,
    returnToJourney,
  };
};
