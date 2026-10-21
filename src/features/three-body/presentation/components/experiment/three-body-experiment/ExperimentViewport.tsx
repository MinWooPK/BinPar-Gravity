"use client";

import { useTranslations } from "next-intl";
import { Play, RotateCcw, LoaderCircle } from "lucide-react";

import { useThreeBodyExperiment } from "../../../providers/ThreeBodyExperimentProvider";
import { ExperimentAnimation } from "../ExperimentAnimation";
import { bodyColors } from "./experiment.constants";
import { ExperimentPreview } from "./ExperimentPreview";
import { ExperimentPlaybackControls } from "./ExperimentPlaybackControls";
import type { ExperimentController } from "./useExperimentSimulation";

// Muestra la vista previa y la simulación de los tres cuerpos.
export const ExperimentViewport = ({
  experiment,
}: {
  experiment: ExperimentController;
}) => {
  const t = useTranslations("ThreeBody.experiment");
  const { dispatch } = useThreeBodyExperiment();

  const {
    simulation,
    parsed,
    elapsed,
    showTrails,
    error,
    calculating,
    runSimulation,
    setSpeed,
    setShowTrails,
  } = experiment;

  const runLabel = t(calculating ? "calculating" : "runSimulation");

  return (
    <section className="flex min-w-0 flex-col self-start gap-2 rounded-2xl border border-[#303b59] bg-[#0b1120] p-3">
      {/* Encabezado y acciones. */}
      <div className="mb-5 flex min-w-0 flex-col gap-5 sm:mb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
        <h3 className="min-w-0 text-base leading-tight font-semibold text-slate-100 sm:text-lg">
          {t(simulation ? "simulationTitle" : "previewTitle")}
        </h3>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            disabled={error !== null || calculating}
            onClick={runSimulation}
            aria-label={runLabel}
            title={runLabel}
            className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#aa97ff] 
            px-2 py-2 text-sm font-semibold text-[#101122] transition-colors hover:bg-[#c4b5fd] 
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 disabled:cursor-not-allowed disabled:opacity-50 2xl:px-3"
          >
            {calculating ? (
              <LoaderCircle
                size={14}
                strokeWidth={2}
                className="shrink-0 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Play
                size={14}
                strokeWidth={2}
                fill="currentColor"
                className="shrink-0"
                aria-hidden="true"
              />
            )}

            <span className="whitespace-nowrap">{runLabel}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              dispatch({ type: "reset" });
              setSpeed(1);
              setShowTrails(true);
            }}
            aria-label={t("reset")}
            title={t("reset")}
            className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-xl border
             border-[#60517f] px-2 py-2 text-sm font-semibold text-[#d3c5ff] transition-colors hover:bg-[#302748] 
             focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 2xl:px-3"
          >
            <RotateCcw
              size={14}
              strokeWidth={2}
              className="shrink-0"
              aria-hidden="true"
            />

            <span className="whitespace-nowrap">{t("reset")}</span>
          </button>
        </div>
      </div>

      {/* Vista previa o animación. */}
      <div className="flex min-w-0 items-center justify-center rounded-xl border border-[#29364f] bg-[#090f1c] p-1.5">
        <div className="w-full max-w-100">
          {simulation ? (
            <ExperimentAnimation
              trajectory={simulation}
              elapsed={elapsed}
              showTrails={showTrails}
              label={t("simulationTitle")}
            />
          ) : (
            <ExperimentPreview parsed={parsed} />
          )}
        </div>
      </div>

      {/* Leyenda de los cuerpos. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {bodyColors.map((color, index) => (
          <div
            key={color}
            className="flex items-center gap-1.5 text-xs text-slate-300"
          >
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />

            {t("body", { number: index + 1 })}
          </div>
        ))}
      </div>

      <ExperimentPlaybackControls experiment={experiment} />
    </section>
  );
};
