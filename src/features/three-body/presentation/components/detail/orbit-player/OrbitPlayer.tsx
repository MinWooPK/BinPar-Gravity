"use client";

import { useId, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";

import { useGalleryState } from "@/features/three-body/presentation/providers/GalleryProvider";
import { OrbitAnimation } from "../../shared/OrbitAnimation";
import type { OrbitPlayback } from "../../../../types/animation.types";

import { OrbitPlayerControls } from "./OrbitPlayerControls";
import { OrbitPlayerCaption } from "./OrbitPlayerCaption";

type OrbitPlayerProps = {
  data: OrbitPlayback;
  name: string;
  children?: ReactNode;
};

// Coordina la animación de detalle, sus controles y la información de los cuerpos.
export const OrbitPlayer = ({ data, name, children }: OrbitPlayerProps) => {
  const t = useTranslations("ThreeBody");
  const locale = useLocale();

  // La reproducción del detalle sigue compartiéndose mediante GalleryProvider.
  const { state, update } = useGalleryState();
  const playing = state.detailPlaying;

  // La velocidad y el reinicio son exclusivos de este reproductor.
  const [speed, setSpeed] = useState(1);
  const [resetKey, setResetKey] = useState(0);

  const titleId = useId();

  return (
    <figure
      className="lab-three-body-animation-player flex flex-col min-w-0 m-0 [padding:14px_16px] border border-solid border-lab-line [border-radius:14px] [background:linear-gradient(145deg,_#14192aeb,_#0e1321f2)] [box-shadow:0_12px_32px_#03061126] [@media(max-width:374px)]:[padding-inline:12px] [&_figcaption_>_p]:[max-width:52rem] [&_figcaption_>_p]:[margin:0.375rem_auto_0] [&_figcaption_>_p]:[color:#b6bfd3] [&_figcaption_>_p]:[font-size:0.8125rem] [&_figcaption_>_p]:[line-height:1.5] [&_figcaption_>_p]:text-center"
      lang={locale}
      aria-labelledby={titleId}
    >
      <h2
        id={titleId}
        className="[.lab-three-body-animation-player_&]:m-0 [.lab-three-body-animation-player_&]:[color:#e8edf7] [.lab-three-body-animation-player_&]:[font-size:1.125rem] [.lab-three-body-animation-player_&]:font-semibold [.lab-three-body-animation-player_&]:[line-height:1.4]"
      >
        {t("detail.simulationTitle")}
      </h2>

      {/* El SVG permanece montado cuando cambia la velocidad o la pausa. */}
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

      <OrbitPlayerControls
        playing={playing}
        speed={speed}
        onTogglePlaying={() => update({ detailPlaying: !playing })}
        onReset={() => setResetKey((key) => key + 1)}
        onChangeSpeed={setSpeed}
      />

      <OrbitPlayerCaption>{children}</OrbitPlayerCaption>
    </figure>
  );
};
