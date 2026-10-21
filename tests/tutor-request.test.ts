import { test, expect } from "vitest";

import { isTutorRequest } from "../src/features/ai/application/legacyTutorRequest";
import { initialParameters } from "../src/features/gravity/domain/gravitation";

const locales = ["es", "en", "fr"] as const;
const request = {
  locale: "es",
  mode: "explain",
  parameters: { ...initialParameters },
};

// TEST 1: Aceptar solicitudes válidas.
test("Acepta una solicitud válida", () => {
  expect(isTutorRequest(request, locales)).toBe(true);
});

// TEST 2: Rechazar idiomas y modos incorrectos.
test("Rechaza idiomas y modos inválidos", () => {
  expect(isTutorRequest({ ...request, locale: "de" }, locales)).toBe(false);

  expect(isTutorRequest({ ...request, mode: "other" }, locales)).toBe(false);
});

// TEST 3: Rechazar parámetros físicos inválidos.
test("Rechaza parámetros inválidos", () => {
  expect(
    isTutorRequest(
      {
        ...request,
        parameters: { ...initialParameters, mass1: -1 },
      },
      locales,
    ),
  ).toBe(false);

  expect(
    isTutorRequest(
      {
        ...request,
        parameters: { ...initialParameters, distance: 0 },
      },
      locales,
    ),
  ).toBe(false);
});
