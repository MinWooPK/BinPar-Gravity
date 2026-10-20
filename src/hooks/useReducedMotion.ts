"use client";

import { useSyncExternalStore } from "react";

// Define la consulta para detectar si el usuario prefiere reducir las animaciones.
const query = "(prefers-reduced-motion: reduce)";

// Escucha los cambios en las preferencias de movimiento del dispositivo.
const subscribe = (onChange: () => void) => {
  // Obtiene la configuración de movimiento del navegador.
  const media = window.matchMedia(query);

  media.addEventListener("change", onChange);

  return () => media.removeEventListener("change", onChange);
};

// Comprueba si el usuario tiene activada la reducción de movimiento.
const getSnapshot = () => window.matchMedia(query).matches;

// Establece un valor inicial compatible con el servidor
// para evitar diferencias durante la hidratación de React.
const getServerSnapshot = () => true;

// Permite a los componentes conocer y reaccionar a la preferencia
// del usuario sobre la reducción de animaciones.
export const useReducedMotion = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
