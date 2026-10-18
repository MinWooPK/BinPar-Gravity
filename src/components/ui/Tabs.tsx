"use client";

import { useRef, useState, type ComponentPropsWithRef, type KeyboardEvent } from "react";

/** Shared roving focus and automatic activation, without navigation or scrolling. */
export const useTabs = <Tab extends string>(tabs: readonly Tab[], initial: Tab) => {
  const [selected, setSelected] = useState<Tab>(initial);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    switch (event.key) {
      case "ArrowRight": next = (index + 1) % tabs.length; break;
      case "ArrowLeft": next = (index + tabs.length - 1) % tabs.length; break;
      case "Home": next = 0; break;
      case "End": next = tabs.length - 1; break;
      default: return;
    }
    event.preventDefault();
    setSelected(tabs[next]);
    tabRefs.current[next]?.focus({ preventScroll: true });
  };
  return { selected, setSelected, tabRefs, handleTabKeyDown };
};

type TabButtonProps = Omit<ComponentPropsWithRef<"button">, "role" | "aria-selected" | "tabIndex" | "type"> & {
  selected: boolean;
};

export const TabButton = ({ selected, className = "", ...props }: TabButtonProps) => (
  <button {...props} type="button" role="tab" aria-selected={selected} tabIndex={selected ? 0 : -1} className={`min-h-[44px] cursor-pointer ${className}`} />
);
