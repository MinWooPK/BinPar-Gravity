import "server-only";

import { requestOpenAI } from "@/features/ai/infrastructure/openaiResponse";

// Construye un objeto para los esquemas JSON de OpenAI.
export const obj = (properties: Record<string, unknown>) => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

// Tipos reutilizables para los esquemas JSON.
export const str = { type: "string" };

export const array = (items: unknown) => ({
  type: "array",
  items,
});

// Configura el formato de respuesta estructurada.
const format = (name: string, schema: unknown) => ({
  type: "json_schema",
  name,
  strict: true,
  schema,
});

// Valida la longitud y el contenido del texto.
export const boundedText = (v: unknown): v is string =>
  typeof v === "string" &&
  v.trim().length > 0 &&
  v.length <= 1800 &&
  !/\b(?:OpenAI|AI|IA)\b/i.test(v);

// Valida un máximo de ocho textos.
export const texts = (v: unknown): v is string[] =>
  Array.isArray(v) && v.length <= 8 && v.every(boundedText);

// Envía una petición a OpenAI y convierte el JSON recibido.
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
