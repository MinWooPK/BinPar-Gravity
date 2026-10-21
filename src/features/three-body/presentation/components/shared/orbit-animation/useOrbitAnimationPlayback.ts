"use client";

import { useEffect, useRef } from "react";

import { getOrbitFrame } from "../../../../application/orbitPlayback";
import type { OrbitPlayback } from "../../../../types/animation.types";

type PlaybackOptions = {
  data: OrbitPlayback;
  playing: boolean;
  speed: number;
  resetKey: number;
};

// Controla la reproducción de los tres cuerpos.
export const useOrbitAnimationPlayback = ({
  data,
  playing,
  speed,
  resetKey,
}: PlaybackOptions) => {
  const stage = useRef<SVGSVGElement>(null);
  const bodies = useRef<(SVGGElement | null)[]>([]);
  const elapsed = useRef(0);
  const previousReset = useRef(resetKey);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;

    // Reinicia el tiempo cuando se solicita.
    if (previousReset.current !== resetKey) {
      elapsed.current = 0;
      previousReset.current = resetKey;
    }

    let frame = 0;
    let lastTime: number | null = null;
    let inView = false;

    // Actualiza las posiciones de los cuerpos.
    const draw = () => {
      const positions = getOrbitFrame(data, elapsed.current);

      bodies.current.forEach((body, index) => {
        body?.setAttribute(
          "transform",
          `translate(${positions[index * 2]} ${positions[index * 2 + 1]})`,
        );
      });
    };

    // Avanza el tiempo y dibuja el siguiente fotograma.
    const tick = (now: number) => {
      if (lastTime !== null) {
        elapsed.current =
          (elapsed.current + ((now - lastTime) * speed) / 1000) % data.period;
      }

      lastTime = now;
      draw();
      frame = requestAnimationFrame(tick);
    };

    // Pausa o reanuda según la visibilidad.
    const sync = () => {
      cancelAnimationFrame(frame);
      lastTime = null;

      if (playing && inView && !document.hidden) {
        frame = requestAnimationFrame(tick);
      }
    };

    draw();

    // Observa si la animación está visible.
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });

    observer.observe(element);
    document.addEventListener("visibilitychange", sync);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [data, playing, speed, resetKey]);

  return { stage, bodies };
};
