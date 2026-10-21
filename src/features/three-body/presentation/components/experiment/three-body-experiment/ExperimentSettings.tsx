"use client";

import { useTranslations } from "next-intl";

import { useThreeBodyExperiment } from "../../../providers/ThreeBodyExperimentProvider";
import {
  bodyColors,
  bodyFields,
  bodySymbols,
  inputStyles,
} from "./experiment.constants";
import type { ExperimentController } from "./useExperimentSimulation";

type ExperimentSettingsProps = {
  experiment: ExperimentController;
};

// Estilos compartidos de los campos.
const fieldClassName =
  "mt-1 flex min-w-0 overflow-hidden rounded-lg border border-[#48516b] bg-[#0d1320] transition-colors focus-within:border-[#aa97ff] focus-within:ring-2 focus-within:ring-[#aa97ff]/30";

const symbolClassName =
  "flex min-w-11 shrink-0 items-center justify-center border-l border-[#48516b] bg-[#302748] px-2 font-mono text-sm font-semibold text-[#b9a8ff]";

// Configura los parámetros de los tres cuerpos.
export const ExperimentSettings = ({ experiment }: ExperimentSettingsProps) => {
  const t = useTranslations("ThreeBody.experiment");
  const { draft, selectedBody, dispatch } = useThreeBodyExperiment();

  const { error, runError, calculating, simulation, playing, elapsed } =
    experiment;

  const selected = draft.bodies[selectedBody];

  // Obtiene el mensaje del estado actual.
  const status = error
    ? error
    : runError
      ? runError
      : calculating
        ? "calculating"
        : simulation
          ? playing
            ? "running"
            : elapsed >= simulation.duration
              ? "finished"
              : "paused"
          : "valid";

  return (
    <section className="flex min-w-0 flex-col gap-2.5 rounded-2xl border border-[#39455f] bg-linear-to-b from-[#151a2a] to-[#101421] p-3">
      <h3 className="min-w-0 text-base font-semibold text-slate-100">
        {t("settingsTitle")}
      </h3>

      {/* Parámetros generales. */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold tracking-wider text-[#b9a8ff] uppercase">
          {t("commonParameters")}
        </h4>

        <div className="grid min-w-0 grid-cols-2 gap-2">
          <label className="block min-w-0">
            <span className="text-xs text-slate-300">{t("gravity")}</span>

            <div className={fieldClassName}>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                value={draft.gravity}
                onChange={(event) =>
                  dispatch({
                    type: "common",
                    key: "gravity",
                    value: event.target.value,
                  })
                }
                className={inputStyles}
              />

              <span aria-hidden="true" className={symbolClassName}>
                G
              </span>
            </div>
          </label>

          <label className="block min-w-0">
            <span className="text-xs text-slate-300">{t("duration")}</span>

            <div className={fieldClassName}>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                value={draft.duration}
                onChange={(event) =>
                  dispatch({
                    type: "common",
                    key: "duration",
                    value: event.target.value,
                  })
                }
                className={inputStyles}
              />

              <span aria-hidden="true" className={symbolClassName}>
                t<sub>max</sub>
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Selección del cuerpo. */}
      <div className="space-y-2 border-t border-[#30364b] pt-2.5">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-semibold tracking-wider text-[#b9a8ff] uppercase">
            {t("chooseBody")}
          </h4>

          <div
            role="group"
            aria-label={t("chooseBody")}
            className="grid grid-cols-3 gap-1.5"
          >
            {draft.bodies.map((_, index) => {
              const isSelected = selectedBody === index;

              return (
                <button
                  key={index}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={t("body", { number: index + 1 })}
                  title={t("body", { number: index + 1 })}
                  onClick={() => dispatch({ type: "select", index })}
                  style={{
                    borderColor: isSelected ? bodyColors[index] : undefined,
                  }}
                  className={`flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 ${
                    isSelected
                      ? "bg-[#302748] text-white"
                      : "border-[#303b59] bg-[#0b1120] text-slate-300 hover:border-[#60517f]"
                  }`}
                >
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: bodyColors[index] }}
                    aria-hidden="true"
                  />

                  {t("body", { number: index + 1 })}
                </button>
              );
            })}
          </div>
        </div>

        {/* Parámetros del cuerpo seleccionado. */}
        <div className="grid min-w-0 grid-cols-2 gap-2 min-[520px]:grid-cols-3">
          {bodyFields.map(({ key, label }) => (
            <label key={key} className="block min-w-0">
              <span className="text-xs text-slate-300">{t(label)}</span>

              <div className={fieldClassName}>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={key === "mass" ? "0" : undefined}
                  value={selected[key]}
                  onChange={(event) =>
                    dispatch({
                      type: "body",
                      index: selectedBody,
                      key,
                      value: event.target.value,
                    })
                  }
                  className={inputStyles}
                />

                <span aria-hidden="true" className={symbolClassName}>
                  {bodySymbols[key]}
                  <sub>{selectedBody + 1}</sub>
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <p className="text-xs leading-4 text-slate-400">{t("unitsNote")}</p>

      {/* Estado de la simulación. */}
      <p
        role="status"
        aria-live="polite"
        className={`rounded-lg border px-3 py-2 text-xs leading-5 sm:text-sm ${
          error || runError
            ? "border-[#805052] bg-[#321c23] text-[#fecaca]"
            : "border-[#315c5b] bg-[#10242a] text-[#a7f3e5]"
        }`}
      >
        {t(status)}
      </p>
    </section>
  );
};
