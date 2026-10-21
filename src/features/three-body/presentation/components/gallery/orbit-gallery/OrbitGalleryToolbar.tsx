"use client";

import { useTranslations } from "next-intl";
import type { OrbitCategoryFilter } from "../../../../types/gallery.types";
import { categoryFilters, categoryNames } from "./orbit-gallery.constants";

type OrbitGalleryToolbarProps = {
  categoryFilter: OrbitCategoryFilter;
  resultCount: number;
  firstVisible: number;
  lastVisible: number;
  currentPage: number;
  totalPages: number;
  onChangeCategory: (category: OrbitCategoryFilter) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

// Presenta filtros y paginación accesibles para las seis soluciones orbitales.
export const OrbitGalleryToolbar = ({
  categoryFilter,
  resultCount,
  firstVisible,
  lastVisible,
  currentPage,
  totalPages,
  onChangeCategory,
  onPreviousPage,
  onNextPage,
}: OrbitGalleryToolbarProps) => {
  const t = useTranslations("ThreeBody");

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      {/* Tags de categoría */}
      <div
        role="group"
        aria-label={t("galleryFilterLabel")}
        className="flex flex-wrap items-center gap-2"
      >
        {categoryFilters.map((category) => {
          const selected = categoryFilter === category;

          const label =
            category === "all"
              ? t("galleryFilterAll")
              : t(categoryNames[category]);

          return (
            <button
              key={category}
              type="button"
              aria-pressed={selected}
              onClick={() => onChangeCategory(category)}
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
          onClick={onPreviousPage}
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
          {resultCount === 0
            ? "0 / 0"
            : `${firstVisible + 1}–${lastVisible} / ${resultCount}`}
        </span>

        <button
          type="button"
          aria-label={t("galleryGuide.next")}
          title={t("galleryGuide.next")}
          aria-controls="orbit-gallery-carousel"
          disabled={currentPage >= totalPages - 1}
          onClick={onNextPage}
          className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-[#60517f] bg-[#171526] text-[#d8cbff] transition-colors hover:bg-[#302748] disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c7baff]"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
};
