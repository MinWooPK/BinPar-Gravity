"use client";

import { useLayoutEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/index";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { orbits } from "../../../data/orbits";
import type { OrbitPlayback } from "../../../types/animation.types";
import { useGalleryState } from "../../providers/GalleryProvider";
import { OrbitAnimation } from "../shared/OrbitAnimation";
import { threeBodyStyles as styles } from "./ThreeBody.styles";

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

  const reducedMotion = useReducedMotion();
  const playing = state.playing ?? !reducedMotion;

  // Conservar el scroll al regresar desde el detalle.
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

  return (
    <div className={styles.gallery}>
      {/* Información científica */}
      <aside
        className={styles.scienceNote}
        aria-labelledby="orbit-gallery-science-title"
        data-gallery-science
      >
        <h3 id="orbit-gallery-science-title">{t("galleryScience.title")}</h3>

        <p className={styles.scienceDescription}>
          {t("galleryScience.description")}
        </p>

        <ul className={styles.scientificConcepts}>
          {(["equalMasses", "constant", "normalizedUnits"] as const).map(
            (concept) => (
              <li key={concept}>
                <strong>{t(`galleryScience.${concept}`)}</strong>
              </li>
            ),
          )}
        </ul>

        <p className={styles.scienceFootnote}>{t("galleryScience.note")}</p>
      </aside>

      {/* Control de animaciones */}
      <p id="orbit-gallery-animation-note" className="sr-only">
        {t("animationGalleryNote")}
      </p>

      <div className="mb-4 flex justify-end">
        <button
          type="button"
          className={`button ${styles.playbackButton}`}
          aria-label={t(playing ? "animationPauseAll" : "animationPlayAll")}
          aria-describedby="orbit-gallery-animation-note"
          title={t(playing ? "animationPauseAll" : "animationPlayAll")}
          onClick={() => update({ playing: !playing })}
        >
          <Icon name={playing ? "pause" : "play"} />

          <span className={styles.playbackLabel}>
            {t(playing ? "animationPauseAll" : "animationPlayAll")}
          </span>
        </button>
      </div>

      {/* Galería: mostrar todas las órbitas */}
      <div className="orbit-grid">
        {orbits.map((orbit, index) => (
          <Link
            key={orbit.slug}
            className="orbit-card panel"
            href={`/three-body/${orbit.slug}`}
            onNavigate={() => {
              update({ scroll: window.scrollY });
            }}
          >
            <div className="orbit-card-art space-grid">
              <span className="orbit-index">
                {String(index + 1).padStart(2, "0")}
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
          </Link>
        ))}
      </div>
    </div>
  );
};
