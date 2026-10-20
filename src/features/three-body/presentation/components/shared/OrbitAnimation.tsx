"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";

import {
  getOrbitFrame,
  getOrbitTrails,
} from "../../../application/orbitPlayback";

import type { OrbitPlayback } from "../../../types/animation.types";
import { orbitAnimationStyles as styles } from "./OrbitAnimation.styles";

// Define los colores utilizados para representar los tres cuerpos.
export const bodyColors = ["#aa97ff", "#5ee7d5", "#f4c778"] as const;

// Define las propiedades necesarias para controlar la animación orbital.
type OrbitAnimationProps = {
  data: OrbitPlayback;
  name: string;
  playing: boolean;
  speed?: number;
  resetKey?: number;
  fitToTrajectory?: boolean;
};

// Representa y anima las trayectorias de los tres cuerpos en un SVG,
// permitiendo controlar la reproducción, velocidad y reinicio.
export const OrbitAnimation = ({
  data,
  name,
  playing,
  speed = 1,
  resetKey = 0,
  fitToTrajectory = false,
}: OrbitAnimationProps) => {
  // Obtiene las traducciones de la sección de los tres cuerpos.
  const t = useTranslations("ThreeBody");

  // Obtiene el idioma actual de la aplicación.
  const locale = useLocale();

  // Genera identificadores únicos para los elementos accesibles del SVG.
  const id = useId();

  // Guarda la referencia del SVG utilizado para dibujar la animación.
  const stage = useRef<SVGSVGElement>(null);

  // Guarda las referencias de los tres cuerpos representados en el SVG.
  const bodies = useRef<(SVGGElement | null)[]>([]);

  // Almacena el tiempo transcurrido dentro del período orbital.
  const elapsed = useRef(0);

  // Recuerda el último identificador de reinicio de la animación.
  const previousReset = useRef(resetKey);

  // Genera las trayectorias visuales de los tres cuerpos.
  const trails = useMemo(() => getOrbitTrails(data), [data]);

  // Calcula el área visible del SVG, ajustándola opcionalmente
  // a los límites de la trayectoria.
  const viewBox = useMemo(() => {
    if (!fitToTrajectory) return "0 0 320 200";

    // Inicializa los límites espaciales de la trayectoria.
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    for (const sample of data.samples) {
      for (let body = 0; body < 3; body++) {
        // Obtiene las coordenadas del cuerpo en la muestra actual.
        const x = sample[body * 2];
        const y = sample[body * 2 + 1];

        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }

    // Añade un margen para que los cuerpos no queden recortados.
    const padding = 12;

    return `${minX - padding} ${minY - padding} ${maxX - minX + padding * 2} ${maxY - minY + padding * 2}`;
  }, [data, fitToTrajectory]);

  // Gestiona la reproducción de la órbita mediante requestAnimationFrame
  // y la detiene cuando está pausada, fuera de pantalla o la pestaña está oculta.
  useEffect(() => {
    // Obtiene el elemento SVG que contiene la animación.
    const element = stage.current;

    if (!element) return;

    if (previousReset.current !== resetKey) {
      elapsed.current = 0;
      previousReset.current = resetKey;
    }

    // Guarda el identificador del siguiente fotograma.
    let frame = 0;

    // Almacena el instante del fotograma anterior.
    let lastTime: number | null = null;

    // Indica si la animación se encuentra dentro del área visible.
    let inView = false;

    // Actualiza las posiciones visuales de los tres cuerpos.
    const draw = () => {
      // Calcula las posiciones correspondientes al tiempo actual.
      const positions = getOrbitFrame(data, elapsed.current);

      bodies.current.forEach((body, index) => {
        body?.setAttribute(
          "transform",
          `translate(${positions[index * 2]} ${positions[index * 2 + 1]})`,
        );
      });
    };

    // Avanza el tiempo orbital y dibuja el siguiente fotograma.
    const tick = (now: number) => {
      if (lastTime !== null) {
        elapsed.current =
          (elapsed.current + ((now - lastTime) * speed) / 1000) % data.period;
      }

      lastTime = now;
      draw();
      frame = requestAnimationFrame(tick);
    };

    // Activa o detiene la animación según su estado y visibilidad.
    const sync = () => {
      cancelAnimationFrame(frame);
      lastTime = null;

      if (playing && inView && !document.hidden)
        frame = requestAnimationFrame(tick);
    };

    draw();

    // Detecta si el SVG entra o sale del área visible de la pantalla.
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

  return (
    <svg
      ref={stage}
      className={styles.stage}
      viewBox={viewBox}
      width="320"
      height="200"
      role="img"
      lang={locale}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      data-orbit={data.slug}
    >
      <title id={`${id}-title`}>{t("animationTitle", { name })}</title>

      <desc id={`${id}-description`}>{t("animationDescription")}</desc>

      {trails.map((points, index) => (
        <polyline
          key={index}
          points={points}
          fill="none"
          stroke={bodyColors[index]}
          strokeWidth="0.7"
          opacity="0.5"
        />
      ))}

      {bodyColors.map((color, index) => (
        <g
          key={color}
          ref={(element) => {
            bodies.current[index] = element;
          }}
          transform={`translate(${data.samples[0][index * 2]} ${data.samples[0][index * 2 + 1]})`}
          data-orbit-body={index + 1}
        >
          <circle r="6" fill={color} opacity="0.15" />
          <circle r="3.4" fill={color} stroke="#090e1c" strokeWidth="1" />
        </g>
      ))}
    </svg>
  );
};
