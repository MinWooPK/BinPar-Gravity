"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { GravityFormula } from "./GravityFormula";
import { GravityFormulaInteractionProvider } from "./GravityFormulaInteraction";

// Crea el contexto que permite abrir la calculadora desde otros componentes.
const FormulaAccessContext = createContext<
  ((trigger: HTMLButtonElement) => void) | null
>(null);

// Gestiona el panel lateral de la calculadora gravitatoria,
// compartiendo su estado con la calculadora integrada.
export const GravityFormulaAccess = ({ children }: { children: ReactNode }) => {
  // Obtiene las traducciones de la sección de gravedad.
  const t = useTranslations("Gravity");

  // Controla si el panel lateral está abierto o cerrado.
  const [open, setOpen] = useState(false);

  // Almacena las referencias del diálogo, el botón de cierre
  // y el botón que abrió la calculadora.
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Abre el panel y recuerda qué botón lo activó.
  const show = useCallback((trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setOpen(true);
  }, []);

  // Sincroniza el estado de React con la apertura del diálogo
  // y coloca el foco en el botón de cierre.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      closeRef.current?.focus({ preventScroll: true });
    } else if (!open && dialog.open) dialog.close();
  }, [open]);

  // Cierra la calculadora cuando cambia la navegación de la aplicación.
  useEffect(() => {
    const closeOnHistoryChange = () => setOpen(false);

    window.addEventListener("popstate", closeOnHistoryChange);
    window.addEventListener("hashchange", closeOnHistoryChange);

    return () => {
      window.removeEventListener("popstate", closeOnHistoryChange);
      window.removeEventListener("hashchange", closeOnHistoryChange);
    };
  }, []);

  return (
    <FormulaAccessContext.Provider value={show}>
      {children}

      <dialog
        ref={dialogRef}
        id="gravity-formula-dialog"
        aria-labelledby="gravity-formula-title"
        className="fixed [inset:0_0_0_auto] [width:min(42rem,_100%)] max-w-full [height:100dvh] [max-height:100dvh] m-0 p-0 [border:1px_solid_#544776] [border-radius:14px_0_0_14px] [background:#0b101e] [color:#e4e8f2] [&[open]]:[display:flex] [&[open]]:[flex-direction:column] [&[open]]:[animation:lab-gravity-formula-access-formula-enter_160ms_ease-out] [&::backdrop]:[background:#020713a8] [@media_(prefers-reduced-motion:_reduce)]:[&[open]]:[animation:none]"
        onCancel={(event) => {
          event.preventDefault();
          setOpen(false);
        }}
        onClose={(event) => {
          // Evita que un cierre anterior afecte a un panel recién abierto.
          if (open || event.currentTarget.open) return;
          setOpen(false);

          // Recupera el botón que abrió la calculadora.
          const trigger = triggerRef.current;

          // Identifica la etapa educativa desde la que se abrió.
          const stageId = trigger?.closest("section[id]")?.id;

          // Selecciona dónde devolver el foco al cerrar el panel.
          const target = trigger?.getClientRects().length
            ? trigger
            : (document.querySelector<HTMLButtonElement>(
                '[data-stage-tag][aria-current="step"]',
              ) ??
              (stageId ? document.getElementById(`${stageId}-entry`) : null));

          target?.focus({ preventScroll: true });
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;

          // Obtiene las dimensiones del diálogo para detectar clics exteriores.
          const rect = event.currentTarget.getBoundingClientRect();

          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            setOpen(false);
        }}
      >
        <header className="flex shrink-0 items-center justify-between [gap:12px] [padding:10px_16px] [border-bottom:1px_solid_#30364b] [@media(max-width:520px)]:[padding-inline:12px] [&_h2]:[margin:0] [&_h2]:[font-size:1.125rem] [&_h2]:[font-weight:600]">
          <h2 id="gravity-formula-title">{t("formulaAccess")}</h2>

          <button
            ref={closeRef}
            type="button"
            className="inline-flex items-center justify-center [min-height:44px] [border:1px_solid_#aa97ff70] [border-radius:8px] [background:#aa97ff12] [color:#d0c1ff] cursor-pointer [transition:background_140ms] [width:44px] [font-size:1.5rem] [&:hover]:[background:#aa97ff25] [&:focus-visible]:[outline:2px_solid_#c4b5fd] [&:focus-visible]:[outline-offset:3px] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none]"
            aria-label={t("closeFormula")}
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </header>

        <div className="min-w-0 min-h-0 overflow-y-auto [overscroll-behavior:contain] [scrollbar-width:none] [padding:16px] [padding-bottom:max(16px,_env(safe-area-inset-bottom))] [@media(max-width:520px)]:[padding:10px] [&::-webkit-scrollbar]:[display:none]">
          <GravityFormulaInteractionProvider>
            <GravityFormula />
          </GravityFormulaInteractionProvider>
        </div>
      </dialog>
    </FormulaAccessContext.Provider>
  );
};

// Muestra el botón que abre la calculadora desde cualquier
// componente incluido dentro de GravityFormulaAccess.
export const GravityFormulaButton = () => {
  // Obtiene las traducciones de la calculadora.
  const t = useTranslations("Gravity");

  // Obtiene del contexto la función que abre el panel lateral.
  const show = useContext(FormulaAccessContext);

  if (!show) throw new Error("Formula access requires GravityFormulaAccess");

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
