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
    <div className="lab-three-body-gallery-gallery min-w-0 [margin-top:0] [&_:is(h2,_p)]:[overflow-wrap:anywhere] [&_:is(a,_button,_select,_input):focus-visible]:[outline:3px_solid_#c7baff] [&_:is(a,_button,_select,_input):focus-visible]:[outline-offset:4px]">
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
        className="[.lab-three-body-gallery-gallery_&]:w-full [.lab-three-body-gallery-gallery_&]:min-w-0 [.lab-three-body-gallery-gallery_&]:overflow-hidden"
        role="region"
        aria-label={t("journey.galleryTitle")}
      >
        <div
          className="lab-three-body-gallery-orbit-carousel-track  [.lab-three-body-gallery-gallery_&]:flex [.lab-three-body-gallery-gallery_&]:w-full [.lab-three-body-gallery-gallery_&]:[gap:1.25rem] [.lab-three-body-gallery-gallery_&]:items-stretch [.lab-three-body-gallery-gallery_&]:[transition:transform_450ms_cubic-bezier(0.22,_1,_0.36,_1)] [.lab-three-body-gallery-gallery_&]:[will-change:transform] [@media_(prefers-reduced-motion:_reduce)]:[.lab-three-body-gallery-gallery_&]:[transition:none] [@media_(prefers-reduced-motion:_reduce)]:[.lab-three-body-gallery-gallery_&]:[will-change:auto]"
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
                className="[.lab-three-body-gallery-gallery_&]:flex [.lab-three-body-gallery-gallery_&]:flex-col [.lab-three-body-gallery-gallery_&]:min-w-0 [.lab-three-body-gallery-gallery_&]:[color:inherit] [.lab-three-body-gallery-gallery_&]:no-underline [.lab-three-body-gallery-gallery_&]:[transition:border-color_160ms_ease,_transform_160ms_ease] [.lab-three-body-gallery-gallery_&:hover]:[border-color:#aa97ff] [.lab-three-body-gallery-gallery_&:hover]:[transform:translateY(-2px)] [@media_(prefers-reduced-motion:_reduce)]:[.lab-three-body-gallery-gallery_&]:[transition:none] [@media_(prefers-reduced-motion:_reduce)]:[.lab-three-body-gallery-gallery_&:hover]:[transform:none] [.lab-three-body-gallery-gallery_.lab-three-body-gallery-orbit-carousel-track_>_&]:[flex:0_0_100%] [.lab-three-body-gallery-gallery_.lab-three-body-gallery-orbit-carousel-track_>_&]:min-w-0 min-[640px]:[.lab-three-body-gallery-gallery_.lab-three-body-gallery-orbit-carousel-track_>_&]:[flex-basis:calc((100%_-_1.25rem)_/_2)] min-[1024px]:[.lab-three-body-gallery-gallery_.lab-three-body-gallery-orbit-carousel-track_>_&]:[flex-basis:calc((100%_-_2.5rem)_/_3)] [.lab-three-body-gallery-page_&]:min-w-0 [.lab-three-body-gallery-page_&]:[border:1px_solid_#2d344a] [.lab-three-body-gallery-page_&]:[border-radius:1rem] [.lab-three-body-gallery-page_&]:[background:#111624] [.lab-three-body-gallery-gallery_&]:min-w-0 [.lab-three-body-gallery-gallery_&]:[border:1px_solid_#2d344a] [.lab-three-body-gallery-gallery_&]:[border-radius:1rem] [.lab-three-body-gallery-gallery_&]:[background:#111624] relative"
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
                <div className="[.lab-three-body-gallery-gallery_&]:relative [.lab-three-body-gallery-gallery_&]:grid [.lab-three-body-gallery-gallery_&]:place-items-center [.lab-three-body-gallery-gallery_&]:min-w-0 [.lab-three-body-gallery-gallery_&]:[aspect-ratio:420_/_263] [.lab-three-body-gallery-gallery_&]:[border-bottom:1px_solid_#272c40] [.lab-three-body-gallery-gallery_&]:[border-radius:1rem_1rem_0_0] [.lab-three-body-gallery-gallery_&]:[background-color:#0c1120] [.lab-three-body-gallery-gallery_&]:[background-image:linear-gradient(#ffffff04_1px,_transparent_1px),_linear-gradient(90deg,_#ffffff04_1px,_transparent_1px)] [.lab-three-body-gallery-gallery_&]:[background-size:28px_28px]">
                  <span className="[.lab-three-body-gallery-gallery_&]:absolute [.lab-three-body-gallery-gallery_&]:[top:0.875rem] [.lab-three-body-gallery-gallery_&]:[left:1rem] [.lab-three-body-gallery-gallery_&]:[color:#b8b0d6] [.lab-three-body-gallery-gallery_&]:[font-size:0.75rem] [.lab-three-body-gallery-gallery_&]:[line-height:1.5] [.lab-three-body-gallery-gallery_&]:[letter-spacing:0.12em]">
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

                  <span className="[.lab-three-body-gallery-gallery_&]:absolute [.lab-three-body-gallery-gallery_&]:[right:0.875rem] [.lab-three-body-gallery-gallery_&]:[bottom:0.875rem] [.lab-three-body-gallery-gallery_&]:grid [.lab-three-body-gallery-gallery_&]:place-items-center [.lab-three-body-gallery-gallery_&]:[width:32px] [.lab-three-body-gallery-gallery_&]:[height:32px] [.lab-three-body-gallery-gallery_&]:[border:1px_solid_#60517f] [.lab-three-body-gallery-gallery_&]:[border-radius:50%] [.lab-three-body-gallery-gallery_&]:[background:#171526] [.lab-three-body-gallery-gallery_&]:[color:#d8cbff]" aria-hidden="true">
                    <Icon name="arrow" />
                  </span>
                </div>

                {/* Información de la órbita */}
                <div className="[.lab-three-body-gallery-gallery_&]:flex [.lab-three-body-gallery-gallery_&]:[flex:1] [.lab-three-body-gallery-gallery_&]:flex-col [.lab-three-body-gallery-gallery_&]:[gap:0.625rem] [.lab-three-body-gallery-gallery_&]:min-w-0 [.lab-three-body-gallery-gallery_&]:[padding:1rem] [.lab-three-body-gallery-gallery_&_h2]:m-0 [.lab-three-body-gallery-gallery_&_h2]:[color:#f2f2fa] [.lab-three-body-gallery-gallery_&_h2]:[font-size:1.25rem] [.lab-three-body-gallery-gallery_&_h2]:font-medium [.lab-three-body-gallery-gallery_&_h2]:[line-height:1.25] [.lab-three-body-gallery-gallery_&_h2]:[letter-spacing:-0.03em] [.lab-three-body-gallery-gallery_&_p]:m-0 [.lab-three-body-gallery-gallery_&_p]:[color:#b6bfd3] [.lab-three-body-gallery-gallery_&_p]:[font-size:0.9375rem] [.lab-three-body-gallery-gallery_&_p]:[line-height:1.5] [@media_(max-width:_374px)]:[.lab-three-body-gallery-gallery_&]:[padding:1rem]">
                  <div className="[.lab-three-body-gallery-gallery_&]:flex [.lab-three-body-gallery-gallery_&]:flex-wrap [.lab-three-body-gallery-gallery_&]:items-center [.lab-three-body-gallery-gallery_&]:justify-between [.lab-three-body-gallery-gallery_&]:[gap:0.5rem] [.lab-three-body-gallery-gallery_&]:[color:#a0a7be] [.lab-three-body-gallery-gallery_&]:[font-size:0.75rem] [.lab-three-body-gallery-gallery_&]:[line-height:1.6]">
                    <span className="[.lab-three-body-gallery-page_&]:inline-flex [.lab-three-body-gallery-page_&]:items-center [.lab-three-body-gallery-page_&]:w-fit [.lab-three-body-gallery-page_&]:[padding:0.25rem_0.55rem] [.lab-three-body-gallery-page_&]:[border:1px_solid_#3e3658] [.lab-three-body-gallery-page_&]:[border-radius:0.3rem] [.lab-three-body-gallery-page_&]:[background:#211d32] [.lab-three-body-gallery-page_&]:[color:#d8cbff] [.lab-three-body-gallery-page_&]:[font-size:0.75rem] [.lab-three-body-gallery-page_&]:font-medium [.lab-three-body-gallery-page_&]:[line-height:1.5] [.lab-three-body-gallery-page_&]:[letter-spacing:0] [.lab-three-body-gallery-gallery_&]:inline-flex [.lab-three-body-gallery-gallery_&]:items-center [.lab-three-body-gallery-gallery_&]:w-fit [.lab-three-body-gallery-gallery_&]:[padding:0.25rem_0.55rem] [.lab-three-body-gallery-gallery_&]:[border:1px_solid_#3e3658] [.lab-three-body-gallery-gallery_&]:[border-radius:0.3rem] [.lab-three-body-gallery-gallery_&]:[background:#211d32] [.lab-three-body-gallery-gallery_&]:[color:#d8cbff] [.lab-three-body-gallery-gallery_&]:[font-size:0.75rem] [.lab-three-body-gallery-gallery_&]:font-medium [.lab-three-body-gallery-gallery_&]:[line-height:1.5] [.lab-three-body-gallery-gallery_&]:[letter-spacing:0]">
                      {t(categoryNames[orbit.category])}
                    </span>

                    <span>{orbit.year}</span>
                  </div>

                  <h2>{orbit.name}</h2>

                  <p lang="es">{orbit.description}</p>

                  <div className="[.lab-three-body-gallery-gallery_&]:flex [.lab-three-body-gallery-gallery_&]:flex-wrap [.lab-three-body-gallery-gallery_&]:items-center [.lab-three-body-gallery-gallery_&]:justify-between [.lab-three-body-gallery-gallery_&]:[gap:0.5rem] [.lab-three-body-gallery-gallery_&]:[color:#a0a7be] [.lab-three-body-gallery-gallery_&]:[font-size:0.8125rem] [.lab-three-body-gallery-gallery_&]:[line-height:1.6] [.lab-three-body-gallery-gallery_&]:[margin-top:auto] [.lab-three-body-gallery-gallery_&]:[padding-top:0.75rem] [.lab-three-body-gallery-gallery_&]:[border-top:1px_solid_#272c40] [.lab-three-body-gallery-gallery_&_strong]:[color:#d0d4e3] [.lab-three-body-gallery-gallery_&_strong]:font-medium [.lab-three-body-gallery-gallery_&_strong]:tabular-nums [.lab-three-body-gallery-gallery_&_>_span:last-child]:inline-flex [.lab-three-body-gallery-gallery_&_>_span:last-child]:items-center [.lab-three-body-gallery-gallery_&_>_span:last-child]:[gap:0.35rem] [.lab-three-body-gallery-gallery_&_>_span:last-child]:[color:#c7baff]">
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
