import type { ReactNode } from "react";
import GravityStarfield from "@/features/gravity/components/GravityStarfield";
import { GalleryProvider } from "@/features/three-body/components/GalleryProvider";

export default function ThreeBodyLayout({ children }: { children: ReactNode }) {
  return (
    <GalleryProvider>
      <GravityStarfield />
      {children}
    </GalleryProvider>
  );
}
