"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getOrbitFrame, getOrbitTrails, type OrbitPlayback } from "./orbit-visualization";
import styles from "./OrbitAnimation.module.css";

export const bodyColors = ["#aa97ff", "#5ee7d5", "#f4c778"] as const;

type OrbitAnimationProps = {
  data: OrbitPlayback;
  name: string;
  playing: boolean;
  speed?: number;
  resetKey?: number;
  fitToTrajectory?: boolean;
};

export function OrbitAnimation({ data, name, playing, speed = 1, resetKey = 0, fitToTrajectory = false }: OrbitAnimationProps) {
  const t = useTranslations("ThreeBody");
  const locale = useLocale();
  const id = useId();
  const stage = useRef<SVGSVGElement>(null);
  const bodies = useRef<(SVGGElement | null)[]>([]);
  const elapsed = useRef(0);
  const previousReset = useRef(resetKey);
  const trails = useMemo(() => getOrbitTrails(data), [data]);
  const viewBox = useMemo(() => {
    if (!fitToTrajectory) return "0 0 320 200";
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const sample of data.samples) {
      for (let body = 0; body < 3; body++) {
        const x = sample[body * 2];
        const y = sample[body * 2 + 1];
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
    // Frame the existing drawing, leaving room for each body's 6-unit halo.
    const padding = 12;
    return `${minX - padding} ${minY - padding} ${maxX - minX + padding * 2} ${maxY - minY + padding * 2}`;
  }, [data, fitToTrajectory]);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    if (previousReset.current !== resetKey) {
      elapsed.current = 0;
      previousReset.current = resetKey;
    }

    let frame = 0;
    let lastTime: number | null = null;
    let inView = false;
    const draw = () => {
      const positions = getOrbitFrame(data, elapsed.current);
      bodies.current.forEach((body, index) => {
        body?.setAttribute("transform", `translate(${positions[index * 2]} ${positions[index * 2 + 1]})`);
      });
    };
    const tick = (now: number) => {
      if (lastTime !== null) {
        elapsed.current = (elapsed.current + (now - lastTime) * speed / 1000) % data.period;
      }
      lastTime = now;
      draw();
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      lastTime = null;
      if (playing && inView && !document.hidden) frame = requestAnimationFrame(tick);
    };

    draw();
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
    <svg ref={stage} className={styles.stage} viewBox={viewBox} width="320" height="200" role="img" lang={locale} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} data-orbit={data.slug}>
      <title id={`${id}-title`}>{t("animationTitle", { name })}</title>
      <desc id={`${id}-description`}>{t("animationDescription")}</desc>
      {trails.map((points, index) => (
        <polyline key={index} points={points} fill="none" stroke={bodyColors[index]} strokeWidth="0.7" opacity="0.5" />
      ))}
      {bodyColors.map((color, index) => (
        <g key={color} ref={(element) => { bodies.current[index] = element; }} transform={`translate(${data.samples[0][index * 2]} ${data.samples[0][index * 2 + 1]})`} data-orbit-body={index + 1}>
          <circle r="6" fill={color} opacity="0.15" />
          <circle r="3.4" fill={color} stroke="#090e1c" strokeWidth="1" />
        </g>
      ))}
    </svg>
  );
}
