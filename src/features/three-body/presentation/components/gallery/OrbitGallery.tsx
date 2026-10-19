"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/index";

import { orbits } from "../../../data/orbits";
import type { OrbitPlayback } from "../../../types/animation.types";
import { useGalleryState } from "../../providers/GalleryProvider";
import { OrbitAnimation } from "../shared/OrbitAnimation";
import { threeBodyStyles as styles } from "./ThreeBody.styles";
import { GalleryIntroduction } from "./GalleryIntroduction";

const categoryNames = {
  Clásica: "categoryClassical",
  Coreografía: "categoryChoreography",
  Periódica: "categoryPeriodic",
} as const;

type OrbitGalleryProps = {
  animationData: Readonly<Record<string, OrbitPlayback>>;
  active?: boolean;
};

export const OrbitGallery = ({
  animationData,
  active = true,
}: OrbitGalleryProps) => {
  const { state, update } = useGalleryState();
  const t = useTranslations("ThreeBody");

  // Reproducción independiente, pausada por defecto.
  const [playingByOrbit, setPlayingByOrbit] = useState<Record<string, boolean>>(
    {},
  );

  // Cuántas tarjetas se muestran según la pantalla.
  const [itemsPerPage, setItemsPerPage] = useState(1);

  // Detectar móvil, tablet y escritorio.
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

  const totalPages = Math.ceil(orbits.length / itemsPerPage);

  // Evitar páginas inválidas al cambiar de tamaño.
  const currentPage = Math.min(state.galleryPage, totalPages - 1);

  const firstVisible = currentPage * itemsPerPage;
  const lastVisible = Math.min(firstVisible + itemsPerPage, orbits.length);

  // Desplazar horizontalmente una página completa.
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

  // Play/Pausa individual por órbita.
  const toggleOrbit = (slug: string) => {
    setPlayingByOrbit((current) => ({
      ...current,
      [slug]: !current[slug],
    }));
  };

  // Abrir la galería desde la explicación.
  const showGallery = () => {
    update({
      galleryView: "gallery",
      galleryPage: 0,
      scroll: 0,
    });
  };

  // Regresar a la explicación.
  const showIntroduction = () => {
    setPlayingByOrbit({});

    update({
      galleryView: "intro",
      galleryPage: 0,
      scroll: 0,
    });
  };

  // Guardar scroll al navegar entre vistas y detalles.
  const savedScroll = useRef(state.scroll);

  useLayoutEffect(() => {
    savedScroll.current = state.scroll;
  }, [state.scroll]);

  useLayoutEffect(() => {
    if (!active) return;

    const id = requestAnimationFrame(() => {
      window.scrollTo({
        top: state.galleryView === "gallery" ? savedScroll.current : 0,
        behavior: "instant",
      });
    });

    return () => cancelAnimationFrame(id);
  }, [active, state.galleryView]);

  // ======================================
  // VISTA 1: EXPLICACIÓN
  // ======================================

  if (state.galleryView === "intro") {
    return (
      <div className={styles.gallery}>
        <GalleryIntroduction onExplore={showGallery} />
      </div>
    );
  }

  // ======================================
  // VISTA 2: CARRUSEL
  // ======================================

  return (
    <div className={styles.gallery}>
      {/* Volver y controles de navegación */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={showIntroduction}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#c9baff] transition-colors hover:bg-[#aa97ff12] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c7baff]"
        >
          <span aria-hidden="true">←</span>
          {t("galleryGuide.back")}
        </button>

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
            {firstVisible + 1}–{lastVisible} / {orbits.length}
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

      {/* Ventana del carrusel */}
      <div
        id="orbit-gallery-carousel"
        className="orbit-carousel-viewport"
        role="region"
        aria-label={t("journey.galleryTitle")}
      >
        {/* Las seis tarjetas permanecen montadas.
            Solo se desplaza la pista horizontal. */}
        <div
          className="orbit-carousel-track"
          style={{ transform: trackTransform }}
        >
          {orbits.map((orbit, index) => {
            const playing = playingByOrbit[orbit.slug] ?? false;

            const isVisible = index >= firstVisible && index < lastVisible;

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
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <OrbitAnimation
                    data={animationData[orbit.slug]}
                    name={orbit.name}
                    playing={active && playing && isVisible}
                  />

                  {/* Play/Pausa propio de la tarjeta */}
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
