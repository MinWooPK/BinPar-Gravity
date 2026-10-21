"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useThreeBodyExperiment } from "../../../providers/ThreeBodyExperimentProvider";
import { parseExperimentDraft } from "../../../../application/experimentDraft";
import { experimentConfigurationError } from "../../../../application/experimentConfiguration";
import type { ExperimentConfiguration } from "../../../../domain/experiment-simulation";

import type {
  ExperimentWorkerResponse,
  SimulationError,
  SimulationResult,
} from "./experiment.types";

import { useExperimentPlayback } from "./useExperimentPlayback";

// Gestiona el Worker y la reproducción del experimento.
export const useExperimentSimulation = (active: boolean) => {
  const { draft, registerInvalidation } = useThreeBodyExperiment();

  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [showTrails, setShowTrails] = useState(true);
  const [runError, setRunError] = useState<SimulationError | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const elapsedRef = useRef(0);

  // Cancela el cálculo e invalida las respuestas anteriores.
  const cancelCalculation = useCallback(() => {
    requestIdRef.current++;
    workerRef.current?.terminate();
    workerRef.current = null;
    setCalculating(false);
  }, []);

  // Limpia la simulación cuando cambian los parámetros.
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

  // Finaliza el Worker al desmontar.
  useEffect(() => {
    return () => workerRef.current?.terminate();
  }, []);

  // Prepara y valida los parámetros.
  const parsed = useMemo(() => parseExperimentDraft(draft), [draft]);
  const error = useMemo(() => experimentConfigurationError(parsed), [parsed]);

  // Ejecuta la simulación en un Worker.
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
      const worker = new Worker(
        new URL("../experiment.worker.ts", import.meta.url),
        { type: "module" },
      );

      workerRef.current = worker;

      // Recibe el resultado del cálculo.
      worker.onmessage = (event: MessageEvent<ExperimentWorkerResponse>) => {
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

      // Gestiona los errores del Worker.
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

  useExperimentPlayback({
    simulation,
    playing,
    active,
    speed,
    elapsedRef,
    setElapsed,
    setPlaying,
  });

  // Reinicia la reproducción desde el principio.
  const restartPlayback = () => {
    elapsedRef.current = 0;
    setElapsed(0);

    if (simulation) setPlaying(true);
  };

  // Cambia el instante de reproducción.
  const seek = (value: number) => {
    if (!simulation || !Number.isFinite(value)) return;

    const next = Math.max(0, Math.min(simulation.duration, value));

    elapsedRef.current = next;
    setElapsed(next);

    if (next >= simulation.duration) setPlaying(false);
  };

  return {
    simulation,
    calculating,
    playing,
    elapsed,
    speed,
    showTrails,
    runError,
    parsed,
    error,
    runSimulation,
    restartPlayback,
    seek,
    setPlaying,
    setSpeed,
    setShowTrails,
  };
};

export type ExperimentController = ReturnType<typeof useExperimentSimulation>;
