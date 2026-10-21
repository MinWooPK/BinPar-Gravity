import "server-only";

import { requestOpenAI } from "@/features/ai/infrastructure/openaiResponse";

// Crea un objeto para el esquema JSON.
export const obj = (properties: Record<string, unknown>) => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

// Tipos de datos del esquema JSON.
export const str = { type: "string" };

export const array = (items: unknown) => ({
  type: "array",
  items,
});

// Define el formato de respuesta de OpenAI.
const format = (name: string, schema: unknown) => ({
  type: "json_schema",
  name,
  strict: true,
  schema,
});

// Comprueba que el texto sea válido.
export const boundedText = (v: unknown): v is string =>
  typeof v === "string" &&
  v.trim().length > 0 &&
  v.length <= 1800 &&
  !/\b(?:OpenAI|AI|IA)\b/i.test(v);

// Comprueba que haya como máximo ocho textos válidos.
export const texts = (v: unknown): v is string[] =>
  Array.isArray(v) && v.length <= 8 && v.every(boundedText);

// Envía la petición a OpenAI y devuelve el resultado JSON.
export const call = async (
  name: string,
  schema: unknown,
  instructions: string,
  data: unknown,
  signal?: AbortSignal,
): Promise<unknown> =>
  JSON.parse(
    await requestOpenAI(
      {
        text: { format: format(name, schema) },
        instructions,
        input: JSON.stringify(data),
      },
      signal,
    ),
  );
