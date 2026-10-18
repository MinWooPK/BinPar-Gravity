"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { GravityFormula } from "./GravityFormula";
import { GravityFormulaInteractionProvider } from "./GravityFormulaInteraction";
import css from "./GravityFormulaAccess.module.css";

const styles = {
  "trigger": `${css["trigger"]} inline-flex items-center justify-center [min-height:44px] [border:1px_solid_#aa97ff70] [border-radius:8px] [background:#aa97ff12] [color:#d0c1ff] cursor-pointer [transition:background_140ms] [padding:8px_12px] [font-size:.875rem]`,
  "close": `${css["close"]} inline-flex items-center justify-center [min-height:44px] [border:1px_solid_#aa97ff70] [border-radius:8px] [background:#aa97ff12] [color:#d0c1ff] cursor-pointer [transition:background_140ms] [width:44px] [font-size:1.5rem]`,
  "drawer": `${css["drawer"]} fixed [inset:0_0_0_auto] [width:min(42rem,_100%)] max-w-full [height:100dvh] [max-height:100dvh] m-0 p-0 [border:1px_solid_#544776] [border-radius:14px_0_0_14px] [background:#0b101e] [color:#e4e8f2]`,
  "header": `${css["header"]} flex shrink-0 items-center justify-between [gap:12px] [padding:10px_16px] [border-bottom:1px_solid_#30364b] [@media(max-width:520px)]:[padding-inline:12px]`,
  "content": `${css["content"]} min-w-0 min-h-0 overflow-y-auto [overscroll-behavior:contain] [scrollbar-width:none] [padding:16px] [padding-bottom:max(16px,_env(safe-area-inset-bottom))] [@media(max-width:520px)]:[padding:10px]`,
} as const;

const FormulaAccessContext = createContext<((trigger: HTMLButtonElement) => void) | null>(null);

/** The drawer presents the same calculator state as the inline view. */
export const GravityFormulaAccess = ({ children }: { children: ReactNode }) => {
  const t = useTranslations("Gravity");
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const show = useCallback((trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setOpen(true);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      closeRef.current?.focus({ preventScroll: true });
    } else if (!open && dialog.open) dialog.close();
  }, [open]);

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
        className={styles.drawer}
        onCancel={(event) => { event.preventDefault(); setOpen(false); }}
        onClose={() => {
          setOpen(false);
          const trigger = triggerRef.current;
          const stageId = trigger?.closest("section[id]")?.id;
          const target = trigger?.getClientRects().length ? trigger
            : document.getElementById("gravity-stage-selector") ??
              (stageId ? document.getElementById(`${stageId}-entry`) : null);
          target?.focus({ preventScroll: true });
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const rect = event.currentTarget.getBoundingClientRect();
          if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) setOpen(false);
        }}
      >
        <header className={styles.header}>
          <h2 id="gravity-formula-title">{t("formulaAccess")}</h2>
          <button ref={closeRef} type="button" className={styles.close} aria-label={t("closeFormula")} onClick={() => setOpen(false)}>×</button>
        </header>
        <div className={styles.content}>
          <GravityFormulaInteractionProvider>
            <GravityFormula />
          </GravityFormulaInteractionProvider>
        </div>
      </dialog>
    </FormulaAccessContext.Provider>
  );
};

export const GravityFormulaButton = () => {
  const t = useTranslations("Gravity");
  const show = useContext(FormulaAccessContext);
  if (!show) throw new Error("Formula access requires GravityFormulaAccess");
  return (
    <button type="button" data-formula-trigger aria-haspopup="dialog" aria-controls="gravity-formula-dialog" className={styles.trigger} onClick={(event) => show(event.currentTarget)}>
      {t("formulaAccess")}
    </button>
  );
};
