"use client";

import { useTranslations } from "next-intl";
import type { OrbitPlayback } from "../../../../types/animation.types";
import { OrbitGalleryToolbar } from "./OrbitGalleryToolbar";
import { OrbitGalleryCarousel } from "./OrbitGalleryCarousel";
import { useOrbitGallery } from "./useOrbitGallery";

type OrbitGalleryProps = {
  animationData: Readonly<Record<string, OrbitPlayback>>;
  active?: boolean;
};

// Coordina los filtros, las tarjetas y la posición al volver de un detalle.
export const OrbitGallery = ({
  animationData,
  active = true,
}: OrbitGalleryProps) => {
  const t = useTranslations("ThreeBody");
  const gallery = useOrbitGallery(active);

  return (
    <div className="lab-three-body-gallery-gallery min-w-0 [margin-top:0] [&_:is(h2,_p)]:[overflow-wrap:anywhere] [&_:is(a,_button,_select,_input):focus-visible]:[outline:3px_solid_#c7baff] [&_:is(a,_button,_select,_input):focus-visible]:[outline-offset:4px]">
      <OrbitGalleryToolbar
        categoryFilter={gallery.categoryFilter}
        resultCount={gallery.filteredOrbits.length}
        firstVisible={gallery.firstVisible}
        lastVisible={gallery.lastVisible}
        currentPage={gallery.currentPage}
        totalPages={gallery.totalPages}
        onChangeCategory={gallery.changeCategory}
        onPreviousPage={gallery.previousPage}
        onNextPage={gallery.nextPage}
      />

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

      <OrbitGalleryCarousel
        filteredOrbits={gallery.filteredOrbits}
        animationData={animationData}
        active={active}
        playingByOrbit={gallery.playingByOrbit}
        firstVisible={gallery.firstVisible}
        lastVisible={gallery.lastVisible}
        trackTransform={gallery.trackTransform}
        onToggleOrbit={gallery.toggleOrbit}
        onNavigate={gallery.saveScroll}
      />
    </div>
  );
};
