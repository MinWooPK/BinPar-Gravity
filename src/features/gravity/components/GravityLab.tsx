"use client";

import { useId, useRef, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  challenges,
  gravitationalForce,
} from "../domain/gravitation";
import type {
  LearningAttempt,
  Prediction,
} from "../domain/gravitation";
import { GravityTutor } from "./GravityTutor";
import { GravityExperiment } from "./GravityExperiment";
import { GravityPrinciples } from "./GravityPrinciples";
import { useGravityParameters } from "./GravityParametersProvider";

const buttonClass =
  "min-h-11 rounded-xl border border-slate-600 px-4 py-2 text-base font-semibold text-slate-100 transition-colors hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:cursor-not-allowed disabled:opacity-40";

export const GravityLab = () => {
  const t = useTranslations("Gravity");
  const format = useFormatter();
  const id = useId();
  const experimentRef = useRef<HTMLElement>(null);
  const { parameters, setParameters, resetParameters } = useGravityParameters();
  const [step, setStep] = useState(0);
  const [prediction, setPrediction] = useState<Prediction | "">("");
  const [attempt, setAttempt] = useState<LearningAttempt>();
  const [revealed, setRevealed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const challenge = challenges[step];

  const reset = () => {
    resetParameters();
    setRevealed(false);
    setPrediction("");
    setAttempt(undefined);
    setCompleted(false);
  };
  const chooseStep = (index: number) => {
    setStep(index);
    reset();
  };

  return (
    <div className="mx-auto mt-8 max-w-6xl space-y-6 sm:mt-10">
      <GravityPrinciples onCheck={() => {
        experimentRef.current?.focus({ preventScroll: true });
        experimentRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
      }} />
      <section
        ref={experimentRef}
        id="gravity-laboratory"
        aria-label={t("laboratory")}
        tabIndex={-1}
        className="space-y-6 scroll-mt-48 lg:scroll-mt-28 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300"
      >
        <GravityExperiment
          parameters={parameters}
          onChange={setParameters}
          onReset={reset}
        />
      </section>
      <section
        aria-labelledby={`${id}-challenges-heading`}
        className="space-y-6 border-t border-slate-700 pt-10 sm:pt-14"
      >
        <div>
          <h2
            id={`${id}-challenges-heading`}
            className="text-2xl font-bold text-white sm:text-3xl"
          >
            {t("challengesTab")}
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-300">
            {t("challengesHint")}
          </p>
        </div>
        <section
          aria-labelledby={`${id}-challenge`}
          className="rounded-2xl border border-slate-700 bg-[#111827] p-5 sm:p-6"
        >
          <div className="flex gap-2" aria-label={t("challenges")}>
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
          <h3
            id={`${id}-challenge`}
            className="mt-5 text-2xl font-bold text-white"
          >
            {t(`challenge_${challenge.id}`)}
          </h3>
          <p className="mt-3 text-base text-slate-300">{t("baseline")}</p>
          <p className="mt-3 text-base text-slate-100">{t("predict")}</p>
          <fieldset
            disabled={revealed}
            className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"
          >
            <legend className="sr-only">{t("predict")}</legend>
            {(["same", "double", "four", "quarter"] as const).map((answer) => (
              <label
                key={answer}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border p-3 text-base ${prediction === answer ? "border-sky-400 bg-sky-900/30 text-sky-100" : "border-slate-600 text-slate-200"}`}
              >
                <input
                  type="radio"
                  name={`${id}-prediction`}
                  value={answer}
                  checked={prediction === answer}
                  onChange={() => setPrediction(answer)}
                  className="size-4 accent-sky-300"
                />
                {t(answer)}
              </label>
            ))}
          </fieldset>
          {!revealed ? (
            <button
              type="button"
              disabled={!prediction}
              onClick={() => {
                if (prediction) {
                  setParameters(challenge.parameters);
                  setAttempt({ challenge: challenge.id, prediction });
                  setRevealed(true);
                }
              }}
              className={`${buttonClass} mt-4 w-full bg-blue-700 hover:bg-blue-600`}
            >
              {t("check")}
            </button>
          ) : (
            <div className="mt-5" aria-live="polite">
              <p className="font-semibold text-sky-200">
                {t(
                  prediction === challenge.answer ? "correct" : "keepLearning",
                )}
              </p>
              <p className="mt-2 text-base text-slate-200">
                {t(`feedback_${challenge.id}`)}
              </p>
              <p className="mt-2 text-sm text-slate-400">{t("feedbackNote")}</p>
              <button
                type="button"
                onClick={() =>
                  step < 2 ? chooseStep(step + 1) : setCompleted(true)
                }
                className={`${buttonClass} mt-4 w-full`}
              >
                {t(step < 2 ? "next" : "finish")}
              </button>
            </div>
          )}
          {revealed && (
            <div className="mt-4 rounded-xl border border-sky-800 bg-sky-950/40 p-4">
              <p className="text-base text-slate-200">{t("challengeForce")}</p>
              <p className="mt-1 font-mono text-xl text-sky-200">
                {format.number(gravitationalForce(challenge.parameters), {
                  notation: "scientific",
                  maximumSignificantDigits: 3,
                })}{" "}
                N
              </p>
              <button
                type="button"
                onClick={() => {
                  experimentRef.current?.focus();
                  experimentRef.current?.scrollIntoView({
                    behavior: window.matchMedia(
                      "(prefers-reduced-motion: reduce)",
                    ).matches
                      ? "instant"
                      : "smooth",
                    block: "start",
                  });
                }}
                className={`${buttonClass} mt-3`}
              >
                {t("seeExperiment")}
              </button>
            </div>
          )}
          {completed && (
            <p role="status" className="mt-4 text-base text-emerald-200">
              {t("summary")}
            </p>
          )}
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
