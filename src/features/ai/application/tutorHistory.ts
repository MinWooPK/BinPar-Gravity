import type { ChatMessage } from "../types/conversation.types";

// Clave para guardar el historial.
export const TUTOR_HISTORY_KEY = "gravity-lab:tutor:v1";

// Máximo de mensajes guardados.
export const TUTOR_HISTORY_LIMIT = 30;

// Máximo de caracteres por mensaje.
const MAX_STORED_LENGTH = 4000;

// Recupera los mensajes guardados.
export function restoreTutorHistory(texto: string | null): ChatMessage[] {
  if (!texto || texto.length > 150_000) return [];

  try {
    const datos: unknown = JSON.parse(texto);

    // Comprueba que el historial sea válido.
    if (
      !datos ||
      typeof datos !== "object" ||
      !("version" in datos) ||
      datos.version !== 1 ||
      !("messages" in datos) ||
      !Array.isArray(datos.messages)
    )
      return [];

    return datos.messages
      .slice(-TUTOR_HISTORY_LIMIT)
      .flatMap((mensaje: unknown, indice) => {
        // Descarta mensajes incorrectos.
        if (
          !mensaje ||
          typeof mensaje !== "object" ||
          !("role" in mensaje) ||
          !("content" in mensaje) ||
          (mensaje.role !== "user" && mensaje.role !== "assistant") ||
          typeof mensaje.content !== "string" ||
          !mensaje.content.trim() ||
          mensaje.content.length > MAX_STORED_LENGTH
        )
          return [];

        // Comprueba de qué sección viene el mensaje.
        const contexto =
          "contextId" in mensaje &&
          typeof mensaje.contextId === "string" &&
          /^(home|gravity|three-body):[a-z-]+(?::[a-z0-9-]+)?$/.test(
            mensaje.contextId,
          ) &&
          mensaje.contextId.length <= 100
            ? mensaje.contextId
            : undefined;

        return [
          {
            id: indice + 1,
            role: mensaje.role,
            content: mensaje.content,
            ...(contexto && { contextId: contexto }),
          },
        ];
      });
  } catch {
    return [];
  }
}

// Convierte los mensajes a JSON para guardarlos.
export function serializeTutorHistory(
  mensajes: readonly ChatMessage[],
): string {
  return JSON.stringify({
    version: 1,
    messages: mensajes
      .slice(-TUTOR_HISTORY_LIMIT)
      .map(({ role, content, contextId }) => ({
        role,
        content: content.slice(0, MAX_STORED_LENGTH),
        ...(contextId && { contextId }),
      })),
  });
}
