"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Illustrative distance cycle, not a physics simulation. Equal, opposing arrows
// grow with inverse-square attraction; the laboratory calculations are unchanged.
const bodyColors = ["#7db3ff", "#f4c778"] as const;
const periodSeconds = 8;

export const HomeGravityPreview = () => {
  const previewRef = useRef<HTMLDivElement>(null);
  const forceRefs = useRef<(SVGPathElement | null)[]>([]);
  const bodyRefs = useRef<(SVGGElement | null)[]>([]);
  const elapsed = useRef(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;
    let frame = 0;
    let lastTime: number | null = null;
    let inView = false;

    const draw = () => {
      const phase = (elapsed.current / periodSeconds) * Math.PI * 2;
      const halfDistance = 70 + 15 * Math.cos(phase);
      const arrowLength = 12 * (85 / halfDistance) ** 2;
      bodyRefs.current.forEach((body, index) => {
        const direction = index === 0 ? 1 : -1;
        body?.setAttribute(
          "transform",
          `translate(${160 - direction * halfDistance} 90)`,
        );
        const tip = 12 + arrowLength;
        forceRefs.current[index]?.setAttribute(
          "d",
          `M12 0H${tip}m-4-3 4 3-4 3`,
        );
      });
    };
    const tick = (now: number) => {
      if (lastTime !== null) {
        elapsed.current =
          (elapsed.current + (now - lastTime) / 1000) % periodSeconds;
      }
      lastTime = now;
      draw();
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      lastTime = null;
      if (inView && !document.hidden && !reducedMotion)
        frame = requestAnimationFrame(tick);
    };

    draw();
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    observer.observe(preview);
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={previewRef}
      className="[&>svg]:block [&>svg]:w-full [&>svg]:h-full [&>svg]:[transform:scale(1.75)] w-full h-full"
    >
      <svg
        viewBox="0 0 320 200"
        width="320"
        height="200"
        aria-hidden="true"
        data-gravity-preview
      >
        <path
          d="M75 90H245"
          fill="none"
          stroke="#9aaec8"
          strokeWidth="0.7"
          strokeDasharray="2 4"
          opacity="0.3"
        />
        <text
          x="160"
          y="123"
          fill="#9aaec8"
          fontSize="10"
          textAnchor="middle"
          opacity="0.8"
        >
          F = G m₁m₂ / r²
        </text>
        {bodyColors.map((color, index) => (
          <g
            key={color}
            ref={(element) => {
              bodyRefs.current[index] = element;
            }}
            transform={`translate(${index === 0 ? 75 : 245} 90)`}
          >
            <path
              ref={(element) => {
                forceRefs.current[index] = element;
              }}
              d="M12 0H24m-4-3 4 3-4 3"
              transform={index === 0 ? undefined : "scale(-1 1)"}
              fill="none"
              stroke={color}
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle r="8" fill={color} opacity="0.15" />
            <circle r="4.5" fill={color} stroke="#090e1c" strokeWidth="1" />
          </g>
        ))}
      </svg>
    </div>
  );
};
