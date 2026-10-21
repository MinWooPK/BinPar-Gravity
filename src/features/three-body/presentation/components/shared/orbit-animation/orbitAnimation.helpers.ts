import type { OrbitPlayback } from "../../../../types/animation.types";

// Colores de los tres cuerpos.
export const bodyColors = ["#aa97ff", "#5ee7d5", "#f4c778"] as const;

// Calcula el área visible de la órbita.
export const getOrbitViewBox = (
  data: OrbitPlayback,
  fitToTrajectory: boolean,
): string => {
  if (!fitToTrajectory) return "0 0 320 200";

  // Busca los límites de la trayectoria.
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const sample of data.samples) {
    for (let body = 0; body < 3; body++) {
      const x = sample[body * 2];
      const y = sample[body * 2 + 1];

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }

  // Añade un margen para evitar recortes.
  const padding = 12;

  return `${minX - padding} ${minY - padding} ${maxX - minX + padding * 2} ${maxY - minY + padding * 2}`;
};
