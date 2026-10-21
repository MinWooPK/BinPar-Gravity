"use client";

import type { Ref } from "react";
import { useTranslations } from "next-intl";

import { ArrowRight, Reset } from "@/components/icons";
import { GravityStageLink } from "../../GravityJourneyTabs";

import type {
  PracticeView,
  Report,
} from "../../../../types/practice/practice.types";

import { PracticeReportScore } from "./PracticeReportScore";
import { PracticeReportReview } from "./PracticeReportReview";
import { PracticeReportHistory } from "./PracticeReportHistory";

type PracticeReportProps = {
  view: PracticeView;
  report: Report;
  headingRef: Ref<HTMLHeadingElement>;
  pending: boolean;
  onRestart: () => void;
};

// Muestra el informe final de la práctica.
export const PracticeReport = ({
  view,
  report,
  headingRef,
  pending,
  onRestart,
}: PracticeReportProps) => {
  const t = useTranslations("Practice");

  return (
    <div
      data-practice-report
      className="mt-6 space-y-5 animate-[lab-gravity-practice-appear_220ms_ease-out] motion-reduce:animate-none"
    >
      {/* Puntuación final. */}
      <PracticeReportScore view={view} headingRef={headingRef} />

      {/* Resumen del aprendizaje. */}
      <section
        aria-label={t("summaryTitle")}
        className="min-w-0 rounded-2xl border border-slate-600/50 bg-slate-900/45 p-4 sm:p-5"
      >
        <h5 className="flex items-center gap-2 text-base font-semibold text-violet-100">
          {t("summaryTitle")}
        </h5>

        <p className="mt-3 max-w-prose whitespace-pre-wrap text-sm leading-7 text-slate-200 wrap-anywhere">
          {report.summary}
        </p>
      </section>

      {/* Fortalezas y aspectos por mejorar. */}
      <PracticeReportReview
        strengths={report.strengths}
        review={report.review}
      />

      {/* Recomendaciones de aprendizaje. */}
      <section aria-label={t("recommendations")} className="space-y-3">
        <h5 className="flex items-center gap-2 text-base font-semibold text-slate-50">
          {t("recommendations")}
        </h5>

        <div
          className={`grid min-w-0 gap-3 md:grid-cols-2 ${
            report.recommendations.length > 2 ? "lg:grid-cols-3" : ""
          }`}
        >
          {report.recommendations.map((recommendation, i) => (
            <div
              key={i}
              className="flex min-w-0 flex-col items-start gap-3 rounded-2xl border border-slate-600/50 bg-slate-900/45 p-4 sm:p-5"
            >
              <p className="max-w-prose flex-1 whitespace-pre-wrap text-sm leading-7 wrap-anywhere">
                {recommendation.text}
              </p>

              <GravityStageLink
                stageId={recommendation.stage}
                className="inline-flex min-h-11 scroll-mb-24 items-center gap-2 rounded-lg py-2 text-sm font-semibold
                 text-violet-200 hover:text-violet-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300"
              >
                {t(`stages.${recommendation.stage}`)}

                <ArrowRight className="size-4 shrink-0" />
              </GravityStageLink>
            </div>
          ))}
        </div>
      </section>

      {/* Historial de respuestas. */}
      <PracticeReportHistory view={view} />

      {/* Reinicia la evaluación. */}
      <div className="pt-1">
        <button
          type="button"
          data-practice-restart
          disabled={pending}
          onClick={onRestart}
          className="inline-flex min-h-11 w-full scroll-mb-24 items-center justify-center gap-2 rounded-xl border
           border-violet-300 bg-violet-300 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors enabled:cursor-pointer
            enabled:hover:bg-violet-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200 
            disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none sm:w-auto"
        >
          <Reset className="size-4 shrink-0" />

          {t(pending ? "loading" : "restart")}
        </button>
      </div>
    </div>
  );
};
