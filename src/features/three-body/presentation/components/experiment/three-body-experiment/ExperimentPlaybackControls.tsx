"use client";

import { useTranslations } from "next-intl";
import { Play, Pause, SkipBack, Gauge, Clock3, Route } from "lucide-react";
import type { ExperimentController } from "./useExperimentSimulation";

// Controla reproducción, reinicio, velocidad, estelas y barra de tiempo.
export const ExperimentPlaybackControls = ({
  experiment,
}: {
  experiment: ExperimentController;
}) => {
  const t = useTranslations("ThreeBody.experiment");
  const {
    simulation,
    playing,
    elapsed,
    speed,
    setSpeed,
    showTrails,
    setShowTrails,
    setPlaying,
    restartPlayback,
    seek,
  } = experiment;

  return (
    <div className="space-y-2 rounded-xl  mt-2 border border-[#30364b] bg-[#111827] p-2.5">
      {/* BOTONES Y OPCIONES */}
      <div className="flex flex-wrap items-center gap-2">
        {/* PLAY / PAUSA */}
        <button
          type="button"
          disabled={!simulation}
          onClick={() => {
            if (!simulation) return;

            if (elapsed >= simulation.duration) {
              restartPlayback();
            } else {
              setPlaying((current) => !current);
            }
          }}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#60517f] px-3 py-2 text-xs font-semibold text-[#d3c5ff] transition-colors hover:bg-[#302748] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {playing ? (
            <Pause size={16} aria-hidden="true" />
          ) : (
            <Play size={16} aria-hidden="true" />
          )}

          {playing ? t("pause") : t("resume")}
        </button>

        {/* REINICIAR */}
        <button
          type="button"
          disabled={!simulation}
          onClick={restartPlayback}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#60517f] px-3 py-2 text-xs font-semibold text-[#d3c5ff] transition-colors hover:bg-[#302748] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SkipBack size={16} aria-hidden="true" />
          {t("restart")}
        </button>

        {/* VELOCIDAD */}
        <label className="flex min-h-11 items-center gap-2 text-xs text-slate-300">
          <Gauge
            size={16}
            className="shrink-0 text-[#b9a8ff]"
            aria-hidden="true"
          />

          <span>{t("playbackSpeed")}</span>

          <select
            value={speed}
            disabled={!simulation}
            onChange={(event) => setSpeed(Number(event.target.value))}
            className="min-h-11 rounded-lg border border-[#48516b] bg-[#0d1320] px-2 text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <option value="0.5">0.5×</option>
            <option value="1">1×</option>
            <option value="2">2×</option>
          </select>
        </label>

        {/* MOSTRAR TRAYECTORIAS */}
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-xs text-slate-300">
          <Route
            size={16}
            className="shrink-0 text-[#b9a8ff]"
            aria-hidden="true"
          />

          <input
            type="checkbox"
            checked={showTrails}
            disabled={!simulation}
            onChange={(event) => setShowTrails(event.target.checked)}
            className="size-4 accent-[#aa97ff] disabled:cursor-not-allowed disabled:opacity-40"
          />

          {t("showTrails")}
        </label>
      </div>

      {/* TIEMPO Y BARRA */}
      <label className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-slate-300">
        <Clock3
          size={16}
          className="shrink-0 text-[#b9a8ff]"
          aria-hidden="true"
        />

        <span className="shrink-0 tabular-nums">
          {t("elapsedTime", {
            current: simulation ? elapsed.toFixed(2) : "0.00",
            total: simulation ? simulation.duration.toFixed(2) : "—",
          })}
        </span>

        <input
          type="range"
          min="0"
          max={simulation?.duration ?? 1}
          step={simulation ? simulation.duration / 600 : 1}
          value={simulation ? elapsed : 0}
          disabled={!simulation}
          onChange={(event) => seek(Number(event.target.value))}
          aria-label={t("timeControl")}
          className="min-h-11 min-w-28 flex-1 cursor-pointer accent-[#aa97ff] disabled:cursor-not-allowed disabled:opacity-40"
        />
      </label>
    </div>
  );
};
