"use client";

import { useTranslations } from "next-intl";

// Dibuja el esquema estático de fuerzas entre los tres cuerpos.
export const InteractionDiagram = ({ id }: { id: string }) => {
  const t = useTranslations("ThreeBody.discovery.science");
  return (
    <figure
      className="flex flex-1 flex-col justify-center min-w-0 m-0 p-[6px_8px_8px] [border:1px_solid_#29344b]
     rounded-[10px] [background:#0b1120] [&_svg]:block [&_svg]:w-full
     [&_svg]:h-[clamp(100px,13vh,132px)] [&_figcaption]:text-[#aab6cd] [&_figcaption]:text-center
     [@media_(max-width:_1023px)]:[&_svg]:h-37.5"
    >
      <svg
        viewBox="45 0 410 145"
        role="img"
        aria-labelledby={`${id}-diagram-title`}
        aria-describedby={`${id}-diagram-description`}
        focusable="false"
      >
        <title id={`${id}-diagram-title`}>{t("diagramTitle")}</title>
        <desc id={`${id}-diagram-description`}>{t("diagramDescription")}</desc>
        <defs>
          <marker
            id={`${id}-force-arrow`}
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path
              d="m1 1 6 3-6 3"
              fill="none"
              stroke="#c9b8ff"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
        </defs>
        <g aria-hidden="true">
          <path
            d="m250 30-160 70h320Z"
            fill="none"
            stroke="#53617d"
            strokeDasharray="3 6"
            strokeOpacity=".7"
          />
          <g
            fill="none"
            stroke="#c9b8ff"
            strokeWidth="2"
            strokeLinecap="round"
            markerEnd={`url(#${id}-force-arrow)`}
          >
            <path d="m217 44.4375-34 14.875" />
            <path d="m123 85.5625 34-14.875" />
            <path d="m283 44.4375 34 14.875" />
            <path d="m377 85.5625-34-14.875" />
            <path d="M126 100h28" />
            <path d="M374 100h-28" />
          </g>
          <g strokeWidth="1.5">
            <circle cx="250" cy="30" r="23" fill="#aa97ff25" stroke="#aa97ff" />
            <circle cx="90" cy="100" r="23" fill="#5ee7d525" stroke="#5ee7d5" />
            <circle
              cx="410"
              cy="100"
              r="23"
              fill="#f4c77825"
              stroke="#f4c778"
            />
          </g>
          <g
            fill="#f2f2fa"
            fontFamily="Georgia, serif"
            fontSize="21"
            textAnchor="middle"
            dominantBaseline="central"
          >
            <text x="250" y="30">
              m₁
            </text>
            <text x="90" y="100">
              m₂
            </text>
            <text x="410" y="100">
              m₃
            </text>
          </g>
          <g
            fill="#aeb9d0"
            fontFamily="Georgia, serif"
            fontSize="17"
            textAnchor="middle"
          >
            <text x="151" y="49">
              r₁₂
            </text>
            <text x="349" y="49">
              r₁₃
            </text>
            <text x="250" y="134">
              r₂₃
            </text>
          </g>
        </g>
      </svg>
      <figcaption>{t("diagramCaption")}</figcaption>
    </figure>
  );
};
