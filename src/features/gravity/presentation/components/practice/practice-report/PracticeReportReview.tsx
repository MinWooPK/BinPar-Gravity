"use client";

import { useTranslations } from "next-intl";

import { Check, Lightbulb } from "@/components/icons";

import type { Report } from "../../../../types/practice/practice.types";


type PracticeReportReviewProps = Pick<Report, "strengths" | "review">;

// Muestra las fortalezas y los conceptos que deben repasarse.
export const PracticeReportReview = ({
  strengths,
  review,
}: PracticeReportReviewProps) => {
  const t = useTranslations("Practice");

  return (
    <div className="grid min-w-0 gap-4 md:grid-cols-2">
      {/* Fortalezas identificadas en la evaluación. */}
      <section
        aria-label={t("strengths")}
        className="min-w-0 rounded-2xl border border-slate-600/50 bg-slate-900/45 p-4 sm:p-5 border-teal-300/20"
      >
        <h5 className="flex items-center gap-2 text-base font-semibold text-teal-100">
          <Check className="size-5 shrink-0" />
          {t("strengths")}
        </h5>

        {strengths.length > 0 ? (
          <ul
            className="max-w-prose whitespace-pre-wrap text-sm leading-7 [overflow-wrap:anywhere] mt-3 list-disc space-y-2 pl-5 marker:text-teal-300"
          >
            {strengths.map((text, i) => (
              <li key={i}>{text}</li>
            ))}
          </ul>
        ) : (
          <p className="max-w-prose whitespace-pre-wrap text-sm leading-7 [overflow-wrap:anywhere] mt-3 text-slate-300">
            {t("noStrengths")}
          </p>
        )}
      </section>

      {/* Conceptos que necesitan refuerzo. */}
      <section
        aria-label={t("review")}
        className="min-w-0 rounded-2xl border border-slate-600/50 bg-slate-900/45 p-4 sm:p-5 border-amber-300/20"
      >
        <h5 className="flex items-center gap-2 text-base font-semibold text-amber-100">
          <Lightbulb className="size-5 shrink-0" />
          {t("review")}
        </h5>

        {review.length > 0 ? (
          <ul
            className="max-w-prose whitespace-pre-wrap text-sm leading-7 [overflow-wrap:anywhere] mt-3 list-disc space-y-2 pl-5 marker:text-amber-300"
          >
            {review.map((text, i) => (
              <li key={i}>{text}</li>
            ))}
          </ul>
        ) : (
          <p className="max-w-prose whitespace-pre-wrap text-sm leading-7 [overflow-wrap:anywhere] mt-3 text-slate-300">
            {t("noReview")}
          </p>
        )}
      </section>
    </div>
  );
};
