import { useTranslations } from "next-intl";
// import { Link } from "@/i18n/navigation";
import { HomeExperience, HomeExploreButton } from "./HomeExperience";
import { HomeTopics } from "./HomeTopics";

export const HomeScreen = () => {
  const t = useTranslations("Home");
  return (
    <HomeExperience
      introduction={
        <section aria-labelledby="home-title" className="w-full min-w-0">
          <p className="mb-5 text-xs leading-relaxed font-bold tracking-wider sm:text-sm text-cyan-200 uppercase">
            {t("eyebrow")}
          </p>
          <h1
            id="home-title"
            className="max-w-4xl text-[clamp(2rem,5.5vw,3.75rem)] leading-[1.15] break-words font-bold tracking-tight text-balance text-white"
          >
            {t("title")}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-xl">
            {t("description")}
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap">
            {/* <Link
              href="/gravity"
              className="inline-flex min-h-8 items-center justify-center gap-3 rounded-xl bg-[#F8BA00] px-4 py-3 text-center text-base sm:px-5 lg:text-lg font-semibold text-white shadow-blue-700/20 transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-lg active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
            >
              {t("button")}
            </Link> */}
            <HomeExploreButton className="inline-flex cursor-pointer min-h-8 items-center justify-center rounded-xl border border-slate-500 bg-[#111827] text-slate-100 px-4 py-3 text-center text-base sm:px-5 lg:text-lg font-semibold transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-slate-700 active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500" />
          </div>
          <p className="mt-5 text-base text-slate-400">{t("welcomeNote")}</p>
        </section>
      }
      topics={<HomeTopics />}
    />
  );
};
