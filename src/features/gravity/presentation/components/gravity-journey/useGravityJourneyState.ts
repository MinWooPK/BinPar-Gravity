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

// Controla las etapas, la URL, el scroll y el foco.
export const useGravityJourneyState = () => {
  const [activeStage, setActiveStage] = useState<GravityStageId | null>(null);

  const activeStageRef = useRef<GravityStageId | null>(null);
  const lastStage = useRef<GravityStageId>("gravity-discovery");

  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollPositions = useRef<
    Partial<Record<GravityStageId, ScrollPosition>>
  >({});

  const focusOnChange = useRef(false);

  // Cambia de etapa y guarda su posición anterior.
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

  // Selecciona una etapa y actualiza la URL.
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

  // Vuelve a la introducción.
  const returnToJourney = useCallback(() => {
    window.history.pushState(
      null,
      "",
      window.location.pathname + window.location.search,
    );

    activateStage(null, true);
  }, [activateStage]);

  // Sincroniza las etapas con la URL.
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

  // Restaura el scroll y el foco al cambiar de etapa.
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
