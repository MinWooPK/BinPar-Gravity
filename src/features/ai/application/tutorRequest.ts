import { gravityStages } from "../../gravity/application/gravityJourney";
import { laboratoryLimits } from "../../gravity/domain/gravitation";
import { isTutorRequest as isLegacyTutorRequest } from "./legacyTutorRequest";

import {
  TUTOR_MAX_MESSAGES,
  TUTOR_MAX_MESSAGE_LENGTH,
  TUTOR_MAX_TOTAL_MESSAGE_LENGTH,
} from "./tutor";

import type { TutorContext, TutorRequest } from "../types/tutor.types";

// Define los idiomas permitidos para las peticiones del Tutor IA.
const locales = ["es", "en", "fr"] as const;

// Comprueba que un valor sea un objeto válido y no un array.
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

// Comprueba que un objeto contenga únicamente las propiedades permitidas.
const hasOnlyKeys = (value: Record<string, unknown>, keys: readonly string[]) =>
  Object.keys(value).every((key) => keys.includes(key));

// Comprueba que un número sea finito y esté dentro de los límites establecidos.
const inRange = (value: unknown, min: number, max: number) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= min &&
  value <= max;

// Valida el contexto del Tutor IA según la página actual,
// comprobando las etapas y los parámetros físicos permitidos.
export const isTutorContext = (value: unknown): value is TutorContext => {
  if (!isRecord(value)) return false;

  if (value.kind === "home")
    return value.stage === null && hasOnlyKeys(value, ["kind", "stage"]);

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

  // Obtiene las masas y la distancia del contexto de gravedad.
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

// Valida las peticiones enviadas al Tutor IA,
// incluyendo idioma, modo, contexto, intención e historial.
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
    // Determina la etapa permitida para cada intención educativa.
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

  // Acumula la longitud total de los mensajes enviados al modelo.
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

// Procesa las peticiones del Tutor IA y adapta las peticiones
// del sistema antiguo al formato de conversación actual.
export const parseTutorRequest = (value: unknown): TutorRequest | null => {
  if (isTutorRequest(value)) return value;

  if (
    !isRecord(value) ||
    "context" in value ||
    "messages" in value ||
    !isLegacyTutorRequest(value, locales)
  )
    return null;

  // Define las preguntas predeterminadas para las peticiones
  // del antiguo Tutor IA en los tres idiomas disponibles.
  const legacyQuestions = {
    es: "Explica el experimento actual y mi predicción, si existe.",
    en: "Explain the current experiment and my prediction, if any.",
    fr: "Explique l’expérience actuelle et ma prédiction, le cas échéant.",
  };

  return {
    locale: value.locale,
    mode: String(value.mode) as TutorRequest["mode"],
    context: {
      kind: "gravity",
      stage: null,
      parameters: {
        mass1: value.parameters.mass1,
        mass2: value.parameters.mass2,
        distance: value.parameters.distance,
      },
    },
    messages: [{ role: "user", content: legacyQuestions[value.locale] }],
  };
};
