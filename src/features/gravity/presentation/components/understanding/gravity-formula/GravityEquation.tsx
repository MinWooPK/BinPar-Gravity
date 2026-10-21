"use client";

import { MathText } from "@/components/ui/MathText";
import { useFormatter, useTranslations } from "next-intl";
import type { GravityVariable } from "../../../../types/gravity.types";
import type { FormulaTerm } from "../../../../types/formula.types";
import { useGravityFormulaInteraction } from "../GravityFormulaInteraction";
import { fields } from "./formulaFields";

// Representa la ecuación interactiva y permite seleccionar sus símbolos.
export const GravityEquation = ({
  id,
  currentValue,
  onSelect,
}: {
  id: string;
  currentValue?: (key: GravityVariable) => number | null;
  onSelect?: (key: GravityVariable) => void;
}) => {
  // Obtiene los textos traducidos de la fórmula.
  const t = useTranslations("Gravity");
  // Formatea los valores que acompañan a los símbolos.
  const format = useFormatter();
  // Consulta qué símbolos están activos, enfocados o seleccionados.
  const { active, selected, hover, focus, select } =
    useGravityFormulaInteraction();
  // Identifica los símbolos que deben aparecer resaltados.
  const isActive = (term: FormulaTerm) =>
    active === term ||
    (active === "masses" && (term === "mass1" || term === "mass2"));
  // Formatea el valor numérico de cada símbolo.
  const formatValue = (value: number) =>
    format.number(value, {
      maximumSignificantDigits: 6,
      ...(value < 0.001 ? { notation: "scientific" } : {}),
    });
  // Construye un término seleccionable de la ecuación.
  const term = (key: GravityVariable) => {
    // Obtiene la información del campo asociado al símbolo.
    const field = fields.find((field) => field.key === key)!;
    // Obtiene su valor actual, si está disponible.
    const value = currentValue?.(key) ?? null;
    return (
      <button
        type="button"
        data-formula-variable={key}
        data-active={isActive(key)}
        aria-pressed={selected === key}
        aria-label={`${t(field.label)} (${field.symbol})${value === null ? "" : `: ${formatValue(value)} ${field.unit}`}`}
        aria-describedby={`${id}-description-${key}`}
        className="inline-flex [min-width:44px] [min-height:44px] items-center justify-center [padding:4px] [border:1px_solid_transparent] [border-radius:8px] [background:transparent] [color:inherit] [line-height:inherit] cursor-pointer [transition:background_140ms,_border-color_140ms,_color_140ms] [@media(max-width:520px)]:[padding-inline:2px] [&[data-active=true]]:[border-color:#c4b5fd] [&[data-active=true]]:[background:#aa97ff20] [&[data-active=true]]:[color:#e9d5ff] [&_sup]:[position:static] [&_sup]:[align-self:center] [&_sup]:[font-size:0.55em] [&_sup]:[line-height:1] [&_sup]:[transform:translateY(-0.4em)]"
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") hover(key);
        }}
        onPointerLeave={() => hover(null)}
        onFocus={() => focus(key)}
        onBlur={() => focus(null)}
        onClick={() => {
          select(key);
          onSelect?.(key);
        }}
      >
        <MathText>{field.symbol}</MathText>
        {key === "distance" && <sup>2</sup>}
      </button>
    );
  };
  return (
    <div className="flex flex-none w-full min-w-0 items-center justify-center flex-wrap [gap:8px_12px] [padding-block:4px] [color:#e4dfff] [font-family:Georgia,_serif] [font-size:clamp(1.75rem,_3vw,_2rem)] [line-height:1] [@media(max-width:520px)]:[gap:3px] [@media(max-width:520px)]:[font-size:1.75rem] in-[#gravity-understanding]:py-0">
      <span className="inline-flex min-w-0 items-center [gap:6px]">
        {term("force")}
        <span aria-hidden="true" className="[color:#9b93b1] [font-size:.7em]">
          =
        </span>
      </span>
      <span className="inline-flex min-w-0 items-center [gap:6px]">
        <button
          type="button"
          data-formula-variable="constant"
          data-active={active === "constant"}
          className="inline-flex [min-width:44px] [min-height:44px] items-center justify-center [padding:4px] [border:1px_solid_transparent] [border-radius:8px] [background:transparent] [color:inherit] [line-height:inherit] cursor-pointer [transition:background_140ms,_border-color_140ms,_color_140ms] [@media(max-width:520px)]:[padding-inline:2px] [&[data-active=true]]:[border-color:#c4b5fd] [&[data-active=true]]:[background:#aa97ff20] [&[data-active=true]]:[color:#e9d5ff] [&_sup]:[position:static] [&_sup]:[align-self:center] [&_sup]:[font-size:0.55em] [&_sup]:[line-height:1] [&_sup]:[transform:translateY(-0.4em)]"
          aria-label={`${t("formulaConstantTitle")}. ${t("formulaConstantFixed")}`}
          aria-describedby={`${id}-constant-value ${id}-constant-description`}
          aria-pressed={selected === "constant"}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") hover("constant");
          }}
          onPointerLeave={() => hover(null)}
          onFocus={() => focus("constant")}
          onBlur={() => focus(null)}
          onClick={() => select(selected === "constant" ? null : "constant")}
        >
          G
        </button>
        <span aria-hidden="true" className="[color:#9b93b1] [font-size:.7em]">
          ×
        </span>
        <span className="inline-flex flex-col min-w-0 text-center [&_>_span]:[display:flex] [&_>_span]:[align-items:center] [&_>_span]:[justify-content:center] [&_>_span]:[gap:4px] [&_>_span:first-child]:[padding-bottom:3px] [&_>_span:first-child]:[border-bottom:1px_solid_#a99bbf] [&_>_span:last-child]:[padding-top:3px] [&_>_span_>_span]:[color:#9b93b1] [&_>_span_>_span]:[font-size:0.65em] [#gravity-understanding_&_>_span:first-child]:[padding-bottom:1px] [#gravity-understanding_&_>_span:last-child]:[padding-top:1px]">
          <span>
            {term("mass1")}
            <span aria-hidden="true">×</span>
            {term("mass2")}
          </span>
          <span>{term("distance")}</span>
        </span>
      </span>
    </div>
  );
};
