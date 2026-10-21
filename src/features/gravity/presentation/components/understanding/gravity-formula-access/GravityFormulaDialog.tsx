"use client";

import { useEffect, useRef, type RefObject } from "react";

import { useTranslations } from "next-intl";

import { GravityFormula } from "../gravity-formula/GravityFormula";

import { GravityFormulaInteractionProvider } from "../GravityFormulaInteraction";

type GravityFormulaDialogProps = {
  open: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onDismiss: () => void;
};

// Muestra la calculadora dentro de un diálogo lateral accesible.
export const GravityFormulaDialog = ({
  open,
  triggerRef,
  onDismiss,
}: GravityFormulaDialogProps) => {
  const t = useTranslations("Gravity");

  // Guarda las referencias del diálogo y del botón de cierre.
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Sincroniza el estado de React con el diálogo nativo.
  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();

      // Sitúa el foco en el botón de cierre.
      closeRef.current?.focus({
        preventScroll: true,
      });
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Recupera el foco cuando se cierra el diálogo.
  const restoreFocus = () => {
    const trigger = triggerRef.current;

    // Identifica la etapa educativa de origen.
    const stageId = trigger?.closest("section[id]")?.id;

    // Prioriza el botón original si continúa visible.
    const target = trigger?.getClientRects().length
      ? trigger
      : (document.querySelector<HTMLButtonElement>(
          '[data-stage-tag][aria-current="step"]',
        ) ?? (stageId ? document.getElementById(`${stageId}-entry`) : null));

    target?.focus({
      preventScroll: true,
    });
  };

  return (
    <dialog
      ref={dialogRef}
      id="gravity-formula-dialog"
      aria-labelledby="gravity-formula-title"
      className="fixed [inset:0_0_0_auto] [width:min(42rem,_100%)] max-w-full [height:100dvh] [max-height:100dvh] m-0 p-0 [border:1px_solid_#544776] [border-radius:14px_0_0_14px] [background:#0b101e] [color:#e4e8f2] [&[open]]:[display:flex] [&[open]]:[flex-direction:column] [&[open]]:[animation:lab-gravity-formula-access-formula-enter_160ms_ease-out] [&::backdrop]:[background:#020713a8] [@media_(prefers-reduced-motion:_reduce)]:[&[open]]:[animation:none]"
      onCancel={(event) => {
        // Gestiona Escape mediante el estado de React.
        event.preventDefault();
        onDismiss();
      }}
      onClose={(event) => {
        // Evita que un cierre anterior afecte a otro panel abierto.
        if (open || event.currentTarget.open) return;

        onDismiss();
        restoreFocus();
      }}
      onClick={(event) => {
        // Ignora los clics dentro del contenido.
        if (event.target !== event.currentTarget) return;

        // Detecta clics fuera de los límites del diálogo.
        const rect = event.currentTarget.getBoundingClientRect();

        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        ) {
          onDismiss();
        }
      }}
    >
      {/* Encabezado y botón para cerrar la calculadora. */}
      <header className="flex shrink-0 items-center justify-between [gap:12px] [padding:10px_16px] [border-bottom:1px_solid_#30364b] [@media(max-width:520px)]:[padding-inline:12px] [&_h2]:[margin:0] [&_h2]:[font-size:1.125rem] [&_h2]:[font-weight:600]">
        <h2 id="gravity-formula-title">{t("formulaAccess")}</h2>

        <button
          ref={closeRef}
          type="button"
          className="inline-flex items-center justify-center [min-height:44px] [border:1px_solid_#aa97ff70] [border-radius:8px] [background:#aa97ff12] [color:#d0c1ff] cursor-pointer [transition:background_140ms] [width:44px] [font-size:1.5rem] [&:hover]:[background:#aa97ff25] [&:focus-visible]:[outline:2px_solid_#c4b5fd] [&:focus-visible]:[outline-offset:3px] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none]"
          aria-label={t("closeFormula")}
          onClick={onDismiss}
        >
          ×
        </button>
      </header>

      {/* Calculadora gravitatoria dentro del panel. */}
      <div className="min-w-0 min-h-0 overflow-y-auto [overscroll-behavior:contain] [scrollbar-width:none] [padding:16px] [padding-bottom:max(16px,_env(safe-area-inset-bottom))] [@media(max-width:520px)]:[padding:10px] [&::-webkit-scrollbar]:[display:none]">
        <GravityFormulaInteractionProvider>
          <GravityFormula />
        </GravityFormulaInteractionProvider>
      </div>
    </dialog>
  );
};
