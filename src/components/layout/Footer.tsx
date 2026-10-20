import { useTranslations } from "next-intl";

export const Footer = () => {
  const t = useTranslations("Footer");

  return (
    <footer className="relative z-10 bg-transparent px-4 py-5 text-center text-base leading-relaxed text-slate-300 sm:px-6">
      <p className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
        <span>© 2026 BinPar</span>
        <span aria-hidden="true">·</span>
        <span>Gravity Lab</span>
        <span aria-hidden="true">·</span>
        <span>{t("tagline")}</span>
      </p>
    </footer>
  );
};
