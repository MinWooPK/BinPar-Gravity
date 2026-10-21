import {
  concepts,
  type Definition,
  type PracticeRequest,
} from "../../types/practice/practice.types";

// Comprueba que sea un objeto.
export const record = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

// Comprueba que tenga las propiedades permitidas.
export const onlyKeys = (v: Record<string, unknown>, keys: string[]) =>
  Object.keys(v).length === keys.length && keys.every((key) => key in v);

// Valida las peticiones de la práctica.
export const parsePracticeRequest = (v: unknown): PracticeRequest | null => {
  if (!record(v)) return null;

  // Iniciar la práctica.
  if (
    v.action === "start" &&
    onlyKeys(v, ["action", "locale"]) &&
    typeof v.locale === "string" &&
    ["es", "en", "fr"].includes(v.locale)
  )
    return v as PracticeRequest;

  // Comprueba el token de la sesión.
  if (typeof v.token !== "string" || !v.token || v.token.length > 30000)
    return null;

  // Pasar a la siguiente pregunta.
  if (v.action === "next" && onlyKeys(v, ["action", "token"]))
    return v as PracticeRequest;

  // Enviar una respuesta.
  if (
    v.action === "answer" &&
    onlyKeys(v, ["action", "token", "answer", "usedHint"]) &&
    typeof v.usedHint === "boolean" &&
    record(v.answer) &&
    onlyKeys(v.answer, ["value", "exponent"]) &&
    [v.answer.value, v.answer.exponent].every(
      (a) => typeof a === "string" && a.length <= 80,
    )
  )
    return v as PracticeRequest;

  return null;
};

// Valida los datos de una pregunta.
export const isDefinition = (v: unknown): v is Definition => {
  if (
    !record(v) ||
    !onlyKeys(v, ["concept", "difficulty", "a", "b", "r", "exponent", "scene"])
  )
    return false;

  return (
    // Concepto y dificultad.
    concepts.some((c) => c === v.concept) &&
    typeof v.difficulty === "number" &&
    [1, 2, 3].includes(v.difficulty) &&
    // Valores numéricos permitidos.
    [v.a, v.b, v.r].every(
      (n) =>
        typeof n === "number" && Number.isFinite(n) && n >= 0.001 && n <= 2000,
    ) &&
    // Exponente permitido.
    typeof v.exponent === "number" &&
    Number.isInteger(v.exponent) &&
    v.exponent >= -12 &&
    v.exponent <= 6 &&
    // Escenario permitido.
    typeof v.scene === "string" &&
    ["objects", "laboratory", "workshop"].includes(v.scene)
  );
};
