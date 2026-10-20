import type { ExperimentConfiguration } from "../domain/experiment-simulation";
import type { ExperimentBodyField } from "../types/experiment-proposal.types";
import { experimentBodyFields } from "./experimentConfiguration";
import { resolveThreeBodyProposal } from "./experimentProposal";

export type ExperimentDraft = { gravity: string; duration: string; bodies: Record<ExperimentBodyField, string>[] };
export type ExperimentDraftState = { draft: ExperimentDraft; selectedBody: number; revision: number };
export const createExperimentDraftState = (): ExperimentDraftState => ({
  revision: 0, selectedBody: 0,
  draft: {
    gravity: "1", duration: "12",
    bodies: [
      { mass: "1", x: "1", y: "0", vx: "0", vy: "0.75983568565" },
      { mass: "1", x: "-0.5", y: "0.86602540378", vx: "-0.65803700648", vy: "-0.379917842825" },
      { mass: "1", x: "-0.5", y: "-0.86602540378", vx: "0.65803700648", vy: "-0.379917842825" },
    ],
  },
});
const number = (value: string) => value.trim() === "" ? NaN : Number(value);
export const parseExperimentDraft = (draft: ExperimentDraft): ExperimentConfiguration => ({
  gravity: number(draft.gravity), duration: number(draft.duration),
  bodies: draft.bodies.map(body => ({ mass: number(body.mass), x: number(body.x), y: number(body.y), vx: number(body.vx), vy: number(body.vy) })),
});
export type ExperimentDraftAction =
  | { type: "reset" }
  | { type: "common"; key: "gravity" | "duration"; value: string }
  | { type: "body"; index: number; key: ExperimentBodyField; value: string }
  | { type: "select"; index: number }
  | { type: "proposal"; proposal: unknown; expectedRevision: number };

export const experimentDraftReducer = (state: ExperimentDraftState, action: ExperimentDraftAction): ExperimentDraftState => {
  if (action.type === "reset") return { ...createExperimentDraftState(), revision: state.revision + 1 };
  if (action.type === "select") return Number.isInteger(action.index) && action.index >= 0 && action.index < 3 && action.index !== state.selectedBody ? { ...state, selectedBody: action.index } : state;
  if (action.type === "common") return state.draft[action.key] === action.value ? state : { ...state, revision: state.revision + 1, draft: { ...state.draft, [action.key]: action.value } };
  if (action.type === "body") {
    if (!state.draft.bodies[action.index] || state.draft.bodies[action.index][action.key] === action.value) return state;
    return { ...state, revision: state.revision + 1, draft: { ...state.draft, bodies: state.draft.bodies.map((body, i) => i === action.index ? { ...body, [action.key]: action.value } : body) } };
  }
  if (action.expectedRevision !== state.revision) return state;
  const current = parseExperimentDraft(state.draft);
  const next = resolveThreeBodyProposal(current, action.proposal);
  if (!next) return state;
  const changedBody = next.bodies.findIndex((body, i) => experimentBodyFields.some(key => body[key] !== current.bodies[i][key]));
  return {
    revision: state.revision + 1,
    selectedBody: changedBody < 0 ? state.selectedBody : changedBody,
    draft: {
      gravity: next.gravity === current.gravity ? state.draft.gravity : String(next.gravity),
      duration: next.duration === current.duration ? state.draft.duration : String(next.duration),
      bodies: state.draft.bodies.map((body, i) => Object.fromEntries(experimentBodyFields.map(key => [key, current.bodies[i][key] === next.bodies[i][key] ? body[key] : String(next.bodies[i][key])])) as Record<ExperimentBodyField, string>),
    },
  };
};
