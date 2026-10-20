import {
  refineExperimentState,
  validateExperimentState,
  type ExperimentState,
  type ExperimentTrajectory,
} from "./experiment-simulation";

import {
  validateGravityParameters,
  type GravityParameters,
} from "./newtonian-physics";

// Define el margen de error permitido para considerar un retorno periódico.
export const PERIODICITY_TOLERANCE = 1e-3;

// Establece el desplazamiento mínimo antes de buscar un retorno al estado inicial.
export const MINIMUM_PERIODICITY_EXCURSION = 0.05;

// Limita los intentos de integración durante el refinamiento.
const MAX_REFINEMENT_ATTEMPTS = 150_000;

// Define el resultado del análisis de periodicidad del experimento.
export type PeriodicityResult = Readonly<{
  detected: boolean;
  estimatedPeriod: number | null;
  positionError: number;
  velocityError: number;
  combinedError: number;
  tolerance: number;
  evaluatedTime: number;
  reason: "approximateReturn" | "noReturn" | "insufficientMotion";
}>;

// Define los datos de la simulación y el resultado de periodicidad
// que se comparten con la interfaz desde el Worker.
export type AnalyzedExperimentTrajectory = Pick<
  ExperimentTrajectory,
  "duration" | "samples" | "bounds"
> & {
  periodicity: PeriodicityResult;
};

// Define los errores de posición, velocidad y retorno combinado.
export type ReturnErrors = Pick<
  PeriodicityResult,
  "positionError" | "velocityError" | "combinedError"
>;

// Define las escalas de referencia para comparar posiciones y velocidades.
export type CharacteristicScales = Readonly<{
  position: number;
  velocity: number;
}>;

// Calcula las escalas características del sistema a partir
// de sus distancias iniciales, velocidades y parámetros físicos.
export function characteristicScales(
  initial: ExperimentState,
  physics: GravityParameters,
): CharacteristicScales {
  // Calcula las distancias iniciales entre los tres pares de cuerpos.
  const distances = [
    [0, 4],
    [0, 8],
    [4, 8],
  ].map(([a, b]) =>
    Math.hypot(initial[a] - initial[b], initial[a + 1] - initial[b + 1]),
  );

  // Calcula una escala de posición basada en las separaciones iniciales.
  const position = Math.hypot(...distances) / Math.sqrt(3);

  // Calcula la masa total de los tres cuerpos.
  const totalMass = physics.masses.reduce((sum, mass) => sum + mass, 0);

  // Inicializa los componentes de la velocidad del centro de masas.
  let cx = 0;
  let cy = 0;

  for (let body = 0; body < 3; body++) {
    cx += initial[4 * body + 2] * (physics.masses[body] / totalMass);
    cy += initial[4 * body + 3] * (physics.masses[body] / totalMass);
  }

  // Calcula las velocidades de los cuerpos respecto al centro de masas.
  const internalSpeeds = [0, 4, 8].map((offset) =>
    Math.hypot(initial[offset + 2] - cx, initial[offset + 3] - cy),
  );

  // Calcula la escala de velocidad usando el movimiento interno
  // y una referencia basada en la gravedad del sistema.
  const velocity = Math.max(
    Math.hypot(...internalSpeeds) / Math.sqrt(3),
    Math.sqrt(physics.G * (totalMass / position)),
  );

  if (
    ![position, velocity, totalMass].every(
      (value) => Number.isFinite(value) && value > 0,
    )
  ) {
    throw new RangeError(
      "Las escalas del sistema no se pueden representar con seguridad.",
    );
  }

  return { position, velocity };
}

// Calcula cuánto se diferencia el estado actual del inicial,
// utilizando errores normalizados de posición y velocidad.
function returnErrors(
  initial: ExperimentState,
  state: ExperimentState,
  scales: CharacteristicScales,
): ReturnErrors {
  // Guarda el mayor error de posición entre los tres cuerpos.
  let positionError = 0;

  // Guarda el mayor error de velocidad entre los tres cuerpos.
  let velocityError = 0;

  for (const offset of [0, 4, 8]) {
    positionError = Math.max(
      positionError,
      Math.hypot(
        state[offset] - initial[offset],
        state[offset + 1] - initial[offset + 1],
      ) / scales.position,
    );

    velocityError = Math.max(
      velocityError,
      Math.hypot(
        state[offset + 2] - initial[offset + 2],
        state[offset + 3] - initial[offset + 3],
      ) / scales.velocity,
    );
  }

  // Selecciona el mayor de los dos errores como medida del retorno.
  const combinedError = Math.max(positionError, velocityError);

  if (!Number.isFinite(combinedError)) {
    throw new RangeError(
      "El error de retorno no se puede representar con seguridad.",
    );
  }

  return { positionError, velocityError, combinedError };
}

// Mide los errores de retorno entre dos estados físicos,
// validando previamente las condiciones del sistema.
export function measureReturnErrors(
  initial: ExperimentState,
  state: ExperimentState,
  physics: GravityParameters,
): ReturnErrors {
  validateGravityParameters(physics);
  validateExperimentState(initial);
  validateExperimentState(state);

  return returnErrors(initial, state, characteristicScales(initial, physics));
}

// Analiza una trayectoria para detectar si los tres cuerpos
// regresan aproximadamente a sus posiciones y velocidades iniciales.
export function detectPeriodicity(
  trajectory: Pick<ExperimentTrajectory, "duration" | "stateSamples">,
  physics: GravityParameters,
): PeriodicityResult {
  validateGravityParameters(physics);

  // Obtiene la duración y los estados físicos calculados.
  const { duration, stateSamples } = trajectory;

  if (
    !Number.isFinite(duration) ||
    duration <= 0 ||
    duration > 100 ||
    stateSamples.length < 2 ||
    stateSamples.length > 150_001 ||
    stateSamples[0].time !== 0 ||
    stateSamples[stateSamples.length - 1].time !== duration
  ) {
    throw new RangeError(
      "La trayectoria no contiene un intervalo de análisis válido.",
    );
  }

  for (let index = 0; index < stateSamples.length; index++) {
    // Obtiene la muestra física que se está validando.
    const sample = stateSamples[index];

    if (
      !Number.isFinite(sample.time) ||
      (index > 0 && sample.time <= stateSamples[index - 1].time)
    ) {
      throw new RangeError(
        "Los instantes de análisis deben ser finitos y crecientes.",
      );
    }

    validateExperimentState(sample.state);
  }

  // Obtiene el estado inicial utilizado como referencia.
  const initial = stateSamples[0].state;

  // Calcula las escalas de posición y velocidad del sistema.
  const scales = characteristicScales(initial, physics);

  // Calcula los errores de retorno de todas las muestras.
  const errors = stateSamples.map(({ state }) =>
    returnErrors(initial, state, scales),
  );

  // Guarda inicialmente el retorno correspondiente al último instante.
  let best = { time: duration, ...errors[errors.length - 1] };

  // Identifica cuándo el sistema se ha alejado suficientemente del inicio.
  let departureIndex: number | null = null;

  // Controla los intentos disponibles para refinar los posibles retornos.
  let remainingAttempts = MAX_REFINEMENT_ATTEMPTS;

  // Construye el resultado final del análisis de periodicidad.
  const result = (detected: boolean): PeriodicityResult => ({
    detected,
    estimatedPeriod: detected ? best.time : null,
    positionError: best.positionError,
    velocityError: best.velocityError,
    combinedError: best.combinedError,
    tolerance: PERIODICITY_TOLERANCE,
    evaluatedTime: best.time,
    reason: detected
      ? "approximateReturn"
      : departureIndex === null
        ? "insufficientMotion"
        : "noReturn",
  });

  for (let index = 1; index < stateSamples.length; index++) {
    if (departureIndex === null) {
      if (errors[index].positionError >= MINIMUM_PERIODICITY_EXCURSION) {
        departureIndex = index;
        best = { time: stateSamples[index].time, ...errors[index] };
      }

      continue;
    }

    if (errors[index].combinedError < best.combinedError) {
      best = { time: stateSamples[index].time, ...errors[index] };
    }

    // Comprueba si se ha llegado a la última muestra.
    const last = index === stateSamples.length - 1;

    if (
      errors[index].combinedError > errors[index - 1].combinedError ||
      (!last && errors[index].combinedError > errors[index + 1].combinedError)
    )
      continue;

    // Obtiene el estado desde el que comienza el refinamiento.
    const start = stateSamples[index - 1];

    // Define los límites temporales del intervalo que se analizará.
    let left = start.time;
    let right = stateSamples[last ? index : index + 1].time;

    // Recalcula el estado físico en un instante concreto
    // y actualiza el mejor retorno encontrado.
    const evaluate = (time: number) => {
      // Reintegra la trayectoria hasta el instante solicitado.
      const refined = refineExperimentState(
        start,
        time,
        duration,
        physics,
        remainingAttempts,
      );

      remainingAttempts -= refined.attempts;

      // Calcula los errores del estado refinado respecto al inicial.
      const candidate = {
        time,
        ...returnErrors(initial, refined.sample.state, scales),
      };

      if (candidate.combinedError < best.combinedError) best = candidate;

      return candidate;
    };

    evaluate(stateSamples[index].time);

    // Define la proporción utilizada por la búsqueda de sección áurea.
    const ratio = (Math.sqrt(5) - 1) / 2;

    // Evalúa el primer punto interior del intervalo.
    let a = evaluate(right - ratio * (right - left));

    // Evalúa el segundo punto interior del intervalo.
    let b = evaluate(left + ratio * (right - left));

    // Refina el instante del posible retorno buscando el menor error.
    for (
      let iteration = 0;
      iteration < 40 && right - left > duration * 1e-10;
      iteration++
    ) {
      if (a.combinedError <= b.combinedError) {
        right = b.time;
        b = a;
        a = evaluate(right - ratio * (right - left));
      } else {
        left = a.time;
        a = b;
        b = evaluate(left + ratio * (right - left));
      }
    }

    if (best.combinedError <= PERIODICITY_TOLERANCE) return result(true);
  }

  return result(false);
}
