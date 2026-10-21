"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { ExplainWithAI } from "@/features/ai/presentation/components/ExplainWithAI";
import { GravityFormulaTutor } from "./GravityFormulaTutor";
import type { ReactNode, RefObject } from "react";
import { useFormatter, useTranslations } from "next-intl";
import type { GravityVariable } from "../../../types/gravity.types";
import { parseFormulaValue } from "../../../application/parseFormulaValue";
import { isInLaboratoryRange } from "../../../application/formulaInput";
import { laboratoryLimits } from "../../../domain/gravitation";
import {
  useGravityControls,
  useGravityFormulaDraft,
  useGravityParameters,
} from "../../providers/GravityParametersProvider";
import { useGravityFormulaInteraction } from "./GravityFormulaInteraction";
import type { FormulaTerm } from "../../../types/formula.types";
import { GravityFormulaLegend } from "./GravityFormulaLegend";

// Define las variables de la fórmula, sus símbolos, unidades y claves de traducción.
const fields = [
  {
    key: "force",
    symbol: "F",
    unit: "N",
    label: "formulaForceLabel",
    description: "formulaForceDescription",
  },
  {
    key: "mass1",
    symbol: "m₁",
    unit: "kg",
    label: "formulaMass1Label",
    description: "formulaMass1Description",
  },
  {
    key: "mass2",
    symbol: "m₂",
    unit: "kg",
    label: "formulaMass2Label",
    description: "formulaMass2Description",
  },
  {
    key: "distance",
    symbol: "r",
    unit: "m",
    label: "formulaDistanceLabel",
    description: "formulaDistanceDescription",
  },
] as const;

// Coordina la calculadora gravitatoria y permite restablecer sus valores.
export const GravityFormula = ({
  variant = "card",
  explanation,
  footer,
}: {
  variant?: "card" | "embedded";
  explanation?: ReactNode;
  footer?: ReactNode;
}) => {
  // Obtiene las funciones para restablecer la calculadora y controlar su versión.
  const { resetVersion, resetParameters } = useGravityControls();
  // Accede a las interacciones compartidas con los símbolos de la fórmula.
  const interaction = useGravityFormulaInteraction();
  // Guarda la referencia del botón de restablecimiento.
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  // Indica si se debe recuperar el foco tras restablecer la calculadora.
  const restoreResetFocus = useRef(false);

  // Devuelve el foco al botón cuando cambia la versión de reinicio.
  useEffect(() => {
    if (restoreResetFocus.current) {
      resetButtonRef.current?.focus({ preventScroll: true });
      restoreResetFocus.current = false;
    }
  }, [resetVersion]);
  // Prepara el contenido de la calculadora con las acciones de reinicio.
  const content = (
    <GravityFormulaContent
      key={resetVersion}
      variant={footer ? "embedded" : variant}
      explanation={explanation}
      resetButtonRef={resetButtonRef}
      onReset={() => {
        interaction.select(null);
        interaction.hover(null);
        restoreResetFocus.current = true;
        resetParameters();
      }}
    />
  );
  // Al reiniciar solo se vuelve a montar la calculadora, no la conversación.
  return footer ? (
    <div className="flex flex-col justify-between min-w-0 [padding:12px] [font-size:1rem] [line-height:1.5] border border-solid border-lab-line [border-radius:14px] [background:linear-gradient(145deg,_#131724,_#0e121d)] [@media(max-width:520px)]:[padding:14px] in-[#gravity-understanding]:p-2.5 [&_>_*]:[flex-shrink:0] [&_button:focus-visible]:[outline:2px_solid_#c4b5fd] [&_button:focus-visible]:[outline-offset:3px] [@media_(prefers-reduced-motion:_reduce)]:[&_button]:[transition:none]">
      {content}
      {footer}
    </div>
  ) : (
    content
  );
};

// Muestra los campos editables de la fórmula, el resultado y los avisos de validación.
const GravityFormulaContent = ({
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
  // Consulta los parámetros actuales del laboratorio.
  const { parameters } = useGravityParameters();
  // Obtiene los valores, la incógnita y las acciones de la calculadora.
  const {
    values,
    unknown,
    result,
    numericalError,
    changeValue,
    selectUnknown,
  } = useGravityFormulaDraft();
  // Consulta el estado y los eventos de interacción con la fórmula.
  const { active, hover, focus, select } = useGravityFormulaInteraction();
  // Guarda las referencias de los campos para mover el foco.
  const inputRefs = useRef<
    Partial<Record<GravityVariable, HTMLInputElement | null>>
  >({});
  // Identifica si un término debe mostrarse resaltado.
  const isActive = (term: FormulaTerm) =>
    active === term ||
    (active === "masses" && (term === "mass1" || term === "mass2"));
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

        <div className="flex flex-wrap items-center [gap:4px] min-w-0 gap-2 relative">
          {/* BOTÓN DE WARNING */}
          {rangeError && (
            <button
              type="button"
              onClick={() => setShowWarning((prev) => !prev)}
              aria-label={t("outsideLabRange")}
              aria-expanded={showWarning}
              aria-controls={`${id}-range-warning`}
              title={t("outsideLabRange")}
              className={`inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg border px-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 ${
                showWarning
                  ? "border-amber-400 bg-amber-500/20 text-amber-200"
                  : "border-amber-400/50 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
              }`}
            >
              <TriangleAlert size={19} strokeWidth={2} aria-hidden="true" />
            </button>
          )}

          {/* RESTABLECER */}
          <button
            ref={resetButtonRef}
            type="button"
            onClick={() => {
              setShowWarning(false);
              onReset();
            }}
            aria-label={t("reset")}
            aria-describedby={`${id}-reset-hint`}
            className="[min-height:44px] [padding:8px_12px] [border:1px_solid_#544776] [border-radius:8px] [background:#aa97ff12] [color:#d0c1ff] [font-size:.875rem] cursor-pointer [&:hover]:[background:#aa97ff25]"
          >
            {t("resetShort")}
          </button>

          {/* MENSAJE FLOTANTE ABSOLUTE */}
          {rangeError && showWarning && (
            <section
              id={`${id}-range-warning`}
              data-formula-range-warning
              aria-labelledby={`${id}-range-heading`}
              className="mt-3 min-w-0 space-y-3 rounded-xl border border-amber-400/60 bg-[#24191d] p-4 text-sm leading-relaxed text-amber-50/90 [overflow-wrap:anywhere] [&]:[animation:lab-gravity-formula-range-warning-appear_220ms_ease-out] [@media_(prefers-reduced-motion:_reduce)]:[&]:[animation:none] absolute! top-full! right-0 z-50 mt-2! w-[min(380px,calc(100vw-24px))] max-h-[70dvh] overflow-y-auto shadow-2xl shadow-black/60"
            >
              {/* ENCABEZADO */}
              <div className="flex items-start gap-2">
                <TriangleAlert
                  size={22}
                  strokeWidth={2}
                  className="mt-0.5 shrink-0 text-amber-300"
                  aria-hidden="true"
                />

                <div className="min-w-0 space-y-2">
                  <h4
                    id={`${id}-range-heading`}
                    className="text-base font-semibold leading-snug text-amber-100 sm:text-lg"
                  >
                    {t("outsideLabRange")}
                  </h4>

                  <p>{t("outsideLabRangeDescription")}</p>
                </div>
              </div>

              {/* LÍMITES */}
              <ul className="list-inside list-disc space-y-1 font-medium text-amber-100">
                <li>
                  {t("outsideLabMassLimits", {
                    min: format.number(laboratoryLimits.mass1.min),
                    max: format.number(laboratoryLimits.mass1.max),
                  })}
                </li>

                <li>
                  {t("outsideLabDistanceLimits", {
                    min: format.number(laboratoryLimits.distance.min),
                    max: format.number(laboratoryLimits.distance.max),
                  })}
                </li>
              </ul>

              {/* CONSECUENCIAS */}
              <p className="border-t border-amber-300/20 pt-3">
                {t("outsideLabRangeConsequence")}
              </p>

              {/* VALORES QUE CONSERVA EXPERIMENTA */}
              <div className="rounded-lg bg-slate-950/30 p-3">
                <p className="mb-2 font-medium text-amber-100">
                  {t("outsideLabCurrentValues")}
                </p>

                <dl className="flex flex-wrap gap-x-5 gap-y-2 tabular-nums">
                  {fields.map(
                    (field) =>
                      field.key !== "force" && (
                        <div key={field.key} className="min-w-0">
                          <dt className="text-xs text-amber-100/80">
                            {t(field.label)}
                          </dt>

                          <dd className="font-semibold text-amber-50">
                            {formatValue(parameters[field.key])} {field.unit}
                          </dd>
                        </div>
                      ),
                  )}
                </dl>
              </div>
            </section>
          )}
        </div>
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
        <fieldset
          className="flex-none w-full max-w-[360px] min-w-0 m-0 p-0 [border:0] [&_legend]:[margin-bottom:6px] [&_legend]:[color:#cbd5e1] [&_legend]:[font-size:0.875rem] [&_>_div]:[display:grid] [&_>_div]:[grid-template-columns:repeat(4,_minmax(0,_1fr))] [&_>_div]:[gap:6px] [&_button]:[min-width:0] [&_button]:[min-height:40px] [&_button]:[padding:4px] [&_button]:[border:1px_solid_#3f3a53] [&_button]:[border-radius:8px] [&_button]:[background:#111624] [&_button]:[color:#cbd5e1] [&_button]:[font:inherit] [&_button]:[cursor:pointer] [&_button]:[transition:background_140ms,_border-color_140ms] [&_button[aria-pressed=true]]:[border-color:#aa97ff] [&_button[aria-pressed=true]]:[background:#aa97ff20] [&_button[aria-pressed=true]]:[color:#e4dcff] [&&_button:hover]:[border-color:#c4b5fd]"
          aria-label={t("calculateUnknown")}
        >
          <legend>{t("calculateUnknown")}</legend>
          <div>
            {fields.map(({ key, symbol }) => (
              <button
                key={key}
                type="button"
                data-unknown-variable={key}
                aria-pressed={unknown === key}
                onClick={() => {
                  selectUnknown(key);
                  select(key);
                }}
                onFocus={() => focus(key)}
                onBlur={() => focus(null)}
              >
                {symbol}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      {explanation}
      <div className="[margin-top:8px] grid [grid-template-columns:repeat(2,_minmax(0,_1fr))] [gap:8px] [@media(max-width:520px)]:[grid-template-columns:minmax(0,_1fr)] in-[#gravity-understanding]:mt-1 in-[#gravity-understanding]:gap-1.5">
        {fields.map((field) => {
          // Comprueba si esta variable es la incógnita.
          const calculated = unknown === field.key;
          // Obtiene el valor correspondiente al campo.
          const value = calculated
            ? (result?.[field.key] ?? null)
            : parseFormulaValue(values[field.key]);
          // Recupera los límites permitidos para la variable.
          const limits =
            field.key === "force" ? null : laboratoryLimits[field.key];
          // Marca el campo si contiene un valor incorrecto o fuera de rango.
          const invalid =
            (!calculated &&
              values[field.key].trim() !== "" &&
              value === null) ||
            (value !== null &&
              limits !== null &&
              (value < limits.min || value > limits.max));
          return (
            <div
              key={field.key}
              data-formula-field={field.key}
              data-active={isActive(field.key)}
              data-calculated={calculated}
              data-invalid={invalid}
              className="min-w-0 [padding:6px_8px] [border:1px_solid_#30364b] [border-radius:10px] [background:#0d1320] [transition:border-color_140ms,_background_140ms] in-[#gravity-understanding]:py-1 [&[data-calculated=true]_.lab-gravity-formula-input-group]:[border-color:#5ee7d550] [&[data-calculated=true]_input]:[color:#95efde] [&[data-invalid=true]_.lab-gravity-formula-input-group]:[border-color:#fbbf24] [&[data-active=true]]:[border-color:#c4b5fd] [&[data-active=true]]:[background:#a997ff12] [&&[data-active=true]_.lab-gravity-formula-input-group]:[border-color:#c4b5fd] [&&[data-active=true]_.lab-gravity-formula-input-group]:[box-shadow:0_0_0_1px_#aa97ff35] [&&[data-active=true]_.lab-gravity-formula-field-title]:[color:#e4d7ff] [&[data-formula-field=mass2][data-active=true]]:[border-color:#5ee7d5] [&&[data-formula-field=mass2][data-active=true]_.lab-gravity-formula-input-group]:[border-color:#5ee7d5] [&&[data-formula-field=mass2][data-active=true]_.lab-gravity-formula-input-group]:[box-shadow:0_0_0_1px_#5ee7d530] [&&[data-formula-field=mass2][data-active=true]_.lab-gravity-formula-field-title]:[color:#a7f3e4] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none]"
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") hover(field.key);
              }}
              onPointerLeave={() => hover(null)}
              onFocus={() => focus(field.key)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget))
                  focus(null);
              }}
            >
              <label
                htmlFor={`${id}-input-${field.key}`}
                className="lab-gravity-formula-field-title flex items-baseline justify-between [gap:6px] [margin-bottom:4px] [color:#d6dbea] [font-size:.9375rem] font-semibold [line-height:1.3] [transition:color_140ms] [@media(max-width:520px)]:[font-size:1rem] in-[#gravity-understanding]:mb-0.5 [&_>_span]:[color:#b9a8ff] [&_>_span]:[font-family:Georgia,_serif] [&_>_span]:[font-size:1rem] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none]"
              >
                {t(field.label)} <span>{field.symbol}</span>
              </label>
              <div className="lab-gravity-formula-input-group flex items-center min-w-0 [min-height:44px] [border:1px_solid_#64748b] [border-radius:7px] [background:#070d1a] [transition:border-color_140ms,_box-shadow_140ms] [&_input]:[width:100%] [&_input]:[min-width:0] [&_input]:[min-height:40px] [&_input]:[padding:6px] [&_input]:[border:0] [&_input]:[border-radius:7px] [&_input]:[background:transparent] [&_input]:[color:#f8fafc] [&_input]:[font:inherit] [&&_input]:[font-size:0.875rem] [&&_input]:[line-height:1.5] [&_input]:[font-variant-numeric:tabular-nums] [&_input::placeholder]:[color:#8e9bb2] [&_input::placeholder]:[opacity:1] [&_input:focus-visible]:[outline:2px_solid_#c4b5fd] [&_input:focus-visible]:[outline-offset:3px] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none]">
                <input
                  ref={(element) => {
                    inputRefs.current[field.key] = element;
                  }}
                  id={`${id}-input-${field.key}`}
                  name={field.key}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  spellCheck={false}
                  value={
                    calculated
                      ? result
                        ? String(Number(result[field.key].toPrecision(12)))
                        : ""
                      : values[field.key]
                  }
                  placeholder={
                    calculated ? t("resultPendingShort") : t("enterValue")
                  }
                  readOnly={calculated}
                  aria-invalid={invalid}
                  aria-describedby={`${id}-description-${field.key} ${id}-status${calculated ? ` ${id}-calculated` : ""}`}
                  onChange={(event) =>
                    changeValue(field.key, event.target.value)
                  }
                />
                <span aria-hidden="true" className="shrink-0 [padding:6px_8px] [border-left:1px_solid_#334155] [color:#aebbcf] [font-size:.875rem]">
                  {field.unit}
                </span>
              </div>
              <p id={`${id}-description-${field.key}`} className="sr-only">
                {t.rich(field.description, {
                  highlight: (chunks) => <strong>{chunks}</strong>,
                })}
              </p>
              {calculated && (
                <span id={`${id}-calculated`} className="block [margin-top:4px] [color:#95efde] [font-size:.75rem] [line-height:1.4] in-[#gravity-understanding]:mt-0.5">
                  {t("automaticallyCalculated")}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <GravityFormulaLegend id={id} />
      {/* {rangeError && (
        <section
          data-formula-range-warning
          className="mt-3 min-w-0 space-y-3 rounded-xl border border-amber-400/60 bg-amber-950/40 p-4 text-sm leading-relaxed text-amber-50/90 [overflow-wrap:anywhere] [&]:[animation:lab-gravity-formula-range-warning-appear_220ms_ease-out] [@media_(prefers-reduced-motion:_reduce)]:[&]:[animation:none]"
          aria-labelledby={`${id}-range-heading`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-6 shrink-0 text-amber-300" />
            <div className="min-w-0 space-y-2">
              <h4
                id={`${id}-range-heading`}
                className="text-base leading-snug font-semibold text-amber-100 sm:text-lg"
              >
                {t("outsideLabRange")}
              </h4>
              <p>{t("outsideLabRangeDescription")}</p>
            </div>
          </div>
          <ul className="list-inside list-disc space-y-1 font-medium text-amber-100">
            <li>
              {t("outsideLabMassLimits", {
                min: format.number(laboratoryLimits.mass1.min),
                max: format.number(laboratoryLimits.mass1.max),
              })}
            </li>
            <li>
              {t("outsideLabDistanceLimits", {
                min: format.number(laboratoryLimits.distance.min),
                max: format.number(laboratoryLimits.distance.max),
              })}
            </li>
          </ul>
          <p className="border-t border-amber-300/20 pt-3">
            {t("outsideLabRangeConsequence")}
          </p>
          <div className="rounded-lg bg-slate-950/30 p-3">
            <p className="mb-2 font-medium text-amber-100">
              {t("outsideLabCurrentValues")}
            </p>
            <dl className="flex flex-wrap gap-x-5 gap-y-2 tabular-nums">
              {fields.map(
                (field) =>
                  field.key !== "force" && (
                    <div key={field.key} className="min-w-0">
                      <dt className="text-xs text-amber-100/80">
                        {t(field.label)}
                      </dt>
                      <dd className="font-semibold text-amber-50">
                        {formatValue(parameters[field.key])} {field.unit}
                      </dd>
                    </div>
                  ),
              )}
            </dl>
          </div>
        </section>
      )} */}
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
        {status}
      </p>
    </section>
  );
};

// Representa la ecuación interactiva y permite seleccionar sus símbolos.
const GravityEquation = ({
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
        {field.symbol}
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

// Muestra la fórmula como material educativo, sin campos de cálculo editables.
export const GravityFormulaEducation = () => {
  // Obtiene las traducciones de la explicación educativa.
  const t = useTranslations("Gravity");
  // Genera identificadores accesibles para símbolos y descripciones.
  const id = useId();

  // Consulta las interacciones activas de los símbolos de la fórmula.
  const { active, select, hover } = useGravityFormulaInteraction();

  return (
    <section
      className="flex flex-col w-full max-w-[560px] mx-auto self-start min-w-0 gap-2 p-3 text-base leading-normal [&_>_*]:[flex-shrink:0] [&_button:focus-visible]:[outline:2px_solid_#c4b5fd] [&_button:focus-visible]:[outline-offset:3px] [@media_(prefers-reduced-motion:_reduce)]:[&_button]:[transition:none]"
      aria-labelledby={`${id}-heading`}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          select(null);
          hover(null);
        }
      }}
    >
      <div className="flex items-center justify-between flex-wrap [gap:8px_12px] [&_h3]:[margin:0] [&_h3]:[color:#f2f2fa] [&_h3]:[font-size:1.125rem] [&_h3]:[font-weight:600] [&_h3]:[line-height:1.4]">
        <h3 id={`${id}-heading`}>
          {t("introFormulaTitle")} <ExplainWithAI topic="formula" />
        </h3>
      </div>
      <p className="sr-only">{t("formulaSpoken")}</p>
      <GravityFormulaTutor />
      <GravityEquation id={id} />
      <div className="grid min-w-0 gap-3">
        {fields.map((field) => (
          <div
            key={field.key}
            className="min-w-0 [padding:6px_8px] [border:1px_solid_#30364b] [border-radius:10px] [background:#0d1320] [transition:border-color_140ms,_background_140ms] in-[#gravity-understanding]:py-1 [&[data-calculated=true]_.lab-gravity-formula-input-group]:[border-color:#5ee7d550] [&[data-calculated=true]_input]:[color:#95efde] [&[data-invalid=true]_.lab-gravity-formula-input-group]:[border-color:#fbbf24] [&[data-active=true]]:[border-color:#c4b5fd] [&[data-active=true]]:[background:#a997ff12] [&&[data-active=true]_.lab-gravity-formula-input-group]:[border-color:#c4b5fd] [&&[data-active=true]_.lab-gravity-formula-input-group]:[box-shadow:0_0_0_1px_#aa97ff35] [&&[data-active=true]_.lab-gravity-formula-field-title]:[color:#e4d7ff] [&[data-formula-field=mass2][data-active=true]]:[border-color:#5ee7d5] [&&[data-formula-field=mass2][data-active=true]_.lab-gravity-formula-input-group]:[border-color:#5ee7d5] [&&[data-formula-field=mass2][data-active=true]_.lab-gravity-formula-input-group]:[box-shadow:0_0_0_1px_#5ee7d530] [&&[data-formula-field=mass2][data-active=true]_.lab-gravity-formula-field-title]:[color:#a7f3e4] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none]"
            data-active={
              active === field.key ||
              (active === "masses" &&
                (field.key === "mass1" || field.key === "mass2"))
            }
          >
            <h4 className="lab-gravity-formula-field-title flex items-baseline justify-between [gap:6px] [margin-bottom:4px] [color:#d6dbea] [font-size:.9375rem] font-semibold [line-height:1.3] [transition:color_140ms] [@media(max-width:520px)]:[font-size:1rem] in-[#gravity-understanding]:mb-0.5 [&_>_span]:[color:#b9a8ff] [&_>_span]:[font-family:Georgia,_serif] [&_>_span]:[font-size:1rem] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none]">
              {t(field.label)} <span>{field.symbol}</span>
            </h4>
            <p id={`${id}-description-${field.key}`} className="[min-height:1.45em] [margin:6px_0] [color:#aeb8cb] [font-size:.875rem] [line-height:1.45] in-[#gravity-understanding]:my-0.5 [&_strong]:[color:#d8c9ff] [&_strong]:[font-weight:600]">
              {t.rich(field.description, {
                highlight: (chunks) => <strong>{chunks}</strong>,
              })}
            </p>
          </div>
        ))}
      </div>
      <GravityFormulaLegend id={id} />
    </section>
  );
};
