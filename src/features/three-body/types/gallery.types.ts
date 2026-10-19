import type { OrbitDefinition } from "./orbit.types";

export type Category = "Todas" | OrbitDefinition["category"];

export type GalleryState = {
  scroll: number;
  galleryPlaying: boolean;
  detailPlaying: boolean;
};
