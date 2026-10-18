"use client";
import { useLayoutEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { threeBodyStyles as styles } from "./ThreeBody.styles";
import { useTranslations } from "next-intl";
import { orbits } from "../../../data/orbits";
import { OrbitAnimation } from "../shared/OrbitAnimation";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { OrbitPlayback } from "../../../types/animation.types";
import { useGalleryState } from "../../providers/GalleryProvider";
import type { Category } from "../../../types/gallery.types";
import { Icon } from "@/components/icons/index";
const categoryLabels = {
  Todas: "categoryAll",
  Clásica: "categoryClassicalPlural",
  Coreografía: "categoryChoreographyPlural",
  Periódica: "categoryPeriodicPlural",
} as const satisfies Record<Category, string>;
const categoryNames = {
  Clásica: "categoryClassical",
  Coreografía: "categoryChoreography",
  Periódica: "categoryPeriodic",
} as const satisfies Record<Exclude<Category, "Todas">, string>;
const categories = Object.keys(categoryLabels) as Category[];
export const OrbitGallery = ({
  animationData,
  active = true,
}: {
  animationData: Readonly<Record<string, OrbitPlayback>>;
  active?: boolean;
}) => {
  const { state, update } = useGalleryState();
  const t = useTranslations("ThreeBody");
  const reducedMotion = useReducedMotion();
  const playing = state.playing ?? !reducedMotion;
  const savedScroll = useRef(state.scroll);
  useLayoutEffect(() => {
    savedScroll.current = state.scroll;
  }, [state.scroll]);
  useLayoutEffect(() => {
    if (!active) return;
    const id = requestAnimationFrame(() =>
      window.scrollTo({ top: savedScroll.current, behavior: "instant" }),
    );
    return () => cancelAnimationFrame(id);
    // Restore on activation, including a return from an orbit detail.
    // Updating filters must not move the page or overwrite the saved position.
  }, [active]);
  const query = state.query.trim().toLocaleLowerCase("es");
  const visible = orbits.filter(
    (o) =>
      o.name
        .toLocaleLowerCase("es")
        .includes(query) &&
      (state.category === "Todas" || state.category === o.category),
  );
  if (state.order === "alphabetic")
    visible.sort((a, b) => a.name.localeCompare(b.name, "es"));
  return (
    <div className={styles.gallery}>
      <aside className={styles.scienceNote} aria-labelledby="orbit-gallery-science-title" data-gallery-science>
        <h3 id="orbit-gallery-science-title">{t("galleryScience.title")}</h3>
        <p className={styles.scienceDescription}>{t("galleryScience.description")}</p>
        <ul className={styles.scientificConcepts}>
          {(["equalMasses", "constant", "normalizedUnits"] as const).map((concept) => (
            <li key={concept}><strong>{t(`galleryScience.${concept}`)}</strong></li>
          ))}
        </ul>
        <p className={styles.scienceFootnote}>{t("galleryScience.note")}</p>
      </aside>
      <p id="orbit-gallery-animation-note" className="sr-only">{t("animationGalleryNote")}</p>
      <div className="gallery-toolbar">
        <div className="search-field">
          <Icon name="search" />
          <label className="sr-only" htmlFor="orbit-search">
            {t("gallerySearchLabel")}
          </label>
          <input
            id="orbit-search"
            type="search"
            placeholder={t("gallerySearchPlaceholder")}
            value={state.query}
            onChange={(e) => update({ query: e.target.value, scroll: 0 })}
          />
        </div>
        <button
          type="button"
          className={`button ${styles.playbackButton}`}
          aria-label={t(playing ? "animationPauseAll" : "animationPlayAll")}
          aria-describedby="orbit-gallery-animation-note"
          title={t(playing ? "animationPauseAll" : "animationPlayAll")}
          onClick={() => update({ playing: !playing })}
        >
          <Icon name={playing ? "pause" : "play"} />
          <span className={styles.playbackLabel}>{t(playing ? "animationPauseAll" : "animationPlayAll")}</span>
        </button>
        <div className="gallery-options">
          <label htmlFor="orbit-order" className="sr-only">
            {t("galleryOrderLabel")}
          </label>
          <select
            id="orbit-order"
            value={state.order}
            onChange={(e) =>
              update({ order: e.target.value as "curated" | "alphabetic" })
            }
          >
            <option value="curated">{t("galleryOrderCurated")}</option>
            <option value="alphabetic">{t("galleryOrderAlphabetic")}</option>
          </select>
          <div
            className="view-switch"
            role="group"
            aria-label={t("galleryViewLabel")}
          >
            <button
              aria-label={t("galleryViewGrid")}
              aria-pressed={state.view === "grid"}
              onClick={() => update({ view: "grid" })}
            >
              <Icon name="grid" />
            </button>
            <button
              aria-label={t("galleryViewList")}
              aria-pressed={state.view === "list"}
              onClick={() => update({ view: "list" })}
            >
              <Icon name="list" />
            </button>
          </div>
        </div>
      </div>
      <div className="gallery-filter-row">
        <div
          className="filter-pills"
          role="group"
          aria-label={t("galleryFilterLabel")}
        >
          {categories.map((category) => (
            <button
              key={category}
              aria-pressed={state.category === category}
              onClick={() => update({ category, scroll: 0 })}
            >
              {t(categoryLabels[category])}
            </button>
          ))}
        </div>
        <span className="muted" role="status">
          {t("galleryResults", { count: visible.length, total: orbits.length })}
        </span>
      </div>
      <div className={`orbit-grid ${state.view === "list" ? "list-view" : ""}`}>
        {visible.map((orbit) => (
          <Link
            className="orbit-card panel"
            key={orbit.slug}
            href={`/three-body/${orbit.slug}`}
            onNavigate={() => update({ scroll: window.scrollY })}
          >
            <div className="orbit-card-art space-grid">
              <span className="orbit-index">
                {String(orbits.indexOf(orbit) + 1).padStart(2, "0")}
              </span>
              <OrbitAnimation
                data={animationData[orbit.slug]}
                name={orbit.name}
                playing={active && playing}
              />
              <span className="orbit-open">
                <Icon name="arrow" />
              </span>
            </div>
            <div className="orbit-card-content">
              <div className="card-topline">
                <span className="badge">{t(categoryNames[orbit.category])}</span>
                <span>{orbit.year}</span>
              </div>
              <h2>{orbit.name}</h2>
              <p lang="es">{orbit.description}</p>
              <div className="orbit-card-footer">
                <span>
                  {t("galleryPeriod")} <strong>{orbit.period.toFixed(3)} u.t.</strong>
                </span>
                <span>
                  {t("galleryExplore")} <Icon name="arrow" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {visible.length === 0 && (
        <div className="empty-state panel">
          <h2>{t("galleryEmptyTitle")}</h2>
          <p>{t("galleryEmptyDescription")}</p>
          <button
            className="button secondary"
            onClick={() => update({ query: "", category: "Todas" })}
          >
            {t("galleryShowAll")}
          </button>
        </div>
      )}
    </div>
  );
};
