"use client";

import { Globe, ChevronDown, Check } from "@/components/icons";

import { useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { useLanguageSwitcher } from "@/i18n/hooks/useLanguageSwitcher";

const languageNames = { es: "Español", en: "English", fr: "Français" };

export const LanguageSwitcher = () => {
  const t = useTranslations("Navigation");
  const {
    locale,
    open,
    pending,
    menuId,
    containerRef,
    triggerRef,
    optionRefs,
    toggleMenu,
    handleBlur,
    handleEscape,
    handleTriggerKeyDown,
    handleMenuKeyDown,
    selectLanguage,
  } = useLanguageSwitcher();

  return (
    <div
      ref={containerRef}
      className="relative shrink-0"
      onBlur={handleBlur}
      onKeyDown={handleEscape}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={`${t("language")}: ${locale.toUpperCase()}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        disabled={pending}
        onClick={toggleMenu}
        onKeyDown={handleTriggerKeyDown}
        className={`flex h-11 cursor-pointer items-center gap-2 rounded-full border px-3 text-sm font-semibold tracking-wide shadow-sm transition-colors hover:border-sky-400/50 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none ${open ? "border-sky-400 bg-slate-900 text-sky-200" : "border-slate-600 bg-slate-900 text-slate-100"}`}
      >
        <Globe className="size-4" />
        {locale.toUpperCase()}
        <ChevronDown
          className={`size-3.5 transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          compact
        />
      </button>

      <div
        id={menuId}
        role="menu"
        aria-label={t("language")}
        aria-busy={pending}
        inert={!open}
        onKeyDown={handleMenuKeyDown}
        className={`absolute right-0 top-full z-50 mt-2 w-56 max-w-[calc(100vw-2rem)] origin-top-right sm:mt-3 rounded-2xl border border-slate-600 bg-slate-900 p-1.5 shadow-xl shadow-black/30 backdrop-blur-xl transition-[opacity,transform,visibility] duration-200 ease-out motion-reduce:transition-none ${open ? "visible translate-y-0 scale-100 opacity-100" : "invisible pointer-events-none -translate-y-2 scale-95 opacity-0"}`}
      >
        {routing.locales.map((language, index) => (
          <button
            key={language}
            ref={(element) => {
              optionRefs.current[index] = element;
            }}
            type="button"
            role="menuitemradio"
            aria-checked={locale === language}
            tabIndex={-1}
            disabled={pending}
            onClick={() => selectLanguage(language)}
            className={`flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-base transition-colors hover:bg-slate-800 focus-visible:bg-slate-800 focus-visible:outline-none motion-reduce:transition-none ${locale === language ? "bg-sky-400/15 text-sky-200" : "text-slate-200"}`}
          >
            <span className="text-xs font-semibold tracking-wide text-slate-200">
              {language.toUpperCase()}
            </span>
            <span className="flex-1" lang={language}>
              {languageNames[language]}
            </span>
            {locale === language && <Check className="size-4" />}
          </button>
        ))}
      </div>
    </div>
  );
};
