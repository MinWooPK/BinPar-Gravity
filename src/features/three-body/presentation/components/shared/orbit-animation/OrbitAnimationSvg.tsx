"use client";

import { useId, type RefObject } from "react";
import { useLocale, useTranslations } from "next-intl";

import type { OrbitPlayback } from "../../../../types/animation.types";
import { bodyColors } from "./orbitAnimation.helpers";

type OrbitAnimationSvgProps = {
  data: OrbitPlayback;
  name: string;
  trails: readonly string[];
  viewBox: string;
  stageRef: RefObject<SVGSVGElement | null>;
  bodyRefs: RefObject<(SVGGElement | null)[]>;
};

// Dibuja las trayectorias y los tres cuerpos.
export const OrbitAnimationSvg = ({
  data,
  name,
  trails,
  viewBox,
  stageRef,
  bodyRefs,
}: OrbitAnimationSvgProps) => {
  const t = useTranslations("ThreeBody");
  const locale = useLocale();
  const id = useId();

  return (
    <svg
      ref={stageRef}
      className="mx-auto block h-auto max-h-[clamp(14rem,48vh,30rem)] w-full max-w-full overflow-hidden rounded-[inherit]"
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

      {/* Trayectorias de los tres cuerpos. */}
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

      {/* Cuerpos animados. */}
      {bodyColors.map((color, index) => (
        <g
          key={color}
          ref={(element) => {
            bodyRefs.current[index] = element;
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
