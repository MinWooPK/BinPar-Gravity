import { gravitationalForce } from "../gravitation";

import type {
  Answer,
  Attempt,
  Definition,
  Question,
} from "../../types/practice/practice.types";

import {
  answerKind,
  optionsFor,
  numericAnswer,
  parsePracticeNumber,
} from "./input";

export {
  answerKind,
  optionsFor,
  numericAnswer,
  parsePracticeNumber,
} from "./input";

// Obtiene la respuesta correcta.
export const expectedAnswer = (q: Definition): number | string => {
  switch (q.concept) {
    case "attraction":
      return "attract";

    case "mutual":
      return "equal";

    case "mass":
      return "double";

    case "distance":
    case "reasoning":
      return "quarter";

    case "km":
    case "tonnes":
      return q.a * 1000;

    case "cm":
      return q.a / 100;

    case "square":
      return q.a ** 2;

    case "power":
      return q.a * 10 ** q.exponent;

    case "force":
      return gravitationalForce({
        mass1: q.a * (q.difficulty === 3 ? 1000 : 1),
        mass2: q.b,
        distance: q.r * (q.difficulty >= 2 ? 1000 : 1),
      });
  }
};

// Permite un margen de error del 0,5 %.
export const withinTolerance = (actual: number, expected: number) =>
  Math.abs(actual - expected) <= Math.abs(expected) * 0.005;

// Corrige la respuesta y detecta errores.
export const evaluateAnswer = (
  question: Question,
  answer: Answer,
  usedHint: boolean,
): Attempt => {
  const expected = expectedAnswer(question);
  const kind = answerKind(question);

  // Obtiene la respuesta del usuario.
  const actual =
    kind === "choice"
      ? answer.value
      : numericAnswer(answer, kind === "scientific");

  // Comprueba que la respuesta sea válida.
  if (
    actual === null ||
    (kind === "choice" && !optionsFor(question).includes(String(actual)))
  )
    throw new Error("invalid_answer");

  // Comprueba si la respuesta es correcta.
  const correct =
    typeof expected === "number" && typeof actual === "number"
      ? withinTolerance(actual, expected)
      : actual === expected;

  let error: string | null = null;

  // Identifica el tipo de error.
  if (!correct) {
    if (
      ["km", "cm", "tonnes"].includes(question.concept) &&
      actual === question.a
    )
      error = "unconverted";

    if (question.concept === "square" && actual === question.a)
      error = "square";

    if (
      ["distance", "reasoning"].includes(question.concept) &&
      actual === "half"
    )
      error = "distanceSquared";

    if (question.concept === "mass" && actual === "four") error = "massLinear";

    // Comprueba los errores numéricos.
    if (typeof actual === "number" && typeof expected === "number") {
      const coefficient = parsePracticeNumber(answer.value);
      const exponent = parsePracticeNumber(answer.exponent);

      // Detecta errores en el signo del exponente.
      if (
        kind === "scientific" &&
        exponent &&
        coefficient !== null &&
        withinTolerance(coefficient * 10 ** -exponent, expected)
      )
        error = "exponentSign";

      // Detecta errores en el cálculo gravitatorio.
      if (question.concept === "force") {
        const mass1 = question.a * (question.difficulty === 3 ? 1000 : 1);
        const r = question.r * (question.difficulty >= 2 ? 1000 : 1);

        // Comprueba si se ha olvidado elevar la distancia al cuadrado.
        if (
          withinTolerance(
            actual,
            gravitationalForce({
              mass1,
              mass2: question.b,
              distance: r,
            }) * r,
          )
        )
          error = "distanceSquared";

        // Comprueba si se han convertido los kilómetros.
        if (
          question.difficulty >= 2 &&
          withinTolerance(
            actual,
            gravitationalForce({
              mass1,
              mass2: question.b,
              distance: question.r,
            }),
          )
        )
          error = "km";

        // Comprueba si se han convertido las toneladas.
        if (
          question.difficulty === 3 &&
          withinTolerance(
            actual,
            gravitationalForce({
              mass1: question.a,
              mass2: question.b,
              distance: r,
            }),
          )
        )
          error = "tonnes";
      }
    }
  }

  return { question, answer, actual, expected, correct, error, usedHint };
};
