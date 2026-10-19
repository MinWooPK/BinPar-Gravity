"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { TutorSessionId } from "../../application/tutorAvailability";
import type { TutorContext } from "../../types/tutor.types";
import { useTutorConversation } from "../hooks/useTutorConversation";
import { useTutorEnvironment } from "../providers/tutorEnvironment";
import { TutorChat, type TutorQuickAction } from "./TutorChat";

export type InlineTutorPresentation = {
  active?: boolean;
  onActivate?: () => void;
  embedded?: boolean;
};

/** An embedded view of the same session store used by GlobalTutor. */
export const InlineTutor = ({ sessionId, actions, title, context, contextChangedMessage, active = true, onActivate, embedded = false }: InlineTutorPresentation & {
  sessionId: TutorSessionId;
  actions: readonly TutorQuickAction[];
  title?: string;
  context?: TutorContext;
  contextChangedMessage?: string;
}) => {
  const t = useTranslations("Tutor");
  const id = `inline-tutor-${sessionId}`;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [focusRequest, requestFocus] = useState(0);
  const focusedRequest = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);
  const [configure, setConfigure] = useState(false);
  const { activeSessionId, registerLauncher } = useTutorEnvironment();
  const { ask } = useTutorConversation(sessionId);
  const startConfiguration = () => {
    setConfigure(true);
    inputRef.current?.focus({ preventScroll: true });
  };
  useLayoutEffect(() => {
    if (!active || focusedRequest.current === focusRequest) return;
    focusedRequest.current = focusRequest;
    const target = inputRef.current?.disabled ? sectionRef.current : inputRef.current;
    target?.focus({ preventScroll: true });
  }, [active, focusRequest]);
  useLayoutEffect(() => {
    if (activeSessionId !== sessionId) return;
    return registerLauncher(intent => {
      onActivate?.();
      // Commit visibility in both the tab and its mobile parent before focusing.
      // A counter also covers reopening an already-selected but hidden Tutor tab.
      requestFocus(request => request + 1);
      if (intent === "configure_experiment") {
        if (actions.some(action => action.compose)) startConfiguration();
        return;
      }
      const action = actions.find(action => action.intent === intent);
      if (action && intent) {
        action.onSelect?.();
        ask(action.mode ?? "explain", action.question, action.intent);
      }
    });
  }, [activeSessionId, sessionId, registerLauncher, actions, ask, onActivate]);
  return (
    <section ref={sectionRef} tabIndex={-1} id={id} aria-labelledby={`${id}-title`} data-inline-tutor={sessionId}
      className={embedded
        ? "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-violet-300"
        : "mt-3 flex min-w-0 flex-col overflow-hidden rounded-xl border border-violet-300/25 bg-slate-950/50"}>
      <header className="border-b border-slate-700 px-4 py-3">
        <h3 id={`${id}-title`} className="m-0 text-base font-semibold text-cyan-100">{title ?? t("shortLabel")}</h3>
      </header>
      <TutorChat id={id} sessionId={sessionId} actions={actions} inline inputRef={inputRef}
        active={active && activeSessionId === sessionId} configure={configure} onConfigure={startConfiguration}
        onSubmit={() => setConfigure(false)} context={context} contextChangedMessage={contextChangedMessage} />
    </section>
  );
};
