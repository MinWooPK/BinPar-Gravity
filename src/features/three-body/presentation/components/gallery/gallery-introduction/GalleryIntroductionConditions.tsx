import { useTranslations } from "next-intl";

// Parámetros físicos compartidos por las seis soluciones del catálogo.
const commonConditions = [
  { key: "masses", value: "1 · 1 · 1" },
  { key: "gravity", value: "G = 1" },
  { key: "dimensions", value: "2D" },
] as const;

// Distingue los parámetros comunes de las condiciones iniciales específicas.
export const GalleryIntroductionConditions = () => {
  const t = useTranslations("ThreeBody.galleryGuide");

  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-[#303b59] bg-[#131724] p-4">
      <h3 className="text-lg font-semibold text-slate-100">
        2. {t("parametersTitle")}
      </h3>

      {/* Condiciones comunes. */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-[#b9a8ff]">
          {t("sharedConditions")}
        </h4>

        <div className="grid grid-cols-3 gap-2">
          {commonConditions.map((condition) => (
            <div
              key={condition.key}
              className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg border border-[#48516b] bg-[#1b2335] p-3 text-center"
            >
              <span className="text-xs text-slate-400">{t(condition.key)}</span>
              <span className="text-sm font-bold text-[#d3c5ff]">
                {condition.value}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs leading-5 text-slate-400">{t("modelNote")}</p>
      </div>

      <div className="border-t border-[#30364b]" />

      {/* Condiciones específicas de cada solución. */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-[#a7f3e5]">
          {t("specificConditions")}
        </h4>

        <div className="rounded-xl border border-[#315c5b] bg-[#102126] p-4">
          <h5 className="text-sm font-semibold text-[#a7f3e5]">
            {t("positionTitle")}
          </h5>
          <p className="mt-1 text-sm leading-6 text-slate-200">
            {t("positionDescription")}
          </p>
        </div>

        <div className="rounded-xl border border-[#315c5b] bg-[#102126] p-4">
          <h5 className="text-sm font-semibold text-[#a7f3e5]">
            {t("velocityTitle")}
          </h5>
          <p className="mt-1 text-sm leading-6 text-slate-200">
            {t("velocityDescription")}
          </p>
        </div>
      </div>
    </div>
  );
};
