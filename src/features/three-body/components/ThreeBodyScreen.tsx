import { useTranslations } from "next-intl";

export const ThreeBodyScreen = () => {
  const t = useTranslations("ThreeBody");

  return (
    <section className="page-enter mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <h1 className="max-w-4xl text-4xl leading-tight font-bold tracking-tight break-words text-balance sm:text-5xl lg:text-6xl">{t("title")}</h1>

      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">{t("description")}</p>
    </section>
  );
};

