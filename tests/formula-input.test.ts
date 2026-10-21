import { test, expect } from "vitest";

import { parseFormulaValue } from "../src/features/gravity/application/parseFormulaValue";

import {
  initialFormulaInput,
  changeFormulaInput,
} from "../src/features/gravity/application/formulaInput";

import { gravitationalForce } from "../src/features/gravity/domain/gravitation";

// TEST 1: Aceptar números válidos.
test("Acepta números válidos", () => {
  expect(parseFormulaValue("10")).toBe(10);
  expect(parseFormulaValue("10,5")).toBe(10.5);
  expect(parseFormulaValue("40e12")).toBe(40e12);
});

// TEST 2: Rechazar números inválidos.
test("Rechaza números inválidos", () => {
  expect(parseFormulaValue("abc")).toBeNull();
  expect(parseFormulaValue("-2")).toBeNull();
  expect(parseFormulaValue("")).toBeNull();
});

// TEST 3: Calcular la fuerza con tres valores.
test("Calcula correctamente la fuerza gravitatoria", () => {
  let state = changeFormulaInput(initialFormulaInput, "mass1", "40");

  state = changeFormulaInput(state, "mass2", "40");
  state = changeFormulaInput(state, "distance", "8");

  const expected = gravitationalForce({
    mass1: 40,
    mass2: 40,
    distance: 8,
  });

  expect(state.unknown).toBe("force");
  expect(state.result?.force).toBeCloseTo(expected);
});
