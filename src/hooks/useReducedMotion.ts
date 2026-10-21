"use client";

import { useSyncExternalStore } from "react";

// Detecta si el usuario prefiere reducir las animaciones.
const query = "(prefers-reduced-motion: reduce)";

// Escucha los cambios de preferencia.
const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(query);

  media.addEventListener("change", onChange);

  return () => media.removeEventListener("change", onChange);
};

// Consulta la preferencia del navegador.
const getSnapshot = () => window.matchMedia(query).matches;

// Valor inicial para el servidor.
const getServerSnapshot = () => true;

// Devuelve la preferencia de movimiento del usuario.
export const useReducedMotion = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
