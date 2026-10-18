import type { ReactNode } from "react";
import { SpaceStarfield } from "@/components/layout/SpaceStarfield";
import { GalleryProvider } from "@/features/three-body/presentation/providers/GalleryProvider";

const ThreeBodyLayout = ({ children }: { children: ReactNode }) => {
  return (
    <GalleryProvider>
      <SpaceStarfield />
      {children}
    </GalleryProvider>
  );
};

export default ThreeBodyLayout;
