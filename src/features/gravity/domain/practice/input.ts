import type { Answer, Definition } from "../../types/practice/practice.types";

// Identifica el tipo de respuesta.
export const answerKind = (q: Definition) =>
  ["attraction", "mass", "distance", "mutual", "reasoning"].includes(q.concept)
    ? "choice"
    : ["force", "power"].includes(q.concept)
      ? "scientific"
      : "number";

// Devuelve las opciones de respuesta.
export const optionsFor = (q: Definition) =>
  q.concept === "attraction"
    ? ["attract", "repel", "contact", "earthOnly"]
    : q.concept === "mutual"
      ? ["equal", "heavier", "lighter", "stationary"]
      : ["same", "double", "four", "half", "quarter"];

// Convierte un texto en un número válido.
export const parsePracticeNumber = (text: string): number | null => {
  // Permite decimales con coma o punto.
  const normalized = text.trim().replace(",", ".");

  // Comprueba el formato del número.
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized))
    return null;

  const value = Number(normalized);

  return Number.isFinite(value) ? value : null;
};

// Calcula una respuesta numérica, con o sin exponente.
export const numericAnswer = (
  answer: Answer,
  scientific: boolean,
): number | null => {
  const coefficient = parsePracticeNumber(answer.value);

  if (coefficient === null) return null;
  if (!scientific) return coefficient;

  // Comprueba el exponente.
  const exponent = parsePracticeNumber(answer.exponent);

  if (
    exponent === null ||
    !Number.isInteger(exponent) ||
    Math.abs(exponent) > 30
  )
    return null;

  // Calcula el resultado.
  const value = coefficient * 10 ** exponent;

  return Number.isFinite(value) ? value : null;
};
