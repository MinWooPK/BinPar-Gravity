import {
  rk4Step,
  validateGravityParameters,
  type GravityParameters,
} from "./newtonian-physics";

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

// Establece el número máximo de intentos permitidos durante la integración.
const MAX_ATTEMPTS = 150_000;

// Define la distancia mínima de seguridad entre dos cuerpos.
const MIN_DISTANCE = 1e-3;

// Define la tolerancia relativa del error numérico.
const RELATIVE_TOLERANCE = 1e-8;

// Define la tolerancia absoluta del error numérico.
const ABSOLUTE_TOLERANCE = 1e-9;

// Extrae únicamente las posiciones X e Y de los tres cuerpos.
const positions = (state: readonly number[]): number[] => [
  state[0],
  state[1],
  state[4],
  state[5],
  state[8],
  state[9],
];

// Valida que el estado contenga posiciones y velocidades finitas
// y que los cuerpos mantengan una separación mínima de seguridad.
export function validateExperimentState(
  state: readonly number[],
): asserts state is ExperimentState {
  if (state.length !== 12 || !state.every(Number.isFinite)) {
    throw new RangeError(
      "Las posiciones y velocidades deben ser números finitos.",
    );
  }

  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) {
      // Identifica las posiciones de los dos cuerpos que se comparan.
      const a = 4 * i;
      const b = 4 * j;

      if (
        Math.hypot(state[a] - state[b], state[a + 1] - state[b + 1]) <
        MIN_DISTANCE
      ) {
        throw new RangeError(
          "Los cuerpos se han acercado demasiado para calcular la trayectoria con seguridad.",
        );
      }
    }
  }
}

// Crea un integrador RK4 adaptativo que ajusta el paso temporal
// según el error numérico y las condiciones del sistema.
function createIntegrator(
  start: ExperimentStateSample,
  duration: number,
  physics: GravityParameters,
  initialStep: number,
  maxAttempts = MAX_ATTEMPTS,
  observe?: (sample: ExperimentStateSample) => void,
) {
  // Guarda el estado físico actual de los tres cuerpos.
  let state: ExperimentState = start.state;

  // Guarda el instante actual de la simulación.
  let time = start.time;

  // Cuenta los intentos realizados por el integrador.
  let attempts = 0;

  // Guarda el tamaño del siguiente paso temporal.
  let step = initialStep;

  // Establece el tamaño mínimo permitido para cada paso.
  const minimumStep = Math.max(duration * 1e-12, Number.MIN_VALUE);

  // Establece el tamaño máximo permitido para cada paso.
  const maximumStep = duration / 50;

  // Avanza la simulación hasta un instante concreto,
  // adaptando el paso según la precisión del cálculo.
  const advance = (target: number): ExperimentStateSample => {
    while (time < target) {
      if (++attempts > maxAttempts) {
        throw new RangeError(
          "El cálculo ha superado el límite de pasos; prueba con otros parámetros.",
        );
      }

      // Calcula el tamaño del paso que se intentará ejecutar.
      const h = Math.min(step, target - time, maximumStep);

      // Comprueba si el paso termina exactamente en el instante solicitado.
      const clippedToTarget = h === target - time;

      if (
        time + h === time ||
        (h < minimumStep && target - time > minimumStep)
      ) {
        throw new RangeError(
          "Los cuerpos se acercan demasiado para continuar con precisión.",
        );
      }

      // Calcula el resultado utilizando un único paso RK4.
      const full = rk4Step(state, h, physics);

      // Calcula la primera mitad del mismo intervalo temporal.
      const firstHalf = rk4Step(state, h / 2, physics);

      // Completa el intervalo utilizando dos medios pasos RK4.
      const twoHalves = rk4Step(firstHalf, h / 2, physics);

      // Guarda el mayor error numérico normalizado del paso.
      let error = 0;

      // Calcula un estado corregido comparando ambos resultados RK4.
      const candidate = twoHalves.map((value, component) => {
        // Estima la corrección numérica del componente.
        const correction = (value - full[component]) / 15;

        // Calcula la escala de tolerancia del componente.
        const scale =
          ABSOLUTE_TOLERANCE +
          RELATIVE_TOLERANCE *
            Math.max(Math.abs(state[component]), Math.abs(value));

        error = Math.max(error, Math.abs(correction) / scale);

        return value + correction;
      });

      if (!Number.isFinite(error) || !candidate.every(Number.isFinite)) {
        throw new RangeError("El cálculo produjo valores no finitos.");
      }

      if (error <= 1) {
        validateExperimentState(candidate);
        state = candidate;
        time = h === target - time ? target : time + h;
        observe?.({ time, state });
      }

      // Ajusta el siguiente paso según el error, evitando que
      // un pequeño resto de redondeo provoque un rechazo incorrecto.
      if (!(clippedToTarget && h < minimumStep)) {
        step =
          h * Math.max(0.2, Math.min(4, error === 0 ? 4 : 0.9 * error ** -0.2));
      }
    }

    return { time, state };
  };

  return { advance, attempts: () => attempts };
}

// Recalcula el estado físico desde una muestra real hasta un instante
// determinado, utilizando el mismo integrador RK4 adaptativo.
export function refineExperimentState(
  start: ExperimentStateSample,
  target: number,
  duration: number,
  physics: GravityParameters,
  maxAttempts = MAX_ATTEMPTS,
): { sample: ExperimentStateSample; attempts: number } {
  validateGravityParameters(physics);
  validateExperimentState(start.state);

  if (
    !Number.isFinite(duration) ||
    duration <= 0 ||
    duration > 100 ||
    !Number.isFinite(start.time) ||
    start.time < 0 ||
    !Number.isFinite(target) ||
    target < start.time ||
    target > duration ||
    !Number.isInteger(maxAttempts) ||
    maxAttempts < 1 ||
    maxAttempts > MAX_ATTEMPTS
  ) {
    throw new RangeError("El intervalo de refinamiento no es válido.");
  }

  // Crea un integrador para recalcular el intervalo solicitado.
  const integrator = createIntegrator(
    start,
    duration,
    physics,
    (target - start.time) / 4,
    maxAttempts,
  );

  return {
    sample: integrator.advance(target),
    attempts: integrator.attempts(),
  };
}

// Simula el movimiento gravitatorio de tres cuerpos durante
// un intervalo de tiempo mediante integración RK4 adaptativa.
export function simulateExperiment(
  config: ExperimentConfiguration,
  sampleCount = 601,
): ExperimentTrajectory {
  // Obtiene los cuerpos, la constante gravitatoria y la duración.
  const { bodies, gravity: G, duration } = config;

  if (!Array.isArray(bodies) || bodies.length !== 3) {
    throw new RangeError("La simulación necesita exactamente tres cuerpos.");
  }

  if (!Number.isFinite(duration) || duration <= 0 || duration > 100) {
    throw new RangeError(
      "La duración debe ser mayor que 0 y no superar 100 unidades de tiempo.",
    );
  }

  if (!Number.isInteger(sampleCount) || sampleCount < 2 || sampleCount > 2000) {
    throw new RangeError("El número de muestras debe estar entre 2 y 2000.");
  }

  // Prepara los parámetros físicos utilizados por el motor Newtoniano.
  const physics: GravityParameters = {
    G,
    masses: [bodies[0].mass, bodies[1].mass, bodies[2].mass],
  };

  validateGravityParameters(physics);

  // Convierte las condiciones iniciales en el estado físico de 12 componentes.
  const initial = bodies.flatMap(({ x, y, vx, vy }) => [x, y, vx, vy]);

  validateExperimentState(initial);

  // Guarda las posiciones iniciales para representar la trayectoria.
  const samples = [positions(initial)];

  // Guarda los estados físicos aceptados durante la integración.
  const stateSamples: ExperimentStateSample[] = [{ time: 0, state: initial }];

  // Calcula el intervalo temporal entre las muestras visuales.
  const sampleInterval = duration / (sampleCount - 1);

  // Prepara el integrador y registra los estados físicos calculados.
  const integrator = createIntegrator(
    stateSamples[0],
    duration,
    physics,
    Math.min(sampleInterval, duration / 500),
    MAX_ATTEMPTS,
    (sample) => stateSamples.push(sample),
  );

  for (let index = 1; index < sampleCount; index++) {
    // Determina el instante correspondiente a cada muestra visual.
    const target =
      index === sampleCount - 1 ? duration : index * sampleInterval;

    samples.push(positions(integrator.advance(target).state));
  }

  // Inicializa los límites espaciales de la trayectoria.
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const sample of samples) {
    for (let body = 0; body < 3; body++) {
      // Obtiene las coordenadas del cuerpo en la muestra actual.
      const x = sample[body * 2];
      const y = sample[body * 2 + 1];

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }

  // Calcula el centro horizontal de toda la trayectoria.
  const cx = (minX + maxX) / 2;

  // Calcula el centro vertical de toda la trayectoria.
  const cy = (minY + maxY) / 2;

  // Calcula el radio necesario para encajar la trayectoria en una vista SVG.
  const radius = Math.max(
    1e-9,
    ...samples.flatMap((sample) => [
      Math.hypot(sample[0] - cx, sample[1] - cy),
      Math.hypot(sample[2] - cx, sample[3] - cy),
      Math.hypot(sample[4] - cx, sample[5] - cy),
    ]),
  );

  return { duration, samples, stateSamples, bounds: { cx, cy, radius } };
}
