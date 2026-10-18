import { useTranslations } from "next-intl";

import { NavLink } from "@/components/ui/NavLink";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Icon } from "@/components/icons/index";
import { AutoHideHeader } from "./AutoHideHeader";

const sections = [
  {
    href: "/gravity",
    title: "gravity",
    icon: "atom",
  },
  {
    href: "/three-body",
    title: "threeBody",
    icon: "orbit",
  },
] as const;

export const Header = () => {
  const t = useTranslations("Navigation");

  return (
    <AutoHideHeader>
      <header className="bg-transparent text-white">
        <nav className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-2 px-4 py-2 sm:px-6 sm:py-2.5 lg:grid-cols-[minmax(max-content,1fr)_minmax(0,auto)_minmax(max-content,1fr)] lg:gap-x-4 lg:px-8">
          <NavLink
            href="/"
            className="flex min-h-11 min-w-0 w-fit items-center rounded-xl px-2 sm:px-3 py-1 text-base font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:text-xl"
          >
            Gravity Lab
          </NavLink>

          <div className="col-span-2 row-start-2 grid min-w-0 grid-cols-2 gap-2 border-t border-white/15 pt-2 lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:flex lg:w-full lg:justify-self-center lg:gap-2 lg:border-0 lg:pt-0">
            {sections.map((section) => (
              <NavLink
                key={section.href}
                href={section.href}
                className="flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 py-1 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:gap-2 sm:px-3 sm:py-1.5"
              >
                <Icon
                  name={section.icon}
                  strokeWidth={2}
                  className="size-4 shrink-0 sm:size-[18px]"
                />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-xs leading-tight font-semibold sm:text-sm">
                    {t(section.title)}
                  </span>
                </span>
              </NavLink>
            ))}
          </div>

          <div className="col-start-2 row-start-1 justify-self-end lg:col-start-3">
            <LanguageSwitcher />
          </div>
        </nav>
      </header>
    </AutoHideHeader>
  );
};
