export const gravityStageById = {
  "gravity-discovery": {
    id: "gravity-discovery",
    number: "01",
    title: "learningDiscover",
    description: "learningDiscoverDescription",
  },
  "gravity-understanding": {
    id: "gravity-understanding",
    number: "02",
    title: "learningUnderstand",
    description: "learningUnderstandDescription",
  },
  "gravity-laboratory": {
    id: "gravity-laboratory",
    number: "03",
    title: "learningExperiment",
    description: "learningExperimentDescription",
  },
  "gravity-challenges": {
    id: "gravity-challenges",
    number: "04",
    title: "learningCheck",
    description: "learningCheckDescription",
  },
} as const;

export const gravityStages = [
  gravityStageById["gravity-discovery"],
  gravityStageById["gravity-understanding"],
  gravityStageById["gravity-laboratory"],
  gravityStageById["gravity-challenges"],
] as const;
