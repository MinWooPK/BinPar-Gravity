import { useTranslations } from "next-intl";

import { NavLink } from "@/components/ui/NavLink";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { AutoHideHeader } from "./AutoHideHeader";

export const Header = () => {
  const t = useTranslations("Navigation");

  return (
    <AutoHideHeader>
    <header className="border-b border-slate-800 bg-slate-950 text-white">
      <nav className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-3 px-4 py-3 sm:px-6 sm:py-4 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:gap-x-6 lg:px-8">
        <NavLink href="/" className="min-w-0 w-fit rounded-xl px-2 sm:px-3 py-2 text-lg font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:text-2xl">
          Gravity Lab
        </NavLink>

        <div className="col-span-2 row-start-2 grid min-w-0 grid-cols-2 gap-2 border-t border-white/15 pt-3 lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:flex lg:gap-2 lg:border-0 lg:pt-0">
          <NavLink href="/gravity" className="flex min-h-11 items-center justify-center rounded-xl px-2 py-2 text-center leading-snug text-sm sm:text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:px-4">{t("gravity")}</NavLink>

          <NavLink href="/three-body" className="flex min-h-11 items-center justify-center rounded-xl px-2 py-2 text-center leading-snug text-sm sm:text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:px-4">{t("threeBody")}</NavLink>

        </div>

        <div className="col-start-2 row-start-1 justify-self-end lg:col-start-3">
          <LanguageSwitcher />
        </div>
      </nav>
    </header>
    </AutoHideHeader>
  );
};
