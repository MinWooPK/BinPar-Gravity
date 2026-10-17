import { useTranslations } from "next-intl";
import type { GravityVariable } from "../domain/gravitation";
import styles from "./GravityIntroduction.module.css";

const definitions = [
  {
    key: "force",
    symbol: "F",
    label: "legendForce",
    detail: "legendForceUnit",
  },
  {
    key: "constant",
    symbol: "G",
    label: "legendConstant",
    detail: "legendConstantValue",
  },
  {
    key: "masses",
    symbol: "m₁, m₂",
    label: "legendMasses",
    detail: "legendMassUnit",
  },
  {
    key: "distance",
    symbol: "r",
    label: "legendDistance",
    detail: "legendDistanceUnit",
  },
] as const;
export type FormulaTerm = (typeof definitions)[number]["key"];

type FormulaLegendProps = {
  id: string;
  active: FormulaTerm | null;
  onHover: (term: FormulaTerm | null) => void;
  onFocus: (term: FormulaTerm | null) => void;
  onSelect: (term: FormulaTerm) => void;
  onEdit: (variable: GravityVariable) => void;
};

export const GravityFormulaLegend = ({ id, active, onHover, onFocus, onSelect, onEdit }: FormulaLegendProps) => {
  const t = useTranslations("Gravity");
  return (
    <dl className={styles.legend}>
      {definitions.map(({ key, symbol, label, detail }) => (
        <div
          key={key}
          data-active={active === key}
          className={styles.interactiveDefinition}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") onHover(key);
          }}
          onPointerLeave={() => onHover(null)}
        >
          <dt className={styles.definitionHeading}>
            <button
              type="button"
              className={styles.definitionAction}
              aria-label={
                key === "constant"
                  ? `${t(label)}. ${t("formulaConstantFixed")}`
                  : `${t("formulaEditHint")}: ${t(label)}`
              }
              aria-describedby={`${id}-${key}`}
              onClick={() =>
                key === "constant"
                  ? onSelect(key)
                  : onEdit(key === "masses" ? "mass1" : key)
              }
              onFocus={() => onFocus(key)}
              onBlur={() => onFocus(null)}
            />
            {key === "masses" ? (
              <span className={styles.massEditActions}>
                {(["mass1", "mass2"] as const).map((mass) => (
                  <button
                    key={mass}
                    type="button"
                    aria-label={t("editFormulaVariable", {
                      symbol: mass === "mass1" ? "m₁" : "m₂",
                      unit: "kg",
                    })}
                    onClick={() => onEdit(mass)}
                    onFocus={() => onFocus("masses")}
                    onBlur={() => onFocus(null)}
                  >
                    {mass === "mass1" ? "m₁" : "m₂"}
                  </button>
                ))}
              </span>
            ) : (
              <span className={styles.definitionSymbol}>{symbol}</span>
            )}
          </dt>
          <dd id={`${id}-${key}`}>
            {key === "constant"
              ? t.rich("legendConstantHighlighted", {
                  highlight: (chunks) => (
                    <strong className={styles.definitionHighlight}>
                      {chunks}
                    </strong>
                  ),
                })
              : t(label)}
            <span>
              {t.rich(`${detail}Highlighted`, {
                highlight: (chunks) => (
                  <strong className={styles.definitionHighlight}>
                    {chunks}
                  </strong>
                ),
              })}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
};
