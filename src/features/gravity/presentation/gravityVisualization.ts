import type { GravityParameters } from "../types/gravity.types";
import { laboratoryLimits } from "../domain/gravitation";

// Calcula las posiciones, tamaños y flechas de los cuerpos
// para representar visualmente la atracción gravitatoria.
export const getGravityDiagram = ({
  mass1,
  mass2,
  distance,
}: GravityParameters) => {
  // Calcula la separación visual entre los dos cuerpos.
  const separation = 160 + (distance - laboratoryLimits.distance.min) * 12;

  // Calcula la posición horizontal del primer cuerpo.
  const x1 = 260 - separation / 2;

  // Calcula la posición horizontal del segundo cuerpo.
  const x2 = 260 + separation / 2;

  // Calcula el radio visual del primer cuerpo según su masa.
  const radius1 = 15 + Math.cbrt(mass1) * 5;

  // Calcula el radio visual del segundo cuerpo según su masa.
  const radius2 = 15 + Math.cbrt(mass2) * 5;

  // Define la longitud fija de las flechas de atracción.
  const arrowLength = 24;

  // Define la separación entre cada cuerpo y su flecha.
  const arrowOffset = 12;

  return {
    separation,
    x1,
    x2,
    radius1,
    radius2,
    leftArrow: {
      start: x1 + radius1 + arrowOffset,
      end: x1 + radius1 + arrowOffset + arrowLength,
    },
    rightArrow: {
      start: x2 - radius2 - arrowOffset,
      end: x2 - radius2 - arrowOffset - arrowLength,
    },
  };
};

// Calcula las proporciones de dos fuerzas gravitatorias
// utilizando una misma escala para compararlas visualmente.
export const getRelativeForceBars = (
  currentForce: number,
  initialForce: number,
  scaleForce = Math.max(currentForce, initialForce),
) => {
  // Comprueba que ambas fuerzas sean positivas y finitas.
  if (
    ![currentForce, initialForce].every(
      (value) => Number.isFinite(value) && value > 0,
    )
  ) {
    throw new RangeError("Force comparison requires finite, positive forces.");
  }

  // Comprueba que la escala permita representar ambas fuerzas sin recortes.
  if (
    !Number.isFinite(scaleForce) ||
    scaleForce < Math.max(currentForce, initialForce)
  ) {
    throw new RangeError(
      "The shared scale must contain both forces without clipping.",
    );
  }

  return {
    currentFraction: currentForce / scaleForce,
    initialFraction: initialForce / scaleForce,
    ratio: currentForce / initialForce,
  };
};
