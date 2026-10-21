"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import type { KeyboardEvent } from "react";

// Gestiona la apertura, el cierre y la navegación del menú.
export const useStageSelectorMenu = (
  optionsLength: number,
  activeIndex: number,
) => {
  const menuId = useId();
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const openingIndex = useRef(0);

  // Cierra el menú y devuelve el foco al botón.
  const closeMenu = () => {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  // Enfoca la opción correspondiente al abrir el menú.
  useLayoutEffect(() => {
    if (!open) return;

    const option = optionRefs.current[openingIndex.current];

    option?.focus({ preventScroll: true });
    option?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "instant",
    });
  }, [open]);

  // Cierra el menú al pulsar o mover el foco fuera.
  useEffect(() => {
    if (!open) return;

    const closeOutside = (event: Event) => {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("focusin", closeOutside);

    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("focusin", closeOutside);
    };
  }, [open]);

  // Permite navegar por las opciones utilizando el teclado.
  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = optionRefs.current.indexOf(
      document.activeElement as HTMLButtonElement,
    );

    let next: number;

    switch (event.key) {
      case "ArrowDown":
        next = (current + 1) % optionsLength;
        break;

      case "ArrowUp":
        next = (current - 1 + optionsLength) % optionsLength;
        break;

      case "Home":
        next = 0;
        break;

      case "End":
        next = optionsLength - 1;
        break;

      case "Tab":
        closeMenu();
        return;

      default:
        return;
    }

    event.preventDefault();
    optionRefs.current[next]?.focus();
  };

  // Abre o cierra el menú desde el botón principal.
  const handleTriggerClick = () => {
    openingIndex.current = activeIndex;
    setOpen(!open);
  };

  // Permite abrir el menú con las flechas.
  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();

      openingIndex.current = event.key === "ArrowDown" ? 0 : optionsLength - 1;

      setOpen(true);
    }
  };

  // Cierra el menú con Escape.
  const handleContainerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      closeMenu();
    }
  };

  return {
    menuId,
    open,
    containerRef,
    triggerRef,
    optionRefs,
    closeMenu,
    handleMenuKeyDown,
    handleTriggerClick,
    handleTriggerKeyDown,
    handleContainerKeyDown,
  };
};
