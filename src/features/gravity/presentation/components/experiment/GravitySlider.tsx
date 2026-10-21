import { useId, type CSSProperties } from "react";
import { useFormatter, useTranslations } from "next-intl";

import { laboratoryLimits } from "../../../domain/gravitation";

// Controles de masa y distancia.
export const gravityControls = [
  {
    key: "mass1",
    label: "firstMass",
    ...laboratoryLimits.mass1,
    unit: "kg",
    color: "#aa97ff",
  },
  {
    key: "mass2",
    label: "secondMass",
    ...laboratoryLimits.mass2,
    unit: "kg",
    color: "#5ee7d5",
  },
  {
    key: "distance",
    label: "centreDistance",
    ...laboratoryLimits.distance,
    unit: "m",
    color: "#b9c1dc",
  },
] as const;

// Permite modificar las masas y la distancia.
export const GravitySlider = ({
  control,
  value,
  onChange,
  descriptionId,
}: {
  control: (typeof gravityControls)[number];
  value: number;
  onChange: (value: number) => void;
  descriptionId: string;
}) => {
  const id = useId();
  const t = useTranslations("Gravity");
  const format = useFormatter();

  // Ajusta el valor al incremento permitido.
  const roundSliderValue = (next: number) =>
    Number(
      (
        control.min +
        Math.round((next - control.min) / control.step) * control.step
      ).toFixed(10),
    );

  const aligned = value === roundSliderValue(value);

  return (
    <div
      className="min-w-0"
      style={
        {
          "--slider-color": control.color,
          "--slider-progress": `${((value - control.min) / (control.max - control.min)) * 100}%`,
        } as CSSProperties
      }
    >
      {/* Nombre y valor del control. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-base">
        <label htmlFor={id} className="min-w-0 flex-[1_1_140px] text-[#b6bdd0]">
          {t(control.label)}
        </label>

        <output
          htmlFor={id}
          aria-live="off"
          className="shrink-0 text-(--slider-color) tabular-nums"
        >
          {format.number(value)}{" "}
          <span className="text-[.85em] text-[#a8afc3]">{control.unit}</span>
        </output>
      </div>

      {/* Control deslizante. */}
      <input
        id={id}
        type="range"
        className="lab-gravity-slider m-0 block h-11 w-full cursor-pointer appearance-none bg-transparent accent-(--slider-color)"
        min={control.min}
        max={control.max}
        step={aligned ? control.step : "any"}
        value={value}
        aria-valuetext={`${format.number(value)} ${control.unit}`}
        aria-describedby={descriptionId}
        onChange={(event) =>
          onChange(roundSliderValue(Number(event.target.value)))
        }
        onKeyDown={(event) => {
          // Incrementos de cada tecla.
          const directions: Record<string, number> = {
            ArrowRight: 1,
            ArrowUp: 1,
            ArrowLeft: -1,
            ArrowDown: -1,
            PageUp: 10,
            PageDown: -10,
          };

          const direction = directions[event.key];

          if (
            direction === undefined &&
            event.key !== "Home" &&
            event.key !== "End"
          )
            return;

          event.preventDefault();

          // Calcula el valor según la tecla pulsada.
          const next =
            event.key === "Home"
              ? control.min
              : event.key === "End"
                ? control.max
                : Number((value + direction * control.step).toFixed(10));

          onChange(Math.min(control.max, Math.max(control.min, next)));
        }}
      />

      {/* Valores mínimo y máximo. */}
      <div
        aria-hidden="true"
        className="flex justify-between gap-2 text-[13px] leading-[1.2] text-[#a0a8bd]"
      >
        <span className="min-w-0 wrap-anywhere">
          {format.number(control.min)} {control.unit}
        </span>

        <span className="min-w-0 wrap-anywhere">
          {format.number(control.max)} {control.unit}
        </span>
      </div>
    </div>
  );
};
