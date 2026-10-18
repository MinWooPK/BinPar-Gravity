import { challenges, laboratoryLimits } from "../../gravity/domain/gravitation";
import type { TutorRequest } from "../types/legacyTutor.types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isNumberInRange = (value: unknown, min: number, max: number) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= min &&
  value <= max;

export const isTutorRequest = (
  value: unknown,
  supportedLocales: readonly TutorRequest["locale"][],
): value is TutorRequest => {
  if (!isRecord(value) || typeof value.locale !== "string") return false;
  if (!supportedLocales.some((locale) => locale === value.locale)) return false;
  if (!["explain", "simplify", "example"].includes(String(value.mode)))
    return false;
  if (!isRecord(value.parameters)) return false;

  const { mass1, mass2, distance } = value.parameters;
  if (
    !isNumberInRange(
      mass1,
      laboratoryLimits.mass1.min,
      laboratoryLimits.mass1.max,
    ) ||
    !isNumberInRange(
      mass2,
      laboratoryLimits.mass2.min,
      laboratoryLimits.mass2.max,
    ) ||
    !isNumberInRange(
      distance,
      laboratoryLimits.distance.min,
      laboratoryLimits.distance.max,
    )
  )
    return false;

  const { attempt } = value;
  if (attempt === undefined) return true;
  if (!isRecord(attempt)) return false;
  if (!challenges.some((challenge) => challenge.id === attempt.challenge))
    return false;
  return ["same", "double", "four", "quarter"].includes(
    String(attempt.prediction),
  );
};
