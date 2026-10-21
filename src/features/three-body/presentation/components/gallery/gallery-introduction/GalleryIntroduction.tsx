"use client";

import { GalleryIntroductionHeader } from "./GalleryIntroductionHeader";
import { GalleryIntroductionDiagram } from "./GalleryIntroductionDiagram";
import { GalleryIntroductionConditions } from "./GalleryIntroductionConditions";

type Props = {
  onExplore: () => void;
};

// Organiza la introducción y las dos tarjetas educativas de la galería.
export const GalleryIntroduction = ({ onExplore }: Props) => (
  <section className="flex min-w-0 flex-col gap-5">
    <GalleryIntroductionHeader onExplore={onExplore} />

    {/* Diagrama del sistema y condiciones de las órbitas publicadas. */}
    <div className="grid min-w-0 gap-4 lg:grid-cols-2">
      <GalleryIntroductionDiagram />
      <GalleryIntroductionConditions />
    </div>
  </section>
);
