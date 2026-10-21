import { test, expect } from "vitest";

import {
  createExperimentDraftState,
  experimentDraftReducer,
  parseExperimentDraft,
} from "../src/features/three-body/application/experimentDraft";

import { experimentConfigurationError } from "../src/features/three-body/application/experimentConfiguration";

// TEST 1: Modificar la masa de un cuerpo.
test("Permite modificar la masa de un cuerpo", () => {
  const initial = createExperimentDraftState();

  const state = experimentDraftReducer(initial, {
    type: "body",
    index: 1,
    key: "mass",
    value: "3",
  });

  const result = parseExperimentDraft(state.draft);

  expect(result.bodies[1].mass).toBe(3);
});

// TEST 2: Conservar los valores al cambiar de cuerpo.
test("Conserva los valores al seleccionar otro cuerpo", () => {
  let state = createExperimentDraftState();

  state = experimentDraftReducer(state, {
    type: "body",
    index: 1,
    key: "mass",
    value: "3",
  });

  state = experimentDraftReducer(state, {
    type: "select",
    index: 2,
  });

  expect(parseExperimentDraft(state.draft).bodies[1].mass).toBe(3);
  expect(state.selectedBody).toBe(2);
});

// TEST 3: Rechazar parámetros inválidos.
test("Rechaza masas y duraciones inválidas", () => {
  const initial = createExperimentDraftState();

  const invalidMass = experimentDraftReducer(initial, {
    type: "body",
    index: 0,
    key: "mass",
    value: "-1",
  });

  expect(
    experimentConfigurationError(parseExperimentDraft(invalidMass.draft)),
  ).toBe("invalidMass");

  const invalidDuration = experimentDraftReducer(initial, {
    type: "common",
    key: "duration",
    value: "101",
  });

  expect(
    experimentConfigurationError(parseExperimentDraft(invalidDuration.draft)),
  ).toBe("invalidDurationLimit");
});

// TEST 4: Restablecer los valores iniciales.
test("Restablecer recupera los valores iniciales", () => {
  const initial = createExperimentDraftState();

  const changed = experimentDraftReducer(initial, {
    type: "common",
    key: "duration",
    value: "20",
  });

  const reset = experimentDraftReducer(changed, {
    type: "reset",
  });

  expect(reset.draft).toEqual(initial.draft);
  expect(reset.selectedBody).toBe(0);
});
