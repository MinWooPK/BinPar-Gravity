// Convierte un texto en un número positivo válido.
export const parseFormulaValue = (text: string): number | null => {
  // Elimina espacios y permite decimales con coma.
  const normalized = text.trim().replace(",", ".");

  // Comprueba que el formato sea correcto.
  if (!/^[+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized))
    return null;

  const value = Number(normalized);

  // Devuelve el número si es válido.
  return Number.isFinite(value) && value > 0 ? value : null;
};
