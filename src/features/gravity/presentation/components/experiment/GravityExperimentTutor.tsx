"use client";

import { useTranslations } from "next-intl";
import { InlineTutor } from "@/features/ai/presentation/components/InlineTutor";
import type { TutorQuickAction } from "@/features/ai/presentation/components/TutorChat";
import { useGravityParameters } from "../../providers/GravityParametersProvider";

/** The chat observes the same laboratory state as the controls and simulation. */
export const GravityExperimentTutor = () => {
  const t = useTranslations("Tutor");
  const { parameters } = useGravityParameters();
  const actions: readonly TutorQuickAction[] = [
    { id: "explain-experiment", label: t("explainExperiment"), question: t("experimentQuestion"), intent: "explain_experiment" },
    { id: "increase-mass", label: t("experimentMassQuestion"), question: t("experimentMassQuestion"), intent: "explain_experiment" },
    { id: "increase-distance", label: t("experimentDistanceQuestion"), question: t("experimentDistanceQuestion"), intent: "explain_experiment" },
    { id: "configure-experiment", label: t("experimentConfigureAction"), question: "", compose: true },
    { id: "simplify", label: t("simplify"), question: t("simplify"), mode: "simplify" },
    { id: "example", label: t("example"), question: t("example"), mode: "example" },
  ];
  return <InlineTutor sessionId="gravity-laboratory" title={t("experimentTutorTitle")} actions={actions}
    context={{ kind: "gravity", stage: "gravity-laboratory", parameters }}
    contextChangedMessage={t("experimentContextChanged")} />;
};
