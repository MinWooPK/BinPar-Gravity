import type { GravityParameters } from "./physics-parameters";
import { derivative } from "./newtonian-derivative";

// Calcula el siguiente estado del sistema mediante
// el método de integración Runge-Kutta de cuarto orden (RK4).
export const rk4Step = (
  state: readonly number[],
  step: number,
  physics: GravityParameters,
): number[] => {
  // Calcula la primera estimación de las derivadas.
  const k1 = derivative(state, physics);

  // Calcula la segunda estimación a mitad del paso temporal.
  const k2 = derivative(
    state.map((value, index) => value + (step * k1[index]) / 2),
    physics,
  );

  // Calcula la tercera estimación utilizando el resultado de k2.
  const k3 = derivative(
    state.map((value, index) => value + (step * k2[index]) / 2),
    physics,
  );

  // Calcula la cuarta estimación al final del paso temporal.
  const k4 = derivative(
    state.map((value, index) => value + step * k3[index]),
    physics,
  );

  // Combina las cuatro estimaciones para obtener el siguiente estado.
  return state.map(
    (value, index) =>
      value +
      (step * (k1[index] + 2 * k2[index] + 2 * k3[index] + k4[index])) / 6,
  );
};
