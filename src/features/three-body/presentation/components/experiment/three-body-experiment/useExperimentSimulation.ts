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

// Gestiona el Worker, invalidaciones y estado del reproductor.
// La configuración física permanece en ThreeBodyExperimentProvider.
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

  const parsed = useMemo(() => parseExperimentDraft(draft), [draft]);
  const error = useMemo(() => experimentConfigurationError(parsed), [parsed]);

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
        new URL("../experiment.worker.ts", import.meta.url),
        {
          type: "module",
        },
      );
      workerRef.current = worker;

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
