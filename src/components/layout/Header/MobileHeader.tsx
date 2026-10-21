"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { X, Menu } from "@/components/icons";
import { Link, usePathname } from "@/i18n/navigation";

type MobileMenuProps = {
  sections: ReadonlyArray<{
    href: "/gravity" | "/three-body";
    title: "gravity" | "threeBody";
  }>;
};

const menuLabels = {
  es: { open: "Abrir menú", close: "Cerrar menú" },
  en: { open: "Open menu", close: "Close menu" },
  fr: { open: "Ouvrir le menu", close: "Fermer le menu" },
};

export const MobileMenu = ({ sections }: MobileMenuProps) => {
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const labels = menuLabels[locale as keyof typeof menuLabels] ?? menuLabels.es;

  // Cierra el menú al pulsar fuera o presionar Escape.
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
    <div ref={menuRef} className="relative lg:hidden">
      {/* Botón hamburguesa */}
      <button
        ref={menuButtonRef}
        type="button"
        aria-label={menuOpen ? labels.close : labels.open}
        aria-expanded={menuOpen}
        aria-controls={menuId}
        onClick={() => setMenuOpen((open) => !open)}
        className="flex size-11 cursor-pointer items-center justify-center rounded-xl border border-slate-600 bg-slate-900 text-slate-100 transition-colors hover:border-slate-400 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
      >
        {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {/* Menú desplegable */}
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
                aria-current={pathname === section.href ? "page" : undefined}
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
  );
};
