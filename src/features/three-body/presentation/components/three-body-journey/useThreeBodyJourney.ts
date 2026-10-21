"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useGalleryState } from "../../providers/GalleryProvider";
import { getThreeBodyStage } from "../../../application/journey";
import type { ThreeBodyStageId } from "../../../types/journey.types";

// Conserva el estado de navegación, los fragmentos URL, el scroll y el foco.
export const useThreeBodyJourney = () => {
  // Obtiene la función para actualizar el estado compartido de la galería.
  const { update } = useGalleryState();

  // Guarda la etapa activa; null representa la pantalla de bienvenida.
  const [activeStage, setActiveStage] = useState<ThreeBodyStageId | null>(null);

  // Controla la transición visual al abandonar una etapa.
  const [leaving, setLeaving] = useState(false);

  // Mantiene una referencia de la etapa que está visible.
  const activeRef = useRef<ThreeBodyStageId | null>(null);

  // Guarda la última etapa solicitada para evitar navegaciones repetidas.
  const requestedRef = useRef<ThreeBodyStageId | null>(null);

  // Recuerda la última etapa visitada para facilitar el regreso.
  const lastStage = useRef<ThreeBodyStageId>("discover");

  // Conserva la posición de desplazamiento de la etapa Descubre.
  const discoveryScroll = useRef(0);

  // Indica si debe trasladarse el foco al cambiar de etapa.
  const focusOnChange = useRef(false);

  // Guarda el temporizador utilizado para las transiciones.
  const transition = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Activa una etapa, conserva el desplazamiento anterior
  // y aplica una transición visual cuando corresponde.
  const activateStage = useCallback(
    (next: ThreeBodyStageId | null, moveFocus: boolean, animate = true) => {
      if (next === requestedRef.current) return;

      if (transition.current) clearTimeout(transition.current);

      requestedRef.current = next;

      // Obtiene la etapa que estaba visible anteriormente.
      const previous = activeRef.current;

      if (next === previous) {
        setLeaving(false);
        return;
      }

      // Guarda la posición de la galería antes de abandonarla.
      if (previous === "gallery") update({ scroll: window.scrollY });

      // Guarda la posición de desplazamiento de la etapa Descubre.
      if (previous === "discover") discoveryScroll.current = window.scrollY;

      if (previous) lastStage.current = previous;

      // Confirma el cambio de etapa y actualiza su estado.
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
      )
        commit();
      else {
        setLeaving(true);
        transition.current = setTimeout(commit, 100);
      }
    },
    [update],
  );

  // Permite seleccionar una etapa y actualiza el fragmento de la URL.
  const selectStage = useCallback(
    (next: ThreeBodyStageId, focusPanel = false) => {
      if (next === requestedRef.current) return;

      window.history.pushState(window.history.state, "", `#${next}`);

      activateStage(next, focusPanel || activeRef.current === null);
    },
    [activateStage],
  );

  // Regresa a la pantalla principal del recorrido educativo.
  const returnToJourney = useCallback(() => {
    window.history.pushState(
      window.history.state,
      "",
      window.location.pathname + window.location.search,
    );

    activateStage(null, true);
  }, [activateStage]);

  // Sincroniza la etapa seleccionada con la URL
  // y con los botones Atrás y Adelante del navegador.
  useEffect(() => {
    // Identifica y activa la etapa indicada en el fragmento de la URL.
    const syncHash = (moveFocus: boolean, animate = true) =>
      activateStage(
        getThreeBodyStage(window.location.hash),
        moveFocus,
        animate,
      );

    // Sincroniza la etapa inicial después del primer renderizado.
    const frame = requestAnimationFrame(() => syncHash(false, false));

    // Actualiza la navegación cuando cambia el historial.
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

  // Restaura el desplazamiento y el foco cuando cambia la etapa visible.
  useLayoutEffect(() => {
    if (activeStage !== "gallery")
      window.scrollTo({
        top: activeStage === "discover" ? discoveryScroll.current : 0,
        behavior: "instant",
      });

    if (focusOnChange.current) {
      // Identifica el elemento que debe recibir el foco.
      const target = activeStage
        ? `three-body-${activeStage}`
        : `three-body-${lastStage.current}-entry`;

      document.getElementById(target)?.focus({ preventScroll: true });

      focusOnChange.current = false;
    }
  }, [activeStage]);

  return { activeStage, leaving, selectStage, returnToJourney };
};
