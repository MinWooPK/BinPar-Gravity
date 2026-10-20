import { laboratoryLimits } from "../../gravity/domain/gravitation";
import type { TutorRequest } from "../types/legacyTutor.types";

// Comprueba que un valor sea un objeto válido y no sea null.
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

// Comprueba que un número sea finito y esté dentro de los límites permitidos.
const isNumberInRange = (value: unknown, min: number, max: number) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= min &&
  value <= max;

// Valida que una petición al Tutor IA tenga un idioma,
// un modo de explicación y unos parámetros gravitatorios válidos.
export const isTutorRequest = (
  value: unknown,
  supportedLocales: readonly TutorRequest["locale"][],
): value is TutorRequest => {
  if (!isRecord(value) || typeof value.locale !== "string") return false;

  if (!supportedLocales.some((locale) => locale === value.locale)) return false;

  if (!["explain", "simplify", "example"].includes(String(value.mode)))
    return false;

  if (!isRecord(value.parameters)) return false;

  // Obtiene las masas y la distancia enviadas en la petición.
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

  return value.attempt === undefined;
};
