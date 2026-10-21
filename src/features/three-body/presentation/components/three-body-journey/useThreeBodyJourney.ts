"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { useGalleryState } from "../../providers/GalleryProvider";
import { getThreeBodyStage } from "../../../application/journey";
import type { ThreeBodyStageId } from "../../../types/journey.types";

// Gestiona la navegación, el scroll y el foco de las etapas.
export const useThreeBodyJourney = () => {
  const { update } = useGalleryState();

  const [activeStage, setActiveStage] = useState<ThreeBodyStageId | null>(null);
  const [leaving, setLeaving] = useState(false);

  const activeRef = useRef<ThreeBodyStageId | null>(null);
  const requestedRef = useRef<ThreeBodyStageId | null>(null);
  const lastStage = useRef<ThreeBodyStageId>("discover");
  const discoveryScroll = useRef(0);
  const focusOnChange = useRef(false);
  const transition = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Activa una etapa y aplica la transición.
  const activateStage = useCallback(
    (next: ThreeBodyStageId | null, moveFocus: boolean, animate = true) => {
      if (next === requestedRef.current) return;

      if (transition.current) clearTimeout(transition.current);

      requestedRef.current = next;

      const previous = activeRef.current;

      if (next === previous) {
        setLeaving(false);
        return;
      }

      // Guarda el scroll de la etapa anterior.
      if (previous === "gallery") {
        update({ scroll: window.scrollY });
      }

      if (previous === "discover") {
        discoveryScroll.current = window.scrollY;
      }

      if (previous) lastStage.current = previous;

      // Confirma el cambio de etapa.
      const commit = () => {
        transition.current = null;
        activeRef.current = next;
        focusOnChange.current = moveFocus;
        setActiveStage(next);
        setLeaving(false);
      };

      if (
        !animate ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        commit();
      } else {
        setLeaving(true);
        transition.current = setTimeout(commit, 100);
      }
    },
    [update],
  );

  // Selecciona una etapa y actualiza la URL.
  const selectStage = useCallback(
    (next: ThreeBodyStageId, focusPanel = false) => {
      if (next === requestedRef.current) return;

      window.history.pushState(window.history.state, "", `#${next}`);

      activateStage(next, focusPanel || activeRef.current === null);
    },
    [activateStage],
  );

  // Regresa a la pantalla de bienvenida.
  const returnToJourney = useCallback(() => {
    window.history.pushState(
      window.history.state,
      "",
      window.location.pathname + window.location.search,
    );

    activateStage(null, true);
  }, [activateStage]);

  // Sincroniza las etapas con el historial del navegador.
  useEffect(() => {
    const syncHash = (moveFocus: boolean, animate = true) =>
      activateStage(
        getThreeBodyStage(window.location.hash),
        moveFocus,
        animate,
      );

    const frame = requestAnimationFrame(() => syncHash(false, false));
    const onHistoryChange = () => syncHash(true);

    window.addEventListener("hashchange", onHistoryChange);
    window.addEventListener("popstate", onHistoryChange);

    return () => {
      cancelAnimationFrame(frame);

      if (transition.current) clearTimeout(transition.current);

      window.removeEventListener("hashchange", onHistoryChange);
      window.removeEventListener("popstate", onHistoryChange);
    };
  }, [activateStage]);

  // Restaura el scroll y el foco tras cambiar de etapa.
  useLayoutEffect(() => {
    if (activeStage !== "gallery") {
      window.scrollTo({
        top: activeStage === "discover" ? discoveryScroll.current : 0,
        behavior: "instant",
      });
    }

    if (focusOnChange.current) {
      const target = activeStage
        ? `three-body-${activeStage}`
        : `three-body-${lastStage.current}-entry`;

      document.getElementById(target)?.focus({ preventScroll: true });
      focusOnChange.current = false;
    }
  }, [activeStage]);

  return { activeStage, leaving, selectStage, returnToJourney };
};
