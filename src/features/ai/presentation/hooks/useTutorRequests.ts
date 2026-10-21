"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import { TUTOR_TIMEOUT_MS } from "@/features/ai/application/tutor";
import { parseTutorReply } from "@/features/ai/application/tutorResponse";
import { tutorContextId } from "@/features/ai/application/tutorAvailability";

import type { TutorRequest } from "@/features/ai/types/tutor.types";
import type { TutorProposal } from "@/features/ai/types/proposal.types";
import type { ChatMessage } from "@/features/ai/types/conversation.types";

import { useTutorEnvironment } from "@/features/ai/presentation/providers/tutorEnvironment";

import { emptySession, type useTutorSessions } from "./useTutorSessions";

type TutorSessionsStore = Pick<
  ReturnType<typeof useTutorSessions>,
  "sessionsRef" | "nextMessageId" | "update"
>;

// Gestiona las peticiones a OpenAI y sus cancelaciones.
export const useTutorRequests = ({
  sessionsRef,
  nextMessageId,
  update,
}: TutorSessionsStore) => {
  const t = useTranslations("Tutor");
  const { current } = useTutorEnvironment();

  const inFlight = useRef(new Set<string>());
  const controllers = useRef(new Set<AbortController>());

  const mounted = useRef(true);
  const generation = useRef(0);

  const lastLaunch = useRef({
    signature: "",
    at: 0,
  });

  // Cancela las peticiones activas al desmontar el provider.
  useEffect(() => {
    mounted.current = true;

    const activeControllers = controllers.current;

    return () => {
      mounted.current = false;

      activeControllers.forEach((controller) => controller.abort());
    };
  }, []);

  // Envía la petición y registra la respuesta del Tutor IA.
  const performRequest = async (target: string, request: TutorRequest) => {
    const environment = current();

    if (!environment || inFlight.current.has(target)) return;

    const requestGeneration = generation.current;

    // Comprueba que la propuesta corresponda al contexto actual.
    const source =
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

    const controller = new AbortController();

    controllers.current.add(controller);

    // Establece el tiempo máximo de espera.
    const timeout = window.setTimeout(
      () => controller.abort(),
      TUTOR_TIMEOUT_MS + 5000,
    );

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      const data: unknown = await response.json();

      // Ignora respuestas de solicitudes canceladas o antiguas.
      if (!mounted.current || requestGeneration !== generation.current) {
        return;
      }

      if (!response.ok) {
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
        // Valida la respuesta generada por OpenAI.
        const reply = parseTutorReply(data, request.context, request.intent);

        const previous = sessionsRef.current[target] ?? emptySession();

        let proposal: TutorProposal | undefined;

        const common = {
          contextSnapshot: JSON.stringify(request.context),
          status: "pending" as const,
        };

        // Prepara una propuesta sin aplicarla automáticamente.
        if (
          reply.proposal?.action === "set_gravity_parameters" &&
          source?.gravity &&
          request.context.kind === "gravity"
        ) {
          proposal = {
            ...common,
            kind: "gravity",
            action: reply.proposal,
            source: source.gravity,
            baseline: { ...request.context.parameters },
          };
        }

        const message: ChatMessage = {
          id: nextMessageId(),
          contextId: tutorContextId(request.context),
          role: "assistant",
          content: reply.proposalRejected ? t("proposalRejected") : reply.text,
          ...(proposal && { proposal }),
        };

        update(target, {
          messages: [...previous.messages, message].slice(-30),
        });
      }
    } catch {
      if (mounted.current && requestGeneration === generation.current) {
        update(target, { error: "error" });
      }
    } finally {
      window.clearTimeout(timeout);
      controllers.current.delete(controller);

      if (requestGeneration === generation.current) {
        inFlight.current.delete(target);

        if (mounted.current) {
          update(target, { pending: false });
        }
      }
    }
  };

  // Invalida las respuestas anteriores y cancela las peticiones.
  const cancelRequests = () => {
    generation.current++;

    controllers.current.forEach((controller) => controller.abort());

    inFlight.current.clear();

    lastLaunch.current = {
      signature: "",
      at: 0,
    };
  };

  // Comprueba si una sesión ya tiene una petición activa.
  const isInFlight = (key: string) => inFlight.current.has(key);

  // Evita repetir la misma pregunta en menos de 750 ms.
  const isDuplicateLaunch = (signature: string) => {
    const now = Date.now();

    if (
      lastLaunch.current.signature === signature &&
      now - lastLaunch.current.at < 750
    ) {
      return true;
    }

    lastLaunch.current = { signature, at: now };

    return false;
  };

  return {
    performRequest,
    isInFlight,
    isDuplicateLaunch,
    cancelRequests,
  };
};
