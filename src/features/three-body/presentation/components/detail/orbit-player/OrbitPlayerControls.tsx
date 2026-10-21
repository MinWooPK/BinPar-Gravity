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

// Muestra los controles sin duplicar el estado del reproductor.
export const OrbitPlayerControls = ({
  playing,
  speed,
  onTogglePlaying,
  onReset,
  onChangeSpeed,
}: OrbitPlayerControlsProps) => {
  const t = useTranslations("ThreeBody");
  const locale = useLocale();

  return (
    <div
      className="[.lab-three-body-animation-player_&]:flex [.lab-three-body-animation-player_&]:items-center [.lab-three-body-animation-player_&]:justify-center [.lab-three-body-animation-player_&]:flex-wrap [.lab-three-body-animation-player_&]:[gap:0.5rem] [.lab-three-body-animation-player_&]:[padding-block:0.625rem] [.lab-three-body-animation-player_&]:[border-block:1px_solid_#30364a] [.lab-three-body-animation-player_&_button]:inline-flex [.lab-three-body-animation-player_&_button]:[min-height:44px] [.lab-three-body-animation-player_&_button]:items-center [.lab-three-body-animation-player_&_button]:justify-center [.lab-three-body-animation-player_&_button]:[gap:0.375rem] [.lab-three-body-animation-player_&_button]:[padding:0.5rem_0.75rem] [.lab-three-body-animation-player_&_button]:[border:1px_solid_#60517f] [.lab-three-body-animation-player_&_button]:[border-radius:0.6rem] [.lab-three-body-animation-player_&_button]:[background:#211d32] [.lab-three-body-animation-player_&_button]:[color:#e3dafa] [.lab-three-body-animation-player_&_button]:[font-size:0.875rem] [.lab-three-body-animation-player_&_button]:[line-height:1.4] [.lab-three-body-animation-player_&_button]:cursor-pointer [.lab-three-body-animation-player_&_button]:[transition:background-color_150ms_ease,_border-color_150ms_ease] [.lab-three-body-animation-player_&_select]:inline-flex [.lab-three-body-animation-player_&_select]:[min-height:44px] [.lab-three-body-animation-player_&_select]:items-center [.lab-three-body-animation-player_&_select]:justify-center [.lab-three-body-animation-player_&_select]:[gap:0.375rem] [.lab-three-body-animation-player_&_select]:[padding:0.5rem_0.75rem] [.lab-three-body-animation-player_&_select]:[border:1px_solid_#60517f] [.lab-three-body-animation-player_&_select]:[border-radius:0.6rem] [.lab-three-body-animation-player_&_select]:[background:#211d32] [.lab-three-body-animation-player_&_select]:[color:#e3dafa] [.lab-three-body-animation-player_&_select]:[font-size:0.875rem] [.lab-three-body-animation-player_&_select]:[line-height:1.4] [.lab-three-body-animation-player_&_select]:cursor-pointer [.lab-three-body-animation-player_&_select]:[transition:background-color_150ms_ease,_border-color_150ms_ease] [.lab-three-body-animation-player_&_button:hover]:[background:#302748] [.lab-three-body-animation-player_&_button:hover]:[border-color:#aa97ff] [.lab-three-body-animation-player_&_select:hover]:[background:#302748] [.lab-three-body-animation-player_&_select:hover]:[border-color:#aa97ff] [.lab-three-body-animation-player_&_:is(button,_select):focus-visible]:[outline:3px_solid_#c7baff] [.lab-three-body-animation-player_&_:is(button,_select):focus-visible]:[outline-offset:4px] [.lab-three-body-animation-player_&_label]:inline-flex [.lab-three-body-animation-player_&_label]:items-center [.lab-three-body-animation-player_&_label]:flex-wrap [.lab-three-body-animation-player_&_label]:[gap:0.5rem] [.lab-three-body-animation-player_&_label]:[color:#b6bfd3] [.lab-three-body-animation-player_&_label]:[font-size:0.875rem] [@media_(prefers-reduced-motion:_reduce)]:[.lab-three-body-animation-player_&_:is(button,_select)]:[transition:none]"
      role="group"
      aria-label={t("animationControls")}
    >
      {/* Reproduce o pausa únicamente el detalle de la órbita. */}
      <button type="button" onClick={onTogglePlaying}>
        <Icon name={playing ? "pause" : "play"} />
        {t(playing ? "animationPause" : "animationPlay")}
      </button>

      {/* Reinicia la animación sin cambiar los parámetros de reproducción. */}
      <button type="button" onClick={onReset}>
        <Icon name="reset" />
        {t("animationReset")}
      </button>

      {/* Cambia la velocidad y respeta el formato decimal del idioma. */}
      <label>
        {t("animationSpeed")}
        <select
          value={speed}
          onChange={(event) => onChangeSpeed(Number(event.target.value))}
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
