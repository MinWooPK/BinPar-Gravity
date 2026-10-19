"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type {
  ExperimentConfiguration,
  ExperimentTrajectory,
} from "../../../domain/experiment-simulation";
import { ExperimentAnimation } from "./ExperimentAnimation";

type WorkerResponse =
  | { id: number; ok: true; result: ExperimentTrajectory }
  | { id: number; ok: false; error: "tooClose" | "calculationFailed" };

type BodyField = "mass" | "x" | "y" | "vx" | "vy";

type BodyDraft = Record<BodyField, string>;

type ExperimentDraft = {
  gravity: string;
  duration: string;
  bodies: BodyDraft[];
};

const initialDraft: ExperimentDraft = {
  gravity: "1",
  duration: "12",
  bodies: [
    // Configuración inicial de Lagrange: al pulsar Ejecutar se ve una órbita estable.
    { mass: "1", x: "1", y: "0", vx: "0", vy: "0.75983568565" },
    {
      mass: "1",
      x: "-0.5",
      y: "0.86602540378",
      vx: "-0.65803700648",
      vy: "-0.379917842825",
    },
    {
      mass: "1",
      x: "-0.5",
      y: "-0.86602540378",
      vx: "0.65803700648",
      vy: "-0.379917842825",
    },
  ],
};

const bodyColors = ["#aa97ff", "#5ee7d5", "#f4c778"];

const bodyFields = [
  { key: "mass", label: "mass" },
  { key: "x", label: "positionX" },
  { key: "y", label: "positionY" },
  { key: "vx", label: "velocityX" },
  { key: "vy", label: "velocityY" },
] as const;

const parseNumber = (value: string) =>
  value.trim() === "" ? NaN : Number(value);

const cloneInitial = (): ExperimentDraft => ({
  ...initialDraft,
  bodies: initialDraft.bodies.map((body) => ({ ...body })),
});

const inputStyles =
  "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-[#48516b] " +
  "bg-[#0d1320] px-3 py-2 text-sm text-slate-100 " +
  "outline-none transition-colors focus:border-[#aa97ff] " +
  "focus-visible:ring-2 focus-visible:ring-[#aa97ff]/50";

export const ThreeBodyExperiment = ({
  active = true,
}: {
  active?: boolean;
}) => {
  const t = useTranslations("ThreeBody.experiment");

  const [draft, setDraft] = useState<ExperimentDraft>(cloneInitial);
  const [selectedBody, setSelectedBody] = useState(0);
  const [simulation, setSimulation] = useState<ExperimentTrajectory | null>(
    null,
  );
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
  const cancelCalculation = () => {
    requestIdRef.current += 1;
    workerRef.current?.terminate();
    workerRef.current = null;
    setCalculating(false);
  };

  // Al editar los parámetros, invalidamos la simulación anterior.
  const invalidateSimulation = () => {
    cancelCalculation();
    setSimulation(null);
    setPlaying(false);
    setElapsed(0);
    elapsedRef.current = 0;
    setRunError(null);
  };

  // Libera el Worker al desmontar el componente.
  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Cambiar un parámetro común.
  const updateCommon = (key: "gravity" | "duration", value: string) => {
    invalidateSimulation();
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  };

  // Cambiar un valor del cuerpo seleccionado.
  const updateBody = (key: BodyField, value: string) => {
    invalidateSimulation();
    setDraft((current) => ({
      ...current,
      bodies: current.bodies.map((body, index) =>
        index === selectedBody ? { ...body, [key]: value } : body,
      ),
    }));
  };

  // Convertir a números para validar y dibujar.
  const parsed = useMemo(
    () => ({
      gravity: parseNumber(draft.gravity),
      duration: parseNumber(draft.duration),
      bodies: draft.bodies.map((body) => ({
        mass: parseNumber(body.mass),
        x: parseNumber(body.x),
        y: parseNumber(body.y),
        vx: parseNumber(body.vx),
        vy: parseNumber(body.vy),
      })),
    }),
    [draft],
  );

  // Validar las condiciones de partida.
  const error = useMemo(() => {
    const values = [
      parsed.gravity,
      parsed.duration,
      ...parsed.bodies.flatMap((body) => [
        body.mass,
        body.x,
        body.y,
        body.vx,
        body.vy,
      ]),
    ];

    if (!values.every(Number.isFinite)) {
      return "invalidNumber" as const;
    }

    if (parsed.gravity <= 0) {
      return "invalidGravity" as const;
    }

    if (parsed.duration <= 0 || parsed.duration > 100) {
      return "invalidDurationLimit" as const;
    }

    if (parsed.bodies.some((body) => body.mass <= 0)) {
      return "invalidMass" as const;
    }

    // Evitar que dos cuerpos empiecen superpuestos
    // o demasiado próximos para la futura simulación.
    for (let i = 0; i < parsed.bodies.length; i++) {
      for (let j = i + 1; j < parsed.bodies.length; j++) {
        const a = parsed.bodies[i];
        const b = parsed.bodies[j];

        if (Math.hypot(a.x - b.x, a.y - b.y) < 0.05) {
          return "tooClose" as const;
        }
      }
    }

    return null;
  }, [parsed]);

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
      <section className="flex min-w-0 flex-col gap-4 rounded-2xl border border-[#303b59] bg-[#131724] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-slate-100">
            {t("settingsTitle")}
          </h3>

          <button
            type="button"
            onClick={() => {
              invalidateSimulation();
              setDraft(cloneInitial());
              setSelectedBody(0);
              setSpeed(1);
              setShowTrails(true);
            }}
            className="min-h-11 cursor-pointer rounded-lg border border-[#60517f] px-3 py-2 text-sm text-[#d3c5ff] hover:bg-[#302748]"
          >
            {t("reset")}
          </button>
        </div>

        {/* PARÁMETROS COMUNES */}
        <div className="grid grid-cols-2 gap-3">
          <label className="block min-w-0">
            <span className="text-sm font-medium text-slate-200">
              {t("gravity")}
            </span>

            <input
              type="number"
              step="any"
              min="0"
              value={draft.gravity}
              onChange={(event) => updateCommon("gravity", event.target.value)}
              className={inputStyles}
            />
          </label>

          <label className="block min-w-0">
            <span className="text-sm font-medium text-slate-200">
              {t("duration")}
            </span>

            <input
              type="number"
              step="any"
              min="0"
              value={draft.duration}
              onChange={(event) => updateCommon("duration", event.target.value)}
              className={inputStyles}
            />
          </label>
        </div>

        <div className="border-t border-[#30364b]" />

        {/* SELECCIÓN DEL CUERPO */}
        <div
          className="grid grid-cols-3 gap-2"
          role="group"
          aria-label={t("chooseBody")}
        >
          {draft.bodies.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-pressed={selectedBody === index}
              onClick={() => setSelectedBody(index)}
              className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border px-2 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                selectedBody === index
                  ? "border-[#aa97ff] bg-[#302748] text-white"
                  : "border-[#30364b] bg-[#0d1320] text-slate-300 hover:border-[#60517f]"
              }`}
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: bodyColors[index] }}
              />
              {t("body", { number: index + 1 })}
            </button>
          ))}
        </div>

        {/* CAMPOS DEL CUERPO SELECCIONADO */}
        <div className="grid grid-cols-2 gap-3">
          {bodyFields.map(({ key, label }) => (
            <label key={key} className="block min-w-0">
              <span className="text-sm font-medium text-slate-200">
                {t(label)}
              </span>

              <input
                type="number"
                step="any"
                min={key === "mass" ? "0" : undefined}
                value={selected[key]}
                onChange={(event) => updateBody(key, event.target.value)}
                className={inputStyles}
              />
            </label>
          ))}
        </div>

        <p className="text-xs leading-5 text-slate-400">{t("unitsNote")}</p>

        {/* EJECUTAR SIMULACIÓN */}
        <div className="mt-auto border-t border-[#30364b] pt-4">
          <button
            type="button"
            disabled={error !== null || calculating}
            onClick={runSimulation}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#aa97ff] px-5 py-3 font-semibold text-[#101122] transition-colors hover:bg-[#c4b5fd] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span aria-hidden="true">▶</span>
            {calculating ? t("calculating") : t("runSimulation")}
          </button>
          <p className="mt-2 text-center text-xs text-slate-400">
            {t("runHelp")}
          </p>
        </div>
      </section>

      {/* PANEL DERECHO: VISTA PREVIA */}
      <section className="flex min-w-0 flex-col gap-3 rounded-2xl border border-[#303b59] bg-[#0b1120] p-4">
        <h3 className="text-lg font-semibold text-slate-100">
          {t(simulation ? "simulationTitle" : "previewTitle")}
        </h3>

        <div className="flex flex-1 items-center justify-center rounded-xl border border-[#29364f] bg-[#090f1c] p-2">
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
              className="block h-auto w-full max-w-xl"
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

              {/* Ejes de referencia */}
              <path
                d="M20 130H380 M200 15V245"
                stroke="#526079"
                strokeWidth="1"
                strokeDasharray="4 6"
                opacity="0.55"
              />

              {/* Flechas y cuerpos */}
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
            <p className="p-5 text-center text-sm text-slate-400">
              {t("previewUnavailable")}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {bodyColors.map((color, index) => (
            <div
              key={color}
              className="flex items-center gap-2 text-xs text-slate-300"
            >
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              {t("body", { number: index + 1 })}
            </div>
          ))}
        </div>

        {simulation && (
          <div className="space-y-3 rounded-xl border border-[#30364b] bg-[#111827] p-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (elapsed >= simulation.duration) {
                    restartPlayback();
                  } else {
                    setPlaying((current) => !current);
                  }
                }}
                className="min-h-11 rounded-lg border border-[#60517f] px-3 py-2 text-sm text-[#d3c5ff] hover:bg-[#302748]"
              >
                {playing ? t("pause") : t("resume")}
              </button>
              <button
                type="button"
                onClick={restartPlayback}
                className="min-h-11 rounded-lg border border-[#60517f] px-3 py-2 text-sm text-[#d3c5ff] hover:bg-[#302748]"
              >
                {t("restart")}
              </button>
              <label className="ml-auto flex items-center gap-2 text-sm text-slate-300">
                <span>{t("playbackSpeed")}</span>
                <select
                  value={speed}
                  onChange={(event) => setSpeed(Number(event.target.value))}
                  className="min-h-11 rounded-lg border border-[#48516b] bg-[#0d1320] px-2 text-slate-100"
                >
                  <option value="0.5">0.5×</option>
                  <option value="1">1×</option>
                  <option value="2">2×</option>
                </select>
              </label>
            </div>
            <label className="block text-xs text-slate-300">
              <span>
                {t("elapsedTime", {
                  current: elapsed.toFixed(2),
                  total: simulation.duration.toFixed(2),
                })}
              </span>
              <input
                type="range"
                min="0"
                max={simulation.duration}
                step={simulation.duration / 600}
                value={elapsed}
                onChange={(event) => seek(Number(event.target.value))}
                aria-label={t("timeControl")}
                className="mt-2 block w-full accent-[#aa97ff]"
              />
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={showTrails}
                onChange={(event) => setShowTrails(event.target.checked)}
                className="size-4 accent-[#aa97ff]"
              />
              {t("showTrails")}
            </label>
          </div>
        )}

        <p className="text-sm leading-6 text-slate-400">
          {t(simulation ? "simulationNote" : "previewNote")}
        </p>

        {/* VALIDACIÓN */}
        <p
          role="status"
          aria-live="polite"
          className={`rounded-lg border p-3 text-sm ${
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
    </div>
  );
};
