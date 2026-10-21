import { expect, test } from "vitest";
import { isSameOriginRequest } from "../src/features/ai/infrastructure/requestGuard";

test.each([3000, 3100])(
  "Admite localhost:%i frente al hostname interno de Docker",
  (port) => {
    const request = new Request("http://0.0.0.0:3000/api/ai", {
      headers: { host: `localhost:${port}`, origin: `http://localhost:${port}` },
    });
    expect(isSameOriginRequest(request)).toBe(true);
  },
);

test("Conserva la validación HTTPS y el comportamiento sin cabecera Host", () => {
  const https = new Request("https://example.com/api/ai", {
    headers: { host: "example.com", origin: "https://example.com" },
  });
  const withoutHost = new Request("http://localhost:3000/api/ai", {
    headers: { origin: "http://localhost:3000" },
  });
  expect(isSameOriginRequest(https)).toBe(true);
  expect(isSameOriginRequest(withoutHost)).toBe(true);
  expect(isSameOriginRequest(new Request("http://localhost:3000/api/ai"))).toBe(true);
});

test.each([
  "https://other.example",
  "https://localhost:3000",
  "http://localhost:3100",
  "null",
])("Rechaza el origen ajeno %s", (origin) => {
  const request = new Request("http://0.0.0.0:3000/api/ai", {
    headers: {
      host: "localhost:3000",
      origin,
      "x-forwarded-host": origin.replace(/^https?:\/\//, ""),
    },
  });
  expect(isSameOriginRequest(request)).toBe(false);
});

test.each(["localhost:3000/path", "user@localhost:3000", "[invalid"])(
  "Rechaza Host inválido %s",
  (host) => {
    const request = new Request("http://0.0.0.0:3000/api/ai", {
      headers: { host, origin: "http://localhost:3000" },
    });
    expect(isSameOriginRequest(request)).toBe(false);
  },
);
