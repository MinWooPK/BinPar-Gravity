"use client";

import { MathText } from "@/components/ui/MathText";
import { useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { ExplainWithAI } from "@/features/ai/presentation/components/ExplainWithAI";
import type { GravityVariable } from "../../../../types/gravity.types";
import { parseFormulaValue } from "../../../../application/parseFormulaValue";
import { isInLaboratoryRange } from "../../../../application/formulaInput";
import { useGravityFormulaDraft } from "../../../providers/GravityParametersProvider";
import { useGravityFormulaInteraction } from "../GravityFormulaInteraction";
import { GravityFormulaLegend } from "../GravityFormulaLegend";
import { GravityEquation } from "./GravityEquation";
import { GravityFormulaToolbar } from "./GravityFormulaToolbar";
import { GravityFormulaFields, GravityUnknownSelector } from "./GravityFormulaFields";
import { fields } from "./formulaFields";

// Muestra los campos editables de la fórmula, el resultado y los avisos de validación.
export const GravityFormulaContent = ({
  variant,
  explanation,
  resetButtonRef,
  onReset,
}: {
  explanation?: ReactNode;
  variant: "card" | "embedded";
  resetButtonRef: RefObject<HTMLButtonElement | null>;
  onReset: () => void;
}) => {
  // Obtiene los textos traducidos de gravedad.
  const t = useTranslations("Gravity");
  // Formatea los números según el idioma.
  const format = useFormatter();
  // Genera identificadores accesibles para los elementos del formulario.
  const id = useId();
  // Controla la visibilidad del aviso de valores fuera de rango.
  const [showWarning, setShowWarning] = useState(false);
  // Obtiene los valores, la incógnita y las acciones de la calculadora.
  const {
    values,
    unknown,
    result,
    numericalError,
  } = useGravityFormulaDraft();
  // Consulta el estado y los eventos de interacción con la fórmula.
  const { hover, select } = useGravityFormulaInteraction();
  // Guarda las referencias de los campos para mover el foco.
  const inputRefs = useRef<
    Partial<Record<GravityVariable, HTMLInputElement | null>>
  >({});
  // Obtiene el valor de una variable, calculado o introducido.
  const currentValue = (key: GravityVariable) =>
    unknown === key ? (result?.[key] ?? null) : parseFormulaValue(values[key]);
  // Da formato legible a los valores numéricos.
  const formatValue = (value: number) =>
    format.number(value, {
      maximumSignificantDigits: 6,
      ...(value < 0.001 ? { notation: "scientific" } : {}),
    });
  // Selecciona una variable y enfoca su campo correspondiente.
  const focusField = (key: GravityVariable) => {
    select(key);
    inputRefs.current[key]?.focus({ preventScroll: true });
  };
  // Localiza los campos con valores escritos que no son válidos.
  const invalidFields = fields.filter(
    ({ key }) =>
      key !== unknown &&
      values[key].trim() !== "" &&
      parseFormulaValue(values[key]) === null,
  );
  // Detecta resultados correctos numéricamente pero fuera del laboratorio.
  const rangeError =
    result !== null &&
    !numericalError &&
    invalidFields.length === 0 &&
    !isInLaboratoryRange(result);
  // Prepara el mensaje de estado o error que mostrará la calculadora.
  const status =
    invalidFields.length > 0
      ? t("invalidFormulaValue", { symbol: invalidFields[0].symbol })
      : numericalError
        ? t("numericalError")
        : rangeError
          ? `${t("outsideLabRange")} ${t("outsideLabRangeConsequence")}`
          : result && unknown
            ? t("automaticResult", {
                symbol: fields.find(({ key }) => key === unknown)!.symbol,
                value: formatValue(result[unknown]),
                unit: fields.find(({ key }) => key === unknown)!.unit,
              })
            : "";

  return (
    <section
      className={variant === "embedded" ? "flex flex-col w-full max-w-[560px] mx-auto self-start min-w-0 gap-2 p-3 text-base leading-normal [&_>_*]:[flex-shrink:0] [&_button:focus-visible]:[outline:2px_solid_#c4b5fd] [&_button:focus-visible]:[outline-offset:3px] [@media_(prefers-reduced-motion:_reduce)]:[&_button]:[transition:none]" : "flex flex-col justify-between min-w-0 [padding:12px] [font-size:1rem] [line-height:1.5] border border-solid border-lab-line [border-radius:14px] [background:linear-gradient(145deg,_#131724,_#0e121d)] [@media(max-width:520px)]:[padding:14px] in-[#gravity-understanding]:p-2.5 [&_>_*]:[flex-shrink:0] [&_button:focus-visible]:[outline:2px_solid_#c4b5fd] [&_button:focus-visible]:[outline-offset:3px] [@media_(prefers-reduced-motion:_reduce)]:[&_button]:[transition:none]"}
      aria-labelledby={`${id}-heading`}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          select(null);
          hover(null);
          setShowWarning(false);
        }
      }}
    >
      <div className="flex items-center justify-between flex-wrap [gap:8px_12px] [&_h3]:[margin:0] [&_h3]:[color:#f2f2fa] [&_h3]:[font-size:1.125rem] [&_h3]:[font-weight:600] [&_h3]:[line-height:1.4]">
        <h3 id={`${id}-heading`}>
          {t("introFormulaTitle")} <ExplainWithAI topic="formula" />
        </h3>

        <GravityFormulaToolbar
          id={id}
          rangeError={rangeError}
          showWarning={showWarning}
          setShowWarning={setShowWarning}
          resetButtonRef={resetButtonRef}
          onReset={() => {
            setShowWarning(false);
            onReset();
          }}
        />
      </div>
      <p id={`${id}-instructions`} className="sr-only">
        {t("formulaFieldsInstruction")}
      </p>
      <p className="sr-only">{t("formulaSpoken")}</p>
      <div className="flex flex-col items-center gap-2">
        <GravityEquation
          id={id}
          currentValue={currentValue}
          onSelect={focusField}
        />
        <GravityUnknownSelector />
      </div>
      {explanation}
      <GravityFormulaFields id={id} inputRefs={inputRefs} />

      <GravityFormulaLegend id={id} />
      {/* Mantiene estable el anuncio accesible al introducir valores fuera de rango.
          Los valores del laboratorio se muestran sin crear otra región dinámica. */}
      <p
        id={`${id}-status`}
        role="status"
        aria-atomic="true"
        className={
          rangeError
            ? "sr-only"
            : invalidFields.length > 0 || numericalError
              ? "[margin:10px_0_0] [font-size:.875rem] [line-height:1.5] [overflow-wrap:anywhere] [color:#fde68a]"
              : "[min-height:1.45em] [margin:6px_0] [color:#aeb8cb] [font-size:.875rem] [line-height:1.45] in-[#gravity-understanding]:my-0.5 [&_strong]:[color:#d8c9ff] [&_strong]:[font-weight:600]"
        }
      >
        <MathText>{status}</MathText>
      </p>
    </section>
  );
};
