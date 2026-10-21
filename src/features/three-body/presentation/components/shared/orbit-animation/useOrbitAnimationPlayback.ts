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

// Mantiene el tiempo físico y las referencias DOM de la animación orbital.
export const useOrbitAnimationPlayback = ({
  data,
  playing,
  speed,
  resetKey,
}: PlaybackOptions) => {
  // Referencia al SVG que se observa para activar o pausar la animación.
  const stage = useRef<SVGSVGElement>(null);

  // Referencias a los tres elementos SVG que se desplazan.
  const bodies = useRef<(SVGGElement | null)[]>([]);

  // El tiempo se conserva al pausar y al cambiar la visibilidad.
  const elapsed = useRef(0);

  // Permite reiniciar cuando cambia la versión de reinicio.
  const previousReset = useRef(resetKey);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;

    if (previousReset.current !== resetKey) {
      elapsed.current = 0;
      previousReset.current = resetKey;
    }

    // Guarda el fotograma pendiente y el instante anterior.
    let frame = 0;
    let lastTime: number | null = null;

    // Solo reproduce cuando la órbita está dentro de la pantalla.
    let inView = false;

    const draw = () => {
      const positions = getOrbitFrame(data, elapsed.current);

      bodies.current.forEach((body, index) => {
        body?.setAttribute(
          "transform",
          `translate(${positions[index * 2]} ${positions[index * 2 + 1]})`,
        );
      });
    };

    const tick = (now: number) => {
      if (lastTime !== null) {
        elapsed.current =
          (elapsed.current + ((now - lastTime) * speed) / 1000) % data.period;
      }

      lastTime = now;
      draw();
      frame = requestAnimationFrame(tick);
    };

    // Cancela fotogramas y reanuda desde el tiempo guardado cuando proceda.
    const sync = () => {
      cancelAnimationFrame(frame);
      lastTime = null;

      if (playing && inView && !document.hidden)
        frame = requestAnimationFrame(tick);
    };

    draw();

    // Detiene la reproducción al salir de pantalla o al ocultar la pestaña.
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
