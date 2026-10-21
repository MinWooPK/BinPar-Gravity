"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { ExplainWithAI } from "@/features/ai/presentation/components/ExplainWithAI";
import { GravityFormulaTutor } from "../GravityFormulaTutor";
import { useGravityFormulaInteraction } from "../GravityFormulaInteraction";
import { GravityFormulaLegend } from "../GravityFormulaLegend";
import { GravityEquation } from "./GravityEquation";
import { fields } from "./formulaFields";

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
