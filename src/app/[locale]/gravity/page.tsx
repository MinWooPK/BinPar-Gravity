import { useTranslations } from "next-intl";

const GravityPage = () => {
  const t = useTranslations("Gravity");

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <h1 className="max-w-4xl text-3xl leading-tight font-bold tracking-tight break-words text-balance sm:text-4xl lg:text-5xl">{t("title")}</h1>

      <p className="mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">{t("description")}</p>
    </section>
  );
};

export default GravityPage;
