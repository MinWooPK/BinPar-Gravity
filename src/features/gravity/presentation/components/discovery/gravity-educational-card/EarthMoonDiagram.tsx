"use client";

import { useTranslations } from "next-intl";

type EarthMoonDiagramProps = {
  id: string;
};

// Representa la atracción gravitatoria entre la Tierra y la Luna.
export const EarthMoonDiagram = ({ id }: EarthMoonDiagramProps) => {
  const t = useTranslations("Gravity");

  return (
    <figure
      className="m-[12px_0] p-[6px_0_8px] [border:1px_solid_#29344b] rounded-[10px] 
    [background:#0b1120] min-[1024px]:flex min-[1024px]:flex-1 min-[1024px]:flex-col
     [&_svg]:block [&_svg]:w-full [&_svg]:h-[clamp(104px,15vh,132px)] [&_figcaption]:m-0
     [&_figcaption]:p-[0_10px] [&_figcaption]:text-[#a4b0c7] [&_figcaption]:text-[.875rem]
     [&_figcaption]:leading-[1.4] [&_figcaption]:text-center [@media_(min-width:_1024px)]:[&_svg]:flex-[1_1_0]
      [@media_(min-width:_1024px)]:[&_svg]:h-[clamp(104px,18dvh,180px)] [@media_(min-width:_1024px)]:[&_svg]:min-h-26"
    >
      <svg
        viewBox="0 0 460 150"
        role="img"
        aria-labelledby={`${id}-diagram-title`}
        aria-describedby={`${id}-diagram-description`}
        focusable="false"
      >
        <title id={`${id}-diagram-title`}>{t("discoveryDiagramTitle")}</title>

        <desc id={`${id}-diagram-description`}>
          {t("discoveryDiagramDescription")}
        </desc>

        <defs>
          <radialGradient id={`${id}-earth`} cx="30%" cy="25%" r="80%">
            <stop stopColor="#669cda" />
            <stop offset="1" stopColor="#1e345a" />
          </radialGradient>

          <radialGradient id={`${id}-moon`} cx="30%" cy="25%" r="80%">
            <stop stopColor="#d6d9e3" />
            <stop offset="1" stopColor="#65718e" />
          </radialGradient>
        </defs>

        <g aria-hidden="true">
          <ellipse
            cx="230"
            cy="68"
            rx="196"
            ry="45"
            fill="none"
            stroke="#38425f"
            strokeDasharray="2 8"
          />

          <path
            d="M143 68h192"
            stroke="#7383a6"
            strokeDasharray="3 5"
            strokeOpacity=".45"
          />

          <circle
            cx="106"
            cy="68"
            r="41"
            fill="none"
            stroke="#9adce8"
            strokeOpacity=".2"
          />

          <circle
            cx="106"
            cy="68"
            r="37"
            fill={`url(#${id}-earth)`}
            stroke="#91c5e1"
            strokeWidth="1.3"
          />

          <path
            d="m91 36 12 9-1 12-12 9-6 14-11-6m41-39-5 13 9 10 14 3 9 14-6 18-13-4-5-14-14-2-3-13"
            fill="#73b5a8"
            opacity=".8"
          />

          <circle
            cx="354"
            cy="68"
            r="19"
            fill={`url(#${id}-moon)`}
            stroke="#c2c8da"
          />

          <g fill="#52617d" opacity=".45">
            <circle cx="348" cy="61" r="4" />
            <circle cx="359" cy="73" r="5" />
            <circle cx="346" cy="77" r="2" />
          </g>

          <g
            fill="none"
            stroke="#baa7ff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M151 68h62m-8-6 8 6-8 6" />
            <path d="M309 68h-62m8-6-8 6 8 6" />
          </g>

          <g
            fill="#d6caff"
            fontSize="16"
            fontStyle="italic"
            textAnchor="middle"
          >
            <text x="182" y="52">
              F
            </text>
            <text x="278" y="52">
              F
            </text>
          </g>

          <g fill="#dce5f3" fontSize="22" fontWeight="500" textAnchor="middle">
            <text x="106" y="132">
              {t("discoveryDiagramEarth")}
            </text>

            <text x="354" y="132">
              {t("discoveryDiagramMoon")}
            </text>
          </g>
        </g>
      </svg>

      <figcaption>{t("discoveryDiagramScale")}</figcaption>
    </figure>
  );
};
