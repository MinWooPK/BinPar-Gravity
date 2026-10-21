"use client";

import { useTranslations } from "next-intl";

import { Check, Lightbulb, X } from "@/components/icons";

import type { PracticeView } from "../../../../types/practice/practice.types";

import { PracticeDisclosure } from "../PracticeDisclosure";
import { PracticeFeedback } from "../PracticeFeedback";

type PracticeReportHistoryProps = {
  view: PracticeView;
};

// Muestra el historial de respuestas y la última corrección.
export const PracticeReportHistory = ({ view }: PracticeReportHistoryProps) => {
  const t = useTranslations("Practice");

  return (
    <>
      {/* Historial de las cinco preguntas. */}
      <PracticeDisclosure label={t("history")}>
        <ol data-practice-history className="space-y-3">
          {view.history.map((attempt, i) => {
            const ResultIcon = attempt.correct ? Check : X;

            return (
              <li
                key={i}
                className="flex items-start gap-3 rounded-lg bg-slate-800/40 p-3 text-sm"
              >
                <ResultIcon
                  className={`mt-0.5 size-5 shrink-0 ${
                    attempt.correct ? "text-teal-200" : "text-amber-200"
                  }`}
                />

                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-medium text-slate-100">
                    {i + 1}. {t(`concepts.${attempt.concept}`)}
                  </p>

                  <p
                    className={
                      attempt.correct ? "text-teal-100" : "text-amber-100"
                    }
                  >
                    {t(attempt.correct ? "correct" : "incorrect")}
                  </p>

                  {attempt.usedHint && (
                    <p className="flex items-center gap-1.5 text-slate-300">
                      <Lightbulb className="size-4 shrink-0" />
                      {t("hintUsed")}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </PracticeDisclosure>

      {/* Última explicación recibida durante la evaluación. */}
      {view.feedback && (
        <PracticeDisclosure label={t("lastFeedback")}>
          <PracticeFeedback feedback={view.feedback} />
        </PracticeDisclosure>
      )}
    </>
  );
};
