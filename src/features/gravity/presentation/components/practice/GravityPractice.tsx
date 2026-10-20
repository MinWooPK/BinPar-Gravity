"use client";
import { useEffect, useId, useRef } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { GravityStageLink } from "../GravityJourneyTabs";
import { usePracticeSession } from "./usePracticeSession";
import { PracticeAnswer, practiceButton } from "./PracticeAnswer";
import { GRAVITATIONAL_CONSTANT } from "../../../domain/gravitation";
import { answerKind, numericAnswer } from "../../../domain/practice/input";
import { PRACTICE_QUESTION_COUNT } from "@/features/gravity/types/practice/practice.types";
export const GravityPractice = () => {
  const t = useTranslations("Practice"),
    format = useFormatter(),
    id = useId();
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
  const focusRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (
      view &&
      focusRef.current?.getClientRects().length &&
      !focusRef.current.closest("[hidden],[inert]")
    )
      focusRef.current.focus({ preventScroll: true });
  }, [view]);
  const q = view?.question;
  const valid =
    q &&
    (answerKind(q) === "choice"
      ? !!answer.value
      : numericAnswer(answer, answerKind(q) === "scientific") !== null);
  const number = (value: number) =>
    format.number(value, { maximumSignificantDigits: 8, useGrouping: false });
  const correctValue = view?.feedback
    ? typeof view.feedback.expected === "number"
      ? format.number(view.feedback.expected, {
          maximumSignificantDigits: 6,
          ...(Math.abs(view.feedback.expected) < 0.001
            ? { notation: "scientific" as const }
            : {}),
        })
      : t(`options.${view.feedback.expected}`)
    : "";
  return (
    <section
      data-practice
      className="mx-auto w-full min-w-0 max-w-5xl rounded-2xl border border-lab-line bg-slate-950/65 p-4 text-slate-200 sm:p-6"
      aria-labelledby={`${id}-title`}
      aria-busy={pending}
    >
      <h3 id={`${id}-title`} className="text-xl font-semibold text-slate-50">
        {t("title")}
      </h3>
      <p className="mt-1 text-slate-300">{t("subtitle")}</p>
      {!view && (
        <div className="mt-5 space-y-4">
          <p>{t("introduction")}</p>
          <button className={practiceButton} disabled={pending} onClick={start}>
            {t("start")}
          </button>
        </div>
      )}
      {view?.report ? (
        <div className="mt-5 space-y-4" data-practice-report>
          <h4
            ref={focusRef}
            tabIndex={-1}
            className="text-xl font-semibold text-violet-100"
          >
            {t("finished")}
          </h4>
          <p className="text-lg">
            {t("score", { score: view.score })} ·{" "}
            {t("hintsUsed", { count: view.hints })}
          </p>
          <p>{view.report.summary}</p>
          <h5 className="font-semibold text-emerald-200">{t("strengths")}</h5>
          <ul className="list-disc space-y-1 pl-5">
            {view.report.strengths.map((text, i) => (
              <li key={i}>{text}</li>
            ))}
          </ul>
          <h5 className="font-semibold text-amber-200">{t("review")}</h5>
          <ul className="list-disc space-y-1 pl-5">
            {view.report.review.map((text, i) => (
              <li key={i}>{text}</li>
            ))}
          </ul>
          <h5 className="font-semibold">{t("recommendations")}</h5>
          {view.report.recommendations.map((r, i) => (
            <div
              key={i}
              className="space-y-2 rounded-xl border border-violet-300/25 p-3"
            >
              <p>{r.text}</p>
              <GravityStageLink
                stageId={r.stage}
                className={`${practiceButton} inline-flex items-center`}
              >
                {t(`stages.${r.stage}`)}
              </GravityStageLink>
            </div>
          ))}
          <details>
            <summary className="min-h-11 cursor-pointer py-2">
              {t("history")}
            </summary>
            <ol className="list-decimal space-y-2 pl-5">
              {view.history.map((a, i) => (
                <li key={i}>
                  {t(`concepts.${a.concept}`)} ·{" "}
                  {t(a.correct ? "correct" : "incorrect")}
                  {a.usedHint ? ` · ${t("hintUsed")}` : ""}
                </li>
              ))}
            </ol>
          </details>
          <button className={practiceButton} onClick={start} disabled={pending}>
            {t("restart")}
          </button>
        </div>
      ) : (
        q &&
        view && (
          <div className="mt-5 space-y-4">
            <p id={`${id}-progress`} className="font-semibold text-violet-200">
              {t("position", { number: q.number })}
            </p>
            <progress
              aria-labelledby={`${id}-progress`}
              className="block h-2 w-full accent-violet-300"
              max={PRACTICE_QUESTION_COUNT}
              value={view.count}
            />
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-lg bg-violet-300/10 px-3 py-2">
                {t(`kinds.${answerKind(q)}`)}
              </span>
              <span className="rounded-lg bg-cyan-300/10 px-3 py-2">
                {t("difficulty", { level: q.difficulty })}
              </span>
              {q.reinforcement && (
                <span className="px-3 py-2 text-amber-200">
                  {t("reinforcement")}
                </span>
              )}
            </div>
            <h4
              ref={focusRef}
              tabIndex={-1}
              className="text-lg font-semibold leading-relaxed text-slate-50"
              data-practice-question
            >
              {t(`scenes.${q.scene}`)}{" "}
              {t(`questions.${q.concept}`, {
                a: number(q.concept === "power" ? q.a * 10 ** q.exponent : q.a),
                b: number(q.b),
                r: number(q.r),
                massUnit:
                  q.concept === "force" && q.difficulty === 3 ? "t" : "kg",
                distanceUnit:
                  q.concept === "force" && q.difficulty >= 2 ? "km" : "m",
              })}
            </h4>
            <p className="text-sm text-slate-300">
              {t("rounding")}
              {q.concept === "force" &&
                ` · G = ${format.number(GRAVITATIONAL_CONSTANT, { notation: "scientific", maximumSignificantDigits: 6 })} N·m²/kg²`}
            </p>
            <PracticeAnswer
              question={q}
              answer={answer}
              onChange={setAnswer}
              disabled={pending || !!view.feedback}
            />
            {!view.feedback && (
              <>
                <button
                  type="button"
                  className={practiceButton}
                  aria-expanded={hintOpen}
                  aria-controls={`${id}-hint`}
                  onClick={toggleHint}
                >
                  {t(hintOpen ? "hideHint" : "hint")}
                </button>
                <p
                  id={`${id}-hint`}
                  hidden={!hintOpen}
                  className="rounded-xl border border-cyan-300/25 bg-cyan-300/5 p-3"
                >
                  {t(`hints.${q.hint}`)}
                </p>
                <div>
                  <button
                    className={`${practiceButton} bg-violet-300/10`}
                    disabled={!valid || pending}
                    onClick={check}
                  >
                    {t("check")}
                  </button>
                </div>
              </>
            )}
            {view.feedback && (
              <div
                role="status"
                className="space-y-3 rounded-xl border border-violet-300/30 p-4"
                data-practice-feedback
              >
                <h5
                  className={`font-semibold ${view.feedback.correct ? "text-emerald-200" : "text-amber-200"}`}
                >
                  {t(view.feedback.correct ? "correct" : "incorrect")}
                </h5>
                <p>
                  {t("expected")}: <strong>{correctValue}</strong>
                </p>
                <p>{view.feedback.explanation}</p>
                <ol className="list-decimal space-y-2 pl-5">
                  {view.feedback.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
                <button
                  className={practiceButton}
                  disabled={pending}
                  onClick={next}
                >
                  {t("next")}
                </button>
              </div>
            )}
          </div>
        )
      )}
      {view?.report && view.feedback && (
        <details className="mt-4">
          <summary className="min-h-11 cursor-pointer py-2">
            {t("lastFeedback")}
          </summary>
          <p>
            {t("expected")}: {correctValue}
          </p>
          <p>{view.feedback.explanation}</p>
          <ol className="list-decimal pl-5">
            {view.feedback.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </details>
      )}
      {pending && (
        <p role="status" className="mt-4 text-cyan-100">
          {t("loading")}
        </p>
      )}
      {error && (
        <div role="alert" className="mt-4 space-y-3 text-amber-200">
          <p>{t(`errors.${error}`)}</p>
          <button
            className={practiceButton}
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
