import type { GravityParameters } from "../types/gravity.types";
import { laboratoryLimits } from "../domain/gravitation";

// Calcula las posiciones y tamaños de los cuerpos.
export const getGravityDiagram = ({
  mass1,
  mass2,
  distance,
}: GravityParameters) => {
  // Distancia visual entre los cuerpos.
  const separation = 160 + (distance - laboratoryLimits.distance.min) * 12;

  // Posiciones horizontales.
  const x1 = 260 - separation / 2;
  const x2 = 260 + separation / 2;

  // Tamaños según las masas.
  const radius1 = 15 + Math.cbrt(mass1) * 5;
  const radius2 = 15 + Math.cbrt(mass2) * 5;

  // Tamaño y separación de las flechas.
  const arrowLength = 24;
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

// Calcula las proporciones de las barras de fuerza.
export const getRelativeForceBars = (
  currentForce: number,
  initialForce: number,
  scaleForce = Math.max(currentForce, initialForce),
) => {
  // Comprueba que las fuerzas sean válidas.
  if (
    ![currentForce, initialForce].every(
      (value) => Number.isFinite(value) && value > 0,
    )
  ) {
    throw new RangeError("Force comparison requires finite, positive forces.");
  }

  // Evita que las barras superen la escala.
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
