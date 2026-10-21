import { gravityStages } from "../../../gravity/application/gravityJourney";
import { laboratoryLimits } from "../../../gravity/domain/gravitation";
import {
  TUTOR_MAX_MESSAGES,
  TUTOR_MAX_MESSAGE_LENGTH,
  TUTOR_MAX_TOTAL_MESSAGE_LENGTH,
} from "../tutor";

import type { TutorContext, TutorRequest } from "../../types/tutor.types";

export const locales = ["es", "en", "fr"] as const;

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const hasOnlyKeys = (value: Record<string, unknown>, keys: string[]) =>
  Object.keys(value).every((key) => keys.includes(key));

const inRange = (value: unknown, min: number, max: number) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= min &&
  value <= max;

// 1. Comprueba los datos físicos del laboratorio.
export const isTutorContext = (value: unknown): value is TutorContext => {
  if (!isRecord(value)) return false;
  if (value.kind !== "gravity") return false;
  if (!hasOnlyKeys(value, ["kind", "stage", "parameters"])) return false;

  if (
    value.stage !== null &&
    !gravityStages.some((stage) => stage.id === value.stage)
  )
    return false;

  if (!isRecord(value.parameters)) return false;
  if (!hasOnlyKeys(value.parameters, ["mass1", "mass2", "distance"]))
    return false;

  const { mass1, mass2, distance } = value.parameters;

  return (
    inRange(mass1, laboratoryLimits.mass1.min, laboratoryLimits.mass1.max) &&
    inRange(mass2, laboratoryLimits.mass2.min, laboratoryLimits.mass2.max) &&
    inRange(
      distance,
      laboratoryLimits.distance.min,
      laboratoryLimits.distance.max,
    )
  );
};

// 2. Comprueba la petición enviada al Tutor IA.
export const isTutorRequest = (value: unknown): value is TutorRequest => {
  if (!isRecord(value)) return false;
  if (!hasOnlyKeys(value, ["locale", "mode", "context", "messages", "intent"]))
    return false;

  // Idioma y modo permitidos.
  if (!locales.some((locale) => locale === value.locale)) return false;
  if (!["explain", "simplify", "example"].includes(String(value.mode)))
    return false;

  // Contexto científico válido.
  if (!isTutorContext(value.context)) return false;

  // Acciones permitidas según la etapa.
  if (value.intent !== undefined) {
    if (value.mode !== "explain") return false;

    if (value.intent === "explain_formula") {
      if (value.context.stage !== "gravity-understanding") return false;
    } else if (value.intent === "explain_experiment") {
      if (value.context.stage !== "gravity-laboratory") return false;
    } else if (value.intent !== "explain_context") {
      return false;
    }
  }

  // Historial de conversación.
  if (!Array.isArray(value.messages)) return false;
  if (value.messages.length < 1 || value.messages.length > TUTOR_MAX_MESSAGES)
    return false;

  let total = 0;

  for (const message of value.messages) {
    if (!isRecord(message)) return false;
    if (!hasOnlyKeys(message, ["role", "content"])) return false;
    if (message.role !== "user" && message.role !== "assistant") return false;
    if (typeof message.content !== "string") return false;
    if (!message.content.trim()) return false;
    if (message.content.length > TUTOR_MAX_MESSAGE_LENGTH) return false;

    total += message.content.length;
  }

  return (
    total <= TUTOR_MAX_TOTAL_MESSAGE_LENGTH &&
    value.messages.at(-1)?.role === "user"
  );
};
