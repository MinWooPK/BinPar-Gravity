"use client";

import {
  useCallback,
  useLayoutEffect,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import { useThreeBodyExperiment } from "../../providers/ThreeBodyExperimentProvider";
import { parseExperimentDraft } from "../../../application/experimentDraft";
import { experimentConfigurationError } from "../../../application/experimentConfiguration";
import type { ExperimentConfiguration } from "../../../domain/experiment-simulation";
import type { AnalyzedExperimentTrajectory } from "../../../domain/periodicity-detection";
import { ExperimentAnimation } from "./ExperimentAnimation";
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  LoaderCircle,
  Gauge,
  Clock3,
  Route,
} from "lucide-react";

type WorkerResponse =
  | { id: number; ok: true; result: AnalyzedExperimentTrajectory }
  | { id: number; ok: false; error: "tooClose" | "calculationFailed" };

type BodyField = "mass" | "x" | "y" | "vx" | "vy";

const bodyColors = ["#aa97ff", "#5ee7d5", "#f4c778"];

const bodyFields = [
  { key: "mass", label: "mass" },
  { key: "x", label: "positionX" },
  { key: "y", label: "positionY" },
  { key: "vx", label: "velocityX" },
  { key: "vy", label: "velocityY" },
] as const;

const inputStyles =
  "min-h-11 min-w-0 w-full bg-[#0d1320] " +
  "px-3 py-2 text-sm text-slate-100 outline-none " +
  "focus-visible:ring-2 focus-visible:ring-[#aa97ff]/50 " +
  "[appearance:textfield] " +
  "[&::-webkit-inner-spin-button]:appearance-none " +
  "[&::-webkit-outer-spin-button]:appearance-none";

const bodySymbols = {
  mass: "m",
  x: "x",
  y: "y",
  vx: "vₓ",
  vy: "vᵧ",
} as const;

export const ThreeBodyExperiment = ({
  active = true,
}: {
  active?: boolean;
}) => {
  const t = useTranslations("ThreeBody.experiment");

  const { draft, selectedBody, dispatch, registerInvalidation } =
    useThreeBodyExperiment();
  const setSelectedBody = (index: number) =>
    dispatch({ type: "select", index });
  const [simulation, setSimulation] =
    useState<AnalyzedExperimentTrajectory | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [showTrails, setShowTrails] = useState(true);
  const [runError, setRunError] = useState<
    "tooClose" | "calculationFailed" | null
  >(null);
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const elapsedRef = useRef(0);

  const markerId = useId();

  // Cancela trabajos antiguos. Las respuestas tardías no pueden sobrescribir datos nuevos.
  const cancelCalculation = useCallback(() => {
    requestIdRef.current += 1;
    workerRef.current?.terminate();
    workerRef.current = null;
    setCalculating(false);
  }, []);

  // Al editar los parámetros, invalidamos la simulación anterior.
  const invalidateSimulation = useCallback(() => {
    cancelCalculation();
    setSimulation(null);
    setPlaying(false);
    setElapsed(0);
    elapsedRef.current = 0;
    setRunError(null);
  }, [cancelCalculation]);

  useLayoutEffect(
    () => registerInvalidation(invalidateSimulation),
    [registerInvalidation, invalidateSimulation],
  );

  // Libera el Worker al desmontar el componente.
  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const updateCommon = (key: "gravity" | "duration", value: string) =>
    dispatch({ type: "common", key, value });
  const updateBody = (key: BodyField, value: string) =>
    dispatch({ type: "body", index: selectedBody, key, value });
  const parsed = useMemo(() => parseExperimentDraft(draft), [draft]);
  const error = useMemo(() => experimentConfigurationError(parsed), [parsed]);

  // Preparar las posiciones de la vista previa.
  const preview = useMemo(() => {
    const valid = parsed.bodies.every((body) =>
      [body.x, body.y, body.vx, body.vy].every(Number.isFinite),
    );

    if (!valid) return null;

    const extent = Math.max(
      1,
      ...parsed.bodies.flatMap((body) => [Math.abs(body.x), Math.abs(body.y)]),
    );

    const scale = 98 / extent;

    return parsed.bodies.map((body, index) => {
      const speed = Math.hypot(body.vx, body.vy);
      const arrowLength =
        speed === 0 ? 0 : Math.min(46, Math.max(15, speed * 65));

      const x = 200 + body.x * scale;
      const y = 130 - body.y * scale;

      return {
        index,
        x,
        y,
        arrowX: x + (speed ? (body.vx / speed) * arrowLength : 0),
        arrowY: y - (speed ? (body.vy / speed) * arrowLength : 0),
        speed,
      };
    });
  }, [parsed]);

  // Recibe exactamente los datos comprobados en la etapa 2.
  const runSimulation = () => {
    if (error || calculating) return;
    invalidateSimulation();
    setCalculating(true);
    const id = ++requestIdRef.current;

    const config: ExperimentConfiguration = {
      gravity: parsed.gravity,
      duration: parsed.duration,
      bodies: parsed.bodies,
    };

    try {
      // Next.js empaqueta el Worker como módulo separado.
      const worker = new Worker(
        new URL("./experiment.worker.ts", import.meta.url),
        {
          type: "module",
        },
      );
      workerRef.current = worker;

      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        if (event.data.id !== requestIdRef.current) return;
        worker.terminate();
        workerRef.current = null;
        setCalculating(false);

        if (event.data.ok) {
          setSimulation(event.data.result);
          elapsedRef.current = 0;
          setElapsed(0);
          setPlaying(true);
        } else {
          setRunError(event.data.error);
        }
      };

      worker.onerror = () => {
        if (requestIdRef.current !== id) return;
        worker.terminate();
        workerRef.current = null;
        setCalculating(false);
        setRunError("calculationFailed");
      };

      worker.postMessage({ id, config });
    } catch {
      workerRef.current?.terminate();
      workerRef.current = null;
      setCalculating(false);
      setRunError("calculationFailed");
    }
  };

  // Avanza el tiempo físico solo si la etapa está visible y se está reproduciendo.
  // No hay módulo (%) ni bucle: una simulación libre puede NO ser periódica.
  useEffect(() => {
    if (!simulation || !playing || !active) return;

    let frame = 0;
    let previous: number | null = null;
    const tick = (now: number) => {
      if (document.hidden) {
        previous = null;
        frame = requestAnimationFrame(tick);
        return;
      }
      if (previous !== null) {
        const deltaSeconds = Math.min(0.1, (now - previous) / 1000);
        // Por defecto recorremos la duración configurada en 12 segundos reales.
        const next = Math.min(
          simulation.duration,
          elapsedRef.current +
            deltaSeconds * (simulation.duration / 12) * speed,
        );
        elapsedRef.current = next;
        setElapsed(next);
        if (next >= simulation.duration) {
          setPlaying(false);
          return;
        }
      }
      previous = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [simulation, playing, speed, active]);

  const restartPlayback = () => {
    elapsedRef.current = 0;
    setElapsed(0);
    if (simulation) setPlaying(true);
  };

  const seek = (value: number) => {
    if (!simulation || !Number.isFinite(value)) return;
    const next = Math.max(0, Math.min(simulation.duration, value));
    elapsedRef.current = next;
    setElapsed(next);
    if (next >= simulation.duration) setPlaying(false);
  };

  const selected = draft.bodies[selectedBody];

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* PANEL IZQUIERDO: CONFIGURACIÓN */}

      {/* PANEL IZQUIERDO: CONFIGURACIÓN */}
      <section className="flex min-w-0 flex-col gap-2.5 rounded-2xl border border-[#39455f] bg-linear-to-b from-[#151a2a] to-[#101421] p-3">
        {/* ENCABEZADO */}
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="min-w-0 text-base font-semibold text-slate-100">
            {t("settingsTitle")}
          </h3>
        </div>

        {/* PARÁMETROS GENERALES */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#b9a8ff]">
            {t("commonParameters")}
          </h4>

          <div className="grid min-w-0 grid-cols-2 gap-2">
            {/* GRAVEDAD */}
            <label className="block min-w-0">
              <span className="text-xs text-slate-300">{t("gravity")}</span>

              <div className="mt-1 flex min-w-0 overflow-hidden rounded-lg border border-[#48516b] bg-[#0d1320] transition-colors focus-within:border-[#aa97ff] focus-within:ring-2 focus-within:ring-[#aa97ff]/30">
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  value={draft.gravity}
                  onChange={(event) =>
                    updateCommon("gravity", event.target.value)
                  }
                  className={inputStyles}
                />

                <span
                  aria-hidden="true"
                  className="flex min-w-11 shrink-0 items-center justify-center border-l border-[#48516b] bg-[#302748] px-2 font-mono text-sm font-semibold text-[#b9a8ff]"
                >
                  G
                </span>
              </div>
            </label>

            {/* DURACIÓN */}
            <label className="block min-w-0">
              <span className="text-xs text-slate-300">{t("duration")}</span>

              <div className="mt-1 flex min-w-0 overflow-hidden rounded-lg border border-[#48516b] bg-[#0d1320] transition-colors focus-within:border-[#aa97ff] focus-within:ring-2 focus-within:ring-[#aa97ff]/30">
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  value={draft.duration}
                  onChange={(event) =>
                    updateCommon("duration", event.target.value)
                  }
                  className={inputStyles}
                />

                <span
                  aria-hidden="true"
                  className="flex min-w-11 shrink-0 items-center justify-center border-l border-[#48516b] bg-[#302748] px-2 font-mono text-sm font-semibold text-[#b9a8ff]"
                >
                  t<sub>max</sub>
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* SELECCIÓN DEL CUERPO */}
        <div className="space-y-2 border-t border-[#30364b] pt-2.5">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#b9a8ff]">
              {t("chooseBody")}
            </h4>

            <div
              role="group"
              aria-label={t("chooseBody")}
              className="grid grid-cols-3 gap-1.5"
            >
              {draft.bodies.map((_, index) => {
                const isSelected = selectedBody === index;

                return (
                  <button
                    key={index}
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={t("body", {
                      number: index + 1,
                    })}
                    title={t("body", {
                      number: index + 1,
                    })}
                    onClick={() => setSelectedBody(index)}
                    style={{
                      borderColor: isSelected ? bodyColors[index] : undefined,
                    }}
                    className={`flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 ${
                      isSelected
                        ? "bg-[#302748] text-white"
                        : "border-[#303b59] bg-[#0b1120] text-slate-300 hover:border-[#60517f]"
                    }`}
                  >
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor: bodyColors[index],
                      }}
                    />
                    {t("body", { number: index + 1 })}
                  </button>
                );
              })}
            </div>
          </div>

          {/* INPUTS DEL CUERPO SELECCIONADO */}
          <div className="grid min-w-0 grid-cols-2 gap-2 min-[520px]:grid-cols-3">
            {bodyFields.map(({ key, label }) => (
              <label key={key} className="block min-w-0">
                {/* NOMBRE DEL PARÁMETRO */}
                <span className="text-xs text-slate-300">{t(label)}</span>

                {/* INPUT + VARIABLE */}
                <div className="mt-1 flex min-w-0 overflow-hidden rounded-lg border border-[#48516b] bg-[#0d1320] transition-colors focus-within:border-[#aa97ff] focus-within:ring-2 focus-within:ring-[#aa97ff]/30">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min={key === "mass" ? "0" : undefined}
                    value={selected[key]}
                    onChange={(event) => updateBody(key, event.target.value)}
                    className={inputStyles}
                  />

                  {/* SÍMBOLO FÍSICO */}
                  <span
                    aria-hidden="true"
                    className="flex min-w-11 shrink-0 items-center justify-center border-l border-[#48516b] bg-[#302748] px-2 font-mono text-sm font-semibold text-[#b9a8ff]"
                  >
                    {bodySymbols[key]}
                    <sub>{selectedBody + 1}</sub>
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* NOTA SOBRE LAS UNIDADES */}
        <p className="text-xs leading-4 text-slate-400">{t("unitsNote")}</p>

        {/* VALIDACIÓN */}
        <p
          role="status"
          aria-live="polite"
          className={`rounded-lg border px-3 py-2 text-xs leading-5 sm:text-sm ${
            error || runError
              ? "border-[#805052] bg-[#321c23] text-[#fecaca]"
              : "border-[#315c5b] bg-[#10242a] text-[#a7f3e5]"
          }`}
        >
          {error
            ? t(error)
            : runError
              ? t(runError)
              : calculating
                ? t("calculating")
                : simulation
                  ? t(
                      playing
                        ? "running"
                        : elapsed >= simulation.duration
                          ? "finished"
                          : "paused",
                    )
                  : t("valid")}
        </p>
      </section>

      {/* PANEL DERECHO: VISTA PREVIA Y SIMULACIÓN */}
      <section className="flex min-w-0 flex-col self-start gap-2 rounded-2xl border border-[#303b59] bg-[#0b1120] p-3">
        {/* ENCABEZADO */}
        <div className="flex min-w-0 items-center justify-between gap-2">
          <h3 className="min-w-0 text-base font-semibold leading-tight text-slate-100 sm:text-lg">
            {t(simulation ? "simulationTitle" : "previewTitle")}
          </h3>

          <div className="flex shrink-0 items-center gap-1.5">
            {/* EJECUTAR SIMULACIÓN */}
            <button
              type="button"
              disabled={error !== null || calculating}
              onClick={runSimulation}
              aria-label={calculating ? t("calculating") : t("runSimulation")}
              title={calculating ? t("calculating") : t("runSimulation")}
              className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#aa97ff] px-2 py-2 text-sm font-semibold text-[#101122] transition-colors hover:bg-[#c4b5fd] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 disabled:cursor-not-allowed disabled:opacity-50 2xl:px-3"
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

              <span className=" whitespace-nowrap 2xl:inline">
                {calculating ? t("calculating") : t("runSimulation")}
              </span>
            </button>

            {/* RESTABLECER PARÁMETROS */}
            <button
              type="button"
              onClick={() => {
                dispatch({ type: "reset" });
                setSpeed(1);
                setShowTrails(true);
              }}
              aria-label={t("reset")}
              title={t("reset")}
              className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#60517f] px-2 py-2 text-sm font-semibold text-[#d3c5ff] transition-colors hover:bg-[#302748] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 2xl:px-3"
            >
              <RotateCcw
                size={14}
                strokeWidth={2}
                className="shrink-0"
                aria-hidden="true"
              />

              <span className=" whitespace-nowrap 2xl:inline">
                {t("reset")}
              </span>
            </button>
          </div>
        </div>

        {/* VISTA PREVIA / ANIMACIÓN */}
        <div className="flex min-w-0 items-center justify-center rounded-xl border border-[#29364f] bg-[#090f1c] p-1.5">
          <div className="w-full max-w-[400px]">
            {simulation ? (
              <ExperimentAnimation
                trajectory={simulation}
                elapsed={elapsed}
                showTrails={showTrails}
                label={t("simulationTitle")}
              />
            ) : preview ? (
              <svg
                viewBox="0 0 400 260"
                className="block h-auto w-full"
                role="img"
                aria-label={t("previewDescription")}
              >
                <defs>
                  <marker
                    id={markerId}
                    markerWidth="6"
                    markerHeight="6"
                    refX="5"
                    refY="3"
                    orient="auto"
                  >
                    <path
                      d="M0 0L6 3L0 6"
                      fill="none"
                      stroke="#a7f3e5"
                      strokeWidth="1.5"
                    />
                  </marker>
                </defs>

                {/* EJES DE REFERENCIA */}
                <path
                  d="M20 130H380 M200 15V245"
                  stroke="#526079"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                  opacity="0.55"
                />

                {/* FLECHAS Y CUERPOS */}
                {preview.map((body) => (
                  <g key={body.index}>
                    {body.speed > 0 && (
                      <line
                        x1={body.x}
                        y1={body.y}
                        x2={body.arrowX}
                        y2={body.arrowY}
                        stroke="#a7f3e5"
                        strokeWidth="2"
                        markerEnd={`url(#${markerId})`}
                      />
                    )}

                    <circle
                      cx={body.x}
                      cy={body.y}
                      r="19"
                      fill={bodyColors[body.index]}
                      fillOpacity="0.17"
                      stroke={bodyColors[body.index]}
                      strokeWidth="1.5"
                    />

                    <circle
                      cx={body.x}
                      cy={body.y}
                      r="8"
                      fill={bodyColors[body.index]}
                    />
                  </g>
                ))}
              </svg>
            ) : (
              <p className="p-4 text-center text-sm text-slate-400">
                {t("previewUnavailable")}
              </p>
            )}
          </div>
        </div>

        {/* LEYENDA DE LOS CUERPOS */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {bodyColors.map((color, index) => (
            <div
              key={color}
              className="flex items-center gap-1.5 text-xs text-slate-300"
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: color }}
              />

              {t("body", { number: index + 1 })}
            </div>
          ))}
        </div>

        {/* CONTROLES DE REPRODUCCIÓN */}

        {/* CONTROLES DE REPRODUCCIÓN */}
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
      </section>
    </div>
  );
};
