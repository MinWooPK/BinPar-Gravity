"use client";
import { useLayoutEffect } from "react";
import { useTutorEnvironment } from "@/features/ai/presentation/providers/tutorEnvironment";
import { useGravityFormulaInteraction } from "./GravityFormulaInteraction";

/** Retains deterministic educational highlights; the only chat lives in GlobalTutor. */
export const GravityFormulaTutor = () => {
  const { context, registerHighlight } = useTutorEnvironment();
  const { select, hover, focus } = useGravityFormulaInteraction();
  useLayoutEffect(() => {
    if (context.kind !== "gravity" || context.stage !== "gravity-understanding") return;
    return registerHighlight(term => { hover(null); focus(null); select(term); });
  }, [context.kind, context.stage, registerHighlight, select, hover, focus]);
  return null;
};
