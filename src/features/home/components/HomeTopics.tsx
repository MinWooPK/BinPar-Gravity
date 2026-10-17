import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export const HomeTopics = () => {
  const t = useTranslations("Home");

  return (
    <div className="flex w-full min-w-0 flex-col">
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
        {t("exploreDescription")}
      </p>
      <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2 lg:mt-6 lg:gap-6">
        {(
          [
            { key: "gravity", href: "/gravity", number: "01" },
            { key: "threeBody", href: "/three-body", number: "02" },
          ] as const
        ).map(({ key, href, number }) => (
          <Link
            key={key}
            href={href}
            className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-700 bg-[#111827]/90 p-4 shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-sky-400 hover:shadow-xl hover:shadow-black/25 motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 sm:p-5 lg:p-6"
          >
            <div
              aria-hidden="true"
              className={`relative -mx-4 -mt-4 mb-4 flex h-24 items-center justify-center overflow-hidden border-b sm:-mx-5 sm:-mt-5 sm:h-28 lg:-mx-6 lg:-mt-6 lg:h-32 ${key === "gravity" ? "border-blue-900 bg-[#0b1629]" : "border-teal-900 bg-[#0a1b1b]"}`}
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
            <span className="text-xs leading-relaxed font-semibold tracking-wider text-sky-200 sm:text-sm">
              {number} /{" "}
              {t(key === "gravity" ? "learningLabel" : "galleryLabel")}
            </span>
            <h2 className="mt-2 text-xl leading-snug font-bold break-words text-white lg:text-2xl">
              {t(`${key}Title`)}
            </h2>
            <p className="mt-2 flex-1 text-base leading-relaxed text-slate-300 lg:text-lg">
              {t(`${key}Description`)}
            </p>
            <span className="mt-4 flex min-h-11 items-center justify-between gap-3 border-t border-slate-700 pt-4 text-base font-semibold text-cyan-200">
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
    </div>
  );
};
