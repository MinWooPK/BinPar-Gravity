import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { homeExperienceStyles as styles } from "./HomeExperience.styles";
import { getOrbitPlayback } from "@/features/three-body/infrastructure/orbitPlayback";
import { HomeOrbitPreview } from "./HomeOrbitPreview";
import { HomeGravityPreview } from "./HomeGravityPreview";

export const HomeTopics = () => {
  const t = useTranslations("Home");
  const figureEight = getOrbitPlayback("figura-de-ocho");

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
            className={`${styles.topicCard} flex min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-700 bg-[#111827]/90 p-4 shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-sky-400 hover:shadow-xl hover:shadow-black/25 motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 sm:p-5 lg:p-6`}
          >
            <div
              aria-hidden="true"
              className={`relative -mx-4 -mt-4 mb-4 flex h-24 items-center justify-center overflow-hidden border-b sm:-mx-5 sm:-mt-5 sm:h-28 lg:-mx-6 lg:-mt-6 lg:h-32 ${styles.orbitArtwork}`}
            >
              {key === "gravity" ? (
                <HomeGravityPreview />
              ) : (
                <HomeOrbitPreview data={figureEight} />
              )}
            </div>
            <span className="text-xs leading-relaxed font-semibold tracking-wider text-sky-200">
              {number} /{" "}
              {t(key === "gravity" ? "learningLabel" : "galleryLabel")}
            </span>
            <h2 className="mt-2 text-lg leading-snug font-bold break-words text-white lg:text-xl">
              {t(`${key}Title`)}
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-300 lg:text-base">
              {t(`${key}Description`)}
            </p>
            <span className="mt-4 flex min-h-11 items-center justify-between gap-3 border-t border-slate-700 pt-4 text-sm font-semibold text-cyan-200">
              {t("openSection")}
              <span aria-hidden="true" className={styles.topicArrow}>
                →
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
