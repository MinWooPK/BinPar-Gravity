"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { bodyColors } from "../../shared/OrbitAnimation";

type OrbitPlayerCaptionProps = {
  children?: ReactNode;
};

// Muestra los colores y nombres de los tres cuerpos.
export const OrbitPlayerCaption = ({ children }: OrbitPlayerCaptionProps) => {
  const t = useTranslations("ThreeBody");

  return (
    <figcaption>
      <ul
        className="mt-2.5 flex list-none flex-wrap justify-center gap-x-4 gap-y-2 p-0 text-sm text-[#e3dafa]"
        aria-label={t("animationBodies")}
      >
        {bodyColors.map((color, index) => (
          <li key={color} className="inline-flex items-center gap-2">
            <span
              className="size-[0.55rem] rounded-full"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            {t("animationBody", { number: index + 1 })}
          </li>
        ))}
      </ul>

      <p className="mx-auto mt-1.5 mb-0 max-w-208 text-center text-[0.9375rem] leading-normal text-[#b6bfd3]">
        {t("animationTiming")}
      </p>

      {children}
    </figcaption>
  );
};
