/** Editable SI values: decimal point or comma, optionally scientific notation. */
export const parseFormulaValue = (text: string): number | null => {
  const normalized = text.trim().replace(",", ".");
  if (!/^[+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized))
    return null;
  const value = Number(normalized);
  return Number.isFinite(value) && value > 0 ? value : null;
};
