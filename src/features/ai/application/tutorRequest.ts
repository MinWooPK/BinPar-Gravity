import { gravityStages } from "../../gravity/application/gravityJourney";
import { laboratoryLimits } from "../../gravity/domain/gravitation";
import { isTutorRequest as isLegacyTutorRequest } from "./legacyTutorRequest";
import { getOrbit } from "../../three-body/data/orbits";
import {
  TUTOR_MAX_MESSAGES,
  TUTOR_MAX_MESSAGE_LENGTH,
  TUTOR_MAX_TOTAL_MESSAGE_LENGTH,
} from "./tutor";
import type { TutorContext, TutorRequest } from "../types/tutor.types";

const locales = ["es", "en", "fr"] as const;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const hasOnlyKeys = (value: Record<string, unknown>, keys: readonly string[]) =>
  Object.keys(value).every((key) => keys.includes(key));
const inRange = (value: unknown, min: number, max: number) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= min &&
  value <= max;
export const isTutorContext = (value: unknown): value is TutorContext => {
  if (!isRecord(value)) return false;
  if (value.kind === "three-body") {
    return (
      hasOnlyKeys(value, ["kind", "slug"]) &&
      (value.slug === undefined ||
        (typeof value.slug === "string" && Boolean(getOrbit(value.slug))))
    );
  }
  if (
    value.kind !== "gravity" ||
    !hasOnlyKeys(value, [
      "kind",
      "stage",
      "parameters",
    ])
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
  if (value.intent !== undefined) {
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

/** Legacy quick actions are normalized before reaching the single shared provider. */
export const parseTutorRequest = (value: unknown): TutorRequest | null => {
  if (isTutorRequest(value)) return value;
  if (
    !isRecord(value) ||
    "context" in value ||
    "messages" in value ||
    !isLegacyTutorRequest(value, locales)
  )
    return null;
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
