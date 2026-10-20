"use client";

import { useId, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Icon } from "@/components/icons";
import { useGalleryState } from "@/features/three-body/presentation/providers/GalleryProvider";

import { OrbitAnimation, bodyColors } from "../shared/OrbitAnimation";
import type { OrbitPlayback } from "../../../types/animation.types";
import { orbitAnimationStyles as styles } from "../shared/OrbitAnimation.styles";

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
    <figure className={styles.player} lang={locale} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        {t("detail.simulationTitle")}
      </h2>

      {/* Animación de la órbita */}
      <div className={styles.viewport}>
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
        className={styles.controls}
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
        <ul className={styles.legend} aria-label={t("animationBodies")}>
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
