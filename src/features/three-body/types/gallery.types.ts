export type GalleryState = {
  scroll: number;
  galleryPlaying: boolean;
  detailPlaying: boolean;
  categoryFilter: OrbitCategoryFilter;
  galleryView: "intro" | "gallery";
  galleryPage: number;
};

export type OrbitCategoryFilter =
  | "all"
  | "Clásica"
  | "Coreografía"
  | "Periódica";
