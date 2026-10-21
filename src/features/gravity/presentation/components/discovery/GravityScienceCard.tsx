"use client";

import { useId } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { GRAVITATIONAL_CONSTANT } from "../../../domain/gravitation";

// Define los símbolos, significados y unidades de las variables gravitatorias.
const variables = [
  { symbol: "F", meaning: "formulaForceLabel", unit: "N" },
  { symbol: "G", meaning: "scienceConstantLabel", unit: "N·m²/kg²" },
  { symbol: "m₁", meaning: "scienceFirstMassMeaning", unit: "kg" },
  { symbol: "m₂", meaning: "scienceSecondMassMeaning", unit: "kg" },
  { symbol: "r", meaning: "scienceDistanceMeaning", unit: "m" },
] as const;

// Muestra la información científica de la gravedad:
// ley de Newton, constante gravitatoria, variables y unidades.
export const GravityScienceCard = () => {
  // Obtiene las traducciones del contenido científico.
  const t = useTranslations("Gravity");

  // Permite formatear los valores numéricos según el idioma.
  const format = useFormatter();

  // Genera identificadores únicos para los elementos accesibles.
  const id = useId();

  // Separa la constante gravitatoria en coeficiente y exponente.
  const [coefficient, exponent] =
    GRAVITATIONAL_CONSTANT.toExponential(5).split("e");

  // Formatea el coeficiente de la constante con cinco decimales.
  const constantValue = format.number(Number(coefficient), {
    minimumFractionDigits: 5,
    maximumFractionDigits: 5,
    useGrouping: false,
  });

  return (
    <section
      className="grid min-w-0 [align-content:space-between] [gap:8px] [padding:16px] border border-solid border-lab-line [border-radius:14px] [background:linear-gradient(145deg,_#131724,_#0e121d)] [color:#b2bad0] [font-size:.875rem] [line-height:1.45] [overflow-wrap:anywhere] [@media(max-width:520px)]:[padding:14px] [&_h3]:[margin:0] [&_h3]:[color:#f2f2fa] [&_h3]:[font-size:1.125rem] [&_h3]:[font-weight:600] [&_h3]:[line-height:1.35] [&_h4]:[margin:0] [&_h4]:[color:#d6dbea] [&_h4]:[font-size:0.875rem] [&_h4]:[font-weight:600] [&_p]:[margin:0]"
      aria-labelledby={`${id}-heading`}
      data-discovery-science
    >
      <h3 id={`${id}-heading`}>{t("title")}</h3>

      <div className="grid min-w-0 items-center gap-2 min-[1024px]:grid-cols-[auto_minmax(0,1fr)]">
        <div
          className="flex justify-center [padding-block:1px_7px] [color:#e4dfff] [font-family:Georgia,_serif] [font-size:2rem] [line-height:1.1]"
          role="img"
          aria-label={t("formulaSpoken")}
        >
          <span aria-hidden="true" className="inline-flex items-center [gap:9px]">
            <span>F</span>
            <span className="[color:#a99bbf] [font-size:.7em]">=</span>
            <span>G</span>
            <span className="[color:#a99bbf] [font-size:.7em]">·</span>
            <span className="inline-flex flex-col min-w-0 text-center [&_>_span]:[padding:2px_5px] [&_>_span:first-child]:[border-bottom:1px_solid_#a99bbf] [&_sup]:[position:static] [&_sup]:[vertical-align:super] [&_sup]:[font-size:0.55em] [&_sup]:[line-height:0]">
              <span>
                m₁ <span className="[color:#a99bbf] [font-size:.7em]">×</span> m₂
              </span>
              <span>
                r<sup>2</sup>
              </span>
            </span>
          </span>
        </div>
        <p>{t("scienceLawDescription")}</p>
      </div>

      <div className="min-w-0 [padding-top:8px] [border-top:1px_solid_#30364b]">
        <div className="flex items-baseline justify-between flex-wrap [gap:3px_12px] [margin-bottom:5px] [@media(max-width:520px)]:[gap:3px_8px]">
          <h4>{t("scienceConstantLabel")}</h4>
          <p className="[color:#d8c9ff] [font-size:1rem] font-medium [line-height:1.7] [&_sup]:[position:static] [&_sup]:[vertical-align:super] [&_sup]:[font-size:0.7em] [&_sup]:[line-height:0] [&_.lab-gravity-sciencecard-unit]:[display:inline-block]">
            <span className="absolute [width:1px] [height:1px] p-0 [margin:-1px] overflow-hidden [clip:rect(0,_0,_0,_0)] whitespace-nowrap [border:0]">
              {t("scienceConstantSpoken", {
                value: constantValue,
                exponent: Number(exponent),
              })}
            </span>
            <span aria-hidden="true">
              {t.rich("formulaConstantValue", {
                value: constantValue,
                exponent: Number(exponent),
                power: (chunks) => <sup>{chunks}</sup>,
                unit: (chunks) => <span className="lab-gravity-sciencecard-unit whitespace-nowrap [overflow-wrap:normal]">{chunks}</span>,
              })}
            </span>
          </p>
        </div>
        <p>{t("scienceConstantDescription")}</p>
      </div>

      <table className="w-full border-collapse [font-size:.875rem] [line-height:1.4] [&_th]:[padding:4px_6px] [&_th]:[border-bottom:1px_solid_#30364b] [&_th]:[text-align:left] [&_th]:[vertical-align:middle] [&_td]:[padding:4px_6px] [&_td]:[border-bottom:1px_solid_#30364b] [&_td]:[text-align:left] [&_td]:[vertical-align:middle] [&_thead_th]:[color:#b9c4d8] [&_thead_th]:[font-weight:500] [&_thead_th]:[white-space:nowrap] [&_th:first-child]:[width:1%] [&_th:first-child]:[padding-left:0] [&_th:last-child]:[width:1%] [&_th:last-child]:[padding-right:0] [&_td:last-child]:[width:1%] [&_td:last-child]:[padding-right:0] [&_tbody_th]:[color:#d8c9ff] [&_tbody_th]:[font-family:Georgia,_serif] [&_tbody_th]:[font-size:1rem] [&_tbody_th]:[font-weight:400] [&_tbody_th]:[white-space:nowrap] [&_td:last-child]:[color:#bcebe3] [&_tbody_tr:last-child_th]:[border-bottom:0] [&_tbody_tr:last-child_td]:[border-bottom:0] [@media_(max-width:_520px)]:[&_th]:[padding-inline:4px] [@media_(max-width:_520px)]:[&_td]:[padding-inline:4px]">
        <caption className="absolute [width:1px] [height:1px] p-0 [margin:-1px] overflow-hidden [clip:rect(0,_0,_0,_0)] whitespace-nowrap [border:0]">
          {t("scienceVariablesCaption")}
        </caption>
        <thead>
          <tr>
            <th scope="col">{t("scienceSymbolColumn")}</th>
            <th scope="col">{t("scienceMeaningColumn")}</th>
            <th scope="col">{t("scienceUnitColumn")}</th>
          </tr>
        </thead>
        <tbody>
          {variables.map((variable) => (
            <tr key={variable.symbol}>
              <th scope="row">{variable.symbol}</th>
              <td>{t(variable.meaning)}</td>
              <td className="lab-gravity-sciencecard-unit whitespace-nowrap [overflow-wrap:normal]">{variable.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="[padding-top:8px] [border-top:1px_solid_#30364b] [&_strong]:[color:#d6dbea] [&_strong]:[font-weight:600] [&_.lab-gravity-sciencecard-identity]:[margin-top:4px] [&_.lab-gravity-sciencecard-identity]:[color:#bcebe3] [&_.lab-gravity-sciencecard-identity]:[font-variant-numeric:tabular-nums]">
        <p>
          {t.rich("scienceUnitsExplanation", {
            highlight: (chunks) => <strong>{chunks}</strong>,
          })}
        </p>
        <p className="lab-gravity-sciencecard-identity">
          <span className="absolute [width:1px] [height:1px] p-0 [margin:-1px] overflow-hidden [clip:rect(0,_0,_0,_0)] whitespace-nowrap [border:0]">{t("scienceNewtonIdentity")}</span>
          <span aria-hidden="true">1 N = 1 kg·m/s²</span>
        </p>
      </div>
    </section>
  );
};
