export const gravityStageById = {
  "gravity-discovery": { id: "gravity-discovery", number: "01", title: "learningDiscover" },
  "gravity-understanding": { id: "gravity-understanding", number: "02", title: "learningUnderstand" },
  "gravity-laboratory": { id: "gravity-laboratory", number: "03", title: "learningExperiment" },
  "gravity-challenges": { id: "gravity-challenges", number: "04", title: "learningCheck" },
} as const;

export const gravityStages = [
  gravityStageById["gravity-discovery"],
  gravityStageById["gravity-understanding"],
  gravityStageById["gravity-laboratory"],
  gravityStageById["gravity-challenges"],
] as const;

export type GravityStageId = (typeof gravityStages)[number]["id"];
export type GravityStage = (typeof gravityStages)[number];
