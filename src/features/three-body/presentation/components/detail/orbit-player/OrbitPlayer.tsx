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

// Controla la animación, la velocidad y la reproducción.
export const OrbitPlayer = ({ data, name, children }: OrbitPlayerProps) => {
  const t = useTranslations("ThreeBody");
  const locale = useLocale();
  const { state, update } = useGalleryState();

  const [speed, setSpeed] = useState(1);
  const [resetKey, setResetKey] = useState(0);
  const titleId = useId();

  const playing = state.detailPlaying;

  return (
    <figure
      className="lab-three-body-animation-player m-0 flex min-w-0 flex-col rounded-[14px] 
      border border-lab-line bg-[linear-gradient(145deg,#14192aeb,#0e1321f2)] 
      px-4 py-3.5 shadow-[0_12px_32px_#03061126] max-[374px]:px-3"
      lang={locale}
      aria-labelledby={titleId}
    >
      <h2
        id={titleId}
        className="m-0 text-lg leading-[1.4] font-semibold text-[#e8edf7]"
      >
        {t("detail.simulationTitle")}
      </h2>

      <div className="grid min-w-0 flex-1 place-items-center py-2">
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
