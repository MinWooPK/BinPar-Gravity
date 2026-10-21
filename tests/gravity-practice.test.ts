
import { test, expect } from "vitest";

import {
  expectedAnswer,
  evaluateAnswer,
} from "../src/features/gravity/domain/practice/evaluation";

import {
  parsePracticeRequest,
} from "../src/features/gravity/application/practice/validation";

// Creamos una pregunta sencilla para los tests.
const question = {
  concept: "square",
  difficulty: 1,
  a: 8,
  b: 40,
  r: 8,
  exponent: -9,
  scene: "objects",
  id: "question",
  number: 1,
  hint: "formula",
  reinforcement: false,
} as const;

// TEST 1: Calcular la respuesta correcta.
test("Calcula correctamente la respuesta", () => {
  expect(expectedAnswer(question)).toBe(64);
});

// TEST 2: Comprobar respuestas del usuario.
test("Distingue respuestas correctas e incorrectas", () => {
  const correct = evaluateAnswer(
    question,
    { value: "64", exponent: "" },
    false,
  );

  const incorrect = evaluateAnswer(
    question,
    { value: "8", exponent: "" },
    false,
  );

  expect(correct.correct).toBe(true);
  expect(incorrect.correct).toBe(false);
});

// TEST 3: Validar las peticiones.
test("Rechaza peticiones inválidas", () => {
  expect(
    parsePracticeRequest({
      action: "start",
      locale: "es",
    }),
  ).not.toBeNull();

  expect(
    parsePracticeRequest({
      action: "execute",
      token: "invalid",
    }),
  ).toBeNull();
});
