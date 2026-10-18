"use client";

import { useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import css from "./GravitySplitPanels.module.css";

const sides = ["left", "right"] as const;
type Side = (typeof sides)[number];
const subscribe = (notify: () => void) => {
  const media = window.matchMedia("(min-width: 1024px)");
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
const desktopSnapshot = () => window.matchMedia("(min-width: 1024px)").matches;
const serverSnapshot = () => false;
const buttonStyle = "border border-slate-600 bg-slate-900 text-violet-200 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200";

/** Both children stay mounted; only presentation and keyboard access change. */
export const GravitySplitPanels = ({ left, right, leftLabel, rightLabel }: {
  left: ReactNode;
  right: ReactNode;
  leftLabel: string;
  rightLabel: string;
}) => {
  const t = useTranslations("Gravity.panels");
  const id = useId();
  const desktop = useSyncExternalStore(subscribe, desktopSnapshot, serverSnapshot);
  const [collapsed, setCollapsed] = useState<Side | null>(null);
  const [selected, setSelected] = useState<Side>("left");
  const contents = useRef<Partial<Record<Side, HTMLDivElement>>>({});
  const desktopButtons = useRef<Partial<Record<Side, HTMLButtonElement>>>({});
  const mobileButtons = useRef<Partial<Record<Side, HTMLButtonElement>>>({});
  const lastFocusedPanel = useRef<Side | null>(null);
  const visible = (side: Side) => desktop ? collapsed !== side : selected === side;

  // Also handles a viewport change while a field in the newly hidden panel has focus.
  useLayoutEffect(() => {
    const focusedSide = lastFocusedPanel.current;
    if (!focusedSide || (desktop ? collapsed !== focusedSide : selected === focusedSide)) return;
    const target = desktop ? desktopButtons.current[focusedSide] : mobileButtons.current[selected];
    target?.focus({ preventScroll: true });
    lastFocusedPanel.current = null;
  }, [desktop, collapsed, selected]);

  const toggle = (side: Side) => {
    const content = contents.current[side];
    if (content) content.style.setProperty("--closing-width", `${content.getBoundingClientRect().width}px`);
    // Closing the other side restores the previously closed panel in the same update.
    setCollapsed(current => current === side ? null : side);
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col" data-gravity-split-panels>
      <div role="group" aria-label={t("choose")} className="sticky top-[var(--site-header-height,0px)] z-10 mb-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-950/95 p-1 lg:hidden">
        {sides.map(side => (
          <button key={side} ref={element => { if (element) mobileButtons.current[side] = element; }}
            type="button" aria-label={t("show", { panel: side === "left" ? leftLabel : rightLabel })}
            aria-expanded={selected === side} aria-controls={`${id}-${side}`} data-panel-select={side}
            onFocus={() => { lastFocusedPanel.current = null; }}
            onClick={() => setSelected(side)}
            className={`min-h-11 min-w-0 rounded-lg px-2 py-2 text-sm font-semibold ${buttonStyle} ${selected === side ? "border-violet-300 bg-violet-300/15 text-cyan-100" : ""}`}>
            {side === "left" ? leftLabel : rightLabel}
          </button>
        ))}
      </div>
      <div className={css.grid} data-collapsed={collapsed ?? "none"} data-selected={selected} data-gravity-stage-layout>
        {sides.map(side => (
          <div key={side} className={css.panel} data-side={side} data-open={visible(side)}>
            <div className={css.clip}>
              <div id={`${id}-${side}`} ref={element => { if (element) contents.current[side] = element; }}
                className={css.content} inert={!visible(side)} aria-hidden={!visible(side)}
                onFocusCapture={() => { lastFocusedPanel.current = side; }}
                onBlurCapture={event => {
                  if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) lastFocusedPanel.current = null;
                }}>
                {side === "left" ? left : right}
              </div>
            </div>
            <button ref={element => { if (element) desktopButtons.current[side] = element; }}
              type="button" data-panel-toggle={side} aria-controls={`${id}-${side}`} aria-expanded={collapsed !== side}
              aria-label={t(collapsed === side ? "expand" : "collapse", { panel: side === "left" ? leftLabel : rightLabel })}
              onFocus={() => { lastFocusedPanel.current = null; }} onClick={() => toggle(side)}
              className={`${css.toggle} ${buttonStyle} hidden h-11 w-8 items-center justify-center rounded-lg lg:flex`}>
              <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d={(side === "left") !== (collapsed === side) ? "m12 5-5 5 5 5" : "m8 5 5 5-5 5"} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
