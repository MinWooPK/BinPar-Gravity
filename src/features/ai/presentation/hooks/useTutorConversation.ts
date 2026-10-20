"use client";

import { createContext, createElement, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { TUTOR_MAX_MESSAGE_LENGTH, TUTOR_TIMEOUT_MS } from "../../application/tutor";
import { requestHistory } from "../../application/conversation";
import { parseTutorReply } from "../../application/tutorResponse";
import { decideTutorProposal } from "../../application/tutorProposal";
import type { TutorProposal } from "../../types/proposal.types";
import type { TutorRequest } from "../../types/tutor.types";
import type { ChatMessage, TutorSession } from "../../types/conversation.types";
import { tutorContextId, type TutorSessionId } from "../../application/tutorAvailability";
import { restoreTutorHistory, serializeTutorHistory, TUTOR_HISTORY_KEY } from "../../application/tutorHistory";
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
  const restored = useRef(false);
  const generation = useRef(0);
  const lastLaunch = useRef({ signature: "", at: 0 });

  const update = (target: string, patch: Partial<TutorSession>) => {
    const next = { ...sessionsRef.current, [target]: { ...(sessionsRef.current[target] ?? emptySession()), ...patch } };
    sessionsRef.current = next;
    setSessions(next);
    if (restored.current && patch.messages) {
      try { localStorage.setItem(TUTOR_HISTORY_KEY, serializeTutorHistory(next[target].messages)); } catch { /* Private mode/quota: keep the in-memory conversation. */ }
    }
  };

  useEffect(() => {
    mounted.current = true;
    if (!restored.current) {
      restored.current = true;
      let messages: ChatMessage[] = [];
      try { messages = restoreTutorHistory(localStorage.getItem(TUTOR_HISTORY_KEY)); } catch { /* Storage may be unavailable. */ }
      sequence.current = Math.max(0, ...messages.map(message => message.id));
      const next = { global: { ...emptySession(), messages } };
      sessionsRef.current = next;
      setSessions(next);
    }
    const activeControllers = controllers.current;
    return () => {
      mounted.current = false;
      activeControllers.forEach((controller) => controller.abort());
    };
  }, []);

  const performRequest = async (target: string, request: TutorRequest) => {
    const environment = current();
    if (!environment || inFlight.current.has(target)) return;
    const requestGeneration = generation.current;
    const source = environment && JSON.stringify(environment.context) === JSON.stringify(request.context) ? environment : undefined;
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
      if (!mounted.current || requestGeneration !== generation.current) return;
      if (!response.ok) {
        const notConfigured = typeof data === "object" && data !== null && "error" in data && data.error === "not_configured";
        update(target, { error: notConfigured ? "notConfigured" : response.status === 429 ? "rateLimited" : "error" });
      } else {
        const reply = parseTutorReply(data, request.context, request.intent);
        const previous = sessionsRef.current[target] ?? emptySession();
        let proposal: TutorProposal | undefined;
        const common = { contextSnapshot: JSON.stringify(request.context), status: "pending" as const };
        if (reply.proposal?.action === "set_gravity_parameters" && source?.gravity && request.context.kind === "gravity")
          proposal = { ...common, kind: "gravity", action: reply.proposal, source: source.gravity, baseline: { ...request.context.parameters } };
        if (reply.proposal?.action === "set_three_body_parameters" && source?.threeBody && request.context.kind === "three-body" && request.context.draftConfiguration)
          proposal = { ...common, kind: "three-body", action: reply.proposal, source: source.threeBody, baseline: request.context.draftConfiguration };
        const message: ChatMessage = {
          id: ++sequence.current, contextId: tutorContextId(request.context), role: "assistant",
          content: reply.proposalRejected ? t(request.context.kind === "three-body" ? "proposalRejectedThreeBody" : "proposalRejected") : reply.text,
          ...(proposal && { proposal }),
        };
        update(target, { messages: [...previous.messages, message].slice(-30) });
      }
    } catch {
      if (mounted.current && requestGeneration === generation.current) update(target, { error: "error" });
    } finally {
      window.clearTimeout(timeout);
      controllers.current.delete(controller);
      if (requestGeneration === generation.current) {
        inFlight.current.delete(target);
        if (mounted.current) update(target, { pending: false });
      }
    }
  };

  const ask = (key: TutorSessionId, mode: TutorRequest["mode"], question: string, intent?: TutorRequest["intent"]) => {
    const content = question.trim();
    if (!sessionKey || !content || content.length > TUTOR_MAX_MESSAGE_LENGTH || inFlight.current.has(key)) return;
    const page = current();
    if (!page) { update(key, { error: "contextUnavailable" }); return; }
    if (intent && intent !== "explain_context") {
      const stage = intent === "explain_formula" ? "gravity-understanding" : "gravity-laboratory";
      if (page.context.kind !== "gravity" || page.context.stage !== stage) return;
    }
    const signature = JSON.stringify([mode, content, page.context]);
    const now = Date.now();
    if (lastLaunch.current.signature === signature && now - lastLaunch.current.at < 750) return;
    lastLaunch.current = { signature, at: now };
    const previous = sessionsRef.current[key] ?? emptySession();
    const messages: ChatMessage[] = [...previous.messages, { id: ++sequence.current, contextId: tutorContextId(page.context), role: "user" as const, content }].slice(-30);
    update(key, { messages, draft: "" });
    void performRequest(key, { locale, mode, ...(intent && { intent }), context: page.context, messages: requestHistory(messages) });
  };

  const decideProposal = (key: TutorSessionId, messageId: number, decision: "apply" | "cancel") => {
    const previous = sessionsRef.current[key];
    const message = previous?.messages.find(message => message.id === messageId);
    if (!message?.proposal || message.proposal.status !== "pending") return false;
    const proposal = decideTutorProposal(message.proposal, decision, current());
    update(key, { messages: previous.messages.map(item => item.id === messageId ? { ...item, proposal } : item) });
    return proposal.status === "applied";
  };

  const clear = () => {
    generation.current++;
    controllers.current.forEach(controller => controller.abort());
    inFlight.current.clear();
    lastLaunch.current = { signature: "", at: 0 };
    update("global", emptySession());
    try { localStorage.removeItem(TUTOR_HISTORY_KEY); } catch { /* Storage may be unavailable. */ }
  };
  return { sessions, update, performRequest, ask, decideProposal, clear };
};

const ConversationContext = createContext<ReturnType<typeof useConversationStore> | null>(null);

/** One persistent conversation for the entire application. */
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
    clear: store.clear,
    performRequest: store.performRequest,
    ask: (mode: TutorRequest["mode"], question: string, intent?: TutorRequest["intent"]) => store.ask(key, mode, question, intent),
    decideProposal: (messageId: number, decision: "apply" | "cancel") => store.decideProposal(key, messageId, decision),
  };
};
