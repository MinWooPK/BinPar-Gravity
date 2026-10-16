import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const HomePage = () => {
  const t = useTranslations("Home");

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
      <h1 className="text-3xl leading-tight font-bold tracking-tight break-words text-balance sm:text-4xl lg:text-5xl xl:text-6xl">{t("title")}</h1>

      <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-500 sm:mt-6 sm:text-lg dark:text-slate-400 lg:text-xl">{t("description")}</p>

      <Link
        href="/gravity"
        className="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-center font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 sm:w-auto"
      >
        {t("button")}
      </Link>
    </section>
  );
};

export default HomePage;
