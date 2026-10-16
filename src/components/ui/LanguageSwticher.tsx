"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import type { KeyboardEvent } from "react";
import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const languageNames = { es: "Español", en: "English", fr: "Français" };

export const LanguageSwitcher = () => {
  const locale = useLocale();
  const t = useTranslations("Navigation");
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

  return (
    <div
      ref={containerRef}
      className="relative shrink-0"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          setOpen(false);
          triggerRef.current?.focus();
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={`${t("language")}: ${locale.toUpperCase()}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        disabled={pending}
        onClick={() => open ? setOpen(false) : openMenu(Math.max(0, routing.locales.findIndex((item) => item === locale)))}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            openMenu(event.key === "ArrowDown" ? 0 : routing.locales.length - 1);
          }
        }}
        className={`flex h-11 cursor-pointer items-center gap-2.5 rounded-full border px-3.5 text-xs font-semibold tracking-widest shadow-sm transition-colors hover:border-sky-400/50 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none ${open ? "border-sky-400/50 bg-slate-800 text-sky-300" : "border-slate-700/80 bg-slate-900 text-slate-200"}`}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-4">
          <circle cx="12" cy="12" r="9" />
          <ellipse cx="12" cy="12" rx="4" ry="9" />
          <path d="M3 12h18" />
        </svg>
        {locale.toUpperCase()}
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className={`size-3.5 transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}>
          <path d="m6 8 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div
        id={menuId}
        role="menu"
        aria-label={t("language")}
        aria-busy={pending}
        inert={!open}
        onKeyDown={handleMenuKeyDown}
        className={`absolute right-0 top-full z-50 mt-2 w-48 max-w-[calc(100vw-2rem)] origin-top-right sm:mt-3 rounded-2xl border border-slate-700/80 bg-slate-950/95 p-1.5 shadow-xl shadow-black/30 backdrop-blur-xl transition-[opacity,transform,visibility] duration-200 ease-out motion-reduce:transition-none ${open ? "visible translate-y-0 scale-100 opacity-100" : "invisible pointer-events-none -translate-y-2 scale-95 opacity-0"}`}
      >
        {routing.locales.map((language, index) => (
          <button
            key={language}
            ref={(element) => { optionRefs.current[index] = element; }}
            type="button"
            role="menuitemradio"
            aria-checked={locale === language}
            tabIndex={-1}
            disabled={pending}
            onClick={() => {
              setOpen(false);
              triggerRef.current?.focus();
              if (language !== locale) {
                startTransition(() => router.replace(pathname, { locale: language }));
              }
            }}
            className={`flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-slate-800 focus-visible:bg-slate-800 focus-visible:outline-none motion-reduce:transition-none ${locale === language ? "bg-sky-400/10 text-sky-300" : "text-slate-300"}`}
          >
            <span className="text-[10px] font-semibold tracking-widest opacity-60">{language.toUpperCase()}</span>
            <span className="flex-1" lang={language}>{languageNames[language]}</span>
            {locale === language && (
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-4">
                <path d="m4 10 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
