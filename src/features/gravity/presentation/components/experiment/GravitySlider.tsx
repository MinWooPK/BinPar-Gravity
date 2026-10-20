import { useId, type CSSProperties } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { laboratoryLimits } from "../../../domain/gravitation";
import { gravityExperimentStyles as styles } from "./GravityExperiment.styles";

// Define los controles de masa y distancia, sus límites, unidades y colores.
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

// Muestra un slider interactivo para modificar las masas o la distancia
// del laboratorio, respetando sus límites e incrementos permitidos.
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
  // Genera un identificador único para relacionar el slider con su etiqueta.
  const id = useId();

  // Obtiene las traducciones de los controles.
  const t = useTranslations("Gravity");

  // Formatea los valores numéricos según el idioma.
  const format = useFormatter();

  // Ajusta los valores al incremento permitido cuando el usuario mueve el slider.
  const roundSliderValue = (next: number) =>
    Number(
      (
        control.min +
        Math.round((next - control.min) / control.step) * control.step
      ).toFixed(10),
    );

  // Comprueba si el valor actual coincide con un incremento del slider.
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
        onChange={(event) =>
          onChange(roundSliderValue(Number(event.target.value)))
        }
        onKeyDown={(event) => {
          // Define los incrementos asociados a las teclas de dirección.
          const directions: Record<string, number> = {
            ArrowRight: 1,
            ArrowUp: 1,
            ArrowLeft: -1,
            ArrowDown: -1,
            PageUp: 10,
            PageDown: -10,
          };

          // Obtiene la dirección del movimiento según la tecla pulsada.
          const direction = directions[event.key];

          if (
            direction === undefined &&
            event.key !== "Home" &&
            event.key !== "End"
          )
            return;

          event.preventDefault();

          // Calcula el nuevo valor del slider mediante el teclado.
          const next =
            event.key === "Home"
              ? control.min
              : event.key === "End"
                ? control.max
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
