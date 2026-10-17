"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TutorContextBridge } from "@/features/ai/components/TutorProvider";
import type { TutorContext } from "@/features/ai/application/tutor";
import { challenges, initialParameters } from "../domain/gravitation";
import type { LearningAttempt, Prediction } from "../domain/gravitation";
import { GravityExperiment } from "./GravityExperiment";
import { GravityChallengeComparison } from "./GravityChallengeComparison";
import { GravityJourneyPanel, useActiveGravityStage } from "./GravityJourneyTabs";
import { GravityStageLayout } from "./GravityStageLayout";
import { GravityFormulaButton } from "./GravityFormulaAccess";
import { gravityStageById } from "./gravityJourney";
import journeyStyles from "./GravityJourney.module.css";
import challengeStyles from "./GravityChallenges.module.css";
import { useGravityParameters } from "./GravityParametersProvider";

const buttonClass =
  "min-h-11 rounded-lg border border-violet-300/40 px-3 py-2 text-sm font-semibold text-violet-100 transition-colors hover:bg-violet-300/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none";

export const GravityLab = () => {
  const t = useTranslations("Gravity");
  const id = useId();
  const activeStage = useActiveGravityStage();
  const { parameters, setParameters, resetParameters } = useGravityParameters();
  const [step, setStep] = useState(0);
  const [prediction, setPrediction] = useState<Prediction | "">("");
  const [attempt, setAttempt] = useState<LearningAttempt>();
  const [revealed, setRevealed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const challenge = challenges[step];
  const tutorContext = useMemo<TutorContext>(() => ({
    kind: "gravity",
    stage: activeStage,
    parameters,
    ...(activeStage === "gravity-challenges" ? {
      challenge: challenge.id,
      ...(prediction ? { prediction } : {}),
      ...(attempt ? { attempt } : {}),
    } : {}),
  }), [activeStage, parameters, challenge.id, prediction, attempt]);
  const isCorrect = prediction === challenge.answer;
  const hasNextChallenge = step < challenges.length - 1;
  const showingReference = parameters.mass1 === initialParameters.mass1 &&
    parameters.mass2 === initialParameters.mass2 && parameters.distance === initialParameters.distance;
  const showingChallenge = parameters.mass1 === challenge.parameters.mass1 &&
    parameters.mass2 === challenge.parameters.mass2 && parameters.distance === challenge.parameters.distance;
  const scenarioMessage = showingReference ? "challengeScenarioBase"
    : revealed && showingChallenge ? "challengeScenarioApplied" : "challengeScenarioCustom";
  const challengeHeadingRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  const pendingFocus = useRef<"challenge" | "feedback" | null>(null);
  // Entering the challenge restores its scenario, without resetting the formula draft.
  useLayoutEffect(() => {
    if (activeStage === "gravity-challenges") {
      setParameters(revealed ? challenge.parameters : initialParameters);
    }
  }, [activeStage, revealed, challenge.parameters, setParameters]);
  useEffect(() => {
    const focusTargets = {
      challenge: challengeHeadingRef.current,
      feedback: feedbackRef.current,
    };
    const target = pendingFocus.current ? focusTargets[pendingFocus.current] : null;
    target?.focus();
    pendingFocus.current = null;
  }, [step, revealed]);

  const reset = () => {
    setParameters(initialParameters);
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
    <>
      <GravityJourneyPanel
        stage={gravityStageById["gravity-laboratory"]}
        className={journeyStyles.stage}
      >
        <GravityStageLayout>
          <GravityExperiment
            parameters={parameters}
            onChange={setParameters}
            onReset={resetParameters}
          />
        </GravityStageLayout>
      </GravityJourneyPanel>
      <GravityJourneyPanel
        stage={gravityStageById["gravity-challenges"]}
        className={`${journeyStyles.stage} ${challengeStyles.stage}`}
      >
        <GravityStageLayout>
          <section
            aria-labelledby={`${id}-challenge-title`}
            className={challengeStyles.challengeCard}
            data-challenge-step={step + 1}
            data-revealed={revealed}
          >
            <div className={challengeStyles.titleRow}>
              <h3 id={`${id}-challenge-title`}>{t("challengeHeading")}</h3>
              <GravityFormulaButton />
            </div>
            <p className={challengeStyles.hint}>{t("challengesHint")}</p>
            <div className={challengeStyles.cardHeader}>
              <p id={`${id}-challenge-position`} className="text-sm font-semibold text-slate-200">
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
                    className={`${buttonClass} ${step === index ? "border-violet-300 bg-violet-300/10" : ""}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
            <progress className={challengeStyles.progress} value={step + 1} max={challenges.length} aria-labelledby={`${id}-challenge-position`} />
            <div className={challengeStyles.challengeLayout} data-revealed={revealed}>
              <div className={challengeStyles.prediction}>
                <div className={challengeStyles.questionContext}>
                  <h4
                    ref={challengeHeadingRef}
                    tabIndex={-1}
                    id={`${id}-challenge`}
                    className={challengeStyles.question}
                  >
                    {t(`challenge_${challenge.id}`)}
                  </h4>
                  <p className={challengeStyles.baseline}>{t("baseline")}</p>
                  <p className={challengeStyles.scenario}>
                    {t(scenarioMessage)}
                  </p>
                  <p className={challengeStyles.prompt}>{t("predict")}</p>
                </div>
                <div className={challengeStyles.answerGroup}>
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
                            ? "border-violet-300 bg-violet-300/10 text-violet-100"
                            : "border-slate-600 text-slate-200";
                      return (
                        <label
                          key={answer}
                          className={`flex min-h-11 items-center gap-3 rounded-lg border p-3 focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-violet-300 ${revealed ? "cursor-default" : "cursor-pointer"} ${answerClass}`}
                        >
                          <input
                            type="radio"
                            name={`${id}-prediction`}
                            value={answer}
                            checked={selected}
                            onChange={() => setPrediction(answer)}
                            className="size-4 shrink-0 accent-violet-300"
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
                      className={`${buttonClass} ${challengeStyles.checkButton} bg-violet-300/10`}
                    >
                      {t("check")}
                    </button>
                  )}
                </div>
              </div>
              {revealed && (
                <div className={challengeStyles.result}>
                  <p ref={feedbackRef} tabIndex={-1} aria-describedby={`${id}-feedback-description`} className={`${challengeStyles.feedback} flex items-start gap-2 rounded font-semibold ${isCorrect ? "text-emerald-200" : "text-amber-200"}`}>
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
                    <button
                      type="button"
                      onClick={() =>
                        hasNextChallenge ? chooseStep(step + 1) : setCompleted(true)
                      }
                      className={buttonClass}
                    >
                      {t(hasNextChallenge ? "next" : "finish")}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <p role="status" aria-atomic="true" className={completed ? challengeStyles.summary : "sr-only"}>
              {completed ? t("summary") : ""}
            </p>
          </section>
        </GravityStageLayout>
      </GravityJourneyPanel>

      <TutorContextBridge context={tutorContext} />
      {activeStage === "gravity-challenges" && (
        <div className={journeyStyles.sections}>
          <Link
            href="/three-body"
            className="inline-flex min-h-11 items-center gap-3 rounded-lg px-1 py-2 text-sm font-semibold text-sky-200 transition-colors hover:text-sky-100 focus-visible:outline-2 focus-visible:outline-sky-300 motion-reduce:transition-none"
          >
            {t("nextTopic")} <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </>
  );
};
