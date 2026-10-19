import { useEffect, useRef, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import type { ExperimentConfiguration } from "../../../domain/experiment-simulation";
import { ORBIT_SEARCH_LIMITS, type OrbitSearchCandidate } from "../../../types/orbit-search.types";
import { createOrbitSearchController, type OrbitSearchViewState } from "./orbit-search-controller";

export const OrbitSearchPanel = ({ configuration, disabled, onApply }: {
  configuration: ExperimentConfiguration;
  disabled: boolean;
  onApply: (candidate: OrbitSearchCandidate) => void;
}) => {
  const t = useTranslations("ThreeBody.experiment.orbitSearch");
  const format = useFormatter();
  const [state, setState] = useState<OrbitSearchViewState>({ status: "idle" });
  const controller = useRef<ReturnType<typeof createOrbitSearchController> | null>(null);
  useEffect(() => {
    const instance = createOrbitSearchController(
      () => new Worker(new URL("./orbit-search.worker.ts", import.meta.url), { type: "module" }),
      setState,
    );
    controller.current = instance;
    return () => { instance.dispose(); controller.current = null; };
  }, []);
  const progress = state.status === "finished" ? state.result
    : state.status === "searching" || state.status === "cancelled" ? state.progress : null;
  const best = progress?.best ?? null;
  const searching = state.status === "searching";
  const found = state.status === "finished" && state.result.found && best?.verified;
  const number = (value: number) => format.number(value, { maximumSignificantDigits: 7 });
  const percent = (value: number) => format.number(value, { style: "percent", maximumSignificantDigits: 3 });
  const button = "min-h-11 w-full cursor-pointer rounded-lg border border-[#60517f] px-3 py-2 text-sm font-semibold text-[#d3c5ff] hover:bg-[#302748] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa97ff] disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="mt-4 space-y-3 border-t border-[#30364b] pt-4">
      <button type="button" disabled={disabled || searching} onClick={() => controller.current?.start(configuration)} className={button}>
        {t("search")}
      </button>
      <p className="text-xs leading-5 text-slate-400">{t("help", { count: ORBIT_SEARCH_LIMITS.maxEvaluations, seconds: ORBIT_SEARCH_LIMITS.timeMs / 1000 })}</p>
      <div role="status" aria-live="polite" aria-atomic="true" className="space-y-1 text-sm text-[#d3c5ff]">
        {state.status !== "idle" && <p>{t(searching ? "searching" : state.status === "failed" ? "failed" : state.status === "cancelled" ? "cancelled" : found ? "found" : "notFound")}</p>}
        {progress && <p>{t("evaluations", { count: progress.evaluations, limit: progress.maxEvaluations })}</p>}
        {searching && <p>{t("bestError", { error: best ? percent(best.errors.combinedError) : t("pending") })}</p>}
      </div>
      {searching && (
        <button type="button" className={button} onClick={() => controller.current?.cancel()}>{t("cancel")}</button>
      )}
      {state.status === "finished" && !found && (
        <p className="text-xs leading-5 text-slate-400">{t(state.result.reason === "timeLimit" ? "timeLimit" : state.result.reason === "evaluationLimit" ? "evaluationLimit" : "noGuarantee")}</p>
      )}
      {!searching && best && (
        <section className="space-y-3 rounded-xl border border-[#303b59] bg-[#0d1320] p-3">
          <h4 className="font-semibold text-slate-100">{t(found ? "proposal" : "bestCandidate")}</h4>
          <p className="text-sm text-slate-200">{t(found ? "period" : "candidatePeriod", { period: number(best.period) })}</p>
          <dl className="grid grid-cols-2 gap-2 text-xs text-slate-300">
            {(["positionError", "velocityError", "combinedError"] as const).map((key) => (
              <div key={key} className="min-w-0">
                <dt>{t(key)}</dt><dd className="break-words font-medium text-slate-100">{percent(best.errors[key])}</dd>
              </div>
            ))}
          </dl>
          <ul className="space-y-2">
            {best.configuration.bodies.map((body, index) => (
              <li key={index} className="rounded-lg border border-[#30364b] p-2 text-xs text-slate-300">
                <p className="mb-1 font-medium text-[#d3c5ff]">{t("bodyMass", { body: index + 1, mass: number(body.mass) })}</p>
                <div className="grid grid-cols-2 gap-2 tabular-nums">
                  <span className="break-words">vₓ: {number(body.vx)}</span>
                  <span className="break-words">vᵧ: {number(body.vy)}</span>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs leading-5 text-slate-400">{t(found ? "approximate" : "unconfirmed")}</p>
          {found && <button type="button" className={button} onClick={() => onApply(best)}>{t("apply")}</button>}
        </section>
      )}
      {state.status === "finished" && !best && <p className="text-xs leading-5 text-slate-400">{t("noCandidate")}</p>}
    </div>
  );
};
