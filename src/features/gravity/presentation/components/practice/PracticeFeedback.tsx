"use client";

import type { Ref } from "react";
import { useFormatter, useTranslations } from "next-intl";

import { AlertTriangle, Check } from "@/components/icons";

import type { Feedback } from "../../../types/practice/practice.types";

// Muestra la corrección y su explicación.
export const PracticeFeedback = ({
  feedback,
  headingRef,
}: {
  feedback: Feedback;
  headingRef?: Ref<HTMLHeadingElement>;
}) => {
  const t = useTranslations("Practice");
  const format = useFormatter();

  // Formatea la respuesta correcta.
  const correctValue =
    typeof feedback.expected === "number"
      ? format.number(feedback.expected, {
          maximumSignificantDigits: 6,
          ...(Math.abs(feedback.expected) < 0.001
            ? { notation: "scientific" as const }
            : {}),
        })
      : t(`options.${feedback.expected}`);

  const ResultIcon = feedback.correct ? Check : AlertTriangle;

  return (
    <div
      data-practice-feedback
      data-correct={feedback.correct}
      className={`min-w-0 self-start space-y-4 rounded-2xl border p-4 animate-[lab-gravity-practice-appear_220ms_ease-out] 
        motion-reduce:animate-none sm:p-5 ${
          feedback.correct
            ? "border-teal-300/30 bg-teal-300/5"
            : "border-amber-300/35 bg-amber-300/5"
        }`}
    >
      {/* Resultado de la respuesta. */}
      <h5
        ref={headingRef}
        tabIndex={headingRef ? -1 : undefined}
        className={`flex scroll-mt-6 items-center gap-2 rounded-md text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-4
           focus-visible:outline-violet-300 ${
             feedback.correct ? "text-teal-100" : "text-amber-100"
           }`}
      >
        <ResultIcon className="size-5 shrink-0" />
        {t(feedback.correct ? "correct" : "incorrect")}
      </h5>

      {/* Respuesta correcta. */}
      <p className="text-sm text-slate-200">
        {t("expected")}:{" "}
        <strong className="text-slate-50">{correctValue}</strong>
      </p>

      {/* Explicación de la corrección. */}
      <p className="max-w-prose text-sm leading-7 whitespace-pre-wrap wrap-anywhere">
        {feedback.explanation}
      </p>

      {/* Pasos de la solución. */}
      {feedback.steps.length > 0 && (
        <ol className="max-w-prose list-decimal space-y-2 pl-5 text-sm leading-7 whitespace-pre-wrap wrap-anywhere">
          {feedback.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      )}
    </div>
  );
};
