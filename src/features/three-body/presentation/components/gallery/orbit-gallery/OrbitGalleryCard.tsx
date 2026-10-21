"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons";

import type { OrbitDefinition } from "../../../../types/orbit.types";
import type { OrbitPlayback } from "../../../../types/animation.types";
import { OrbitAnimation } from "../../shared/OrbitAnimation";
import { categoryNames } from "./orbit-gallery.constants";

type OrbitGalleryCardProps = {
  orbit: OrbitDefinition;
  data: OrbitPlayback;
  originalIndex: number;
  isVisible: boolean;
  playing: boolean;
  active: boolean;
  onToggleOrbit: (slug: string) => void;
  onNavigate: () => void;
};

// Cada tarjeta conserva su propia reproducción y su enlace al detalle.
export const OrbitGalleryCard = ({
  orbit,
  data,
  originalIndex,
  isVisible,
  playing,
  active,
  onToggleOrbit,
  onNavigate,
}: OrbitGalleryCardProps) => {
  const t = useTranslations("ThreeBody");

  return (
    <article
      className="[.lab-three-body-gallery-gallery_&]:flex [.lab-three-body-gallery-gallery_&]:flex-col [.lab-three-body-gallery-gallery_&]:min-w-0 [.lab-three-body-gallery-gallery_&]:[color:inherit] [.lab-three-body-gallery-gallery_&]:no-underline [.lab-three-body-gallery-gallery_&]:[transition:border-color_160ms_ease,_transform_160ms_ease] [.lab-three-body-gallery-gallery_&:hover]:[border-color:#aa97ff] [.lab-three-body-gallery-gallery_&:hover]:[transform:translateY(-2px)] [@media_(prefers-reduced-motion:_reduce)]:[.lab-three-body-gallery-gallery_&]:[transition:none] [@media_(prefers-reduced-motion:_reduce)]:[.lab-three-body-gallery-gallery_&:hover]:[transform:none] [.lab-three-body-gallery-gallery_.lab-three-body-gallery-orbit-carousel-track_>_&]:[flex:0_0_100%] [.lab-three-body-gallery-gallery_.lab-three-body-gallery-orbit-carousel-track_>_&]:min-w-0 min-[640px]:[.lab-three-body-gallery-gallery_.lab-three-body-gallery-orbit-carousel-track_>_&]:[flex-basis:calc((100%_-_1.25rem)_/_2)] min-[1024px]:[.lab-three-body-gallery-gallery_.lab-three-body-gallery-orbit-carousel-track_>_&]:[flex-basis:calc((100%_-_2.5rem)_/_3)] [.lab-three-body-gallery-page_&]:min-w-0 [.lab-three-body-gallery-page_&]:[border:1px_solid_#2d344a] [.lab-three-body-gallery-page_&]:[border-radius:1rem] [.lab-three-body-gallery-page_&]:[background:#111624] [.lab-three-body-gallery-gallery_&]:min-w-0 [.lab-three-body-gallery-gallery_&]:[border:1px_solid_#2d344a] [.lab-three-body-gallery-gallery_&]:[border-radius:1rem] [.lab-three-body-gallery-gallery_&]:[background:#111624] relative"
      aria-hidden={!isVisible}
      inert={!isVisible}
    >
      {/* Enlace al detalle */}
      <Link
        href={`/three-body/${orbit.slug}`}
        aria-label={`${t("galleryExplore")}: ${orbit.name}`}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c7baff]"
        onNavigate={onNavigate}
      />

      {/* Animación */}
      <div className="[.lab-three-body-gallery-gallery_&]:relative [.lab-three-body-gallery-gallery_&]:grid [.lab-three-body-gallery-gallery_&]:place-items-center [.lab-three-body-gallery-gallery_&]:min-w-0 [.lab-three-body-gallery-gallery_&]:[aspect-ratio:420_/_263] [.lab-three-body-gallery-gallery_&]:[border-bottom:1px_solid_#272c40] [.lab-three-body-gallery-gallery_&]:[border-radius:1rem_1rem_0_0] [.lab-three-body-gallery-gallery_&]:[background-color:#0c1120] [.lab-three-body-gallery-gallery_&]:[background-image:linear-gradient(#ffffff04_1px,_transparent_1px),_linear-gradient(90deg,_#ffffff04_1px,_transparent_1px)] [.lab-three-body-gallery-gallery_&]:[background-size:28px_28px]">
        <span className="[.lab-three-body-gallery-gallery_&]:absolute [.lab-three-body-gallery-gallery_&]:[top:0.875rem] [.lab-three-body-gallery-gallery_&]:[left:1rem] [.lab-three-body-gallery-gallery_&]:[color:#b8b0d6] [.lab-three-body-gallery-gallery_&]:[font-size:0.75rem] [.lab-three-body-gallery-gallery_&]:[line-height:1.5] [.lab-three-body-gallery-gallery_&]:[letter-spacing:0.12em]">
          {String(originalIndex).padStart(2, "0")}
        </span>

        <OrbitAnimation
          data={data}
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
          onClick={() => onToggleOrbit(orbit.slug)}
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
};
