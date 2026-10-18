import { useId, type CSSProperties } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { laboratoryLimits } from "../../../domain/gravitation";
import { gravityExperimentStyles as styles } from "./GravityExperiment.styles";

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
  // A solved formula may supply valid decimals between slider steps. Keep that
  // exact shared value; step snapping applies only when the user moves a control.
  const roundSliderValue = (next: number) => Number((control.min +
    Math.round((next - control.min) / control.step) * control.step).toFixed(10));
  const aligned = value === roundSliderValue(value);
  return (
    <div
      className={styles["slider-field"]}
      style={
        {
          "--slider-color": control.color,
          "--slider-progress": `${((value - control.min) / (control.max - control.min)) * 100}%`,
        } as CSSProperties
      }
    >
      <div>
        <label htmlFor={id}>{t(control.label)}</label>
        <output htmlFor={id} aria-live="off">
          {format.number(value)} <span>{control.unit}</span>
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={control.min}
        max={control.max}
        step={aligned ? control.step : "any"}
        value={value}
        aria-valuetext={`${format.number(value)} ${control.unit}`}
        aria-describedby={descriptionId}
        onChange={(event) => onChange(roundSliderValue(Number(event.target.value)))}
        onKeyDown={(event) => {
          const directions: Record<string, number> = {
            ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1,
            PageUp: 10, PageDown: -10,
          };
          const direction = directions[event.key];
          if (direction === undefined && event.key !== "Home" && event.key !== "End") return;
          event.preventDefault();
          const next = event.key === "Home" ? control.min
            : event.key === "End" ? control.max
              : Number((value + direction * control.step).toFixed(10));
          onChange(Math.min(control.max, Math.max(control.min, next)));
        }}
      />
      <div aria-hidden="true" className={styles["range-limits"]}>
        <span>
          {format.number(control.min)} {control.unit}
        </span>
        <span>
          {format.number(control.max)} {control.unit}
        </span>
      </div>
    </div>
  );
};
