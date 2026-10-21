import { Link } from "@/i18n/navigation";
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
    <section lang={locale} className="relative [z-index:1] [width:min(100%_-_2rem,_80rem)] min-w-0 [margin-inline:auto] [padding-block:8px_24px] text-lab-text min-[640px]:[width:min(100%_-_3rem,_80rem)] [&_svg]:shrink-0 [&_:is(a,_button,_summary,_[tabindex]):focus-visible]:[outline:3px_solid_#c7baff] [&_:is(a,_button,_summary,_[tabindex]):focus-visible]:[outline-offset:3px] [&_:is(h1,_h2,_h3,_p)]:[overflow-wrap:anywhere] page-enter detail-page">
      <h1 className="sr-only">{orbit.name}</h1>
      <nav
        className="flex items-center justify-between flex-wrap [gap:4px_20px] [margin-bottom:12px]"
        aria-label={t("detail.navigationLabel")}
      >
        <Link
          href="/three-body#gallery"
          scroll={false}
          className="[&&]:inline-flex [&&]:items-center [&&]:[gap:8px] [&&]:[min-height:44px] [&&]:[color:#d0c1ff] [&&]:[font-size:0.875rem] [&&]:[line-height:1.5] [&&]:underline [&&]:[text-underline-offset:4px] [&&]:[transition:color_160ms] [&:hover]:[color:#eee7ff] [&_svg]:[transform:rotate(180deg)] [@media_(prefers-reduced-motion:_reduce)]:[&&]:[transition:none] back-link"
        >
          <Icon name="arrow" />
          {t("backToSolutions")}
        </Link>
        <div className="flex flex-wrap items-center [gap:4px_12px] [&_a]:inline-flex [&_a]:items-center [&_a]:[gap:8px] [&_a]:[min-height:44px] [&_a]:[color:#d0c1ff] [&_a]:[font-size:0.875rem] [&_a]:[line-height:1.5] [&_a]:underline [&_a]:[text-underline-offset:4px] [&_a]:[transition:color_160ms] [&_a:hover]:[color:#eee7ff] [&_>_span]:[color:#b6bdd0] [&_>_span]:[font-size:0.8125rem] [@media_(prefers-reduced-motion:_reduce)]:[&_a]:[transition:none] next-orbit">
          <span>{t("detail.nextOrbit")}</span>
          <Link href={`/three-body/${next.slug}`}>
            {next.name} <Icon name="arrow" />
          </Link>
        </div>
      </nav>
      <div className="grid [grid-template-columns:minmax(0,_1fr)] items-stretch [gap:16px] min-w-0 min-[1100px]:[grid-template-columns:minmax(0,_1.1fr)_minmax(0,_.9fr)]" data-orbit-detail-layout>
        <OrbitPlayer
          key={orbit.slug}
          data={getOrbitPlayback(orbit.slug)}
          name={orbit.name}
        >
          <section
            className="[margin-top:10px] min-w-0 [padding-top:10px] border-t border-solid border-lab-line [&_h3]:[margin:0_0_6px] [&_h3]:[color:#e3e6f2] [&_h3]:[font-size:0.875rem] [&_h3]:font-semibold [&_h3]:[line-height:1.4] [&_p]:m-0 [&_p]:[color:#b6bdd0] [&_p]:[font-size:0.8125rem] [&_p]:[line-height:1.5]"
            aria-labelledby="orbit-physical-model-title"
            data-orbit-detail-model
          ></section>
        </OrbitPlayer>
        <article
          className="flex flex-col [gap:12px] min-w-0 [padding:16px] border border-solid border-lab-line [border-radius:14px] [background:linear-gradient(145deg,_#131724,_#0e121d)] [@media(max-width:374px)]:[padding:12px]"
          aria-labelledby="orbit-solution-title"
          data-orbit-detail-information
        >
          <header className="min-w-0">
            <div className="flex flex-wrap items-center [gap:6px_12px] [color:#b6bdd0] [font-size:.75rem] [@media(max-width:374px)]:[gap:6px_8px]">
              <span>
                {t("detail.orbitIndex", {
                  number: String(index + 1).padStart(2, "0"),
                  total: String(orbits.length).padStart(2, "0"),
                })}
              </span>
              <span className="[padding:3px_8px] [border:1px_solid_#aa97ff40] [border-radius:5px] [background:#aa97ff12] [color:#d0c1ff]">
                {t(categoryLabels[orbit.category])}
              </span>
              <span>{orbit.year}</span>
            </div>
            <div className="flex flex-wrap justify-between items-center [gap:8px_16px] [margin-block:8px]">
              <h2 id="orbit-solution-title" className="min-w-0 m-0 [font-size:clamp(1.625rem,_2.4vw,_2rem)] font-semibold [line-height:1.2] [letter-spacing:-.035em]">
                {orbit.name}
              </h2>
              <dl className="flex items-baseline flex-wrap [gap:4px_8px] m-0 [&_dt]:[color:#b6bdd0] [&_dt]:[font-size:0.8125rem] [&_dd]:m-0 [&_dd]:[color:#b7f3e7] [&_dd]:[font-size:1.375rem] [&_dd]:font-semibold [&_dd]:tabular-nums [&_dd]:[line-height:1.3] [&_abbr]:[font-size:0.8125rem] [&_abbr]:font-normal [&_abbr]:no-underline period-stat">
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
            <p className="m-0 [color:#b6bdd0] [font-size:.9375rem] [line-height:1.5]" lang="es">
              {orbit.description}
            </p>
          </header>
          <OrbitDetailTabs
            explanation={
              <>
                <h3>{t("detail.explanationTitle")}</h3>
                <p lang="es">{orbit.insight}</p>
                <p className="[.lab-three-body-detail-tab-panel_&]:[color:#abb7cd] [.lab-three-body-detail-tab-panel_&]:[font-size:0.8125rem]">{t("detail.idealBodies")}</p>
              </>
            }
            conditions={
              <div className="conditions" data-orbit-detail-conditions>
                <h3>{t("detail.conditionsTitle")}</h3>
                <p>{t("detail.conditionsDescription")}</p>
                <div
                  className="max-w-full [margin-block:10px_8px] overflow-x-auto [border:1px_solid_#394057] [border-radius:7px] [scrollbar-color:#9687be_#111624] [&_table]:w-full [&_table]:[border-collapse:collapse] [&_table]:[color:#d5dbeb] [&_table]:[font-size:0.75rem] [&_table]:[line-height:1.5] [&_table]:tabular-nums [&_table]:[white-space:nowrap] [&_:is(th,_td)]:[padding:7px_8px] [&_:is(th,_td)]:[border-bottom:1px_solid_#2d344a] [&_:is(th,_td)]:text-right [&_thead]:[background:#1e2134] [&_thead]:[color:#e1d7ff] [&_th]:font-medium [&_tbody_tr:last-child_>_*]:[border-bottom:0] [&_tbody_th]:[color:#b7f3e7]"
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
                  <p className="[.lab-three-body-detail-tab-panel_&]:[padding-left:8px] [.lab-three-body-detail-tab-panel_&]:[border-left:2px_solid_#aa97ff80] [.lab-three-body-detail-tab-panel_&]:[font-size:0.8125rem]">
                    {t("detail.refinedConditions", {
                      publishedPeriod: original.period.toFixed(8),
                    })}
                  </p>
                )}
              </div>
            }
          />
          <h3 id="orbit-physical-model-title">{t("detail.physicalModel")}</h3>
          <ul className="flex flex-wrap [gap:6px] [margin:0_0_6px] p-0 [list-style:none] [&_li]:[padding:5px_8px] [&_li]:[border:1px_solid_#7965af] [&_li]:[border-radius:6px] [&_li]:[background:#aa97ff18] [&_li]:[color:#e4dcff] [&_li]:text-center [&_strong]:[font-size:0.75rem] [&_strong]:font-bold [&_strong]:[line-height:1.5] [&_strong]:[letter-spacing:0.025em] [&_li:nth-child(2)]:[border-color:#48998e] [&_li:nth-child(2)]:[background:#5ee7d515] [&_li:nth-child(2)]:[color:#a7f3e5]">
            {(["equalMasses", "constant", "normalizedUnits"] as const).map(
              (concept) => (
                <li key={concept}>
                  <strong>{t(`galleryScience.${concept}`)}</strong>
                </li>
              ),
            )}
          </ul>
          <section
            className="min-w-0 [padding-top:10px] border-t border-solid border-lab-line [&_h3]:[margin:0_0_6px] [&_h3]:[color:#e3e6f2] [&_h3]:[font-size:0.875rem] [&_h3]:font-semibold [&_h3]:[line-height:1.4] [&_p]:m-0 [&_p]:[color:#b6bdd0] [&_p]:[font-size:0.8125rem] [&_p]:[line-height:1.5]"
            aria-labelledby="orbit-source-title"
            data-orbit-detail-source
          >
            <h3 id="orbit-source-title">{t("detail.sourceTitle")}</h3>
            <p lang="es">{orbit.sourceLabel}</p>
            <a
              href={orbit.source}
              target="_blank"
              rel="noopener noreferrer"
              className="[&&]:inline-flex [&&]:items-center [&&]:[gap:8px] [&&]:[min-height:44px] [&&]:[color:#d0c1ff] [&&]:[font-size:0.8125rem] [&&]:[line-height:1.5] [&&]:underline [&&]:[text-underline-offset:4px] [&&]:[transition:color_160ms] [&:hover]:[color:#eee7ff] [@media_(prefers-reduced-motion:_reduce)]:[&&]:[transition:none] source-link"
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
