"use client";

import { useId, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Icon } from "@/components/icons/index";
import { useGalleryState } from "@/features/three-body/presentation/providers/GalleryProvider";
import { OrbitAnimation, bodyColors } from "../shared/OrbitAnimation";
import type { OrbitPlayback } from "../../../types/animation.types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { orbitAnimationStyles as styles } from "../shared/OrbitAnimation.styles";

export const OrbitPlayer = ({ data, name, children }: { data: OrbitPlayback; name: string; children?: ReactNode }) => {
  const t = useTranslations("ThreeBody");
  const locale = useLocale();
  const { state, update } = useGalleryState();
  const reducedMotion = useReducedMotion();
  const playing = state.playing ?? !reducedMotion;
  const [speed, setSpeed] = useState(1);
  const [resetKey, setResetKey] = useState(0);
  const titleId = useId();

  return (
    <figure className={styles.player} lang={locale} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>{t("detail.simulationTitle")}</h2>
      <div className={styles.viewport}>
        <OrbitAnimation data={data} name={name} playing={playing} speed={speed} resetKey={resetKey} fitToTrajectory />
      </div>
      <div className={styles.controls} role="group" aria-label={t("animationControls")}>
        <button type="button" onClick={() => update({ playing: !playing })}>
          <Icon name={playing ? "pause" : "play"} />
          {t(playing ? "animationPause" : "animationPlay")}
        </button>
        <button type="button" onClick={() => setResetKey((key) => key + 1)}>
          <Icon name="reset" />{t("animationReset")}
        </button>
        <label>
          {t("animationSpeed")}
          <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
            <option value="0.5">{new Intl.NumberFormat(locale).format(0.5)}×</option>
            <option value="1">1×</option>
            <option value="2">2×</option>
          </select>
        </label>
      </div>
      <figcaption>
        <ul className={styles.legend} aria-label={t("animationBodies")}>
          {bodyColors.map((color, index) => (
            <li key={color}><span style={{ backgroundColor: color }} aria-hidden="true" />{t("animationBody", { number: index + 1 })}</li>
          ))}
        </ul>
        <p>{t("animationTiming")}</p>
        {children}
      </figcaption>
    </figure>
  );
};
