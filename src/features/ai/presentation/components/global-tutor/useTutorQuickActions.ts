"use client";

import { useTranslations } from "next-intl";

import { useTutorEnvironment } from "../../providers/tutorEnvironment";
import type { TutorQuickAction } from "../tutor-chat/TutorChat";

// Genera las preguntas rápidas según la sección actual.
export const useTutorQuickActions = (): TutorQuickAction[] => {
  const t = useTranslations("Tutor");
  const { context, highlight } = useTutorEnvironment();

  const stage = context.stage;

  const actions: TutorQuickAction[] =
    context.kind === "gravity" && stage === "gravity-understanding"
      ? [
          // Comprende: preguntas sobre la fórmula.
          ...(["constant", "masses", "distance"] as const).map((term) => ({
            id: term,
            label: t(
              `formula${
                term === "constant"
                  ? "Constant"
                  : term === "masses"
                    ? "Masses"
                    : "Distance"
              }Question`,
            ),
            question: t(
              `formula${
                term === "constant"
                  ? "Constant"
                  : term === "masses"
                    ? "Masses"
                    : "Distance"
              }Question`,
            ),
            onSelect: () => highlight(term),
          })),
        ]
      : context.kind === "gravity" && stage === "gravity-laboratory"
        ? [
            // Experimenta: explicaciones y configuración.
            {
              id: "explain-experiment",
              label: t("explainExperiment"),
              question: t("experimentQuestion"),
              intent: "explain_experiment",
            },
            {
              id: "increase-mass",
              label: t("experimentMassQuestion"),
              question: t("experimentMassQuestion"),
              intent: "explain_experiment",
            },
            {
              id: "increase-distance",
              label: t("experimentDistanceQuestion"),
              question: t("experimentDistanceQuestion"),
              intent: "explain_experiment",
            },
            {
              id: "configure-experiment",
              label: t("experimentConfigureAction"),
              question: "",
              compose: true,
            },
          ]
        : [
            {
              id: "current",
              label: t("explainCurrent"),
              question: t(
                stage === "gravity-challenges"
                  ? "practiceHintQuestion"
                  : "currentQuestion",
              ),
            },
          ];

  return actions;
};
