"use client";

import { MessageSquareText } from "@/components/icons";

import { useTranslations } from "next-intl";
import { useTutorActions } from "@/features/ai/presentation/providers/tutorEnvironment";

// Muestra un botón para abrir el Tutor IA y solicitar
// una explicación de la fórmula gravitatoria.
export const GravityFormulaTutorButton = () => {
  // Obtiene las traducciones del Tutor IA.
  const t = useTranslations("Tutor");

  // Obtiene la función que permite abrir el Tutor IA global.
  const { openTutor } = useTutorActions();

  return (
    <button
      type="button"
      data-explain-formula
      aria-controls="global-tutor-dialog"
      onClick={(event) => openTutor("explain_formula", event.currentTarget)}
      className="inline-flex min-h-11 max-w-full items-center justify-center gap-2 self-start rounded-xl border border-violet-400/50 bg-violet-400/10 px-3 py-2 text-sm font-semibold text-violet-200 transition-colors hover:bg-violet-400/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 motion-reduce:transition-none"
    >
      <MessageSquareText className="size-4 shrink-0" />
      {t("explainFormula")}
    </button>
  );
};
