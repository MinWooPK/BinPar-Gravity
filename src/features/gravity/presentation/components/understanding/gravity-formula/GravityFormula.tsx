"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useGravityControls } from "../../../providers/GravityParametersProvider";
import { useGravityFormulaInteraction } from "../GravityFormulaInteraction";
import { GravityFormulaContent } from "./GravityFormulaContent";

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
