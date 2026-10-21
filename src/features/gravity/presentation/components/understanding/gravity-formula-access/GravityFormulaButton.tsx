"use client";

import { useTranslations } from "next-intl";

import { useFormulaAccess } from "./GravityFormulaAccess";

// Muestra el botón que abre la calculadora lateral.
export const GravityFormulaButton = () => {
  const t = useTranslations("Gravity");

  // Obtiene la función de apertura desde el contexto.
  const show = useFormulaAccess();

  return (
    <button
      type="button"
      data-formula-trigger
      aria-haspopup="dialog"
      aria-controls="gravity-formula-dialog"
      className="inline-flex items-center justify-center [min-height:44px] [border:1px_solid_#aa97ff70] [border-radius:8px] [background:#aa97ff12] [color:#d0c1ff] cursor-pointer [transition:background_140ms] [padding:8px_12px] [font-size:.875rem] [&:hover]:[background:#aa97ff25] [&:focus-visible]:[outline:2px_solid_#c4b5fd] [&:focus-visible]:[outline-offset:3px] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none]"
      onClick={(event) => show(event.currentTarget)}
    >
      {t("formulaAccess")}
    </button>
  );
};
