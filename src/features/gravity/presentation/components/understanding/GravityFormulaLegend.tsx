import { useFormatter, useTranslations } from "next-intl";
import { GRAVITATIONAL_CONSTANT } from "../../../domain/gravitation";
import { useGravityFormulaInteraction } from "./GravityFormulaInteraction";
import { gravityFormulaStyles as styles } from "./GravityFormula.styles";

export const GravityFormulaLegend = ({ id }: { id: string }) => {
  const t = useTranslations("Gravity");
  const format = useFormatter();
  const { active, selected, hover, focus, select } = useGravityFormulaInteraction();
  const [coefficient, exponent] = GRAVITATIONAL_CONSTANT.toExponential(5).split("e");

  return (
    <div
      className={styles.constant}
      data-formula-definition="constant"
      data-active={active === "constant"}
      onPointerEnter={(event) => { if (event.pointerType === "mouse") hover("constant"); }}
      onPointerLeave={() => hover(null)}
      onFocus={() => focus("constant")}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) focus(null); }}
    >
      <button
        type="button"
        className={styles.constantSymbol}
        aria-label={`${t("formulaConstantTitle")}. ${t("formulaConstantFixed")}`}
        aria-describedby={`${id}-constant-value ${id}-constant-description`}
        aria-pressed={selected === "constant"}
        onClick={() => select(selected === "constant" ? null : "constant")}
      >G</button>
      <div className={styles.constantContent}>
        <h4>{t("formulaConstantTitle")}</h4>
        <p id={`${id}-constant-value`} className={styles.constantValue}>
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
        <p id={`${id}-constant-description`} className={styles.constantDescription}>
          {t("formulaConstantDescription")}
        </p>
      </div>
    </div>
  );
};
