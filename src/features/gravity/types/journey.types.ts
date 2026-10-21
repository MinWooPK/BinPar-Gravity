import type { gravityStages } from "../application/gravityJourney";

export type GravityStageId = (typeof gravityStages)[number]["id"];
export type GravityStage = (typeof gravityStages)[number];
