// Masa, posición y velocidad de cada cuerpo.
export type ExperimentBody = Readonly<{
  mass: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}>;

// Configuración del experimento.
export type ExperimentConfiguration = Readonly<{
  gravity: number;
  duration: number;
  bodies: readonly ExperimentBody[];
}>;

// Posiciones y velocidades de los tres cuerpos.
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

// Estado físico en un instante.
export type ExperimentStateSample = Readonly<{
  time: number;
  state: ExperimentState;
}>;

// Trayectoria y datos para visualizarla.
export type ExperimentTrajectory = {
  duration: number;
  samples: number[][]; // [x1, y1, x2, y2, x3, y3]
  stateSamples: ExperimentStateSample[]; // Estados aceptados por el integrador.
  bounds: { cx: number; cy: number; radius: number };
};
