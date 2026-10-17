"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { OrbitAnimation } from "@/features/three-body/components/OrbitAnimation";
import type { OrbitPlayback } from "@/features/three-body/components/orbit-visualization";
import styles from "./HomeExperience.module.css";

export const HomeOrbitPreview = ({ data }: { data: OrbitPlayback }) => {
  const reducedMotion = useReducedMotion();
  return (
    <div className={styles.orbitPreview}>
      <OrbitAnimation data={data} name="Figura de ocho" playing={!reducedMotion} />
    </div>
  );
};
