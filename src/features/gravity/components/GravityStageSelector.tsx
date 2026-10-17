"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { gravityStages } from "./gravityJourney";
import type { GravityStageId } from "./gravityJourney";

export const GravityStageSelector = ({ activeStage, onSelectStage }: {
  activeStage: GravityStageId;
  onSelectStage: (stage: GravityStageId) => void;
}) => {
  const t = useTranslations("Gravity");
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const openingIndex = useRef(0);
  const activeIndex = gravityStages.findIndex(({ id }) => id === activeStage);
  const active = gravityStages[activeIndex];

  const closeMenu = () => {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  useLayoutEffect(() => {
    if (open) optionRefs.current[openingIndex.current]?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: Event) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("focusin", closeOutside);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("focusin", closeOutside);
    };
  }, [open]);

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = optionRefs.current.indexOf(document.activeElement as HTMLButtonElement);
    let next: number;
    switch (event.key) {
      case "ArrowDown": next = (current + 1) % gravityStages.length; break;
      case "ArrowUp": next = (current - 1 + gravityStages.length) % gravityStages.length; break;
      case "Home": next = 0; break;
      case "End": next = gravityStages.length - 1; break;
      case "Tab": closeMenu(); return;
      default: return;
    }
    event.preventDefault();
    optionRefs.current[next]?.focus();
  };

  return (
    <div
      ref={containerRef}
      className="relative min-w-0"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          event.stopPropagation();
          closeMenu();
        }
      }}
    >
      <button
        ref={triggerRef}
        id="gravity-stage-selector"
        type="button"
        aria-label={`${t("chooseStage")}: ${active.number} — ${t(active.title)}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          openingIndex.current = activeIndex;
          setOpen(!open);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            openingIndex.current = event.key === "ArrowDown" ? 0 : gravityStages.length - 1;
            setOpen(true);
          }
        }}
        className={`flex min-h-11 w-full min-w-0 cursor-pointer items-center gap-3 rounded-lg border bg-[#1b2032] px-3 py-2 text-left text-sm text-violet-100 transition-colors hover:border-violet-300/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 motion-reduce:transition-none ${open ? "border-violet-300" : "border-violet-300/30"}`}
      >
        <span className="shrink-0 font-mono text-violet-300">{active.number}</span>
        <span className="min-w-0 flex-1 break-words">{t(active.title)}</span>
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className={`size-4 shrink-0 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}>
          <path d="m5 7 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={t("chooseStage")}
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 top-full z-50 mt-2 max-h-[min(16rem,35dvh)] w-full overflow-y-auto overscroll-contain rounded-xl border border-violet-300/30 bg-[#111624] p-1.5 shadow-xl shadow-black/40"
        >
          {gravityStages.map((stage, index) => (
            <button
              key={stage.id}
              ref={(element) => { optionRefs.current[index] = element; }}
              type="button"
              role="menuitemradio"
              aria-checked={activeStage === stage.id}
              tabIndex={-1}
              onClick={() => {
                closeMenu();
                onSelectStage(stage.id);
              }}
              className={`flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-violet-300/10 focus-visible:bg-violet-300/15 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-violet-300 motion-reduce:transition-none ${activeStage === stage.id ? "bg-violet-300/10 text-violet-100" : "text-slate-200"}`}
            >
              <span className="shrink-0 font-mono text-violet-300">{stage.number}</span>
              <span className="min-w-0 flex-1 break-words">{t(stage.title)}</span>
              {activeStage === stage.id && <span aria-hidden="true" className="shrink-0 text-violet-300">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
