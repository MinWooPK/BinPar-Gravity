import type { Answer, Definition } from "../../types/practice/practice.types";

// Determina si una pregunta requiere una opción,
// un número o una respuesta en notación científica.
export const answerKind = (q: Definition) =>
  ["attraction", "mass", "distance", "mutual", "reasoning"].includes(q.concept)
    ? "choice"
    : ["force", "power"].includes(q.concept)
      ? "scientific"
      : "number";

// Devuelve las opciones disponibles para las preguntas de selección múltiple.
export const optionsFor = (q: Definition) =>
  q.concept === "attraction"
    ? ["attract", "repel", "contact", "earthOnly"]
    : q.concept === "mutual"
      ? ["equal", "heavier", "lighter", "stationary"]
      : ["same", "double", "four", "half", "quarter"];

// Convierte el texto introducido por el usuario en un número válido.
// Admite decimales con punto o coma y notación científica.
export const parsePracticeNumber = (text: string): number | null => {
  // Normaliza el formato decimal del valor introducido.
  const normalized = text.trim().replace(",", ".");

  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized))
    return null;

  // Convierte el texto a número y comprueba que sea finito.
  const value = Number(normalized);

  return Number.isFinite(value) ? value : null;
};

// Obtiene el valor numérico de una respuesta, calculando
// el exponente cuando se utiliza notación científica.
export const numericAnswer = (
  answer: Answer,
  scientific: boolean,
): number | null => {
  // Obtiene el valor principal o coeficiente de la respuesta.
  const coefficient = parsePracticeNumber(answer.value);

  if (coefficient === null) return null;
  if (!scientific) return coefficient;

  // Obtiene el exponente de la notación científica.
  const exponent = parsePracticeNumber(answer.exponent);

  if (
    exponent === null ||
    !Number.isInteger(exponent) ||
    Math.abs(exponent) > 30
  )
    return null;

  // Calcula el resultado numérico aplicando el exponente.
  const value = coefficient * 10 ** exponent;

  return Number.isFinite(value) ? value : null;
};
