"use client";

import { useLocale } from "next-intl";

import { TUTOR_MAX_MESSAGE_LENGTH } from "@/features/ai/application/tutor";
import { requestHistory } from "@/features/ai/application/conversation";
import { decideTutorProposal } from "@/features/ai/application/tutorProposal";

import {
  tutorContextId,
  type TutorSessionId,
} from "@/features/ai/application/tutorAvailability";

import { TUTOR_HISTORY_KEY } from "@/features/ai/application/tutorHistory";

import type { TutorRequest } from "@/features/ai/types/tutor.types";
import type { ChatMessage } from "@/features/ai/types/conversation.types";

import { useTutorEnvironment } from "@/features/ai/presentation/providers/tutorEnvironment";

import { emptySession, useTutorSessions } from "./useTutorSessions";
import { useTutorRequests } from "./useTutorRequests";

// Controla las conversaciones del Tutor IA.
export const useConversationStore = () => {
  const idioma = useLocale() as TutorRequest["locale"];

  const { sessionKey, current } = useTutorEnvironment();

  const { sessions, sessionsRef, nextMessageId, update } = useTutorSessions();

  const { performRequest, isInFlight, isDuplicateLaunch, cancelRequests } =
    useTutorRequests({
      sessionsRef,
      nextMessageId,
      update,
    });

  // Envía una pregunta al Tutor IA.
  const ask = (
    clave: TutorSessionId,
    modo: TutorRequest["mode"],
    pregunta: string,
    intencion?: TutorRequest["intent"],
  ) => {
    const contenido = pregunta.trim();

    // Comprueba que la pregunta sea válida.
    if (
      !sessionKey ||
      !contenido ||
      contenido.length > TUTOR_MAX_MESSAGE_LENGTH ||
      isInFlight(clave)
    ) {
      return;
    }

    const pagina = current();

    if (!pagina) {
      update(clave, { error: "contextUnavailable" });
      return;
    }

    // Comprueba que la pregunta corresponda a la etapa.
    if (intencion && intencion !== "explain_context") {
      const etapa =
        intencion === "explain_formula"
          ? "gravity-understanding"
          : "gravity-laboratory";

      if (pagina.context.kind !== "gravity" || pagina.context.stage !== etapa) {
        return;
      }
    }

    // Evita enviar la misma pregunta dos veces.
    const firma = JSON.stringify([modo, contenido, pagina.context]);

    if (isDuplicateLaunch(firma)) return;

    const anterior = sessionsRef.current[clave] ?? emptySession();

    // Guarda la pregunta en el historial.
    const mensajes: ChatMessage[] = [
      ...anterior.messages,
      {
        id: nextMessageId(),
        contextId: tutorContextId(pagina.context),
        role: "user" as const,
        content: contenido,
      },
    ].slice(-30);

    update(clave, {
      messages: mensajes,
      draft: "",
    });

    // Envía la petición a la IA.
    void performRequest(clave, {
      locale: idioma,
      mode: modo,
      ...(intencion && { intent: intencion }),
      context: pagina.context,
      messages: requestHistory(mensajes),
    });
  };

  // Acepta o rechaza los cambios propuestos por la IA.
  const decideProposal = (
    clave: TutorSessionId,
    idMensaje: number,
    decision: "apply" | "cancel",
  ) => {
    const anterior = sessionsRef.current[clave];

    const mensaje = anterior?.messages.find(
      (elemento) => elemento.id === idMensaje,
    );

    if (!mensaje?.proposal || mensaje.proposal.status !== "pending") {
      return false;
    }

    const propuesta = decideTutorProposal(
      mensaje.proposal,
      decision,
      current(),
    );

    update(clave, {
      messages: anterior.messages.map((elemento) =>
        elemento.id === idMensaje
          ? { ...elemento, proposal: propuesta }
          : elemento,
      ),
    });

    return propuesta.status === "applied";
  };

  // Borra la conversación y cancela las peticiones.
  const clear = () => {
    cancelRequests();

    update("global", emptySession());

    try {
      localStorage.removeItem(TUTOR_HISTORY_KEY);
    } catch {
      // El almacenamiento puede no estar disponible.
    }
  };

  return {
    sessions,
    update,
    performRequest,
    ask,
    decideProposal,
    clear,
  };
};
