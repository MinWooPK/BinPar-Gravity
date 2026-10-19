"use client";

import { useTranslations } from "next-intl";
import { InlineTutor, type InlineTutorPresentation } from "@/features/ai/presentation/components/InlineTutor";
import type { TutorQuickAction } from "@/features/ai/presentation/components/TutorChat";
import type { FormulaTerm } from "../../../types/formula.types";
import { useGravityFormulaInteraction } from "./GravityFormulaInteraction";

export const GravityFormulaTutor = (presentation: InlineTutorPresentation) => {
  const t = useTranslations("Tutor");
  const { select, hover, focus } = useGravityFormulaInteraction();
  const highlight = (term: FormulaTerm | null) => () => { hover(null); focus(null); select(term); };
  const actions: readonly TutorQuickAction[] = [
    { id: "formula", label: t("explainFormula"), question: t("formulaQuestion"), intent: "explain_formula", onSelect: highlight(null) },
    { id: "constant", label: t("formulaConstantQuestion"), question: t("formulaConstantQuestion"), onSelect: highlight("constant") },
    { id: "masses", label: t("formulaMassesQuestion"), question: t("formulaMassesQuestion"), onSelect: highlight("masses") },
    { id: "distance", label: t("formulaDistanceQuestion"), question: t("formulaDistanceQuestion"), onSelect: highlight("distance") },
    { id: "simplify", label: t("simplify"), question: t("simplify"), mode: "simplify" },
    { id: "example", label: t("example"), question: t("example"), mode: "example" },
  ];
  return <InlineTutor {...presentation} sessionId="gravity-understanding" actions={actions} />;
};
