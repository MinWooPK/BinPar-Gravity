"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import { Sparkles } from "@/components/icons";

import { useTutorConversation } from "@/features/ai/presentation/hooks/useTutorConversation";
import { useTutorEnvironment } from "@/features/ai/presentation/providers/tutorEnvironment";

import type { TutorProposal } from "@/features/ai/types/proposal.types";
import type { TutorRequest } from "@/features/ai/types/tutor.types";

import { tutorContextLabel } from "../tutorContextLabel";
import { TutorProposalCard } from "./TutorProposalCard";

export type TutorQuickAction = {
  id: string;
  label: string;
  question: string;
  mode?: TutorRequest["mode"];
  intent?: TutorRequest["intent"];
  onSelect?: () => void;
  compose?: boolean;
};

type TutorChatTranscriptProps = {
  id: string;
  active: boolean;
  configure: boolean;
  actions?: readonly TutorQuickAction[];
  onConfigure?: () => void;
  onApplied?: (proposal: TutorProposal) => void;
};

// Muestra el historial, las respuestas y las acciones rápidas.
export const TutorChatTranscript = ({
  id,
  active,
  configure,
  actions,
  onConfigure,
  onApplied,
}: TutorChatTranscriptProps) => {
  const t = useTranslations("Tutor");

  const { key, session, performRequest, ask, decideProposal } =
    useTutorConversation();

  const { context } = useTutorEnvironment();
  const transcriptRef = useRef<HTMLDivElement>(null);

  const hasMessages = session.messages.length > 0;

  // Desplaza la conversación hasta los mensajes recientes.
  useEffect(() => {
    const transcript = transcriptRef.current;

    if (transcript) {
      transcript.scrollTop = transcript.scrollHeight;
    }
  }, [session.messages.length, session.pending, active]);

  const contextChanged =
    !!session.snapshot &&
    !!context &&
    session.snapshot !== JSON.stringify(context);

  // Preguntas predeterminadas cuando no se proporcionan otras.
  const quickActions: readonly TutorQuickAction[] = actions ?? [
    {
      id: "explain-experiment",
      label: t("explainExperiment"),
      question: t("experimentQuestion"),
    },
    {
      id: "simplify",
      label: t("simplify"),
      question: t("simplify"),
      mode: "simplify",
    },
    {
      id: "example",
      label: t("example"),
      question: t("example"),
      mode: "example",
    },
  ];

  return (
    <div
      ref={transcriptRef}
      className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-3 [scrollbar-width:thin] [scrollbar-color:#475569_transparent]"
      data-tutor-scroll-region
    >
      {/* Historial de mensajes. */}
      <div
        className={hasMessages ? "shrink-0" : "flex flex-1 flex-col"}
        role="log"
        aria-label={t("conversation")}
        aria-live="polite"
        aria-relevant="additions"
        aria-atomic="false"
        aria-busy={session.pending}
      >
        {!hasMessages && (
          <div className="lab-tutor-introduction flex min-h-28 flex-1 flex-col items-center justify-center py-5 text-center" data-tutor-welcome>
            <Sparkles className="mb-3 size-6 text-cyan-200/80" />

            <h3 className="m-0 text-lg leading-snug font-semibold text-slate-100">
              {t("emptyTitle")}
            </h3>

            <p className="mt-2 max-w-64 text-sm leading-relaxed text-slate-400">
              {t("emptyDescription")}
            </p>
          </div>
        )}

        {session.messages.map((message) => (
          <div
            key={message.id}
            className="mb-3 w-fit max-w-[94%] rounded-2xl border border-slate-500/25 bg-slate-800/45 px-3 py-2.5 text-sm leading-relaxed text-slate-200 data-[role=user]:ml-auto data-[role=user]:rounded-br-md data-[role=user]:border-[#67e8f930] data-[role=user]:bg-[#16405270] data-[role=user]:text-[#ecfeff] data-[role=assistant]:rounded-bl-md has-[[data-tutor-proposal]]:w-full has-[[data-tutor-proposal]]:max-w-full [&_p]:m-0 [&_p]:whitespace-pre-wrap [&_p]:[overflow-wrap:anywhere]"
            data-role={message.role}
          >
            <span className="sr-only">
              {t(message.role === "user" ? "userLabel" : "assistantLabel")}
              :{" "}
            </span>

            <small className="mb-1.5 block text-[11px] leading-snug text-slate-400">
              {t("historicalMessage", {
                context: tutorContextLabel(message.contextId, t),
              })}
            </small>

            <p>{message.content}</p>

            {message.proposal && (
              <TutorProposalCard
                proposal={message.proposal}
                onDecision={(decision) => {
                  if (
                    decideProposal(message.id, decision) &&
                    message.proposal
                  ) {
                    onApplied?.(message.proposal);
                  }
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Estado de la respuesta de la IA. */}
      <div
        className="text-xs leading-relaxed text-cyan-200"
        aria-atomic="true"
        role="status"
      >
        {session.pending ? t("thinking") : ""}
      </div>

      {/* Error y posibilidad de reintentar. */}
      {session.error && (
        <div className="my-2 rounded-xl border border-amber-300/20 bg-amber-950/20 p-2.5 text-sm text-amber-100">
          <p role="alert" className="m-0 mb-2">{t(session.error)}</p>

          {session.request && (
            <button
              className="min-h-9 cursor-pointer rounded-[0.625rem] border border-[#67e8f940] px-2.5 py-1.5 text-[#cffafe]"
              type="button"
              disabled={session.pending}
              onClick={() => {
                if (session.request) {
                  void performRequest(key, session.request);
                }
              }}
            >
              {t("retry")}
            </button>
          )}
        </div>
      )}

      {contextChanged && (
        <p data-tutor-context-changed className="my-2 text-xs leading-relaxed text-slate-400">
          {t("contextChanged")}
        </p>
      )}

      {configure && (
        <p
          id={`${id}-configure-hint`}
          role="status"
          className="my-2 text-sm leading-relaxed text-cyan-100"
        >
          {t("configureInvitation")}
        </p>
      )}

      {/* Preguntas rápidas de la etapa actual. */}
      <div
        className="flex shrink-0 flex-wrap gap-1.5 pt-2"
        aria-label={t("quickActions")}
        role="group"
      >
        {quickActions.map((action) => (
          <button
            className="min-h-8 max-w-full cursor-pointer rounded-[999px] border border-[#94a3b830] bg-[#64748b0a] px-2.5 py-1 text-left text-xs leading-[1.4] text-[#cbd5e1] [overflow-wrap:anywhere] [transition:background-color_180ms,border-color_180ms,color_180ms] [&:hover:not(:disabled)]:border-[#67e8f960] [&:hover:not(:disabled)]:bg-[#67e8f910] [&:hover:not(:disabled)]:text-[#ecfeff] [.lab-tutor-chat[data-long-conversation=true]_&]:border-[#94a3b820] [.lab-tutor-chat[data-long-conversation=true]_&]:bg-transparent [.lab-tutor-chat[data-long-conversation=true]_&]:text-[#94a3b8] [.lab-tutor-chat[data-long-conversation=true]_&:hover:not(:disabled)]:border-[#67e8f960] [.lab-tutor-chat[data-long-conversation=true]_&:hover:not(:disabled)]:bg-transparent [.lab-tutor-chat[data-long-conversation=true]_&:hover:not(:disabled)]:text-[#ecfeff] motion-reduce:[transition:none]"
            key={action.id}
            type="button"
            disabled={session.pending}
            data-tutor-action={action.id}
            data-explain-experiment={
              action.id === "explain-experiment" || undefined
            }
            onClick={() => {
              action.onSelect?.();

              if (action.compose) {
                onConfigure?.();
              } else {
                ask(action.mode ?? "explain", action.question, action.intent);
              }
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};
