import { useTranslations } from "next-intl";

export const Footer = () => {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-4 py-5 text-center text-base leading-relaxed sm:px-6 text-slate-300">
      <p className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
        <span>© 2026 Gravity Lab</span>
        <span aria-hidden="true">·</span>
        <span>{t("tagline")}</span>
      </p>
    </footer>
  );
};
