import { gravityStages } from "../../../gravity/application/gravityJourney";
import { laboratoryLimits } from "../../../gravity/domain/gravitation";

import {
  TUTOR_MAX_MESSAGES,
  TUTOR_MAX_MESSAGE_LENGTH,
  TUTOR_MAX_TOTAL_MESSAGE_LENGTH,
} from "../tutor";

import type { TutorContext, TutorRequest } from "../../types/tutor.types";

export const locales = ["es", "en", "fr"] as const;

// Comprueba que sea un objeto válido.
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const hasOnlyKeys = (value: Record<string, unknown>, keys: readonly string[]) =>
  Object.keys(value).every((key) => keys.includes(key));

const inRange = (value: unknown, min: number, max: number) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= min &&
  value <= max;

// Valida el contexto y los parámetros de gravedad.
export const isTutorContext = (value: unknown): value is TutorContext => {
  if (!isRecord(value)) return false;

  if (
    value.kind !== "gravity" ||
    !hasOnlyKeys(value, ["kind", "stage", "parameters"])
  )
    return false;

  if (
    value.stage !== null &&
    !gravityStages.some(({ id }) => value.stage === id)
  )
    return false;

  if (
    !isRecord(value.parameters) ||
    !hasOnlyKeys(value.parameters, ["mass1", "mass2", "distance"])
  )
    return false;

  const { mass1, mass2, distance } = value.parameters;

  if (
    !inRange(mass1, laboratoryLimits.mass1.min, laboratoryLimits.mass1.max) ||
    !inRange(mass2, laboratoryLimits.mass2.min, laboratoryLimits.mass2.max) ||
    !inRange(
      distance,
      laboratoryLimits.distance.min,
      laboratoryLimits.distance.max,
    )
  )
    return false;

  return true;
};

// Valida las peticiones y el historial del Tutor IA.
export const isTutorRequest = (value: unknown): value is TutorRequest => {
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, ["locale", "mode", "context", "messages", "intent"])
  )
    return false;

  if (
    !locales.some((locale) => value.locale === locale) ||
    typeof value.mode !== "string" ||
    !["explain", "simplify", "example"].includes(value.mode)
  )
    return false;

  if (
    !isTutorContext(value.context) ||
    !Array.isArray(value.messages) ||
    value.messages.length < 1 ||
    value.messages.length > TUTOR_MAX_MESSAGES
  )
    return false;

  if (value.intent === "explain_context" && value.mode !== "explain")
    return false;

  if (value.intent !== undefined && value.intent !== "explain_context") {
    const stage =
      value.intent === "explain_formula"
        ? "gravity-understanding"
        : value.intent === "explain_experiment"
          ? "gravity-laboratory"
          : undefined;

    if (
      !stage ||
      value.mode !== "explain" ||
      value.context.kind !== "gravity" ||
      value.context.stage !== stage
    )
      return false;
  }

  // Comprueba los mensajes y sus límites de longitud.
  let totalLength = 0;

  for (const message of value.messages) {
    if (
      !isRecord(message) ||
      !hasOnlyKeys(message, ["role", "content"]) ||
      (message.role !== "user" && message.role !== "assistant") ||
      typeof message.content !== "string" ||
      !message.content.trim() ||
      message.content.length > TUTOR_MAX_MESSAGE_LENGTH
    )
      return false;

    totalLength += message.content.length;
  }

  return (
    totalLength <= TUTOR_MAX_TOTAL_MESSAGE_LENGTH &&
    value.messages.at(-1)?.role === "user"
  );
};
