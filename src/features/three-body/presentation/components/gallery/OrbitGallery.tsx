"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons";

import { orbits } from "../../../data/orbits";
import type { OrbitPlayback } from "../../../types/animation.types";
import type { OrbitCategoryFilter } from "../../../types/gallery.types";
import { useGalleryState } from "../../providers/GalleryProvider";
import { OrbitAnimation } from "../shared/OrbitAnimation";
import { threeBodyStyles as styles } from "./ThreeBody.styles";

const categoryNames = {
  Clásica: "categoryClassical",
  Coreografía: "categoryChoreography",
  Periódica: "categoryPeriodic",
} as const;

const categoryFilters: OrbitCategoryFilter[] = [
  "all",
  "Clásica",
  "Coreografía",
  "Periódica",
];

type OrbitGalleryProps = {
  animationData: Readonly<Record<string, OrbitPlayback>>;
  active?: boolean;
};

export const OrbitGallery = ({
  animationData,
  active = true,
}: OrbitGalleryProps) => {
  const { state, update, toggleOrbit } = useGalleryState();
  const t = useTranslations("ThreeBody");

  // Número de tarjetas por página según el dispositivo.
  const [itemsPerPage, setItemsPerPage] = useState(1);

  useEffect(() => {
    const tablet = window.matchMedia("(min-width: 640px)");
    const desktop = window.matchMedia("(min-width: 1024px)");

    const updatePageSize = () => {
      setItemsPerPage(desktop.matches ? 3 : tablet.matches ? 2 : 1);
    };

    updatePageSize();

    tablet.addEventListener("change", updatePageSize);
    desktop.addEventListener("change", updatePageSize);

    return () => {
      tablet.removeEventListener("change", updatePageSize);
      desktop.removeEventListener("change", updatePageSize);
    };
  }, []);

  // ======================================
  // FILTRADO POR CATEGORÍAS
  // ======================================

  const filteredOrbits =
    state.categoryFilter === "all"
      ? orbits
      : orbits.filter((orbit) => orbit.category === state.categoryFilter);

  const changeCategory = (category: OrbitCategoryFilter) => {
    if (state.categoryFilter === category) return;

    update({
      categoryFilter: category,
      galleryPage: 0,
    });
  };

  // ======================================
  // PAGINACIÓN
  // ======================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrbits.length / itemsPerPage),
  );

  const currentPage = Math.min(state.galleryPage, totalPages - 1);

  const firstVisible = currentPage * itemsPerPage;

  const lastVisible = Math.min(
    firstVisible + itemsPerPage,
    filteredOrbits.length,
  );

  const trackTransform = `translate3d(
    calc(-${currentPage * 100}% - ${currentPage * 1.25}rem),
    0,
    0
  )`;

  const nextPage = () => {
    if (currentPage >= totalPages - 1) return;

    update({
      galleryPage: currentPage + 1,
    });
  };

  const previousPage = () => {
    if (currentPage <= 0) return;

    update({
      galleryPage: currentPage - 1,
    });
  };

  // ======================================
  // RESTAURACIÓN DEL SCROLL
  // ======================================

  const savedScroll = useRef(state.scroll);

  useLayoutEffect(() => {
    savedScroll.current = state.scroll;
  }, [state.scroll]);

  useLayoutEffect(() => {
    if (!active) return;

    const id = requestAnimationFrame(() => {
      window.scrollTo({
        top: savedScroll.current,
        behavior: "instant",
      });
    });

    return () => cancelAnimationFrame(id);
  }, [active]);

  // ======================================
  // GALERÍA
  // ======================================

  return (
    <div className={styles.gallery}>
      {/* FILTROS Y NAVEGACIÓN */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        {/* Tags de categoría */}
        <div
          role="group"
          aria-label={t("galleryFilterLabel")}
          className="flex flex-wrap items-center gap-2"
        >
          {categoryFilters.map((category) => {
            const selected = state.categoryFilter === category;

            const label =
              category === "all"
                ? t("galleryFilterAll")
                : t(categoryNames[category]);

            return (
              <button
                key={category}
                type="button"
                aria-pressed={selected}
                onClick={() => changeCategory(category)}
                className={`
                  min-h-11 cursor-pointer rounded-xl border
                  px-3 py-2 text-sm font-semibold
                  transition-colors duration-200
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-violet-300
                  motion-reduce:transition-none
                  ${
                    selected
                      ? "border-violet-300 bg-violet-300/15 text-cyan-100"
                      : "border-slate-600 bg-slate-950/40 text-slate-300 hover:border-violet-300 hover:bg-violet-300/10"
                  }
                `}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Flechas del carrusel */}
        <div
          className="flex items-center gap-3"
          role="group"
          aria-label={t("journey.galleryTitle")}
        >
          <button
            type="button"
            aria-label={t("galleryGuide.previous")}
            title={t("galleryGuide.previous")}
            aria-controls="orbit-gallery-carousel"
            disabled={currentPage === 0}
            onClick={previousPage}
            className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-[#60517f] bg-[#171526] text-[#d8cbff] transition-colors hover:bg-[#302748] disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c7baff]"
          >
            <span aria-hidden="true">←</span>
          </button>

          <span
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="min-w-20 text-center text-sm font-medium tabular-nums text-slate-300"
          >
            {filteredOrbits.length === 0
              ? "0 / 0"
              : `${firstVisible + 1}–${lastVisible} / ${filteredOrbits.length}`}
          </span>

          <button
            type="button"
            aria-label={t("galleryGuide.next")}
            title={t("galleryGuide.next")}
            aria-controls="orbit-gallery-carousel"
            disabled={currentPage >= totalPages - 1}
            onClick={nextPage}
            className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-[#60517f] bg-[#171526] text-[#d8cbff] transition-colors hover:bg-[#302748] disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c7baff]"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      {/* ACLARACIÓN SOBRE LAS SOLUCIONES */}
      <div className="mb-5 rounded-xl border border-[#60517f] bg-[#201b35] p-4">
        <p className="text-sm leading-7 text-slate-200 sm:text-base">
          {t.rich("galleryGuide.keyMessage", {
            highlight: (children) => (
              <strong className="font-semibold text-[#d3c5ff]">
                {children}
              </strong>
            ),
          })}
        </p>
      </div>

      {/* CARRUSEL */}
      <div
        id="orbit-gallery-carousel"
        className="orbit-carousel-viewport"
        role="region"
        aria-label={t("journey.galleryTitle")}
      >
        <div
          className="orbit-carousel-track"
          style={{ transform: trackTransform }}
        >
          {filteredOrbits.map((orbit, index) => {
            const playing = state.playingByOrbit[orbit.slug] ?? false;

            const isVisible = index >= firstVisible && index < lastVisible;

            // Mantener la numeración original.
            const originalIndex =
              orbits.findIndex((item) => item.slug === orbit.slug) + 1;

            return (
              <article
                key={orbit.slug}
                className="orbit-card panel relative"
                aria-hidden={!isVisible}
                inert={!isVisible}
              >
                {/* Enlace al detalle */}
                <Link
                  href={`/three-body/${orbit.slug}`}
                  aria-label={`${t("galleryExplore")}: ${orbit.name}`}
                  className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c7baff]"
                  onNavigate={() => {
                    update({
                      scroll: window.scrollY,
                    });
                  }}
                />

                {/* Animación */}
                <div className="orbit-card-art space-grid">
                  <span className="orbit-index">
                    {String(originalIndex).padStart(2, "0")}
                  </span>

                  <OrbitAnimation
                    data={animationData[orbit.slug]}
                    name={orbit.name}
                    playing={active && playing && isVisible}
                  />

                  {/* Play/Pausa */}
                  <button
                    type="button"
                    aria-label={`${t(
                      playing ? "animationPause" : "animationPlay",
                    )}: ${orbit.name}`}
                    aria-pressed={playing}
                    title={t(playing ? "animationPause" : "animationPlay")}
                    onClick={() => toggleOrbit(orbit.slug)}
                    className="absolute bottom-3 left-3 z-20 flex size-11 cursor-pointer items-center justify-center rounded-full border border-[#60517f] bg-[#171526] text-[#d8cbff] transition-colors hover:border-[#aa97ff] hover:bg-[#302748] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c7baff]"
                  >
                    <Icon name={playing ? "pause" : "play"} />
                  </button>

                  <span className="orbit-open" aria-hidden="true">
                    <Icon name="arrow" />
                  </span>
                </div>

                {/* Información de la órbita */}
                <div className="orbit-card-content">
                  <div className="card-topline">
                    <span className="badge">
                      {t(categoryNames[orbit.category])}
                    </span>

                    <span>{orbit.year}</span>
                  </div>

                  <h2>{orbit.name}</h2>

                  <p lang="es">{orbit.description}</p>

                  <div className="orbit-card-footer">
                    <span>
                      {t("galleryPeriod")}{" "}
                      <strong>{orbit.period.toFixed(3)} u.t.</strong>
                    </span>

                    <span>
                      {t("galleryExplore")}
                      <Icon name="arrow" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};
