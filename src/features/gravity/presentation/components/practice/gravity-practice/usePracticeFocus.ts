"use client";

import { useEffect, useRef } from "react";

import type { PracticeView } from "../../../../types/practice/practice.types";

// Controla el foco al cambiar el contenido de la práctica.
export const usePracticeFocus = (view: PracticeView | null) => {
  const focusRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const heading = focusRef.current;

    // Evita enfocar elementos ocultos.
    if (
      !view ||
      !heading?.getClientRects().length ||
      heading.closest("[hidden],[inert]")
    ) {
      return;
    }

    // Enfoca y desplaza hasta el contenido nuevo.
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
