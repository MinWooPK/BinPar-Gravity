"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import type { FocusEvent, KeyboardEvent } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export const useLanguageSwitcher = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);

  const openMenu = (index: number) => {
    setOpen(true);
    requestAnimationFrame(() => optionRefs.current[index]?.focus());
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = optionRefs.current.findIndex((item) => item === document.activeElement);
    let nextIndex = index;
    if (event.key === "ArrowDown") nextIndex = (index + 1) % routing.locales.length;
    else if (event.key === "ArrowUp") nextIndex = (index - 1 + routing.locales.length) % routing.locales.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = routing.locales.length - 1;
    else return;
    event.preventDefault();
    optionRefs.current[nextIndex]?.focus();
  };


  const toggleMenu = () => {
    if (open) setOpen(false);
    else openMenu(Math.max(0, routing.locales.findIndex((item) => item === locale)));
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  };

  const handleEscape = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(event.key === "ArrowDown" ? 0 : routing.locales.length - 1);
    }
  };

  const selectLanguage = (language: (typeof routing.locales)[number]) => {
    setOpen(false);
    triggerRef.current?.focus();
    if (language !== locale) {
      startTransition(() => router.replace(pathname, { locale: language }));
    }
  };

  return {
    locale, open, pending, menuId, containerRef, triggerRef, optionRefs,
    toggleMenu, handleBlur, handleEscape, handleTriggerKeyDown,
    handleMenuKeyDown, selectLanguage,
  };
};
