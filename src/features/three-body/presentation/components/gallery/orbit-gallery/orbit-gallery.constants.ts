import type { OrbitCategoryFilter } from "../../../../types/gallery.types";

// Mantiene el orden original de los filtros y las claves de traducción.
export const categoryNames = {
  Clásica: "categoryClassical",
  Coreografía: "categoryChoreography",
  Periódica: "categoryPeriodic",
} as const;

export const categoryFilters: readonly OrbitCategoryFilter[] = [
  "all",
  "Clásica",
  "Coreografía",
  "Periódica",
];
