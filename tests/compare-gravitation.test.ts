import { test, expect } from "vitest";

import { compareGravitation } from "../src/features/gravity/domain/compareGravitation";
import { initialParameters } from "../src/features/gravity/domain/gravitation";

// TEST 1: Comprobar los valores iniciales.
test("Los valores iniciales mantienen la fuerza", () => {
  const result = compareGravitation(initialParameters);

  expect(result.explanation).toBe("initial");
  expect(result.forceRatio).toBeCloseTo(1);
});

// TEST 2: Duplicar una masa duplica la fuerza.
test("Duplicar una masa duplica la fuerza", () => {
  const result = compareGravitation({
    ...initialParameters,
    mass1: initialParameters.mass1 * 2,
  });

  expect(result.forceRatio).toBeCloseTo(2);
});

// TEST 3: Duplicar la distancia divide la fuerza entre 4.
test("Duplicar la distancia reduce la fuerza", () => {
  const result = compareGravitation({
    ...initialParameters,
    distance: initialParameters.distance * 2,
  });

  expect(result.forceRatio).toBeCloseTo(0.25);
});

// TEST 4: Modificar varias variables.
test("Cambiar masas y distancia calcula la fuerza", () => {
  const result = compareGravitation({
    mass1: initialParameters.mass1 * 2,
    mass2: initialParameters.mass2 * 2,
    distance: initialParameters.distance * 2,
  });

  // (2 × 2) / 2² = 1
  expect(result.forceRatio).toBeCloseTo(1);
  expect(result.explanation).toBe("combinedUnchanged");
});

// TEST 5: Rechazar valores inválidos.
test("Rechaza masas y distancias inválidas", () => {
  expect(() =>
    compareGravitation({
      ...initialParameters,
      mass1: -10,
    }),
  ).toThrow(RangeError);

  expect(() =>
    compareGravitation({
      ...initialParameters,
      distance: 0,
    }),
  ).toThrow(RangeError);
});
