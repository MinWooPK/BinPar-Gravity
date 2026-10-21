"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";

import {
  answerKind,
  optionsFor,
  parsePracticeNumber,
} from "../../../domain/practice/input";

import type { Answer, Question } from "../../../types/practice/practice.types";

// Estilos de los campos numéricos.
const inputClass =
  "min-h-11 w-full min-w-0 rounded-lg border border-slate-500 bg-slate-950/60 px-3 py-2 text-slate-100 focus-visible:outline-2 focus-visible:outline-violet-300";

// Muestra los campos según el tipo de respuesta.
export const PracticeAnswer = ({
  question,
  answer,
  onChange,
  disabled,
}: {
  question: Question;
  answer: Answer;
  onChange: (a: Answer) => void;
  disabled: boolean;
}) => {
  const t = useTranslations("Practice");
  const id = useId();
  const kind = answerKind(question);

  const scientific = kind === "scientific";

  // Preguntas de selección múltiple.
  if (kind === "choice") {
    return (
      <fieldset
        disabled={disabled}
        className="grid min-w-0 gap-2 disabled:opacity-75 sm:grid-cols-2"
      >
        <legend className="mb-2">{t("choose")}</legend>

        {optionsFor(question).map((option) => (
          <label
            key={option}
            className={`flex min-h-10 items-center gap-3 rounded-lg border p-3 transition-colors focus-within:outline-2 focus-within:outline-violet-300 motion-reduce:transition-none ${
              answer.value === option
                ? "border-violet-300 bg-violet-300/15"
                : "border-slate-600 hover:border-violet-300/50"
            }`}
          >
            <input
              type="radio"
              name={id}
              checked={answer.value === option}
              value={option}
              onChange={() => onChange({ value: option, exponent: "" })}
              className="size-4 shrink-0 accent-violet-300"
            />

            {t(`options.${option}`)}
          </label>
        ))}
      </fieldset>
    );
  }

  // Unidad correspondiente a la respuesta.
  const unit =
    question.concept === "force"
      ? "N"
      : question.concept === "tonnes"
        ? "kg"
        : ["km", "cm"].includes(question.concept)
          ? "m"
          : question.concept === "square"
            ? "m²"
            : "";

  const exponent = parsePracticeNumber(answer.exponent);

  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="mb-2">
        {t("answer")}
        {unit && ` (${unit})`}
      </legend>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        {/* Valor de la respuesta. */}
        <label
          htmlFor={`${id}-value`}
          className="min-w-0 sm:flex-1 sm:basis-32"
        >
          {t(scientific ? "coefficient" : "number")}

          <input
            id={`${id}-value`}
            className={inputClass}
            inputMode="decimal"
            autoComplete="off"
            value={answer.value}
            onChange={(e) => onChange({ ...answer, value: e.target.value })}
          />
        </label>

        {/* Exponente para notación científica. */}
        {scientific && (
          <>
            <span className="pb-3" aria-hidden="true">
              × 10
            </span>

            <label
              htmlFor={`${id}-exponent`}
              className="min-w-0 sm:flex-1 sm:basis-28"
            >
              {t("exponent")}

              <input
                id={`${id}-exponent`}
                type="number"
                min={-30}
                max={30}
                step={1}
                className={inputClass}
                value={answer.exponent}
                onChange={(e) =>
                  onChange({ ...answer, exponent: e.target.value })
                }
              />
            </label>

            {/* Botones para ajustar el exponente. */}
            <div className="flex gap-2">
              {[-1, 1].map((delta) => (
                <button
                  key={delta}
                  type="button"
                  aria-label={t(delta < 0 ? "decrease" : "increase")}
                  className="inline-flex min-h-11 scroll-mb-24 items-center justify-center gap-2 rounded-xl border border-slate-500/60 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors enabled:cursor-pointer enabled:hover:border-violet-300/60 enabled:hover:bg-violet-300/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
                  onClick={() =>
                    onChange({
                      ...answer,
                      exponent: String(
                        Math.max(-30, Math.min(30, (exponent ?? 0) + delta)),
                      ),
                    })
                  }
                >
                  {delta < 0 ? "−" : "+"}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Vista previa de la respuesta científica. */}
      {scientific && (
        <p className="mt-3 text-violet-200" aria-live="polite">
          {t("preview")}: {answer.value || "?"} × 10
          <sup>{answer.exponent || "?"}</sup> {unit}
        </p>
      )}
    </fieldset>
  );
};
