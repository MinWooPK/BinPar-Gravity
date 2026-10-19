"use client";

import { createContext, createElement, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { TUTOR_MAX_MESSAGE_LENGTH, TUTOR_TIMEOUT_MS } from "../../application/tutor";
import { requestHistory } from "../../application/conversation";
import { parseTutorReply } from "../../application/tutorResponse";
import { decideTutorProposal } from "../../application/tutorProposal";
import type { TutorRequest } from "../../types/tutor.types";
import type { ChatMessage, TutorSession } from "../../types/conversation.types";
import { getTutorConversationKey, type TutorSessionId } from "../../application/tutorAvailability";
import { useTutorEnvironment } from "../providers/tutorEnvironment";

const emptySession = (): TutorSession => ({ messages: [], draft: "", pending: false, error: "" });

const useConversationStore = () => {
  const locale = useLocale() as TutorRequest["locale"];
  const t = useTranslations("Tutor");
  const { sessionKey, current } = useTutorEnvironment();
  const [sessions, setSessions] = useState<Record<string, TutorSession>>({});
  const sessionsRef = useRef(sessions);
  const inFlight = useRef(new Set<string>());
  const controllers = useRef(new Set<AbortController>());
  const sequence = useRef(0);
  const mounted = useRef(true);

  const update = (target: string, patch: Partial<TutorSession>) => {
    const next = { ...sessionsRef.current, [target]: { ...(sessionsRef.current[target] ?? emptySession()), ...patch } };
    sessionsRef.current = next;
    setSessions(next);
  };

  useEffect(() => {
    mounted.current = true;
    const activeControllers = controllers.current;
    return () => {
      mounted.current = false;
      activeControllers.forEach((controller) => controller.abort());
    };
  }, []);

  const performRequest = async (target: string, request: TutorRequest) => {
    const environment = current();
    if (!sessionKey || !environment || getTutorConversationKey(environment.context) !== target ||
      getTutorConversationKey(request.context) !== target || inFlight.current.has(target)) return;
    const source = environment && JSON.stringify(environment.context) === JSON.stringify(request.context) ? environment.gravity : undefined;
    inFlight.current.add(target);
    update(target, { pending: true, error: "", request, snapshot: JSON.stringify(request.context) });
    const controller = new AbortController();
    controllers.current.add(controller);
    const timeout = window.setTimeout(() => controller.abort(), TUTOR_TIMEOUT_MS + 5000);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: controller.signal,
      });
      const data: unknown = await response.json();
      if (!mounted.current) return;
      if (!response.ok) {
        const notConfigured = typeof data === "object" && data !== null && "error" in data && data.error === "not_configured";
        update(target, { error: notConfigured ? "notConfigured" : response.status === 429 ? "rateLimited" : "error" });
      } else {
        const reply = parseTutorReply(data, request.context, request.intent);
        const previous = sessionsRef.current[target] ?? emptySession();
        const message: ChatMessage = {
          id: ++sequence.current, role: "assistant", content: reply.proposalRejected ? t("proposalRejected") : reply.text,
          ...(reply.proposal && source && request.context.kind === "gravity" && {
            proposal: { action: reply.proposal, source, baseline: { ...request.context.parameters }, contextSnapshot: JSON.stringify(request.context), status: "pending" },
          }),
        };
        update(target, { messages: [...previous.messages, message].slice(-48) });
      }
    } catch {
      if (mounted.current) update(target, { error: "error" });
    } finally {
      window.clearTimeout(timeout);
      controllers.current.delete(controller);
      inFlight.current.delete(target);
      if (mounted.current) update(target, { pending: false });
    }
  };

  const ask = (key: TutorSessionId, mode: TutorRequest["mode"], question: string, intent?: TutorRequest["intent"]) => {
    const content = question.trim();
    if (!sessionKey || !content || content.length > TUTOR_MAX_MESSAGE_LENGTH || inFlight.current.has(key)) return;
    const page = current();
    if (!page || getTutorConversationKey(page.context) !== key) { update(key, { error: "contextUnavailable" }); return; }
    if (intent) {
      const stage = intent === "explain_formula" ? "gravity-understanding" : "gravity-laboratory";
      if (page.context.kind !== "gravity" || page.context.stage !== stage) return;
    }
    const previous = sessionsRef.current[key] ?? emptySession();
    const messages: ChatMessage[] = [...previous.messages, { id: ++sequence.current, role: "user" as const, content }].slice(-48);
    update(key, { messages, draft: "" });
    void performRequest(key, { locale, mode, ...(intent && { intent }), context: page.context, messages: requestHistory(messages) });
  };

  const decideProposal = (key: TutorSessionId, messageId: number, decision: "apply" | "cancel") => {
    const previous = sessionsRef.current[key];
    const message = previous?.messages.find(message => message.id === messageId);
    if (!message?.proposal || message.proposal.status !== "pending") return;
    const proposal = decideTutorProposal(message.proposal, decision, current());
    update(key, { messages: previous.messages.map(item => item.id === messageId ? { ...item, proposal } : item) });
  };

  return { sessions, update, performRequest, ask, decideProposal };
};

const ConversationContext = createContext<ReturnType<typeof useConversationStore> | null>(null);

/** One store per Gravity visit, shared by modal and inline views. */
export const TutorConversationProvider = ({ children }: { children: ReactNode }) => {
  const store = useConversationStore();
  return createElement(ConversationContext.Provider, { value: store }, children);
};

export const useTutorConversation = (sessionId?: TutorSessionId) => {
  const store = useContext(ConversationContext);
  const { sessionKey, current, activeSessionId } = useTutorEnvironment();
  if (!store) throw new Error("Conversations require TutorConversationProvider");
  const key = sessionId ?? activeSessionId;
  return {
    sessionKey, current, key,
    session: store.sessions[key] ?? emptySession(),
    update: store.update,
    performRequest: store.performRequest,
    ask: (mode: TutorRequest["mode"], question: string, intent?: TutorRequest["intent"]) => store.ask(key, mode, question, intent),
    decideProposal: (messageId: number, decision: "apply" | "cancel") => store.decideProposal(key, messageId, decision),
  };
};
