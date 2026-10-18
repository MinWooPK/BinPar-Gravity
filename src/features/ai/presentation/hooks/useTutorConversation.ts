"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { TUTOR_MAX_MESSAGE_LENGTH, TUTOR_TIMEOUT_MS } from "../../application/tutor";
import { requestHistory } from "../../application/conversation";
import type { TutorRequest } from "../../types/tutor.types";
import type { ChatMessage, TutorSession } from "../../types/conversation.types";
import { useTutorEnvironment } from "../providers/tutorEnvironment";

const emptySession = (): TutorSession => ({ messages: [], draft: "", pending: false, error: "" });

export const useTutorConversation = () => {
  const locale = useLocale() as TutorRequest["locale"];
  const { sessionKey, current } = useTutorEnvironment();
  const [sessions, setSessions] = useState<Record<string, TutorSession>>({});
  const sessionsRef = useRef(sessions);
  const inFlight = useRef(new Set<string>());
  const controllers = useRef(new Set<AbortController>());
  const sequence = useRef(0);
  const mounted = useRef(true);
  const key = sessionKey ?? "";
  const session = sessions[key] ?? emptySession();

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
    if (inFlight.current.has(target)) return;
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
      const data: { text?: unknown; error?: unknown } = await response.json();
      if (!mounted.current) return;
      if (!response.ok) {
        update(target, { error: data.error === "not_configured" ? "notConfigured" : response.status === 429 ? "rateLimited" : "error" });
      } else if (typeof data.text !== "string" || !data.text.trim()) {
        update(target, { error: "error" });
      } else {
        const previous = sessionsRef.current[target] ?? emptySession();
        update(target, { messages: [...previous.messages, { id: ++sequence.current, role: "assistant" as const, content: data.text.trim() }].slice(-48) });
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

  const ask = (mode: TutorRequest["mode"], question: string) => {
    const content = question.trim();
    if (!sessionKey || !content || content.length > TUTOR_MAX_MESSAGE_LENGTH || inFlight.current.has(key)) return;
    const page = current();
    if (!page) { update(key, { error: "contextUnavailable" }); return; }
    const previous = sessionsRef.current[key] ?? emptySession();
    const messages: ChatMessage[] = [...previous.messages, { id: ++sequence.current, role: "user" as const, content }].slice(-48);
    update(key, { messages, draft: "" });
    void performRequest(key, { locale, mode, context: page.context, messages: requestHistory(messages) });
  };

  return { sessionKey, current, key, session, update, performRequest, ask };
};
