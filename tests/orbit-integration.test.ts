import { test, expect } from "vitest";

import { integrateOrbit } from "../src/features/three-body/domain/orbit-integration";
import { orbits } from "../src/features/three-body/data/orbits";

// TEST 1: Comprobar las seis órbitas.
test("Genera correctamente las seis órbitas", () => {
  expect(orbits).toHaveLength(6);

  for (const orbit of orbits) {
    const result = integrateOrbit(orbit, 101);

    expect(result.samples).toHaveLength(101);
    expect(result.slug).toBe(orbit.slug);
  }
});

// TEST 2: Comprobar las posiciones de los cuerpos.
test("Las trayectorias contienen posiciones válidas", () => {
  const result = integrateOrbit(orbits[0], 101);

  // Cada muestra contiene X e Y de los tres cuerpos.
  expect(result.samples[0]).toHaveLength(6);

  // Todas las posiciones deben ser números válidos.
  expect(result.samples.every((sample) => sample.every(Number.isFinite))).toBe(
    true,
  );
});

// TEST 3: Rechazar parámetros incorrectos.
test("Rechaza períodos y muestras inválidas", () => {
  expect(() => integrateOrbit({ ...orbits[0], period: -1 })).toThrow(
    RangeError,
  );

  expect(() => integrateOrbit(orbits[0], 0)).toThrow(RangeError);
});
