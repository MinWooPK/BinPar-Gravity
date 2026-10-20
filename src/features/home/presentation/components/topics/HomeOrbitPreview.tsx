"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { OrbitAnimation } from "@/features/three-body/presentation/components/shared/OrbitAnimation";
import type { OrbitPlayback } from "../../../../three-body/types/animation.types";
import { homeExperienceStyles as styles } from "../HomeExperience.styles";

export const HomeOrbitPreview = ({ data }: { data: OrbitPlayback }) => {
  const reducedMotion = useReducedMotion();
  return (
    <div className={styles.orbitPreview}>
      <OrbitAnimation
        data={data}
        name="Figura de ocho"
        playing={!reducedMotion}
      />
    </div>
  );
};
