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

// Coordina las diferentes secciones del informe final.
export const PracticeReport = ({
  view,
  report,
  headingRef,
  pending,
  onRestart,
}: PracticeReportProps) => {
  const t = useTranslations("Practice");

  return (
    <div data-practice-report className="[animation:lab-gravity-practice-appear_220ms_ease-out] motion-reduce:animate-none mt-6 space-y-5">
      {/* Puntuación y porcentaje de aciertos. */}
      <PracticeReportScore view={view} headingRef={headingRef} />

      {/* Resumen general del aprendizaje. */}
      <section aria-label={t("summaryTitle")} className="min-w-0 rounded-2xl border border-slate-600/50 bg-slate-900/45 p-4 sm:p-5">
        <h5 className="flex items-center gap-2 text-base font-semibold text-violet-100">
          {t("summaryTitle")}
        </h5>

        <p className="max-w-prose whitespace-pre-wrap text-sm leading-7 [overflow-wrap:anywhere] mt-3 text-slate-200">
          {report.summary}
        </p>
      </section>

      {/* Fortalezas y conceptos pendientes de repasar. */}
      <PracticeReportReview
        strengths={report.strengths}
        review={report.review}
      />

      {/* Recomendaciones para continuar aprendiendo. */}
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
              className="min-w-0 rounded-2xl border border-slate-600/50 bg-slate-900/45 p-4 sm:p-5 flex flex-col items-start gap-3"
            >
              <p className="max-w-prose whitespace-pre-wrap text-sm leading-7 [overflow-wrap:anywhere] flex-1">{recommendation.text}</p>

              <GravityStageLink
                stageId={recommendation.stage}
                className="inline-flex min-h-11 scroll-mb-24 items-center gap-2 rounded-lg py-2 text-sm font-semibold text-violet-200 hover:text-violet-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300"
              >
                {t(`stages.${recommendation.stage}`)}

                <ArrowRight className="size-4 shrink-0" />
              </GravityStageLink>
            </div>
          ))}
        </div>
      </section>

      {/* Historial y última corrección de la práctica. */}
      <PracticeReportHistory view={view} />

      {/* Reinicia la evaluación. */}
      <div className="pt-1">
        <button
          type="button"
          data-practice-restart
          className="inline-flex min-h-11 scroll-mb-24 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none border border-violet-300 bg-violet-300 text-slate-950 enabled:cursor-pointer enabled:hover:bg-violet-200 w-full sm:w-auto"
          disabled={pending}
          onClick={onRestart}
        >
          <Reset className="size-4 shrink-0" />

          {t(pending ? "loading" : "restart")}
        </button>
      </div>
    </div>
  );
};
