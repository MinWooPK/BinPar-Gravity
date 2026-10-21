"use client";

import { Reset } from "@/components/icons";

import { useId } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { compareGravitation } from "../../../domain/compareGravitation";
import type { GravityParameters } from "../../../types/gravity.types";
import { ExplainWithAI } from "@/features/ai/presentation/components/ExplainWithAI";
import { GravityForceComparison } from "./GravityForceComparison";
import { GravitySlider, gravityControls } from "./GravitySlider";
import { GravityFormula } from "../understanding/gravity-formula/GravityFormula";
import { GravityContentTabs } from "../shared/GravityContentTabs";

// Define los parámetros y las funciones de control que recibe el experimento.
type ExperimentProps = {
  parameters: GravityParameters;
  onChange: (parameters: GravityParameters) => void;
  onReset: () => void;
};

// Muestra la etapa 03 · Experimenta, permitiendo modificar
// las masas y la distancia y observar sus efectos sobre la gravedad.
export const GravityExperiment = ({
  parameters,
  onChange,
  onReset,
}: ExperimentProps) => {
  // Genera identificadores únicos para los elementos accesibles.
  const id = useId();

  // Obtiene las traducciones de la sección de gravedad.
  const t = useTranslations("Gravity");

  // Permite formatear los valores numéricos según el idioma.
  const format = useFormatter();

  // Compara la fuerza gravitatoria actual con la configuración inicial.
  const comparison = compareGravitation(parameters);

  // Genera una explicación educativa según los cambios realizados.
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
        className="[--line:#272c40] [--purple:#aa97ff] [--mint:#5ee7d5] w-full min-w-0 text-lab-text [font-size:1rem] [line-height:1.5] [&_:focus-visible]:[outline:3px_solid_#c0b3ff] [&_:focus-visible]:outline-offset-4 flex flex-col gap-3 pb-3"
      >
        <div className="flex items-center justify-between flex-wrap [gap:8px_16px] [padding:4px_14px_0] [@media(max-width:600px)]:[padding:14px_14px_0]">
          <h3 id={`${id}-heading`} className="[flex:1_1_180px] min-w-0 m-0 text-lab-text [font-size:1.125rem] font-semibold [line-height:1.4]">
            {t("experimentHeading")} <ExplainWithAI topic="simulation" />
          </h3>

          <div className="flex flex-wrap [gap:8px] min-w-0">
            <button
              type="button"
              onClick={onReset}
              aria-label={t("reset")}
              className="inline-flex shrink-0 items-center justify-center [gap:8px] [min-height:44px] [padding:8px_12px] [border:1px_solid_#544776] [border-radius:8px] [background:#aa97ff12] [color:#d0c1ff] [font-size:14px] [line-height:1.5] cursor-pointer [transition:background_180ms,_color_180ms] [&_svg]:size-4 [&_svg]:shrink-0 [&:hover]:bg-[#aa97ff25] motion-reduce:[transition:none]"
            >
              <Reset variant="gravity" strokeWidth="1.7" />
              <span>{t("resetShort")}</span>
            </button>
          </div>
        </div>

        <div className="min-w-0 [padding:4px_14px_0] [@media(max-width:600px)]:[padding-inline:14px]">
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

        <GravityForceComparison
          currentForce={comparison.currentForce}
          initialForce={comparison.referenceForce}
          idPrefix={`${id}-intensity`}
        />

        <div className="[padding:0_14px_4px] [@media(max-width:600px)]:[padding-inline:14px]">
          <p id={`${id}-force-explanation`} className="min-w-0 m-0 [padding:0_0_0_10px] [border-left:2px_solid_#5ee7d580] [color:#d0d4e3] [font-size:.875rem] [line-height:1.5] [overflow-wrap:anywhere]">
            {forceExplanation}
          </p>
        </div>
      </section>
    </GravityContentTabs>
  );
};
