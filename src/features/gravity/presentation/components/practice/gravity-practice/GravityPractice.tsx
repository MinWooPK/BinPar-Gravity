"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";

import { usePracticeSession } from "../usePracticeSession";
import { PracticeReport } from "../practice-report/PracticeReport";

import { PracticeQuestionPanel } from "./PracticeQuestionPanel";
import { usePracticeFocus } from "./usePracticeFocus";

// Gestiona la etapa 04 · Comprueba y sus estados:
// introducción, pregunta, corrección e informe final.
export const GravityPractice = () => {
  const t = useTranslations("Practice");
  const id = useId();

  // Obtiene el estado y las acciones de la sesión.
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

  // Mantiene la gestión accesible del foco al cambiar el contenido.
  const focusRef = usePracticeFocus(view);

  const question = view?.question;

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

      {/* Pantalla inicial para comenzar la evaluación. */}
      {!view && (
        <div className="mt-5 space-y-4">
          <p className="max-w-prose leading-7">{t("introduction")}</p>

          <button
            type="button"
            className="inline-flex min-h-11 scroll-mb-24 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none border border-violet-300 bg-violet-300 text-slate-950 enabled:cursor-pointer enabled:hover:bg-violet-200 w-full sm:w-auto"
            disabled={pending}
            onClick={start}
          >
            {t(pending ? "loading" : "start")}
          </button>
        </div>
      )}

      {/* Muestra el informe o la pregunta correspondiente. */}
      {view?.report ? (
        <PracticeReport
          view={view}
          report={view.report}
          headingRef={focusRef}
          pending={pending}
          onRestart={start}
        />
      ) : (
        view && (
          <PracticeQuestionPanel
            id={id}
            view={view}
            answer={answer}
            onChange={setAnswer}
            hintOpen={hintOpen}
            onToggleHint={toggleHint}
            pending={pending}
            onCheck={check}
            onNext={next}
            headingRef={focusRef}
          />
        )
      )}

      {/* Anuncia las solicitudes pendientes a los lectores de pantalla. */}
      <p
        role="status"
        aria-atomic="true"
        className={pending ? "mt-4 text-sm text-cyan-100" : "sr-only"}
      >
        {pending ? t(question && !view?.feedback ? "checking" : "loading") : ""}
      </p>

      {/* Muestra los errores y permite reintentar. */}
      {error && (
        <div
          role="alert"
          className="mt-4 space-y-3 rounded-xl border border-amber-300/30 bg-amber-300/5 p-4 text-amber-200"
        >
          <p>{t(`errors.${error}`)}</p>

          <button
            type="button"
            className="inline-flex min-h-11 scroll-mb-24 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none border border-slate-500/60 text-slate-200 enabled:cursor-pointer enabled:hover:border-violet-300/60 enabled:hover:bg-violet-300/10"
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
