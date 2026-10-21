"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { bodyColors } from "../../shared/OrbitAnimation";

type OrbitPlayerCaptionProps = {
  children?: ReactNode;
};

// Muestra la leyenda de los tres cuerpos y conserva el contenido adicional.
export const OrbitPlayerCaption = ({ children }: OrbitPlayerCaptionProps) => {
  const t = useTranslations("ThreeBody");

  return (
    <figcaption>
      <ul
        className="[.lab-three-body-animation-player_&]:flex [.lab-three-body-animation-player_&]:justify-center [.lab-three-body-animation-player_&]:flex-wrap [.lab-three-body-animation-player_&]:[gap:0.5rem_1rem] [.lab-three-body-animation-player_&]:[margin:0.625rem_0_0] [.lab-three-body-animation-player_&]:p-0 [.lab-three-body-animation-player_&]:list-none [.lab-three-body-animation-player_&]:[color:#e3dafa] [.lab-three-body-animation-player_&]:[font-size:0.875rem] [.lab-three-body-animation-player_&_li]:inline-flex [.lab-three-body-animation-player_&_li]:items-center [.lab-three-body-animation-player_&_li]:[gap:0.5rem] [.lab-three-body-animation-player_&_span]:[width:0.55rem] [.lab-three-body-animation-player_&_span]:[height:0.55rem] [.lab-three-body-animation-player_&_span]:[border-radius:50%]"
        aria-label={t("animationBodies")}
      >
        {bodyColors.map((color, index) => (
          <li key={color}>
            <span style={{ backgroundColor: color }} aria-hidden="true" />
            {t("animationBody", { number: index + 1 })}
          </li>
        ))}
      </ul>

      <p>{t("animationTiming")}</p>

      {children}
    </figcaption>
  );
};
