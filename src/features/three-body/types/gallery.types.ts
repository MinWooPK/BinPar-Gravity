import type { OrbitDefinition } from "./orbit.types";

export type Category = "Todas" | OrbitDefinition["category"];
export type GalleryState = {
  query: string;
  category: Category;
  order: "curated" | "alphabetic";
  view: "grid" | "list";
  scroll: number;
  playing: boolean | null;
};
