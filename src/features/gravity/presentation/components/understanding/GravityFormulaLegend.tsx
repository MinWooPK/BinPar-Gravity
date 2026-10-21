import { useFormatter, useTranslations } from "next-intl";
import { GRAVITATIONAL_CONSTANT } from "../../../domain/gravitation";
import { useGravityFormulaInteraction } from "./GravityFormulaInteraction";

// Muestra la constante gravitatoria G, su valor y su explicación,
// permitiendo resaltarla al interactuar con la fórmula.
export const GravityFormulaLegend = ({ id }: { id: string }) => {
  // Obtiene las traducciones de la sección de gravedad.
  const t = useTranslations("Gravity");

  // Formatea los valores numéricos según el idioma.
  const format = useFormatter();

  // Obtiene el estado y las funciones de interacción de la fórmula.
  const { active, selected, hover, focus, select } =
    useGravityFormulaInteraction();

  // Separa la constante gravitatoria en coeficiente y exponente.
  const [coefficient, exponent] =
    GRAVITATIONAL_CONSTANT.toExponential(5).split("e");

  return (
    <div
      className="flex items-center [gap:12px] min-w-0 [margin-top:6px] [padding:8px] [border:1px_solid_#aa97ff45] [border-radius:10px] bg-lab-surface [transition:border-color_140ms,_background_140ms] in-[#gravity-understanding]:mt-0.5 in-[#gravity-understanding]:px-2 in-[#gravity-understanding]:py-1 in-[#gravity-understanding]:gap-2 [&[data-active=true]]:[border-color:#c4b5fd] [&[data-active=true]]:[background:#aa97ff15] [&[data-active=true]_h4]:[color:#e4d7ff] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none]"
      data-formula-definition="constant"
      data-active={active === "constant"}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") hover("constant");
      }}
      onPointerLeave={() => hover(null)}
      onFocus={() => focus("constant")}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) focus(null);
      }}
    >
      <button
        type="button"
        className="inline-flex shrink-0 items-center justify-center [width:44px] [min-height:44px] [padding:4px] [border:1px_solid_#aa97ff60] [border-radius:8px] [background:#aa97ff12] [color:#c4b5fd] [font-family:Georgia,_serif] [font-size:1.5rem] [line-height:1] cursor-pointer"
        aria-label={`${t("formulaConstantTitle")}. ${t("formulaConstantFixed")}`}
        aria-describedby={`${id}-constant-value ${id}-constant-description`}
        aria-pressed={selected === "constant"}
        onClick={() => select(selected === "constant" ? null : "constant")}
      >
        G
      </button>

      <div className="flex flex-wrap items-baseline [gap:2px_10px] min-w-0 [&_h4]:[margin:0] [&_h4]:[color:#d6dbea] [&_h4]:[font-size:0.875rem] [&_h4]:[font-weight:600] [&_h4]:[line-height:1.3] [&_h4]:[transition:color_140ms] [@media_(prefers-reduced-motion:_reduce)]:[&_h4]:[transition:none]">
        <h4>{t("formulaConstantTitle")}</h4>

        <p
          id={`${id}-constant-value`}
          className="m-0 [color:#e4d7ff] [font-size:1rem] font-semibold [line-height:1.7] in-[#gravity-understanding]:leading-[1.4] [&_sup]:[position:static] [&_sup]:[vertical-align:super] [&_sup]:[font-size:0.7em] [&_sup]:[line-height:0] [&_span]:[display:inline-block] [&_span]:[white-space:nowrap]"
        >
          {t.rich("formulaConstantValue", {
            value: format.number(Number(coefficient), {
              minimumFractionDigits: 5,
              maximumFractionDigits: 5,
              useGrouping: false,
            }),
            exponent: Number(exponent),
            power: (chunks) => <sup>{chunks}</sup>,
            unit: (chunks) => <span>{chunks}</span>,
          })}
        </p>

        <p
          id={`${id}-constant-description`}
          className="[flex-basis:100%] m-0 [color:#aeb8cb] [font-size:.8125rem] [line-height:1.45]"
        >
          {t("formulaConstantDescription")}
        </p>
      </div>
    </div>
  );
};
