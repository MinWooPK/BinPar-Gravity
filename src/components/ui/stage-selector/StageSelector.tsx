"use client";

import { ChevronDown } from "@/components/icons";

import { StageSelectorMenu } from "./StageSelectorMenu";
import { useStageSelectorMenu } from "./useStageSelectorMenu";

import type { StageOption } from "./StageSelectorMenu";

type StageSelectorProps<Id extends string> = {
  id: string;
  label: string;
  options: readonly StageOption<Id>[];
  value: Id;
  onChange: (value: Id) => void;
  selectedIndicatorClassName?: string;
};

// Muestra la etapa actual y permite seleccionar otra.
export const StageSelector = <Id extends string>({
  id,
  label,
  options,
  value,
  onChange,
  selectedIndicatorClassName,
}: StageSelectorProps<Id>) => {
  const activeIndex = options.findIndex((option) => option.id === value);

  const active = options[activeIndex];

  const {
    menuId,
    open,
    containerRef,
    triggerRef,
    optionRefs,
    closeMenu,
    handleMenuKeyDown,
    handleTriggerClick,
    handleTriggerKeyDown,
    handleContainerKeyDown,
  } = useStageSelectorMenu(options.length, activeIndex);

  return (
    <div
      ref={containerRef}
      className="relative min-w-0"
      onKeyDown={handleContainerKeyDown}
    >
      {/* Botón que muestra la etapa seleccionada. */}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-label={`${label}: ${active.number} — ${active.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        className={`flex min-h-11 w-full min-w-0 cursor-pointer items-center gap-3 rounded-lg border bg-[#1b2032] px-3 py-2 text-left text-sm text-violet-100 transition-colors hover:border-violet-300/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 motion-reduce:transition-none ${
          open ? "border-violet-300" : "border-violet-300/30"
        }`}
      >
        <span className="shrink-0 font-mono text-violet-300">
          {active.number}
        </span>

        <span className="min-w-0 flex-1 break-words">{active.label}</span>

        <ChevronDown
          className={`size-4 shrink-0 transition-transform motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Opciones disponibles cuando el menú está abierto. */}
      {open && (
        <StageSelectorMenu
          id={menuId}
          label={label}
          options={options}
          value={value}
          optionRefs={optionRefs}
          onKeyDown={handleMenuKeyDown}
          selectedIndicatorClassName={selectedIndicatorClassName}
          onSelect={(selectedId) => {
            closeMenu();
            onChange(selectedId);
          }}
        />
      )}
    </div>
  );
};
