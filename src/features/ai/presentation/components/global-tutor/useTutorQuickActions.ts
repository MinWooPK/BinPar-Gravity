"use client";

import { useTranslations } from "next-intl";

import { useTutorEnvironment } from "../../providers/tutorEnvironment";
import type { TutorQuickAction } from "../tutor-chat/TutorChat";

// Prepara las preguntas rápidas del Tutor IA.
export const useTutorQuickActions = (): TutorQuickAction[] => {
  const traducir = useTranslations("Tutor");
  const { context, highlight } = useTutorEnvironment();

  const etapa = context.stage;

  // Preguntas sobre la fórmula.
  if (context.kind === "gravity" && etapa === "gravity-understanding") {
    const preguntas = [
      { id: "constant", clave: "formulaConstantQuestion" },
      { id: "masses", clave: "formulaMassesQuestion" },
      { id: "distance", clave: "formulaDistanceQuestion" },
    ] as const;

    return preguntas.map(({ id, clave }) => {
      const pregunta = traducir(clave);

      return {
        id,
        label: pregunta,
        question: pregunta,
        onSelect: () => highlight(id),
      };
    });
  }

  // Preguntas sobre el experimento.
  if (context.kind === "gravity" && etapa === "gravity-laboratory") {
    return [
      {
        id: "explain-experiment",
        label: traducir("explainExperiment"),
        question: traducir("experimentQuestion"),
        intent: "explain_experiment",
      },
      {
        id: "increase-mass",
        label: traducir("experimentMassQuestion"),
        question: traducir("experimentMassQuestion"),
        intent: "explain_experiment",
      },
      {
        id: "increase-distance",
        label: traducir("experimentDistanceQuestion"),
        question: traducir("experimentDistanceQuestion"),
        intent: "explain_experiment",
      },
      {
        id: "configure-experiment",
        label: traducir("experimentConfigureAction"),
        question: "",
        compose: true,
      },
    ];
  }

  // Pregunta general para las demás etapas.
  return [
    {
      id: "current",
      label: traducir("explainCurrent"),
      question: traducir(
        etapa === "gravity-challenges"
          ? "practiceHintQuestion"
          : "currentQuestion",
      ),
    },
  ];
};
