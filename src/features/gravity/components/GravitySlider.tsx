import { useId, type CSSProperties } from "react";
import { useFormatter, useTranslations } from "next-intl";
import styles from "./GravityExperiment.module.css";

export const gravityControls = [
  {
    key: "mass1",
    label: "firstMass",
    min: 10,
    max: 100,
    step: 1,
    scale: 1e12,
    unit: "× 10¹² kg",
    color: "#aa97ff",
  },
  {
    key: "mass2",
    label: "secondMass",
    min: 10,
    max: 100,
    step: 1,
    scale: 1e12,
    unit: "× 10¹² kg",
    color: "#5ee7d5",
  },
  {
    key: "distance",
    label: "centreDistance",
    min: 5,
    max: 20,
    step: 0.1,
    scale: 1000,
    unit: "km",
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
        step={control.step}
        value={value}
        aria-valuetext={`${format.number(value)} ${control.unit}`}
        aria-describedby={descriptionId}
        onChange={(event) => onChange(Number(event.target.value))}
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

