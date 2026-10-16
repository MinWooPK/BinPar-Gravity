"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export const AutoHideHeader = ({ children }: { children: ReactNode }) => {
  const [hidden, setHidden] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerInside = useRef(false);

  useEffect(() => {
    let previousY = window.scrollY;
    let direction = 0;
    let distance = 0;
    let frame = 0;

    const update = () => {
      frame = 0;
      const currentY = Math.max(0, window.scrollY);
      const delta = currentY - previousY;
      previousY = currentY;
      const header = containerRef.current;

      if (currentY <= (header?.offsetHeight ?? 100) || pointerInside.current || header?.contains(document.activeElement)) {
        setHidden(false);
        distance = 0;
        return;
      }

      const nextDirection = Math.sign(delta);
      if (!nextDirection) return;
      if (nextDirection !== direction) distance = 0;
      direction = nextDirection;
      distance += Math.abs(delta);
      if (distance >= 12) {
        setHidden(direction > 0);
        distance = 0;
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.clientY <= 24) setHidden(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") {
          pointerInside.current = true;
          setHidden(false);
        }
      }}
      onPointerLeave={() => { pointerInside.current = false; }}
      onFocusCapture={() => setHidden(false)}
      className={`sticky top-0 z-50 shrink-0 transition-transform duration-200 ease-out focus-within:translate-y-0 motion-reduce:transition-none ${hidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      {children}
    </div>
  );
};
