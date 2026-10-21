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

// Guarda la conversación compartida.
const ContextoConversacion = createContext<ReturnType<
  typeof useConversationStore
> | null>(null);

// Comparte la conversación entre los componentes.
export const TutorConversationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const conversacion = useConversationStore();

  return createElement(
    ContextoConversacion.Provider,
    { value: conversacion },
    children,
  );
};

// Permite acceder a los mensajes y funciones del Tutor IA.
export const useTutorConversation = (idSesion?: TutorSessionId) => {
  const conversacion = useContext(ContextoConversacion);

  const { sessionKey, current, activeSessionId } = useTutorEnvironment();

  if (!conversacion) {
    throw new Error("Conversations require TutorConversationProvider");
  }

  const clave = idSesion ?? activeSessionId;

  return {
    sessionKey,
    current,
    key: clave,
    session: conversacion.sessions[clave] ?? emptySession(),
    update: conversacion.update,
    clear: conversacion.clear,
    performRequest: conversacion.performRequest,

    // Envía preguntas al Tutor IA.
    ask: (
      modo: TutorRequest["mode"],
      pregunta: string,
      intencion?: TutorRequest["intent"],
    ) => conversacion.ask(clave, modo, pregunta, intencion),

    // Acepta o cancela cambios propuestos.
    decideProposal: (idMensaje: number, decision: "apply" | "cancel") =>
      conversacion.decideProposal(clave, idMensaje, decision),
  };
};
