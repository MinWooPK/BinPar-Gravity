import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/ui/LanguageSwticher";

export const Header = () => {
  const t = useTranslations("Navigation");

  return (
    <header className="border-b border-slate-800 bg-slate-950 text-white">
      <nav className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 px-4 py-3 sm:px-6 sm:py-4 md:grid-cols-[minmax(0,1fr)_auto_auto] md:gap-x-6 lg:px-8">
        <Link href="/" className="w-fit rounded-sm py-2 text-lg font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:text-xl">
          Gravity Lab
        </Link>

        <div className="col-span-2 row-start-2 grid min-w-0 grid-cols-2 gap-2 border-t border-slate-800 pt-3 md:col-span-1 md:col-start-2 md:row-start-1 md:flex md:gap-2 md:border-0 md:pt-0">
          <Link href="/gravity" className="flex min-h-11 items-center justify-center rounded-xl px-3 py-2 text-center text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:px-4">{t("gravity")}</Link>

          <Link href="/three-body" className="flex min-h-11 items-center justify-center rounded-xl px-3 py-2 text-center text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:px-4">{t("threeBody")}</Link>

        </div>

        <div className="col-start-2 row-start-1 justify-self-end md:col-start-3">
          <LanguageSwitcher />
        </div>
      </nav>
    </header>
  );
};
