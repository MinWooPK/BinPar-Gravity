"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  challenges,
} from "../domain/gravitation";
import type {
  LearningAttempt,
  Prediction,
} from "../domain/gravitation";
import { GravityTutor } from "./GravityTutor";
import { GravityExperiment } from "./GravityExperiment";
import { GravityChallengeComparison } from "./GravityChallengeComparison";
import { GravityStageHeading } from "./GravityStageHeading";
import { gravityStages } from "./gravityJourney";
import journeyStyles from "./GravityJourney.module.css";
import challengeStyles from "./GravityChallenges.module.css";
import { useGravityParameters } from "./GravityParametersProvider";

const buttonClass =
  "min-h-11 rounded-xl border border-slate-600 px-4 py-2 text-base font-semibold text-slate-100 transition-colors hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:cursor-not-allowed disabled:opacity-40";

export const GravityLab = () => {
  const t = useTranslations("Gravity");
  const id = useId();
  const { parameters, setParameters, resetParameters } = useGravityParameters();
  const [step, setStep] = useState(0);
  const [prediction, setPrediction] = useState<Prediction | "">("");
  const [attempt, setAttempt] = useState<LearningAttempt>();
  const [revealed, setRevealed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const challenge = challenges[step];
  const isCorrect = prediction === challenge.answer;
  const challengeHeadingRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  const pendingFocus = useRef<"challenge" | "feedback" | null>(null);
  useEffect(() => {
    const target = pendingFocus.current === "challenge" ? challengeHeadingRef.current : pendingFocus.current === "feedback" ? feedbackRef.current : null;
    target?.focus();
    pendingFocus.current = null;
  }, [step, revealed]);

  const reset = () => {
    resetParameters();
    setRevealed(false);
    setPrediction("");
    setAttempt(undefined);
    setCompleted(false);
  };
  const chooseStep = (index: number) => {
    if (index !== step || revealed) pendingFocus.current = "challenge";
    setStep(index);
    reset();
  };

  return (
    <div className={journeyStyles.sections}>
      <section
        id={gravityStages[1].id}
        aria-labelledby={`${gravityStages[1].id}-heading`}
        tabIndex={-1}
        className={journeyStyles.stage}
      >
        <GravityStageHeading stage={gravityStages[1]} />
        <GravityExperiment
          parameters={parameters}
          onChange={setParameters}
          onReset={resetParameters}
        />
        <div className={journeyStyles.nextStage}>
          <a href={`#${gravityStages[2].id}`} className={journeyStyles.continueLink}>
            {t("learningContinue")}
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 12h16m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        </div>
      </section>
      <section
        id={gravityStages[2].id}
        aria-labelledby={`${gravityStages[2].id}-heading`}
        tabIndex={-1}
        className={`${journeyStyles.stage} ${challengeStyles.stage}`}
      >
        <div>
          <GravityStageHeading stage={gravityStages[2]} />
          <p className={challengeStyles.hint}>
            {t("challengesHint")}
          </p>
        </div>
        <section
          aria-labelledby={`${id}-challenge`}
          className={challengeStyles.challengeCard}
        >
          <div className={challengeStyles.cardHeader}>
            <p id={`${id}-challenge-position`} className="text-base font-semibold text-slate-200">
              {t("challengePosition", { number: step + 1, total: challenges.length })}
            </p>
            <div className="flex gap-2" role="group" aria-label={t("challenges")} aria-describedby={`${id}-challenge-position`}>
              {challenges.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={t("challengeNumber", { number: index + 1 })}
                  aria-pressed={step === index}
                  onClick={() => chooseStep(index)}
                  className={`${buttonClass} ${step === index ? "border-sky-400 bg-sky-900/50" : ""}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
          <div className={challengeStyles.challengeLayout} data-revealed={revealed}>
            <div className={challengeStyles.prediction}>
              <h3
                ref={challengeHeadingRef}
                tabIndex={-1}
                id={`${id}-challenge`}
                className={`${challengeStyles.question} scroll-mt-48 rounded text-2xl font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300 lg:scroll-mt-28`}
              >
                {t(`challenge_${challenge.id}`)}
              </h3>
              <p className={challengeStyles.baseline}>{t("baseline")}</p>
              <p className={challengeStyles.prompt}>{t("predict")}</p>
              <fieldset
                disabled={revealed}
                className={challengeStyles.answers}
              >
                <legend className="sr-only">{t("predict")}</legend>
                {(["same", "double", "four", "quarter"] as const).map((answer) => {
                  const selected = prediction === answer;
                  const correctAnswer = revealed && answer === challenge.answer;
                  const answerClass = correctAnswer
                    ? "border-emerald-400 bg-emerald-950/50 text-emerald-100"
                    : revealed && selected
                      ? "border-amber-400 bg-amber-950/40 text-amber-100"
                      : selected
                        ? "border-sky-400 bg-sky-900/30 text-sky-100"
                        : "border-slate-600 text-slate-200";
                  return (
                    <label
                      key={answer}
                      className={`flex min-h-11 items-center gap-3 rounded-xl border p-3 text-base focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-sky-300 ${revealed ? "cursor-default" : "cursor-pointer"} ${answerClass}`}
                    >
                      <input
                        type="radio"
                        name={`${id}-prediction`}
                        value={answer}
                        checked={selected}
                        onChange={() => setPrediction(answer)}
                        className="size-4 shrink-0 accent-sky-300"
                      />
                      <span className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2">
                        <span>{t(answer)}</span>
                        {revealed && (selected || correctAnswer) && (
                          <span className="flex flex-wrap gap-2 text-sm font-semibold">
                            {correctAnswer && <span>{t("answerCorrect")}</span>}
                            {selected && <span>{t("answerYourPrediction")}</span>}
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </fieldset>
              {!revealed && (
                <button
                  type="button"
                  disabled={!prediction}
                  onClick={() => {
                    if (prediction) {
                      setParameters(challenge.parameters);
                      setAttempt({ challenge: challenge.id, prediction });
                      pendingFocus.current = "feedback";
                      setRevealed(true);
                    }
                  }}
                  className={`${buttonClass} ${challengeStyles.checkButton} bg-blue-700 hover:bg-blue-600`}
                >
                  {t("check")}
                </button>
              )}
            </div>
            {revealed && (
              <div className={challengeStyles.result}>
                <p ref={feedbackRef} tabIndex={-1} aria-describedby={`${id}-feedback-description`} className={`${challengeStyles.feedback} flex scroll-mt-48 items-start gap-2 rounded font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300 lg:scroll-mt-28 ${isCorrect ? "text-emerald-200" : "text-amber-200"}`}>
                  <span aria-hidden="true" className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-current text-sm">
                    {isCorrect ? "✓" : "!"}
                  </span>
                  <span>{t(isCorrect ? "correct" : "keepLearning")}</span>
                </p>
                <p id={`${id}-feedback-description`} className={challengeStyles.explanation}>
                  {t(`feedback_${challenge.id}`)}
                </p>
                <div className={challengeStyles.comparison}>
                  <GravityChallengeComparison parameters={challenge.parameters} />
                </div>
                <p className={challengeStyles.feedbackNote}>{t("feedbackNote")}</p>
                <div className={challengeStyles.actions}>
                  <a
                    href={`#${gravityStages[1].id}`}
                    onClick={() => setParameters(challenge.parameters)}
                    className={`${buttonClass} inline-flex items-center justify-center`}
                  >
                    {t("seeExperiment")}
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      step < 2 ? chooseStep(step + 1) : setCompleted(true)
                    }
                    className={buttonClass}
                  >
                    {t(step < 2 ? "next" : "finish")}
                  </button>
                </div>
              </div>
            )}
          </div>
          <p role="status" aria-atomic="true" className={completed ? challengeStyles.summary : "sr-only"}>
            {completed ? t("summary") : ""}
          </p>
        </section>
      </section>

      <details className="rounded-2xl border border-slate-700 bg-slate-900/50">
        <summary className="cursor-pointer rounded-2xl px-5 py-4 text-lg font-semibold text-sky-200 transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 sm:px-6">
          {t("optionalHelp")}
        </summary>
        <div className="p-3 sm:p-5">
          <GravityTutor parameters={parameters} attempt={attempt} />
        </div>
      </details>
      <Link
        href="/three-body"
        className="inline-flex min-h-12 items-center gap-3 rounded-xl border border-slate-600 px-5 py-3 text-base font-semibold text-sky-200 transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-sky-300"
      >
        {t("nextTopic")} <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
};
