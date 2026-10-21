"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { GravityFormulaDialog } from "./GravityFormulaDialog";

// Define la función que permite abrir la calculadora.
type ShowFormula = (trigger: HTMLButtonElement) => void;

// Comparte la función de apertura entre los componentes.
const FormulaAccessContext = createContext<ShowFormula | null>(null);

// Permite abrir la calculadora desde cualquier componente
// incluido dentro de GravityFormulaAccess.
export const useFormulaAccess = () => {
  const show = useContext(FormulaAccessContext);

  if (!show) {
    throw new Error("Formula access requires GravityFormulaAccess");
  }

  return show;
};

// Gestiona el estado compartido de la calculadora lateral.
export const GravityFormulaAccess = ({ children }: { children: ReactNode }) => {
  // Controla si la calculadora está abierta.
  const [open, setOpen] = useState(false);

  // Guarda el botón que abrió el panel para recuperar su foco.
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Abre el panel y recuerda el botón que lo activó.
  const show = useCallback((trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setOpen(true);
  }, []);

  // Cierra la calculadora cuando cambia la navegación.
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

      <GravityFormulaDialog
        open={open}
        triggerRef={triggerRef}
        onDismiss={() => setOpen(false)}
      />
    </FormulaAccessContext.Provider>
  );
};
