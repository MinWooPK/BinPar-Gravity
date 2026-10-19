"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode, RefObject } from "react";
import { useFormatter, useTranslations } from "next-intl";
import type { GravityVariable } from "../../../types/gravity.types";
import { parseFormulaValue } from "../../../application/parseFormulaValue";
import { isInLaboratoryRange } from "../../../application/formulaInput";
import { laboratoryLimits } from "../../../domain/gravitation";
import {
  useGravityControls,
  useGravityFormulaDraft,
} from "../../providers/GravityParametersProvider";
import { useGravityFormulaInteraction } from "./GravityFormulaInteraction";
import type { FormulaTerm } from "../../../types/formula.types";
import { GravityFormulaLegend } from "./GravityFormulaLegend";
import { gravityFormulaStyles as styles } from "./GravityFormula.styles";

const fields = [
  {
    key: "force",
    symbol: "F",
    unit: "N",
    label: "formulaForceLabel",
    description: "formulaForceDescription",
  },
  {
    key: "mass1",
    symbol: "m₁",
    unit: "kg",
    label: "formulaMass1Label",
    description: "formulaMass1Description",
  },
  {
    key: "mass2",
    symbol: "m₂",
    unit: "kg",
    label: "formulaMass2Label",
    description: "formulaMass2Description",
  },
  {
    key: "distance",
    symbol: "r",
    unit: "m",
    label: "formulaDistanceLabel",
    description: "formulaDistanceDescription",
  },
] as const;

export const GravityFormula = ({
  variant = "card",
  explanation,
  footer,
}: {
  variant?: "card" | "embedded";
  explanation?: ReactNode;
  footer?: ReactNode;
}) => {
  const { resetVersion, resetParameters } = useGravityControls();
  const interaction = useGravityFormulaInteraction();
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const restoreResetFocus = useRef(false);
  useEffect(() => {
    if (restoreResetFocus.current) {
      resetButtonRef.current?.focus({ preventScroll: true });
      restoreResetFocus.current = false;
    }
  }, [resetVersion]);
  const content = (
    <GravityFormulaContent
      key={resetVersion}
      variant={footer ? "embedded" : variant}
      explanation={explanation}
      resetButtonRef={resetButtonRef}
      onReset={() => {
        interaction.select(null);
        interaction.hover(null);
        restoreResetFocus.current = true;
        resetParameters();
      }}
    />
  );
  // Reset remounts only the calculator; the conversation remains mounted.
  return footer ? <div className={styles.card}>{content}{footer}</div> : content;
};

const GravityFormulaContent = ({
  variant,
  explanation,
  resetButtonRef,
  onReset,
}: {
  explanation?: ReactNode;
  variant: "card" | "embedded";
  resetButtonRef: RefObject<HTMLButtonElement | null>;
  onReset: () => void;
}) => {
  const t = useTranslations("Gravity");
  const format = useFormatter();
  const id = useId();
  const {
    values,
    unknown,
    result,
    numericalError,
    changeValue,
    selectUnknown,
  } = useGravityFormulaDraft();
  const { active, selected, hover, focus, select } =
    useGravityFormulaInteraction();
  const inputRefs = useRef<
    Partial<Record<GravityVariable, HTMLInputElement | null>>
  >({});
  const isActive = (term: FormulaTerm) =>
    active === term ||
    (active === "masses" && (term === "mass1" || term === "mass2"));
  const currentValue = (key: GravityVariable) =>
    unknown === key ? (result?.[key] ?? null) : parseFormulaValue(values[key]);
  const formatValue = (value: number) =>
    format.number(value, {
      maximumSignificantDigits: 6,
      ...(value < 0.001 ? { notation: "scientific" } : {}),
    });
  const focusField = (key: GravityVariable) => {
    select(key);
    inputRefs.current[key]?.focus({ preventScroll: true });
  };
  const term = (key: GravityVariable) => {
    const field = fields.find((field) => field.key === key)!;
    const value = currentValue(key);
    return (
      <button
        type="button"
        data-formula-variable={key}
        data-active={isActive(key)}
        aria-pressed={selected === key}
        aria-label={`${t(field.label)} (${field.symbol})${value === null ? "" : `: ${formatValue(value)} ${field.unit}`}`}
        aria-describedby={`${id}-description-${key}`}
        className={styles.term}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") hover(key);
        }}
        onPointerLeave={() => hover(null)}
        onFocus={() => focus(key)}
        onBlur={() => focus(null)}
        onClick={() => focusField(key)}
      >
        {field.symbol}
        {key === "distance" && <sup>2</sup>}
      </button>
    );
  };
  const invalidFields = fields.filter(
    ({ key }) =>
      key !== unknown &&
      values[key].trim() !== "" &&
      parseFormulaValue(values[key]) === null,
  );
  const rangeError =
    (result !== null && !isInLaboratoryRange(result)) ||
    fields.some(({ key }) => {
      if (key === "force" || key === unknown) return false;
      const value = parseFormulaValue(values[key]);
      return (
        value !== null &&
        (value < laboratoryLimits[key].min || value > laboratoryLimits[key].max)
      );
    });
  const status =
    invalidFields.length > 0
      ? t("invalidFormulaValue", { symbol: invalidFields[0].symbol })
      : numericalError
        ? t("numericalError")
        : rangeError
          ? t("outsideLabRange")
          : result && unknown
            ? t("automaticResult", {
                symbol: fields.find(({ key }) => key === unknown)!.symbol,
                value: formatValue(result[unknown]),
                unit: fields.find(({ key }) => key === unknown)!.unit,
              })
            : "";

  return (
    <section
      className={variant === "embedded" ? styles.embedded : styles.card}
      aria-labelledby={`${id}-heading`}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          select(null);
          hover(null);
        }
      }}
    >
      <div className={styles.header}>
        <h3 id={`${id}-heading`}>{t("introFormulaTitle")}</h3>
        <div className={styles.headerActions}>
          <button
            ref={resetButtonRef}
            type="button"
            onClick={onReset}
            aria-label={t("reset")}
            aria-describedby={`${id}-reset-hint`}
            className={styles.reset}
          >
            {t("resetShort")}
          </button>
        </div>
      </div>
      <p id={`${id}-instructions`} className="sr-only">
        {t("formulaFieldsInstruction")}
      </p>
      <p className="sr-only">{t("formulaSpoken")}</p>
      <div className={styles.formulaControls}>
        <div className={styles.equation}>
          <span className={styles.equationLeft}>
            {term("force")}
            <span aria-hidden="true" className={styles.operator}>
              =
            </span>
          </span>
          <span className={styles.equationRight}>
            <button
              type="button"
              data-formula-variable="constant"
              data-active={active === "constant"}
              className={styles.term}
              aria-label={`${t("formulaConstantTitle")}. ${t("formulaConstantFixed")}`}
              aria-describedby={`${id}-constant-value ${id}-constant-description`}
              aria-pressed={selected === "constant"}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") hover("constant");
              }}
              onPointerLeave={() => hover(null)}
              onFocus={() => focus("constant")}
              onBlur={() => focus(null)}
              onClick={() =>
                select(selected === "constant" ? null : "constant")
              }
            >
              G
            </button>
            <span aria-hidden="true" className={styles.operator}>
              ×
            </span>
            <span className={styles.fraction}>
              <span>
                {term("mass1")}
                <span aria-hidden="true">×</span>
                {term("mass2")}
              </span>
              <span>{term("distance")}</span>
            </span>
          </span>
        </div>
        <fieldset
          className={styles.unknowns}
          aria-label={t("calculateUnknown")}
        >
          <legend>{t("calculateUnknown")}</legend>
          <div>
            {fields.map(({ key, symbol }) => (
              <button
                key={key}
                type="button"
                data-unknown-variable={key}
                aria-pressed={unknown === key}
                onClick={() => {
                  selectUnknown(key);
                  select(key);
                }}
                onFocus={() => focus(key)}
                onBlur={() => focus(null)}
              >
                {symbol}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      {explanation}
      <div className={styles.fields}>
        {fields.map((field) => {
          const calculated = unknown === field.key;
          const value = calculated
            ? (result?.[field.key] ?? null)
            : parseFormulaValue(values[field.key]);
          const limits =
            field.key === "force" ? null : laboratoryLimits[field.key];
          const invalid =
            (!calculated &&
              values[field.key].trim() !== "" &&
              value === null) ||
            (value !== null &&
              limits !== null &&
              (value < limits.min || value > limits.max));
          return (
            <div
              key={field.key}
              data-formula-field={field.key}
              data-active={isActive(field.key)}
              data-calculated={calculated}
              data-invalid={invalid}
              className={styles.field}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") hover(field.key);
              }}
              onPointerLeave={() => hover(null)}
              onFocus={() => focus(field.key)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget))
                  focus(null);
              }}
            >
              <label
                htmlFor={`${id}-input-${field.key}`}
                className={styles.fieldTitle}
              >
                {t(field.label)} <span>{field.symbol}</span>
              </label>
              <div className={styles.inputGroup}>
                <input
                  ref={(element) => {
                    inputRefs.current[field.key] = element;
                  }}
                  id={`${id}-input-${field.key}`}
                  name={field.key}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  spellCheck={false}
                  value={
                    calculated
                      ? result
                        ? String(Number(result[field.key].toPrecision(12)))
                        : ""
                      : values[field.key]
                  }
                  placeholder={
                    calculated ? t("resultPendingShort") : t("enterValue")
                  }
                  readOnly={calculated}
                  aria-invalid={invalid}
                  aria-describedby={`${id}-description-${field.key} ${id}-status${calculated ? ` ${id}-calculated` : ""}`}
                  onChange={(event) =>
                    changeValue(field.key, event.target.value)
                  }
                />
                <span aria-hidden="true" className={styles.unit}>
                  {field.unit}
                </span>
              </div>
              <p id={`${id}-description-${field.key}`} className="sr-only">
                {t.rich(field.description, {
                  highlight: (chunks) => <strong>{chunks}</strong>,
                })}
              </p>
              {calculated && (
                <span id={`${id}-calculated`} className={styles.calculated}>
                  {t("automaticallyCalculated")}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <p className={styles.help} aria-hidden="true">
        {fields.some(({ key }) => key === active)
          ? t.rich(fields.find(({ key }) => key === active)!.description, {
              highlight: (chunks) => <strong>{chunks}</strong>,
            })
          : t("formulaThreeKnownHint")}
      </p>
      <GravityFormulaLegend id={id} />
      <p id={`${id}-status`} role="status" aria-atomic="true" className="sr-only">{status}</p>
      <p id={`${id}-reset-hint`} className="sr-only">{t("resetLaboratoryHint")}</p>
      {/* <p
        id={`${id}-status`}
        role="status"
        aria-atomic="true"
        className={
          invalidFields.length > 0 || numericalError || rangeError
            ? styles.error
            : "sr-only"
        }
      >
        {status}
      </p>
      <p data-formula-sync-status className={styles.help}>
        {t(
          result && isInLaboratoryRange(result)
            ? "formulaAutomaticSync"
            : "formulaPendingSync",
        )}
      </p>
      <p id={`${id}-reset-hint`} className={styles.help}>
        {t("resetLaboratoryHint")}
      </p> */}
    </section>
  );
};
