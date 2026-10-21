import { test, expect } from "vitest";

import {
  createGravityState,
  gravityStateReducer,
} from "../src/features/gravity/application/gravityState";

// TEST 1: Comprobar los valores iniciales.
test("Inicializa correctamente el laboratorio", () => {
  const state = createGravityState();

  expect(state.parameters).toEqual({
    mass1: 40,
    mass2: 40,
    distance: 8,
  });

  expect(state.formula.unknown).toBe("force");
});

// TEST 2: Modificar la fórmula actualiza el simulador.
test("Sincroniza los cambios de la fórmula", () => {
  const initial = createGravityState();

  const state = gravityStateReducer(initial, {
    type: "formula",
    key: "mass1",
    text: "60",
  });

  expect(state.parameters.mass1).toBe(60);
  expect(state.formula.values.mass1).toBe("60");
});

// TEST 3: Los valores inválidos no modifican la simulación.
test("Rechaza valores fuera del rango permitido", () => {
  const initial = createGravityState();

  const state = gravityStateReducer(initial, {
    type: "formula",
    key: "mass1",
    text: "150",
  });

  expect(state.parameters).toEqual(initial.parameters);
  expect(state.formula.values.mass1).toBe("150");
});

// TEST 4: Restablecer el laboratorio.
test("Restablecer recupera los valores iniciales", () => {
  const initial = createGravityState();

  const modified = gravityStateReducer(initial, {
    type: "formula",
    key: "mass1",
    text: "80",
  });

  const reset = gravityStateReducer(modified, {
    type: "reset",
  });

  expect(reset.parameters).toEqual(initial.parameters);
  expect(reset.formula.unknown).toBe("force");
});
