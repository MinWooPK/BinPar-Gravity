"use client";

import { MathText } from "@/components/ui/MathText";
import { useId } from "react";
import { useFormatter, useTranslations } from "next-intl";

import { GRAVITATIONAL_CONSTANT } from "../../../domain/gravitation";

// Variables y unidades de la fórmula.
const variables = [
  { symbol: "F", meaning: "formulaForceLabel", unit: "N" },
  { symbol: "G", meaning: "scienceConstantLabel", unit: "N·m²/kg²" },
  { symbol: "m₁", meaning: "scienceFirstMassMeaning", unit: "kg" },
  { symbol: "m₂", meaning: "scienceSecondMassMeaning", unit: "kg" },
  { symbol: "r", meaning: "scienceDistanceMeaning", unit: "m" },
] as const;

// Muestra la fórmula de Newton y sus unidades.
export const GravityScienceCard = () => {
  const t = useTranslations("Gravity");
  const format = useFormatter();
  const id = useId();

  // Prepara el valor de la constante gravitatoria.
  const [coefficient, exponent] =
    GRAVITATIONAL_CONSTANT.toExponential(5).split("e");

  const constantValue = format.number(Number(coefficient), {
    minimumFractionDigits: 5,
    maximumFractionDigits: 5,
    useGrouping: false,
  });

  return (
    <section
      aria-labelledby={`${id}-heading`}
      data-discovery-science
      className="grid min-w-0 content-between gap-2 rounded-[14px] border border-lab-line 
      bg-[linear-gradient(145deg,#131724,#0e121d)] p-4 text-sm leading-[1.45] text-[#b2bad0] wrap-anywhere max-[520px]:p-3.5"
    >
      <h3
        id={`${id}-heading`}
        className="text-lg leading-[1.35] font-semibold text-[#f2f2fa]"
      >
        {t("title")}
      </h3>

      {/* Fórmula de gravitación universal. */}
      <div className="grid min-w-0 items-center gap-2 min-[1024px]:grid-cols-[auto_minmax(0,1fr)]">
        <div
          role="img"
          aria-label={t("formulaSpoken")}
          className="flex justify-center pt-px pb-1.75 font-[Georgia,serif] text-[2rem] leading-[1.1] text-[#e4dfff]"
        >
          <span
            aria-hidden="true"
            className="inline-flex items-center gap-2.25"
          >
            <span>F</span>
            <span className="text-[.7em] text-[#a99bbf]">=</span>
            <span>G</span>
            <span className="text-[.7em] text-[#a99bbf]">·</span>

            <span className="inline-flex min-w-0 flex-col text-center">
              <span className="border-b border-[#a99bbf] px-1.25 py-0.5">
                m<sub className="static align-sub text-[0.65em] leading-0">1</sub>{" "}
                <span className="text-[.7em] text-[#a99bbf]">×</span>{" "}
                m<sub className="static align-sub text-[0.65em] leading-0">2</sub>
              </span>

              <span className="px-1.25 py-0.5">
                r
                <sup className="static align-super text-[.55em] leading-0">
                  2
                </sup>
              </span>
            </span>
          </span>
        </div>

        <p>{t("scienceLawDescription")}</p>
      </div>

      {/* Constante gravitatoria. */}
      <div className="min-w-0 border-t border-[#30364b] pt-2">
        <div className="mb-1.25 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.75 max-[520px]:gap-x-2">
          <h4 className="text-sm font-semibold text-[#d6dbea]">
            {t("scienceConstantLabel")}
          </h4>

          <p className="text-base leading-[1.7] font-medium text-[#d8c9ff]">
            <span className="sr-only">
              {t("scienceConstantSpoken", {
                value: constantValue,
                exponent: Number(exponent),
              })}
            </span>

            <span aria-hidden="true">
              {t.rich("formulaConstantValue", {
                value: constantValue,
                exponent: Number(exponent),
                power: (chunks) => (
                  <sup className="static align-super text-[.7em] leading-0">
                    {chunks}
                  </sup>
                ),
                unit: (chunks) => (
                  <span className="inline-block whitespace-nowrap wrap-normal">
                    {chunks}
                  </span>
                ),
              })}
            </span>
          </p>
        </div>

        <p>{t("scienceConstantDescription")}</p>
      </div>

      {/* Tabla de variables y unidades. */}
      <table className="w-full border-collapse text-sm leading-[1.4]">
        <caption className="sr-only">{t("scienceVariablesCaption")}</caption>

        <thead>
          <tr className="border-b border-[#30364b]">
            <th
              scope="col"
              className="w-[1%] py-1 pr-1.5 pl-0 text-left align-middle font-medium whitespace-nowrap text-[#b9c4d8] max-[520px]:pr-1"
            >
              {t("scienceSymbolColumn")}
            </th>

            <th
              scope="col"
              className="px-1.5 py-1 text-left align-middle font-medium whitespace-nowrap text-[#b9c4d8] max-[520px]:px-1"
            >
              {t("scienceMeaningColumn")}
            </th>

            <th
              scope="col"
              className="w-[1%] py-1 pr-0 pl-1.5 text-left align-middle font-medium whitespace-nowrap text-[#b9c4d8] max-[520px]:pl-1"
            >
              {t("scienceUnitColumn")}
            </th>
          </tr>
        </thead>

        <tbody>
          {variables.map((variable) => (
            <tr
              key={variable.symbol}
              className="border-b border-[#30364b] last:border-b-0"
            >
              <th
                scope="row"
                className="w-[1%] py-1 pr-1.5 pl-0 text-left align-middle font-[Georgia,serif] text-base font-normal whitespace-nowrap text-[#d8c9ff] max-[520px]:pr-1"
              >
                <MathText>{variable.symbol}</MathText>
              </th>

              <td className="px-1.5 py-1 text-left align-middle max-[520px]:px-1">
                {t(variable.meaning)}
              </td>

              <td className="w-[1%] py-1 pr-0 pl-1.5 text-left align-middle whitespace-nowrap text-[#bcebe3] wrap-normal max-[520px]:pl-1">
                {variable.unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Explicación de las unidades. */}
      <div className="border-t border-[#30364b] pt-2">
        <p>
          {t.rich("scienceUnitsExplanation", {
            highlight: (chunks) => (
              <strong className="font-semibold text-[#d6dbea]">{chunks}</strong>
            ),
          })}
        </p>

        <p className="mt-1 text-[#bcebe3] tabular-nums">
          <span className="sr-only">{t("scienceNewtonIdentity")}</span>
          <span aria-hidden="true">1 N = 1 kg·m/s²</span>
        </p>
      </div>
    </section>
  );
};
