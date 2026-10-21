"use client";

import { MathText } from "@/components/ui/MathText";
import type { Ref } from "react";
import { useFormatter, useTranslations } from "next-intl";

import { ArrowRight, Lightbulb } from "@/components/icons";

import { GRAVITATIONAL_CONSTANT } from "../../../../domain/gravitation";
import { answerKind, numericAnswer } from "../../../../domain/practice/input";

import {
  PRACTICE_QUESTION_COUNT,
  type Answer,
  type PracticeView,
} from "../../../../types/practice/practice.types";

import { PracticeAnswer } from "../PracticeAnswer";
import { PracticeFeedback } from "../PracticeFeedback";

type PracticeQuestionPanelProps = {
  id: string;
  view: PracticeView;
  answer: Answer;
  onChange: (answer: Answer) => void;
  hintOpen: boolean;
  onToggleHint: () => void;
  pending: boolean;
  onCheck: () => void;
  onNext: () => void;
  headingRef: Ref<HTMLHeadingElement>;
};

// Estilos compartidos de los botones principales.
const primaryButtonClassName =
  "inline-flex min-h-11 w-full scroll-mb-24 items-center justify-center gap-2 rounded-xl border border-violet-300 " +
  "bg-violet-300 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors enabled:cursor-pointer " +
  "enabled:hover:bg-violet-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200  " +
  "disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none sm:w-auto sm:min-w-40";

// Muestra la pregunta, las pistas y su corrección.
export const PracticeQuestionPanel = ({
  id,
  view,
  answer,
  onChange,
  hintOpen,
  onToggleHint,
  pending,
  onCheck,
  onNext,
  headingRef,
}: PracticeQuestionPanelProps) => {
  const t = useTranslations("Practice");
  const format = useFormatter();

  const question = view.question;
  const kind = answerKind(question);

  // Comprueba si la respuesta es válida.
  const valid =
    kind === "choice"
      ? !!answer.value
      : numericAnswer(answer, kind === "scientific") !== null;

  // Formatea los números de la pregunta.
  const number = (value: number) =>
    format.number(value, {
      maximumSignificantDigits: 8,
      useGrouping: false,
    });

  return (
    <div className="mt-5 space-y-4">
      {/* Progreso de la evaluación. */}
      <p
        id={`${id}-progress`}
        className="text-sm font-semibold text-violet-200"
      >
        {t("position", { number: question.number })}
      </p>

      <progress
        aria-labelledby={`${id}-progress`}
        className="lab-gravity-practice-progress block h-2 w-full overflow-hidden rounded-full border-0 bg-[#94a3b830] appearance-none"
        max={PRACTICE_QUESTION_COUNT}
        value={view.count}
      />

      <div
        className={`grid min-w-0 gap-5 ${
          view.feedback ? "lg:grid-cols-2" : ""
        }`}
      >
        <div className="min-w-0 space-y-4">
          {/* Tipo de pregunta, dificultad y pista. */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium">
            <div className="flex min-w-0 flex-wrap gap-2">
              <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5">
                {t(`kinds.${kind}`)}
              </span>

              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5">
                {t("difficulty", {
                  level: question.difficulty,
                })}
              </span>

              {question.reinforcement && (
                <span className="rounded-full bg-amber-300/5 px-3 py-1.5 text-amber-200">
                  {t("reinforcement")}
                </span>
              )}
            </div>

            {!view.feedback && (
              <div data-practice-help>
                <button
                  type="button"
                  aria-expanded={hintOpen}
                  aria-controls={`${id}-hint`}
                  onClick={onToggleHint}
                  className="inline-flex min-h-11 scroll-mb-24 items-center justify-center gap-2 rounded-xl border
                   border-teal-300/25 bg-teal-300/5 px-4 py-2 text-sm font-semibold text-teal-100 transition-colors
                    hover:bg-teal-300/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200 
                    disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
                >
                  <Lightbulb className="size-4 shrink-0" />
                  {t(hintOpen ? "hideHint" : "hint")}
                </button>
              </div>
            )}
          </div>

          {/* Enunciado de la pregunta. */}
          <h4
            ref={view.feedback ? undefined : headingRef}
            tabIndex={-1}
            data-practice-question
            className="max-w-prose scroll-mt-6 rounded-md text-lg leading-relaxed font-semibold text-slate-50 
            focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300"
          >
            {t(`scenes.${question.scene}`)}{" "}
            <MathText>
              {t(`questions.${question.concept}`, {
                a: number(
                  question.concept === "power"
                    ? question.a * 10 ** question.exponent
                    : question.a,
                ),
                b: number(question.b),
                r: number(question.r),
                massUnit:
                  question.concept === "force" && question.difficulty === 3
                    ? "t"
                    : "kg",
                distanceUnit:
                  question.concept === "force" && question.difficulty >= 2
                    ? "km"
                    : "m",
              })}
            </MathText>
          </h4>

          {/* Indicaciones para respuestas numéricas. */}
          {kind !== "choice" && (
            <p className="max-w-prose text-sm leading-6 text-slate-400">
              {t("rounding")}
              {question.concept === "force" &&
                ` · G = ${format.number(GRAVITATIONAL_CONSTANT, {
                  notation: "scientific",
                  maximumSignificantDigits: 6,
                })} N·m²/kg²`}
            </p>
          )}

          {/* Pista de ayuda. */}
          <div
            id={`${id}-hint`}
            data-open={hintOpen}
            aria-hidden={!hintOpen}
            inert={!hintOpen}
            className="invisible grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity,visibility] 
            duration-220 ease-in data-[open=true]:visible data-[open=true]:grid-rows-[1fr] data-[open=true]:opacity-100 
            motion-reduce:transition-none"
          >
            <div className="min-h-0 overflow-hidden">
              <p className="mt-3 max-w-prose rounded-xl border border-teal-300/25 bg-teal-950/50 p-3 text-sm leading-6 text-teal-100">
                <MathText>{t(`hints.${question.hint}`)}</MathText>
              </p>
            </div>
          </div>

          {/* Campo de respuesta. */}
          <PracticeAnswer
            question={question}
            answer={answer}
            onChange={onChange}
            disabled={pending || !!view.feedback}
          />

          {/* Comprobar o pasar a la siguiente pregunta. */}
          <div className="flex flex-wrap items-center gap-2">
            {!view.feedback ? (
              <button
                type="button"
                data-practice-check
                className={primaryButtonClassName}
                disabled={!valid || pending}
                onClick={onCheck}
              >
                {t(pending ? "checking" : "check")}
              </button>
            ) : (
              <button
                type="button"
                className={primaryButtonClassName}
                disabled={pending}
                onClick={onNext}
              >
                {t(pending ? "loading" : "next")}

                <ArrowRight className="size-4 shrink-0" />
              </button>
            )}
          </div>
        </div>

        {/* Corrección de la pregunta. */}
        {view.feedback && (
          <div className="min-w-0 lg:relative lg:min-h-0">
            <div
              tabIndex={0}
              aria-label={t(view.feedback.correct ? "correct" : "incorrect")}
              className="min-w-0 scrollbar-none [-ms-overflow-style:none] focus-visible:outline-2
               focus-visible:outline-violet-300 lg:absolute lg:inset-0 lg:overflow-y-auto lg:overscroll-contain 
               [&::-webkit-scrollbar]:hidden"
            >
              <PracticeFeedback
                feedback={view.feedback}
                headingRef={headingRef}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
