import { TutorContextBridge } from "@/features/ai/presentation/providers/TutorProvider";
import { ExplainWithAI } from "@/features/ai/presentation/components/ExplainWithAI";
import { Link } from "@/i18n/navigation";
import { orbitDetailStyles as styles } from "./OrbitDetail.styles";
import { orbits, publishedOrbits } from "@/features/three-body/data/orbits";
import { Icon } from "@/components/icons";
import { OrbitPlayer } from "@/features/three-body/presentation/components/detail/OrbitPlayer";
import { OrbitDetailTabs } from "@/features/three-body/presentation/components/detail/OrbitDetailTabs";
import { getOrbitPlayback } from "@/features/three-body/infrastructure/orbitPlayback";
import { getLocale, getTranslations } from "next-intl/server";
import type { OrbitDefinition } from "../../../types/orbit.types";
export const OrbitDetail = async ({ orbit }: { orbit: OrbitDefinition }) => {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("ThreeBody"),
  ]);
  const index = orbits.indexOf(orbit);
  const next = orbits[(index + 1) % orbits.length]!;
  const original = publishedOrbits.find((o) => o.slug === orbit.slug)!;
  const categoryLabels = {
    Clásica: "categoryClassical",
    Coreografía: "categoryChoreography",
    Periódica: "categoryPeriodic",
  } as const;
  const coordinates = ["x", "y", "vₓ", "vᵧ"] as const;
  return (
    <section lang={locale} className={`${styles.page} page-enter detail-page`}>
      <TutorContextBridge
        context={{ kind: "three-body", stage: "orbit", slug: orbit.slug }}
      />
      <h1 className="sr-only">{orbit.name}</h1>
      <nav
        className={styles.pageNavigation}
        aria-label={t("detail.navigationLabel")}
      >
        <Link
          href="/three-body#gallery"
          scroll={false}
          className={`${styles.backLink} back-link`}
        >
          <Icon name="arrow" />
          {t("backToSolutions")}
        </Link>
        <div className={`${styles.nextOrbit} next-orbit`}>
          <span>{t("detail.nextOrbit")}</span>
          <Link href={`/three-body/${next.slug}`}>
            {next.name} <Icon name="arrow" />
          </Link>
        </div>
      </nav>
      <div className={styles.layout} data-orbit-detail-layout>
        <OrbitPlayer
          key={orbit.slug}
          data={getOrbitPlayback(orbit.slug)}
          name={orbit.name}
        >
          <section
            className={styles.model}
            aria-labelledby="orbit-physical-model-title"
            data-orbit-detail-model
          ></section>
        </OrbitPlayer>
        <article
          className={styles.information}
          aria-labelledby="orbit-solution-title"
          data-orbit-detail-information
        >
          <header className={styles.solutionHeader}>
            <div className={styles.topline}>
              <span>
                {t("detail.orbitIndex", {
                  number: String(index + 1).padStart(2, "0"),
                  total: String(orbits.length).padStart(2, "0"),
                })}
              </span>
              <span className={styles.category}>
                {t(categoryLabels[orbit.category])}
              </span>
              <span>{orbit.year}</span>
            </div>
            <div className={styles.titleRow}>
              <h2 id="orbit-solution-title" className={styles.title}>
                {orbit.name}{" "}
                <ExplainWithAI
                  topic="orbit"
                  question={t("detail.explainQuestion", { name: orbit.name })}
                />
              </h2>
              <dl className={`${styles.period} period-stat`}>
                <dt>{t("detail.period")}</dt>
                <dd>
                  <data value={orbit.period} title={String(orbit.period)}>
                    {orbit.period.toFixed(4)}
                  </data>{" "}
                  <abbr title={t("detail.periodUnitLabel")}>
                    {t("detail.periodUnit")}
                  </abbr>
                </dd>
              </dl>
            </div>
            <p className={styles.description} lang="es">
              {orbit.description}
            </p>
          </header>
          <OrbitDetailTabs
            explanation={
              <>
                <h3>{t("detail.explanationTitle")}</h3>
                <p lang="es">{orbit.insight}</p>
                <p className={styles.helper}>{t("detail.idealBodies")}</p>
              </>
            }
            conditions={
              <div className="conditions" data-orbit-detail-conditions>
                <h3>{t("detail.conditionsTitle")}</h3>
                <p>{t("detail.conditionsDescription")}</p>
                <div
                  className={styles.tableScroll}
                  role="region"
                  aria-label={t("detail.tableCaption")}
                  tabIndex={0}
                >
                  <table>
                    <caption className="sr-only">
                      {t("detail.tableCaption")}
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">{t("detail.body")}</th>
                        {coordinates.map((coordinate) => (
                          <th key={coordinate} scope="col">
                            {coordinate}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orbit.initial.map((body, bodyIndex) => (
                        <tr key={bodyIndex}>
                          <th scope="row">{bodyIndex + 1}</th>
                          {body.map((value, coordinateIndex) => (
                            <td key={coordinateIndex}>
                              <data value={value}>{value.toFixed(8)}</data>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {index >= 2 && (
                  <p className={styles.refinement}>
                    {t("detail.refinedConditions", {
                      publishedPeriod: original.period.toFixed(8),
                    })}
                  </p>
                )}
              </div>
            }
          />
          <h3 id="orbit-physical-model-title">{t("detail.physicalModel")}</h3>
          <ul className={styles.badges}>
            {(["equalMasses", "constant", "normalizedUnits"] as const).map(
              (concept) => (
                <li key={concept}>
                  <strong>{t(`galleryScience.${concept}`)}</strong>
                </li>
              ),
            )}
          </ul>
          {/* <p>{t("detail.dimensionlessNote")}</p> */}
          <section
            className={styles.source}
            aria-labelledby="orbit-source-title"
            data-orbit-detail-source
          >
            <h3 id="orbit-source-title">{t("detail.sourceTitle")}</h3>
            <p lang="es">{orbit.sourceLabel}</p>
            <a
              href={orbit.source}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.sourceLink} source-link`}
            >
              {t("detail.sourceLink")} <Icon name="external" />
              <span className="sr-only">{t("detail.sourceNewTab")}</span>
            </a>
          </section>
        </article>
      </div>
    </section>
  );
};
