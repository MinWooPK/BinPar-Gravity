"use client";

import type { KeyboardEvent, RefObject } from "react";

export type StageOption<Id extends string> = {
  id: Id;
  number: string;
  label: string;
};

type StageSelectorMenuProps<Id extends string> = {
  id: string;
  label: string;
  options: readonly StageOption<Id>[];
  value: Id;
  onSelect: (value: Id) => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  optionRefs: RefObject<(HTMLButtonElement | null)[]>;
  selectedIndicatorClassName?: string;
};

// Muestra las etapas disponibles en el menú desplegable.
export const StageSelectorMenu = <Id extends string>({
  id,
  label,
  options,
  value,
  onSelect,
  onKeyDown,
  optionRefs,
  selectedIndicatorClassName,
}: StageSelectorMenuProps<Id>) => {
  return (
    <div
      id={id}
      role="menu"
      aria-label={label}
      onKeyDown={onKeyDown}
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
          onClick={() => onSelect(option.id)}
          className={`flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-violet-300/10 focus-visible:bg-violet-300/15 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-violet-300 motion-reduce:transition-none ${
            value === option.id
              ? "bg-violet-300/10 text-violet-100"
              : "text-slate-200"
          }`}
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
  );
};
