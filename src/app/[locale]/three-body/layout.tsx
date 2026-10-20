import type { ReactNode } from "react";
import { SpaceStarfield } from "@/components/layout/SpaceStarfield";
import { GalleryProvider } from "@/features/three-body/presentation/providers/GalleryProvider";

import { ThreeBodyExperimentProvider } from "@/features/three-body/presentation/providers/ThreeBodyExperimentProvider";

const ThreeBodyLayout = ({ children }: { children: ReactNode }) => {
  return (
    <GalleryProvider>
      <ThreeBodyExperimentProvider>
        <SpaceStarfield />
        {children}
      </ThreeBodyExperimentProvider>
    </GalleryProvider>
  );
};

export default ThreeBodyLayout;
