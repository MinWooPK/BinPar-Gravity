"use client";

import { useLayoutEffect } from "react";
import { useTutorEnvironment } from "@/features/ai/presentation/providers/tutorEnvironment";
import { useGravityFormulaInteraction } from "./GravityFormulaInteraction";

// Conecta el Tutor IA con la fórmula educativa de la etapa 02 · Comprende,
// permitiendo resaltar las variables que el tutor indique.
export const GravityFormulaTutor = () => {
  // Obtiene el contexto actual del Tutor IA y la función para registrar resaltados.
  const { context, registerHighlight } = useTutorEnvironment();

  // Obtiene las funciones para seleccionar y resaltar elementos de la fórmula.
  const { select, hover, focus } = useGravityFormulaInteraction();

  // Registra la función de resaltado cuando el usuario está
  // en la etapa Comprende y la desregistra al salir.
  useLayoutEffect(() => {
    if (context.kind !== "gravity" || context.stage !== "gravity-understanding")
      return;

    return registerHighlight((term) => {
      hover(null);
      focus(null);
      select(term);
    });
  }, [context.kind, context.stage, registerHighlight, select, hover, focus]);

  return null;
};
