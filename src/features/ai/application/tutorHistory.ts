import type { ChatMessage } from "../types/conversation.types";

// Define la clave utilizada para guardar el historial del Tutor IA.
export const TUTOR_HISTORY_KEY = "gravity-lab:tutor:v1";

// Establece el número máximo de mensajes que se conservan.
export const TUTOR_HISTORY_LIMIT = 30;

// Define la longitud máxima permitida para cada mensaje almacenado.
const MAX_STORED_LENGTH = 4000;

// Recupera el historial guardado, validando los mensajes
// y descartando datos incorrectos o no permitidos.
export function restoreTutorHistory(raw: string | null): ChatMessage[] {
  if (!raw || raw.length > 150_000) return [];

  try {
    // Convierte el historial almacenado de JSON a un valor de JavaScript.
    const data: unknown = JSON.parse(raw);

    if (
      !data ||
      typeof data !== "object" ||
      !("version" in data) ||
      data.version !== 1 ||
      !("messages" in data) ||
      !Array.isArray(data.messages)
    )
      return [];

    return data.messages
      .slice(-TUTOR_HISTORY_LIMIT)
      .flatMap((item: unknown, index) => {
        if (
          !item ||
          typeof item !== "object" ||
          !("role" in item) ||
          !("content" in item) ||
          (item.role !== "user" && item.role !== "assistant") ||
          typeof item.content !== "string" ||
          !item.content.trim() ||
          item.content.length > MAX_STORED_LENGTH
        )
          return [];

        // Recupera el identificador de contexto si cumple el formato permitido.
        const contextId =
          "contextId" in item &&
          typeof item.contextId === "string" &&
          /^(home|gravity|three-body):[a-z-]+(?::[a-z0-9-]+)?$/.test(
            item.contextId,
          ) &&
          item.contextId.length <= 100
            ? item.contextId
            : undefined;

        return [
          {
            id: index + 1,
            role: item.role,
            content: item.content,
            ...(contextId && { contextId }),
          },
        ];
      });
  } catch {
    return [];
  }
}

// Convierte los mensajes del Tutor IA en un JSON
// que puede guardarse en el almacenamiento del navegador.
export function serializeTutorHistory(
  messages: readonly ChatMessage[],
): string {
  return JSON.stringify({
    version: 1,
    messages: messages
      .slice(-TUTOR_HISTORY_LIMIT)
      .map(({ role, content, contextId }) => ({
        role,
        content: content.slice(0, MAX_STORED_LENGTH),
        ...(contextId && { contextId }),
      })),
  });
}
