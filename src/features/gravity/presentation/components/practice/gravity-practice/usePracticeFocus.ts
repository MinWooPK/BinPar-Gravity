"use client";

import { useEffect, useRef } from "react";

import type { PracticeView } from "../../../../types/practice/practice.types";

// Gestiona el foco y el desplazamiento cuando cambia
// la pregunta, aparece una corrección o termina la práctica.
export const usePracticeFocus = (view: PracticeView | null) => {
  const focusRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const heading = focusRef.current;

    // Evita enfocar elementos ocultos o no disponibles.
    if (
      !view ||
      !heading?.getClientRects().length ||
      heading.closest("[hidden],[inert]")
    ) {
      return;
    }

    // Anuncia el contenido nuevo sin desplazar el foco bruscamente.
    heading.focus({ preventScroll: true });

    heading.scrollIntoView({
      block: "nearest",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }, [view]);

  return focusRef;
};
