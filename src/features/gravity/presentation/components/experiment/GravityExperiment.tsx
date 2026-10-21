"use client";

import { useId } from "react";
import { useFormatter, useTranslations } from "next-intl";

import { Reset } from "@/components/icons";
import { ExplainWithAI } from "@/features/ai/presentation/components/ExplainWithAI";

import { compareGravitation } from "../../../domain/compareGravitation";
import type { GravityParameters } from "../../../types/gravity.types";

import { GravityForceComparison } from "./GravityForceComparison";
import { GravitySlider, gravityControls } from "./GravitySlider";
import { GravityFormula } from "../understanding/gravity-formula/GravityFormula";
import { GravityContentTabs } from "../shared/GravityContentTabs";

type ExperimentProps = {
  parameters: GravityParameters;
  onChange: (parameters: GravityParameters) => void;
  onReset: () => void;
};

// Muestra el laboratorio de la etapa 03 · Experimenta.
export const GravityExperiment = ({
  parameters,
  onChange,
  onReset,
}: ExperimentProps) => {
  const id = useId();
  const t = useTranslations("Gravity");
  const format = useFormatter();

  // Compara la fuerza actual con la inicial.
  const comparison = compareGravitation(parameters);

  // Explica cómo ha cambiado la fuerza.
  const forceExplanation = t(`forceExplanation.${comparison.explanation}`, {
    percentage: format.number(comparison.forceRatio, {
      style: "percent",
      maximumFractionDigits: 2,
    }),
  });

  return (
    <GravityContentTabs
      primary="experiment"
      calculator={<GravityFormula variant="embedded" />}
    >
      <section
        aria-label={t("experimentHeading")}
        className="flex w-full min-w-0 flex-col gap-3 pb-3 text-base leading-[1.5] text-lab-text
          [--line:#272c40] [--purple:#aa97ff] [--mint:#5ee7d5]
          [&_:focus-visible]:outline-[3px]
          [&_:focus-visible]:outline-solid
          [&_:focus-visible]:outline-[#c0b3ff]
          [&_:focus-visible]:outline-offset-4"
      >
        {/* Título y botón de restablecer. */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-[14px] pt-1 max-[600px]:pt-[14px]">
          <h3
            id={`${id}-heading`}
            className="min-w-0 flex-[1_1_180px] text-lg leading-[1.4] font-semibold text-lab-text"
          >
            {t("experimentHeading")} <ExplainWithAI topic="simulation" />
          </h3>

          <button
            type="button"
            onClick={onReset}
            aria-label={t("reset")}
            className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#544776] bg-[#aa97ff12] px-3 py-2 text-sm leading-[1.5] text-[#d0c1ff] transition-colors duration-[180ms] hover:bg-[#aa97ff25] [&_svg]:size-4 [&_svg]:shrink-0 motion-reduce:transition-none"
          >
            <Reset variant="gravity" strokeWidth="1.7" />
            <span>{t("resetShort")}</span>
          </button>
        </div>

        {/* Controles de masa y distancia. */}
        <div className="min-w-0 px-[14px] pt-1">
          {gravityControls.map((control) => (
            <GravitySlider
              key={control.key}
              control={control}
              value={parameters[control.key]}
              descriptionId={`${id}-controls-hint ${id}-force-explanation ${id}-intensity-description`}
              onChange={(value) =>
                onChange({
                  ...parameters,
                  [control.key]: value,
                })
              }
            />
          ))}
        </div>

        {/* Comparación de fuerzas. */}
        <GravityForceComparison
          currentForce={comparison.currentForce}
          initialForce={comparison.referenceForce}
          idPrefix={`${id}-intensity`}
        />

        {/* Explicación del resultado. */}
        <div className="px-[14px] pb-1">
          <p
            id={`${id}-force-explanation`}
            className="min-w-0 border-l-2 border-[#5ee7d580] pl-2.5 text-sm leading-[1.5] text-[#d0d4e3] wrap-anywhere"
          >
            {forceExplanation}
          </p>
        </div>
      </section>
    </GravityContentTabs>
  );
};
