"use client";

import { useTranslations } from "next-intl";

import { NavLink } from "@/components/ui/NavLink";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { MobileMenu } from "./MobileHeader";

// Secciones compartidas por los menús de escritorio y móvil.
const sections = [
  { href: "/gravity", title: "gravity" },
  { href: "/three-body", title: "threeBody" },
] as const;

export const Header = () => {
  const t = useTranslations("Navigation");

  return (
    <header className="relative z-50 shrink-0 bg-transparent text-white">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:gap-6 lg:px-8">
        {/* Logo */}
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

        {/* Navegación de escritorio */}
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

        {/* Idiomas y navegación móvil */}
        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher />
          <MobileMenu sections={sections} />
        </div>
      </nav>
    </header>
  );
};
