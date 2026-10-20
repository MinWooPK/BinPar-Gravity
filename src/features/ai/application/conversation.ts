import {
  TUTOR_MAX_MESSAGES,
  TUTOR_MAX_MESSAGE_LENGTH,
  TUTOR_MAX_TOTAL_MESSAGE_LENGTH,
} from "./tutor";

import type { TutorMessage } from "../types/tutor.types";

// Prepara el historial reciente del Tutor IA respetando
// los límites de mensajes y caracteres permitidos.
export const requestHistory = (
  messages: readonly (TutorMessage & { contextId?: string })[],
): TutorMessage[] => {
  // Almacena los mensajes seleccionados para enviar al modelo.
  const selected: TutorMessage[] = [];

  // Controla el número total de caracteres acumulados.
  let characters = 0;

  for (
    let index = messages.length - 1;
    index >= 0 && selected.length < TUTOR_MAX_MESSAGES;
    index--
  ) {
    // Obtiene el mensaje que se está procesando.
    const message = messages[index];

    // Identifica los mensajes históricos de otras secciones
    // para diferenciarlos del contexto actual del simulador.
    const origin =
      index < messages.length - 1 && message.contextId
        ? `[Historical dialogue in ${message.contextId}; not current simulator data] `
        : "";

    // Prepara el contenido del mensaje respetando su longitud máxima.
    const content = (origin + message.content).slice(
      0,
      TUTOR_MAX_MESSAGE_LENGTH,
    );

    if (characters + content.length > TUTOR_MAX_TOTAL_MESSAGE_LENGTH) break;

    selected.unshift({ role: message.role, content });

    characters += content.length;
  }

  // Elimina los mensajes iniciales del asistente para que
  // el historial enviado al modelo comience con un mensaje del usuario.
  while (selected[0]?.role === "assistant") selected.shift();

  return selected;
};
