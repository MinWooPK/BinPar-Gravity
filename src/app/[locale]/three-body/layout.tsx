import type { ReactNode } from "react";
import { GalleryProvider } from "@/features/three-body/components/GalleryProvider";

export default function ThreeBodyLayout({ children }: { children: ReactNode }) {
  return <GalleryProvider>{children}</GalleryProvider>;
}
