import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export const HomeScreen = () => {
  const t = useTranslations("Home");

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="page-enter flex min-h-svh items-center border-b border-slate-700 py-10 sm:py-14 lg:py-16">
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
            <Link
              href="/gravity"
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-blue-700 px-4 py-3 text-center text-base sm:px-5 lg:text-lg font-semibold text-white shadow-md shadow-blue-700/20 transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-lg active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
            >
              {t("button")} <span aria-hidden="true">↗</span>
            </Link>
            <a
              href="#explore"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-500 bg-[#111827] text-slate-100 px-4 py-3 text-center text-base sm:px-5 lg:text-lg font-semibold transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-slate-700 active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
            >
              {t("explore")}
            </a>
          </div>
          <p className="mt-5 text-base text-slate-400">{t("welcomeNote")}</p>
        </section>
      </div>

      <section
        id="explore"
        aria-labelledby="explore-title"
        className="page-enter-delayed flex min-h-svh scroll-mt-48 lg:scroll-mt-28 flex-col justify-center py-10 sm:py-14 lg:py-16"
      >
        <p className="text-xs leading-relaxed font-bold tracking-wider sm:text-sm text-cyan-200 uppercase">
          {t("exploreEyebrow")}
        </p>
        <h2
          id="explore-title"
          className="mt-3 text-2xl leading-tight text-white font-bold tracking-tight break-words sm:text-3xl lg:text-4xl"
        >
          {t("exploreTitle")}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed sm:text-lg text-slate-300">
          {t("exploreDescription")}
        </p>
        <div className="mt-6 grid min-w-0 gap-4 md:grid-cols-2 lg:mt-8 lg:gap-6">
          {(
            [
              { key: "gravity", href: "/gravity", number: "01" },
              { key: "threeBody", href: "/three-body", number: "02" },
            ] as const
          ).map(({ key, href, number }) => (
            <Link
              key={key}
              href={href}
              className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-700 bg-[#111827] p-5 shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-sky-400 hover:shadow-xl hover:shadow-black/25 motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 sm:p-6 lg:p-8"
            >
              <div
                aria-hidden="true"
                className={`relative -mx-5 -mt-5 mb-5 flex h-32 items-center justify-center overflow-hidden border-b sm:-mx-6 sm:-mt-6 sm:h-40 lg:-mx-8 lg:-mt-8 lg:h-48 ${key === "gravity" ? "border-blue-900 bg-[#0b1629]" : "border-teal-900 bg-[#0a1b1b]"}`}
              >
                <svg
                  viewBox="0 0 360 160"
                  fill="none"
                  className="h-full w-full max-w-md"
                >
                  {key === "gravity" ? (
                    <>
                      <ellipse
                        cx="180"
                        cy="80"
                        rx="115"
                        ry="48"
                        stroke="#759ac7"
                        strokeDasharray="5 6"
                      />
                      <path
                        d="M120 80h120"
                        stroke="#8db6e8"
                        strokeWidth="2"
                        strokeDasharray="4 6"
                      />
                      <circle cx="105" cy="80" r="30" fill="#4c91e5" />
                      <circle cx="96" cy="70" r="9" fill="#a0cdff" />
                      <circle cx="255" cy="80" r="19" fill="#e9a544" />
                      <circle cx="249" cy="74" r="6" fill="#f4be69" />
                    </>
                  ) : (
                    <>
                      <path
                        d="M65 80C65 0 295 160 295 80S65 160 65 80Z"
                        stroke="#53c7b4"
                        strokeWidth="2"
                      />
                      <ellipse
                        cx="180"
                        cy="80"
                        rx="92"
                        ry="48"
                        stroke="#78b9ad"
                        strokeDasharray="5 6"
                      />
                      <circle cx="81" cy="57" r="15" fill="#35b8a5" />
                      <circle cx="180" cy="80" r="15" fill="#4c91e5" />
                      <circle cx="279" cy="103" r="15" fill="#e9a544" />
                    </>
                  )}
                </svg>
              </div>
              <span className="text-xs leading-relaxed font-semibold tracking-wider sm:text-sm text-sky-200">
                {number} /{" "}
                {t(key === "gravity" ? "learningLabel" : "galleryLabel")}
              </span>
              <h3 className="mt-3 text-xl leading-snug text-white font-bold break-words lg:text-2xl">
                {t(`${key}Title`)}
              </h3>
              <p className="mt-3 flex-1 text-base lg:text-lg leading-relaxed text-slate-300">
                {t(`${key}Description`)}
              </p>
              <span className="mt-5 flex min-h-11 items-center justify-between gap-3 border-t border-slate-700 pt-5 text-base font-semibold text-cyan-200">
                {t("openSection")}
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                >
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
