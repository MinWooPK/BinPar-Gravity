"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { RefObject } from "react";
import { useFormatter, useTranslations } from "next-intl";
import type { GravityVariable } from "../domain/gravitation";
import { useGravityControls } from "./GravityParametersProvider";
import { parseFormulaValue } from "../application/parseFormulaValue";
import { isInLaboratoryRange } from "../application/formulaInput";
import { useGravityFormula } from "../hooks/useGravityFormula";
import styles from "./GravityIntroduction.module.css";
import { GravityFormulaLegend, type FormulaTerm } from "./GravityFormulaLegend";
import { GravityFormulaApplication } from "./GravityFormulaApplication";

const fields = {
  force: { key: "force", symbol: "F", unit: "N" },
  mass1: { key: "mass1", symbol: "m₁", unit: "kg" },
  mass2: { key: "mass2", symbol: "m₂", unit: "kg" },
  distance: { key: "distance", symbol: "r", unit: "m" },
} as const;
const definitionKey = (key: GravityVariable): FormulaTerm =>
  key === "mass1" || key === "mass2" ? "masses" : key;

export const GravityFormula = () => {
  const { resetVersion, resetParameters } = useGravityControls();
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const restoreResetFocus = useRef(false);
  useEffect(() => {
    if (restoreResetFocus.current) {
      resetButtonRef.current?.focus();
      restoreResetFocus.current = false;
    }
  }, [resetVersion]);
  return (
    <GravityFormulaContent
      key={resetVersion}
      resetButtonRef={resetButtonRef}
      onReset={() => {
        restoreResetFocus.current = true;
        resetParameters();
      }}
    />
  );
};

const GravityFormulaContent = ({
  resetButtonRef,
  onReset,
}: {
  resetButtonRef: RefObject<HTMLButtonElement | null>;
  onReset: () => void;
}) => {
  const t = useTranslations("Gravity");
  const format = useFormatter();
  const id = useId();
  const { values, unknown, result, numericalError, changeValue } = useGravityFormula();
  const [hovered, setHovered] = useState<FormulaTerm | null>(null);
  const [focused, setFocused] = useState<FormulaTerm | null>(null);
  const [selected, setSelected] = useState<FormulaTerm | null>(null);
  const active = hovered ?? focused ?? selected;
  const [editing, setEditing] = useState<GravityVariable | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const variableRefs = useRef<
    Partial<Record<GravityVariable, HTMLButtonElement | null>>
  >({});
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);
  const closeEditor = (restoreFocus = false) => {
    const key = editing;
    setEditing(null);
    setFocused(null);
    if (restoreFocus && key)
      requestAnimationFrame(() => variableRefs.current[key]?.focus());
  };
  const fieldInput = (field: (typeof fields)[GravityVariable], squared = false) => {
    const calculated = unknown === field.key;
    const text = values[field.key];
    const computed =
      calculated && result
        ? Number(result[field.key].toPrecision(12)).toString()
        : "";
    return (
      <span className={styles.formulaEditor} key={field.key}>
        <label
          htmlFor={`${id}-input-${field.key}`}
          className={styles.editorLabel}
        >
          {field.symbol}
          <span className="sr-only"> ({field.unit})</span>
        </label>
        <span className={styles.formulaInputGroup}>
          <span className={styles.inputWithUnit} data-calculated={calculated}>
            <input
              ref={inputRef}
              id={`${id}-input-${field.key}`}
              name={field.key}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              placeholder="-"
              value={calculated ? computed : text}
              readOnly={calculated}
              aria-describedby={`${id}-hint-${field.key} ${id}-instructions${squared ? ` ${id}-distance-hint` : ""}`}
              onFocus={() => setFocused(definitionKey(field.key))}
              onBlur={() => closeEditor()}
              onKeyDown={(event) => {
                if (
                  event.key === "Tab" &&
                  !event.ctrlKey &&
                  !event.metaKey &&
                  !event.altKey
                ) {
                  const controls = Array.from(
                    panelRef.current?.querySelectorAll<HTMLElement>(
                      "button, input",
                    ) ?? [],
                  );
                  const next =
                    controls[
                      controls.indexOf(event.currentTarget) +
                        (event.shiftKey ? -1 : 1)
                    ];
                  if (next) {
                    event.preventDefault();
                    closeEditor();
                    next.focus();
                  }
                } else if (event.key === "Enter" || event.key === "Escape") {
                  event.preventDefault();
                  event.stopPropagation();
                  closeEditor(true);
                }
              }}
              onChange={(event) => changeValue(field.key, event.target.value)}
            />
            <small>{field.unit}</small>
          </span>
          {squared && (
            <sup aria-hidden="true" className={styles.editorSquare}>
              2
            </sup>
          )}
        </span>
        <span id={`${id}-hint-${field.key}`} className={styles.fieldHint}>
          {calculated ? t("automaticallyCalculated") : ""}
        </span>
      </span>
    );
  };

  const constantTerm = (
    <button
      type="button"
      aria-label={`${t("legendConstant")}. ${t("formulaConstantFixed")}`}
      aria-describedby={`${id}-constant`}
      aria-pressed={selected === "constant"}
      data-active={active === "constant"}
      className={`${styles.term} ${styles.constantTerm}`}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered("constant");
      }}
      onPointerLeave={() => setHovered(null)}
      onFocus={() => setFocused("constant")}
      onBlur={() => setFocused(null)}
      onClick={() => setSelected(selected === "constant" ? null : "constant")}
    >
      G
      <span className={styles.constantLabel}>{t("formulaConstantFixed")}</span>
    </button>
  );
  const currentValue = (key: GravityVariable) => {
    return unknown === key
      ? result
        ? result[key]
        : null
      : parseFormulaValue(values[key]);
  };
  const formatValue = (value: number) =>
    format.number(value, {
      maximumSignificantDigits: 4,
      notation: value >= 1e6 || value < 0.001 ? "scientific" : "standard",
    });
  const displayedValue = (key: GravityVariable, squared = false) => {
    const field = fields[key];
    const value = currentValue(key);
    if (value === null || !Number.isFinite(value) || value <= 0)
      return `${field.symbol}${squared ? "²" : ""}`;
    return (
      <span className={styles.substitutedValue}>
        <span>
          {formatValue(value)}
          {squared && <sup>2</sup>}
        </span>
        <small>{squared ? "m²" : field.unit}</small>
      </span>
    );
  };

  const openEditor = (key: GravityVariable) => {
    setSelected(definitionKey(key));
    setEditing(key);
  };

  const editableTerm = (key: GravityVariable, squared = false) => {
    if (editing === key)
      return fieldInput(fields[key], squared);
    const definition = definitionKey(key);
    const field = fields[key];
    const calculated = unknown === key;
    const invalid =
      !calculated &&
      values[key].trim() !== "" &&
      parseFormulaValue(values[key]) === null;
    const value = currentValue(key);
    const label = t(
      calculated ? "calculatedFormulaVariable" : "editFormulaVariable",
      { symbol: field.symbol, unit: field.unit },
    );
    const accessibleLabel =
      value === null
        ? label
        : `${label}. ${t("formulaCurrentValue", { value: formatValue(value), unit: field.unit })}`;
    return (
      <button
        ref={(element) => {
          variableRefs.current[key] = element;
        }}
        type="button"
        data-formula-variable={key}
        className={`${styles.term} ${styles.formulaVariable}`}
        data-active={active === definition}
        data-calculated={calculated}
        data-invalid={invalid}
        aria-label={accessibleLabel}
        aria-describedby={`${id}-${definition} ${id}-instructions${squared ? ` ${id}-distance-hint` : ""}${invalid ? ` ${id}-status` : ""}`}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") setHovered(definition);
        }}
        onPointerLeave={() => setHovered(null)}
        onFocus={() => setFocused(definition)}
        onBlur={() => setFocused(null)}
        onClick={() => openEditor(key)}
      >
        {displayedValue(key, squared)}
        {calculated && (
          <span className={styles.calculatedLabel}>{t("automaticField")}</span>
        )}
      </button>
    );
  };

  const equation = (
    <>
      <span className={styles.equationLeft}>
        {editableTerm("force")}
        <span aria-hidden="true" className={styles.operator}>
          =
        </span>
      </span>
      <span className={styles.equationRight}>
        {constantTerm}
        <span aria-hidden="true" className={styles.operator}>
          ×
        </span>
        <span className={styles.fraction}>
          <span>
            {editableTerm("mass1")}
            <span aria-hidden="true"> × </span>
            {editableTerm("mass2")}
          </span>
          <span>{editableTerm("distance", true)}</span>
        </span>
      </span>
    </>
  );
  const invalidField = Object.values(fields).find(
    (field) =>
      field.key !== unknown &&
      values[field.key].trim() !== "" &&
      parseFormulaValue(values[field.key]) === null,
  );
  const calculatedField = unknown ? fields[unknown] : null;
  // Incomplete numbers are expected during typing; publish validation on exit.
  const status = editing
    ? ""
    : invalidField
      ? t("invalidFormulaValue", { symbol: invalidField.symbol })
      : numericalError
        ? t("numericalError")
        : result && calculatedField
          ? t("automaticResult", {
              symbol: calculatedField.symbol,
              value: format.number(
                result[calculatedField.key],
                { maximumSignificantDigits: 6 },
              ),
              unit: calculatedField.unit,
            })
          : "";

  return (
    <section
      ref={panelRef}
      aria-labelledby={`${id}-heading`}
      className={styles.panel}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setSelected(null);
          setHovered(null);
          setFocused(null);
        }
      }}
    >
      <div className={styles.calculatorHeader}>
        <h3 id={`${id}-heading`} className={styles.eyebrow}>
          {t("introFormulaTitle")}
        </h3>
        <button
          ref={resetButtonRef}
          type="button"
          onClick={onReset}
          className={styles.resetButton}
        >
          {t("reset")}
        </button>
      </div>
      <p id={`${id}-instructions`} className={styles.formulaInstructions}>
        {t("clickToEditFormulaHint")}
      </p>
      <p id={`${id}-distance-hint`} className={styles.distanceHint}>
        {t("formulaDistanceHint")}
      </p>
      <p className="sr-only">{t("formulaSpoken")}</p>
      <div className={`${styles.formula} ${styles.autoEquation}`}>
        {equation}
      </div>
      <p
        id={`${id}-status`}
        className={
          status
            ? invalidField || numericalError
              ? styles.fieldError
              : styles.formulaHint
            : "sr-only"
        }
        role="status"
        aria-atomic="true"
      >
        {status}
      </p>
      {unknown && !editing && (
        <p className={styles.formulaHint}>{t("formulaResetHint")}</p>
      )}
      {result && !isInLaboratoryRange(result) && (
        <p className={styles.fieldError}>{t("outsideLabRange")}</p>
      )}
      <GravityFormulaApplication
        result={result}
        valid={!editing && !invalidField && !numericalError}
        hasInputs={Object.values(values).some((value) => value.trim() !== "")}
      />
      <GravityFormulaLegend
        id={id}
        active={active}
        onHover={setHovered}
        onFocus={setFocused}
        onSelect={(key) => setSelected(selected === key ? null : key)}
        onEdit={openEditor}
      />
    </section>
  );
};
