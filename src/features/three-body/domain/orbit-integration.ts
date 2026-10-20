import type { OrbitData, OrbitDefinition } from "../types/orbit.types";
import { CATALOGUE_PHYSICS, rk4Step } from "./newtonian-physics";

// Define el número total de componentes del estado físico de los tres cuerpos.
const DIMENSIONS = 12;

// Define la tolerancia relativa utilizada para controlar el error numérico.
const RELATIVE_TOLERANCE = 2e-12;

// Define la tolerancia absoluta utilizada para controlar el error numérico.
const ABSOLUTE_TOLERANCE = 2e-13;

// Establece el número máximo de intentos durante la integración.
const MAX_ATTEMPTS = 100_000;

// Establece el número máximo de muestras de una órbita.
const MAX_SAMPLES = 20_000;

// Calcula las magnitudes físicas del sistema para comprobar
// la estabilidad y precisión de la integración.
function invariants(state: readonly number[]) {
  // Acumula la energía mecánica total del sistema.
  let energy = 0;

  // Acumula el momento lineal en el eje X.
  let px = 0;

  // Acumula el momento lineal en el eje Y.
  let py = 0;

  // Acumula el momento angular del sistema.
  let angularMomentum = 0;

  // Acumula la coordenada X del centro de masas.
  let cx = 0;

  // Acumula la coordenada Y del centro de masas.
  let cy = 0;

  // Guarda la menor distancia encontrada entre dos cuerpos.
  let minSeparation = Infinity;

  for (let body = 0; body < 3; body++) {
    // Obtiene la posición y velocidad del cuerpo actual.
    const [x, y, vx, vy] = state.slice(body * 4, body * 4 + 4);

    energy += (vx * vx + vy * vy) / 2;
    px += vx;
    py += vy;
    angularMomentum += x * vy - y * vx;
    cx += x / 3;
    cy += y / 3;

    for (let other = body + 1; other < 3; other++) {
      // Calcula la distancia entre los dos cuerpos.
      const distance = Math.hypot(
        x - state[other * 4],
        y - state[other * 4 + 1],
      );

      if (!Number.isFinite(distance) || distance <= 1e-12) {
        throw new RangeError(
          "The orbit contains a collision or an unrepresentable separation.",
        );
      }

      energy -= 1 / distance;
      minSeparation = Math.min(minSeparation, distance);
    }
  }

  if (![energy, px, py, angularMomentum, cx, cy].every(Number.isFinite)) {
    throw new RangeError("The orbit's physical quantities must remain finite.");
  }

  return { energy, px, py, angularMomentum, cx, cy, minSeparation };
}

// Extrae las coordenadas X e Y de los tres cuerpos
// para representar sus posiciones visualmente.
function positions(state: readonly number[]): number[] {
  return [state[0], state[1], state[4], state[5], state[8], state[9]];
}

// Calcula una órbita completa mediante RK4 adaptativo,
// controlando el error numérico y registrando diagnósticos físicos.
// Las muestras siguen el tiempo físico y no se fuerza el cierre de la órbita.
export const integrateOrbit = (
  orbit: OrbitDefinition,
  sampleCount = 1200,
): OrbitData => {
  if (!Number.isFinite(orbit.period) || orbit.period <= 0) {
    throw new RangeError("The period must be a positive finite number.");
  }

  if (
    !Number.isInteger(sampleCount) ||
    sampleCount < 2 ||
    sampleCount > MAX_SAMPLES
  ) {
    throw new RangeError(
      `The sample count must be an integer between 2 and ${MAX_SAMPLES}.`,
    );
  }

  if (
    !Array.isArray(orbit.initial) ||
    orbit.initial.length !== 3 ||
    orbit.initial.some(
      (body) =>
        !Array.isArray(body) ||
        body.length !== 4 ||
        !body.every(Number.isFinite),
    )
  ) {
    throw new RangeError("An orbit needs three finite [x, y, vx, vy] states.");
  }

  // Convierte las condiciones iniciales en un array de 12 componentes.
  const initial = orbit.initial.flat();

  // Guarda el estado físico que irá evolucionando durante la integración.
  let state = initial.slice();

  // Calcula las magnitudes físicas iniciales que servirán de referencia.
  const reference = invariants(initial);

  // Almacena los indicadores de precisión y estabilidad de la órbita.
  const diagnostics: OrbitData["diagnostics"] = {
    closure: 0,
    positionClosure: 0,
    maxEnergyDrift: 0,
    maxMomentum: Math.hypot(reference.px, reference.py),
    maxAngularDrift: 0,
    maxCenterOfMass: Math.hypot(reference.cx, reference.cy),
    minSeparation: reference.minSeparation,
    acceptedSteps: 0,
    rejectedSteps: 0,
  };

  // Actualiza los diagnósticos físicos después de cada paso aceptado.
  const observe = (accepted: readonly number[]) => {
    // Calcula las magnitudes físicas del estado aceptado.
    const current = invariants(accepted);

    diagnostics.maxEnergyDrift = Math.max(
      diagnostics.maxEnergyDrift,
      Math.abs(current.energy - reference.energy) /
        Math.max(Math.abs(reference.energy), Number.EPSILON),
    );

    diagnostics.maxMomentum = Math.max(
      diagnostics.maxMomentum,
      Math.hypot(current.px, current.py),
    );

    diagnostics.maxAngularDrift = Math.max(
      diagnostics.maxAngularDrift,
      Math.abs(current.angularMomentum - reference.angularMomentum),
    );

    diagnostics.maxCenterOfMass = Math.max(
      diagnostics.maxCenterOfMass,
      Math.hypot(current.cx, current.cy),
    );

    diagnostics.minSeparation = Math.min(
      diagnostics.minSeparation,
      current.minSeparation,
    );
  };

  // Inicializa las muestras con las posiciones originales.
  const samples = [positions(initial)];

  // Calcula el intervalo de tiempo entre las muestras visuales.
  const interval = orbit.period / (sampleCount - 1);

  // Define el paso temporal mínimo permitido.
  const minimumStep = Math.max(orbit.period * 1e-14, Number.MIN_VALUE);

  // Define el paso temporal máximo permitido.
  const maximumStep = orbit.period / 40;

  // Establece el tamaño inicial del paso de integración.
  let step = Math.min(interval, orbit.period / 400);

  // Guarda el tiempo físico transcurrido.
  let time = 0;

  // Cuenta los intentos de integración realizados.
  let attempts = 0;

  for (let sample = 1; sample < sampleCount; sample++) {
    // Determina el instante físico correspondiente a la siguiente muestra.
    const target =
      sample === sampleCount - 1 ? orbit.period : sample * interval;

    while (time < target) {
      if (++attempts > MAX_ATTEMPTS) {
        throw new RangeError("The orbit exceeded the integration step limit.");
      }

      // Calcula el tamaño del paso temporal que se intentará ejecutar.
      const h = Math.min(step, target - time, maximumStep);

      if (
        time + h === time ||
        (h < minimumStep && target - time > minimumStep)
      ) {
        throw new RangeError(
          "The orbit needs a step below the supported numerical resolution.",
        );
      }

      // Calcula una estimación utilizando un paso RK4 completo.
      const full = rk4Step(state, h, CATALOGUE_PHYSICS);

      // Calcula una estimación utilizando la primera mitad del paso.
      const firstHalf = rk4Step(state, h / 2, CATALOGUE_PHYSICS);

      // Calcula otra estimación completando dos medios pasos RK4.
      const twoHalves = rk4Step(firstHalf, h / 2, CATALOGUE_PHYSICS);

      // Almacena el mayor error numérico normalizado.
      let error = 0;

      // Corrige la estimación comparando el paso completo
      // con los dos medios pasos mediante extrapolación de Richardson.
      const corrected = twoHalves.map((value, index) => {
        // Calcula la corrección estimada para cada componente.
        const difference = (value - full[index]) / 15;

        // Calcula el límite de tolerancia para el componente.
        const scale =
          ABSOLUTE_TOLERANCE +
          RELATIVE_TOLERANCE *
            Math.max(Math.abs(state[index]), Math.abs(value));

        error = Math.max(error, Math.abs(difference) / scale);

        return value + difference;
      });

      if (!Number.isFinite(error) || !corrected.every(Number.isFinite)) {
        throw new RangeError("The integration produced a non-finite state.");
      }

      if (error <= 1) {
        state = corrected;

        // Actualiza el tiempo evitando errores acumulados de redondeo.
        time = h === target - time ? target : time + h;

        diagnostics.acceptedSteps++;
        observe(state);
      } else {
        diagnostics.rejectedSteps++;
      }

      // Ajusta el siguiente paso temporal según el error obtenido.
      step =
        h * Math.max(0.2, Math.min(4, error === 0 ? 4 : 0.9 * error ** -0.2));
    }

    samples.push(positions(state));
  }

  // Calcula cuánto difiere el estado final del estado inicial.
  diagnostics.closure = Math.sqrt(
    state.reduce(
      (total, value, index) => total + (value - initial[index]) ** 2,
      0,
    ) / DIMENSIONS,
  );

  // Obtiene las posiciones iniciales de los tres cuerpos.
  const firstPositions = samples[0];

  // Calcula la diferencia entre las posiciones finales e iniciales.
  diagnostics.positionClosure = Math.sqrt(
    samples[samples.length - 1].reduce(
      (total, value, index) => total + (value - firstPositions[index]) ** 2,
      0,
    ) / 6,
  );

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

  return {
    slug: orbit.slug,
    period: orbit.period,
    samples,
    bounds: { cx, cy, radius },
    diagnostics,
  };
};
