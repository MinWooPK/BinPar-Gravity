import type { ThreeBodyStageId } from "../types/journey.types";

export const threeBodyStages = [
  {
    id: "discover",
    number: "01",
    title: "discoverTitle",
    description: "discoverDescription",
  },
  {
    id: "understand",
    number: "02",
    title: "understandTitle",
    description: "understandDescription",
  },
  {
    id: "gallery",
    number: "03",
    title: "galleryTitle",
    description: "galleryDescription",
  },
  {
    id: "experiment",
    number: "04",
    title: "experimentTitle",
    description: "experimentDescription",
  },
] as const;

export const getThreeBodyStage = (hash: string): ThreeBodyStageId | null =>
  threeBodyStages.find(({ id }) => hash === `#${id}`)?.id ?? null;
