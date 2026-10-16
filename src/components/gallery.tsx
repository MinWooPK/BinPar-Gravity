"use client";
import { useLayoutEffect } from "react";
import { Link } from "@/i18n/navigation";
import styles from "./gallery.module.css";
import { useLocale, useTranslations } from "next-intl";
import { orbits } from "@/data/orbits";
import { OrbitAnimation } from "@/features/three-body/components/OrbitAnimation";
import { useReducedMotion } from "@/features/three-body/components/useReducedMotion";
import type { OrbitPlayback } from "@/features/three-body/components/orbit-visualization";
import { useGalleryState, type Category } from "./gallery-state";
import { Icon } from "./icons";
const categories: Category[] = ["Todas", "Clásica", "Coreografía", "Periódica"];
export function Gallery({ animationData }: { animationData: Readonly<Record<string, OrbitPlayback>> }) {
  const { state, update } = useGalleryState();
  const t = useTranslations("ThreeBody");
  const locale = useLocale();
  const reducedMotion = useReducedMotion();
  const playing = state.playing ?? !reducedMotion;
  useLayoutEffect(() => {
    const id = requestAnimationFrame(() =>
      window.scrollTo({ top: state.scroll, behavior: "instant" }),
    );
    return () => cancelAnimationFrame(id);
    // Restore once per gallery mount; filtering must not move the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const visible = orbits.filter(
    (o) =>
      o.name
        .toLocaleLowerCase("es")
        .includes(state.query.trim().toLocaleLowerCase("es")) &&
      (state.category === "Todas" || state.category === o.category),
  );
  if (state.order === "alphabetic")
    visible.sort((a, b) => a.name.localeCompare(b.name, "es"));
  return (
    <div className={styles.gallery}>
      <div className={styles.motionControls} lang={locale}>
        <p>{t("animationGalleryNote")}</p>
        <button type="button" className="button" onClick={() => update({ playing: !playing })}>
          <Icon name={playing ? "pause" : "play"} />
          {t(playing ? "animationPauseAll" : "animationPlayAll")}
        </button>
      </div>
      <div className="gallery-toolbar">
        <div className="search-field">
          <Icon name="search" />
          <label className="sr-only" htmlFor="orbit-search">
            Buscar órbita por nombre
          </label>
          <input
            id="orbit-search"
            type="search"
            placeholder="Busca una órbita…"
            value={state.query}
            onChange={(e) => update({ query: e.target.value, scroll: 0 })}
          />
        </div>
        <div className="gallery-options">
          <label htmlFor="orbit-order" className="sr-only">
            Orden de las órbitas
          </label>
          <select
            id="orbit-order"
            value={state.order}
            onChange={(e) =>
              update({ order: e.target.value as "curated" | "alphabetic" })
            }
          >
            <option value="curated">Orden de exploración</option>
            <option value="alphabetic">Nombre: A–Z</option>
          </select>
          <div className="view-switch" role="group" aria-label="Vista de galería">
            <button
              aria-label="Vista de tarjetas"
              aria-pressed={state.view === "grid"}
              onClick={() => update({ view: "grid" })}
            >
              <Icon name="grid" />
            </button>
            <button
              aria-label="Vista de lista"
              aria-pressed={state.view === "list"}
              onClick={() => update({ view: "list" })}
            >
              <Icon name="list" />
            </button>
          </div>
        </div>
      </div>
      <div className="gallery-filter-row">
        <div className="filter-pills" role="group" aria-label="Filtrar por tipo">
          {categories.map((category) => (
            <button
              key={category}
              aria-pressed={state.category === category}
              onClick={() => update({ category, scroll: 0 })}
            >
              {category === "Clásica"
                ? "Clásicas"
                : category === "Coreografía"
                  ? "Coreografías"
                  : category === "Periódica"
                    ? "Periódicas"
                    : category}
            </button>
          ))}
        </div>
        <span className="muted" role="status">
          {visible.length} de {orbits.length} órbitas
        </span>
      </div>
      <div className={`orbit-grid ${state.view === "list" ? "list-view" : ""}`}>
        {visible.map((orbit) => (
          <Link
            className="orbit-card panel"
            key={orbit.slug}
            href={`/three-body/${orbit.slug}`}
            onClick={() => update({ scroll: window.scrollY })}
          >
            <div className="orbit-card-art space-grid">
              <span className="orbit-index">
                {String(orbits.indexOf(orbit) + 1).padStart(2, "0")}
              </span>
              <OrbitAnimation data={animationData[orbit.slug]} name={orbit.name} playing={playing} />
              <span className="orbit-open">
                <Icon name="arrow" />
              </span>
            </div>
            <div className="orbit-card-content">
              <div className="card-topline">
                <span className="badge">{orbit.category}</span>
                <span>{orbit.year}</span>
              </div>
              <h2>{orbit.name}</h2>
              <p>{orbit.description}</p>
              <div className="orbit-card-footer">
                <span>
                  Período <strong>{orbit.period.toFixed(3)} u.t.</strong>
                </span>
                <span>
                  Explorar <Icon name="arrow" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {visible.length === 0 && (
        <div className="empty-state panel">
          <h2>No hay órbitas con ese filtro</h2>
          <p>Prueba otro nombre o vuelve a ver las seis soluciones.</p>
          <button
            className="button secondary"
            onClick={() => update({ query: "", category: "Todas" })}
          >
            Ver todas las órbitas
          </button>
        </div>
      )}
    </div>
  );
}
