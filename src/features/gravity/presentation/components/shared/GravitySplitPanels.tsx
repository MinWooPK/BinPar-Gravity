"use client";

import { useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type FocusEvent, type ReactNode } from "react";
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
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [selected, setSelected] = useState<Side>("left");
  const contents = useRef<Partial<Record<Side, HTMLDivElement>>>({});
  const toggleButton = useRef<HTMLButtonElement>(null);
  const mobileButtons = useRef<Partial<Record<Side, HTMLButtonElement>>>({});
  const lastFocusedPanel = useRef<Side | null>(null);
  const lastFocusedControl = useRef<"desktop" | "mobile" | null>(null);
  const visible = (side: Side) => desktop ? side === "right" || !leftCollapsed : selected === side;

  // Also handles a viewport change while a field in the newly hidden panel has focus.
  useLayoutEffect(() => {
    const active = document.activeElement;
    if (!desktop && (active === toggleButton.current || lastFocusedControl.current === "desktop")) {
      mobileButtons.current[selected]?.focus({ preventScroll: true });
    } else if (desktop && (lastFocusedControl.current === "mobile" || sides.some(side => active === mobileButtons.current[side]))) {
      toggleButton.current?.focus({ preventScroll: true });
    }
    const focusedSide = lastFocusedPanel.current;
    if (!focusedSide || (desktop ? focusedSide === "right" || !leftCollapsed : selected === focusedSide)) return;
    const target = desktop ? toggleButton.current : mobileButtons.current[selected];
    target?.focus({ preventScroll: true });
    lastFocusedPanel.current = null;
  }, [desktop, leftCollapsed, selected]);

  const onControlBlur = (event: FocusEvent<HTMLButtonElement>) => {
    // CSS may hide the focused control before the media-query subscriber runs.
    // Retain it only in that case so the layout effect can transfer focus.
    if (event.relatedTarget || event.currentTarget.getClientRects().length > 0) {
      lastFocusedControl.current = null;
    }
  };

  const toggleLeft = () => {
    const content = contents.current.left;
    if (content) content.style.setProperty("--closing-width", `${content.getBoundingClientRect().width}px`);
    setLeftCollapsed(current => !current);
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col" data-gravity-split-panels>
      <div role="group" aria-label={t("choose")} className="sticky top-[var(--site-header-height,0px)] z-10 mb-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-950/95 p-1 lg:hidden">
        {sides.map(side => (
          <button key={side} ref={element => { if (element) mobileButtons.current[side] = element; }}
            type="button" aria-label={t("show", { panel: side === "left" ? leftLabel : rightLabel })}
            aria-expanded={selected === side} aria-controls={`${id}-${side}`} data-panel-select={side}
            onFocus={() => { lastFocusedPanel.current = null; lastFocusedControl.current = "mobile"; }}
            onBlur={onControlBlur}
            onClick={() => setSelected(side)}
            className={`min-h-11 min-w-0 rounded-lg px-2 py-2 text-sm font-semibold ${buttonStyle} ${selected === side ? "border-violet-300 bg-violet-300/15 text-cyan-100" : ""}`}>
            {side === "left" ? leftLabel : rightLabel}
          </button>
        ))}
      </div>
      <div className={css.grid} data-collapsed={leftCollapsed ? "left" : "none"} data-selected={selected} data-gravity-stage-layout>
        {sides.map(side => (
          <div key={side} className={css.panel} data-side={side} data-open={visible(side)}>
            <div className={css.clip}>
              <div id={`${id}-${side}`} ref={element => { if (element) contents.current[side] = element; }}
                className={css.content} inert={!visible(side)} aria-hidden={!visible(side)}
                onFocusCapture={() => { lastFocusedPanel.current = side; lastFocusedControl.current = null; }}
                onBlurCapture={event => {
                  if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) lastFocusedPanel.current = null;
                }}>
                {side === "left" ? left : right}
              </div>
            </div>
            {side === "left" && (
              <button ref={toggleButton}
                type="button" data-panel-toggle="left" aria-controls={`${id}-left`} aria-expanded={!leftCollapsed}
                aria-label={t(leftCollapsed ? "expand" : "collapse", { panel: leftLabel })}
                title={t(leftCollapsed ? "expand" : "collapse", { panel: leftLabel })}
                onFocus={() => { lastFocusedPanel.current = null; lastFocusedControl.current = "desktop"; }}
                onBlur={onControlBlur} onClick={toggleLeft}
                className={`${css.toggle} ${buttonStyle} rounded-lg`}>
                <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d={leftCollapsed ? "m8 5 5 5-5 5" : "m12 5-5 5 5 5"} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
