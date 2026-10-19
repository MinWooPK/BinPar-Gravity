"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { NavLink } from "@/components/ui/NavLink";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

const sections = [
  {
    href: "/gravity",
    title: "gravity",
  },
  {
    href: "/three-body",
    title: "threeBody",
  },
] as const;

const menuLabels = {
  es: { open: "Abrir menú", close: "Cerrar menú" },
  en: { open: "Open menu", close: "Close menu" },
  fr: { open: "Ouvrir le menu", close: "Fermer le menu" },
};

export const Header = () => {
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const labels = menuLabels[locale as keyof typeof menuLabels] ?? menuLabels.es;

  // Cerrar el menú al pulsar fuera o presionar Escape.
  useEffect(() => {
    if (!menuOpen) return;

    const handleOutsideClick = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  return (
    <header className="relative z-50 shrink-0 bg-transparent text-white">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:gap-6 lg:px-8">
        {/* LOGO */}
        <NavLink
          href="/"
          className="flex min-h-11 shrink-0 flex-col items-start justify-center px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <span className="text-xl leading-5 font-bold tracking-tight">
            <span className="text-white">BIN</span>
            <span className="text-[#F8BA00]">PAR</span>
          </span>

          <span className="mt-0.5 text-[10px] leading-3 font-medium tracking-[0.18em] text-slate-400">
            GRAVITY LAB
          </span>
        </NavLink>

        {/* NAVEGACIÓN ESCRITORIO */}
        <div className="hidden min-w-0 items-center justify-center gap-4 lg:flex">
          {sections.map((section) => (
            <NavLink
              key={section.href}
              href={section.href}
              className="flex min-h-11 items-center justify-center px-3 py-1.5 text-center text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              {t(section.title)}
            </NavLink>
          ))}
        </div>

        {/* IDIOMA + MENÚ MÓVIL */}
        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher />

          <div ref={menuRef} className="relative lg:hidden">
            {/* BOTÓN HAMBURGUESA */}
            <button
              ref={menuButtonRef}
              type="button"
              aria-label={menuOpen ? labels.close : labels.open}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen((open) => !open)}
              className="flex size-11 cursor-pointer items-center justify-center rounded-xl border border-slate-600 bg-slate-900 text-slate-100 transition-colors hover:border-slate-400 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              {menuOpen ? (
                // Icono cerrar
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="size-5"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              ) : (
                // Icono menú
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="size-5"
                >
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>

            {/* MENÚ DESPLEGABLE */}
            {menuOpen && (
              <div
                id={menuId}
                className="absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-700 bg-[#0b101e] p-2 shadow-xl shadow-black/40"
              >
                {sections.map((section) => {
                  const isActive =
                    pathname === section.href ||
                    pathname.startsWith(`${section.href}/`);

                  return (
                    <Link
                      key={section.href}
                      href={section.href}
                      aria-current={
                        pathname === section.href ? "page" : undefined
                      }
                      onClick={() => setMenuOpen(false)}
                      className={`flex min-h-11 items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                        isActive
                          ? "text-[#F8BA00]"
                          : "text-slate-200 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {t(section.title)}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};
