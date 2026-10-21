"use client";

import { useTranslations } from "next-intl";
import { orbits } from "../../../../data/orbits";
import type { OrbitDefinition } from "../../../../types/orbit.types";
import type { OrbitPlayback } from "../../../../types/animation.types";
import type { GalleryState } from "../../../../types/gallery.types";
import { OrbitGalleryCard } from "./OrbitGalleryCard";

type OrbitGalleryCarouselProps = {
  filteredOrbits: readonly OrbitDefinition[];
  animationData: Readonly<Record<string, OrbitPlayback>>;
  active: boolean;
  playingByOrbit: GalleryState["playingByOrbit"];
  firstVisible: number;
  lastVisible: number;
  trackTransform: string;
  onToggleOrbit: (slug: string) => void;
  onNavigate: () => void;
};

// Mantiene todas las tarjetas montadas para conservar su estado.
export const OrbitGalleryCarousel = ({
  filteredOrbits,
  animationData,
  active,
  playingByOrbit,
  firstVisible,
  lastVisible,
  trackTransform,
  onToggleOrbit,
  onNavigate,
}: OrbitGalleryCarouselProps) => {
  const t = useTranslations("ThreeBody");

  return (
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
          const playing = playingByOrbit[orbit.slug] ?? false;
          const isVisible = index >= firstVisible && index < lastVisible;

          // Mantiene la numeración original incluso después de filtrar.
          const originalIndex =
            orbits.findIndex((item) => item.slug === orbit.slug) + 1;

          return (
            <OrbitGalleryCard
              key={orbit.slug}
              orbit={orbit}
              data={animationData[orbit.slug]}
              originalIndex={originalIndex}
              isVisible={isVisible}
              playing={playing}
              active={active}
              onToggleOrbit={onToggleOrbit}
              onNavigate={onNavigate}
            />
          );
        })}
      </div>
    </div>
  );
};
