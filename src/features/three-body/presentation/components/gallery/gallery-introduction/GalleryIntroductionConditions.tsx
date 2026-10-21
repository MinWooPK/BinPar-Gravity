import { useTranslations } from "next-intl";

// Parámetros comunes de las seis órbitas.
const commonConditions = [
  { key: "masses", value: "1 · 1 · 1" },
  { key: "gravity", value: "G = 1" },
  { key: "dimensions", value: "2D" },
] as const;

// Muestra las condiciones físicas de las órbitas.
export const GalleryIntroductionConditions = () => {
  const t = useTranslations("ThreeBody.galleryGuide");

  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-[#303b59] bg-[#131724] p-4">
      <h3 className="text-lg font-semibold text-slate-100">
        2. {t("parametersTitle")}
      </h3>

      {/* Parámetros comunes. */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-[#b9a8ff]">
          {t("sharedConditions")}
        </h4>

        <div className="grid grid-cols-3 gap-2">
          {commonConditions.map(({ key, value }) => (
            <div
              key={key}
              className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg border border-[#48516b] bg-[#1b2335] p-3 text-center"
            >
              <span className="text-xs text-slate-400">{t(key)}</span>
              <span className="text-sm font-bold text-[#d3c5ff]">{value}</span>
            </div>
          ))}
        </div>

        <p className="text-xs leading-5 text-slate-400">{t("modelNote")}</p>
      </div>

      <div className="border-t border-[#30364b]" />

      {/* Posiciones y velocidades iniciales. */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-[#a7f3e5]">
          {t("specificConditions")}
        </h4>

        {(["position", "velocity"] as const).map((condition) => (
          <div
            key={condition}
            className="rounded-xl border border-[#315c5b] bg-[#102126] p-4"
          >
            <h5 className="text-sm font-semibold text-[#a7f3e5]">
              {t(`${condition}Title`)}
            </h5>

            <p className="mt-1 text-sm leading-6 text-slate-200">
              {t(`${condition}Description`)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
