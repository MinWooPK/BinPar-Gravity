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

// Controla el tiempo de reproducción de la simulación.
export const useExperimentPlayback = ({
  simulation,
  playing,
  active,
  speed,
  elapsedRef,
  setElapsed,
  setPlaying,
}: PlaybackOptions) => {
  useEffect(() => {
    if (!simulation || !playing || !active) return;

    let frame = 0;
    let previous: number | null = null;

    const tick = (now: number) => {
      // Pausa el avance si la pestaña está oculta.
      if (document.hidden) {
        previous = null;
        frame = requestAnimationFrame(tick);
        return;
      }

      if (previous !== null) {
        // Limita el salto temporal entre fotogramas.
        const deltaSeconds = Math.min(0.1, (now - previous) / 1000);

        // Reproduce la simulación en 12 segundos por defecto.
        const next = Math.min(
          simulation.duration,
          elapsedRef.current +
            deltaSeconds * (simulation.duration / 12) * speed,
        );

        elapsedRef.current = next;
        setElapsed(next);

        // Detiene la reproducción al finalizar.
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
  }, [simulation, playing, speed, active, elapsedRef, setElapsed, setPlaying]);
};
