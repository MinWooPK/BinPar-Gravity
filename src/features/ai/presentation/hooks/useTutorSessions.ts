"use client";

import { useEffect, useRef, useState } from "react";

import {
  restoreTutorHistory,
  serializeTutorHistory,
  TUTOR_HISTORY_KEY,
} from "@/features/ai/application/tutorHistory";

import type {
  ChatMessage,
  TutorSession,
} from "@/features/ai/types/conversation.types";

// Crea una conversación vacía.
export const emptySession = (): TutorSession => ({
  messages: [],
  draft: "",
  pending: false,
  error: "",
});

// Gestiona las conversaciones y su historial.
export const useTutorSessions = () => {
  const [sessions, setSessions] = useState<Record<string, TutorSession>>({});

  const sessionsRef = useRef(sessions);
  const sequence = useRef(0);
  const restored = useRef(false);

  // Genera el ID de cada mensaje.
  const nextMessageId = () => ++sequence.current;

  // Actualiza la conversación y guarda los mensajes.
  const update = (target: string, patch: Partial<TutorSession>) => {
    const next = {
      ...sessionsRef.current,
      [target]: {
        ...(sessionsRef.current[target] ?? emptySession()),
        ...patch,
      },
    };

    sessionsRef.current = next;
    setSessions(next);

    if (restored.current && patch.messages) {
      try {
        localStorage.setItem(
          TUTOR_HISTORY_KEY,
          serializeTutorHistory(next[target].messages),
        );
      } catch {
        // Si falla, conserva los mensajes en memoria.
      }
    }
  };

  // Recupera los mensajes guardados.
  useEffect(() => {
    if (restored.current) return;

    restored.current = true;

    let messages: ChatMessage[] = [];

    try {
      messages = restoreTutorHistory(localStorage.getItem(TUTOR_HISTORY_KEY));
    } catch {
      // Continúa con una conversación vacía.
    }

    sequence.current = Math.max(0, ...messages.map((message) => message.id));

    const next = {
      global: {
        ...emptySession(),
        messages,
      },
    };

    sessionsRef.current = next;
    setSessions(next);
  }, []);

  return {
    sessions,
    sessionsRef,
    nextMessageId,
    update,
  };
};
