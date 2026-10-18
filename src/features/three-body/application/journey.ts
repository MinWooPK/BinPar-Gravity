import type { ThreeBodyStageId } from "../types/journey.types";
export const threeBodyStages = [
  { id: "discover", number: "01", title: "discoverTitle", description: "discoverDescription" },
  { id: "gallery", number: "02", title: "galleryTitle", description: "galleryDescription" },
] as const;

export const getThreeBodyStage = (hash: string): ThreeBodyStageId | null =>
  threeBodyStages.find(({ id }) => hash === `#${id}`)?.id ?? null;
