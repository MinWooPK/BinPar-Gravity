"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { solveGravity } from "../domain/gravitation";
import type { GravityValues, GravityVariable } from "../domain/gravitation";
import { useGravityParameters } from "./GravityParametersProvider";
import { parseFormulaValue } from "./parseFormulaValue";
import styles from "./GravityIntroduction.module.css";

const definitions = [
  { key: "force", symbol: "F", label: "legendForce", detail: "legendForceUnit" },
  { key: "constant", symbol: "G", label: "legendConstant", detail: "legendConstantValue" },
  { key: "masses", symbol: "m₁, m₂", label: "legendMasses", detail: "legendMassUnit" },
  { key: "distance", symbol: "r", label: "legendDistance", detail: "legendDistanceUnit" },
] as const;
type Term = typeof definitions[number]["key"];
const fields = [
  { key: "force", symbol: "F", scale: 1, unit: "N" },
  { key: "mass1", symbol: "m₁", scale: 1, unit: "kg" },
  { key: "mass2", symbol: "m₂", scale: 1, unit: "kg" },
  { key: "distance", symbol: "r", scale: 1, unit: "m" },
] as const;
const empty = { force: "", mass1: "", mass2: "", distance: "" };
const inLabRange = (values: GravityValues) => values.mass1 >= 1e13 && values.mass1 <= 1e14 && values.mass2 >= 1e13 && values.mass2 <= 1e14 && values.distance >= 5000 && values.distance <= 20000;
const definitionKey = (key: GravityVariable): Term => key === "mass1" || key === "mass2" ? "masses" : key;

export const GravityFormula = () => {
  const { resetVersion } = useGravityParameters();
  return <GravityFormulaContent key={resetVersion} />;
};

const GravityFormulaContent = () => {
  const t = useTranslations("Gravity");
  const format = useFormatter();
  const id = useId();
  const { setParameters, resetParameters } = useGravityParameters();
  const [hovered, setHovered] = useState<Term | null>(null);
  const [focused, setFocused] = useState<Term | null>(null);
  const [selected, setSelected] = useState<Term | null>(null);
  const active = hovered ?? focused ?? selected;
  const [editing, setEditing] = useState<GravityVariable | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const variableRefs = useRef<Partial<Record<GravityVariable, HTMLButtonElement | null>>>({});
  useEffect(() => {
    if (editing) { inputRef.current?.focus(); inputRef.current?.select(); }
  }, [editing]);
  const closeEditor = (restoreFocus = false) => {
    const key = editing;
    setEditing(null);
    setFocused(null);
    if (restoreFocus && key) requestAnimationFrame(() => variableRefs.current[key]?.focus());
  };
  const [values, setValues] = useState(empty);
  const [unknown, setUnknown] = useState<GravityVariable | null>(null);
  const [result, setResult] = useState<GravityValues | null>(null);
  const [numericalError, setNumericalError] = useState(false);

  const changeValue = (key: GravityVariable, text: string) => {
    const next = { ...values, [key]: text };
    setValues(next);
    setResult(null);
    setNumericalError(false);
    const valid = fields.filter((field) => parseFormulaValue(next[field.key]) !== null);
    const target = unknown ?? (valid.length === 3 ? fields.find((field) => parseFormulaValue(next[field.key]) === null)!.key : null);
    if (!target) return;
    const known: Partial<GravityValues> = {};
    for (const field of fields) {
      if (field.key === target) continue;
      const value = parseFormulaValue(next[field.key]);
      if (value === null) return;
      known[field.key] = value * field.scale;
    }
    setUnknown(target);
    try {
      const solution = solveGravity(target, known);
      setResult(solution);
      if (inLabRange(solution)) setParameters({ mass1: solution.mass1, mass2: solution.mass2, distance: solution.distance });
    } catch { setNumericalError(true); }
  };

  const fieldInput = (field: typeof fields[number], squared = false) => {
    const calculated = unknown === field.key;
    const text = values[field.key];
    const invalid = !calculated && text.trim() !== "" && parseFormulaValue(text) === null;
    const computed = calculated && result ? Number((result[field.key] / field.scale).toPrecision(12)).toString() : "";
    return (
      <span className={styles.formulaEditor} key={field.key}>
        <label htmlFor={`${id}-input-${field.key}`} className="sr-only">{field.symbol} ({field.unit})</label>
        <span className={styles.formulaInputGroup}>
          <span className={styles.inputWithUnit} data-calculated={calculated} data-invalid={invalid}>
        <input ref={inputRef} id={`${id}-input-${field.key}`} name={field.key} type="text" inputMode="decimal" autoComplete="off" spellCheck={false} placeholder="-" value={calculated ? computed : text} readOnly={calculated} aria-invalid={invalid || undefined} aria-describedby={`${id}-hint-${field.key} ${id}-instructions${squared ? ` ${id}-distance-hint` : ""}`} onFocus={() => setFocused(definitionKey(field.key))} onBlur={() => closeEditor()} onKeyDown={(event) => {
          if (event.key === "Tab") {
            const controls = Array.from(panelRef.current?.querySelectorAll<HTMLElement>("button, input") ?? []);
            const next = controls[controls.indexOf(event.currentTarget) + (event.shiftKey ? -1 : 1)];
            if (next) { event.preventDefault(); closeEditor(); next.focus(); }
          } else if (event.key === "Enter" || event.key === "Escape") { event.preventDefault(); event.stopPropagation(); closeEditor(true); }
        }} onChange={(event) => changeValue(field.key, event.target.value)} />
          <small>{field.unit}</small>
          </span>
          {squared && <sup aria-hidden="true" className={styles.editorSquare}>2</sup>}
        </span>
        <span id={`${id}-hint-${field.key}`} className={invalid ? styles.fieldError : styles.fieldHint}>{invalid ? t("positiveValue") : calculated ? t("automaticallyCalculated") : ""}</span>
      </span>
    );
  };

  const term = (key: Term, symbol: ReactNode) => {
    const definition = definitions.find((item) => item.key === key)!;
    return <button type="button" aria-label={t(definition.label)} aria-describedby={`${id}-${key}`} aria-pressed={selected === key} data-active={active === key} className={styles.term} onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(key); }} onPointerLeave={() => setHovered(null)} onFocus={() => setFocused(key)} onBlur={() => setFocused(null)} onClick={() => setSelected(selected === key ? null : key)}>{symbol}</button>;
  };
  const displayedValue = (key: GravityVariable, squared = false) => {
    const field = fields.find((item) => item.key === key)!;
    const value = unknown === key ? (result ? result[key] / field.scale : null) : parseFormulaValue(values[key]);
    if (value === null || !Number.isFinite(value) || value <= 0) return `${field.symbol}${squared ? "²" : ""}`;
    return (
      <span className={styles.substitutedValue}>
        <span>{format.number(value, { maximumSignificantDigits: 4, notation: value >= 1e6 || value < 0.001 ? "scientific" : "standard" })}{squared && <sup>2</sup>}</span>
        <small>{squared ? "m²" : field.unit}</small>
      </span>
    );
  };

  const openEditor = (key: GravityVariable) => {
    setSelected(definitionKey(key));
    setEditing(key);
  };

  const editableTerm = (key: GravityVariable, squared = false) => {
    if (editing === key) return fieldInput(fields.find((field) => field.key === key)!, squared);
    const definition = definitionKey(key);
    const field = fields.find((item) => item.key === key)!;
    const calculated = unknown === key;
    const invalid = !calculated && values[key].trim() !== "" && parseFormulaValue(values[key]) === null;
    return <button ref={(element) => { variableRefs.current[key] = element; }} type="button" data-formula-variable={key} className={`${styles.term} ${styles.formulaVariable}`} data-active={active === definition} data-calculated={calculated} data-invalid={invalid} aria-label={t(calculated ? "calculatedFormulaVariable" : "editFormulaVariable", { symbol: field.symbol, unit: field.unit })} aria-describedby={`${id}-${definition} ${id}-instructions${squared ? ` ${id}-distance-hint` : ""}${invalid || calculated ? ` ${id}-status` : ""}`} onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(definition); }} onPointerLeave={() => setHovered(null)} onFocus={() => setFocused(definition)} onBlur={() => setFocused(null)} onClick={() => openEditor(key)}>{displayedValue(key, squared)}{calculated && <span className={styles.calculatedLabel}>{t("automaticField")}</span>}</button>;
  };

  const equation = (
    <>
      {editableTerm("force")}
      <span aria-hidden="true" className={styles.operator}>=</span>
      {term("constant", "G")}
      <span aria-hidden="true" className={styles.operator}>×</span>
      <span className={styles.fraction}>
        <span>{editableTerm("mass1")}<span aria-hidden="true"> × </span>{editableTerm("mass2")}</span>
        <span>{editableTerm("distance", true)}</span>
      </span>
    </>
  );
  const invalidField = fields.find((field) => field.key !== unknown && values[field.key].trim() !== "" && parseFormulaValue(values[field.key]) === null);
  const status = invalidField ? t("invalidFormulaValue", { symbol: invalidField.symbol }) : numericalError ? t("numericalError") : result ? t("automaticResult", { symbol: fields.find((field) => field.key === unknown)!.symbol, value: format.number(result[unknown!] / fields.find((field) => field.key === unknown)!.scale, { maximumSignificantDigits: 6 }), unit: fields.find((field) => field.key === unknown)!.unit }) : "";

  return (
    <section ref={panelRef} aria-labelledby={`${id}-heading`} className={styles.panel} onKeyDown={(event) => { if (event.key === "Escape") { setSelected(null); setHovered(null); setFocused(null); } }}>
      <div className={styles.calculatorHeader}><h3 id={`${id}-heading`} className={styles.eyebrow}>{t("introFormulaTitle")}</h3><button type="button" onClick={resetParameters} className={styles.resetButton}>{t("reset")}</button></div>
      <p id={`${id}-instructions`} className={styles.formulaInstructions}>{t("clickToEditFormulaHint")}</p>
      <p id={`${id}-distance-hint`} className={styles.distanceHint}>{t("formulaDistanceHint")}</p>
      <p className="sr-only">{t("formulaSpoken")}</p>
      <div className={`${styles.formula} ${styles.autoEquation}`}>{equation}</div>
      <p id={`${id}-status`} className={invalidField || numericalError ? styles.fieldError : styles.formulaHint} role="status" hidden={!status}>{status}</p>
      {result && !inLabRange(result) && <p className={styles.fieldError}>{t("outsideLabRange")}</p>}
      <dl className={styles.legend}>
        {definitions.map(({ key, symbol, label, detail }) => (
          <div key={key} data-active={active === key} className={styles.interactiveDefinition} onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(key); }} onPointerLeave={() => setHovered(null)}>
            <dt className={styles.definitionHeading}>
              <button type="button" className={styles.definitionAction} aria-label={t(label)} aria-describedby={`${id}-${key}`} onClick={() => key === "constant" ? setSelected(selected === key ? null : key) : openEditor(key === "masses" ? "mass1" : key)} onFocus={() => setFocused(key)} onBlur={() => setFocused(null)} />
              {key === "masses" ? <span className={styles.massEditActions}>{(["mass1", "mass2"] as const).map((mass) => <button key={mass} type="button" aria-label={t("editFormulaVariable", { symbol: mass === "mass1" ? "m₁" : "m₂", unit: "kg" })} onClick={() => openEditor(mass)} onFocus={() => setFocused("masses")} onBlur={() => setFocused(null)}>{mass === "mass1" ? "m₁" : "m₂"}</button>)}</span> : <span className={styles.definitionSymbol}>{symbol}</span>}
            </dt>
            <dd id={`${id}-${key}`}>
              {key === "constant" ? t.rich("legendConstantHighlighted", { highlight: (chunks) => <strong className={styles.definitionHighlight}>{chunks}</strong> }) : t(label)}
              <span>{t.rich(`${detail}Highlighted`, { highlight: (chunks) => <strong className={styles.definitionHighlight}>{chunks}</strong> })}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
