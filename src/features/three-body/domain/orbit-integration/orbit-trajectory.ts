// Obtiene las posiciones X e Y de los tres cuerpos.
export function positions(state: readonly number[]): number[] {
  return [state[0], state[1], state[4], state[5], state[8], state[9]];
}

// Calcula el centro y el radio de la trayectoria.
export const orbitBounds = (samples: readonly number[][]) => {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  // Busca los límites de las posiciones.
  for (const sample of samples) {
    for (let body = 0; body < 3; body++) {
      minX = Math.min(minX, sample[body * 2]);
      maxX = Math.max(maxX, sample[body * 2]);
      minY = Math.min(minY, sample[body * 2 + 1]);
      maxY = Math.max(maxY, sample[body * 2 + 1]);
    }
  }

  // Calcula el centro de la trayectoria.
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  // Calcula el radio necesario para mostrarla completa.
  let radius = 0;

  for (const sample of samples) {
    for (let body = 0; body < 3; body++) {
      radius = Math.max(
        radius,
        Math.hypot(sample[body * 2] - cx, sample[body * 2 + 1] - cy),
      );
    }
  }

  return { cx, cy, radius };
};
