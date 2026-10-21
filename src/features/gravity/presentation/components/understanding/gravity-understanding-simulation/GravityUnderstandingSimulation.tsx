"use client";

import { useId } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { useGravityParameters } from "../../../providers/GravityParametersProvider";
import { useGravityFormulaInteraction } from "../GravityFormulaInteraction";
import { GravityAttractionDiagram } from "./GravityAttractionDiagram";
import { GravitySimulationValues } from "./GravitySimulationValues";

// Representa visualmente dos cuerpos y su atracción gravitatoria,
// utilizando los mismos parámetros que el laboratorio y la calculadora.
export const GravityUnderstandingSimulation = ({
  compact = false,
}: {
  compact?: boolean;
}) => {
  // Obtiene las traducciones de la simulación gravitatoria.
  const t = useTranslations("Gravity");

  // Formatea los valores numéricos según el idioma.
  const format = useFormatter();

  // Genera identificadores únicos para los elementos del SVG.
  const id = useId();

  // Obtiene los parámetros actuales y la fuerza gravitatoria calculada.
  const { parameters, force } = useGravityParameters();

  // Obtiene la variable activa de la fórmula interactiva.
  const { active } = useGravityFormulaInteraction();

  // Calcula el exponente de la fuerza en notación científica.
  const exponent = Math.floor(Math.log10(force));

  // Calcula y formatea el coeficiente de la fuerza gravitatoria.
  const mantissa = format.number(force / 10 ** exponent, {
    maximumFractionDigits: 2,
  });

  return (
    <section
      data-understanding-simulation
      className={`flex flex-col min-w-0 border border-solid border-lab-line [border-radius:14px] [background:linear-gradient(145deg,_#131724,_#0e121d)]${compact ? ` lab-gravity-simulation-compact` : ""}`}
      aria-labelledby={`${id}-heading`}
    >
      <div className="flex flex-wrap items-center justify-between [gap:8px_12px] [padding:10px_18px] border-b border-solid border-lab-line [@media(max-width:600px)]:[padding-inline:14px] [&_h3]:[min-width:0] [&_h3]:[margin:0] [&_h3]:[color:#e4e8f2] [&_h3]:[font-size:1rem] [&_h3]:[font-weight:600] [&_h3]:[line-height:1.4] [.lab-gravity-simulation-compact_&]:[padding-inline:14px] [.lab-gravity-simulation-compact_&_h3]:[font-size:0.9375rem]">
        <h3 id={`${id}-heading`}>{t("visualTitle")}</h3>
        <span className="[color:#81d9c9] [font-size:.75rem] font-medium [line-height:1.5] [letter-spacing:.04em] [.lab-gravity-simulation-compact_&]:[font-size:0.6875rem]">
          {t(compact ? "liveResultShort" : "liveResult")}
        </span>
      </div>

      <div
        className="flex flex-wrap items-baseline justify-between [gap:6px_16px] min-w-0 [padding:12px_18px_0] [border:1px_solid_transparent] [border-radius:8px] [transition:background_140ms,_border-color_140ms] [@media(max-width:600px)]:[padding-inline:14px] [&_>_span]:[color:#b2bad0] [&_>_span]:[font-size:1rem] [&_>_span]:[line-height:1.5] [&_output]:[color:#e0d6ff] [&_output]:[font-size:clamp(1.5rem,_2.3vw,_1.875rem)] [&_output]:[line-height:1.3] [&_output]:[font-variant-numeric:tabular-nums] [&_output]:[overflow-wrap:anywhere] [&_sup]:[font-size:0.6em] [&_small]:[color:#b8b0d6] [&_small]:[font-size:0.65em] [.lab-gravity-simulation-compact_&]:[padding-inline:14px] [.lab-gravity-simulation-compact_&_>_span]:[font-size:0.875rem] [.lab-gravity-simulation-compact_&_output]:[font-size:1.5rem] [@media_(max-width:_600px)]:[.lab-gravity-simulation-compact_&]:[display:grid] [@media_(max-width:_600px)]:[.lab-gravity-simulation-compact_&]:[grid-template-columns:minmax(0,_1fr)_auto] [@media_(max-width:_600px)]:[.lab-gravity-simulation-compact_&]:[align-items:center] [@media_(max-width:_600px)]:[.lab-gravity-simulation-compact_&]:[gap:4px_8px] [@media_(max-width:_600px)]:[.lab-gravity-simulation-compact_&_output]:[font-size:1.375rem] [&[data-active=true]]:[border-color:#aa97ff70] [&[data-active=true]]:[background:#aa97ff10] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none]"
        data-simulation-variable="force"
        data-active={active === "force"}
      >
        <span>{t("force")}</span>
        <output
          aria-live="off"
          aria-label={`${format.number(force, { notation: "scientific", maximumSignificantDigits: 3 })} N`}
        >
          {mantissa} × 10<sup>{exponent}</sup> <small>N</small>
        </output>
      </div>

      {/* Diagrama animado de los dos cuerpos. */}
      <GravityAttractionDiagram id={id} parameters={parameters} active={active} />

      {/* Valores actuales compartidos con el laboratorio. */}
      <GravitySimulationValues parameters={parameters} active={active} />
    </section>
  );
};
