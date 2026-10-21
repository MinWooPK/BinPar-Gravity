// Define la masa, posición y velocidad de cada cuerpo en dos dimensiones.
export type ExperimentBody = Readonly<{
  mass: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}>;

// Define la configuración física y duración del experimento.
export type ExperimentConfiguration = Readonly<{
  gravity: number;
  duration: number;
  bodies: readonly ExperimentBody[];
}>;

// Representa el estado completo de los tres cuerpos,
// incluyendo las posiciones y velocidades de cada uno.
export type ExperimentState = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

// Representa el estado físico del sistema en un instante determinado.
export type ExperimentStateSample = Readonly<{
  time: number;
  state: ExperimentState;
}>;

// Define los datos de la trayectoria calculada,
// incluyendo las muestras y los límites para visualizarla.
export type ExperimentTrajectory = {
  duration: number;
  samples: number[][]; // [x1, y1, x2, y2, x3, y3] por instante
  // Conserva los pasos aceptados del integrador para análisis más precisos.
  stateSamples: ExperimentStateSample[];
  bounds: { cx: number; cy: number; radius: number };
};
