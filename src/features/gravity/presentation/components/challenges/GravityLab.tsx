"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TutorContextBridge } from "@/features/ai/presentation/providers/TutorProvider";
import type { TutorContext } from "../../../../ai/types/tutor.types";
import { challenges, initialParameters } from "../../../domain/gravitation";
import type { LearningAttempt, Prediction } from "../../../types/gravity.types";
import { GravityExperiment } from "../experiment/GravityExperiment";
import { GravityChallengeComparison } from "./GravityChallengeComparison";
import { GravityJourneyPanel, useActiveGravityStage } from "../GravityJourneyTabs";
import { GravityStageLayout } from "../shared/GravityStageLayout";
import { GravityFormulaButton } from "../understanding/GravityFormulaAccess";
import { gravityStageById } from "../../../application/gravityJourney";
import { gravityJourneyStyles as journeyStyles } from "../GravityJourney.styles";
import css from "./GravityChallenges.module.css";
import { useGravityParameters } from "../../providers/GravityParametersProvider";

const challengeStyles = {
  "stage": "min-w-0",
  "challengeCard": "min-w-0 [padding:14px] border border-solid border-lab-line [border-radius:14px] [background:linear-gradient(145deg,_#131724,_#0e121d)] [@media(max-width:520px)]:[padding:14px]",
  "titleRow": `${css["titleRow"]} flex flex-wrap items-center justify-between [gap:8px_12px]`,
  "cardHeader": `${css["cardHeader"]} flex flex-wrap items-center justify-between [gap:8px_12px] [margin-top:4px]`,
  "progress": `${css["progress"]} block w-full [height:5px] [margin-top:10px] overflow-hidden [border:0] [border-radius:8px] [background:#30364b] [accent-color:#aa97ff]`,
  "challengeLayout": "grid [grid-template-columns:minmax(0,_1fr)] [gap:8px] [margin-top:0]",
  "prediction": "min-w-0",
  "result": `${css["result"]} min-w-0 grid [align-content:start] [gap:10px]`,
  "questionContext": "min-w-0",
  "answerGroup": "min-w-0",
  "question": `${css["question"]} m-0 [border-radius:4px] text-lab-text [font-size:1.125rem] font-semibold [line-height:1.4] [overflow-wrap:anywhere] [scroll-margin-block:16px]`,
  "baseline": "[margin:10px_0_0] [padding:10px_12px] [border:1px_solid_#aa97ff30] [border-radius:8px] [background:#aa97ff08] [color:#d6c9f2] [font-size:.875rem] [line-height:1.5]",
  "scenario": "[margin:8px_0_0] [color:#aeb8cb] [font-size:.8125rem] [line-height:1.5]",
  "prompt": "[margin:12px_0_0] [color:#e4e8f2] [font-size:.9375rem] [line-height:1.5]",
  "answers": `${css["answers"]} grid [grid-template-columns:minmax(0,_1fr)] [gap:8px] min-w-0 [margin:10px_0_0] p-0 [border:0] min-[640px]:[grid-template-columns:repeat(2,_minmax(0,_1fr))]`,
  "checkButton": "w-full [margin-top:0]",
  "feedback": `${css["feedback"]} m-0 [font-size:.9375rem] [line-height:1.5] [scroll-margin-block:16px]`,
  "explanation": "m-0 [color:#d0d4e3] [font-size:.875rem] [line-height:1.5] [overflow-wrap:anywhere]",
  "feedbackNote": `${css["feedbackNote"]} m-0 [color:#aeb8cb] [font-size:.875rem] [line-height:1.5] [overflow-wrap:anywhere]`,
  "comparison": `${css["comparison"]} min-w-0 [padding:12px] [border:1px_solid_#aa97ff35] [border-radius:10px] [background:#aa97ff08]`,
  "actions": `${css["actions"]} flex flex-wrap [gap:8px] [margin-top:10px] items-center`,
  "nextTopic": `${css["nextTopic"]} inline-flex [flex:1] items-center justify-center [gap:8px] [padding:8px] [color:#bae6fd] [font-size:.875rem] font-semibold [line-height:1.5] [border-radius:8px]`,
  "summary": "[margin:14px_0_0] [color:#a7f3d0] [font-size:.875rem] [line-height:1.5]",
  "selection": "m-0 [color:#c4cce0] [font-size:.875rem] [line-height:1.5]",
  "questionDetails": `${css["questionDetails"]} min-w-0`,
} as const;

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
  // Entering a challenge restores its scenario and synchronizes the shared formula.
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
            <p className="sr-only">{t("challengesHint")}</p>
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
                  <p className={challengeStyles.selection}>
                    {t("answerYourPrediction")}: {prediction && t(prediction)}
                    {!isCorrect && <> · {t("answerCorrect")}: {t(challenge.answer)}</>}
                  </p>
                </div>
              )}
              <details className={challengeStyles.questionDetails} open={!revealed} data-revealed={revealed}>
                <summary>{t("reviewChallenge")}</summary>
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
                  </div>
                </div>
                {revealed && <p className={challengeStyles.feedbackNote}>{t("feedbackNote")}</p>}
              </details>
            </div>
            <div className={challengeStyles.actions}>
              {!revealed ? (
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
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    hasNextChallenge ? chooseStep(step + 1) : setCompleted(true)
                  }
                  className={buttonClass}
                >
                  {t(hasNextChallenge ? "next" : "finish")}
                </button>
              )}
              <Link href="/three-body" className={challengeStyles.nextTopic}>
                {t("nextTopic")} <span aria-hidden="true">→</span>
              </Link>
            </div>
            <p role="status" aria-atomic="true" className={completed ? challengeStyles.summary : "sr-only"}>
              {completed ? t("summary") : ""}
            </p>
          </section>
        </GravityStageLayout>
      </GravityJourneyPanel>

      <TutorContextBridge context={tutorContext} />
    </>
  );
};
