import { useTranslations } from "next-intl";

import { Highlight } from "./Highlight";

type Props = {
  onExplore: () => void;
};

// Muestra la introducción y el acceso a la galería.
export const GalleryIntroductionHeader = ({ onExplore }: Props) => {
  const t = useTranslations("ThreeBody.galleryGuide");

  return (
    <header>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b9a8ff]">
        {t("title")}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-5">
        <p className="min-w-0 flex-1 text-sm leading-7 text-slate-300 sm:text-base">
          {t.rich("intro", {
            highlight: (children) => <Highlight>{children}</Highlight>,
          })}
        </p>

        <div className="flex justify-center py-2">
          <button
            type="button"
            onClick={onExplore}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#aa97ff] px-4 text-center font-semibold text-[#101122] transition-colors hover:bg-[#c4b5fd] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c4b5fd]"
          >
            {t("explore")}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </header>
  );
};
