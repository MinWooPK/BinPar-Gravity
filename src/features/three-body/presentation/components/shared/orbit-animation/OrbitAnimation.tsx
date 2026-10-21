"use client";

import { useMemo } from "react";

import { getOrbitTrails } from "../../../../application/orbitPlayback";
import type { OrbitPlayback } from "../../../../types/animation.types";

import { getOrbitViewBox } from "./orbitAnimation.helpers";
import { useOrbitAnimationPlayback } from "./useOrbitAnimationPlayback";
import { OrbitAnimationSvg } from "./OrbitAnimationSvg";

type OrbitAnimationProps = {
  data: OrbitPlayback;
  name: string;
  playing: boolean;
  speed?: number;
  resetKey?: number;
  fitToTrajectory?: boolean;
};

// Controla la reproducción y la visualización de la órbita.
export const OrbitAnimation = ({
  data,
  name,
  playing,
  speed = 1,
  resetKey = 0,
  fitToTrajectory = false,
}: OrbitAnimationProps) => {
  // Prepara las trayectorias y el encuadre SVG.
  const trails = useMemo(() => getOrbitTrails(data), [data]);

  const viewBox = useMemo(
    () => getOrbitViewBox(data, fitToTrajectory),
    [data, fitToTrajectory],
  );

  // Gestiona las posiciones durante la reproducción.
  const { stage, bodies } = useOrbitAnimationPlayback({
    data,
    playing,
    speed,
    resetKey,
  });

  return (
    <OrbitAnimationSvg
      data={data}
      name={name}
      trails={trails}
      viewBox={viewBox}
      stageRef={stage}
      bodyRefs={bodies}
    />
  );
};
