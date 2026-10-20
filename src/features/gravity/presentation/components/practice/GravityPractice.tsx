"use client";

import { useEffect, useId, useRef } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Lightbulb } from "@/components/icons";
import { usePracticeSession } from "./usePracticeSession";
import { PracticeAnswer } from "./PracticeAnswer";
import { ArrowRight } from "@/components/icons";
import { PracticeFeedback } from "./PracticeFeedback";
import { PracticeReport } from "./PracticeReport";
import { practiceStyles as styles } from "./Practice.styles";
import { GRAVITATIONAL_CONSTANT } from "../../../domain/gravitation";
import { answerKind, numericAnswer } from "../../../domain/practice/input";
import { PRACTICE_QUESTION_COUNT } from "../../../types/practice/practice.types";

// Gestiona la interfaz de la etapa 04 · Comprueba,
// mostrando preguntas, pistas, correcciones y el informe final.
export const GravityPractice = () => {
  // Obtiene las traducciones, el formato numérico y un identificador único.
  const t = useTranslations("Practice"),
    format = useFormatter(),
    id = useId();

  // Obtiene el estado y las funciones para controlar la sesión de práctica.
  const {
    view,
    answer,
    setAnswer,
    hintOpen,
    toggleHint,
    pending,
    error,
    start,
    check,
    next,
    retry,
  } = usePracticeSession();

  // Guarda la referencia del título para gestionar el foco.
  const focusRef = useRef<HTMLHeadingElement>(null);

  // Actualiza el foco y el desplazamiento cuando cambia
  // la pregunta o se muestra un resultado.
  useEffect(() => {
    const heading = focusRef.current;

    if (
      !view ||
      !heading?.getClientRects().length ||
      heading.closest("[hidden],[inert]")
    )
      return;

    // Anuncia el cambio mediante el foco sin duplicar la lectura de la respuesta.
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({
      block: "nearest",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }, [view]);

  // Obtiene la pregunta actual de la sesión.
  const q = view?.question;

  // Identifica el tipo de respuesta que necesita la pregunta.
  const kind = q ? answerKind(q) : null;

  // Comprueba si la respuesta introducida es válida para poder corregirla.
  const valid =
    q &&
    (kind === "choice"
      ? !!answer.value
      : numericAnswer(answer, kind === "scientific") !== null);

  // Formatea los números utilizados en los enunciados.
  const number = (value: number) =>
    format.number(value, { maximumSignificantDigits: 8, useGrouping: false });

  return (
    <section
      data-practice
      aria-labelledby={`${id}-title`}
      aria-busy={pending}
      className="mx-auto mb-24 w-full min-w-0 max-w-5xl rounded-2xl border border-lab-line bg-slate-950/65 p-4 text-slate-200 [overflow-wrap:anywhere] sm:p-6"
    >
      <h3 id={`${id}-title`} className="text-xl font-semibold text-slate-50">
        {t("title")}
      </h3>

      <p className="mt-1 text-sm text-slate-300">{t("subtitle")}</p>

      {!view && (
        <div className="mt-5 space-y-4">
          <p className="max-w-prose leading-7">{t("introduction")}</p>
          <button
            type="button"
            className={`${styles.primary} w-full sm:w-auto`}
            disabled={pending}
            onClick={start}
          >
            {t(pending ? "loading" : "start")}
          </button>
        </div>
      )}

      {view?.report ? (
        <PracticeReport
          view={view}
          report={view.report}
          headingRef={focusRef}
          pending={pending}
          onRestart={start}
        />
      ) : (
        q &&
        view && (
          <div className="mt-5 space-y-4">
            <p
              id={`${id}-progress`}
              className="text-sm font-semibold text-violet-200"
            >
              {t("position", { number: q.number })}
            </p>

            <progress
              aria-labelledby={`${id}-progress`}
              className={styles.progress}
              max={PRACTICE_QUESTION_COUNT}
              value={view.count}
            />

            <div
              className={`grid min-w-0 gap-5 ${
                view.feedback ? "lg:grid-cols-2" : ""
              }`}
            >
              <div className="min-w-0 space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-2 text-xs font-medium">
                  <div className="flex min-w-0 flex-wrap gap-2">
                    <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5">
                      {t(`kinds.${kind}`)}
                    </span>

                    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5">
                      {t("difficulty", { level: q.difficulty })}
                    </span>

                    {q.reinforcement && (
                      <span className="rounded-full bg-amber-300/5 px-3 py-1.5 text-amber-200">
                        {t("reinforcement")}
                      </span>
                    )}
                  </div>

                  {!view.feedback && (
                    <div data-practice-help>
                      <button
                        type="button"
                        className={styles.hintButton}
                        aria-expanded={hintOpen}
                        aria-controls={`${id}-hint`}
                        onClick={toggleHint}
                      >
                        <Lightbulb className="size-4 shrink-0" />
                        {t(hintOpen ? "hideHint" : "hint")}
                      </button>
                    </div>
                  )}
                </div>

                <h4
                  ref={view.feedback ? undefined : focusRef}
                  tabIndex={-1}
                  data-practice-question
                  className={`${styles.focus} max-w-prose text-lg font-semibold leading-relaxed text-slate-50`}
                >
                  {t(`scenes.${q.scene}`)}{" "}
                  {t(`questions.${q.concept}`, {
                    a: number(
                      q.concept === "power" ? q.a * 10 ** q.exponent : q.a,
                    ),
                    b: number(q.b),
                    r: number(q.r),
                    massUnit:
                      q.concept === "force" && q.difficulty === 3 ? "t" : "kg",
                    distanceUnit:
                      q.concept === "force" && q.difficulty >= 2 ? "km" : "m",
                  })}
                </h4>

                {kind !== "choice" && (
                  <p className="max-w-prose text-sm leading-6 text-slate-400">
                    {t("rounding")}
                    {q.concept === "force" &&
                      ` · G = ${format.number(GRAVITATIONAL_CONSTANT, { notation: "scientific", maximumSignificantDigits: 6 })} N·m²/kg²`}
                  </p>
                )}

                <div
                  id={`${id}-hint`}
                  className={styles.reveal}
                  data-open={hintOpen}
                  aria-hidden={!hintOpen}
                  inert={!hintOpen}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="mt-3 max-w-prose rounded-xl border border-teal-300/25 bg-teal-950/50 p-3 text-sm leading-6 text-teal-100">
                      {t(`hints.${q.hint}`)}
                    </p>
                  </div>
                </div>

                <PracticeAnswer
                  question={q}
                  answer={answer}
                  onChange={setAnswer}
                  disabled={pending || !!view.feedback}
                />

                <div className="flex flex-wrap items-center gap-2">
                  {!view.feedback ? (
                    // Botón para corregir la respuesta.
                    <button
                      type="button"
                      data-practice-check
                      className={`${styles.primary} w-full sm:min-w-40 sm:w-auto`}
                      disabled={!valid || pending}
                      onClick={check}
                    >
                      {t(pending ? "checking" : "check")}
                    </button>
                  ) : (
                    // Botón para avanzar a la siguiente pregunta.
                    <button
                      type="button"
                      className={`${styles.primary} w-full sm:min-w-40 sm:w-auto`}
                      disabled={pending}
                      onClick={next}
                    >
                      {t(pending ? "loading" : "next")}
                      <ArrowRight className="size-4 shrink-0" />
                    </button>
                  )}
                </div>
              </div>

              {view.feedback && (
                <div className="min-w-0 lg:relative lg:min-h-0">
                  <div
                    tabIndex={0}
                    aria-label={t(
                      view.feedback.correct ? "correct" : "incorrect",
                    )}
                    className="
        min-w-0
        lg:absolute lg:inset-0
        lg:overflow-y-auto
        lg:overscroll-contain
        [scrollbar-width:none]
        [-ms-overflow-style:none]
        [&::-webkit-scrollbar]:hidden
        focus-visible:outline-2
        focus-visible:outline-violet-300
      "
                  >
                    <PracticeFeedback
                      feedback={view.feedback}
                      headingRef={focusRef}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      )}

      <p
        role="status"
        aria-atomic="true"
        className={pending ? "mt-4 text-sm text-cyan-100" : "sr-only"}
      >
        {pending ? t(q && !view.feedback ? "checking" : "loading") : ""}
      </p>

      {error && (
        <div
          role="alert"
          className="mt-4 space-y-3 rounded-xl border border-amber-300/30 bg-amber-300/5 p-4 text-amber-200"
        >
          <p>{t(`errors.${error}`)}</p>

          <button
            type="button"
            className={styles.secondary}
            disabled={pending}
            onClick={error === "invalid_session" ? start : retry}
          >
            {t(error === "invalid_session" ? "restart" : "retry")}
          </button>
        </div>
      )}
    </section>
  );
};
