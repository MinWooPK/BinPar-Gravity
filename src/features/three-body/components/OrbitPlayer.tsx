"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Icon } from "@/components/icons";
import { useGalleryState } from "@/components/gallery-state";
import { OrbitAnimation, bodyColors } from "./OrbitAnimation";
import type { OrbitPlayback } from "./orbit-visualization";
import { useReducedMotion } from "./useReducedMotion";
import styles from "./OrbitAnimation.module.css";

export function OrbitPlayer({ data, name }: { data: OrbitPlayback; name: string }) {
  const t = useTranslations("ThreeBody");
  const locale = useLocale();
  const { state, update } = useGalleryState();
  const reducedMotion = useReducedMotion();
  const playing = state.playing ?? !reducedMotion;
  const [speed, setSpeed] = useState(1);
  const [resetKey, setResetKey] = useState(0);

  return (
    <figure className={styles.player} lang={locale}>
      <OrbitAnimation data={data} name={name} playing={playing} speed={speed} resetKey={resetKey} />
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
            <option value="0.5">0.5×</option>
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
      </figcaption>
    </figure>
  );
}
