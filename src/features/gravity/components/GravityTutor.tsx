"use client";

import { useState } from "react";
import { hasLocale, useLocale, useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import type { GravityParameters, LearningAttempt } from "../domain/gravitation";
import type { TutorRequest } from "../application/tutor";

export const GravityTutor = ({
  parameters,
  attempt,
}: {
  parameters: GravityParameters;
  attempt?: LearningAttempt;
}) => {
  const t = useTranslations("Gravity");
  const locale = useLocale();
  const [pending, setPending] = useState(false);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<TutorRequest["mode"]>("explain");
  const [snapshot, setSnapshot] = useState("");
  const context = JSON.stringify({ parameters, attempt, locale });

  const ask = async (nextMode: TutorRequest["mode"]) => {
    if (!hasLocale(routing.locales, locale) || pending) return;
    setPending(true);
    setError("");
    setReply("");
    setMode(nextMode);
    setSnapshot(context);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          mode: nextMode,
          parameters,
          attempt,
        } satisfies TutorRequest),
        signal: AbortSignal.timeout(30000),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(
          data.error === "not_configured" ? "notConfigured" : "tutorError",
        );
        return;
      }
      if (typeof data.text !== "string" || !data.text.trim())
        throw new Error("Empty reply");
      setReply(data.text);
    } catch {
      setError("tutorError");
    } finally {
      setPending(false);
    }
  };

  return (
    <section
      aria-labelledby="tutor-title"
      className="rounded-2xl border border-sky-900 bg-sky-950/25 p-5 sm:p-6"
    >
      <p className="text-sm font-semibold tracking-wider text-cyan-200">
        {t("tutorLabel")}
      </p>
      <h2 id="tutor-title" className="mt-2 text-2xl font-bold text-white">
        {t("tutorTitle")}
      </h2>
      <p className="mt-3 text-base text-slate-300">{t("tutorIntro")}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {(["explain", "simplify", "example"] as const).map((item) => (
          <button
            key={item}
            type="button"
            disabled={pending}
            onClick={() => ask(item)}
            className="min-h-11 rounded-xl border border-sky-700 bg-slate-900 px-4 py-2 text-base font-medium text-sky-100 transition-colors hover:bg-sky-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:opacity-50"
          >
            {t(item)}
          </button>
        ))}
      </div>
      <div
        aria-live="polite"
        aria-busy={pending}
        className="mt-5 text-base leading-relaxed text-slate-100"
      >
        {pending && <p>{t("thinking")}</p>}
        {error && (
          <div>
            <p role="alert" className="text-amber-200">
              {t(error)}
            </p>
            <button
              type="button"
              onClick={() => ask(mode)}
              className="mt-2 min-h-11 rounded-lg px-2 text-sky-200 underline focus-visible:outline-2 focus-visible:outline-sky-300"
            >
              {t("retry")}
            </button>
          </div>
        )}
        {reply && (
          <>
            <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{reply}</p>
            {snapshot !== context && (
              <p className="mt-3 text-sm text-amber-200">{t("staleReply")}</p>
            )}
          </>
        )}
      </div>
      <p className="mt-5 text-sm text-slate-400">{t("aiNote")}</p>
    </section>
  );
};
