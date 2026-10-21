import { useTranslations } from "next-intl";

import { Highlight } from "./Highlight";

type Props = {
  onExplore: () => void;
};

// Presenta la introducción y el botón que abre la galería de órbitas.
export const GalleryIntroductionHeader = ({ onExplore }: Props) => {
  const t = useTranslations("ThreeBody.galleryGuide");

  return (
    <header className="space-y-0">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b9a8ff]">
        {t("title")}
      </p>

      <div className="flex gap-5 items-center justify-between">
        <p className=" text-sm leading-7 text-slate-300 sm:text-base">
          {t.rich("intro", {
            highlight: (children) => <Highlight>{children}</Highlight>,
          })}
        </p>

        {/* Conserva la navegación controlada por el componente padre. */}
        <div className="flex justify-center py-2">
          <button
            type="button"
            onClick={onExplore}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#aa97ff] px-4 py-0 text-center font-semibold text-[#101122] transition-colors hover:bg-[#c4b5fd] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c4b5fd]"
          >
            {t("explore")}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </header>
  );
};
