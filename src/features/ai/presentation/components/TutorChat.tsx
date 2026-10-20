"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useTranslations } from "next-intl";
import { ArrowUp, Sparkles } from "@/components/icons/TutorIcons";
import { TUTOR_MAX_MESSAGE_LENGTH } from "../../application/tutor";
import type { TutorRequest } from "../../types/tutor.types";
import { useTutorConversation } from "../hooks/useTutorConversation";
import { useTutorEnvironment } from "../providers/tutorEnvironment";
import { tutorContextLabel } from "./tutorContextLabel";
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

/** Single chat presentation; the global provider owns history and requests. */
export const TutorChat = ({ id, actions, active = true, inputRef, configure = false, onSubmit, onConfigure }: {
  id: string;
  actions?: readonly TutorQuickAction[];
  active?: boolean;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  configure?: boolean;
  onSubmit?: () => void;
  onConfigure?: () => void;
}) => {
  const t = useTranslations("Tutor");
  const { key, session, update, performRequest, ask, decideProposal } = useTutorConversation();
  const { context } = useTutorEnvironment();
  const transcriptRef = useRef<HTMLDivElement>(null);
  const hasMessages = session.messages.length > 0;
  useEffect(() => {
    const transcript = transcriptRef.current;
    if (transcript) transcript.scrollTop = transcript.scrollHeight;
  }, [session.messages.length, session.pending, active]);
  const latestContext = context;
  const contextChanged = !!session.snapshot && !!latestContext && session.snapshot !== JSON.stringify(latestContext);
  const quickActions: readonly TutorQuickAction[] = actions ?? [
    { id: "explain-experiment", label: t("explainExperiment"), question: t("experimentQuestion") },
    { id: "simplify", label: t("simplify"), question: t("simplify"), mode: "simplify" },
    { id: "example", label: t("example"), question: t("example"), mode: "example" },
  ];
  return (
    <div className={`${css.chat} flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden`} data-long-conversation={session.messages.length >= 8}>
      <div ref={transcriptRef} className={styles.transcript} data-tutor-scroll-region>
        <div className={hasMessages ? "shrink-0" : "flex flex-1 flex-col"}
          role="log" aria-label={t("conversation")} aria-live="polite" aria-relevant="additions" aria-atomic="false" aria-busy={session.pending}>
          {!hasMessages && <div className={styles.introduction} data-tutor-welcome>
            <Sparkles className="mb-3 size-6 text-cyan-200/80" />
            <h3 className="m-0 text-lg leading-snug font-semibold text-slate-100">{t("emptyTitle")}</h3>
            <p className="mt-2 max-w-64 text-sm leading-relaxed text-slate-400">{t("emptyDescription")}</p>
          </div>}
          {session.messages.map(message => (
            <div key={message.id} className={styles.message} data-role={message.role}>
              <span className="sr-only">{t(message.role === "user" ? "userLabel" : "assistantLabel")}: </span>
              <small className="mb-1.5 block text-[11px] leading-snug text-slate-400">{t("historicalMessage", { context: tutorContextLabel(message.contextId, t) })}</small>
              <p>{message.content}</p>
              {message.proposal && <TutorProposalCard proposal={message.proposal} onDecision={decision => decideProposal(message.id, decision)} />}
            </div>
          ))}
        </div>
        <div className="text-xs leading-relaxed text-cyan-200" aria-atomic="true" role="status">{session.pending ? t("thinking") : ""}</div>
        {session.error && <div className={styles.error}>
          <p role="alert">{t(session.error)}</p>
          {session.request && <button type="button" disabled={session.pending} onClick={() => {
            if (session.request) void performRequest(key, session.request);
          }}>{t("retry")}</button>}
        </div>}
        {contextChanged && <p data-tutor-context-changed className={styles.contextNote}>{t("contextChanged")}</p>}
        {configure && <p id={`${id}-configure-hint`} role="status" className="my-2 text-sm leading-relaxed text-cyan-100">{t("configureInvitation")}</p>}
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
      </div>
      <form className={styles.composer} onSubmit={event => { event.preventDefault(); onSubmit?.(); ask("explain", session.draft); }}>
        <label htmlFor={`${id}-question`} className="sr-only">{t("question")}</label>
        <textarea ref={inputRef} id={`${id}-question`} rows={1} aria-describedby={configure ? `${id}-configure-hint` : undefined}
          value={session.draft} maxLength={TUTOR_MAX_MESSAGE_LENGTH} placeholder={t("question")} disabled={session.pending}
          onChange={event => update(key, { draft: event.target.value })} />
        <button type="submit" aria-label={t("send")} title={t("send")} disabled={session.pending || !session.draft.trim()}><ArrowUp className="size-5" /></button>
      </form>
      <p className={styles.disclaimer}>{t("disclaimer")}</p>
    </div>
  );
};
