"use client";

import {
  createContext,
  createElement,
  useContext,
  type ReactNode,
} from "react";

import type { TutorRequest } from "@/features/ai/types/tutor.types";
import type { TutorSessionId } from "@/features/ai/application/tutorAvailability";

import { useTutorEnvironment } from "@/features/ai/presentation/providers/tutorEnvironment";

import { emptySession } from "./useTutorSessions";
import { useConversationStore } from "./useConversatinStore";

// Crea el contexto compartido de la conversación.
const ConversationContext = createContext<ReturnType<
  typeof useConversationStore
> | null>(null);

// Comparte una conversación entre las páginas de Gravity Lab.
export const TutorConversationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const store = useConversationStore();

  return createElement(
    ConversationContext.Provider,
    { value: store },
    children,
  );
};

// Permite consultar la sesión y utilizar las funciones del Tutor IA.
export const useTutorConversation = (sessionId?: TutorSessionId) => {
  const store = useContext(ConversationContext);

  const { sessionKey, current, activeSessionId } = useTutorEnvironment();

  if (!store) {
    throw new Error("Conversations require TutorConversationProvider");
  }

  const key = sessionId ?? activeSessionId;

  return {
    sessionKey,
    current,
    key,
    session: store.sessions[key] ?? emptySession(),
    update: store.update,
    clear: store.clear,
    performRequest: store.performRequest,

    ask: (
      mode: TutorRequest["mode"],
      question: string,
      intent?: TutorRequest["intent"],
    ) => store.ask(key, mode, question, intent),

    decideProposal: (messageId: number, decision: "apply" | "cancel") =>
      store.decideProposal(key, messageId, decision),
  };
};
