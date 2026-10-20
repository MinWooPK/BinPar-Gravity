"use client";

import type { Ref } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { AlertTriangle, Check } from "@/components/icons";
import type { Feedback } from "../../../types/practice/practice.types";
import { practiceStyles as styles } from "./Practice.styles";

// Muestra el resultado de una respuesta, indicando si es correcta
// y proporcionando la solución y una explicación educativa.
export const PracticeFeedback = ({
  feedback,
  headingRef,
  // pending,
  // onNext,
}: {
  feedback: Feedback;
  headingRef?: Ref<HTMLHeadingElement>;
  pending?: boolean;
  onNext?: () => void;
}) => {
  // Obtiene las traducciones y el formato numérico según el idioma.
  const t = useTranslations("Practice"),
    format = useFormatter();

  // Formatea la respuesta correcta como número o como opción traducida.
  const correctValue =
    typeof feedback.expected === "number"
      ? format.number(feedback.expected, {
          maximumSignificantDigits: 6,
          ...(Math.abs(feedback.expected) < 0.001
            ? { notation: "scientific" as const }
            : {}),
        })
      : t(`options.${feedback.expected}`);

  // Selecciona el icono según si la respuesta es correcta o incorrecta.
  const ResultIcon = feedback.correct ? Check : AlertTriangle;

  return (
    <div
      data-practice-feedback
      data-correct={feedback.correct}
      className={`${styles.appearance} min-w-0 space-y-4 self-start rounded-2xl border p-4 sm:p-5 ${feedback.correct ? "border-teal-300/30 bg-teal-300/5" : "border-amber-300/35 bg-amber-300/5"}`}
    >
      <h5
        ref={headingRef}
        tabIndex={headingRef ? -1 : undefined}
        className={`${styles.focus} ${styles.title} ${feedback.correct ? "text-teal-100" : "text-amber-100"}`}
      >
        <ResultIcon className="size-5 shrink-0" />
        {t(feedback.correct ? "correct" : "incorrect")}
      </h5>

      <p className="text-sm text-slate-200">
        {t("expected")}:{" "}
        <strong className="text-slate-50">{correctValue}</strong>
      </p>

      <p className={styles.prose}>{feedback.explanation}</p>

      {feedback.steps.length > 0 && (
        <ol className={`${styles.prose} list-decimal space-y-2 pl-5`}>
          {feedback.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      )}

      {/* {onNext && (
        <button
          type="button"
          className={`${styles.primary} w-full sm:w-auto`}
          disabled={pending}
          onClick={onNext}
        >
          {t(pending ? "loading" : "next")}
          <ArrowRight className="size-4 shrink-0" />
        </button>
      )} */}
    </div>
  );
};
