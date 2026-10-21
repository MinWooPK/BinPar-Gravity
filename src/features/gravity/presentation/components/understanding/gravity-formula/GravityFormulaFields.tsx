"use client";

import type { RefObject } from "react";
import { useTranslations } from "next-intl";
import type { GravityVariable } from "../../../../types/gravity.types";
import type { FormulaTerm } from "../../../../types/formula.types";
import { parseFormulaValue } from "../../../../application/parseFormulaValue";
import { laboratoryLimits } from "../../../../domain/gravitation";
import { useGravityFormulaDraft } from "../../../providers/GravityParametersProvider";
import { useGravityFormulaInteraction } from "../GravityFormulaInteraction";
import { fields } from "./formulaFields";

// Selecciona qué magnitud debe despejar la calculadora.
export const GravityUnknownSelector = () => {
  const t = useTranslations("Gravity");
  const { unknown, selectUnknown } = useGravityFormulaDraft();
  const { select, focus } = useGravityFormulaInteraction();
  return (
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
  );
};

// Muestra los cuatro campos, valida sus valores y sincroniza el resaltado.
export const GravityFormulaFields = ({
  id, inputRefs,
}: {
  id: string;
  inputRefs: RefObject<Partial<Record<GravityVariable, HTMLInputElement | null>>>;
}) => {
  const t = useTranslations("Gravity");
  const { values, unknown, result, changeValue } = useGravityFormulaDraft();
  const { active, hover, focus } = useGravityFormulaInteraction();
  const isActive = (term: FormulaTerm) =>
    active === term ||
    (active === "masses" && (term === "mass1" || term === "mass2"));
  return (
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
  );
};
