"use client";

import {
  useEffect,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import type { SimulationResult } from "./experiment.types";

type PlaybackOptions = {
  simulation: SimulationResult | null;
  playing: boolean;
  active: boolean;
  speed: number;
  elapsedRef: MutableRefObject<number>;
  setElapsed: Dispatch<SetStateAction<number>>;
  setPlaying: Dispatch<SetStateAction<boolean>>;
};

// Avanza una simulación libre sin repetir el período ni modificar el estado físico.
export const useExperimentPlayback = ({
  simulation,
  playing,
  active,
  speed,
  elapsedRef,
  setElapsed,
  setPlaying,
}: PlaybackOptions) => {
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
};
