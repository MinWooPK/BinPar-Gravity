"use client";

import type { Ref } from "react";
import { useFormatter, useTranslations } from "next-intl";

import { Lightbulb, Sparkles } from "@/components/icons";

import type { PracticeView } from "../../../../types/practice/practice.types";

type PracticeReportScoreProps = {
  view: PracticeView;
  headingRef: Ref<HTMLHeadingElement>;
};

// Muestra la puntuación y el porcentaje de aciertos.
export const PracticeReportScore = ({
  view,
  headingRef,
}: PracticeReportScoreProps) => {
  const t = useTranslations("Practice");
  const format = useFormatter();

  // Calcula el porcentaje de aciertos.
  const ratio = view.count > 0 ? view.score / view.count : 0;

  const percentage = format.number(ratio, {
    style: "percent",
    maximumFractionDigits: 0,
  });

  return (
    <div className="grid gap-5 rounded-2xl border border-violet-300/30 bg-violet-300/5 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6">
      <div className="min-w-0">
        <Sparkles className="mb-3 size-7 text-violet-200" />

        <h4
          ref={headingRef}
          tabIndex={-1}
          className="scroll-mt-6 rounded-md text-xl font-semibold text-slate-50 focus-visible:outline-2 focus-visible:outline-offset-4
           focus-visible:outline-violet-300 sm:text-2xl"
        >
          {t("finished")}
        </h4>

        <p className="mt-2 flex items-center gap-2 text-sm text-slate-300">
          <Lightbulb className="size-4 shrink-0 text-teal-200" />
          {t("hintsUsed", { count: view.hints })}
        </p>
      </div>

      <div className="min-w-0 sm:min-w-40">
        {/* Puntuación final. */}
        <p
          data-practice-score
          className="text-3xl font-semibold tracking-tight text-violet-100 sm:text-4xl"
        >
          {t("scoreValue", {
            score: view.score,
            total: view.count,
          })}
        </p>

        {/* Porcentaje de aciertos. */}
        <p data-practice-percentage className="mt-1 text-sm text-slate-300">
          {t("percentage", { percentage })}
        </p>

        {/* Barra visual de resultados. */}
        <div
          role="progressbar"
          aria-label={t("scoreValue", {
            score: view.score,
            total: view.count,
          })}
          aria-valuemin={0}
          aria-valuemax={view.count}
          aria-valuenow={view.score}
          className="mt-3 flex gap-1.5"
        >
          {view.history.map((attempt, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`h-2 flex-1 rounded-full ${
                attempt.correct ? "bg-teal-300" : "bg-slate-500"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
