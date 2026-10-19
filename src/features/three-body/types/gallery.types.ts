export type GalleryState = {
  scroll: number;
  galleryPlaying: boolean;
  detailPlaying: boolean;
  galleryView: "intro" | "gallery";
  galleryPage: number;
};
