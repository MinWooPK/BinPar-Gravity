"use client";

import { useTranslations } from "next-intl";
import { threeBodyStages } from "../../../application/journey";
import type { NavigationProps } from "./navigation.types";

type Props = Pick<NavigationProps, "onSelectStage">;

// Muestra las tarjetas de acceso a las cuatro etapas.
export const ThreeBodyWelcomeNavigation = ({ onSelectStage }: Props) => {
  const t = useTranslations("ThreeBody.journey");

  return (
    <nav
      aria-labelledby="three-body-journey-title"
      className="mb-4 min-w-0 min-[1024px]:m-0"
    >
      <p
        id="three-body-journey-title"
        className="mb-5 text-sm font-semibold tracking-widest text-[#b8b0d6] uppercase"
      >
        {t("navigationTitle")}
      </p>

      <div className="grid grid-cols-1 gap-3">
        {threeBodyStages.map((stage) => (
          <button
            key={stage.id}
            id={`three-body-${stage.id}-entry`}
            type="button"
            aria-controls={`three-body-${stage.id}`}
            onClick={() => onSelectStage(stage.id, true)}
            className="lab-three-body-journey-entry group flex min-h-12 w-full min-w-0 
            cursor-pointer items-baseline gap-3 rounded-[10px] border border-[#30364b]
             bg-lab-surface px-4 py-3.5 text-left text-base leading-normal text-[#e4e8f2] 
             transition-[background-color,border-color] duration-180 hover:border-[#aa97ff80] 
             hover:bg-[#1b2032] focus-visible:outline-[3px] focus-visible:outline-[#c0b3ff] focus-visible:outline-offset-[3px]
              motion-reduce:transition-none max-[374px]:px-2.5"
          >
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-[0.9375rem] font-normal text-[#b9a8ff] tabular-nums"
            >
              {stage.number}
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex w-full min-w-0 items-center gap-3">
                <strong className="min-w-0 font-semibold wrap-anywhere">
                  {t(stage.title)}
                </strong>

                {/* Indicador que se ilumina al interactuar. */}
                <span
                  aria-hidden="true"
                  className="ml-auto size-2 shrink-0 rounded-full bg-[#33483e] opacity-40 shadow-[0_0_0_0_#4ade8000] transition-[background-color,opacity,box-shadow] duration-250 ease-in-out group-hover:bg-[#4ade80] group-hover:opacity-100 group-hover:shadow-[0_0_6px_2px_#4ade8059,0_0_14px_3px_#4ade8026] group-focus-visible:bg-[#4ade80] group-focus-visible:opacity-100 group-focus-visible:shadow-[0_0_6px_2px_#4ade8059,0_0_14px_3px_#4ade8026] motion-reduce:transition-none"
                />
              </span>

              <span className="mt-1.5 block text-sm leading-normal text-[#b2bad0]">
                {t(stage.description)}
              </span>
            </span>
          </button>
        ))}
      </div>

      <p className="mt-5 text-[0.9375rem] leading-[1.6] text-[#b2bad0]">
        {t("freedomNote")}
      </p>
    </nav>
  );
};
