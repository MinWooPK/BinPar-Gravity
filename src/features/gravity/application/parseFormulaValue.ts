// Convierte el texto introducido en la calculadora en un número positivo válido.
// Admite decimales con punto o coma y notación científica.
export const parseFormulaValue = (text: string): number | null => {
  // Elimina espacios y sustituye la coma decimal por un punto.
  const normalized = text.trim().replace(",", ".");

  if (!/^[+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized))
    return null;

  // Convierte el texto en número y comprueba que sea finito y positivo.
  const value = Number(normalized);

  return Number.isFinite(value) && value > 0 ? value : null;
};
