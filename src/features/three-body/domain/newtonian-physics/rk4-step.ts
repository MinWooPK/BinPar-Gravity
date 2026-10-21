import type { GravityParameters } from "./physics-parameters";
import { derivative } from "./newtonian-derivative";

// Calcula el siguiente estado mediante RK4.
export const rk4Step = (
  state: readonly number[],
  step: number,
  physics: GravityParameters,
): number[] => {
  // Primera estimación.
  const k1 = derivative(state, physics);

  // Segunda estimación a mitad del paso.
  const k2 = derivative(
    state.map((value, index) => value + (step * k1[index]) / 2),
    physics,
  );

  // Tercera estimación a mitad del paso.
  const k3 = derivative(
    state.map((value, index) => value + (step * k2[index]) / 2),
    physics,
  );

  // Cuarta estimación al final del paso.
  const k4 = derivative(
    state.map((value, index) => value + step * k3[index]),
    physics,
  );

  // Combina las cuatro estimaciones.
  return state.map(
    (value, index) =>
      value +
      (step * (k1[index] + 2 * k2[index] + 2 * k3[index] + k4[index])) / 6,
  );
};
