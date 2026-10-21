import {
  TUTOR_MAX_MESSAGES,
  TUTOR_MAX_MESSAGE_LENGTH,
  TUTOR_MAX_TOTAL_MESSAGE_LENGTH,
} from "./tutor";

import type { TutorMessage } from "../types/tutor.types";

// Prepara los últimos mensajes para enviarlos a la IA.
export const requestHistory = (
  mensajes: readonly (TutorMessage & { contextId?: string })[],
): TutorMessage[] => {
  const seleccionados: TutorMessage[] = [];
  let caracteres = 0;

  // Recorre los mensajes desde el más reciente.
  for (
    let indice = mensajes.length - 1;
    indice >= 0 && seleccionados.length < TUTOR_MAX_MESSAGES;
    indice--
  ) {
    const mensaje = mensajes[indice];

    // Indica si el mensaje pertenece a otra sección.
    const origen =
      indice < mensajes.length - 1 && mensaje.contextId
        ? `[Conversación anterior en ${mensaje.contextId}; no son datos actuales del simulador] `
        : "";

    // Limita la longitud de cada mensaje.
    const contenido = (origen + mensaje.content).slice(
      0,
      TUTOR_MAX_MESSAGE_LENGTH,
    );

    // Evita superar el límite total de caracteres.
    if (caracteres + contenido.length > TUTOR_MAX_TOTAL_MESSAGE_LENGTH) break;

    seleccionados.unshift({ role: mensaje.role, content: contenido });
    caracteres += contenido.length;
  }

  // El historial debe comenzar con un mensaje del usuario.
  while (seleccionados[0]?.role === "assistant") seleccionados.shift();

  return seleccionados;
};
