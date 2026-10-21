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

// Coordina las preguntas y el estado global de la conversación.
export const useConversationStore = () => {
  const locale = useLocale() as TutorRequest["locale"];

  const { sessionKey, current } = useTutorEnvironment();

  const { sessions, sessionsRef, nextMessageId, update } = useTutorSessions();

  const { performRequest, isInFlight, isDuplicateLaunch, cancelRequests } =
    useTutorRequests({
      sessionsRef,
      nextMessageId,
      update,
    });

  // Prepara una pregunta y la envía al Tutor IA.
  const ask = (
    key: TutorSessionId,
    mode: TutorRequest["mode"],
    question: string,
    intent?: TutorRequest["intent"],
  ) => {
    const content = question.trim();

    if (
      !sessionKey ||
      !content ||
      content.length > TUTOR_MAX_MESSAGE_LENGTH ||
      isInFlight(key)
    ) {
      return;
    }

    const page = current();

    if (!page) {
      update(key, { error: "contextUnavailable" });
      return;
    }

    // Comprueba que la intención corresponda a la etapa.
    if (intent && intent !== "explain_context") {
      const stage =
        intent === "explain_formula"
          ? "gravity-understanding"
          : "gravity-laboratory";

      if (page.context.kind !== "gravity" || page.context.stage !== stage) {
        return;
      }
    }

    // Evita el envío de preguntas duplicadas.
    const signature = JSON.stringify([mode, content, page.context]);

    if (isDuplicateLaunch(signature)) return;

    const previous = sessionsRef.current[key] ?? emptySession();

    // Añade la pregunta al historial reciente.
    // Añade la pregunta al historial reciente.
    const messages: ChatMessage[] = [
      ...previous.messages,
      {
        id: nextMessageId(),
        contextId: tutorContextId(page.context),
        role: "user" as const,
        content,
      },
    ].slice(-30);

    update(key, {
      messages,
      draft: "",
    });

    void performRequest(key, {
      locale,
      mode,
      ...(intent && { intent }),
      context: page.context,
      messages: requestHistory(messages),
    });
  };

  // Acepta o cancela una propuesta de parámetros.
  const decideProposal = (
    key: TutorSessionId,
    messageId: number,
    decision: "apply" | "cancel",
  ) => {
    const previous = sessionsRef.current[key];

    const message = previous?.messages.find(
      (message) => message.id === messageId,
    );

    if (!message?.proposal || message.proposal.status !== "pending") {
      return false;
    }

    const proposal = decideTutorProposal(message.proposal, decision, current());

    update(key, {
      messages: previous.messages.map((item) =>
        item.id === messageId ? { ...item, proposal } : item,
      ),
    });

    return proposal.status === "applied";
  };

  // Borra el historial y cancela las peticiones pendientes.
  const clear = () => {
    cancelRequests();

    update("global", emptySession());

    try {
      localStorage.removeItem(TUTOR_HISTORY_KEY);
    } catch {
      // La conversación ya se ha borrado de la memoria.
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
