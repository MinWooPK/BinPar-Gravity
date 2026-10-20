"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { ExplainWithAI } from "@/features/ai/presentation/components/ExplainWithAI";
import { GravityFormulaTutor } from "./GravityFormulaTutor";
import type { ReactNode, RefObject } from "react";
import { useFormatter, useTranslations } from "next-intl";
import type { GravityVariable } from "../../../types/gravity.types";
import { parseFormulaValue } from "../../../application/parseFormulaValue";
import { isInLaboratoryRange } from "../../../application/formulaInput";
import { laboratoryLimits } from "../../../domain/gravitation";
import {
  useGravityControls,
  useGravityFormulaDraft,
  useGravityParameters,
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
  return footer ? (
    <div className={styles.card}>
      {content}
      {footer}
    </div>
  ) : (
    content
  );
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
  const [showWarning, setShowWarning] = useState(false);
  const { parameters } = useGravityParameters();
  const {
    values,
    unknown,
    result,
    numericalError,
    changeValue,
    selectUnknown,
  } = useGravityFormulaDraft();
  const { active, hover, focus, select } = useGravityFormulaInteraction();
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
  const invalidFields = fields.filter(
    ({ key }) =>
      key !== unknown &&
      values[key].trim() !== "" &&
      parseFormulaValue(values[key]) === null,
  );
  const rangeError =
    result !== null &&
    !numericalError &&
    invalidFields.length === 0 &&
    !isInLaboratoryRange(result);
  const status =
    invalidFields.length > 0
      ? t("invalidFormulaValue", { symbol: invalidFields[0].symbol })
      : numericalError
        ? t("numericalError")
        : rangeError
          ? `${t("outsideLabRange")} ${t("outsideLabRangeConsequence")}`
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
          setShowWarning(false);
        }
      }}
    >
      <div className={styles.header}>
        <h3 id={`${id}-heading`}>
          {t("introFormulaTitle")} <ExplainWithAI topic="formula" />
        </h3>

        <div className={`${styles.headerActions} relative`}>
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
            className={styles.reset}
          >
            {t("resetShort")}
          </button>

          {/* MENSAJE FLOTANTE ABSOLUTE */}
          {rangeError && showWarning && (
            <section
              id={`${id}-range-warning`}
              data-formula-range-warning
              aria-labelledby={`${id}-range-heading`}
              className={`${styles.rangeWarning2} absolute! top-full! right-0 z-50 mt-2! w-[min(380px,calc(100vw-24px))] max-h-[70dvh] overflow-y-auto shadow-2xl shadow-black/60`}
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
      </div>
      <p id={`${id}-instructions`} className="sr-only">
        {t("formulaFieldsInstruction")}
      </p>
      <p className="sr-only">{t("formulaSpoken")}</p>
      <div className={styles.formulaControls}>
        <GravityEquation
          id={id}
          currentValue={currentValue}
          onSelect={focusField}
        />
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

      <GravityFormulaLegend id={id} />
      {/* {rangeError && (
        <section
          data-formula-range-warning
          className={styles.rangeWarning}
          aria-labelledby={`${id}-range-heading`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-6 shrink-0 text-amber-300" />
            <div className="min-w-0 space-y-2">
              <h4
                id={`${id}-range-heading`}
                className="text-base leading-snug font-semibold text-amber-100 sm:text-lg"
              >
                {t("outsideLabRange")}
              </h4>
              <p>{t("outsideLabRangeDescription")}</p>
            </div>
          </div>
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
          <p className="border-t border-amber-300/20 pt-3">
            {t("outsideLabRangeConsequence")}
          </p>
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
      )} */}
      {/* Keep the announcement stable during out-of-range edits. Current laboratory
          values remain readable above without becoming a second live region. */}
      <p
        id={`${id}-status`}
        role="status"
        aria-atomic="true"
        className={
          rangeError
            ? "sr-only"
            : invalidFields.length > 0 || numericalError
              ? styles.error
              : styles.help
        }
      >
        {status}
      </p>
    </section>
  );
};

/** Shared equation presentation; all calculations remain in the existing provider. */
const GravityEquation = ({
  id,
  currentValue,
  onSelect,
}: {
  id: string;
  currentValue?: (key: GravityVariable) => number | null;
  onSelect?: (key: GravityVariable) => void;
}) => {
  const t = useTranslations("Gravity");
  const format = useFormatter();
  const { active, selected, hover, focus, select } =
    useGravityFormulaInteraction();
  const isActive = (term: FormulaTerm) =>
    active === term ||
    (active === "masses" && (term === "mass1" || term === "mass2"));
  const formatValue = (value: number) =>
    format.number(value, {
      maximumSignificantDigits: 6,
      ...(value < 0.001 ? { notation: "scientific" } : {}),
    });
  const term = (key: GravityVariable) => {
    const field = fields.find((field) => field.key === key)!;
    const value = currentValue?.(key) ?? null;
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
        onClick={() => {
          select(key);
          onSelect?.(key);
        }}
      >
        {field.symbol}
        {key === "distance" && <sup>2</sup>}
      </button>
    );
  };
  return (
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
          onClick={() => select(selected === "constant" ? null : "constant")}
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
  );
};

/** Educational view: interactive symbols and definitions, without calculator inputs. */
export const GravityFormulaEducation = () => {
  const t = useTranslations("Gravity");
  const id = useId();

  const { active, select, hover } = useGravityFormulaInteraction();

  return (
    <section
      className={styles.embedded}
      aria-labelledby={`${id}-heading`}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          select(null);
          hover(null);
        }
      }}
    >
      <div className={styles.header}>
        <h3 id={`${id}-heading`}>
          {t("introFormulaTitle")} <ExplainWithAI topic="formula" />
        </h3>
      </div>
      <p className="sr-only">{t("formulaSpoken")}</p>
      <GravityFormulaTutor />
      <GravityEquation id={id} />
      <div className="grid min-w-0 gap-3">
        {fields.map((field) => (
          <div
            key={field.key}
            className={styles.field}
            data-active={
              active === field.key ||
              (active === "masses" &&
                (field.key === "mass1" || field.key === "mass2"))
            }
          >
            <h4 className={styles.fieldTitle}>
              {t(field.label)} <span>{field.symbol}</span>
            </h4>
            <p id={`${id}-description-${field.key}`} className={styles.help}>
              {t.rich(field.description, {
                highlight: (chunks) => <strong>{chunks}</strong>,
              })}
            </p>
          </div>
        ))}
      </div>
      <GravityFormulaLegend id={id} />
    </section>
  );
};
