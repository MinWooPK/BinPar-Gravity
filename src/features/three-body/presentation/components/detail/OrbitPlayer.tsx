"use client";

import { useId, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Icon } from "@/components/icons";
import { useGalleryState } from "@/features/three-body/presentation/providers/GalleryProvider";

import { OrbitAnimation, bodyColors } from "../shared/OrbitAnimation";
import type { OrbitPlayback } from "../../../types/animation.types";

export const OrbitPlayer = ({
  data,
  name,
  children,
}: {
  data: OrbitPlayback;
  name: string;
  children?: ReactNode;
}) => {
  const t = useTranslations("ThreeBody");
  const locale = useLocale();

  // Estado independiente de la galería
  const { state, update } = useGalleryState();
  const playing = state.detailPlaying;

  // Controles propios del reproductor
  const [speed, setSpeed] = useState(1);
  const [resetKey, setResetKey] = useState(0);

  const titleId = useId();

  return (
    <figure className="lab-three-body-animation-player flex flex-col min-w-0 m-0 [padding:14px_16px] border border-solid border-lab-line [border-radius:14px] [background:linear-gradient(145deg,_#14192aeb,_#0e1321f2)] [box-shadow:0_12px_32px_#03061126] [@media(max-width:374px)]:[padding-inline:12px] [&_figcaption_>_p]:[max-width:52rem] [&_figcaption_>_p]:[margin:0.375rem_auto_0] [&_figcaption_>_p]:[color:#b6bfd3] [&_figcaption_>_p]:[font-size:0.8125rem] [&_figcaption_>_p]:[line-height:1.5] [&_figcaption_>_p]:text-center" lang={locale} aria-labelledby={titleId}>
      <h2 id={titleId} className="[.lab-three-body-animation-player_&]:m-0 [.lab-three-body-animation-player_&]:[color:#e8edf7] [.lab-three-body-animation-player_&]:[font-size:1.125rem] [.lab-three-body-animation-player_&]:font-semibold [.lab-three-body-animation-player_&]:[line-height:1.4]">
        {t("detail.simulationTitle")}
      </h2>

      {/* Animación de la órbita */}
      <div className="[.lab-three-body-animation-player_&]:grid [.lab-three-body-animation-player_&]:[flex:1] [.lab-three-body-animation-player_&]:min-w-0 [.lab-three-body-animation-player_&]:place-items-center [.lab-three-body-animation-player_&]:[padding-block:8px]">
        <OrbitAnimation
          data={data}
          name={name}
          playing={playing}
          speed={speed}
          resetKey={resetKey}
          fitToTrajectory
        />
      </div>

      {/* Controles */}
      <div
        className="[.lab-three-body-animation-player_&]:flex [.lab-three-body-animation-player_&]:items-center [.lab-three-body-animation-player_&]:justify-center [.lab-three-body-animation-player_&]:flex-wrap [.lab-three-body-animation-player_&]:[gap:0.5rem] [.lab-three-body-animation-player_&]:[padding-block:0.625rem] [.lab-three-body-animation-player_&]:[border-block:1px_solid_#30364a] [.lab-three-body-animation-player_&_button]:inline-flex [.lab-three-body-animation-player_&_button]:[min-height:44px] [.lab-three-body-animation-player_&_button]:items-center [.lab-three-body-animation-player_&_button]:justify-center [.lab-three-body-animation-player_&_button]:[gap:0.375rem] [.lab-three-body-animation-player_&_button]:[padding:0.5rem_0.75rem] [.lab-three-body-animation-player_&_button]:[border:1px_solid_#60517f] [.lab-three-body-animation-player_&_button]:[border-radius:0.6rem] [.lab-three-body-animation-player_&_button]:[background:#211d32] [.lab-three-body-animation-player_&_button]:[color:#e3dafa] [.lab-three-body-animation-player_&_button]:[font-size:0.875rem] [.lab-three-body-animation-player_&_button]:[line-height:1.4] [.lab-three-body-animation-player_&_button]:cursor-pointer [.lab-three-body-animation-player_&_button]:[transition:background-color_150ms_ease,_border-color_150ms_ease] [.lab-three-body-animation-player_&_select]:inline-flex [.lab-three-body-animation-player_&_select]:[min-height:44px] [.lab-three-body-animation-player_&_select]:items-center [.lab-three-body-animation-player_&_select]:justify-center [.lab-three-body-animation-player_&_select]:[gap:0.375rem] [.lab-three-body-animation-player_&_select]:[padding:0.5rem_0.75rem] [.lab-three-body-animation-player_&_select]:[border:1px_solid_#60517f] [.lab-three-body-animation-player_&_select]:[border-radius:0.6rem] [.lab-three-body-animation-player_&_select]:[background:#211d32] [.lab-three-body-animation-player_&_select]:[color:#e3dafa] [.lab-three-body-animation-player_&_select]:[font-size:0.875rem] [.lab-three-body-animation-player_&_select]:[line-height:1.4] [.lab-three-body-animation-player_&_select]:cursor-pointer [.lab-three-body-animation-player_&_select]:[transition:background-color_150ms_ease,_border-color_150ms_ease] [.lab-three-body-animation-player_&_button:hover]:[background:#302748] [.lab-three-body-animation-player_&_button:hover]:[border-color:#aa97ff] [.lab-three-body-animation-player_&_select:hover]:[background:#302748] [.lab-three-body-animation-player_&_select:hover]:[border-color:#aa97ff] [.lab-three-body-animation-player_&_:is(button,_select):focus-visible]:[outline:3px_solid_#c7baff] [.lab-three-body-animation-player_&_:is(button,_select):focus-visible]:[outline-offset:4px] [.lab-three-body-animation-player_&_label]:inline-flex [.lab-three-body-animation-player_&_label]:items-center [.lab-three-body-animation-player_&_label]:flex-wrap [.lab-three-body-animation-player_&_label]:[gap:0.5rem] [.lab-three-body-animation-player_&_label]:[color:#b6bfd3] [.lab-three-body-animation-player_&_label]:[font-size:0.875rem] [@media_(prefers-reduced-motion:_reduce)]:[.lab-three-body-animation-player_&_:is(button,_select)]:[transition:none]"
        role="group"
        aria-label={t("animationControls")}
      >
        {/* Play / Pausa independiente */}
        <button
          type="button"
          onClick={() => update({ detailPlaying: !playing })}
        >
          <Icon name={playing ? "pause" : "play"} />
          {t(playing ? "animationPause" : "animationPlay")}
        </button>

        {/* Reiniciar animación */}
        <button type="button" onClick={() => setResetKey((key) => key + 1)}>
          <Icon name="reset" />
          {t("animationReset")}
        </button>

        {/* Velocidad */}
        <label>
          {t("animationSpeed")}
          <select
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
          >
            <option value="0.5">
              {new Intl.NumberFormat(locale).format(0.5)}×
            </option>
            <option value="1">1×</option>
            <option value="2">2×</option>
          </select>
        </label>
      </div>

      {/* Información de la órbita */}
      <figcaption>
        <ul className="[.lab-three-body-animation-player_&]:flex [.lab-three-body-animation-player_&]:justify-center [.lab-three-body-animation-player_&]:flex-wrap [.lab-three-body-animation-player_&]:[gap:0.5rem_1rem] [.lab-three-body-animation-player_&]:[margin:0.625rem_0_0] [.lab-three-body-animation-player_&]:p-0 [.lab-three-body-animation-player_&]:list-none [.lab-three-body-animation-player_&]:[color:#e3dafa] [.lab-three-body-animation-player_&]:[font-size:0.875rem] [.lab-three-body-animation-player_&_li]:inline-flex [.lab-three-body-animation-player_&_li]:items-center [.lab-three-body-animation-player_&_li]:[gap:0.5rem] [.lab-three-body-animation-player_&_span]:[width:0.55rem] [.lab-three-body-animation-player_&_span]:[height:0.55rem] [.lab-three-body-animation-player_&_span]:[border-radius:50%]" aria-label={t("animationBodies")}>
          {bodyColors.map((color, index) => (
            <li key={color}>
              <span style={{ backgroundColor: color }} aria-hidden="true" />
              {t("animationBody", { number: index + 1 })}
            </li>
          ))}
        </ul>

        <p>{t("animationTiming")}</p>

        {children}
      </figcaption>
    </figure>
  );
};
