"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useTranslations } from "next-intl";
import { TUTOR_MAX_MESSAGE_LENGTH } from "../../application/tutor";
import type { TutorSessionId } from "../../application/tutorAvailability";
import type { TutorContext, TutorRequest } from "../../types/tutor.types";
import { useTutorConversation } from "../hooks/useTutorConversation";
import { TutorProposalCard } from "./TutorProposalCard";
import { tutorChatStyles as styles } from "./TutorChat.styles";
import css from "./TutorChat.module.css";

export type TutorQuickAction = {
  id: string;
  label: string;
  question: string;
  mode?: TutorRequest["mode"];
  intent?: TutorRequest["intent"];
  onSelect?: () => void;
  compose?: boolean;
};

/** Presentation shared by the modal and inline tutors; the provider owns all state. */
export const TutorChat = ({ id, sessionId, actions, inline = false, active = true, inputRef, configure = false, onSubmit, onConfigure, context, contextChangedMessage }: {
  id: string;
  sessionId?: TutorSessionId;
  actions?: readonly TutorQuickAction[];
  inline?: boolean;
  active?: boolean;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  configure?: boolean;
  onSubmit?: () => void;
  onConfigure?: () => void;
  context?: TutorContext;
  contextChangedMessage?: string;
}) => {
  const t = useTranslations("Tutor");
  const { current, key, session, update, performRequest, ask, decideProposal } = useTutorConversation(sessionId);
  const transcriptRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const transcript = transcriptRef.current;
    if (transcript) transcript.scrollTop = transcript.scrollHeight;
  }, [session.messages.length, session.pending, active]);
  const page = current();
  const latestContext = context ?? page?.context;
  const contextChanged = !!session.snapshot && !!latestContext && session.snapshot !== JSON.stringify(latestContext);
  const quickActions: readonly TutorQuickAction[] = actions ?? [
    { id: "explain-experiment", label: t("explainExperiment"), question: t("experimentQuestion") },
    { id: "simplify", label: t("simplify"), question: t("simplify"), mode: "simplify" },
    { id: "example", label: t("example"), question: t("example"), mode: "example" },
  ];
  return (
    <div className={`${css.chat} flex min-h-0 min-w-0 flex-1 flex-col`}>
      <div ref={transcriptRef} className={`${styles.transcript} ${inline ? "max-h-80 min-h-24 lg:max-h-96" : ""}`}
        role="log" aria-label={t("conversation")} aria-live="polite" aria-relevant="additions" aria-atomic="false" aria-busy={session.pending}>
        {session.messages.length === 0 && <p className={styles.introduction}>{t("description")}</p>}
        {session.messages.map(message => (
          <div key={message.id} className={styles.message} data-role={message.role}>
            <span className="sr-only">{t(message.role === "user" ? "userLabel" : "assistantLabel")}: </span>
            <p>{message.content}</p>
            {message.proposal && <TutorProposalCard proposal={message.proposal} onDecision={decision => decideProposal(message.id, decision)} />}
          </div>
        ))}
      </div>
      <div className="shrink-0 px-4" aria-atomic="true" role="status">{session.pending ? t("thinking") : ""}</div>
      {session.error && <div className={`${styles.error} px-4`}>
        <p role="alert">{t(session.error)}</p>
        {session.request && <button type="button" disabled={session.pending} onClick={() => {
          const page = current();
          if (session.request && page) void performRequest(key, { ...session.request, context: page.context });
        }}>{t("retry")}</button>}
      </div>}
      {contextChanged && <p data-tutor-context-changed className={`${styles.contextNote} px-4`}>{contextChangedMessage ?? t("contextChanged")}</p>}
      <div className={styles.quickActions} aria-label={t("quickActions")} role="group">
        {quickActions.map(action => <button key={action.id} type="button" disabled={session.pending}
          data-tutor-action={action.id} data-explain-experiment={action.id === "explain-experiment" || undefined}
          onClick={() => {
            action.onSelect?.();
            if (action.compose) onConfigure?.();
            else ask(action.mode ?? "explain", action.question, action.intent);
          }}>
          {action.label}
        </button>)}
      </div>
      {configure && <p id={`${id}-configure-hint`} role="status" className="mx-4 my-2 text-sm leading-relaxed text-cyan-100">{t("configureInvitation")}</p>}
      <form className={styles.composer} onSubmit={event => { event.preventDefault(); onSubmit?.(); ask("explain", session.draft); }}>
        <label htmlFor={`${id}-question`} className="sr-only">{t("question")}</label>
        <textarea ref={inputRef} id={`${id}-question`} rows={2} aria-describedby={configure ? `${id}-configure-hint` : undefined}
          value={session.draft} maxLength={TUTOR_MAX_MESSAGE_LENGTH} placeholder={t("question")} disabled={session.pending}
          onChange={event => update(key, { draft: event.target.value })} />
        <button type="submit" disabled={session.pending || !session.draft.trim()}>{t("send")}</button>
      </form>
      <p className={styles.disclaimer}>{t("disclaimer")}</p>
    </div>
  );
};
