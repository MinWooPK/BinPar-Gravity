// Extrae las posiciones y calcula los límites necesarios para visualizar una órbita.

// Extrae las coordenadas X e Y de los tres cuerpos
// para representar sus posiciones visualmente.
export function positions(state: readonly number[]): number[] {
  return [state[0], state[1], state[4], state[5], state[8], state[9]];
}

// Encuentra el centro y el radio que contienen toda la trayectoria.
export const orbitBounds = (samples: readonly number[][]) => {
  // Inicializa los límites espaciales de toda la trayectoria.
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const sample of samples) {
    for (let body = 0; body < 3; body++) {
      minX = Math.min(minX, sample[body * 2]);
      maxX = Math.max(maxX, sample[body * 2]);
      minY = Math.min(minY, sample[body * 2 + 1]);
      maxY = Math.max(maxY, sample[body * 2 + 1]);
    }
  }

  // Calcula el centro horizontal de las trayectorias.
  const cx = (minX + maxX) / 2;

  // Calcula el centro vertical de las trayectorias.
  const cy = (minY + maxY) / 2;

  // Inicializa el radio necesario para visualizar la órbita completa.
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
