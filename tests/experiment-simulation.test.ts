import { test, expect } from "vitest";
import { simulateExperiment } from "../src/features/three-body/domain/experiment-simulation";

// Configuración inicial con tres cuerpos.
const bodies = [
  { mass: 1, x: -1, y: 0, vx: 0, vy: 0.3 },
  { mass: 2, x: 1, y: 0, vx: 0, vy: -0.3 },
  { mass: 3, x: 0, y: 1, vx: 0.4, vy: 0 },
];

const config = {
  gravity: 1,
  duration: 0.4,
  bodies,
};

// TEST 1: La simulación genera trayectorias.
test("Genera una trayectoria válida", () => {
  const result = simulateExperiment(config, 101);

  expect(result.samples).toHaveLength(101);
  expect(result.samples[0]).toEqual([-1, 0, 1, 0, 0, 1]);
  expect(result.samples.flat().every(Number.isFinite)).toBe(true);
});

// TEST 2: Cambiar la masa modifica la trayectoria.
test("Cambiar una masa modifica el movimiento", () => {
  const original = simulateExperiment(config, 41);

  const modified = simulateExperiment(
    {
      ...config,
      bodies: bodies.map((body, index) =>
        index === 2 ? { ...body, mass: 9 } : body,
      ),
    },
    41,
  );

  expect(modified.samples.at(-1)).not.toEqual(original.samples.at(-1));
});

// TEST 3: Rechazar parámetros inválidos.
test("Rechaza parámetros inválidos", () => {
  expect(() => simulateExperiment({ ...config, gravity: 0 })).toThrow(
    RangeError,
  );

  expect(() => simulateExperiment({ ...config, duration: -1 })).toThrow(
    RangeError,
  );
});
