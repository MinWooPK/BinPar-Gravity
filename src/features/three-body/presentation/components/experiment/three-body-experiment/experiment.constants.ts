// Valores visuales originales para las tres masas y los inputs.
export const bodyColors = ["#aa97ff", "#5ee7d5", "#f4c778"];

export const bodyFields = [
  { key: "mass", label: "mass" },
  { key: "x", label: "positionX" },
  { key: "y", label: "positionY" },
  { key: "vx", label: "velocityX" },
  { key: "vy", label: "velocityY" },
] as const;

export const inputStyles =
  "min-h-11 min-w-0 w-full bg-[#0d1320] " +
  "px-3 py-2 text-sm text-slate-100 outline-none " +
  "focus-visible:ring-2 focus-visible:ring-[#aa97ff]/50 " +
  "[appearance:textfield] " +
  "[&::-webkit-inner-spin-button]:appearance-none " +
  "[&::-webkit-outer-spin-button]:appearance-none";

export const bodySymbols = {
  mass: "m",
  x: "x",
  y: "y",
  vx: "vₓ",
  vy: "vᵧ",
} as const;
