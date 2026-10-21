"use client";

import { TriangleAlert } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import type { Dispatch, RefObject, SetStateAction } from "react";
import { laboratoryLimits } from "../../../../domain/gravitation";
import { useGravityParameters } from "../../../providers/GravityParametersProvider";
import { fields } from "./formulaFields";

type Props = {
  id: string;
  rangeError: boolean;
  showWarning: boolean;
  setShowWarning: Dispatch<SetStateAction<boolean>>;
  resetButtonRef: RefObject<HTMLButtonElement | null>;
  onReset: () => void;
};

// Reúne las acciones de restablecimiento y el aviso de límites del laboratorio.
export const GravityFormulaToolbar = ({
  id,
  rangeError,
  showWarning,
  setShowWarning,
  resetButtonRef,
  onReset,
}: Props) => {
  const t = useTranslations("Gravity");
  const format = useFormatter();
  const { parameters } = useGravityParameters();
  const formatValue = (value: number) =>
    format.number(value, {
      maximumSignificantDigits: 6,
      ...(value < 0.001 ? { notation: "scientific" } : {}),
    });

  return (
    <div className="flex flex-wrap items-center [gap:4px] min-w-0 gap-2 relative">
          {/* BOTÓN DE WARNING */}
          {rangeError && (
            <button
              type="button"
              onClick={() => setShowWarning((prev) => !prev)}
              aria-label={t("outsideLabRange")}
              aria-expanded={showWarning}
              aria-controls={`${id}-range-warning`}
              title={t("outsideLabRange")}
              className={`inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg border px-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 ${
                showWarning
                  ? "border-amber-400 bg-amber-500/20 text-amber-200"
                  : "border-amber-400/50 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
              }`}
            >
              <TriangleAlert size={19} strokeWidth={2} aria-hidden="true" />
            </button>
          )}

          {/* RESTABLECER */}
          <button
            ref={resetButtonRef}
            type="button"
            onClick={() => {
              setShowWarning(false);
              onReset();
            }}
            aria-label={t("reset")}
            aria-describedby={`${id}-reset-hint`}
            className="[min-height:44px] [padding:8px_12px] [border:1px_solid_#544776] [border-radius:8px] [background:#aa97ff12] [color:#d0c1ff] [font-size:.875rem] cursor-pointer [&:hover]:[background:#aa97ff25]"
          >
            {t("resetShort")}
          </button>

          {/* MENSAJE FLOTANTE ABSOLUTE */}
          {rangeError && showWarning && (
            <section
              id={`${id}-range-warning`}
              data-formula-range-warning
              aria-labelledby={`${id}-range-heading`}
              className="mt-3 min-w-0 space-y-3 rounded-xl border border-amber-400/60 bg-[#24191d] p-4 text-sm leading-relaxed text-amber-50/90 [overflow-wrap:anywhere] [&]:[animation:lab-gravity-formula-range-warning-appear_220ms_ease-out] [@media_(prefers-reduced-motion:_reduce)]:[&]:[animation:none] absolute! top-full! right-0 z-50 mt-2! w-[min(380px,calc(100vw-24px))] max-h-[70dvh] overflow-y-auto shadow-2xl shadow-black/60"
            >
              {/* ENCABEZADO */}
              <div className="flex items-start gap-2">
                <TriangleAlert
                  size={22}
                  strokeWidth={2}
                  className="mt-0.5 shrink-0 text-amber-300"
                  aria-hidden="true"
                />

                <div className="min-w-0 space-y-2">
                  <h4
                    id={`${id}-range-heading`}
                    className="text-base font-semibold leading-snug text-amber-100 sm:text-lg"
                  >
                    {t("outsideLabRange")}
                  </h4>

                  <p>{t("outsideLabRangeDescription")}</p>
                </div>
              </div>

              {/* LÍMITES */}
              <ul className="list-inside list-disc space-y-1 font-medium text-amber-100">
                <li>
                  {t("outsideLabMassLimits", {
                    min: format.number(laboratoryLimits.mass1.min),
                    max: format.number(laboratoryLimits.mass1.max),
                  })}
                </li>

                <li>
                  {t("outsideLabDistanceLimits", {
                    min: format.number(laboratoryLimits.distance.min),
                    max: format.number(laboratoryLimits.distance.max),
                  })}
                </li>
              </ul>

              {/* CONSECUENCIAS */}
              <p className="border-t border-amber-300/20 pt-3">
                {t("outsideLabRangeConsequence")}
              </p>

              {/* VALORES QUE CONSERVA EXPERIMENTA */}
              <div className="rounded-lg bg-slate-950/30 p-3">
                <p className="mb-2 font-medium text-amber-100">
                  {t("outsideLabCurrentValues")}
                </p>

                <dl className="flex flex-wrap gap-x-5 gap-y-2 tabular-nums">
                  {fields.map(
                    (field) =>
                      field.key !== "force" && (
                        <div key={field.key} className="min-w-0">
                          <dt className="text-xs text-amber-100/80">
                            {t(field.label)}
                          </dt>

                          <dd className="font-semibold text-amber-50">
                            {formatValue(parameters[field.key])} {field.unit}
                          </dd>
                        </div>
                      ),
                  )}
                </dl>
              </div>
            </section>
          )}
    </div>
  );
};
