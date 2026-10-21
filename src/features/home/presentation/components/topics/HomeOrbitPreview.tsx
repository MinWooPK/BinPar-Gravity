"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { OrbitAnimation } from "@/features/three-body/presentation/components/shared/OrbitAnimation";
import type { OrbitPlayback } from "../../../../three-body/types/animation.types";

export const HomeOrbitPreview = ({ data }: { data: OrbitPlayback }) => {
  const reducedMotion = useReducedMotion();
  return (
    <div className="[&>svg]:block [&>svg]:w-full [&>svg]:h-full [&>svg]:[transform:scale(1.75)] w-full h-full">
      <OrbitAnimation
        data={data}
        name="Figura de ocho"
        playing={!reducedMotion}
      />
    </div>
  );
};
