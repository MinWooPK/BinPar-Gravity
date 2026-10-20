"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useLocale, useTranslations } from "next-intl";

import {
  TUTOR_MAX_MESSAGE_LENGTH,
  TUTOR_TIMEOUT_MS,
} from "../../application/tutor";

import { requestHistory } from "../../application/conversation";
import { parseTutorReply } from "../../application/tutorResponse";
import { decideTutorProposal } from "../../application/tutorProposal";
import type { TutorProposal } from "../../types/proposal.types";
import type { TutorRequest } from "../../types/tutor.types";
import type { ChatMessage, TutorSession } from "../../types/conversation.types";

import {
  tutorContextId,
  type TutorSessionId,
} from "../../application/tutorAvailability";

import {
  restoreTutorHistory,
  serializeTutorHistory,
  TUTOR_HISTORY_KEY,
} from "../../application/tutorHistory";

import { useTutorEnvironment } from "../providers/tutorEnvironment";

// Crea una sesión de conversación vacía con sus valores iniciales.
const emptySession = (): TutorSession => ({
  messages: [],
  draft: "",
  pending: false,
  error: "",
});

// Gestiona las conversaciones del Tutor IA, su historial,
// las peticiones a la API y las propuestas de modificación.
const useConversationStore = () => {
  // Obtiene el idioma actual de la aplicación.
  const locale = useLocale() as TutorRequest["locale"];

  // Obtiene las traducciones del Tutor IA.
  const t = useTranslations("Tutor");

  // Obtiene la sesión y el contexto actual de la aplicación.
  const { sessionKey, current } = useTutorEnvironment();

  // Almacena el estado de las sesiones de conversación.
  const [sessions, setSessions] = useState<Record<string, TutorSession>>({});

  // Mantiene una referencia actualizada de las sesiones.
  const sessionsRef = useRef(sessions);

  // Registra las sesiones que tienen una petición en curso.
  const inFlight = useRef(new Set<string>());

  // Almacena los controladores para cancelar peticiones HTTP.
  const controllers = useRef(new Set<AbortController>());

  // Genera identificadores consecutivos para los mensajes.
  const sequence = useRef(0);

  // Indica si el componente continúa montado.
  const mounted = useRef(true);

  // Indica si el historial guardado ya se ha restaurado.
  const restored = useRef(false);

  // Identifica la generación actual para ignorar respuestas antiguas.
  const generation = useRef(0);

  // Recuerda la última petición para evitar envíos duplicados.
  const lastLaunch = useRef({ signature: "", at: 0 });

  // Actualiza una sesión y guarda su historial en localStorage
  // cuando se modifican los mensajes.
  const update = (target: string, patch: Partial<TutorSession>) => {
    // Construye el nuevo estado conservando las demás sesiones.
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
        /* Private mode/quota: keep the in-memory conversation. */
      }
    }
  };

  // Recupera el historial del Tutor IA al montar el componente
  // y cancela las peticiones pendientes al desmontarlo.
  useEffect(() => {
    mounted.current = true;

    if (!restored.current) {
      restored.current = true;

      // Almacena los mensajes recuperados del navegador.
      let messages: ChatMessage[] = [];

      try {
        messages = restoreTutorHistory(localStorage.getItem(TUTOR_HISTORY_KEY));
      } catch {
        /* Storage may be unavailable. */
      }

      sequence.current = Math.max(0, ...messages.map((message) => message.id));

      // Reconstruye la sesión global con los mensajes guardados.
      const next = { global: { ...emptySession(), messages } };

      sessionsRef.current = next;
      setSessions(next);
    }

    // Obtiene los controladores activos para cancelarlos al desmontar.
    const activeControllers = controllers.current;

    return () => {
      mounted.current = false;
      activeControllers.forEach((controller) => controller.abort());
    };
  }, []);

  // Envía una petición al Tutor IA, procesa la respuesta
  // y registra las explicaciones o propuestas recibidas.
  const performRequest = async (target: string, request: TutorRequest) => {
    // Obtiene el contexto actual de la aplicación.
    const environment = current();

    if (!environment || inFlight.current.has(target)) return;

    // Recuerda la generación para descartar respuestas obsoletas.
    const requestGeneration = generation.current;

    // Conserva las funciones de modificación únicamente
    // cuando el contexto coincide con el de la petición.
    const source =
      environment &&
      JSON.stringify(environment.context) === JSON.stringify(request.context)
        ? environment
        : undefined;

    inFlight.current.add(target);

    update(target, {
      pending: true,
      error: "",
      request,
      snapshot: JSON.stringify(request.context),
    });

    // Crea un controlador para cancelar la petición.
    const controller = new AbortController();

    controllers.current.add(controller);

    // Establece un tiempo máximo de espera para la respuesta.
    const timeout = window.setTimeout(
      () => controller.abort(),
      TUTOR_TIMEOUT_MS + 5000,
    );

    try {
      // Envía la petición al endpoint de IA de la aplicación.
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      // Convierte la respuesta HTTP en datos de JavaScript.
      const data: unknown = await response.json();

      if (!mounted.current || requestGeneration !== generation.current) return;

      if (!response.ok) {
        // Comprueba si el error se debe a una API de IA no configurada.
        const notConfigured =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          data.error === "not_configured";

        update(target, {
          error: notConfigured
            ? "notConfigured"
            : response.status === 429
              ? "rateLimited"
              : "error",
        });
      } else {
        // Valida la respuesta y las posibles propuestas del Tutor IA.
        const reply = parseTutorReply(data, request.context, request.intent);

        // Recupera el estado de la conversación antes de añadir la respuesta.
        const previous = sessionsRef.current[target] ?? emptySession();

        // Almacena una propuesta cuando la respuesta contiene una acción válida.
        let proposal: TutorProposal | undefined;

        // Define los datos comunes de una propuesta pendiente.
        const common = {
          contextSnapshot: JSON.stringify(request.context),
          status: "pending" as const,
        };

        if (
          reply.proposal?.action === "set_gravity_parameters" &&
          source?.gravity &&
          request.context.kind === "gravity"
        )
          proposal = {
            ...common,
            kind: "gravity",
            action: reply.proposal,
            source: source.gravity,
            baseline: { ...request.context.parameters },
          };

        if (
          reply.proposal?.action === "set_three_body_parameters" &&
          source?.threeBody &&
          request.context.kind === "three-body" &&
          request.context.draftConfiguration
        )
          proposal = {
            ...common,
            kind: "three-body",
            action: reply.proposal,
            source: source.threeBody,
            baseline: request.context.draftConfiguration,
          };

        // Construye el mensaje del asistente con su explicación
        // y la propuesta de modificación cuando corresponda.
        const message: ChatMessage = {
          id: ++sequence.current,
          contextId: tutorContextId(request.context),
          role: "assistant",
          content: reply.proposalRejected
            ? t(
                request.context.kind === "three-body"
                  ? "proposalRejectedThreeBody"
                  : "proposalRejected",
              )
            : reply.text,
          ...(proposal && { proposal }),
        };

        update(target, {
          messages: [...previous.messages, message].slice(-30),
        });
      }
    } catch {
      if (mounted.current && requestGeneration === generation.current)
        update(target, { error: "error" });
    } finally {
      window.clearTimeout(timeout);
      controllers.current.delete(controller);

      if (requestGeneration === generation.current) {
        inFlight.current.delete(target);

        if (mounted.current) update(target, { pending: false });
      }
    }
  };

  // Procesa una pregunta del usuario, prepara el historial
  // y solicita una nueva respuesta al Tutor IA.
  const ask = (
    key: TutorSessionId,
    mode: TutorRequest["mode"],
    question: string,
    intent?: TutorRequest["intent"],
  ) => {
    // Elimina los espacios innecesarios de la pregunta.
    const content = question.trim();

    if (
      !sessionKey ||
      !content ||
      content.length > TUTOR_MAX_MESSAGE_LENGTH ||
      inFlight.current.has(key)
    )
      return;

    // Obtiene el contexto actual del Tutor IA.
    const page = current();

    if (!page) {
      update(key, { error: "contextUnavailable" });
      return;
    }

    if (intent && intent !== "explain_context") {
      // Identifica la etapa permitida para la acción educativa.
      const stage =
        intent === "explain_formula"
          ? "gravity-understanding"
          : "gravity-laboratory";

      if (page.context.kind !== "gravity" || page.context.stage !== stage)
        return;
    }

    // Genera una firma para identificar preguntas repetidas.
    const signature = JSON.stringify([mode, content, page.context]);

    // Obtiene el instante en que se realiza la petición.
    const now = Date.now();

    if (
      lastLaunch.current.signature === signature &&
      now - lastLaunch.current.at < 750
    )
      return;

    lastLaunch.current = { signature, at: now };

    // Recupera los mensajes anteriores de la conversación.
    const previous = sessionsRef.current[key] ?? emptySession();

    // Añade la pregunta del usuario al historial reciente.
    const messages: ChatMessage[] = [
      ...previous.messages,
      {
        id: ++sequence.current,
        contextId: tutorContextId(page.context),
        role: "user" as const,
        content,
      },
    ].slice(-30);

    update(key, { messages, draft: "" });

    void performRequest(key, {
      locale,
      mode,
      ...(intent && { intent }),
      context: page.context,
      messages: requestHistory(messages),
    });
  };

  // Gestiona la aceptación o cancelación de una propuesta
  // y actualiza su estado dentro del historial de conversación.
  const decideProposal = (
    key: TutorSessionId,
    messageId: number,
    decision: "apply" | "cancel",
  ) => {
    // Obtiene la sesión en la que se encuentra la propuesta.
    const previous = sessionsRef.current[key];

    // Busca el mensaje que contiene la propuesta seleccionada.
    const message = previous?.messages.find(
      (message) => message.id === messageId,
    );

    if (!message?.proposal || message.proposal.status !== "pending")
      return false;

    // Valida y procesa la decisión del usuario sobre la propuesta.
    const proposal = decideTutorProposal(message.proposal, decision, current());

    update(key, {
      messages: previous.messages.map((item) =>
        item.id === messageId ? { ...item, proposal } : item,
      ),
    });

    return proposal.status === "applied";
  };

  // Borra la conversación global, cancela las peticiones
  // pendientes y elimina el historial guardado.
  const clear = () => {
    generation.current++;
    controllers.current.forEach((controller) => controller.abort());
    inFlight.current.clear();
    lastLaunch.current = { signature: "", at: 0 };

    update("global", emptySession());

    try {
      localStorage.removeItem(TUTOR_HISTORY_KEY);
    } catch {
      /* Storage may be unavailable. */
    }
  };

  return { sessions, update, performRequest, ask, decideProposal, clear };
};

// Crea el contexto para compartir el estado de la conversación global.
const ConversationContext = createContext<ReturnType<
  typeof useConversationStore
> | null>(null);

// Comparte una única conversación del Tutor IA
// entre las diferentes páginas y etapas de la aplicación.
export const TutorConversationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  // Obtiene el estado y las funciones del gestor de conversaciones.
  const store = useConversationStore();

  return createElement(
    ConversationContext.Provider,
    { value: store },
    children,
  );
};

// Permite acceder a la conversación global, enviar preguntas,
// borrar el historial y gestionar las propuestas del Tutor IA.
export const useTutorConversation = (sessionId?: TutorSessionId) => {
  // Obtiene el estado compartido de las conversaciones.
  const store = useContext(ConversationContext);

  // Obtiene el identificador de sesión y el contexto actual.
  const { sessionKey, current, activeSessionId } = useTutorEnvironment();

  if (!store)
    throw new Error("Conversations require TutorConversationProvider");

  // Identifica la sesión que debe utilizar el componente.
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
