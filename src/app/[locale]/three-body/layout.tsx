import type { ReactNode } from "react";
import { GalleryProvider } from "@/components/gallery-state";

export default function ThreeBodyLayout({ children }: { children: ReactNode }) {
  return <GalleryProvider>{children}</GalleryProvider>;
}
