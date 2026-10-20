"use client";

import type { Ref } from "react";
import { useFormatter, useTranslations } from "next-intl";
import {
  ArrowRight,
  Check,
  Lightbulb,
  Reset,
  Sparkles,
  X,
} from "@/components/icons";
import { GravityStageLink } from "../GravityJourneyTabs";
import type {
  PracticeView,
  Report,
} from "../../../types/practice/practice.types";
import { PracticeDisclosure } from "./PracticeDisclosure";
import { PracticeFeedback } from "./PracticeFeedback";
import { practiceStyles as styles } from "./Practice.styles";

// Muestra el informe final de la práctica con la puntuación,
// fortalezas, dificultades, recomendaciones e historial de respuestas.
export const PracticeReport = ({
  view,
  report,
  headingRef,
  pending,
  onRestart,
}: {
  view: PracticeView;
  report: Report;
  headingRef: Ref<HTMLHeadingElement>;
  pending: boolean;
  onRestart: () => void;
}) => {
  // Obtiene las traducciones y el formato numérico según el idioma.
  const t = useTranslations("Practice"),
    format = useFormatter();

  // Calcula la proporción de respuestas correctas.
  const ratio = view.count > 0 ? view.score / view.count : 0;

  // Convierte la proporción de aciertos en un porcentaje formateado.
  const percentage = format.number(ratio, {
    style: "percent",
    maximumFractionDigits: 0,
  });

  return (
    <div data-practice-report className={`${styles.appearance} mt-6 space-y-5`}>
      <div className="grid gap-5 rounded-2xl border border-violet-300/30 bg-violet-300/5 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6">
        <div className="min-w-0">
          <Sparkles className="mb-3 size-7 text-violet-200" />

          <h4
            ref={headingRef}
            tabIndex={-1}
            className={`${styles.focus} text-xl font-semibold text-slate-50 sm:text-2xl`}
          >
            {t("finished")}
          </h4>

          <p className="mt-2 flex items-center gap-2 text-sm text-slate-300">
            <Lightbulb className="size-4 shrink-0 text-teal-200" />
            {t("hintsUsed", { count: view.hints })}
          </p>
        </div>

        <div className="min-w-0 sm:min-w-40">
          <p
            data-practice-score
            className="text-3xl font-semibold tracking-tight text-violet-100 sm:text-4xl"
          >
            {t("scoreValue", { score: view.score, total: view.count })}
          </p>

          <p data-practice-percentage className="mt-1 text-sm text-slate-300">
            {t("percentage", { percentage })}
          </p>

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

      <section aria-label={t("summaryTitle")} className={styles.card}>
        <h5 className={`${styles.title} text-violet-100`}>
          {t("summaryTitle")}
        </h5>

        <p className={`${styles.prose} mt-3 text-slate-200`}>
          {report.summary}
        </p>
      </section>

      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <section
          aria-label={t("strengths")}
          className={`${styles.card} border-teal-300/20`}
        >
          <h5 className={`${styles.title} text-teal-100`}>
            <Check className="size-5 shrink-0" />
            {t("strengths")}
          </h5>

          {report.strengths.length > 0 ? (
            <ul
              className={`${styles.prose} mt-3 list-disc space-y-2 pl-5 marker:text-teal-300`}
            >
              {report.strengths.map((text, i) => (
                <li key={i}>{text}</li>
              ))}
            </ul>
          ) : (
            <p className={`${styles.prose} mt-3 text-slate-300`}>
              {t("noStrengths")}
            </p>
          )}
        </section>

        <section
          aria-label={t("review")}
          className={`${styles.card} border-amber-300/20`}
        >
          <h5 className={`${styles.title} text-amber-100`}>
            <Lightbulb className="size-5 shrink-0" />
            {t("review")}
          </h5>

          {report.review.length > 0 ? (
            <ul
              className={`${styles.prose} mt-3 list-disc space-y-2 pl-5 marker:text-amber-300`}
            >
              {report.review.map((text, i) => (
                <li key={i}>{text}</li>
              ))}
            </ul>
          ) : (
            <p className={`${styles.prose} mt-3 text-slate-300`}>
              {t("noReview")}
            </p>
          )}
        </section>
      </div>

      <section aria-label={t("recommendations")} className="space-y-3">
        <h5 className={`${styles.title} text-slate-50`}>
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
              className={`${styles.card} flex flex-col items-start gap-3`}
            >
              <p className={`${styles.prose} flex-1`}>{recommendation.text}</p>

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

      <PracticeDisclosure label={t("history")}>
        <ol data-practice-history className="space-y-3">
          {view.history.map((attempt, i) => {
            // Selecciona el icono según el resultado de cada pregunta.
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

      {view.feedback && (
        <PracticeDisclosure label={t("lastFeedback")}>
          <PracticeFeedback feedback={view.feedback} />
        </PracticeDisclosure>
      )}

      <div className="pt-1">
        <button
          type="button"
          data-practice-restart
          className={`${styles.primary} w-full sm:w-auto`}
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
