"use client";

import { useTranslations } from "next-intl";

import { Check, Lightbulb } from "@/components/icons";

import type { Report } from "../../../../types/practice/practice.types";

type PracticeReportReviewProps = Pick<Report, "strengths" | "review">;

// Muestra las fortalezas y los conceptos por repasar.
export const PracticeReportReview = ({
  strengths,
  review,
}: PracticeReportReviewProps) => {
  const t = useTranslations("Practice");

  return (
    <div className="grid min-w-0 gap-4 md:grid-cols-2">
      {/* Fortalezas. */}
      <section
        aria-label={t("strengths")}
        className="min-w-0 rounded-2xl border border-teal-300/20 bg-slate-900/45 p-4 sm:p-5"
      >
        <h5 className="flex items-center gap-2 text-base font-semibold text-teal-100">
          <Check className="size-5 shrink-0" />
          {t("strengths")}
        </h5>

        {strengths.length > 0 ? (
          <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5 text-sm leading-7 whitespace-pre-wrap wrap-anywhere marker:text-teal-300">
            {strengths.map((text, i) => (
              <li key={i}>{text}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 max-w-prose text-sm leading-7 whitespace-pre-wrap text-slate-300 wrap-anywhere">
            {t("noStrengths")}
          </p>
        )}
      </section>

      {/* Conceptos por repasar. */}
      <section
        aria-label={t("review")}
        className="min-w-0 rounded-2xl border border-amber-300/20 bg-slate-900/45 p-4 sm:p-5"
      >
        <h5 className="flex items-center gap-2 text-base font-semibold text-amber-100">
          <Lightbulb className="size-5 shrink-0" />
          {t("review")}
        </h5>

        {review.length > 0 ? (
          <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5 text-sm leading-7 whitespace-pre-wrap wrap-anywhere marker:text-amber-300">
            {review.map((text, i) => (
              <li key={i}>{text}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 max-w-prose text-sm leading-7 whitespace-pre-wrap text-slate-300 wrap-anywhere">
            {t("noReview")}
          </p>
        )}
      </section>
    </div>
  );
};
