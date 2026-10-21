"use client";

import { useMemo } from "react";

import { getOrbitTrails } from "../../../../application/orbitPlayback";
import type { OrbitPlayback } from "../../../../types/animation.types";

import { getOrbitViewBox } from "./orbitAnimation.helpers";
import { useOrbitAnimationPlayback } from "./useOrbitAnimationPlayback";
import { OrbitAnimationSvg } from "./OrbitAnimationSvg";

// Define las propiedades originales del reproductor orbital.
type OrbitAnimationProps = {
  data: OrbitPlayback;
  name: string;
  playing: boolean;
  speed?: number;
  resetKey?: number;
  fitToTrajectory?: boolean;
};

// Coordina los cálculos visuales, la reproducción y la representación SVG.
export const OrbitAnimation = ({
  data,
  name,
  playing,
  speed = 1,
  resetKey = 0,
  fitToTrajectory = false,
}: OrbitAnimationProps) => {
  // Genera las trayectorias visuales sin recalcularlas en cada render.
  const trails = useMemo(() => getOrbitTrails(data), [data]);

  // Ajusta opcionalmente el encuadre a la trayectoria completa.
  const viewBox = useMemo(
    () => getOrbitViewBox(data, fitToTrajectory),
    [data, fitToTrajectory],
  );

  // Gestiona la animación manteniendo el tiempo entre pausas y cambios de vista.
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
