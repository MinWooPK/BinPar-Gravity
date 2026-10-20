import type { ExperimentConfiguration } from "../domain/experiment-simulation";
import type { ExperimentBodyField } from "../types/experiment-proposal.types";
import { experimentBodyFields } from "./experimentConfiguration";
import { resolveThreeBodyProposal } from "./experimentProposal";

// Define los valores editables del experimento como cadenas de texto.
export type ExperimentDraft = {
  gravity: string;
  duration: string;
  bodies: Record<ExperimentBodyField, string>[];
};

// Define el estado del formulario, el cuerpo seleccionado y su revisión.
export type ExperimentDraftState = {
  draft: ExperimentDraft;
  selectedBody: number;
  revision: number;
};

// Crea el estado inicial del experimento con los parámetros
// predeterminados de los tres cuerpos.
export const createExperimentDraftState = (): ExperimentDraftState => ({
  revision: 0,
  selectedBody: 0,
  draft: {
    gravity: "1",
    duration: "12",
    bodies: [
      { mass: "1", x: "1", y: "0", vx: "0", vy: "0.75983568565" },
      {
        mass: "1",
        x: "-0.5",
        y: "0.86602540378",
        vx: "-0.65803700648",
        vy: "-0.379917842825",
      },
      {
        mass: "1",
        x: "-0.5",
        y: "-0.86602540378",
        vx: "0.65803700648",
        vy: "-0.379917842825",
      },
    ],
  },
});

// Convierte un texto en número y devuelve NaN si está vacío.
const number = (value: string) => (value.trim() === "" ? NaN : Number(value));

// Convierte los valores del formulario en una configuración
// numérica que puede utilizar el experimento.
export const parseExperimentDraft = (
  draft: ExperimentDraft,
): ExperimentConfiguration => ({
  gravity: number(draft.gravity),
  duration: number(draft.duration),
  bodies: draft.bodies.map((body) => ({
    mass: number(body.mass),
    x: number(body.x),
    y: number(body.y),
    vx: number(body.vx),
    vy: number(body.vy),
  })),
});

// Define las acciones que pueden modificar el estado del experimento.
export type ExperimentDraftAction =
  | { type: "reset" }
  | { type: "common"; key: "gravity" | "duration"; value: string }
  | { type: "body"; index: number; key: ExperimentBodyField; value: string }
  | { type: "select"; index: number }
  | { type: "proposal"; proposal: unknown; expectedRevision: number };

// Gestiona los cambios del formulario, la selección de cuerpos,
// el restablecimiento y las propuestas del Tutor IA.
export const experimentDraftReducer = (
  state: ExperimentDraftState,
  action: ExperimentDraftAction,
): ExperimentDraftState => {
  // Restablece los valores iniciales e incrementa la revisión.
  if (action.type === "reset")
    return { ...createExperimentDraftState(), revision: state.revision + 1 };

  // Cambia el cuerpo seleccionado si el índice es válido.
  if (action.type === "select")
    return Number.isInteger(action.index) &&
      action.index >= 0 &&
      action.index < 3 &&
      action.index !== state.selectedBody
      ? { ...state, selectedBody: action.index }
      : state;

  // Actualiza la gravedad o la duración del experimento.
  if (action.type === "common")
    return state.draft[action.key] === action.value
      ? state
      : {
          ...state,
          revision: state.revision + 1,
          draft: { ...state.draft, [action.key]: action.value },
        };

  // Actualiza una propiedad física del cuerpo indicado.
  if (action.type === "body") {
    if (
      !state.draft.bodies[action.index] ||
      state.draft.bodies[action.index][action.key] === action.value
    )
      return state;

    return {
      ...state,
      revision: state.revision + 1,
      draft: {
        ...state.draft,
        bodies: state.draft.bodies.map((body, i) =>
          i === action.index ? { ...body, [action.key]: action.value } : body,
        ),
      },
    };
  }

  // Rechaza una propuesta si el formulario ha cambiado desde su generación.
  if (action.expectedRevision !== state.revision) return state;

  // Convierte el formulario actual en una configuración numérica.
  const current = parseExperimentDraft(state.draft);

  // Valida y resuelve la propuesta de parámetros del Tutor IA.
  const next = resolveThreeBodyProposal(current, action.proposal);

  if (!next) return state;

  // Identifica el primer cuerpo modificado por la propuesta.
  const changedBody = next.bodies.findIndex((body, i) =>
    experimentBodyFields.some((key) => body[key] !== current.bodies[i][key]),
  );

  return {
    revision: state.revision + 1,
    selectedBody: changedBody < 0 ? state.selectedBody : changedBody,
    draft: {
      gravity:
        next.gravity === current.gravity
          ? state.draft.gravity
          : String(next.gravity),
      duration:
        next.duration === current.duration
          ? state.draft.duration
          : String(next.duration),
      bodies: state.draft.bodies.map(
        (body, i) =>
          Object.fromEntries(
            experimentBodyFields.map((key) => [
              key,
              current.bodies[i][key] === next.bodies[i][key]
                ? body[key]
                : String(next.bodies[i][key]),
            ]),
          ) as Record<ExperimentBodyField, string>,
      ),
    },
  };
};
