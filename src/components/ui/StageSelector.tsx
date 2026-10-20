"use client";

import { ChevronDown } from "@/components/icons";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

type StageOption<Id extends string> = { id: Id; number: string; label: string };

type StageSelectorProps<Id extends string> = {
  id: string;
  label: string;
  options: readonly StageOption<Id>[];
  value: Id;
  onChange: (value: Id) => void;
  selectedIndicatorClassName?: string;
};

/** The same keyboard/menu pattern as Gravity, with feature-independent labels. */
export const StageSelector = <Id extends string>({
  id,
  label,
  options,
  value,
  onChange,
  selectedIndicatorClassName,
}: StageSelectorProps<Id>) => {
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const openingIndex = useRef(0);
  const activeIndex = options.findIndex((option) => option.id === value);
  const active = options[activeIndex];

  const closeMenu = () => {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  useLayoutEffect(() => {
    if (!open) return;
    const option = optionRefs.current[openingIndex.current];
    option?.focus({ preventScroll: true });
    option?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "instant",
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: Event) => {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      )
        setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("focusin", closeOutside);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("focusin", closeOutside);
    };
  }, [open]);

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = optionRefs.current.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    let next: number;
    switch (event.key) {
      case "ArrowDown":
        next = (current + 1) % options.length;
        break;
      case "ArrowUp":
        next = (current - 1 + options.length) % options.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = options.length - 1;
        break;
      case "Tab":
        closeMenu();
        return;
      default:
        return;
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
        id={id}
        type="button"
        aria-label={`${label}: ${active.number} — ${active.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          openingIndex.current = activeIndex;
          setOpen(!open);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            openingIndex.current =
              event.key === "ArrowDown" ? 0 : options.length - 1;
            setOpen(true);
          }
        }}
        className={`flex min-h-11 w-full min-w-0 cursor-pointer items-center gap-3 rounded-lg border bg-[#1b2032] px-3 py-2 text-left text-sm text-violet-100 transition-colors hover:border-violet-300/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 motion-reduce:transition-none ${open ? "border-violet-300" : "border-violet-300/30"}`}
      >
        <span className="shrink-0 font-mono text-violet-300">
          {active.number}
        </span>
        <span className="min-w-0 flex-1 break-words">{active.label}</span>
        <ChevronDown
          className={`size-4 shrink-0 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 top-full z-50 mt-2 max-h-[min(16rem,35dvh)] w-full overflow-y-auto overscroll-contain rounded-xl border border-violet-300/30 bg-[#111624] p-1.5 shadow-xl shadow-black/40"
        >
          {options.map((option, index) => (
            <button
              key={option.id}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              type="button"
              role="menuitemradio"
              aria-checked={value === option.id}
              tabIndex={-1}
              onClick={() => {
                closeMenu();
                onChange(option.id);
              }}
              className={`flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-violet-300/10 focus-visible:bg-violet-300/15 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-violet-300 motion-reduce:transition-none ${value === option.id ? "bg-violet-300/10 text-violet-100" : "text-slate-200"}`}
            >
              <span className="shrink-0 font-mono text-violet-300">
                {option.number}
              </span>
              <span className="min-w-0 flex-1 break-words">{option.label}</span>
              {value === option.id && (
                <span aria-hidden="true" className={selectedIndicatorClassName}>
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
