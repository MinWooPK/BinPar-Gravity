import { test, expect } from "vitest";

import {
  gravitationalForce,
  initialParameters,
} from "../src/features/gravity/domain/gravitation";

// TEST 1: Comprobar la fórmula de Newton.
test("Calcula correctamente la fuerza gravitatoria", () => {
  const result = gravitationalForce({
    mass1: 1,
    mass2: 1,
    distance: 1,
  });

  expect(result).toBeCloseTo(6.6743e-11, 15);
});

// TEST 2: Duplicar una masa duplica la fuerza.
test("Duplicar una masa duplica la fuerza", () => {
  const initial = gravitationalForce(initialParameters);

  const result = gravitationalForce({
    ...initialParameters,
    mass1: initialParameters.mass1 * 2,
  });

  expect(result).toBeCloseTo(initial * 2, 15);
});

// TEST 3: Duplicar la distancia divide la fuerza entre cuatro.
test("Duplicar la distancia reduce la fuerza", () => {
  const initial = gravitationalForce(initialParameters);

  const result = gravitationalForce({
    ...initialParameters,
    distance: initialParameters.distance * 2,
  });

  expect(result).toBeCloseTo(initial / 4, 15);
});

// TEST 4: Rechazar parámetros inválidos.
test("Rechaza masas y distancias inválidas", () => {
  expect(() =>
    gravitationalForce({
      ...initialParameters,
      mass1: -1,
    }),
  ).toThrow(RangeError);

  expect(() =>
    gravitationalForce({
      ...initialParameters,
      distance: 0,
    }),
  ).toThrow(RangeError);
});
