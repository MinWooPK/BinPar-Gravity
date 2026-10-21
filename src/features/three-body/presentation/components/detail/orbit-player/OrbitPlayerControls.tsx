"use client";

import { useLocale, useTranslations } from "next-intl";
import { Icon } from "@/components/icons";

type OrbitPlayerControlsProps = {
  playing: boolean;
  speed: number;
  onTogglePlaying: () => void;
  onReset: () => void;
  onChangeSpeed: (speed: number) => void;
};

// Controles de reproducción, reinicio y velocidad.
export const OrbitPlayerControls = ({
  playing,
  speed,
  onTogglePlaying,
  onReset,
  onChangeSpeed,
}: OrbitPlayerControlsProps) => {
  const t = useTranslations("ThreeBody");
  const locale = useLocale();

  // Estilos compartidos por botones y selector.
  const controlClassName =
    "inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-[0.6rem]" +
    "border border-[#60517f] bg-[#211d32] px-3 py-2 text-sm leading-[1.4] text-[#e3dafa] " +
    "transition-[background-color,border-color] duration-150 ease-in hover:border-[#aa97ff] " +
    "hover:bg-[#302748] focus-visible:outline-[3px] focus-visible:outline-[#c7baff] focus-visible:outline-offset-4 motion-reduce:transition-none";

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2 border-y border-[#30364a] py-2.5"
      role="group"
      aria-label={t("animationControls")}
    >
      <button
        type="button"
        onClick={onTogglePlaying}
        className={controlClassName}
      >
        <Icon name={playing ? "pause" : "play"} />
        {t(playing ? "animationPause" : "animationPlay")}
      </button>

      <button type="button" onClick={onReset} className={controlClassName}>
        <Icon name="reset" />
        {t("animationReset")}
      </button>

      <label className="inline-flex flex-wrap items-center gap-2 text-sm text-[#b6bfd3]">
        {t("animationSpeed")}

        <select
          value={speed}
          onChange={(event) => onChangeSpeed(Number(event.target.value))}
          className={controlClassName}
        >
          <option value="0.5">
            {new Intl.NumberFormat(locale).format(0.5)}×
          </option>
          <option value="1">1×</option>
          <option value="2">2×</option>
        </select>
      </label>
    </div>
  );
};
