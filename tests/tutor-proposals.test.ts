
import { test, expect } from "vitest";

import {
  resolveGravityProposal,
} from "../src/features/gravity/application/gravityProposal";

import {
  createGravityState,
  gravityStateReducer,
} from "../src/features/gravity/application/gravityState";

// Propuesta de la IA: duplicar la primera masa.
const proposal = {
  action: "set_gravity_parameters" as const,
  parameters: {
    mass1: 80,
    mass2: null,
    distance: null,
  },
};

// TEST 1: Validar una propuesta de la IA.
test("La IA propone cambios válidos", () => {
  const state = createGravityState();

  const result = resolveGravityProposal(
    state.parameters,
    proposal,
  );

  expect(result).toEqual({
    mass1: 80,
    mass2: 40,
    distance: 8,
  });

  // Proponer no modifica el laboratorio.
  expect(state.parameters.mass1).toBe(40);
});

// TEST 2: Confirmar aplica los cambios.
test("Confirmar aplica la propuesta", () => {
  const initial = createGravityState();

  const state = gravityStateReducer(initial, {
    type: "proposal",
    proposal,
    expectedRevision: initial.revision,
  });

  expect(state.parameters.mass1).toBe(80);
  expect(state.formula.unknown).toBe("force");
});

// TEST 3: Sin confirmación no se aplican cambios.
test("Sin confirmación mantiene los valores iniciales", () => {
  const state = createGravityState();

  resolveGravityProposal(state.parameters, proposal);

  expect(state.parameters).toEqual({
    mass1: 40,
    mass2: 40,
    distance: 8,
  });
});
