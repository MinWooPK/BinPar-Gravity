import type { ExperimentConfiguration } from "../domain/experiment-simulation";

type ExperimentBodyField = "mass" | "x" | "y" | "vx" | "vy";

// Valores editables del experimento.
export type ExperimentDraft = {
  gravity: string;
  duration: string;
  bodies: Record<ExperimentBodyField, string>[];
};

// Estado del formulario.
export type ExperimentDraftState = {
  draft: ExperimentDraft;
  selectedBody: number;
  revision: number;
};

// Crea los valores iniciales de los tres cuerpos.
export const createExperimentDraftState = (): ExperimentDraftState => ({
  revision: 0,
  selectedBody: 0,
  draft: {
    gravity: "1",
    duration: "12",
    bodies: [
      {
        mass: "1",
        x: "1",
        y: "0",
        vx: "0",
        vy: "0.75983568565",
      },
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

// Convierte el texto en número.
const number = (value: string) => (value.trim() === "" ? NaN : Number(value));

// Prepara los datos para la simulación.
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

// Acciones del formulario.
export type ExperimentDraftAction =
  | { type: "reset" }
  | { type: "common"; key: "gravity" | "duration"; value: string }
  | { type: "body"; index: number; key: ExperimentBodyField; value: string }
  | { type: "select"; index: number };

// Gestiona los cambios del experimento.
export const experimentDraftReducer = (
  state: ExperimentDraftState,
  action: ExperimentDraftAction,
): ExperimentDraftState => {
  // Restablece los valores iniciales.
  if (action.type === "reset") {
    return {
      ...createExperimentDraftState(),
      revision: state.revision + 1,
    };
  }

  // Selecciona uno de los tres cuerpos.
  if (action.type === "select") {
    return Number.isInteger(action.index) &&
      action.index >= 0 &&
      action.index < 3 &&
      action.index !== state.selectedBody
      ? { ...state, selectedBody: action.index }
      : state;
  }

  // Modifica la gravedad o la duración.
  if (action.type === "common") {
    return state.draft[action.key] === action.value
      ? state
      : {
          ...state,
          revision: state.revision + 1,
          draft: {
            ...state.draft,
            [action.key]: action.value,
          },
        };
  }

  // Modifica los valores de un cuerpo.
  if (action.type === "body") {
    if (
      !state.draft.bodies[action.index] ||
      state.draft.bodies[action.index][action.key] === action.value
    ) {
      return state;
    }

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

  return state;
};
